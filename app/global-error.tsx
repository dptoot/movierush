'use client';

import { useEffect } from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Next.js global error boundary for root layout errors.
 * This catches errors in the root layout itself.
 * Must include its own <html> and <body> tags since it replaces the root layout.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log error details in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Global error:', error);
    }
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif' }}>
        <div
          style={{
            display: 'flex',
            minHeight: '100vh',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#1a2650',
            padding: '1rem',
          }}
        >
          <div
            style={{
              maxWidth: '28rem',
              textAlign: 'center',
              padding: '2rem',
              backgroundColor: '#243059',
              borderRadius: '1rem',
              border: '3px solid #d4a84b',
              boxShadow: '0 8px 0 #d4a84b',
            }}
          >
            <div style={{ marginBottom: '1rem', fontSize: '3rem' }}>🎬</div>
            <h1
              style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#d4a84b',
                marginBottom: '1rem',
              }}
            >
              Something went wrong
            </h1>
            <p
              style={{
                color: '#f5f0e1',
                marginBottom: '1.5rem',
              }}
            >
              We hit a critical error. Please try refreshing the page.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={reset}
                style={{
                  padding: '0.75rem 2rem',
                  backgroundColor: '#d4a84b',
                  color: '#1a2650',
                  fontWeight: 'bold',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '1rem',
                }}
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '0.75rem 2rem',
                  backgroundColor: 'transparent',
                  color: '#d4a84b',
                  fontWeight: 'bold',
                  border: '2px solid #d4a84b',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '1rem',
                }}
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
