// lib/tmdb-client.ts
// Typed TMDB API client using tmdb-ts package
import { TMDB } from 'tmdb-ts';

// Types for our application (compatible with existing interfaces)
export interface TMDBMovie {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  popularity: number;
  backdrop_path: string | null;
  runtime?: number;
  video?: boolean;
  vote_count?: number;
  vote_average?: number;
}

export interface TMDBPerson {
  id: number;
  name: string;
  known_for_department: string;
}

interface Genre {
  id: number;
  name: string;
}

// Singleton TMDB client instance
let tmdbClient: TMDB | null = null;

/**
 * In-memory cache for movie details
 * Caching Strategy:
 * - TTL: 24 hours (movie metadata rarely changes)
 * - Reduces TMDB API calls for repeated movie lookups
 * - Used by stats endpoints and getActorMovies()
 */
interface CacheEntry {
  data: TMDBMovie;
  expiresAt: number;
}
const movieDetailsCache = new Map<number, CacheEntry>();
const MOVIE_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function getClient(): TMDB {
  if (tmdbClient) {
    return tmdbClient;
  }

  // tmdb-ts requires an API Read Access Token (not the API key)
  // Get this from TMDB account settings: https://www.themoviedb.org/settings/api
  const accessToken = process.env.TMDB_ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error(
      'TMDB_ACCESS_TOKEN environment variable is not set. ' +
      'Get your API Read Access Token from https://www.themoviedb.org/settings/api'
    );
  }

  tmdbClient = new TMDB(accessToken);
  return tmdbClient;
}

/**
 * Search for movies by title
 */
export async function searchMovies(query: string): Promise<TMDBMovie[]> {
  const client = getClient();
  const response = await client.search.movies({ query });

  return response.results.map((movie) => ({
    id: movie.id,
    title: movie.title,
    release_date: movie.release_date ?? '',
    poster_path: movie.poster_path ?? null,
    popularity: movie.popularity ?? 0,
    backdrop_path: movie.backdrop_path ?? null,
    video: movie.video ?? false,
    vote_count: movie.vote_count ?? 0,
    vote_average: movie.vote_average ?? 0,
  }));
}

/**
 * Get movie details by ID
 * Uses in-memory cache with 24-hour TTL to reduce TMDB API calls
 */
export async function getMovieDetails(movieId: number): Promise<TMDBMovie> {
  // Check cache first
  const cached = movieDetailsCache.get(movieId);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  // Fetch from TMDB
  const client = getClient();
  const movie = await client.movies.details(movieId);

  const movieData: TMDBMovie = {
    id: movie.id,
    title: movie.title,
    release_date: movie.release_date ?? '',
    poster_path: movie.poster_path ?? null,
    popularity: movie.popularity ?? 0,
    backdrop_path: movie.backdrop_path ?? null,
    runtime: movie.runtime ?? 0,
    video: movie.video ?? false,
    vote_count: movie.vote_count ?? 0,
    vote_average: movie.vote_average ?? 0,
  };

  // Store in cache
  movieDetailsCache.set(movieId, {
    data: movieData,
    expiresAt: Date.now() + MOVIE_CACHE_TTL_MS,
  });

  return movieData;
}

/**
 * Search for a person (actor/director) by name
 */
export async function searchPerson(name: string): Promise<TMDBPerson[]> {
  const client = getClient();
  const response = await client.search.people({ query: name });

  return response.results.map((person) => ({
    id: person.id,
    name: person.name,
    known_for_department: person.known_for_department ?? 'Acting',
  }));
}

/**
 * Get all movies for an actor (cast credits), filtered for feature films only
 */
export async function getActorMovies(personId: number): Promise<TMDBMovie[]> {
  const client = getClient();
  const credits = await client.people.movieCredits(personId);

  // Filter out movies without key data
  const candidateMovies = credits.cast.filter(
    (movie) =>
      movie.title && // Has a title
      movie.release_date && // Has a release date
      movie.poster_path && // Has a poster
      !movie.video // Not a direct-to-video/TV movie
  );

  // Fetch full details to check runtime and filter to feature films only
  console.log(`   Filtering ${candidateMovies.length} movies for feature films...`);
  const featureFilms: TMDBMovie[] = [];

  for (const movie of candidateMovies) {
    try {
      const details = await client.movies.details(movie.id);
      const runtime = details.runtime ?? 0;

      // Simple, robust filter for feature films
      const genres = (details.genres ?? []) as Genre[];
      const isFeatureFilm =
        runtime >= 75 && // Feature film length
        runtime <= 200 && // Reasonable maximum
        !genres.some((g) => ['Documentary', 'TV Movie'].includes(g.name));

      if (isFeatureFilm) {
        featureFilms.push({
          id: movie.id,
          title: movie.title,
          release_date: movie.release_date ?? '',
          poster_path: movie.poster_path ?? null,
          popularity: movie.popularity ?? 0,
          backdrop_path: movie.backdrop_path ?? null,
          runtime,
          vote_count: details.vote_count ?? 0,
          vote_average: details.vote_average ?? 0,
        });
      }
    } catch {
      // Skip movies that fail to fetch
      continue;
    }
  }

  console.log(`   ✓ Found ${featureFilms.length} feature films`);

  // Sort by release date (oldest first)
  return featureFilms.sort(
    (a, b) => new Date(a.release_date).getTime() - new Date(b.release_date).getTime()
  );
}

/**
 * Get poster URL for display
 * @param posterPath - The poster path from TMDB (e.g., "/abc123.jpg")
 * @param size - Image size: w92, w154, w185, w342, w500, w780, original
 */
export function getPosterUrl(
  posterPath: string,
  size: 'w185' | 'w342' | 'w500' | 'original' = 'w500'
): string {
  return `https://image.tmdb.org/t/p/${size}${posterPath}`;
}
