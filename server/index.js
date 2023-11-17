import path from "path";
import url from "url"
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import {
  requestLogger,
  unknownEndpoint,
  errorHandler,
} from "./middleware/middleware.js";

// Sets up database connection management logic and starts the connection.
import connectMongoose from "./utils/connectMongoose.js";
import { port } from "./utils/config.js";

import { userRouter } from "./controllers/userRouter.js";
import { authorizeRouter } from "./controllers/authorizeRouter.js";
import { authenticateRouter } from "./controllers/authenticateRouter.js";
import { pwResetRouter } from "./controllers/passwordResetRouter.js";
import { serviceRouter } from "./controllers/serviceRouter.js";

const app = express();

// Connect to database.
connectMongoose();

// Middleware that needs to be added before routes are defined.
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("build"));
app.use(requestLogger);

// Api information message. We could add some instructions here.
app.get("/api", (_req, res) => {
  res.send("<h1>Backend API starts here</h1> ");
});

// Add routers.
app.use("/api/users", userRouter);
app.use("/api/services", serviceRouter);
app.use("/api/authorize", authorizeRouter);
app.use("/api/authenticate", authenticateRouter);
app.use("/api/reset", pwResetRouter);

// Middleware that needs to be added after the routes are defined.
app.use("/api/*", unknownEndpoint);
app.use(errorHandler);

// Directs requests that dont match any of the routes previously
// defined to the frontend.
app.get("*", (_req, res) => {
  const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
  res.sendFile(path.join(__dirname, "/build/index.html"));
});

// Close database connection when the app closes.
app.on("close", () => {
  mongoose.connection.close();
});

// Start server on the configured port.
app.listen(port, () => {
  console.log("users-server running on port:", port);
});

export default app;
