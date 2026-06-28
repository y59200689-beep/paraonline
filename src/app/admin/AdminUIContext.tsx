'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export interface AdminUIContextProps {
  // Navigation / Tabs
  activeTab: 'dashboard' | 'analytics' | 'orders' | 'catalog' | 'crm' | 'reviews' | 'settings' | 'loyalty' | 'branding' | 'advice' | 'snippets' | 'cron' | 'audit-logs' | 'coupons';
  setActiveTab: (tab: 'dashboard' | 'analytics' | 'orders' | 'catalog' | 'crm' | 'reviews' | 'settings' | 'loyalty' | 'branding' | 'advice' | 'snippets' | 'cron' | 'audit-logs' | 'coupons') => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  isMobileDrawerOpen: boolean;
  setIsMobileDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isSearchOpen: boolean;
  setIsSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;

  // Sub-tabs syncing
  ordersSubTab: 'list' | 'abandoned' | 'shipping' | 'reconciliation';
  setOrdersSubTab: React.Dispatch<React.SetStateAction<'list' | 'abandoned' | 'shipping' | 'reconciliation'>>;
  crmSubTab: 'clients' | 'diagnostics' | 'leads' | 'rules' | 'rfm' | 'reminders';
  setCrmSubTab: React.Dispatch<React.SetStateAction<'clients' | 'diagnostics' | 'leads' | 'rules' | 'rfm' | 'reminders'>>;
  loyaltySubTab: 'members' | 'product_points' | 'bulk_points' | 'logs';
  setLoyaltySubTab: React.Dispatch<React.SetStateAction<'members' | 'product_points' | 'bulk_points' | 'logs'>>;
  activeSettingsSubTab: 'general' | 'banners' | 'coupons' | 'shipping' | 'loyalty' | 'faq' | 'logs' | 'notifications' | 'operators' | 'payment' | 'security' | 'gifts' | 'delivery' | 'homepage';
  setActiveSettingsSubTab: React.Dispatch<React.SetStateAction<'general' | 'banners' | 'coupons' | 'shipping' | 'loyalty' | 'faq' | 'logs' | 'notifications' | 'operators' | 'payment' | 'security' | 'gifts' | 'delivery' | 'homepage'>>;

  // Modals & Forms
  isAddingCoupon: boolean;
  setIsAddingCoupon: React.Dispatch<React.SetStateAction<boolean>>;
  isNewProductModalOpen: boolean;
  setIsNewProductModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedOrder: any;
  setSelectedOrder: React.Dispatch<React.SetStateAction<any>>;
  productForm: any;
  setProductForm: React.Dispatch<React.SetStateAction<any>>;

  // Shared Filters
  analyticsRange: 'today' | '7d' | '30d' | 'month' | 'all' | 'custom';
  setAnalyticsRange: React.Dispatch<React.SetStateAction<'today' | '7d' | '30d' | 'month' | 'all' | 'custom'>>;
  customDateFrom: string;
  setCustomDateFrom: React.Dispatch<React.SetStateAction<string>>;
  customDateTo: string;
  setCustomDateTo: React.Dispatch<React.SetStateAction<string>>;
  analyticsSortCol: 'date' | 'orders' | 'gross' | 'net' | 'avg';
  setAnalyticsSortCol: React.Dispatch<React.SetStateAction<'date' | 'orders' | 'gross' | 'net' | 'avg'>>;
  analyticsSortDir: 'asc' | 'desc';
  setAnalyticsSortDir: React.Dispatch<React.SetStateAction<'asc' | 'desc'>>;
  analyticsChartHoverIdx: number | null;
  setAnalyticsChartHoverIdx: React.Dispatch<React.SetStateAction<number | null>>;
  catalogStockFilter: boolean;
  setCatalogStockFilter: React.Dispatch<React.SetStateAction<boolean>>;
}

const AdminUIContext = createContext<AdminUIContextProps | undefined>(undefined);

