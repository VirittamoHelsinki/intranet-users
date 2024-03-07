import User from "../models/user.model.js";
import Service from "../models/service.model.js";
import bcrypt from "bcrypt";
import Reset from "../models/reset.model.js";
import { sendEmail } from "../utils/mailer.js";

function virittamoEmail(email) {
  const regex = /@(edu\.)?hel\.fi$/;
  return regex.test(email);
};

// Validate password, to contain at least one number, one lowercase letter,
// one uppercase letter and to be at least 10 characters long.
function validatePassword(password) {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const isAtLeast10Chars = password.length >= 10;

  return hasUpperCase && hasLowerCase && hasNumbers && isAtLeast10Chars;
};

async function addAccessLevel(user, level) {
  try {
    const services = await Service.find({});

    user.access = services.map((service) => ({
      service: service._id,
      level,
      name: service.name,
    }));
  } catch (exception) {
    next(exception);
  }
};

// Register a new user.
async function createUser(req, res) {
  try {
    let { email, password, firstname, lastname } = req.body;

    if (!email) return res.status(400).json({ error: "email is missing" });
    if (!password)
      return res.status(400).json({ error: "password is missing" });

    email = email.toLowerCase();

    // When in production mode, check if the email is valid for virittamo.
    // if (environment === 'production' && !virittamoEmail(email)) {
    //   return res.status(400).json({
    //     error: 'email must end with @edu.hel.fi or @hel.fi'
    //   })
    // }

    // if(!validatePassword(password)) {
    //   return res.status(400).json({
    //     error: 'password must be at least 10 characters long and contain at least one number, one lowercase letter and one uppercase letter.'
    //   })
    // }

    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = new User({
      email,
      passwordHash,
      firstname,
      lastname,
      access: [],
    });

    // Add access level 1 by default to all services.
    await addAccessLevel(user, 1);

    const savedUser = await user.save();

    res.json(User.format(savedUser));
  } catch (exception) {
    console.log(exception.message);
    if (exception.message.includes("User validation failed")) {
      res.status(400).json({ error: "user validation failed" });
    } else {
      res.status(500).json({ error: "something went wrong..." });
    }
  }
}

// Update routes will be created here.

// A Client with a valid token can get their user data.
async function getUser(_req, res, next) {
  try {
    let { _id } = res.locals.user;

    // Fetch user to make sure that the user received is up to date.
    const user = await User.findById(_id);

    if (!user)
      return res.status(401).json({
        error: `Cannot find user with id: ${_id}`,
      });

    res.json(User.format(user));
  } catch (exception) {
    next(exception);
  }
}

// Get all users.
async function getAllUsers(_req, res, next) {
  try {
    const users = await User.find({});

    res.json(users.map(User.format));
  } catch (exception) {
    next(exception);
  }
}

// Delete a user.
async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user)
      return res.status(401).json({
        error: `Cannot find user with id: ${id}`,
      });

    await User.findByIdAndRemove(id);

    res.status(204).end();
  } catch (exception) {
    next(exception);
  }
}

// An admin user can update any users admin and access rights.
async function updateUser(req, res, next) {
  try {
    const id = req.params.id;
    let { admin, access, firstname, lastname } = req.body;

    if (!admin && !access && !firstname && !lastname) {
      return res.status(400).json({ error: "No valid fields to update." });
    }

    // If an access level is marked 0, remove it from the list.
    if (access) access = access.filter((a) => a.level != 0);

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { admin, access, firstname, lastname },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(400).json({ error: "User does not exist." });
    }

    res.json(User.format(updatedUser));
  } catch (exception) {
    next(exception);
  }
}

// Add a html body to the email.
const htmlForm = (text) => {
  return `<body>
            <div align="center">
              ${text}
            </div>
          </body>`;
};

// Get reset form with id.
async function getRestId(req, res, next) {
  try {
    const { id } = req.params;

    const reset = await Reset.findById(id);

    if (!reset) {
      return res.status(404).send(htmlForm("<h2>The link has expired</h2>"));
    }

    res.send(
      htmlForm(`<h1>Changing your password</h1>
            <form action="/api/reset/${id}" method="post">
              New password:
              <br>
              <input type="text" name="password">
              <button type="submit">Update</button>
            </form>`)
    );
  } catch (exception) {
    next(exception);
  }
}

// Update password with id if the reset has not expired.
async function updatePassword(req, res, next) {
  try {
    const { id } = req.params;
    const { password } = req.body;

    const reset = await Reset.findById(id);

    if (!reset) {
      return res.status(404).send(htmlForm("<h2>The link has expired<h2>"));
    }
    console.log(password);
    console.log(reset.email);

    const user = await User.findOne({ email: reset.email });
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    await User.findByIdAndUpdate(
      user._id,
      { password: passwordHash },
      { new: true }
    );

    await Reset.findByIdAndDelete(reset._id);

    return res
      .status(200)
      .send(htmlForm("<h2>Your password has been updated<h2>"));
  } catch (exception) {
    next(exception);
  }
}

// Create and send a reset link to the users email.
async function sendResetLink(req, res, next) {
  try {
    const body = req.body;

    if (!body.email) {
      return res.status(400).json({ error: "No email was provided." });
    }
    body.email = body.email.toLowerCase();

    let user = null;

    user = await User.findOne({ email: body.email });

    if (!user) {
      return res.status(400).json({ error: "There is no account with that email." });
    }

    // Create a reset entry.
    const reset = new Reset({
      email: user.email,
    });

    await reset.save();
    const url = `${config.url}/api/reset/${createdReset._id}`;

    await sendEmail({
      to: user.email,
      from: config.email,
      subject: "Password reset request",
      html: `
        <h1> Hello ${user.email}!</h1>
        <p>You can change your password using the link below</p>
        <p>The link is valid for 10 minutes</p>
        <a href="${url}">${url}</a>
      `,
    });

    log.debug(`Password reset email sent to ${body.email}`)

    return res.status(200).json({ success: "Reset created and email sent." });
  } catch (exception) {
    console.log(exception);

    try {
      if (exception.name.includes("User validation failed")) {
        return res.status(400).json({ error: "email not found" });
      } else {
        next(exception);
      }
    } catch (e) {
      next(e);
    }
  }
}

export { createUser, getUser, getAllUsers, deleteUser, updateUser, sendResetLink, getRestId, updatePassword };
