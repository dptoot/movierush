// app/api/cron/generate-challenge/route.ts
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { selectActorForDate } from '@/lib/featured-actors';
import { searchPerson, getActorMovies, type TMDBMovie } from '@/lib/tmdb';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

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

/**
 * Get tomorrow's date in YYYY-MM-DD format (UTC)
 */
function getTomorrowDate(): string {
  const now = new Date();
  const tomorrow = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1
  ));
  return tomorrow.toISOString().split('T')[0];
}

/**
 * Check if a challenge already exists for the given date
 */
async function challengeExists(date: string): Promise<boolean> {
  const result = await sql`
    SELECT id FROM challenges WHERE date = ${date} LIMIT 1
  `;
  return result.length > 0;
}

/**
 * Generate a challenge for the given actor and date
 */
async function generateChallenge(actorName: string, date: string): Promise<{
  challengeId: string;
  movieCount: number;
  tierCounts: TierCounts;
}> {
  console.log(`🎬 Generating challenge for ${actorName} on ${date}`);

  // Search for actor on TMDB
  const persons = await searchPerson(actorName);

  if (persons.length === 0) {
    throw new Error(`No person found for "${actorName}"`);
  }

  const actor = persons[0];
  console.log(`   ✓ Found: ${actor.name} (ID: ${actor.id})`);

  // Fetch filmography
  const movies = await getActorMovies(actor.id);
  console.log(`   ✓ Found ${movies.length} feature films`);

  // Calculate quality scores
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

  console.log(`   ✓ Quality tiers: VWK=${tierCounts['Very Well-Known']}, WK=${tierCounts['Well-Known']}, M=${tierCounts['Moderate']}, O=${tierCounts['Obscure']}`);

  // Validate minimum requirements
  const totalMovies = moviesWithQuality.length;
  const obscureCount = tierCounts['Obscure'];

  if (totalMovies < 20) {
    throw new Error(`Insufficient movies: ${totalMovies} (minimum 20 required)`);
  }

  if (obscureCount < 3) {
    throw new Error(`Insufficient obscure movies: ${obscureCount} (minimum 3 required)`);
  }

  // Generate challenge ID and store
  const challengeId = generateChallengeId(date, actor.name);
  const movieIds = moviesWithQuality.map(m => m.id);
  const prompt = `Name ${actor.name} Movies`;

  await sql`
    INSERT INTO challenges (id, date, type, prompt, tmdb_person_id, movie_ids)
    VALUES (${challengeId}, ${date}, 'actor', ${prompt}, ${actor.id}, ${movieIds})
  `;

  console.log(`   ✓ Challenge saved: ${challengeId}`);

  return {
    challengeId,
    movieCount: movieIds.length,
    tierCounts,
  };
}

export async function GET(request: Request) {
  console.log('🕐 Cron job triggered: generate-challenge');

  // Security check: Verify authorization header
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error('❌ CRON_SECRET environment variable not set');
    return NextResponse.json(
      { success: false, error: 'Server configuration error' },
      { status: 500 }
    );
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    console.error('❌ Unauthorized request');
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    // Calculate tomorrow's date
    const tomorrow = getTomorrowDate();
    console.log(`📅 Generating challenge for: ${tomorrow}`);

    // Check if challenge already exists
    if (await challengeExists(tomorrow)) {
      console.log(`✅ Challenge already exists for ${tomorrow}`);
      return NextResponse.json({
        success: true,
        message: 'Challenge already exists',
        date: tomorrow,
      });
    }

    // Select actor for tomorrow (deterministic)
    const actor = selectActorForDate(tomorrow);
    console.log(`🎭 Selected actor: ${actor.name} (TMDB ID: ${actor.tmdb_id})`);

    // Generate the challenge
    const result = await generateChallenge(actor.name, tomorrow);

    console.log(`🎉 Challenge generated successfully!`);

    return NextResponse.json({
      success: true,
      message: 'Challenge generated successfully',
      date: tomorrow,
      actor: actor.name,
      challengeId: result.challengeId,
      movieCount: result.movieCount,
      tierCounts: result.tierCounts,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ Error generating challenge: ${errorMessage}`);

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
