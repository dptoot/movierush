// lib/scoring.ts

/**
 * Calculate points for a correct guess based on movie obscurity.
 *
 * Quality score = vote_count × (vote_average / 10)
 *
 * Uses a continuous power curve so every movie gets a unique score
 * proportional to its obscurity, with evenly distributed gaps.
 *
 * Formula: points = max(MIN_POINTS, round(SCORE_SCALE × (1 - (QS / CAP)^CURVE_EXPONENT)))
 *
 * SCORE_SCALE: max possible points per movie (configurable)
 * QUALITY_CAP: quality score at which points drop to the floor
 * CURVE_EXPONENT: controls gap distribution (lower = more even, higher = more aggressive)
 * MIN_POINTS: floor so a correct guess is always worth something
 *
 * Tiers are retained for display/feedback purposes only.
 */

export const SCORE_SCALE = 100;
const QUALITY_CAP = 10_000;
const CURVE_EXPONENT = 0.4;
const MIN_POINTS = 3;

export interface ScoringResult {
  qualityScore: number;
  tier: 'very-well-known' | 'well-known' | 'moderate' | 'obscure';
  totalPoints: number;
}

export function calculatePoints(voteCount: number, voteAverage: number): ScoringResult {
  // Calculate quality score
  const qualityScore = voteCount * (voteAverage / 10);

  // Determine tier (for display purposes)
  let tier: ScoringResult['tier'];
  if (qualityScore >= 3000) {
    tier = 'very-well-known';
  } else if (qualityScore >= 1000) {
    tier = 'well-known';
  } else if (qualityScore >= 200) {
    tier = 'moderate';
  } else {
    tier = 'obscure';
  }

  // Continuous power curve: more obscure → more points
  let totalPoints: number;
  if (qualityScore >= QUALITY_CAP) {
    totalPoints = MIN_POINTS;
  } else {
    const ratio = Math.pow(qualityScore / QUALITY_CAP, CURVE_EXPONENT);
    totalPoints = Math.max(MIN_POINTS, Math.round(SCORE_SCALE * (1 - ratio)));
  }

  return {
    qualityScore,
    tier,
    totalPoints,
  };
}
