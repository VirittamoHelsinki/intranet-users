import mongoose from "mongoose";

import { mongoUrl } from "./config.js";
import log from "./logger.js";

async function connectMongoose() {
  try {
    // Keep trying to connect as long as the app is disconnected from mongoDB
    await mongoose.connect(mongoUrl)
    log.info(`Connected to DB, ${mongoUrl}`);
  } catch (e) {
    console.log("connecting to MongoDB failed", err)
    process.exit(1);
  }
};

mongoose.set("strictQuery", true);

export default connectMongoose;
