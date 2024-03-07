import express from 'express';
import { requireAuthorization, userIsAdmin } from '../middleware/authorize.js';
import { createService, deleteService, getAllPublicServices, getAllServices, updateService } from '../controllers/service.controller.js';

const service = express.Router();

service.all("/api/services/*", requireAuthorization);
service.all("/api/services/*", userIsAdmin);
service.get("/api/services/public", getAllPublicServices);
service.get("/api/services", getAllServices);
service.post("/api/services", createService);
service.delete("/api/services/:id", deleteService);
service.put("/api/services/:id", updateService);

export { service };
