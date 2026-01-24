'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { GuessedMovie } from '@/types';

interface ResultsProps {
  score: number;
  guessedMovies: GuessedMovie[];
  challengeDate: string;
  challengeId: string;
}

interface StatMovie {
  tmdb_id: number;
  title: string;
  poster_path: string | null;
  guess_count: number;
}

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w92';

export default function Results({
  score,
  guessedMovies,
  challengeDate,
  challengeId,
}: ResultsProps) {
  const searchParams = useSearchParams();
  const isDevMode = searchParams.get('dev') === 'true';
  const [copied, setCopied] = useState(false);
  const [moviesCopied, setMoviesCopied] = useState(false);
  const [shareError, setShareError] = useState(false);
  const [popularMovies, setPopularMovies] = useState<StatMovie[] | null>(null);
  const [rareMovies, setRareMovies] = useState<StatMovie[] | null>(null);

  // Save completion to localStorage on mount
  useEffect(() => {
    const gameData = {
      completed: true,
      score,
      moviesFound: guessedMovies.length,
      guessedMovies,
      date: challengeDate,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(`game_${challengeDate}`, JSON.stringify(gameData));
  }, [score, guessedMovies, challengeDate]);

  // Fetch popular and rare movies stats
  useEffect(() => {
    Promise.all([
      fetch(`/api/stats/popular?challenge_id=${challengeId}&limit=5`),
      fetch(`/api/stats/rare?challenge_id=${challengeId}&limit=5`),
    ])
      .then(([popRes, rareRes]) => Promise.all([popRes.json(), rareRes.json()]))
      .then(([popData, rareData]) => {
        setPopularMovies(popData.movies || []);
        setRareMovies(rareData.movies || []);
      })
      .catch((err) => {
        // On fetch error, set to empty arrays (will hide section)
        console.error('Failed to fetch stats:', err);
        setPopularMovies([]);
        setRareMovies([]);
      });
  }, [challengeId]);

  // Sort movies by points_awarded descending
  const sortedMovies = [...guessedMovies].sort(
    (a, b) => b.points_awarded - a.points_awarded
  );

  const handleShare = async () => {
    setShareError(false);
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
    } catch {
      // User cancelled share or error occurred, try clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        console.error('Failed to share or copy');
        setShareError(true);
        setTimeout(() => setShareError(false), 3000);
      }
    }
  };

  const handleCopyMovies = async () => {
    const movieList = sortedMovies.map((m) => m.title).join('\n');
    try {
      await navigator.clipboard.writeText(movieList);
      setMoviesCopied(true);
      setTimeout(() => setMoviesCopied(false), 2000);
    } catch {
      console.error('Failed to copy movie list');
    }
  };

  return (
    <div className="min-h-screen bg-movierush-navy p-6 flex items-center justify-center">
      <div className="max-w-4xl mx-auto text-center">
        {/* Logo */}
        <Image
          src="/movie-rush-trans-sm.webp"
          alt="MovieRush"
          width={512}
          height={256}
          sizes="(max-width: 768px) 384px, 512px"
          priority
          className="mx-auto mb-8 h-48 md:h-64 w-auto"
        />

        {/* Game Over heading */}
        <h1 className="text-4xl md:text-6xl font-display text-movierush-coral mb-4 animate-pop">
          Game Over!
        </h1>

        {/* Come back tomorrow message - right below heading */}
        <p className="mb-8 text-movierush-cream/70">
          Come back tomorrow for a new challenge!
        </p>

        {/* Stats row - movies found and points side by side */}
        <div className="flex justify-center gap-3 sm:gap-6 my-8">
          <div className="card-chunky px-4 py-3 sm:px-8 sm:py-4">
            <p className="text-3xl sm:text-4xl font-bold text-movierush-navy">
              {guessedMovies.length}
            </p>
            <p className="text-xs sm:text-sm text-movierush-silver">movies found</p>
          </div>
          <div className="card-chunky px-4 py-3 sm:px-8 sm:py-4">
            <p className="text-3xl sm:text-4xl font-bold text-movierush-coral">
              {score}
            </p>
            <p className="text-xs sm:text-sm text-movierush-silver">points</p>
          </div>
        </div>

        {/* Share button */}
        <button
          onClick={handleShare}
          className={`btn-primary mb-2 ${shareError ? 'bg-movierush-coral' : ''}`}
        >
          {copied ? '✓ Copied!' : shareError ? 'Unable to share' : 'Share Results'}
        </button>
        {shareError && (
          <p className="text-movierush-coral text-sm mb-6">Try again or copy manually</p>
        )}
        {!shareError && <div className="mb-6" />}

        {/* Dev: Reset button for testing (only visible with ?dev=true) */}
        {isDevMode && (
          <button
            onClick={() => {
              localStorage.removeItem('movierush_game');
              localStorage.removeItem(`game_${challengeDate}`);
              window.location.reload();
            }}
            className="text-xs text-movierush-cream/40 hover:text-movierush-coral underline mb-4"
          >
            [Dev] Reset & Replay Today
          </button>
        )}

        {/* Your Guesses section */}
        {sortedMovies.length > 0 && (
          <>
            <div className="flex items-center justify-center gap-3 mb-6 mt-12">
              <h2 className="text-3xl font-display text-movierush-gold">
                Your Guesses
              </h2>
              <button
                onClick={handleCopyMovies}
                className="text-movierush-cream/60 hover:text-movierush-gold transition-colors"
                title="Copy movie list"
              >
                {moviesCopied ? (
                  <span className="text-movierush-gold text-sm">✓ Copied</span>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                )}
              </button>
            </div>

            <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sortedMovies.map((movie) => (
                <div
                  key={movie.id}
                  className="card-chunky flex gap-3 hover:scale-105 transition-transform duration-200"
                >
                  {/* Poster thumbnail */}
                  {movie.poster_path ? (
                    <img
                      src={`${TMDB_IMAGE_BASE}${movie.poster_path}`}
                      alt={movie.title}
                      className="h-24 w-16 rounded object-cover"
                    />
                  ) : (
                    <div className="flex h-24 w-16 items-center justify-center rounded bg-movierush-cream">
                      <span className="text-2xl">🎬</span>
                    </div>
                  )}

                  {/* Movie info */}
                  <div className="flex flex-1 flex-col justify-center text-left">
                    <p className="font-bold text-movierush-navy">
                      {movie.title}
                    </p>
                    <p className="font-semibold text-movierush-coral">
                      {movie.points_awarded} points
                    </p>
                    <p className="text-sm text-movierush-blue">
                      +{movie.time_bonus}s bonus
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Today's Stats section */}
        {/* Loading state */}
        {(popularMovies === null || rareMovies === null) && (
          <div className="mt-12">
            <h2 className="text-3xl font-display text-movierush-gold mb-6">
              Today&apos;s Stats
            </h2>
            <div className="flex items-center justify-center gap-3 py-8">
              <svg
                className="h-6 w-6 animate-spin text-movierush-gold"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span className="text-movierush-gold">Loading stats...</span>
            </div>
          </div>
        )}

        {/* Loaded state - only show if we have data */}
        {popularMovies !== null &&
          rareMovies !== null &&
          (popularMovies.length > 0 || rareMovies.length > 0) && (
            <div className="mt-12">
              <h2 className="text-3xl font-display text-movierush-gold mb-6">
                Today&apos;s Stats
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Most Popular */}
                {popularMovies.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-movierush-cream mb-4">
                      Most Popular
                    </h3>
                    <div className="space-y-3">
                      {popularMovies.map((movie, index) => (
                        <div
                          key={movie.tmdb_id}
                          className="card-chunky flex items-center gap-3"
                        >
                          <span className="text-lg font-bold text-movierush-gold w-6">
                            {index + 1}
                          </span>
                          {movie.poster_path ? (
                            <img
                              src={`${TMDB_IMAGE_BASE}${movie.poster_path}`}
                              alt={movie.title}
                              className="h-16 w-11 rounded object-cover"
                            />
                          ) : (
                            <div className="flex h-16 w-11 items-center justify-center rounded bg-movierush-cream">
                              <span className="text-lg">🎬</span>
                            </div>
                          )}
                          <div className="flex-1 text-left">
                            <p className="font-semibold text-movierush-navy line-clamp-1">
                              {movie.title}
                            </p>
                            <p className="text-sm text-movierush-silver">
                              {movie.guess_count}{' '}
                              {movie.guess_count === 1 ? 'player' : 'players'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hidden Gems */}
                {rareMovies.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-movierush-cream mb-4">
                      Hidden Gems
                    </h3>
                    <div className="space-y-3">
                      {rareMovies.map((movie, index) => (
                        <div
                          key={movie.tmdb_id}
                          className="card-chunky flex items-center gap-3"
                        >
                          <span className="text-lg font-bold text-movierush-coral w-6">
                            {index + 1}
                          </span>
                          {movie.poster_path ? (
                            <img
                              src={`${TMDB_IMAGE_BASE}${movie.poster_path}`}
                              alt={movie.title}
                              className="h-16 w-11 rounded object-cover"
                            />
                          ) : (
                            <div className="flex h-16 w-11 items-center justify-center rounded bg-movierush-cream">
                              <span className="text-lg">🎬</span>
                            </div>
                          )}
                          <div className="flex-1 text-left">
                            <p className="font-semibold text-movierush-navy line-clamp-1">
                              {movie.title}
                            </p>
                            <p className="text-sm text-movierush-silver">
                              {movie.guess_count}{' '}
                              {movie.guess_count === 1 ? 'player' : 'players'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
