'use client';

import { useRef, useEffect } from 'react';
import Image from 'next/image';
import { GuessedMovie } from '@/types';

interface MovieGridProps {
  guessedMovies: GuessedMovie[];
}

export default function MovieGrid({ guessedMovies }: MovieGridProps) {
  const gridRef = useRef<HTMLUListElement>(null);

  // Auto-scroll to top when new movie added
  useEffect(() => {
    if (gridRef.current && guessedMovies.length > 0) {
      gridRef.current.scrollTop = 0;
    }
  }, [guessedMovies.length]);

  // Empty state - don't show grid until first correct guess
  if (guessedMovies.length === 0) {
    return null;
  }

  // Grid with guessed movies - using semantic list structure for accessibility
  return (
    <section
      className="rounded-lg border border-zinc-200 bg-gray-50 p-4 dark:border-zinc-700 dark:bg-zinc-800"
      aria-label={`Movies guessed: ${guessedMovies.length} total`}
    >
      <ul
        ref={gridRef}
        className="grid max-h-96 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 list-none m-0 p-0"
        aria-live="polite"
        aria-relevant="additions"
      >
        {[...guessedMovies].reverse().map((movie) => (
          <li
            key={movie.id}
            className="animate-fadeIn aspect-[2/3] overflow-hidden rounded-lg bg-zinc-300 dark:bg-zinc-600"
          >
            {movie.poster_path ? (
              <Image
                src={`https://image.tmdb.org/t/p/w185${movie.poster_path}`}
                alt={`Movie poster for ${movie.title}`}
                width={185}
                height={278}
                sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, (max-width: 1024px) 16vw, 12.5vw"
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center p-2 text-center text-xs text-zinc-500 dark:text-zinc-400"
                role="img"
                aria-label={`No poster available for ${movie.title}`}
              >
                {movie.title}
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
