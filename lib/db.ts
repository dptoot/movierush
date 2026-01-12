// lib/db.ts
import { neon } from '@neondatabase/serverless';

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  return url;
}

// Export the sql function for direct queries
// Neon handles connection pooling and transactions automatically
export const sql = neon(getDatabaseUrl());
