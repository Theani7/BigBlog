import mongoose from 'mongoose';

export type Database = any;

export interface Env {
  MONGO_URI: string;
}

/**
 * Create a Mongoose database connection
 * @param env - Environment variables including MONGO_URI
 * @returns Mongoose instance
 */
export const createDatabase = async (env: Env) => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose;
  }
  await mongoose.connect(env.MONGO_URI);
  return mongoose;
};
