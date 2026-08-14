// @vitest-environment jsdom
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DashboardTab } from '@/components/admin/DashboardTab';
import ReviewsTab from '@/components/admin/ReviewsTab';
import { useAdmin } from '@/context/AdminContext';

vi.mock('@/context/AdminContext', () => ({ useAdmin: vi.fn() }));
vi.mock('@/context/SettingsContext', () => ({
  useSettings: () => ({ settings: { lowStockThreshold: 3, notificationTemplates: { recoveryFr: 'Bonjour' }, coupons: [] } }),
}));

const noOp = vi.fn();
const review = {
  id: 'review-1', productId: 1, author: 'Client test', rating: 5,
  comment: 'Très bien', status: 'Pending', date: '2026-01-01T00:00:00.000Z', reply: '',
};

function mockAdmin(role: 'viewer' | 'support') {
  vi.mocked(useAdmin).mockReturnValue({
    currentUser: { id: role, name: role, username: role, role },
    adminTheme: 'light',
    orders: [],
    abandonedCarts: [{ name: 'Client', phone: '0600000000', total: 100, items: [{ id: 1, title: 'Produit', quantity: 1 }] }],
    operatorsList: [],
    getDashboardStats: () => ({
      totalSales: 0, ordersCount: 0, avgOrderValue: 0, abandonedCartsCount: 1,
      last7DaysSales: [], statusFunnel: {},
    }),
    reviews: [review], products: [{ id: 1, title: 'Produit', price: 10, stock: 1 }],
    handleCreateReview: noOp, handleUpdateReviewStatus: noOp, handleBulkUpdateReviewStatus: noOp,
    handleReplyReview: noOp, handleDeleteReview: noOp, handleUpdateReview: noOp,
    isReviewsLoading: false,
  } as any);
}

describe('viewer admin UI authorization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render dashboard retry controls for a viewer', () => {
    mockAdmin('viewer');
    render(<DashboardTab setActiveTab={noOp} setActiveSettingsSubTab={noOp} analyticsRange="today" setAnalyticsRange={noOp} customDateFrom="" setCustomDateFrom={noOp} customDateTo="" setCustomDateTo={noOp} />);

    expect(screen.queryByRole('button', { name: 'Relancer' })).toBeNull();
    expect(screen.queryByText('Relancer WhatsApp')).toBeNull();
  });

  it('keeps dashboard retry controls available to an authorized role', () => {
    mockAdmin('support');
    render(<DashboardTab setActiveTab={noOp} setActiveSettingsSubTab={noOp} analyticsRange="today" setAnalyticsRange={noOp} customDateFrom="" setCustomDateFrom={noOp} customDateTo="" setCustomDateTo={noOp} />);

    expect(screen.getByRole('button', { name: 'Relancer' })).toBeDefined();
    expect(screen.getByText('Relancer WhatsApp')).toBeDefined();
  });

  it('does not render review mutation controls for a viewer', () => {
    mockAdmin('viewer');
    render(<ReviewsTab />);

    expect(screen.queryByText('Ajouter un avis')).toBeNull();
    expect(screen.queryByText('Supprimer')).toBeNull();
    expect(screen.queryByText('Modifier')).toBeNull();
    expect(screen.queryByText('Approuver')).toBeNull();
  });

  it('keeps review creation available to an authorized review manager', () => {
    mockAdmin('support');
    render(<ReviewsTab />);

    expect(screen.getByText('Ajouter un avis')).toBeDefined();
    expect(screen.getByText('Supprimer')).toBeDefined();
  });
});
