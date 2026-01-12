'use client';

import { useState, useEffect } from 'react';
import { Challenge, GamePhase, GameState } from '@/types';
import Timer from './Timer';
import AutocompleteInput from './AutocompleteInput';

const INITIAL_TIME = 60; // seconds

export default function GameBoard() {
  // Challenge data from API
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Game state
  const [gameState, setGameState] = useState<GameState | null>(null);

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

  // Get current phase
  const phase: GamePhase = gameState?.phase ?? 'idle';

  const TIME_PENALTY = 5; // seconds for incorrect guess

  // Handle movie selection from autocomplete
  const handleMovieSelect = (movie: { id: number; title: string }) => {
    if (!gameState || !challenge) return;

    // Check if already guessed (correct answer)
    if (gameState.guessedMovieIds.includes(movie.id)) {
      return;
    }

    // Check if this movie is a valid answer for this challenge
    const isCorrect = challenge.valid_movie_ids.includes(movie.id);

    if (isCorrect) {
      // Correct guess - add to guessed movies
      setGameState((prev) => {
        if (!prev) return prev;

        const newGuessedIds = [...prev.guessedMovieIds, movie.id];

        // Check if all movies found - end game early
        if (newGuessedIds.length >= challenge.total_movies) {
          return {
            ...prev,
            guessedMovieIds: newGuessedIds,
            phase: 'ended',
            completedAt: Date.now(),
          };
        }

        return {
          ...prev,
          guessedMovieIds: newGuessedIds,
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
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-4xl">🎬</div>
          <p className="text-zinc-500">Loading today&apos;s challenge...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-4xl">😕</div>
          <p className="text-zinc-500">{error}</p>
        </div>
      </div>
    );
  }

  // Idle state - show Start button
  if (phase === 'idle' && challenge) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center">
        <div className="text-center">
          <h1 className="mb-2 text-4xl font-bold text-zinc-900 dark:text-zinc-50">
            🎬 MovieRush
          </h1>
          <p className="mb-8 text-zinc-500">
            Daily movie trivia challenge
          </p>

          <div className="mb-8 rounded-xl bg-zinc-100 p-8 dark:bg-zinc-800">
            <p className="mb-2 text-sm font-medium uppercase tracking-wide text-zinc-500">
              Today&apos;s Challenge
            </p>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              {challenge.total_movies} movies to guess
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              {challenge.date}
            </p>
          </div>

          <button
            onClick={handleStart}
            className="rounded-full bg-emerald-500 px-12 py-4 text-lg font-semibold text-white transition-all hover:bg-emerald-600 hover:shadow-lg active:scale-95"
          >
            Start Challenge
          </button>

          <p className="mt-4 text-sm text-zinc-400">
            You&apos;ll have {INITIAL_TIME} seconds to start
          </p>
        </div>
      </div>
    );
  }

  // Playing state - show game interface
  if (phase === 'playing' && challenge && gameState) {
    return (
      <div className="flex min-h-[400px] flex-col">
        {/* Header with prompt and timer */}
        <div className="mb-6 text-center">
          <h2 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            {challenge.prompt}
          </h2>

          <Timer timeRemaining={gameState.timeRemaining} />
        </div>

        {/* Score display */}
        <div className="mb-6 flex justify-center gap-8 text-center">
          <div>
            <p className="text-sm text-zinc-500">Found</p>
            <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
              {gameState.guessedMovieIds.length}/{challenge.total_movies}
            </p>
          </div>
        </div>

        {/* Autocomplete input - searches all TMDB movies, validation happens on select */}
        <div className="mb-8">
          <AutocompleteInput onSelect={handleMovieSelect} />
        </div>

        {/* Movie grid placeholder - will be MovieGrid in Phase 3.4 */}
        <div className="flex-1">
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {Array.from({ length: challenge.total_movies }).map((_, index) => (
              <div
                key={index}
                className="aspect-[2/3] rounded-lg bg-zinc-200 dark:bg-zinc-700"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Ended state placeholder - will be Results component in Phase 4
  if (phase === 'ended') {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-4xl">🎉</div>
          <h2 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Game Over!
          </h2>
          <p className="text-zinc-500">
            Results component coming in Phase 4
          </p>
        </div>
      </div>
    );
  }

  return null;
}
