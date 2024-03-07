// This router handles all requests that contain user authentication.
// (Requests that require email/username and password.)
// 1. This router functions as an authorization endpoint. Where other services
// can check whether or not users have authorization to use the service.
// and if their access level is high enough.
// 2. Also has paths that authorize a user to get a valid token for another
// service.
import bcrypt from "bcrypt";
import axios from "axios";
import User from "../models/user.model.js";
import Service from "../models/service.model.js";
import {
  addTokenToBlacklist,
  getTokenFrom,
} from "../middleware/authorize.js";

// Authenticate user without forwarding them to any service.
async function authenticateUser(req, res) {
  let { email, password } = req.body;

  if (!email) return res.status(400).json({ error: "email is missing" });
  if (!password) return res.status(400).json({ error: "password is missing" });

  email = email.toLowerCase();

  const user = await User.findOne({ email });

  if (!user) {
    // If there does not exist a user with the given email.
    return res.status(401).json({ error: "invalid email or password" });
  }

  // Compare the body password to the saved password hash of the user.
  const passwordCorrect = await bcrypt.compare(password, user.passwordHash);

  if (!passwordCorrect) {
    // If the password is incorrect.
    return res.status(401).json({ error: "invalid email or password" });
  }

  // Sign a token.
  const token = user.generateJWT();

  // Return the user and the token.
  res.status(200).send({ token, ...User.format(user) });
}

// Authenticate user and authorize them to use a specific service.
// Returns a key that a client can use to get a token from
// the service defined in the domain parameter.
async function autherizeUser(req, res, next) {
  try {
    let { email, password } = req.body;
    const domain = req.params.domain.toLowerCase();

    const service = await Service.findOne({ domain });

    if (!service) {
      return res.status(401).json({ error: "unauthorized domain" });
    }

    if (!email) return res.status(400).json({ error: "email is missing" });
    if (!password)
      return res.status(400).json({ error: "password is missing" });

    email = email.toLowerCase();

    const user = await User.findOne({ email });

    // If there does not exist an account with this email:
    if (!user)
      return res.status(401).json({ error: "invalid email or password" });

    const passwordCorrect = await bcrypt.compare(password, user.passwordHash);

    // If the password is incorrect:
    if (!passwordCorrect) {
      return res.status(401).json({ error: "invalid email or password" });
    }

    // Sign a token.
    const token = user.generateJWT();

    // Confirm to the service that the user has been authenticated.
    const response = await axios.post(
      `${service.protocol}://${domain}/api/authorize`,

      // Send the authentication password, so that
      // the service knows its the user service that is sending the request.
      { email, token, service_key: service.serviceKey }
    );

    // Get a one time use user_key that allows the redirected user to get,
    // their token from the service.
    const { user_key } = response.data;

    // token is used by the user service and the user_key is used by the
    // service on the domain.
    res.status(200).send({ token, user_key, ...User.format(user) });

    // Authorization is for the outside domain, token is for the user service.

    // After receiving this response on the frontend, redirect the
    // user to the domain's homepage, with the Authorization header
  } catch (exception) {
    next(exception);
  }
}

// Route that authorizes the user to use a specific service,
// that does authorization by itself. Called when the user
// redirected to the login page from another service
// already has a valid token on the users service.
// Returns a key that a client can use to get a token from
// the service defined in the domain parameter.
async function authorizeService(req, res, next) {
  try {
    const user = res.locals.user;
    const domain = req.params.domain.toLowerCase();
    const token = getTokenFrom(req);

    const service = await Service.findOne({ domain });

    if (!service) {
      return res.status(401).json({ error: "unauthorized domain" });
    }

    // Confirm to the service that the user has been authenticated.
    const response = await axios.post(
      `${service.protocol}://${domain}/api/authorize`,

      // Send the authentication password, so that
      // the service knows its the user service that is sending the request.
      {
        email: user.email,
        token,
        service_key: service.serviceKey,
      }
    );

    // Get a one time use user_key that allows the redirected user to get,
    // their token from the service.
    const { user_key } = response.data;

    // token is used by the user service and the user_key is used by the
    // service on the domain.
    res.status(200).send({ user_key, ...User.format(user) });

    // Authorization is for the outside domain, token is for the user service.

    // After receiving this response on the frontend, redirect the
    // user to the domain's homepage, with the Authorization header
  } catch (exception) {
    next(exception);
  }
}

// Returns user information, for a client with a valid token.
// The simplest way to check that the user has a valid token.
async function userInformation(_req, res, next) {
  try {
    const user = res.locals.user;

    res.json(User.format(user));
  } catch (exception) {
    next(exception);
  }
}

// Cheks whether the user has a high enough authorization level requested by
// the service.
async function checkAuthorizationLevel(req, res, next) {
  try {
    const user = res.locals.user;
    let { name, level } = req.params;
    level = parseInt(level);

    let access = user.access.find((a) => a.name === name);

    if (!access) {
      // In case the service name is not defined in the token.
      // This can probably be removed eventually.
      const service = await Service.findOne({ name });

      if (!service) {
        return res.status(401).json({ error: "The service does not exist." });
      }

      // Find and access entry for the service from the list if it exists.
      access = user.access.find((a) => service._id.equals(a.service));
    }

    if (!access) {
      return res.status(401).json({
        error: "The user has no access level on this service.",
      });
    }

    if (access.level < level) {
      return res.status(401).json({
        error:
          "The user does not have a high enough access level on this service.",
      });
    }

    res.json(User.format(user));
  } catch (exception) {
    next(exception);
  }
}

// User can blacklist their token by logging out so that it
// will no longer function for user authorization.
async function logout(req, res, next) {
  try {
    // Add the token to the blacklist.
    addTokenToBlacklist(req, res, next);

    res.status(200).end();
  } catch (exception) {
    next(exception);
  }
}

export { authenticateUser, autherizeUser, authorizeService, userInformation, checkAuthorizationLevel, logout };
