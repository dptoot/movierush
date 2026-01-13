// lib/scoring.ts

/**
 * Calculate points for a correct guess based on movie obscurity.
 *
 * Quality score = vote_count × (vote_average / 10)
 *
 * Base points: 10 per correct movie
 *
 * Popularity bonus tiers:
 * - Very Well-Known (3000+): +0 bonus points
 * - Well-Known (1000-2999): +5 bonus points
 * - Moderate (200-999): +10 bonus points
 * - Obscure (<200): +20 bonus points
 */

const BASE_POINTS = 10;

export interface ScoringResult {
  qualityScore: number;
  tier: 'very-well-known' | 'well-known' | 'moderate' | 'obscure';
  basePoints: number;
  bonusPoints: number;
  totalPoints: number;
}

export function calculatePoints(voteCount: number, voteAverage: number): ScoringResult {
  // Calculate quality score
  const qualityScore = voteCount * (voteAverage / 10);

  // Determine tier and bonus
  let tier: ScoringResult['tier'];
  let bonusPoints: number;

  if (qualityScore >= 3000) {
    tier = 'very-well-known';
    bonusPoints = 0;
  } else if (qualityScore >= 1000) {
    tier = 'well-known';
    bonusPoints = 5;
  } else if (qualityScore >= 200) {
    tier = 'moderate';
    bonusPoints = 10;
  } else {
    tier = 'obscure';
    bonusPoints = 20;
  }

  return {
    qualityScore,
    tier,
    basePoints: BASE_POINTS,
    bonusPoints,
    totalPoints: BASE_POINTS + bonusPoints,
  };
}
