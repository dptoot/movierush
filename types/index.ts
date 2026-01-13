// types/index.ts

/**
 * Movie data from TMDB
 */
export interface Movie {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  popularity: number;
  backdrop_path?: string | null;
  runtime?: number;
}

/**
 * Challenge data returned from API
 */
export interface Challenge {
  id: number;
  date: string;
  prompt: string;
  type: 'actor' | 'director' | 'genre' | 'theme';
  total_movies: number;
  valid_movie_ids: number[];
}

/**
 * Challenge with full movie data (after fetching details)
 */
export interface ChallengeWithMovies extends Challenge {
  movies: Movie[];
}

/**
 * Game state phases
 */
export type GamePhase = 'idle' | 'playing' | 'ended';

/**
 * Game state stored in component/localStorage
 */
export interface GameState {
  date: string;
  challengeId: number;
  phase: GamePhase;
  startedAt?: number;
  completedAt?: number;
  guessedMovieIds: number[];
  incorrectCount: number;
  timeRemaining: number;
  finalScore?: number;
}

/**
 * Player stats stored in localStorage
 */
export interface PlayerStats {
  gamesPlayed: number;
  totalScore: number;
  bestScore: number;
  currentStreak: number;
  lastPlayed: string;
}

/**
 * Guess result from validation
 */
export interface GuessResult {
  valid: boolean;
  movie?: Movie;
  timeBonus?: number;
  pointsEarned?: number;
}

/**
 * Guessed movie for display in MovieGrid
 */
export interface GuessedMovie {
  id: number;
  title: string;
  poster_path: string | null;
}
