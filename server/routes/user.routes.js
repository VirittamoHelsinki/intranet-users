import express from 'express';
import { requireAuthorization, userIsAdmin } from '../middleware/authorize.js';
import { createUser, deleteUser, getAllUsers, getUser, updateUser } from '../controllers/user.controller.js';

const user = express.Router();

user.all("/api/users/*", requireAuthorization);
user.all("/api/users/*", userIsAdmin);
user.get("/api/users", getUser);
user.post("/api/users", createUser);
user.get("/api/users/all", getAllUsers);
user.delete("/api/users/:id", deleteUser);
user.put("/api/users/:id", updateUser);

export { user };

