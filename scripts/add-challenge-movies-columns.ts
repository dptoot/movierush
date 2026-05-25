// scripts/add-challenge-movies-columns.ts
import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';

// Load environment variables from .env.local
config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

async function addChallengeMoviesColumns() {
  console.log('🎬 Adding scoring columns to challenge_movies table...\n');

  try {
    await sql`
      ALTER TABLE challenge_movies
      ADD COLUMN IF NOT EXISTS vote_count INTEGER NOT NULL DEFAULT 0
    `;
    console.log('✓ Added vote_count column');

    await sql`
      ALTER TABLE challenge_movies
      ADD COLUMN IF NOT EXISTS vote_average DECIMAL(3, 1) NOT NULL DEFAULT 0.0
    `;
    console.log('✓ Added vote_average column');

    console.log('\n✅ challenge_movies columns added successfully!');
  } catch (error) {
    console.error('❌ Error adding columns:', error);
    throw error;
  }
}

addChallengeMoviesColumns();
