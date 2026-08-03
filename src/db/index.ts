import mongoose from 'mongoose';

export interface Env {
  MONGO_URI: string;
  JWT_SECRET?: string;
  CLOUDINARY_CLOUD_NAME?: string;
  CLOUDINARY_API_KEY?: string;
  CLOUDINARY_API_SECRET?: string;
  [key: string]: unknown;
}

/**
 * Create a Mongoose database connection
 * @param env - Environment variables including MONGO_URI
 * @returns Mongoose instance
 */
export const createDatabase = async (env: Env) => {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }
  // Another request in this isolate is already connecting — wait for it
  // instead of racing a second connect() on the same connection.
  if (mongoose.connection.readyState === 2) {
    await mongoose.connection.asPromise();
    return mongoose;
  }
  await mongoose.connect(env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
  return mongoose;
};
