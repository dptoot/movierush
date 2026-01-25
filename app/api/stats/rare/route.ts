import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getMovieDetails } from '@/lib/tmdb-client';

interface GuessStat {
  tmdb_id: number;
  guess_count: number;
}

interface RareMovie {
  tmdb_id: number;
  title: string;
  poster_path: string | null;
  guess_count: number;
}

/**
 * GET /api/stats/rare
 * Returns the least frequently guessed movies for a challenge (hidden gems).
 *
 * Caching Strategy:
 * - s-maxage=300: CDN caches for 5 minutes
 * - stale-while-revalidate: Serve stale content while revalidating
 * - Balances freshness with performance for leaderboard-style data
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const challengeId = searchParams.get('challenge_id');
    const limit = parseInt(searchParams.get('limit') || '5', 10);

    const cacheHeaders = {
      'Cache-Control': 's-maxage=300, stale-while-revalidate',
    };

    if (!challengeId) {
      return NextResponse.json({ movies: [] }, { headers: cacheHeaders });
    }

    // Get least guessed movies (rare/hidden gems)
    const result = await sql`
      SELECT tmdb_id, guess_count
      FROM guess_stats
      WHERE challenge_id = ${challengeId}
      ORDER BY guess_count ASC
      LIMIT ${limit}
    `;

    const stats = result as GuessStat[];

    if (stats.length === 0) {
      return NextResponse.json({ movies: [] }, { headers: cacheHeaders });
    }

    // Fetch movie details from TMDB in parallel for better performance
    const moviePromises = stats.map(async (stat) => {
      const movie = await getMovieDetails(stat.tmdb_id);
      return {
        tmdb_id: stat.tmdb_id,
        title: movie.title,
        poster_path: movie.poster_path,
        guess_count: stat.guess_count,
      };
    });

    const results = await Promise.allSettled(moviePromises);
    const movies: RareMovie[] = results
      .filter((r): r is PromiseFulfilledResult<RareMovie> => r.status === 'fulfilled')
      .map((r) => r.value);

    return NextResponse.json({ movies }, { headers: cacheHeaders });
  } catch (error) {
    console.error('Error fetching rare stats:', error);
    return NextResponse.json({ movies: [] });
  }
}
