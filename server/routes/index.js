import express from "express";
import { user } from "./user.routes.js";
import { auth } from "./auth.routes.js";
import { service } from "./service.routes.js";

const router = express.Router();

router.get("/healthcheck", (_, res) => res.sendStatus(200));

router.use(user);
router.use(auth);
router.use(service);

export { router };
