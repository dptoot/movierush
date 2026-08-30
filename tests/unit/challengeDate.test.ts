import { describe, it, expect } from 'vitest';
import { addDays, pickNextChallengeDate } from '@/lib/date-utils';

describe('addDays', () => {
  it('adds a single day', () => {
    expect(addDays('2026-08-29', 1)).toBe('2026-08-30');
  });

  it('rolls over month boundaries', () => {
    expect(addDays('2026-08-31', 1)).toBe('2026-09-01');
  });

  it('rolls over year boundaries', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
  });

  it('handles leap days', () => {
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29');
  });

  it('supports negative offsets', () => {
    expect(addDays('2026-09-01', -1)).toBe('2026-08-31');
  });

  it('is timezone-independent (UTC math)', () => {
    // Regression: naive local-time parsing could shift the day near DST/offset boundaries.
    expect(addDays('2026-03-08', 1)).toBe('2026-03-09');
  });
});

describe('pickNextChallengeDate', () => {
  // Signature: pickNextChallengeDate(today, latest)

  it('seeds tomorrow when there are no existing challenges', () => {
    expect(pickNextChallengeDate('2026-08-29', null)).toBe('2026-08-30');
  });

  it('steady state: yields tomorrow when latest === today', () => {
    // On-time run on 08-29, today already has a challenge -> generate 08-30.
    expect(pickNextChallengeDate('2026-08-29', '2026-08-29')).toBe('2026-08-30');
  });

  it('regression: a run delayed past midnight fills the gap instead of leapfrogging', () => {
    // The real incident: the 08-27 cron was delayed to 08-28 01:53 UTC (today=08-28)
    // while latest was still 08-27. Old clock-only logic produced 08-29 and skipped
    // 08-28; the correct next slot is 08-28.
    expect(pickNextChallengeDate('2026-08-28', '2026-08-27')).toBe('2026-08-28');
  });

  it('advances past a slot that was already generated ahead of time', () => {
    // Latest is already tomorrow (08-30); next open slot is the day after (08-31).
    expect(pickNextChallengeDate('2026-08-29', '2026-08-30')).toBe('2026-08-31');
  });

  it('catches up to today after a multi-day outage rather than backfilling the past', () => {
    // Latest is stale (08-20); we do not regenerate 08-21, we resume at today.
    expect(pickNextChallengeDate('2026-08-28', '2026-08-20')).toBe('2026-08-28');
  });

  it('never returns a date earlier than today', () => {
    expect(pickNextChallengeDate('2026-08-28', '2026-08-25') >= '2026-08-28').toBe(true);
  });
});
