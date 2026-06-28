export type LoyaltyTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';

export interface LoyaltySettings {
  loyaltyPlatinumMultiplier?: number;
  loyaltyGoldMultiplier?: number;
  loyaltySilverMultiplier?: number;
  loyaltyBronzeMultiplier?: number;
  loyaltyPointsPerDh?: number;
}

/**
 * Determines the active tier based on total lifetime points earned.
 */
export function getActiveTier(earned: number): LoyaltyTier {
  if (earned >= 1500) return 'Platinum';
  if (earned >= 700) return 'Gold';
  if (earned >= 300) return 'Silver';
  return 'Bronze';
}

/**
 * Returns the multiplier corresponding to the active tier, checking settings overrides.
 */
export function getTierMultiplier(activeTier: LoyaltyTier, settings: LoyaltySettings): number {
  if (activeTier === 'Platinum') return settings.loyaltyPlatinumMultiplier !== undefined ? settings.loyaltyPlatinumMultiplier : 2.0;
  if (activeTier === 'Gold') return settings.loyaltyGoldMultiplier !== undefined ? settings.loyaltyGoldMultiplier : 1.5;
  if (activeTier === 'Silver') return settings.loyaltySilverMultiplier !== undefined ? settings.loyaltySilverMultiplier : 1.2;
  return settings.loyaltyBronzeMultiplier !== undefined ? settings.loyaltyBronzeMultiplier : 1.0;
}

/**
 * Calculates how many points are needed to qualify for the next tier.
 */
export function getPointsToNextTier(earned: number): number {
  if (earned >= 1500) return 0;
  if (earned >= 700) return 1500 - earned;
  if (earned >= 300) return 700 - earned;
  return 300 - earned;
}

/**
 * Calculates the amount of points earned on a purchase, taking into account multipliers and settings.
 */
export function calculateEarnedPoints(amount: number, pointsPerDh: number = 1.0, tierMultiplier: number = 1.0): number {
  const basePoints = Math.round(amount * pointsPerDh);
  return Math.round(basePoints * tierMultiplier);
}
