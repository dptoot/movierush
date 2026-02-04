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

interface ParsedArgs {
  confirm: boolean;
  date?: string;
}

function parseArgs(args: string[]): ParsedArgs {
  const parsed: ParsedArgs = {
    confirm: false,
  };

  let i = 0;
  while (i < args.length) {
    const arg = args[i];

    if (arg === '--confirm') {
      parsed.confirm = true;
      i++;
    } else if (arg === '--date') {
      if (i + 1 >= args.length) {
        throw new Error('--date requires a value (YYYY-MM-DD)');
      }
      parsed.date = args[i + 1];
      i += 2;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return parsed;
}

function validateDate(dateStr: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateStr)) {
    return false;
  }
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
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

async function getChallengeByDate(date: string): Promise<Challenge | null> {
  const result = await sql`
    SELECT id, date, prompt
    FROM challenges
    WHERE date = ${date}
    LIMIT 1
  `;

  if (result.length === 0) {
    return null;
  }

  const row = result[0];
  return {
    id: row.id as string,
    date: (row.date as Date).toISOString().split('T')[0],
    prompt: row.prompt as string,
  };
}

async function deleteFutureChallenges(): Promise<number> {
  const result = await sql`
    DELETE FROM challenges
    WHERE date > CURRENT_DATE
    RETURNING id
  `;

  return result.length;
}

async function deleteChallengeByDate(date: string): Promise<number> {
  const result = await sql`
    DELETE FROM challenges
    WHERE date = ${date}
    RETURNING id
  `;

  return result.length;
}

async function main() {
  const args = process.argv.slice(2);

  // Show help
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: npx tsx scripts/cleanup-future-challenges.ts [options]

Options:
  --date <YYYY-MM-DD>  Delete challenge for a specific date
  --confirm            Actually delete (without this, preview only)
  --help, -h           Show this help

Examples:
  npx tsx scripts/cleanup-future-challenges.ts                    # Preview future challenges
  npx tsx scripts/cleanup-future-challenges.ts --confirm          # Delete all future challenges
  npx tsx scripts/cleanup-future-challenges.ts --date 2026-02-04  # Preview specific date
  npx tsx scripts/cleanup-future-challenges.ts --date 2026-02-04 --confirm  # Delete specific date
`);
    process.exit(0);
  }

  const parsed = parseArgs(args);

  // Specific date mode
  if (parsed.date) {
    if (!validateDate(parsed.date)) {
      console.error('\n❌ Invalid date format. Use YYYY-MM-DD\n');
      process.exit(1);
    }

    console.log('\n🗑️  MovieRush Challenge Cleanup\n');
    console.log('━'.repeat(50));
    console.log(`\n📋 Looking for challenge on ${parsed.date}...\n`);

    const challenge = await getChallengeByDate(parsed.date);

    if (!challenge) {
      console.log(`   ✓ No challenge found for ${parsed.date}. Nothing to clean up.\n`);
      process.exit(0);
    }

    console.log(`   Found challenge:\n`);
    console.log(`   • ${challenge.date}: ${challenge.prompt}`);
    console.log(`     ID: ${challenge.id}`);

    if (!parsed.confirm) {
      console.log('\n' + '━'.repeat(50));
      console.log('\n⚠️  PREVIEW MODE - No changes made');
      console.log('\n   To delete this challenge, run:');
      console.log(`   npx tsx scripts/cleanup-future-challenges.ts --date ${parsed.date} --confirm\n`);
      process.exit(0);
    }

    console.log('\n🗑️  Deleting challenge...');
    const deletedCount = await deleteChallengeByDate(parsed.date);

    console.log(`   ✓ Deleted ${deletedCount} challenge(s)`);
    console.log('\n' + '━'.repeat(50));
    console.log('\n✅ Cleanup complete!\n');
    process.exit(0);
  }

  // Future challenges mode (default)
  console.log('\n🗑️  MovieRush Future Challenge Cleanup\n');
  console.log('━'.repeat(50));

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

  if (!parsed.confirm) {
    console.log('\n' + '━'.repeat(50));
    console.log('\n⚠️  PREVIEW MODE - No changes made');
    console.log('\n   To delete these challenges, run:');
    console.log('   npx tsx scripts/cleanup-future-challenges.ts --confirm\n');
    process.exit(0);
  }

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
