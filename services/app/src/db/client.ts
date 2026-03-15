import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from '../config/env.js';
import * as schema from './schema.js';

if (!config.database.url) {
  if (config.isProduction) {
    throw new Error('DATABASE_URL is required in production. Set the DATABASE_URL environment variable.');
  }
  console.warn('DATABASE_URL not set - database operations will fail');
}

// Parse DATABASE_URL - handle both Cloud SQL socket and standard postgres URLs
const connectionString = config.database.url || 'postgres://localhost/amber';

// Create postgres client
const client = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

// Create Drizzle instance
export const db = drizzle(client, { schema });

// Export schema for use in routes
export { schema };

