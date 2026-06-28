'use client';

import React from 'react';
import { Product } from '@/lib/data';
import { HeroCardConfig } from './SettingsContext';

// Import split context hooks and providers
import { AdminThemeProvider, useAdminTheme } from './admin/AdminThemeContext';
import { AdminAuthProvider, useAdminAuth, AdminUser } from './admin/AdminAuthContext';
import { AdminDataProvider, useAdminData, Order, OrderItem, Review, AuditLog, AbandonedCart, DiagnosticData } from './admin/AdminDataContext';
import { AdminOrdersProvider, useAdminOrders } from './admin/AdminOrdersContext';
import { AdminCatalogProvider, useAdminCatalog } from './admin/AdminCatalogContext';
import { AdminReviewsProvider, useAdminReviews } from './admin/AdminReviewsContext';
import { AdminLoyaltyProvider, useAdminLoyalty } from './admin/AdminLoyaltyContext';
import { AdminOperatorsProvider, useAdminOperators } from './admin/AdminOperatorsContext';
import { AdminCartsProvider, useAdminCarts } from './admin/AdminCartsContext';
import { AdminAdviceProvider, useAdminAdvice } from './admin/AdminAdviceContext';

// Re-export type declarations for backward compatibility
export type { DiagnosticData, OrderItem, Order, Review, AuditLog, AbandonedCart, AdminUser };

export interface AdminContextProps {
  // Authentication
  currentUser: AdminUser | null;
  isAuthenticated: boolean;
  authError: string;
  setAuthError: (err: string) => void;
  handleLogin: (username: string, password: string) => Promise<boolean>;
  handleLogout: () => void;
  requiresMfa: boolean;
  setRequiresMfa: (val: boolean) => void;
  handleVerifyMfa: (code: string) => Promise<boolean>;
  requiresMfaSetup: boolean;
  setRequiresMfaSetup: (val: boolean) => void;
  handleCompleteMfaSetup: (secret: string, code: string) => Promise<boolean>;
  mfaSetupRecoveryCodes: string[] | null;
  completeMfaSetupConfirm: () => void;

  // Global collections state
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  products: Product[];
  reviews: Review[];
  auditLogs: AuditLog[];
  abandonedCarts: AbandonedCart[];
  diagnosticsList: DiagnosticData[];
  leadsList: { email: string; phone: string; date: string }[];
  loyaltyOverrides: Record<string, { points: number; lastUpdated: string; reason?: string }>;
  operatorsList: any[];
  adviceArticles: any[];
  isDataLoading: boolean;
  setIsDataLoading: (loading: boolean) => void;

  // Actions
  loadAllData: () => Promise<void>;
  loadOrders: () => Promise<void>;
  loadProducts: () => Promise<void>;
  loadReviews: () => Promise<void>;
  loadAuditLogs: () => Promise<void>;
  loadAbandonedCarts: () => Promise<void>;
  loadDiagnostics: () => Promise<void>;
  loadLeads: () => Promise<void>;
  loadLoyaltyOverrides: () => Promise<void>;
  loadOperatorsList: () => Promise<void>;
  loadAdviceArticles: () => Promise<void>;
  logAdminAction: (action: string, details: string) => Promise<void>;

  // Advice Handlers
  handleCreateAdviceArticle: (article: any) => Promise<boolean>;
  handleUpdateAdviceArticle: (id: string, article: any) => Promise<boolean>;
  handleDeleteAdviceArticle: (id: string) => Promise<boolean>;

  // Coupon Handlers
  handleSaveCoupon: (couponForm: any) => Promise<boolean>;
  handleDeleteCoupon: (code: string) => Promise<boolean>;
  handleToggleCouponActive: (code: string) => Promise<boolean>;

  // Order Handlers
  handleUpdateOrderStatus: (orderId: string, newStatus: string) => Promise<void>;
  handleBulkUpdateOrderStatus: (status: string, selectedIds: string[]) => Promise<void>;
  handleDeleteOrder: (orderId: string) => Promise<void>;

  // Courier Handlers
  handleRegisterShipping: (shippingData: {
    orderId: string;
    courierName: 'yalidine' | 'cathedis';
    codAmount: number;
    customerName: string;
    phone: string;
    city: string;
    address: string;
  }) => Promise<any>;
  handleSyncCourierStatuses: () => Promise<void>;
  handleReconcileOrders: (reconciliations: any[]) => Promise<boolean>;

  // Loyalty Handlers
  handleAdjustPoints: (phone: string, name: string, currentPoints: number, adjustment: number, reason: string) => Promise<number | null>;
  handleSaveProductPoints: (productId: number, newPoints: number) => Promise<boolean>;
  handleBulkSavePoints: (points: number, productIds: number[]) => Promise<boolean>;

