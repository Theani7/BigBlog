import { defineMiddleware } from 'astro:middleware';

/**
 * Astro middleware that injects environment variables into locals.env
 * so that API routes can access MONGO_URI, JWT_SECRET, etc.
 */
export const onRequest = defineMiddleware(async ({ locals }, next) => {
  // Populate locals.env from process.env / import.meta.env
  (locals as any).env = {
    MONGO_URI: import.meta.env.MONGO_URI || process.env.MONGO_URI || '',
    JWT_SECRET: import.meta.env.JWT_SECRET || process.env.JWT_SECRET || '',
    CLOUDINARY_CLOUD_NAME:
      import.meta.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME || '',
    CLOUDINARY_API_KEY: import.meta.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY || '',
    CLOUDINARY_API_SECRET:
      import.meta.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_API_SECRET || '',
  };

  return next();
});
