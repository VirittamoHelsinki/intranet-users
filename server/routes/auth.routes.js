import express from 'express';
import { requireAuthorization } from '../middleware/authorize.js';
import { authenticateUser, autherizeUser, authorizeService, checkAuthorizationLevel, logout, userInformation } from '../controllers/auth.controller.js';

const auth = express.Router();

// Authenticate user
// Authenticate user without forwarding them to any service.
auth.post("/api/authenticate", authenticateUser);
// Authenticate user and authorize them to use a specific service.
auth.post("/api/authenticate/:domain", autherizeUser);
// Autherize user
// From here on require valid authorization(token) on all routes.
auth.all("/api/authorize/*", requireAuthorization);
// Returns user information for a client with a valid token
auth.get("/api/authorize", userInformation);
// Route that authorizes the user to use a specific service
auth.get("/api/authorize/app/:domain", authorizeService);
// Check whether the user is authorized to use a specific service
auth.get("/api/authorize/service/:name/:level", checkAuthorizationLevel);
// User can logout
auth.get("/api/authorize/logout", logout);

export { auth };
