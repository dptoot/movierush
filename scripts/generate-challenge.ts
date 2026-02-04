// scripts/generate-challenge.ts
import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';

// Load environment variables from .env.local BEFORE other imports
config({ path: '.env.local' });

import { searchPerson, getActorMovies, type TMDBMovie } from '../lib/tmdb-client.js';
import { selectRandomActor, FEATURED_ACTORS } from '../lib/featured-actors.js';

// Initialize database connection after dotenv loads
const sql = neon(process.env.DATABASE_URL!);

const MAX_RETRIES = 3;
const MIN_MOVIES = 20;

interface MovieWithQuality extends TMDBMovie {
  vote_count: number;
  vote_average: number;
  quality_score: number;
  tier: 'Very Well-Known' | 'Well-Known' | 'Moderate' | 'Obscure';
}

interface TierCounts {
  'Very Well-Known': number;
  'Well-Known': number;
  'Moderate': number;
  'Obscure': number;
}

interface GenerationResult {
  challengeId: string;
  actorName: string;
  movieCount: number;
  tierCounts: TierCounts;
}

interface ParsedArgs {
  actorName?: string;
  date: string;
  dryRun: boolean;
}

function validateDate(dateStr: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateStr)) {
    return false;
  }
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

function getTomorrowDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

function getTier(qualityScore: number): MovieWithQuality['tier'] {
  if (qualityScore >= 3000) return 'Very Well-Known';
  if (qualityScore >= 1000) return 'Well-Known';
  if (qualityScore >= 200) return 'Moderate';
  return 'Obscure';
}

function generateActorSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '_');
}

function generateChallengeId(date: string, actorName: string): string {
  const dateFormatted = date.replace(/-/g, '_');
  const slug = generateActorSlug(actorName);
  return `challenge_${dateFormatted}_${slug}`;
}

