// scripts/backfill-challenge-movies.ts
import { config } from 'dotenv';

// Load environment variables from .env.local BEFORE other imports
config({ path: '.env.local' });

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { neon } from '@neondatabase/serverless';
import { getMovieDetails, type TMDBMovie } from '../lib/tmdb-client.js';

const sql = neon(process.env.DATABASE_URL!);

const BATCH_SIZE = 10;
const BATCH_DELAY_MS = 500;
const CACHE_FILE = 'scripts/backfill-cache.json';

interface ChallengeRow {
  id: string;
  date: string;
  movie_ids: number[];
}

interface CacheData {
  fetchedAt: string;
  challenges: Record<string, TMDBMovie[]>;
}

async function fetchInBatches(
  items: number[],
  fetchFn: (id: number) => Promise<TMDBMovie | null>,
): Promise<TMDBMovie[]> {
  const results: TMDBMovie[] = [];
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.allSettled(batch.map(fetchFn));
    for (const result of batchResults) {
      if (result.status === 'fulfilled' && result.value !== null) {
        results.push(result.value);
      }
    }
    if (i + BATCH_SIZE < items.length) {
      await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS));
    }
  }
  return results;
}

function loadCache(): CacheData | null {
  if (!existsSync(CACHE_FILE)) return null;
  try {
    const raw = readFileSync(CACHE_FILE, 'utf-8');
    const data = JSON.parse(raw) as CacheData;
    console.log(`📂 Loaded cache from ${CACHE_FILE} (fetched ${data.fetchedAt})`);
    return data;
  } catch {
    console.log('⚠️  Cache file exists but could not be parsed, will re-fetch');
    return null;
  }
}

function saveCache(data: CacheData): void {
  writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2));
  console.log(`\n💾 Saved cache to ${CACHE_FILE}`);
}

async function backfill(confirm: boolean) {
  console.log(`\n🎬 MovieRush Challenge Movies Backfill${confirm ? '' : ' (FETCH + PREVIEW)'}\n`);
  console.log('━'.repeat(50));

  // Get all challenges
  const challenges = await sql`
    SELECT id, date, movie_ids FROM challenges ORDER BY date ASC
  ` as ChallengeRow[];

  console.log(`\n📊 Found ${challenges.length} total challenges\n`);

  // Check which already have challenge_movies rows
  let skipped = 0;
  const toBackfill: ChallengeRow[] = [];

  for (const challenge of challenges) {
    const existing = await sql`
      SELECT COUNT(*) as count FROM challenge_movies WHERE challenge_id = ${challenge.id}
    `;
    if (Number(existing[0].count) > 0) {
      skipped++;
    } else {
      toBackfill.push(challenge);
    }
  }

  console.log(`   Already populated: ${skipped}`);
  console.log(`   Need backfill: ${toBackfill.length}`);

  if (toBackfill.length === 0) {
    console.log('\n✅ Nothing to backfill!');
    return;
  }

  const totalMovies = toBackfill.reduce((sum, c) => sum + c.movie_ids.length, 0);
  console.log(`   Total movies to fetch: ${totalMovies}`);

  // Try to load cached TMDB data
  let cache = loadCache();

  if (!cache) {
    // Fetch from TMDB and save to cache
    console.log('\n🌐 Fetching movie data from TMDB...\n');

    const challengeMovies: Record<string, TMDBMovie[]> = {};
    let fetchedCount = 0;

    for (const challenge of toBackfill) {
      fetchedCount++;
      console.log(`[${fetchedCount}/${toBackfill.length}] ${challenge.id} (${challenge.movie_ids.length} movies)`);

      const movies = await fetchInBatches(challenge.movie_ids, async (movieId) => {
        try {
          return await getMovieDetails(movieId);
        } catch (err) {
          console.error(`   ⚠️  Failed to fetch movie ${movieId}:`, err);
          return null;
        }
      });

      challengeMovies[challenge.id] = movies;
      console.log(`   ✓ Fetched ${movies.length}/${challenge.movie_ids.length} movies`);
    }

    cache = {
      fetchedAt: new Date().toISOString(),
      challenges: challengeMovies,
    };
    saveCache(cache);
  }

  if (!confirm) {
    console.log('\n⚠️  PREVIEW - Data fetched and cached. Run with --confirm to insert into DB.');
    console.log(`   Cache file: ${CACHE_FILE}`);

    let totalCached = 0;
    for (const c of toBackfill) {
      const movies = cache.challenges[c.id] || [];
      totalCached += movies.length;
      console.log(`   ${c.id}: ${movies.length} movies cached`);
    }
    console.log(`\n   Total movies cached: ${totalCached}`);
    return;
  }

  // --confirm: insert cached data into DB
  console.log('\n💾 Inserting cached data into database...\n');

  let processedChallenges = 0;
  let totalInserted = 0;
  let totalFailed = 0;

  for (const challenge of toBackfill) {
    processedChallenges++;
    const movies = cache.challenges[challenge.id] || [];

    if (movies.length === 0) {
      console.log(`[${processedChallenges}/${toBackfill.length}] ${challenge.id} - no cached data, skipping`);
      continue;
    }

    console.log(`[${processedChallenges}/${toBackfill.length}] ${challenge.id} (${movies.length} movies)`);

    let inserted = 0;
    for (const movie of movies) {
      try {
        await sql`
          INSERT INTO challenge_movies (challenge_id, tmdb_id, title, release_date, poster_path, popularity, backdrop_path, vote_count, vote_average)
          VALUES (${challenge.id}, ${movie.id}, ${movie.title}, ${movie.release_date || null}, ${movie.poster_path}, ${movie.popularity}, ${movie.backdrop_path}, ${movie.vote_count ?? 0}, ${movie.vote_average ?? 0})
          ON CONFLICT (challenge_id, tmdb_id) DO NOTHING
        `;
        inserted++;
      } catch (err) {
        console.error(`   ⚠️  Failed to insert movie ${movie.id}:`, err);
        totalFailed++;
      }
    }

    totalInserted += inserted;
    console.log(`   ✓ Inserted ${inserted}/${movies.length} movies`);
  }

  console.log('\n' + '━'.repeat(50));
  console.log(`\n🎉 Backfill complete!`);
  console.log(`   Challenges processed: ${processedChallenges}`);
  console.log(`   Movies inserted: ${totalInserted}`);
  if (totalFailed > 0) {
    console.log(`   Failed inserts: ${totalFailed}`);
  }
  console.log('');
}

// Parse args
const args = process.argv.slice(2);
const confirm = args.includes('--confirm');

backfill(confirm).catch((err) => {
  console.error('\n❌ Error:', err);
  process.exit(1);
});
