import mongoose from "mongoose";

import { env } from "./env";
import { logger } from "./logger";

let isConnected = false;

export async function connectDatabase(): Promise<void> {
  if (isConnected) {
    return;
  }
  try {
    await mongoose.connect(env.MONGODB_URI);
    isConnected = true;
    logger.info("MongoDB connection established");
  } catch (error) {
    logger.error({ error }, "Failed to connect to MongoDB");
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  if (!isConnected) {
    return;
  }
  
    await mongoose.disconnect();
    isConnected = false;
    logger.info("MongoDB connection closed");
  }
