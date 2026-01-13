'use client';

import { useState, useEffect } from 'react';
import { GuessedMovie } from '@/types';

interface ResultsProps {
  score: number;
  guessedMovies: GuessedMovie[];
  challengeDate: string;
}

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w92';

export default function Results({
  score,
  guessedMovies,
  challengeDate,
}: ResultsProps) {
  const [copied, setCopied] = useState(false);

  // Save completion to localStorage on mount
  useEffect(() => {
    const gameData = {
      completed: true,
      score,
      moviesFound: guessedMovies.length,
      date: challengeDate,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(`game_${challengeDate}`, JSON.stringify(gameData));
  }, [score, guessedMovies.length, challengeDate]);

  // Sort movies by points_awarded descending
  const sortedMovies = [...guessedMovies].sort(
    (a, b) => b.points_awarded - a.points_awarded
  );

  const handleShare = async () => {
    const shareText = `MovieRush ${challengeDate}

${score} points
${guessedMovies.length} movies found

Play at: movierush.vercel.app`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'MovieRush',
          text: shareText,
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      // User cancelled share or error occurred, try clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        console.error('Failed to share or copy');
      }
    }
  };

  return (
    <div className="flex min-h-[400px] flex-col items-center py-8">
      {/* Game Over heading */}
      <h1 className="mb-6 text-center text-4xl font-bold text-zinc-900 dark:text-zinc-50">
        🎉 Game Over!
      </h1>

      {/* Score display */}
      <div className="mb-6 text-center">
        <p className="text-6xl font-bold text-emerald-500">{score}</p>
        <p className="text-lg text-zinc-500">points</p>
      </div>

      {/* Stats row */}
      <div className="mb-8 flex justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            {guessedMovies.length}
          </p>
          <p className="text-sm text-zinc-500">movies found</p>
        </div>
      </div>

      {/* Share button */}
      <button
        onClick={handleShare}
        className="mb-8 rounded-full bg-emerald-500 px-8 py-3 text-lg font-semibold text-white transition-all hover:bg-emerald-600 hover:shadow-lg active:scale-95"
      >
        {copied ? '✓ Copied!' : 'Share Results'}
      </button>

      {/* Your Guesses section */}
      {sortedMovies.length > 0 && (
        <>
          <h2 className="my-8 text-center text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Your Guesses
          </h2>

          <div className="grid w-full max-w-4xl grid-cols-1 gap-4 px-4 md:grid-cols-2 lg:grid-cols-3">
            {sortedMovies.map((movie) => (
              <div
                key={movie.id}
                className="flex gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-700"
              >
                {/* Poster thumbnail */}
                {movie.poster_path ? (
                  <img
                    src={`${TMDB_IMAGE_BASE}${movie.poster_path}`}
                    alt={movie.title}
                    className="h-24 w-16 rounded object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-16 items-center justify-center rounded bg-zinc-200 dark:bg-zinc-700">
                    <span className="text-2xl">🎬</span>
                  </div>
                )}

                {/* Movie info */}
                <div className="flex flex-1 flex-col justify-center text-left">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                    {movie.title}
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {movie.points_awarded} points
                  </p>
                  <p className="text-xs text-zinc-400">
                    +{movie.time_bonus}s bonus
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Come back tomorrow message */}
      <p className="mt-8 text-center text-zinc-500">
        Come back tomorrow for a new challenge!
      </p>
    </div>
  );
}
