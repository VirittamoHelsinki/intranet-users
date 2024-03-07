import path from "node:path";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import {
  errorHandler,
  requestLogger,
  unknownEndpoint,
} from "./middleware/middleware.js";

// Sets up database connection management logic and starts the connection.
import { connectDb } from "./utils/connectDb.js";
import { port, environment } from "./utils/config.js";

import { log } from "./utils/logger.js";
import { user } from "./routes/user.routes.js";
import { auth } from "./routes/auth.routes.js";
import { service } from "./routes/service.routes.js";

const app = express();

console.log("build path", path.join(import.meta.dirname, "./build"));
// Middleware that needs to be added before routes are defined.
if (environment === "development") app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(import.meta.dirname, "./build")));
app.use(requestLogger);

app.get("/healthcheck", (_, res) => res.sendStatus(200));

// Api information message. We could add some instructions here.
app.get("/api", (_req, res) => {
  res.send("<h1>Backend API starts here</h1> ");
});

app.use(user);
app.use(auth);
app.use(service);

// Middleware that needs to be added after the routes are defined.
app.use("/api/*", unknownEndpoint);
app.use(errorHandler);

// Directs requests that dont match any of the routes previously
// defined to the frontend.
app.get("*", (_req, res) => {
  res.sendFile(path.join(import.meta.dirname, "./build/index.html"));
});

// Close database connection when the app closes.
app.on("close", () => {
  mongoose.connection.close();
});

// Start server on the configured port.
app.listen(port, async () => {
  log.info(`users-server running on port: ${port}`);
  // await connectDb();
});

export default app;
