'use client';

interface TimerProps {
  timeRemaining: number;
}

export default function Timer({ timeRemaining }: TimerProps) {
  // Determine visual state based on time remaining
  const isWarning = timeRemaining < 10;

  // Format time display
  const formatTime = (seconds: number): string => {
    if (seconds >= 60) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    return String(seconds);
  };

  // Format for datetime attribute (ISO 8601 duration)
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `PT${mins}M${secs}S`;
  };

  // Screen reader announcement (only announce at key intervals to avoid spam)
  const getAriaLabel = (): string => {
    if (timeRemaining <= 0) return 'Time is up';
    if (timeRemaining < 10) return `${timeRemaining} seconds remaining, hurry!`;
    if (timeRemaining === 10) return '10 seconds remaining';
    if (timeRemaining === 30) return '30 seconds remaining';
    if (timeRemaining === 60) return '1 minute remaining';
    return `${formatTime(timeRemaining)} remaining`;
  };

  return (
    <time
      dateTime={formatDuration(timeRemaining)}
      role="timer"
      aria-live="polite"
      aria-atomic="true"
      aria-label={getAriaLabel()}
      className={`timer-display min-w-[4rem] tabular-nums ${isWarning ? 'timer-warning' : ''}`}
    >
      {formatTime(timeRemaining)}
    </time>
  );
}
