// scripts/cleanup-future-challenges.ts
import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';

// Load environment variables from .env.local
config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

interface Challenge {
  id: string;
  date: string;
  prompt: string;
}

async function getFutureChallenges(): Promise<Challenge[]> {
  const result = await sql`
    SELECT id, date, prompt
    FROM challenges
    WHERE date > CURRENT_DATE
    ORDER BY date ASC
  `;

  return result.map(row => ({
    id: row.id as string,
    date: (row.date as Date).toISOString().split('T')[0],
    prompt: row.prompt as string,
  }));
}

async function deleteFutureChallenges(): Promise<number> {
  const result = await sql`
    DELETE FROM challenges
    WHERE date > CURRENT_DATE
    RETURNING id
  `;

  return result.length;
}

async function main() {
  const args = process.argv.slice(2);
  const confirm = args.includes('--confirm');

  console.log('\n🗑️  MovieRush Future Challenge Cleanup\n');
  console.log('━'.repeat(50));

  // Get future challenges
  console.log('\n📋 Scanning for future-dated challenges...\n');

  const challenges = await getFutureChallenges();

  if (challenges.length === 0) {
    console.log('   ✓ No future challenges found. Nothing to clean up.\n');
    process.exit(0);
  }

  console.log(`   Found ${challenges.length} future challenge(s):\n`);

  for (const challenge of challenges) {
    console.log(`   • ${challenge.date}: ${challenge.prompt}`);
    console.log(`     ID: ${challenge.id}`);
  }

  if (!confirm) {
    console.log('\n' + '━'.repeat(50));
    console.log('\n⚠️  PREVIEW MODE - No changes made');
    console.log('\n   To delete these challenges, run:');
    console.log('   npx tsx scripts/cleanup-future-challenges.ts --confirm\n');
    process.exit(0);
  }

  // Delete with confirmation
  console.log('\n🗑️  Deleting future challenges...');

  const deletedCount = await deleteFutureChallenges();

  console.log(`   ✓ Deleted ${deletedCount} challenge(s)`);
  console.log('\n' + '━'.repeat(50));
  console.log('\n✅ Cleanup complete!\n');

  process.exit(0);
}

main().catch(error => {
  console.error('\n❌ Error:', error instanceof Error ? error.message : error);
  process.exit(1);
});
