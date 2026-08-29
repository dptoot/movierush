/**
 * Date utilities for MovieRush
 *
 * Uses user's local timezone for daily challenge reset (like Wordle).
 * Challenge changes at midnight local time, not UTC.
 */

/**
 * Get the user's current local date in YYYY-MM-DD format.
 * Uses 'en-CA' locale which always returns ISO format (YYYY-MM-DD).
 *
 * @returns Date string in YYYY-MM-DD format
 */
export function getUserLocalDate(): string {
  return new Date().toLocaleDateString('en-CA');
}

/**
 * Format a date string for display to users.
 * Converts YYYY-MM-DD to a human-readable format like "January 19, 2026".
 *
 * @param dateString - Date in YYYY-MM-DD format
 * @returns Formatted date string (e.g., "January 19, 2026")
 */
/**
 * Get yesterday's date in the user's local timezone in YYYY-MM-DD format.
 * Used for the "play yesterday's challenge" feature.
 *
 * @returns Date string in YYYY-MM-DD format for yesterday
 */
export function getYesterdayLocalDate(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toLocaleDateString('en-CA');
}

/**
 * Add a whole number of days to a YYYY-MM-DD date string, in UTC.
 * Parsing/formatting via UTC keeps the result independent of the host timezone,
 * which matters for the server-side daily challenge generator.
 *
 * @param dateString - Date in YYYY-MM-DD format
 * @param days - Number of days to add (may be negative)
 * @returns Resulting date in YYYY-MM-DD format
 */
export function addDays(dateString: string, days: number): string {
  const d = new Date(`${dateString}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split('T')[0];
}

/**
 * Pick which date the challenge generator should target, given today's date and
 * the most recent existing challenge.
 *
 * The rule is "fill the next contiguous open slot" (`latest` + 1), floored at
 * `today` so we never try to generate a day that's already in the past. In
 * steady state `latest === today`, so this returns tomorrow — the intended
 * one-day lead. Crucially, when a cron run is delayed across the UTC midnight
 * boundary it still resolves to `latest + 1` rather than leapfrogging to
 * whatever "tomorrow" the clock now reads — which is what caused duplicate-slot
 * collisions and skipped days. With no challenges yet, we seed tomorrow.
 *
 * Lexicographic comparison is valid for zero-padded YYYY-MM-DD strings.
 *
 * @param today - Today's date in YYYY-MM-DD format
 * @param latest - Most recent existing challenge date (YYYY-MM-DD), or null if none
 * @returns The date to generate, in YYYY-MM-DD format
 */
export function pickNextChallengeDate(today: string, latest: string | null): string {
  if (!latest) return addDays(today, 1);
  const nextAfterLatest = addDays(latest, 1);
  return nextAfterLatest > today ? nextAfterLatest : today;
}

export function formatDateForDisplay(dateString: string): string {
  // Parse the date parts to avoid timezone issues
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day); // month is 0-indexed

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