  // Banners Handlers
  handleSaveBanner: (index: number, bannerForm: HeroCardConfig) => Promise<boolean>;
  handleMoveBanner: (index: number, direction: 'up' | 'down') => Promise<boolean>;

  // Catalog Handlers
  handleSaveBulkProducts: (changedProducts: Product[]) => Promise<boolean>;
  handleCreateProduct: (productForm: Partial<Product>) => Promise<boolean>;
  handleRestock: (productId: number, newStock: number) => Promise<boolean>;
  handleImportProducts: (importedProducts: any[], updateExisting: boolean) => Promise<{ success: boolean; count: number; error?: string; message?: string }>;

  // Reviews Handlers
  handleUpdateReviewStatus: (id: string, status: string) => Promise<void>;
  handleBulkUpdateReviewStatus: (status: string, selectedIds: string[]) => Promise<void>;
  handleReplyReview: (reviewId: string, text: string) => Promise<boolean>;
  handleDeleteReview: (id: string) => Promise<void>;

  // FAQ Handlers
  handleAddFaq: (faqForm: { q_fr: string; a_fr: string; q_ar: string; a_ar: string }) => Promise<boolean>;
  handleDeleteFaq: (index: number) => Promise<boolean>;

  // Operator Handlers
  handleCreateOperator: (operatorForm: any) => Promise<boolean>;
  handleToggleOperatorStatus: (userId: string, currentStatus: boolean) => Promise<void>;

  // System Settings Handlers
  handleSaveGeneralSettings: (formSettings: any) => Promise<boolean>;
  handleSaveCourierSettings: (formSettings: any) => Promise<boolean>;
  handleSaveLoyaltySettings: (formSettings: any) => Promise<boolean>;
  handleSavePaymentSettings: (formSettings: any) => Promise<boolean>;

  // Notification Template Handlers
  handleSaveNotificationTemplates: (formSettings: any, notifTemplates: any) => Promise<boolean>;

  // Cart Recovery
  handleUpdateCartRecovery: (phone: string, status: 'not_contacted' | 'contacted' | 'recovered') => Promise<void>;

  // Shared UI configuration states
  adminTheme: 'light' | 'dark';
  toggleAdminTheme: () => void;

  // Computed / memoized stats
  dashboardStats: any;
  getDashboardStats: (range: 'today' | '7d' | '30d' | 'month' | 'all' | 'custom', customFrom?: string, customTo?: string) => any;
  analyticsData: any;
  crmCustomers: any;
  parsedLoyaltyLogs: any;
  diagnosticsStats: any;
  shippingStats: any;
  lowStockProducts: any;
  topProductsByRevenue: any;
  cartRecoveryStats: any;
  cartRecoveryStatus: Record<string, 'not_contacted' | 'contacted' | 'recovered'>;
}

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AdminThemeProvider>
      <AdminAuthProvider>
        <AdminDataProvider>
          <AdminOrdersProvider>
            <AdminCatalogProvider>
              <AdminReviewsProvider>
                <AdminLoyaltyProvider>
                  <AdminOperatorsProvider>
                    <AdminCartsProvider>
                      <AdminAdviceProvider>
                        {children}
                      </AdminAdviceProvider>
                    </AdminCartsProvider>
                  </AdminOperatorsProvider>
                </AdminLoyaltyProvider>
              </AdminReviewsProvider>
            </AdminCatalogProvider>
          </AdminOrdersProvider>
        </AdminDataProvider>
      </AdminAuthProvider>
    </AdminThemeProvider>
  );
};

