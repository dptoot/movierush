// scripts/generate-month.ts
// Generate challenges for today + next 30 days
import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';

config({ path: '.env.local' });

import { searchPerson, getActorMovies, type TMDBMovie } from '../lib/tmdb.js';
import { selectActorForDate } from '../lib/featured-actors.js';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const sql = neon(process.env.DATABASE_URL!);

interface MovieWithQuality extends TMDBMovie {
  vote_count: number;
  vote_average: number;
  quality_score: number;
  tier: 'Very Well-Known' | 'Well-Known' | 'Moderate' | 'Obscure';
}

function getApiKey(): string {
  const key = process.env.TMDB_API_KEY;
  if (!key) throw new Error('TMDB_API_KEY not set');
  return key;
}

function getTier(qualityScore: number): MovieWithQuality['tier'] {
  if (qualityScore >= 3000) return 'Very Well-Known';
  if (qualityScore >= 1000) return 'Well-Known';
  if (qualityScore >= 200) return 'Moderate';
  return 'Obscure';
}

function generateChallengeId(date: string, actorName: string): string {
  const dateFormatted = date.replace(/-/g, '_');
  const slug = actorName.toLowerCase().replace(/\s+/g, '_');
  return `challenge_${dateFormatted}_${slug}`;
}

async function fetchMovieQuality(movieId: number): Promise<{ vote_count: number; vote_average: number } | null> {
  try {
    const response = await fetch(`${TMDB_BASE_URL}/movie/${movieId}?api_key=${getApiKey()}`);
    if (!response.ok) return null;
    const data = await response.json();
    return { vote_count: data.vote_count || 0, vote_average: data.vote_average || 0 };
  } catch {
    return null;
  }
}

async function challengeExists(date: string): Promise<boolean> {
  const result = await sql`SELECT id FROM challenges WHERE date = ${date} LIMIT 1`;
  return result.length > 0;
}

async function generateChallenge(actorName: string, date: string): Promise<{ success: boolean; movieCount?: number; error?: string }> {
  try {
    // Search for actor
    const persons = await searchPerson(actorName);
    if (persons.length === 0) {
      return { success: false, error: `Actor not found: ${actorName}` };
    }

    const actor = persons[0];
    const movies = await getActorMovies(actor.id);

    // Calculate quality scores
    const moviesWithQuality: MovieWithQuality[] = [];
    let obscureCount = 0;

    for (const movie of movies) {
      const quality = await fetchMovieQuality(movie.id);
      if (quality) {
        const qualityScore = quality.vote_count * (quality.vote_average / 10);
        const tier = getTier(qualityScore);
        moviesWithQuality.push({ ...movie, ...quality, quality_score: qualityScore, tier });
        if (tier === 'Obscure') obscureCount++;
      }
    }

    // Validate - just need 20+ movies, no obscure requirement
    if (moviesWithQuality.length < 20) {
      return { success: false, error: `Only ${moviesWithQuality.length} movies (need 20)` };
    }

    // Store
    const challengeId = generateChallengeId(date, actor.name);
    const movieIds = moviesWithQuality.map(m => m.id);
    const prompt = `Name ${actor.name} Movies`;

    await sql`
      INSERT INTO challenges (id, date, type, prompt, tmdb_person_id, movie_ids)
      VALUES (${challengeId}, ${date}, 'actor', ${prompt}, ${actor.id}, ${movieIds})
    `;

    return { success: true, movieCount: movieIds.length };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

function getDateString(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
}

async function main() {
  const days = parseInt(process.argv[2] || '31', 10); // Default 31 days (today + 30)

  console.log('\n🎬 MovieRush Batch Challenge Generator\n');
  console.log('━'.repeat(60));
  console.log(`📅 Generating challenges for ${days} days starting today\n`);

  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < days; i++) {
    const date = getDateString(i);
    const actor = selectActorForDate(date);

    process.stdout.write(`${date} - ${actor.name.padEnd(25)}`);

    // Check if exists
    if (await challengeExists(date)) {
      console.log('⏭️  Already exists');
      skipped++;
      continue;
    }

    const result = await generateChallenge(actor.name, date);

    if (result.success) {
      console.log(`✅ Generated (${result.movieCount} movies)`);
      generated++;
    } else {
      console.log(`❌ ${result.error}`);
      failed++;
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n' + '━'.repeat(60));
  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Generated: ${generated}`);
  console.log(`   ⏭️  Skipped:   ${skipped}`);
  console.log(`   ❌ Failed:    ${failed}`);
  console.log('\n');
}

main();