function parseArgs(args: string[]): ParsedArgs {
  const parsed: ParsedArgs = {
    date: getTomorrowDate(),
    dryRun: false,
  };

  let i = 0;
  while (i < args.length) {
    const arg = args[i];

    if (arg === '--dry-run') {
      parsed.dryRun = true;
      i++;
    } else if (arg === '--date') {
      if (i + 1 >= args.length) {
        throw new Error('--date requires a value (YYYY-MM-DD)');
      }
      parsed.date = args[i + 1];
      i += 2;
    } else if (!arg.startsWith('--')) {
      // Positional arguments: "actor name" "date"
      if (!parsed.actorName) {
        parsed.actorName = arg;
      } else {
        parsed.date = arg;
      }
      i++;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return parsed;
}

async function checkChallengeExists(date: string): Promise<boolean> {
  const result = await sql`
    SELECT id FROM challenges WHERE date = ${date} LIMIT 1
  `;
  return result.length > 0;
}

async function validateActor(actorName: string): Promise<{
  valid: boolean;
  actor?: { id: number; name: string };
  movies?: MovieWithQuality[];
  tierCounts?: TierCounts;
  reason?: string;
}> {
  // Search for actor on TMDB
  const persons = await searchPerson(actorName);

  if (persons.length === 0) {
    return { valid: false, reason: `No person found for "${actorName}"` };
  }

  const actor = persons[0];

  // Fetch filmography
  const movies = await getActorMovies(actor.id);

  if (movies.length < MIN_MOVIES) {
    return {
      valid: false,
      reason: `Insufficient movies: ${movies.length} (minimum ${MIN_MOVIES} required)`,
    };
  }

  // Calculate quality scores
  const tierCounts: TierCounts = {
    'Very Well-Known': 0,
    'Well-Known': 0,
    'Moderate': 0,
    'Obscure': 0,
  };

  const moviesWithQuality: MovieWithQuality[] = movies.map(movie => {
    const voteCount = movie.vote_count ?? 0;
    const voteAverage = movie.vote_average ?? 0;
    const qualityScore = voteCount * (voteAverage / 10);
    const tier = getTier(qualityScore);
    tierCounts[tier]++;

    return {
      ...movie,
      vote_count: voteCount,
      vote_average: voteAverage,
      quality_score: qualityScore,
      tier,
    };
  });

  return {
    valid: true,
    actor: { id: actor.id, name: actor.name },
    movies: moviesWithQuality,
    tierCounts,
  };
}

async function generateChallenge(
  actorName: string,
  date: string,
  dryRun: boolean
): Promise<GenerationResult> {
  console.log(`\n🎬 MovieRush Challenge Generator${dryRun ? ' (DRY RUN)' : ''}\n`);
  console.log('━'.repeat(50));

  // Step 1: Validate date
  if (!validateDate(date)) {
    throw new Error('Invalid date format. Use YYYY-MM-DD');
  }

  console.log(`\n📅 Target Date: ${date}`);

  // Step 2: Check if challenge already exists
  if (!dryRun) {
    const exists = await checkChallengeExists(date);
    if (exists) {
      throw new Error(`Challenge already exists for ${date}`);
    }
  }

  // Step 3: Validate actor
  console.log(`\n🔍 Validating actor: ${actorName}`);

  const validation = await validateActor(actorName);

  if (!validation.valid) {
    throw new Error(validation.reason);
  }

  const { actor, movies, tierCounts } = validation;
  console.log(`   ✓ Found: ${actor!.name} (TMDB ID: ${actor!.id})`);
  console.log(`   ✓ Feature films: ${movies!.length}`);

  // Step 4: Show tier breakdown
  console.log('\n📊 Quality Distribution:');
  console.log(`   Very Well-Known (≥3000): ${tierCounts!['Very Well-Known']} movies`);
  console.log(`   Well-Known (≥1000): ${tierCounts!['Well-Known']} movies`);
  console.log(`   Moderate (≥200): ${tierCounts!['Moderate']} movies`);
  console.log(`   Obscure (<200): ${tierCounts!['Obscure']} movies`);

  // Step 5: Generate challenge ID
  const challengeId = generateChallengeId(date, actor!.name);
  console.log(`\n🆔 Challenge ID: ${challengeId}`);

  // Step 6: Collect movie IDs
  const movieIds = movies!.map(m => m.id);

  // Step 7: Store in database (unless dry run)
  const prompt = `Name ${actor!.name} Movies`;

  if (dryRun) {
    console.log('\n⚠️  DRY RUN - No changes made to database');
    console.log(`   Would create: ${challengeId}`);
    console.log(`   Prompt: "${prompt}"`);
    console.log(`   Movies: ${movieIds.length}`);
  } else {
    console.log('\n💾 Storing challenge in database...');

    await sql`
      INSERT INTO challenges (id, date, type, prompt, tmdb_person_id, movie_ids)
      VALUES (${challengeId}, ${date}, 'actor', ${prompt}, ${actor!.id}, ${movieIds})
    `;

    console.log('   ✓ Challenge saved successfully!');
  }

  // Summary
  console.log('\n' + '━'.repeat(50));
  console.log(`🎉 Challenge ${dryRun ? 'validated' : 'generated'} successfully!\n`);
  console.log(`   ID: ${challengeId}`);
  console.log(`   Date: ${date}`);
  console.log(`   Actor: ${actor!.name}`);
  console.log(`   Prompt: "${prompt}"`);
  console.log(`   Movies: ${movieIds.length}`);
  console.log('\n');

  return {
    challengeId,
    actorName: actor!.name,
    movieCount: movies!.length,
    tierCounts: tierCounts!,
  };
}

async function generateWithRetry(
  date: string,
  dryRun: boolean
): Promise<GenerationResult> {
  console.log(`\n🎬 MovieRush Challenge Generator${dryRun ? ' (DRY RUN)' : ''}\n`);
  console.log('━'.repeat(50));
  console.log(`\n📅 Target Date: ${date}`);
  console.log(`🎲 Auto-selecting actor from ${FEATURED_ACTORS.length} candidates\n`);

  // Check if challenge already exists
  if (!dryRun) {
    const exists = await checkChallengeExists(date);
    if (exists) {
      throw new Error(`Challenge already exists for ${date}`);
    }
  }

  const failedActors: string[] = [];
  let lastError: string = '';

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    // Select random actor, excluding previously failed ones
    const actorName = selectRandomActor(failedActors);

    console.log(`\n🔄 Attempt ${attempt}/${MAX_RETRIES}: ${actorName}`);

    const validation = await validateActor(actorName);

    if (!validation.valid) {
      console.log(`   ❌ ${validation.reason}`);
      failedActors.push(actorName);
      lastError = validation.reason!;
      continue;
    }

    const { actor, movies, tierCounts } = validation;
    console.log(`   ✓ Found: ${actor!.name} (TMDB ID: ${actor!.id})`);
    console.log(`   ✓ Feature films: ${movies!.length}`);

    // Show tier breakdown
    console.log('\n📊 Quality Distribution:');
    console.log(`   Very Well-Known (≥3000): ${tierCounts!['Very Well-Known']} movies`);
    console.log(`   Well-Known (≥1000): ${tierCounts!['Well-Known']} movies`);
    console.log(`   Moderate (≥200): ${tierCounts!['Moderate']} movies`);
    console.log(`   Obscure (<200): ${tierCounts!['Obscure']} movies`);

    // Generate challenge ID
    const challengeId = generateChallengeId(date, actor!.name);
    console.log(`\n🆔 Challenge ID: ${challengeId}`);

    // Collect movie IDs
    const movieIds = movies!.map(m => m.id);
    const prompt = `Name ${actor!.name} Movies`;

    if (dryRun) {
      console.log('\n⚠️  DRY RUN - No changes made to database');
      console.log(`   Would create: ${challengeId}`);
      console.log(`   Prompt: "${prompt}"`);
      console.log(`   Movies: ${movieIds.length}`);
    } else {
      console.log('\n💾 Storing challenge in database...');

      await sql`
        INSERT INTO challenges (id, date, type, prompt, tmdb_person_id, movie_ids)
        VALUES (${challengeId}, ${date}, 'actor', ${prompt}, ${actor!.id}, ${movieIds})
      `;

      console.log('   ✓ Challenge saved successfully!');
    }

    // Summary
    console.log('\n' + '━'.repeat(50));
    console.log(`🎉 Challenge ${dryRun ? 'validated' : 'generated'} successfully!\n`);
    console.log(`   ID: ${challengeId}`);
    console.log(`   Date: ${date}`);
    console.log(`   Actor: ${actor!.name}`);
    console.log(`   Prompt: "${prompt}"`);
    console.log(`   Movies: ${movieIds.length}`);
    console.log(`   Attempts: ${attempt}`);
    if (failedActors.length > 0) {
      console.log(`   Skipped: ${failedActors.join(', ')}`);
    }
    console.log('\n');

    return {
      challengeId,
      actorName: actor!.name,
      movieCount: movies!.length,
      tierCounts: tierCounts!,
    };
  }

  // All retries exhausted
  throw new Error(
    `Failed to generate challenge after ${MAX_RETRIES} attempts. ` +
    `Last error: ${lastError}. ` +
    `Failed actors: ${failedActors.join(', ')}`
  );
}

// Main execution
async function main() {
  const args = process.argv.slice(2);

  try {
    const parsed = parseArgs(args);

    // Validate date
    if (!validateDate(parsed.date)) {
      throw new Error('Invalid date format. Use YYYY-MM-DD');
    }

    if (parsed.actorName) {
      // Manual mode: specific actor provided
      await generateChallenge(parsed.actorName, parsed.date, parsed.dryRun);
    } else {
      // Auto mode: randomly select actor with retry logic
      await generateWithRetry(parsed.date, parsed.dryRun);
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
