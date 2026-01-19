'use client';

import { useState, useEffect, useRef } from 'react';
import { Challenge, GamePhase, GameState, GuessedMovie } from '@/types';
import { calculateTimeBonus } from '@/lib/timeBonus';
import { calculatePoints } from '@/lib/scoring';
import Timer from './Timer';
import AutocompleteInput from './AutocompleteInput';
import MovieGrid from './MovieGrid';
import Results from './Results';

const INITIAL_TIME = 60; // seconds
const STORAGE_KEY = 'movierush_game';

// Format date as "January 12, 2026"
function formatDate(dateString: string): string {
  // Extract just the date portion (YYYY-MM-DD) from ISO timestamp
  const datePart = dateString.split('T')[0];
  const [year, month, day] = datePart.split('-').map(Number);
  const date = new Date(year, month - 1, day); // month is 0-indexed
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Persisted data structure
interface PersistedGame {
  gameState: GameState;
  guessedMovies: GuessedMovie[];
}

// localStorage helpers
function saveGame(data: PersistedGame): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save game state:', e);
  }
}

function loadGame(): PersistedGame | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    return JSON.parse(saved) as PersistedGame;
  } catch (e) {
    console.error('Failed to load game state:', e);
    return null;
  }
}

function clearGame(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear game state:', e);
  }
}

