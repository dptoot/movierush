'use client';

import { useRef, useEffect, useState } from 'react';

interface TimerProps {
  timeRemaining: number;
  maxTime?: number;
}

interface AnimationState {
  key: number;
  startOffset: number;
  duration: number;
  delay: number;
}

export default function Timer({ timeRemaining, maxTime = 60 }: TimerProps) {
  const prevTimeRef = useRef(timeRemaining);

  // Animation state - only updates on mount or time bonus/penalty
  const [animation, setAnimation] = useState<AnimationState>(() => {
    const circumference = 2 * Math.PI * 96; // radius = (200 - 8) / 2 = 96
    // If time exceeds maxTime, ring stays full with a delay before depleting
    const overflowTime = Math.max(0, timeRemaining - maxTime);
    const effectiveTime = Math.min(timeRemaining, maxTime);
    const progress = effectiveTime / maxTime;
    return {
      key: 0,
      startOffset: circumference * (1 - progress),
      duration: effectiveTime,
      delay: overflowTime,
    };
  });

  // Detect unexpected time changes (bonuses or penalties) to restart animation
  useEffect(() => {
    const expectedTime = prevTimeRef.current - 1; // Normal countdown
    const timeDiff = timeRemaining - expectedTime;

    // If time changed by more than normal 1-second tick, restart animation
    if (Math.abs(timeDiff) > 0.5) {
      const circumference = 2 * Math.PI * 96;
      const overflowTime = Math.max(0, timeRemaining - maxTime);
      const effectiveTime = Math.min(timeRemaining, maxTime);
      const animProgress = effectiveTime / maxTime;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional: restart CSS animation on time bonuses/penalties
      setAnimation((prev) => ({
        key: prev.key + 1,
        startOffset: circumference * (1 - animProgress),
        duration: effectiveTime,
        delay: overflowTime,
      }));
    }
    prevTimeRef.current = timeRemaining;
  }, [timeRemaining, maxTime]);

  // Calculate color based on time remaining
  // Gold (>30s) -> Orange (10-30s) -> Coral (<10s)
  const getColor = (): string => {
    if (timeRemaining <= 10) return '#E94F37'; // coral
    if (timeRemaining <= 30) return '#F59E0B'; // orange/amber
    return '#FDB913'; // gold
  };

  // SVG circle parameters
  const size = 200;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const color = getColor();

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

  const isWarning = timeRemaining < 10;

  return (
    <div className="timer-container relative inline-flex items-center justify-center">
      {/* SVG circular progress ring - sized by CSS, viewBox keeps proportions */}
      <svg
        className="timer-ring absolute w-full h-full"
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden="true"
      >
        {/* Background track (subtle) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
        />
        {/* Animated progress stroke */}
        <circle
          key={animation.key}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          className="timer-progress-ring"
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: 'center',
            animation: `timer-drain ${animation.duration}s linear ${animation.delay}s forwards`,
            ['--start-offset' as string]: animation.startOffset,
          }}
        />
      </svg>

      {/* Timer text */}
      <time
        dateTime={formatDuration(timeRemaining)}
        role="timer"
        aria-live="polite"
        aria-atomic="true"
        aria-label={getAriaLabel()}
        className={`timer-text tabular-nums font-display ${isWarning ? 'timer-warning' : ''}`}
        style={{ color }}
      >
        {formatTime(timeRemaining)}
      </time>
    </div>
  );
}