export const useAdmin = (): AdminContextProps => {
  const theme = useAdminTheme();
  const auth = useAdminAuth();
  const data = useAdminData();
  const orders = useAdminOrders();
  const catalog = useAdminCatalog();
  const reviews = useAdminReviews();
  const loyalty = useAdminLoyalty();
  const operators = useAdminOperators();
  const carts = useAdminCarts();
  const advice = useAdminAdvice();

  return {
    // Theme
    adminTheme: theme.adminTheme,
    toggleAdminTheme: theme.toggleAdminTheme,

    // Auth
    currentUser: auth.currentUser,
    isAuthenticated: auth.isAuthenticated,
    authError: auth.authError,
    setAuthError: auth.setAuthError,
    handleLogin: auth.handleLogin,
    handleLogout: auth.handleLogout,
    requiresMfa: auth.requiresMfa,
    setRequiresMfa: auth.setRequiresMfa,
    handleVerifyMfa: auth.handleVerifyMfa,
    requiresMfaSetup: auth.requiresMfaSetup,
    setRequiresMfaSetup: auth.setRequiresMfaSetup,
    handleCompleteMfaSetup: auth.handleCompleteMfaSetup,
    mfaSetupRecoveryCodes: auth.mfaSetupRecoveryCodes,
    completeMfaSetupConfirm: auth.completeMfaSetupConfirm,

    // Data State
    orders: data.orders,
    setOrders: data.setOrders,
    products: data.products,
    reviews: data.reviews,
    auditLogs: data.auditLogs,
    abandonedCarts: data.abandonedCarts,
    diagnosticsList: data.diagnosticsList,
    leadsList: data.leadsList,
    loyaltyOverrides: data.loyaltyOverrides,
    operatorsList: data.operatorsList,
    adviceArticles: data.adviceArticles,
    isDataLoading: data.isDataLoading,
    setIsDataLoading: data.setIsDataLoading,
    cartRecoveryStatus: data.cartRecoveryStatus,

    // Data Loaders
    loadAllData: data.loadAllData,
    loadOrders: data.loadOrders,
    loadProducts: data.loadProducts,
    loadReviews: data.loadReviews,
    loadAuditLogs: data.loadAuditLogs,
    loadAbandonedCarts: data.loadAbandonedCarts,
    loadDiagnostics: data.loadDiagnostics,
    loadLeads: data.loadLeads,
    loadLoyaltyOverrides: data.loadLoyaltyOverrides,
    loadOperatorsList: data.loadOperatorsList,
    loadAdviceArticles: data.loadAdviceArticles,
    logAdminAction: data.logAdminAction,

    // Advice Handlers
    handleCreateAdviceArticle: advice.handleCreateAdviceArticle,
    handleUpdateAdviceArticle: advice.handleUpdateAdviceArticle,
    handleDeleteAdviceArticle: advice.handleDeleteAdviceArticle,

    // Orders Actions & Stats
    handleUpdateOrderStatus: orders.handleUpdateOrderStatus,
    handleBulkUpdateOrderStatus: orders.handleBulkUpdateOrderStatus,
    handleDeleteOrder: orders.handleDeleteOrder,
    handleRegisterShipping: orders.handleRegisterShipping,
    handleSyncCourierStatuses: orders.handleSyncCourierStatuses,
    handleReconcileOrders: orders.handleReconcileOrders,
    shippingStats: orders.shippingStats,

    // Catalog Actions
    handleSaveCoupon: catalog.handleSaveCoupon,
    handleDeleteCoupon: catalog.handleDeleteCoupon,
    handleToggleCouponActive: catalog.handleToggleCouponActive,
    handleSaveBanner: catalog.handleSaveBanner,
    handleMoveBanner: catalog.handleMoveBanner,
    handleSaveBulkProducts: catalog.handleSaveBulkProducts,
    handleCreateProduct: catalog.handleCreateProduct,
    handleRestock: catalog.handleRestock,
    handleImportProducts: catalog.handleImportProducts,
    handleAddFaq: catalog.handleAddFaq,
    handleDeleteFaq: catalog.handleDeleteFaq,
    handleSaveGeneralSettings: catalog.handleSaveGeneralSettings,
    handleSaveCourierSettings: catalog.handleSaveCourierSettings,
    handleSaveLoyaltySettings: catalog.handleSaveLoyaltySettings,
    handleSavePaymentSettings: catalog.handleSavePaymentSettings,
    handleSaveNotificationTemplates: catalog.handleSaveNotificationTemplates,

    // Reviews Actions
    handleUpdateReviewStatus: reviews.handleUpdateReviewStatus,
    handleBulkUpdateReviewStatus: reviews.handleBulkUpdateReviewStatus,
    handleReplyReview: reviews.handleReplyReview,
    handleDeleteReview: reviews.handleDeleteReview,

    // Loyalty Actions
    handleAdjustPoints: loyalty.handleAdjustPoints,
    handleSaveProductPoints: loyalty.handleSaveProductPoints,
    handleBulkSavePoints: loyalty.handleBulkSavePoints,

    // Operators Actions
    handleCreateOperator: operators.handleCreateOperator,
    handleToggleOperatorStatus: operators.handleToggleOperatorStatus,

    // Cart Recovery Actions & Stats
    handleUpdateCartRecovery: carts.handleUpdateCartRecovery,
    cartRecoveryStats: data.cartRecoveryStats,

    // Computed Analytics & Lists
    crmCustomers: data.crmCustomers,
    dashboardStats: data.dashboardStats,
    getDashboardStats: data.getDashboardStats,
    parsedLoyaltyLogs: data.parsedLoyaltyLogs,
    diagnosticsStats: data.diagnosticsStats,
    lowStockProducts: data.lowStockProducts,
    topProductsByRevenue: data.topProductsByRevenue,
    analyticsData: data.analyticsData
  };
};
