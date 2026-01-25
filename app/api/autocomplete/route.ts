import { NextRequest, NextResponse } from 'next/server';
import { searchMovies } from '@/lib/tmdb-client';

interface AutocompleteRequest {
  query: string;
}

/**
 * POST /api/autocomplete
 * Search ALL movies from TMDB (unfiltered)
 * Validation happens client-side after selection to prevent answer browsing
 *
 * Caching Strategy:
 * - no-store: Never cache autocomplete results
 * - Users expect real-time search behavior with fresh results
 */
export async function POST(request: NextRequest) {
  try {
    const body: AutocompleteRequest = await request.json();
    const { query } = body;

    // Validate input
    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { results: [] },
        { headers: { 'Cache-Control': 'no-store' } }
      );
    }

    // Search TMDB for ALL movies matching the query
    const searchResults = await searchMovies(query.trim());

    // Return all results (no filtering) - validation happens after selection
    // Sort by vote_count (most recognized films first) - popularity is volatile
    const results = searchResults
      .map((movie) => ({
        id: movie.id,
        title: movie.title,
        release_date: movie.release_date,
        poster_path: movie.poster_path,
        vote_count: movie.vote_count ?? 0,
        vote_average: movie.vote_average ?? 0,
        popularity: movie.popularity ?? 0,
      }))
      .sort((a, b) => b.vote_count - a.vote_count)
      .slice(0, 8); // Limit to 8 suggestions

    return NextResponse.json(
      { results },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (error) {
    console.error('Autocomplete error:', error);
    return NextResponse.json(
      { error: 'Failed to search movies' },
      { status: 500 }
    );
  }
}
