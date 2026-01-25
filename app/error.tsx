'use client';

import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Next.js error boundary for route-level errors.
 * This catches errors in the page and its children, but not in the root layout.
 */
export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error details in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Route error:', error);
    }
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-movierush-navy p-4">
      <div className="card-chunky max-w-md text-center p-8">
        <div className="mb-4 text-5xl">🎬</div>
        <h1 className="text-2xl font-bold text-movierush-gold mb-4">
          Something went wrong
        </h1>
        <p className="text-movierush-cream mb-6">
          We hit a snag loading the game. Please try again.
        </p>
        {process.env.NODE_ENV === 'development' && (
          <details className="mb-6 text-left">
            <summary className="cursor-pointer text-movierush-silver text-sm mb-2">
              Error details (dev only)
            </summary>
            <pre className="text-xs text-red-400 bg-black/30 p-3 rounded overflow-auto max-h-32">
              {error.message}
            </pre>
            {error.digest && (
              <p className="text-xs text-movierush-silver mt-2">
                Digest: {error.digest}
              </p>
            )}
          </details>
        )}
        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="btn-primary"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="btn-secondary"
          >
            Refresh Page
          </button>
        </div>
      </div>
    </div>
  );
}
