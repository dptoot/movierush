import { describe, it, expect } from 'vitest';
import { calculateTimeBonus, TimeBonusResult } from '@/lib/timeBonus';

describe('calculateTimeBonus', () => {
  describe('quality score calculation', () => {
    it('calculates quality score as vote_count * (vote_average / 10)', () => {
      const result = calculateTimeBonus(1000, 7.5);
      expect(result.qualityScore).toBe(750); // 1000 * 0.75
    });

    it('handles zero vote count', () => {
      const result = calculateTimeBonus(0, 8.0);
      expect(result.qualityScore).toBe(0);
    });

    it('handles zero vote average', () => {
      const result = calculateTimeBonus(1000, 0);
      expect(result.qualityScore).toBe(0);
    });
  });

  describe('tier classification', () => {
    it('classifies very-well-known movies (quality >= 3000)', () => {
      // 5000 votes * 7.0 rating = 3500 quality score
      const result = calculateTimeBonus(5000, 7.0);
      expect(result.tier).toBe('very-well-known');
      expect(result.qualityScore).toBe(3500);
    });

    it('classifies well-known movies (1000 <= quality < 3000)', () => {
      // 2000 votes * 7.0 rating = 1400 quality score
      const result = calculateTimeBonus(2000, 7.0);
      expect(result.tier).toBe('well-known');
      expect(result.qualityScore).toBe(1400);
    });

    it('classifies moderate movies (200 <= quality < 1000)', () => {
      // 500 votes * 8.0 rating = 400 quality score
      const result = calculateTimeBonus(500, 8.0);
      expect(result.tier).toBe('moderate');
      expect(result.qualityScore).toBe(400);
    });

    it('classifies obscure movies (quality < 200)', () => {
      // 100 votes * 6.0 rating = 60 quality score
      const result = calculateTimeBonus(100, 6.0);
      expect(result.tier).toBe('obscure');
      expect(result.qualityScore).toBe(60);
    });
  });

  describe('boundary conditions', () => {
    it('classifies exactly 3000 as very-well-known', () => {
      // 4000 votes * 7.5 rating = 3000 quality score
      const result = calculateTimeBonus(4000, 7.5);
      expect(result.tier).toBe('very-well-known');
      expect(result.qualityScore).toBe(3000);
    });

    it('classifies just below 3000 as well-known', () => {
      // 3998 votes * 7.5 rating = 2998.5 quality score
      const result = calculateTimeBonus(3998, 7.5);
      expect(result.tier).toBe('well-known');
      expect(result.qualityScore).toBeCloseTo(2998.5);
    });

    it('classifies exactly 1000 as well-known', () => {
      // 1000 votes * 10.0 rating = 1000 quality score
      const result = calculateTimeBonus(1000, 10.0);
      expect(result.tier).toBe('well-known');
      expect(result.qualityScore).toBe(1000);
    });

    it('classifies just below 1000 as moderate', () => {
      // 999 votes * 10.0 rating = 999 quality score
      const result = calculateTimeBonus(999, 10.0);
      expect(result.tier).toBe('moderate');
      expect(result.qualityScore).toBe(999);
    });

    it('classifies exactly 200 as moderate', () => {
      // 200 votes * 10.0 rating = 200 quality score
      const result = calculateTimeBonus(200, 10.0);
      expect(result.tier).toBe('moderate');
      expect(result.qualityScore).toBe(200);
    });

    it('classifies just below 200 as obscure', () => {
      // 199 votes * 10.0 rating = 199 quality score
      const result = calculateTimeBonus(199, 10.0);
      expect(result.tier).toBe('obscure');
      expect(result.qualityScore).toBe(199);
    });
  });

  describe('time bonus values', () => {
    it('awards +3 seconds for very-well-known movies', () => {
      const result = calculateTimeBonus(5000, 7.0);
      expect(result.bonus).toBe(3);
    });

    it('awards +5 seconds for well-known movies', () => {
      const result = calculateTimeBonus(2000, 7.0);
      expect(result.bonus).toBe(5);
    });

    it('awards +7 seconds for moderate movies', () => {
      const result = calculateTimeBonus(500, 8.0);
      expect(result.bonus).toBe(7);
    });

    it('awards +10 seconds for obscure movies', () => {
      const result = calculateTimeBonus(100, 6.0);
      expect(result.bonus).toBe(10);
    });
  });

  describe('consistency with scoring tiers', () => {
    // Ensure time bonus tiers match scoring tiers exactly
    const testCases = [
      { voteCount: 5000, voteAverage: 7.0, expectedTier: 'very-well-known' as const },
      { voteCount: 2000, voteAverage: 7.0, expectedTier: 'well-known' as const },
      { voteCount: 500, voteAverage: 8.0, expectedTier: 'moderate' as const },
      { voteCount: 100, voteAverage: 6.0, expectedTier: 'obscure' as const },
    ];

    testCases.forEach(({ voteCount, voteAverage, expectedTier }) => {
      it(`classifies ${expectedTier} consistently with scoring`, () => {
        const result = calculateTimeBonus(voteCount, voteAverage);
        expect(result.tier).toBe(expectedTier);
      });
    });
  });

  describe('real-world examples', () => {
    it('gives minimal bonus for blockbuster like The Dark Knight', () => {
      // Approximately: 30000 votes, 8.5 rating = 25500 quality score
      const result = calculateTimeBonus(30000, 8.5);
      expect(result.tier).toBe('very-well-known');
      expect(result.bonus).toBe(3);
    });

    it('gives moderate bonus for moderately popular film', () => {
      // Approximately: 1500 votes, 7.0 rating = 1050 quality score
      const result = calculateTimeBonus(1500, 7.0);
      expect(result.tier).toBe('well-known');
      expect(result.bonus).toBe(5);
    });

    it('gives good bonus for cult classic', () => {
      // Approximately: 800 votes, 7.5 rating = 600 quality score
      const result = calculateTimeBonus(800, 7.5);
      expect(result.tier).toBe('moderate');
      expect(result.bonus).toBe(7);
    });

    it('gives maximum bonus for obscure indie film', () => {
      // Approximately: 50 votes, 6.5 rating = 32.5 quality score
      const result = calculateTimeBonus(50, 6.5);
      expect(result.tier).toBe('obscure');
      expect(result.bonus).toBe(10);
    });
  });

  describe('return type structure', () => {
    it('returns all expected properties', () => {
      const result = calculateTimeBonus(1000, 7.0);

      expect(result).toHaveProperty('qualityScore');
      expect(result).toHaveProperty('tier');
      expect(result).toHaveProperty('bonus');

      expect(typeof result.qualityScore).toBe('number');
      expect(typeof result.tier).toBe('string');
      expect(typeof result.bonus).toBe('number');
    });
  });
});
