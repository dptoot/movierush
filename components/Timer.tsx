'use client';

interface TimerProps {
  timeRemaining: number;
  isRunning?: boolean;
}

export default function Timer({ timeRemaining, isRunning = true }: TimerProps) {
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

  return (
    <div className={`timer-display min-w-[4rem] tabular-nums ${isWarning ? 'timer-warning' : ''}`}>
      {formatTime(timeRemaining)}
    </div>
  );
}