export const AdminUIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();

  // Determine activeTab based on current pathname
  const getTabFromPathname = (path: string): any => {
    const parts = path.split('/');
    const lastPart = parts[parts.length - 1];
    if (lastPart === 'admin' || !lastPart) return 'dashboard';
    return lastPart;
  };

  const [activeTab, setActiveTabState] = useState<any>('dashboard');

  useEffect(() => {
    setActiveTabState(getTabFromPathname(pathname));
  }, [pathname]);

  const setActiveTab = (tab: 'dashboard' | 'analytics' | 'orders' | 'catalog' | 'crm' | 'reviews' | 'settings' | 'loyalty' | 'branding' | 'advice' | 'snippets' | 'cron' | 'audit-logs' | 'coupons') => {
    if (tab === 'dashboard') {
      router.push('/admin');
    } else {
      router.push(`/admin/${tab}`);
    }
  };

  // Other states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [ordersSubTab, setOrdersSubTab] = useState<'list' | 'abandoned' | 'shipping' | 'reconciliation'>('list');
  const [crmSubTab, setCrmSubTab] = useState<'clients' | 'diagnostics' | 'leads' | 'rules' | 'rfm' | 'reminders'>('clients');
  const [loyaltySubTab, setLoyaltySubTab] = useState<'members' | 'product_points' | 'bulk_points' | 'logs'>('members');
  const [activeSettingsSubTab, setActiveSettingsSubTab] = useState<any>('general');

  // Restore sub-tab states from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedOrdersTab = localStorage.getItem('admin_orders_subtab');
      if (savedOrdersTab) setOrdersSubTab(savedOrdersTab as any);

      const savedCrmTab = localStorage.getItem('admin_crm_subtab');
      if (savedCrmTab) setCrmSubTab(savedCrmTab as any);

      const savedLoyaltyTab = localStorage.getItem('admin_loyalty_subtab');
      if (savedLoyaltyTab) setLoyaltySubTab(savedLoyaltyTab as any);

      const savedSettingsTab = localStorage.getItem('admin_settings_subtab');
      if (savedSettingsTab) setActiveSettingsSubTab(savedSettingsTab as any);
    }
  }, []);

  // Prefetch all admin sub-pages on mount for near-instant transitions
  useEffect(() => {
    const adminTabs = [
      'analytics',
      'orders',
      'catalog',
      'crm',
      'reviews',
      'settings',
      'loyalty',
      'branding',
      'advice',
      'snippets',
      'cron',
      'audit-logs',
      'coupons'
    ];
    router.prefetch('/admin');
    adminTabs.forEach(tab => {
      router.prefetch(`/admin/${tab}`);
    });
  }, [router]);

  // Persist sub-tab states to localStorage when they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_orders_subtab', ordersSubTab);
    }
  }, [ordersSubTab]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_crm_subtab', crmSubTab);
    }
  }, [crmSubTab]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_loyalty_subtab', loyaltySubTab);
    }
  }, [loyaltySubTab]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_settings_subtab', activeSettingsSubTab);
    }
  }, [activeSettingsSubTab]);

  const [isAddingCoupon, setIsAddingCoupon] = useState(false);
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [productForm, setProductForm] = useState<any>({
    title: '', vendor: '', price: 0, comparePrice: 0, category: 'visage', tags: [], stock: 100, description: '', ingredients: '', usage: '', image: ''
  });

  const [analyticsRange, setAnalyticsRange] = useState<'today' | '7d' | '30d' | 'month' | 'all' | 'custom'>('today');
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');
  const [analyticsSortCol, setAnalyticsSortCol] = useState<'date' | 'orders' | 'gross' | 'net' | 'avg'>('date');
  const [analyticsSortDir, setAnalyticsSortDir] = useState<'asc' | 'desc'>('desc');
  const [analyticsChartHoverIdx, setAnalyticsChartHoverIdx] = useState<number | null>(null);
  const [catalogStockFilter, setCatalogStockFilter] = useState(false);

  return (
    <AdminUIContext.Provider
      value={{
        activeTab,
        setActiveTab,
        sidebarCollapsed,
        setSidebarCollapsed,
        isMobileDrawerOpen,
        setIsMobileDrawerOpen,
        isSearchOpen,
        setIsSearchOpen,
        ordersSubTab,
        setOrdersSubTab,
        crmSubTab,
        setCrmSubTab,
        loyaltySubTab,
        setLoyaltySubTab,
        activeSettingsSubTab,
        setActiveSettingsSubTab,
        isAddingCoupon,
        setIsAddingCoupon,
        isNewProductModalOpen,
        setIsNewProductModalOpen,
        selectedOrder,
        setSelectedOrder,
        productForm,
        setProductForm,
        analyticsRange,
        setAnalyticsRange,
        customDateFrom,
        setCustomDateFrom,
        customDateTo,
        setCustomDateTo,
        analyticsSortCol,
        setAnalyticsSortCol,
        analyticsSortDir,
        setAnalyticsSortDir,
        analyticsChartHoverIdx,
        setAnalyticsChartHoverIdx,
        catalogStockFilter,
        setCatalogStockFilter,
      }}
    >
      {children}
    </AdminUIContext.Provider>
  );
};

export const useAdminUI = () => {
  const context = useContext(AdminUIContext);
  if (!context) {
    throw new Error('useAdminUI must be used within an AdminUIProvider');
  }
  return context;
};
