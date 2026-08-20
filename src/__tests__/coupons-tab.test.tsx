// @vitest-environment jsdom
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CouponsTab from '@/components/admin/CouponsTab';
import { useAdmin } from '@/context/AdminContext';

vi.mock('@/context/AdminContext', () => ({ useAdmin: vi.fn() }));
vi.mock('@/context/UiContext', () => ({ useUi: () => ({ showToast: vi.fn() }) }));
vi.mock('@/app/admin/AdminUIContext', () => ({ useAdminUI: () => ({ isAddingCoupon: false, setIsAddingCoupon: vi.fn() }) }));

const coupon = {
  code: 'QA10PCT', discountPercent: 10, freeShipping: false,
  discountType: 'percent', discountValue: 10, minPurchase: 0,
  expiryDate: '2099-12-31', usageLimit: 0, isActive: true,
};

describe('CouponsTab', () => {
  beforeEach(() => {
    vi.mocked(useAdmin).mockReturnValue({
      coupons: [coupon],
      adminTheme: 'light',
      dashboardStats: { couponUsageStats: {} },
      handleSaveCoupon: vi.fn(),
      handleDeleteCoupon: vi.fn(),
      handleToggleCouponActive: vi.fn(),
    } as any);
  });

  it('renders authenticated admin coupons even when public settings expose none', () => {
    render(<CouponsTab />);

    expect(screen.getByText('QA10PCT')).toBeDefined();
    expect(screen.getByText('1 code enregistré')).toBeDefined();
  });
});
