// lib/timeBonus.ts

/**
 * Calculate time bonus based on movie obscurity.
 *
 * Quality score = vote_count × (vote_average / 10)
 *
 * Obscurity tiers:
 * - Very Well-Known (3000+): +3 seconds
 * - Well-Known (1000-2999): +5 seconds
 * - Moderate (200-999): +7 seconds
 * - Obscure (<200): +10 seconds
 */

export interface TimeBonusResult {
  qualityScore: number;
  tier: 'very-well-known' | 'well-known' | 'moderate' | 'obscure';
  bonus: number;
}

export function calculateTimeBonus(voteCount: number, voteAverage: number): TimeBonusResult {
  // Calculate quality score
  const qualityScore = voteCount * (voteAverage / 10);

  // Determine tier and bonus
  if (qualityScore >= 3000) {
    return { qualityScore, tier: 'very-well-known', bonus: 3 };
  } else if (qualityScore >= 1000) {
    return { qualityScore, tier: 'well-known', bonus: 5 };
  } else if (qualityScore >= 200) {
    return { qualityScore, tier: 'moderate', bonus: 7 };
  } else {
    return { qualityScore, tier: 'obscure', bonus: 10 };
  }
}
