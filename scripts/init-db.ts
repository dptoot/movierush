// scripts/init-db.ts
import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';

// Load environment variables from .env.local
config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

async function initDatabase() {
  console.log('Creating database schema...\n');

  try {
    // Create challenges table
    await sql`
      CREATE TABLE IF NOT EXISTS challenges (
        id TEXT PRIMARY KEY,
        date DATE UNIQUE NOT NULL,
        type TEXT NOT NULL,
        prompt TEXT NOT NULL,
        tmdb_person_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✓ Created challenges table');

    // Create movies table (associated with challenges)
    await sql`
      CREATE TABLE IF NOT EXISTS challenge_movies (
        id SERIAL PRIMARY KEY,
        challenge_id TEXT NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
        tmdb_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        release_date DATE,
        poster_path TEXT,
        popularity DECIMAL(10, 3) NOT NULL,
        backdrop_path TEXT,
        UNIQUE(challenge_id, tmdb_id)
      )
    `;
    console.log('✓ Created challenge_movies table');

    // Create indexes for performance
    await sql`
      CREATE INDEX IF NOT EXISTS idx_challenges_date ON challenges(date)
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_challenge_movies_challenge_id 
      ON challenge_movies(challenge_id)
    `;
    console.log('✓ Created indexes');

    console.log('\n✅ Database schema created successfully!');
  } catch (error) {
    console.error('❌ Error creating schema:', error);
    throw error;
  }
}

initDatabase();