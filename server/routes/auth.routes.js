import express from 'express';
import { requireAuthorization } from '../middleware/authorize.js';
import { authenticateUser, autherizeUser } from '../controllers/authenticate.controller.js';
import { authorizeService, checkAuthorizationLevel, logout, userInformation } from '../controllers/authorizeRouter.js';

const auth = express.Router();

// Authenticate user
// Authenticate user without forwarding them to any service.
auth.post("/", authenticateUser);
// Authenticate user and authorize them to use a specific service.
auth.post("/:domain", autherizeUser);
// Autherize user
// From here on require valid authorization(token) on all routes.
auth.all("*", requireAuthorization);
// Returns user information for a client with a valid token
auth.get("/", userInformation);
// Route that authorizes the user to use a specific service
auth.get("/app/:domain", authorizeService);
// Check whether the user is authorized to use a specific service
auth.get("/service/:name/:level", checkAuthorizationLevel);
// User can logout
auth.get("/logout", logout);

export { auth };
