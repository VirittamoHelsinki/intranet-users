import mongoose from "mongoose";

import { mongoUrl } from "./config.js";
import { log } from "./logger.js";

export async function connectDb() {
  try {
    await mongoose.connect(mongoUrl);
    log.info(`Connected to DB, ${mongoUrl}`);
  } catch (e) {
    process.exit(1);
  }
}
