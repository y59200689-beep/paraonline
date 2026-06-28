import { describe, it, expect } from 'vitest';
import {
  getActiveTier,
  getTierMultiplier,
  getPointsToNextTier,
  calculateEarnedPoints,
  LoyaltySettings
} from '../lib/loyalty';

describe('Loyalty Calculations', () => {
  describe('getActiveTier', () => {
    it('should assign Bronze tier for points under 300', () => {
      expect(getActiveTier(0)).toBe('Bronze');
      expect(getActiveTier(299)).toBe('Bronze');
    });

    it('should assign Silver tier for points between 300 and 699', () => {
      expect(getActiveTier(300)).toBe('Silver');
      expect(getActiveTier(699)).toBe('Silver');
    });

    it('should assign Gold tier for points between 700 and 1499', () => {
      expect(getActiveTier(700)).toBe('Gold');
      expect(getActiveTier(1499)).toBe('Gold');
    });

    it('should assign Platinum tier for points 1500 and above', () => {
      expect(getActiveTier(1500)).toBe('Platinum');
      expect(getActiveTier(2500)).toBe('Platinum');
    });
  });

  describe('getTierMultiplier', () => {
    const defaultSettings: LoyaltySettings = {};

    it('should return default multipliers if settings are not set', () => {
      expect(getTierMultiplier('Bronze', defaultSettings)).toBe(1.0);
      expect(getTierMultiplier('Silver', defaultSettings)).toBe(1.2);
      expect(getTierMultiplier('Gold', defaultSettings)).toBe(1.5);
      expect(getTierMultiplier('Platinum', defaultSettings)).toBe(2.0);
    });

    it('should respect settings overrides for multipliers', () => {
      const customSettings: LoyaltySettings = {
        loyaltyBronzeMultiplier: 1.1,
        loyaltySilverMultiplier: 1.3,
        loyaltyGoldMultiplier: 1.8,
        loyaltyPlatinumMultiplier: 2.5
      };
      expect(getTierMultiplier('Bronze', customSettings)).toBe(1.1);
      expect(getTierMultiplier('Silver', customSettings)).toBe(1.3);
      expect(getTierMultiplier('Gold', customSettings)).toBe(1.8);
      expect(getTierMultiplier('Platinum', customSettings)).toBe(2.5);
    });
  });

  describe('getPointsToNextTier', () => {
    it('should return points needed for Silver if currently Bronze', () => {
      expect(getPointsToNextTier(100)).toBe(200);
      expect(getPointsToNextTier(0)).toBe(300);
    });

    it('should return points needed for Gold if currently Silver', () => {
      expect(getPointsToNextTier(400)).toBe(300);
      expect(getPointsToNextTier(300)).toBe(400);
    });

    it('should return points needed for Platinum if currently Gold', () => {
      expect(getPointsToNextTier(1000)).toBe(500);
      expect(getPointsToNextTier(700)).toBe(800);
    });

    it('should return 0 if currently Platinum', () => {
      expect(getPointsToNextTier(1500)).toBe(0);
      expect(getPointsToNextTier(2000)).toBe(0);
    });
  });

  describe('calculateEarnedPoints', () => {
    it('should calculate earned points as amount * pointsPerDh * tierMultiplier', () => {
      expect(calculateEarnedPoints(100, 1.0, 1.0)).toBe(100);
      expect(calculateEarnedPoints(100, 1.0, 1.5)).toBe(150);
      expect(calculateEarnedPoints(50, 2.0, 1.2)).toBe(120); // base = 50*2 = 100, multiplied = 100*1.2 = 120
    });

    it('should round calculations to the nearest point', () => {
      expect(calculateEarnedPoints(45, 1.0, 1.2)).toBe(54); // 45 * 1.2 = 54
      expect(calculateEarnedPoints(45, 1.0, 1.5)).toBe(68); // 45 * 1.5 = 67.5 -> rounds to 68
    });
  });
});
