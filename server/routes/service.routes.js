import express from 'express';
import { requireAuthorization, userIsAdmin } from '../middleware/authorize.js';
import { createservice, deleteService, getAllPublicServices, getAllServices, updateService } from '../controllers/service.controller.js';

const service = express.Router();

service.all("*", requireAuthorization);
service.all("*", userIsAdmin);
service.get("/public", getAllPublicServices);
service.get("/", getAllServices);
service.post("/", createservice);
service.delete("/:id", deleteService);
service.put("/:id", updateService);

export { service };
