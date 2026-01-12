import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

interface Challenge {
  id: number;
  date: string;
  prompt: string;
  type: string;
  movie_ids: number[];
}

export async function GET() {
  try {
    // Get today's date in UTC, format as YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];

    const result = await sql`
      SELECT id, date, prompt, type, movie_ids
      FROM challenges
      WHERE date = ${today}
      LIMIT 1
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'No challenge available for today' },
        { status: 404 }
      );
    }

    const challenge = result[0] as Challenge;

    return NextResponse.json({
      id: challenge.id,
      date: challenge.date,
      prompt: challenge.prompt,
      type: challenge.type,
      total_movies: challenge.movie_ids.length,
      valid_movie_ids: challenge.movie_ids,
    });
  } catch (error) {
    console.error('Database error fetching challenge:', error);
    return NextResponse.json(
      { error: 'Failed to fetch challenge' },
      { status: 500 }
    );
  }
}
