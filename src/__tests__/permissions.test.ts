import { describe, it, expect } from 'vitest';
import {
  canManageOperators,
  canDeleteOrders,
  canEditCatalog,
  canManageSettings,
  canManageReviews,
  canManageCouriers,
  canEditOrders,
  canEditContent,
  canPublishContent,
  canManageBrands,
  canManageDiagnostic,
  canManageChat,
  canViewAnalytics,
  isViewerOnly,
  type AdminRole,
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

  it('enforces the complete private-product role matrix', () => {
    const roles: AdminRole[] = ['owner', 'manager', 'content_editor', 'catalogue_editor', 'logistician', 'fulfilment', 'support', 'viewer'];

    expect(roles.filter(canEditContent)).toEqual(['owner', 'manager', 'content_editor']);
    expect(roles.filter(canPublishContent)).toEqual(['owner', 'manager']);
    expect(roles.filter(canEditCatalog)).toEqual(['owner', 'manager', 'catalogue_editor']);
    expect(roles.filter(canEditOrders)).toEqual(['owner', 'manager', 'logistician', 'fulfilment']);
    expect(roles.filter(canManageBrands)).toEqual(['owner', 'manager', 'content_editor', 'catalogue_editor']);
    expect(roles.filter(canManageDiagnostic)).toEqual(['owner', 'manager']);
    expect(roles.filter(canManageChat)).toEqual(['owner', 'manager', 'content_editor']);
    expect(roles.filter(canViewAnalytics)).toEqual(['owner', 'manager', 'support']);
    expect(roles.filter(isViewerOnly)).toEqual(['viewer']);
  });
});
