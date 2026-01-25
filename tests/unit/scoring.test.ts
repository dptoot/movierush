import { describe, it, expect } from 'vitest';
import { calculatePoints, ScoringResult } from '@/lib/scoring';

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
      // 5000 votes * 7.0 rating = 3500 quality score
      const result = calculatePoints(5000, 7.0);
      expect(result.tier).toBe('very-well-known');
      expect(result.qualityScore).toBe(3500);
    });

    it('classifies well-known movies (1000 <= quality < 3000)', () => {
      // 2000 votes * 7.0 rating = 1400 quality score
      const result = calculatePoints(2000, 7.0);
      expect(result.tier).toBe('well-known');
      expect(result.qualityScore).toBe(1400);
    });

    it('classifies moderate movies (200 <= quality < 1000)', () => {
      // 500 votes * 8.0 rating = 400 quality score
      const result = calculatePoints(500, 8.0);
      expect(result.tier).toBe('moderate');
      expect(result.qualityScore).toBe(400);
    });

    it('classifies obscure movies (quality < 200)', () => {
      // 100 votes * 6.0 rating = 60 quality score
      const result = calculatePoints(100, 6.0);
      expect(result.tier).toBe('obscure');
      expect(result.qualityScore).toBe(60);
    });
  });

  describe('boundary conditions', () => {
    it('classifies exactly 3000 as very-well-known', () => {
      // 4000 votes * 7.5 rating = 3000 quality score
      const result = calculatePoints(4000, 7.5);
      expect(result.tier).toBe('very-well-known');
      expect(result.qualityScore).toBe(3000);
    });

    it('classifies just below 3000 as well-known', () => {
      // 3998 votes * 7.5 rating = 2998.5 quality score
      const result = calculatePoints(3998, 7.5);
      expect(result.tier).toBe('well-known');
      expect(result.qualityScore).toBeCloseTo(2998.5);
    });

    it('classifies exactly 1000 as well-known', () => {
      // 1000 votes * 10.0 rating = 1000 quality score
      const result = calculatePoints(1000, 10.0);
      expect(result.tier).toBe('well-known');
      expect(result.qualityScore).toBe(1000);
    });

    it('classifies just below 1000 as moderate', () => {
      // 999 votes * 10.0 rating = 999 quality score
      const result = calculatePoints(999, 10.0);
      expect(result.tier).toBe('moderate');
      expect(result.qualityScore).toBe(999);
    });

    it('classifies exactly 200 as moderate', () => {
      // 200 votes * 10.0 rating = 200 quality score
      const result = calculatePoints(200, 10.0);
      expect(result.tier).toBe('moderate');
      expect(result.qualityScore).toBe(200);
    });

    it('classifies just below 200 as obscure', () => {
      // 199 votes * 10.0 rating = 199 quality score
      const result = calculatePoints(199, 10.0);
      expect(result.tier).toBe('obscure');
      expect(result.qualityScore).toBe(199);
    });
  });

  describe('points calculation', () => {
    it('awards 10 base points for all tiers', () => {
      const tiers: ScoringResult['tier'][] = ['very-well-known', 'well-known', 'moderate', 'obscure'];
      const testCases = [
        { voteCount: 5000, voteAverage: 7.0 }, // very-well-known
        { voteCount: 2000, voteAverage: 7.0 }, // well-known
        { voteCount: 500, voteAverage: 8.0 },  // moderate
        { voteCount: 100, voteAverage: 6.0 },  // obscure
      ];

      testCases.forEach((tc, index) => {
        const result = calculatePoints(tc.voteCount, tc.voteAverage);
        expect(result.basePoints).toBe(10);
        expect(result.tier).toBe(tiers[index]);
      });
    });

    it('awards 0 bonus points for very-well-known movies', () => {
      const result = calculatePoints(5000, 7.0);
      expect(result.bonusPoints).toBe(0);
      expect(result.totalPoints).toBe(10);
    });

    it('awards 5 bonus points for well-known movies', () => {
      const result = calculatePoints(2000, 7.0);
      expect(result.bonusPoints).toBe(5);
      expect(result.totalPoints).toBe(15);
    });

    it('awards 10 bonus points for moderate movies', () => {
      const result = calculatePoints(500, 8.0);
      expect(result.bonusPoints).toBe(10);
      expect(result.totalPoints).toBe(20);
    });

    it('awards 20 bonus points for obscure movies', () => {
      const result = calculatePoints(100, 6.0);
      expect(result.bonusPoints).toBe(20);
      expect(result.totalPoints).toBe(30);
    });
  });

  describe('real-world examples', () => {
    it('scores a blockbuster like The Dark Knight correctly', () => {
      // Approximately: 30000 votes, 8.5 rating = 25500 quality score
      const result = calculatePoints(30000, 8.5);
      expect(result.tier).toBe('very-well-known');
      expect(result.totalPoints).toBe(10);
    });

    it('scores a moderately popular film correctly', () => {
      // Approximately: 1500 votes, 7.0 rating = 1050 quality score
      const result = calculatePoints(1500, 7.0);
      expect(result.tier).toBe('well-known');
      expect(result.totalPoints).toBe(15);
    });

    it('scores a cult classic correctly', () => {
      // Approximately: 800 votes, 7.5 rating = 600 quality score
      const result = calculatePoints(800, 7.5);
      expect(result.tier).toBe('moderate');
      expect(result.totalPoints).toBe(20);
    });

    it('scores an obscure indie film correctly', () => {
      // Approximately: 50 votes, 6.5 rating = 32.5 quality score
      const result = calculatePoints(50, 6.5);
      expect(result.tier).toBe('obscure');
      expect(result.totalPoints).toBe(30);
    });
  });
});
