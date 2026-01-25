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
