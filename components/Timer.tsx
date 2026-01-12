'use client';

interface TimerProps {
  timeRemaining: number;
  isRunning?: boolean;
}

export default function Timer({ timeRemaining, isRunning = true }: TimerProps) {
  // Determine visual state based on time remaining
  const isWarning = timeRemaining <= 10 && timeRemaining > 5;
  const isCritical = timeRemaining <= 5;

  // Format time display
  const formatTime = (seconds: number): string => {
    if (seconds >= 60) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    return `${seconds}s`;
  };

  // Dynamic styles based on state
  const getContainerStyles = (): string => {
    const base = 'inline-flex items-center gap-2 rounded-full px-6 py-2 transition-all duration-300';

    if (isCritical) {
      return `${base} bg-red-100 dark:bg-red-900/30 animate-pulse`;
    }
    if (isWarning) {
      return `${base} bg-amber-100 dark:bg-amber-900/30`;
    }
    return `${base} bg-zinc-100 dark:bg-zinc-800`;
  };

  const getTextStyles = (): string => {
    const base = 'font-mono text-2xl font-bold transition-colors duration-300';

    if (isCritical) {
      return `${base} text-red-600 dark:text-red-400`;
    }
    if (isWarning) {
      return `${base} text-amber-600 dark:text-amber-400`;
    }
    return `${base} text-emerald-600 dark:text-emerald-400`;
  };

  return (
    <div className={getContainerStyles()}>
      {/* Clock icon */}
      <svg
        className={`h-5 w-5 ${isCritical ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-zinc-400'}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z"
        />
      </svg>

      {/* Time display */}
      <span className={getTextStyles()}>
        {formatTime(timeRemaining)}
      </span>

      {/* Optional: show +/- indicator for bonuses/penalties (future) */}
    </div>
  );
}
