import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

export type Database = ReturnType<typeof createDatabase>;

export interface Env {
  DB: D1Database;
}

/**
 * Create a Drizzle ORM database instance
 * @param env - Cloudflare Workers environment with D1 binding
 * @returns Drizzle database instance
 */
export function createDatabase(env: Env) {
  return drizzle(env.DB, { schema });
}

/**
 * Type for D1 database binding
 */
export type D1Binding = D1Database;
