import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { challenge_id, tmdb_id } = body;

    if (!challenge_id || !tmdb_id) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    // Upsert: insert new record or increment existing count
    await sql`
      INSERT INTO guess_stats (challenge_id, tmdb_id, guess_count)
      VALUES (${challenge_id}, ${tmdb_id}, 1)
      ON CONFLICT (challenge_id, tmdb_id)
      DO UPDATE SET guess_count = guess_stats.guess_count + 1
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    // Log error but return 200 to not break gameplay
    console.error('Error recording guess stat:', error);
    return NextResponse.json({ success: true });
  }
}
