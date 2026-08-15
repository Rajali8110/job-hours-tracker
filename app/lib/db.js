import { neon } from '@neondatabase/serverless';

/**
 * Get a SQL query function connected to Neon.
 * Uses the serverless driver which works well with Vercel edge/serverless.
 */
export function getSQL() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  return neon(process.env.DATABASE_URL);
}

/**
 * Initialize the database schema.
 * Safe to call multiple times (uses IF NOT EXISTS).
 */
export async function initDatabase() {
  const sql = getSQL();

  await sql`
    CREATE TABLE IF NOT EXISTS work_entries (
      id SERIAL PRIMARY KEY,
      date DATE UNIQUE NOT NULL,
      hours NUMERIC(5,2) NOT NULL CHECK (hours >= 0 AND hours <= 24),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS app_settings (
      id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
      data JSONB NOT NULL DEFAULT '{}',
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // Insert default settings if none exist
  await sql`
    INSERT INTO app_settings (id, data)
    VALUES (1, '{"hoursPerDay": 7.8, "includeWeekends": false, "holidays": []}')
    ON CONFLICT (id) DO NOTHING
  `;
}
