import { describe, it, expect } from 'vitest';
import { calculatePoints, ScoringResult, SCORE_SCALE } from '@/lib/scoring';

describe('calculatePoints', () => {
  describe('quality score calculation', () => {
    it('calculates quality score as vote_count * (vote_average / 10)', () => {
      const result = calculatePoints(1000, 7.5);
      expect(result.qualityScore).toBe(750); // 1000 * 0.75
    });

    it('handles zero vote count', () => {
      const result = calculatePoints(0, 8.0);
      expect(result.qualityScore).toBe(0);
    });

    it('handles zero vote average', () => {
      const result = calculatePoints(1000, 0);
      expect(result.qualityScore).toBe(0);
    });
  });

  describe('tier classification', () => {
    it('classifies very-well-known movies (quality >= 3000)', () => {
      const result = calculatePoints(5000, 7.0);
      expect(result.tier).toBe('very-well-known');
    });

    it('classifies well-known movies (1000 <= quality < 3000)', () => {
      const result = calculatePoints(2000, 7.0);
      expect(result.tier).toBe('well-known');
    });

    it('classifies moderate movies (200 <= quality < 1000)', () => {
      const result = calculatePoints(500, 8.0);
      expect(result.tier).toBe('moderate');
    });

    it('classifies obscure movies (quality < 200)', () => {
      const result = calculatePoints(100, 6.0);
      expect(result.tier).toBe('obscure');
    });
  });

  describe('continuous power curve scoring', () => {
    it('awards SCORE_SCALE for quality score of 0', () => {
      const result = calculatePoints(0, 8.0);
      expect(result.totalPoints).toBe(SCORE_SCALE);
    });

    it('awards MIN_POINTS for quality score at or above cap (15,000)', () => {
      const result = calculatePoints(30000, 8.5);
      expect(result.totalPoints).toBe(100);
    });

    it('scores decrease monotonically as quality score increases', () => {
      const qualityInputs = [
        { voteCount: 10, voteAverage: 5.0 },   // QS = 5
        { voteCount: 100, voteAverage: 6.0 },   // QS = 60
        { voteCount: 500, voteAverage: 8.0 },   // QS = 400
        { voteCount: 2000, voteAverage: 7.0 },  // QS = 1400
        { voteCount: 5000, voteAverage: 7.0 },  // QS = 3500
        { voteCount: 15000, voteAverage: 8.0 }, // QS = 12000
      ];

      const scores = qualityInputs.map(tc => calculatePoints(tc.voteCount, tc.voteAverage).totalPoints);

      for (let i = 1; i < scores.length; i++) {
        expect(scores[i]).toBeLessThanOrEqual(scores[i - 1]);
      }
    });

    it('produces unique scores for movies with sufficiently different quality scores', () => {
      // Movies spread across the scoring range — all should have distinct scores
      const movies = [
        { voteCount: 4567, voteAverage: 7.6 },  // Moon (QS ~3471)
        { voteCount: 2543, voteAverage: 7.2 },  // Galaxy Quest (QS ~1831)
        { voteCount: 1523, voteAverage: 7.1 },  // The Way Way Back (QS ~1081)
        { voteCount: 578, voteAverage: 6.6 },   // Confessions (QS ~381)
        { voteCount: 56, voteAverage: 7.0 },    // Lawn Dogs (QS ~39)
      ];

      const scores = movies.map(m => calculatePoints(m.voteCount, m.voteAverage).totalPoints);
      const uniqueScores = new Set(scores);
      expect(uniqueScores.size).toBe(scores.length);
    });

    it('distributes gaps evenly across the score range', () => {
      // The power curve should produce gaps that don't vary wildly
      const movies = [
        { voteCount: 56, voteAverage: 7.0 },    // QS ~39
        { voteCount: 578, voteAverage: 6.6 },   // QS ~381
        { voteCount: 1523, voteAverage: 7.1 },  // QS ~1081
        { voteCount: 2543, voteAverage: 7.2 },  // QS ~1831
        { voteCount: 4567, voteAverage: 7.6 },  // QS ~3471
        { voteCount: 8121, voteAverage: 8.1 },  // QS ~6578
      ];

      const scores = movies.map(m => calculatePoints(m.voteCount, m.voteAverage).totalPoints);
      const gaps = [];
      for (let i = 1; i < scores.length; i++) {
        gaps.push(scores[i - 1] - scores[i]);
      }

      const maxGap = Math.max(...gaps);
      const minGap = Math.min(...gaps);
      // Power curve gaps should be within 4x of each other (log would be 25x+)
      expect(maxGap / minGap).toBeLessThan(4);
    });

    it('totalPoints is always between MIN_POINTS and SCORE_SCALE', () => {
      const testCases = [
        { voteCount: 0, voteAverage: 0 },
        { voteCount: 0, voteAverage: 10 },
        { voteCount: 50, voteAverage: 6.5 },
        { voteCount: 800, voteAverage: 7.5 },
        { voteCount: 50000, voteAverage: 9.0 },
      ];

      testCases.forEach((tc) => {
        const result = calculatePoints(tc.voteCount, tc.voteAverage);
        expect(result.totalPoints).toBeGreaterThanOrEqual(100);
        expect(result.totalPoints).toBeLessThanOrEqual(SCORE_SCALE);
      });
    });

    it('interface has no basePoints or bonusPoints fields', () => {
      const result = calculatePoints(1000, 7.0);
      expect(result).toHaveProperty('qualityScore');
      expect(result).toHaveProperty('tier');
      expect(result).toHaveProperty('totalPoints');
      expect(result).not.toHaveProperty('basePoints');
      expect(result).not.toHaveProperty('bonusPoints');
    });
  });

  describe('real-world examples', () => {
    it('scores a blockbuster at the floor', () => {
      // The Dark Knight: ~30000 votes, 8.5 rating = 25500 QS (above cap)
      const result = calculatePoints(30000, 8.5);
      expect(result.tier).toBe('very-well-known');
      expect(result.totalPoints).toBe(100);
    });

    it('scores a moderately popular film higher than a blockbuster', () => {
      const moderate = calculatePoints(1500, 7.0);
      const blockbuster = calculatePoints(30000, 8.5);
      expect(moderate.totalPoints).toBeGreaterThan(blockbuster.totalPoints);
    });

    it('scores a cult classic higher than a moderately popular film', () => {
      const cult = calculatePoints(800, 7.5);
      const moderate = calculatePoints(1500, 7.0);
      expect(cult.totalPoints).toBeGreaterThan(moderate.totalPoints);
    });

    it('scores an obscure indie film highest', () => {
      const obscure = calculatePoints(50, 6.5);
      const cult = calculatePoints(800, 7.5);
      expect(obscure.totalPoints).toBeGreaterThan(cult.totalPoints);
      expect(obscure.totalPoints).toBeGreaterThan(200);
    });
  });
});
