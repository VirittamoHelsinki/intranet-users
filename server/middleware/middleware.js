import { log } from "../utils/logger.js";

function requestLogger(req, _res, next) {
  log.info(`Method: ${req.method}`);
  log.info(`Path: ${req.path}`);
  log.info(`Body: { emaill: ${req.body.email} password: ${req.body.password} }`);
  log.info("---");
  next();
};

function unknownEndpoint(_req, res) {
  res.status(404).send({ error: "unknown endpoint" });
};

function errorHandler(error, _req, res, next) {
  log.error(error.message);

  if (error.name === "CastError") {
    return res.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return res.status(400).json({ error: error.message });
  }

  next(error);
};

export { requestLogger, unknownEndpoint, errorHandler };
