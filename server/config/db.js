import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

/**
 * Global cache for MongoDB connection across serverless function invocations (Vercel)
 */
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    if (!process.env.MONGO_URI) {
      logger.warn('MONGO_URI environment variable is missing.');
    }
    
    cached.promise = mongoose
      .connect(process.env.MONGO_URI, {
        bufferCommands: false,
      })
      .then((mongooseInstance) => {
        logger.info(`MongoDB connected successfully to host: ${mongooseInstance.connection.host}`, {
          host: mongooseInstance.connection.host,
          database: mongooseInstance.connection.name,
        });
        console.log(`✅ MongoDB connected: ${mongooseInstance.connection.host}`);
        return mongooseInstance;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    logger.error(`MongoDB connection error: ${error.message}`, {
      error: error.message,
      stack: error.stack,
    });
    console.error(`❌ MongoDB connection error: ${error.message}`);
    // Do not call process.exit(1) in serverless environments as it kills the serverless container
    if (!process.env.VERCEL) {
      process.exit(1);
    }
    throw error;
  }

  return cached.conn;
};

export default connectDB;