export default function GameBoard() {
  // Challenge data from API
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Game state
  const [gameState, setGameState] = useState<GameState | null>(null);

  // Guessed movies with full data (for MovieGrid display)
  const [guessedMovies, setGuessedMovies] = useState<GuessedMovie[]>([]);

  // Score tracking
  const [score, setScore] = useState(0);

  // Track if we've initialized from localStorage (prevents saving during load)
  const initializedRef = useRef(false);

  // Load saved game state after challenge is fetched
  useEffect(() => {
    if (!challenge) return;

    // Check for completed game (replay prevention)
    const completedGame = localStorage.getItem(`game_${challenge.date}`);
    if (completedGame) {
      try {
        const gameData = JSON.parse(completedGame);
        if (gameData.completed === true) {
          // Game was completed - prevent replay by showing results
          const savedMovies = gameData.guessedMovies || [];
          setGameState({
            date: challenge.date,
            challengeId: challenge.id,
            phase: 'ended',
            guessedMovieIds: savedMovies.map((m: { id: number }) => m.id),
            incorrectCount: 0,
            timeRemaining: 0,
            finalScore: gameData.score || 0,
          });
          setScore(gameData.score || 0);
          setGuessedMovies(savedMovies);
          initializedRef.current = true;
          return;
        }
      } catch {
        // Invalid JSON, continue with normal flow
      }
    }

    const saved = loadGame();
    if (saved && saved.gameState.date === challenge.date) {
      // Saved game is for today's challenge - restore it
      setGameState(saved.gameState);
      setGuessedMovies(saved.guessedMovies);
      // Calculate score from guessed movies
      const restoredScore = saved.guessedMovies.reduce(
        (acc, movie) => acc + movie.points_awarded,
        0
      );
      setScore(restoredScore);
    } else if (saved) {
      // Saved game is from a different day - clear it
      clearGame();
    }

    // Mark as initialized after a tick to allow state to settle
    setTimeout(() => {
      initializedRef.current = true;
    }, 0);
  }, [challenge]);

  // Save game state whenever it changes (after initialization)
  useEffect(() => {
    if (!initializedRef.current || !gameState) return;

    saveGame({ gameState, guessedMovies });
  }, [gameState, guessedMovies]);

  // Fetch today's challenge on mount
  useEffect(() => {
    async function fetchChallenge() {
      try {
        const response = await fetch('/api/challenge');
        if (!response.ok) {
          if (response.status === 404) {
            setError('No challenge available for today. Check back tomorrow!');
          } else {
            setError('Failed to load challenge. Please try again.');
          }
          return;
        }
        const data = await response.json();
        setChallenge(data);
      } catch (err) {
        setError('Failed to connect to server. Please check your connection.');
      } finally {
        setLoading(false);
      }
    }

    fetchChallenge();
  }, []);

  // Start the game
  const handleStart = () => {
    if (!challenge) return;

    setGameState({
      date: challenge.date,
      challengeId: challenge.id,
      phase: 'playing',
      startedAt: Date.now(),
      guessedMovieIds: [],
      incorrectCount: 0,
      timeRemaining: INITIAL_TIME,
    });
  };

  // End the game manually
  const handleEndGame = () => {
    setGameState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        phase: 'ended',
        completedAt: Date.now(),
      };
    });
  };

  // Get current phase
  const phase: GamePhase = gameState?.phase ?? 'idle';

  const TIME_PENALTY = 5; // seconds for incorrect guess

  // Handle movie selection from autocomplete
  const handleMovieSelect = (movie: {
    id: number;
    title: string;
    poster_path: string | null;
    vote_count: number;
    vote_average: number;
  }) => {
    if (!gameState || !challenge) return;

    // Check if already guessed (correct answer)
    if (gameState.guessedMovieIds.includes(movie.id)) {
      return;
    }

    // Check if this movie is a valid answer for this challenge
    const isCorrect = challenge.valid_movie_ids.includes(movie.id);

    if (isCorrect) {
      // Calculate time bonus based on movie obscurity
      const { bonus: timeBonus } = calculateTimeBonus(movie.vote_count, movie.vote_average);

      // Calculate points for this guess
      const { totalPoints } = calculatePoints(movie.vote_count, movie.vote_average);

      // Correct guess - add to guessed movies with scoring info
      setGuessedMovies((prev) => [
        ...prev,
        {
          id: movie.id,
          title: movie.title,
          poster_path: movie.poster_path,
          points_awarded: totalPoints,
          time_bonus: timeBonus,
        },
      ]);

      // Update score
      setScore((prev) => prev + totalPoints);

      setGameState((prev) => {
        if (!prev) return prev;

        const newGuessedIds = [...prev.guessedMovieIds, movie.id];
        const newTimeRemaining = prev.timeRemaining + timeBonus;

        // Check if all movies found - end game early
        if (newGuessedIds.length >= challenge.total_movies) {
          return {
            ...prev,
            guessedMovieIds: newGuessedIds,
            timeRemaining: newTimeRemaining,
            phase: 'ended',
            completedAt: Date.now(),
          };
        }

        return {
          ...prev,
          guessedMovieIds: newGuessedIds,
          timeRemaining: newTimeRemaining,
        };
      });
    } else {
      // Incorrect guess - apply time penalty
      setGameState((prev) => {
        if (!prev) return prev;

        const newTime = Math.max(0, prev.timeRemaining - TIME_PENALTY);

        // If time runs out from penalty, end game
        if (newTime <= 0) {
          return {
            ...prev,
            timeRemaining: 0,
            incorrectCount: prev.incorrectCount + 1,
            phase: 'ended',
            completedAt: Date.now(),
          };
        }

        return {
          ...prev,
          timeRemaining: newTime,
          incorrectCount: prev.incorrectCount + 1,
        };
      });
    }
  };

  // Timer countdown effect
  useEffect(() => {
    if (phase !== 'playing') return;

    const interval = setInterval(() => {
      setGameState((prev) => {
        if (!prev) return prev;

        const newTime = prev.timeRemaining - 1;

        // Time's up - end the game
        if (newTime <= 0) {
          return {
            ...prev,
            timeRemaining: 0,
            phase: 'ended',
            completedAt: Date.now(),
          };
        }

        return {
          ...prev,
          timeRemaining: newTime,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase]);

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-movierush-navy p-4">
        <div className="text-center">
          <div className="mb-4 text-4xl">🎬</div>
          <p className="text-movierush-gold animate-pulse">Loading today&apos;s challenge...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-movierush-navy p-4">
        <div className="text-center">
          <div className="mb-4 text-4xl">😕</div>
          <p className="text-movierush-cream">{error}</p>
        </div>
      </div>
    );
  }

  // Idle state - show Start button
  if (phase === 'idle' && challenge) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-movierush-navy p-4">
        <div className="text-center max-w-lg">
          <img
            src="/movie-rush-trans.png"
            alt="MovieRush"
            className="mx-auto mb-8 h-48 md:h-64 w-auto"
          />
          <p className="mb-2 text-xl text-movierush-cream">
            Every day, a new movie challenge. Race the clock to name as many as you can.
          </p>
          <p className="mb-8 text-lg text-movierush-silver">
            Correct answers add time, but mistakes will cost you precious seconds.
          </p>

          <button
            onClick={handleStart}
            className="btn-primary mb-8"
          >
            Start The Rush
          </button>

          <p className="text-lg text-movierush-silver">
            {formatDate(challenge.date)}
          </p>
        </div>
      </div>
    );
  }

  // Playing state - show game interface
  if (phase === 'playing' && challenge && gameState) {
    return (
      <div className="min-h-screen bg-movierush-navy p-4 md:p-8">
        <div className="mx-auto max-w-6xl">
          {/* Header with prompt */}
          <div className="mb-6 text-center">
            <h2 className="challenge-prompt mb-4">
              {challenge.prompt}
            </h2>

            {/* Timer and movie count on same line */}
            <div className="flex items-center justify-center gap-6">
              <Timer timeRemaining={gameState.timeRemaining} />
              <p className="text-movierush-cream text-lg">
                <span className="font-bold text-movierush-gold">{gameState.guessedMovieIds.length}</span>
                <span className="text-movierush-silver">/</span>
                <span className="font-bold">{challenge.total_movies}</span>
                <span className="ml-1 text-movierush-silver">found</span>
              </p>
            </div>
          </div>

          {/* Autocomplete input - searches all TMDB movies, validation happens on select */}
          {/* Note: backdrop-blur removed - it creates a stacking context that breaks dropdown z-index on mobile */}
          <div className="mb-6 bg-white/10 rounded-xl p-6">
            <AutocompleteInput onSelect={handleMovieSelect} />
          </div>

          {/* End Game button - above movie list */}
          <div className="mb-6 text-center">
            <button
              onClick={handleEndGame}
              className="btn-secondary"
            >
              End Game
            </button>
          </div>

          {/* Movie grid - shows guessed movies */}
          <div className="flex-1">
            <MovieGrid
              guessedMovies={guessedMovies}
              totalMovies={challenge.total_movies}
            />
          </div>
        </div>
      </div>
    );
  }

  // Ended state - show Results component
  if (phase === 'ended' && challenge) {
    return (
      <Results
        score={score}
        guessedMovies={guessedMovies}
        challengeDate={challenge.date}
      />
    );
  }

  return null;
}
