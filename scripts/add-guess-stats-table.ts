// scripts/add-guess-stats-table.ts
import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';

// Load environment variables from .env.local
config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

async function addGuessStatsTable() {
  console.log('🎬 Creating guess_stats table...\n');

  try {
    // Create guess_stats table
    await sql`
      CREATE TABLE IF NOT EXISTS guess_stats (
        challenge_id TEXT NOT NULL,
        tmdb_id INTEGER NOT NULL,
        guess_count INTEGER DEFAULT 1,
        PRIMARY KEY (challenge_id, tmdb_id),
        FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE
      )
    `;
    console.log('✓ Created guess_stats table');

    // Create indexes for performance
    await sql`
      CREATE INDEX IF NOT EXISTS idx_guess_stats_challenge ON guess_stats(challenge_id)
    `;
    console.log('✓ Created index: idx_guess_stats_challenge');

    await sql`
      CREATE INDEX IF NOT EXISTS idx_guess_stats_count ON guess_stats(guess_count DESC)
    `;
    console.log('✓ Created index: idx_guess_stats_count');

    console.log('\n✅ guess_stats table created successfully!');
  } catch (error) {
    console.error('❌ Error creating guess_stats table:', error);
    throw error;
  }
}

addGuessStatsTable();
