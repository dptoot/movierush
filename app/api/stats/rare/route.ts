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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const challengeId = searchParams.get('challenge_id');
    const limit = parseInt(searchParams.get('limit') || '5', 10);

    if (!challengeId) {
      return NextResponse.json({ movies: [] });
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
      return NextResponse.json({ movies: [] });
    }

    // Fetch movie details from TMDB for each result
    const movies: RareMovie[] = [];
    for (const stat of stats) {
      try {
        const movie = await getMovieDetails(stat.tmdb_id);
        movies.push({
          tmdb_id: stat.tmdb_id,
          title: movie.title,
          poster_path: movie.poster_path,
          guess_count: stat.guess_count,
        });
      } catch {
        // Skip movies that fail to fetch
        continue;
      }
    }

    return NextResponse.json({ movies });
  } catch (error) {
    console.error('Error fetching rare stats:', error);
    return NextResponse.json({ movies: [] });
  }
}
