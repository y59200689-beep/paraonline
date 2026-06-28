import { describe, it, expect } from 'vitest';
import {
  canManageOperators,
  canDeleteOrders,
  canEditCatalog,
  canManageSettings,
  canManageReviews,
  canManageCouriers,
  canEditOrders
} from '../lib/permissions';

describe('Admin Permissions', () => {
  describe('canManageOperators', () => {
    it('should allow owner and deny others', () => {
      expect(canManageOperators('owner')).toBe(true);
      expect(canManageOperators('logistician')).toBe(false);
      expect(canManageOperators('support')).toBe(false);
    });
  });

  describe('canDeleteOrders', () => {
    it('should allow owner and deny others', () => {
      expect(canDeleteOrders('owner')).toBe(true);
      expect(canDeleteOrders('logistician')).toBe(false);
      expect(canDeleteOrders('support')).toBe(false);
    });
  });

  describe('canEditCatalog', () => {
    it('should allow owner and deny others', () => {
      expect(canEditCatalog('owner')).toBe(true);
      expect(canEditCatalog('logistician')).toBe(false);
      expect(canEditCatalog('support')).toBe(false);
    });
  });

  describe('canManageSettings', () => {
    it('should allow owner and deny others', () => {
      expect(canManageSettings('owner')).toBe(true);
      expect(canManageSettings('logistician')).toBe(false);
      expect(canManageSettings('support')).toBe(false);
    });
  });

  describe('canManageReviews', () => {
    it('should deny logistician and allow others', () => {
      expect(canManageReviews('owner')).toBe(true);
      expect(canManageReviews('support')).toBe(true);
      expect(canManageReviews('logistician')).toBe(false);
    });
  });

  describe('canManageCouriers', () => {
    it('should deny support and allow others', () => {
      expect(canManageCouriers('owner')).toBe(true);
      expect(canManageCouriers('logistician')).toBe(true);
      expect(canManageCouriers('support')).toBe(false);
    });
  });

  describe('canEditOrders', () => {
    it('should deny support and allow others', () => {
      expect(canEditOrders('owner')).toBe(true);
      expect(canEditOrders('logistician')).toBe(true);
      expect(canEditOrders('support')).toBe(false);
    });
  });
});
