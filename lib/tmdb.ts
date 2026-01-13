// lib/tmdb.ts
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

function getApiKey(): string {
  const key = process.env.TMDB_API_KEY;
  if (!key) {
    throw new Error('TMDB_API_KEY environment variable is not set');
  }
  return key;
}

export interface TMDBMovie {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  popularity: number;
  backdrop_path: string | null;
  runtime?: number;
  video?: boolean; // true = made-for-video/TV
  vote_count?: number;
  vote_average?: number;
}

export interface TMDBPerson {
  id: number;
  name: string;
  known_for_department: string;
}

/**
 * Search for a person (actor/director) by name
 */
export async function searchPerson(name: string): Promise<TMDBPerson[]> {
  const url = `${TMDB_BASE_URL}/search/person?api_key=${getApiKey()}&query=${encodeURIComponent(name)}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }
  
  const data = await response.json();
  return data.results;
}

/**
 * Get all movies for an actor (cast credits), filtered for feature films only
 */
export async function getActorMovies(personId: number): Promise<TMDBMovie[]> {
  const url = `${TMDB_BASE_URL}/person/${personId}/movie_credits?api_key=${getApiKey()}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }
  
  const data = await response.json();
  
  // Filter out movies without key data
  const candidateMovies = data.cast
    .filter((movie: any) => 
      movie.title && // Has a title
      movie.release_date && // Has a release date
      movie.poster_path && // Has a poster
      !movie.video // Not a direct-to-video/TV movie
    )
    .map((movie: any) => ({
      id: movie.id,
      title: movie.title,
      release_date: movie.release_date,
      poster_path: movie.poster_path,
      popularity: movie.popularity,
      backdrop_path: movie.backdrop_path,
    }));

  // Fetch full details to check runtime and filter to feature films only
  console.log(`   Filtering ${candidateMovies.length} movies for feature films...`);
  const featureFilms: TMDBMovie[] = [];
  
  for (const movie of candidateMovies) {
    try {
      const detailsUrl = `${TMDB_BASE_URL}/movie/${movie.id}?api_key=${getApiKey()}`;
      const detailsResponse = await fetch(detailsUrl);
      
      if (detailsResponse.ok) {
        const details = await detailsResponse.json();
        const runtime = details.runtime || 0;
        
        // Simple, robust filter for feature films
        // We'll manually curate the final list when generating challenges
        const isFeatureFilm = 
          runtime >= 75 && // Feature film length (catches most specials)
          runtime <= 200 && // Reasonable maximum
          !details.genres?.some((g: any) => 
            ['Documentary', 'TV Movie'].includes(g.name)
          );
        
        if (isFeatureFilm) {
          featureFilms.push({
            ...movie,
            runtime,
          });
        }
      }
    } catch (error) {
      // Skip movies that fail to fetch
      continue;
    }
  }

  console.log(`   ✓ Found ${featureFilms.length} feature films`);

  // Sort by release date (oldest first)
  return featureFilms.sort((a, b) => 
    new Date(a.release_date).getTime() - new Date(b.release_date).getTime()
  );
}

/**
 * Get movie details by ID
 */
export async function getMovieDetails(movieId: number): Promise<TMDBMovie> {
  const url = `${TMDB_BASE_URL}/movie/${movieId}?api_key=${getApiKey()}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Search for movies by title
 */
export async function searchMovies(query: string): Promise<TMDBMovie[]> {
  const url = `${TMDB_BASE_URL}/search/movie?api_key=${getApiKey()}&query=${encodeURIComponent(query)}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }
  
  const data = await response.json();
  return data.results;
}

/**
 * Get poster URL for display
 * @param posterPath - The poster path from TMDB (e.g., "/abc123.jpg")
 * @param size - Image size: w92, w154, w185, w342, w500, w780, original
 */
export function getPosterUrl(posterPath: string, size: 'w185' | 'w342' | 'w500' | 'original' = 'w500'): string {
  return `https://image.tmdb.org/t/p/${size}${posterPath}`;
}