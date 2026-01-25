import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getUserLocalDate } from '@/lib/date-utils';

interface Challenge {
  id: number;
  date: string;
  prompt: string;
  type: string;
  movie_ids: number[];
}

/**
 * GET /api/challenge
 * Returns challenge data for a given date.
 *
 * Uses user's local timezone for daily reset (like Wordle).
 * Challenge changes at midnight local time.
 *
 * Query Parameters:
 * - date (optional): Date in YYYY-MM-DD format. Defaults to server's local date.
 *
 * Caching Strategy:
 * - s-maxage=3600: CDN caches for 1 hour
 * - stale-while-revalidate: Serve stale content while revalidating in background
 */
export async function GET(request: NextRequest) {
  try {
    // Get date from query param, or use server's local date as fallback
    const dateParam = request.nextUrl.searchParams.get('date');
    const queryDate = dateParam || getUserLocalDate();

    const result = await sql`
      SELECT id, date, prompt, type, movie_ids
      FROM challenges
      WHERE date = ${queryDate}
      LIMIT 1
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: `No challenge available for ${queryDate}` },
        { status: 404 }
      );
    }

    const challenge = result[0] as Challenge;

    return NextResponse.json(
      {
        id: challenge.id,
        date: challenge.date,
        prompt: challenge.prompt,
        type: challenge.type,
        total_movies: challenge.movie_ids.length,
        valid_movie_ids: challenge.movie_ids,
      },
      {
        headers: {
          'Cache-Control': 's-maxage=3600, stale-while-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('Database error fetching challenge:', error);
    return NextResponse.json(
      { error: 'Failed to fetch challenge' },
      { status: 500 }
    );
  }
}
