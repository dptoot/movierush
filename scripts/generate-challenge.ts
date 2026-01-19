// scripts/generate-challenge.ts
import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';

// Load environment variables from .env.local BEFORE other imports
config({ path: '.env.local' });

import { searchPerson, getActorMovies, type TMDBMovie } from '../lib/tmdb.js';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Initialize database connection after dotenv loads
const sql = neon(process.env.DATABASE_URL!);

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

function getApiKey(): string {
  const key = process.env.TMDB_API_KEY;
  if (!key) {
    throw new Error('TMDB_API_KEY environment variable is not set');
  }
  return key;
}

function validateDate(dateStr: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateStr)) {
    return false;
  }
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
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

async function fetchMovieQuality(movieId: number): Promise<{ vote_count: number; vote_average: number } | null> {
  try {
    const url = `${TMDB_BASE_URL}/movie/${movieId}?api_key=${getApiKey()}`;
    const response = await fetch(url);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return {
      vote_count: data.vote_count || 0,
      vote_average: data.vote_average || 0,
    };
  } catch {
    return null;
  }
}

async function generateChallenge(actorName: string, date: string): Promise<string> {
  console.log('\n🎬 MovieRush Challenge Generator\n');
  console.log('━'.repeat(50));

  // Step 1: Validate inputs
  console.log('\n📋 Validating inputs...');

  if (!actorName || actorName.trim().length === 0) {
    throw new Error('Actor name cannot be empty');
  }

  if (!validateDate(date)) {
    throw new Error('Invalid date format. Use YYYY-MM-DD');
  }

  console.log(`   ✓ Actor: ${actorName}`);
  console.log(`   ✓ Date: ${date}`);

  // Step 2: Search for actor on TMDB
  console.log('\n🔍 Searching for actor on TMDB...');

  const persons = await searchPerson(actorName);

  if (persons.length === 0) {
    throw new Error(`No person found for "${actorName}"`);
  }

  // Get the first result (most relevant)
  const actor = persons[0];
  console.log(`   ✓ Found: ${actor.name} (ID: ${actor.id})`);
  console.log(`   ✓ Known for: ${actor.known_for_department}`);

  // Step 3: Fetch filmography
  console.log('\n🎥 Fetching filmography...');

  const movies = await getActorMovies(actor.id);
  console.log(`   ✓ Found ${movies.length} feature films`);

  // Step 4: Calculate quality scores for validation
  console.log('\n📊 Calculating quality scores...');

  const moviesWithQuality: MovieWithQuality[] = [];
  const tierCounts: TierCounts = {
    'Very Well-Known': 0,
    'Well-Known': 0,
    'Moderate': 0,
    'Obscure': 0,
  };

  for (const movie of movies) {
    const quality = await fetchMovieQuality(movie.id);

    if (quality) {
      const qualityScore = quality.vote_count * (quality.vote_average / 10);
      const tier = getTier(qualityScore);

      moviesWithQuality.push({
        ...movie,
        vote_count: quality.vote_count,
        vote_average: quality.vote_average,
        quality_score: qualityScore,
        tier,
      });

      tierCounts[tier]++;
    }
  }

  console.log(`   ✓ Very Well-Known (≥3000): ${tierCounts['Very Well-Known']} movies`);
  console.log(`   ✓ Well-Known (≥1000): ${tierCounts['Well-Known']} movies`);
  console.log(`   ✓ Moderate (≥200): ${tierCounts['Moderate']} movies`);
  console.log(`   ✓ Obscure (<200): ${tierCounts['Obscure']} movies`);

  // Step 5: Validate minimum requirements
  console.log('\n✅ Validating requirements...');

  const totalMovies = moviesWithQuality.length;
  const obscureCount = tierCounts['Obscure'];

  if (totalMovies < 20) {
    throw new Error(`Insufficient movies: ${totalMovies} (minimum 20 required)`);
  }

  console.log(`   ✓ Total movies: ${totalMovies} (min 20)`);

  // Step 6: Generate challenge ID
  const challengeId = generateChallengeId(date, actor.name);
  console.log(`\n🆔 Challenge ID: ${challengeId}`);

  // Step 7: Collect movie IDs
  const movieIds = moviesWithQuality.map(m => m.id);
  console.log(`   ✓ Collected ${movieIds.length} movie IDs`);

  // Step 8: Store in database
  console.log('\n💾 Storing challenge in database...');

  const prompt = `Name ${actor.name} Movies`;

  await sql`
    INSERT INTO challenges (id, date, type, prompt, tmdb_person_id, movie_ids)
    VALUES (${challengeId}, ${date}, 'actor', ${prompt}, ${actor.id}, ${movieIds})
  `;

  console.log(`   ✓ Challenge saved successfully!`);

  // Summary
  console.log('\n' + '━'.repeat(50));
  console.log('🎉 Challenge generated successfully!\n');
  console.log(`   ID: ${challengeId}`);
  console.log(`   Date: ${date}`);
  console.log(`   Prompt: "${prompt}"`);
  console.log(`   Movies: ${movieIds.length}`);
  console.log('\n');

  return challengeId;
}

// Main execution
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('Usage: npx tsx scripts/generate-challenge.ts "<actor name>" "<YYYY-MM-DD>"');
    console.error('Example: npx tsx scripts/generate-challenge.ts "Tom Hanks" "2024-01-15"');
    process.exit(1);
  }

  const [actorName, date] = args;

  try {
    const challengeId = await generateChallenge(actorName, date);
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
