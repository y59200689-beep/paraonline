'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Product, PRODUCTS_DB } from '@/lib/data';
import { useAdminAuth } from './AdminAuthContext';
import { useSettings } from '@/context/SettingsContext';

export interface DiagnosticData {
  skinType: string;
  concern: string;
  sunExposure: string;
  date?: string;
  phone?: string;
  customerName?: string;
}

export interface OrderItem {
  id: number;
  title: string;
  quantity: number;
  price: number;
}

export interface Order {
  order_id: string;
  customer_name: string;
  phone_number: string;
  address: string;
  city: string;
  notes?: string;
  items: OrderItem[];
  subtotal: number;
  discount_amount: number;
  applied_coupon: string | null;
  gift_item: string | null;
  total: number;
  status: string;
  created_at?: string;
  date?: string;
  tracking_number?: string;
  tracking_link?: string;
  courier?: string;
  skin_diagnostic?: DiagnosticData | null;
  notified_at?: string;
  reconciled?: boolean;
  reconciled_at?: string;
  settled_amount?: number;
  courier_fee?: number;
  reconciliation_notes?: string;
  payment_status?: string;
}

export interface Review {
  id: string;
  productId: number;
  author: string;
  rating: number;
  comment: string;
  date: string;
  status: string;
  reply?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  date: string;
}

export interface AbandonedCart {
  name?: string;
  phone: string;
  items: any[];
  total: number;
  date: string;
  created_at?: string;
  clientProfileName?: string | null;
}

export interface AdminDataContextProps {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  reviews: Review[];
  setReviews: React.Dispatch<React.SetStateAction<Review[]>>;
  auditLogs: AuditLog[];
  abandonedCarts: AbandonedCart[];
  diagnosticsList: DiagnosticData[];
  leadsList: { email: string; phone: string; date: string }[];
  loyaltyOverrides: Record<string, { points: number; lastUpdated: string; reason?: string }>;
  operatorsList: any[];
  adviceArticles: any[];
  setAdviceArticles: React.Dispatch<React.SetStateAction<any[]>>;
  isDataLoading: boolean;
  setIsDataLoading: (loading: boolean) => void;
  cartRecoveryStatus: Record<string, 'not_contacted' | 'contacted' | 'recovered'>;
  setCartRecoveryStatus: React.Dispatch<React.SetStateAction<Record<string, 'not_contacted' | 'contacted' | 'recovered'>>>;

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

  // Computed Memos / Stats
  crmCustomers: any;
  dashboardStats: any;
  getDashboardStats: (range: 'today' | '7d' | '30d' | 'month' | 'all' | 'custom', customFrom?: string, customTo?: string) => any;
  parsedLoyaltyLogs: any;
  diagnosticsStats: any;
  lowStockProducts: any;
  topProductsByRevenue: any;
  cartRecoveryStats: any;
  analyticsData: (range: 'today' | '7d' | '30d' | 'month' | 'all' | 'custom', customFrom?: string, customTo?: string, sortCol?: 'date' | 'orders' | 'gross' | 'net' | 'avg', sortDir?: 'asc' | 'desc') => any;
}

const AdminDataContext = createContext<AdminDataContextProps | undefined>(undefined);

export const AdminDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isAuthenticated } = useAdminAuth();
  const { settings } = useSettings();

  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [abandonedCarts, setAbandonedCarts] = useState<AbandonedCart[]>([]);
  const [diagnosticsList, setDiagnosticsList] = useState<DiagnosticData[]>([]);
  const [leadsList, setLeadsList] = useState<{ email: string; phone: string; date: string }[]>([]);
  const [loyaltyOverrides, setLoyaltyOverrides] = useState<Record<string, { points: number; lastUpdated: string; reason?: string }>>({});
  const [operatorsList, setOperatorsList] = useState<any[]>([]);
  const [adviceArticles, setAdviceArticles] = useState<any[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [cartRecoveryStatus, setCartRecoveryStatus] = useState<Record<string, 'not_contacted' | 'contacted' | 'recovered'>>({});

  const syncRecoveryStatusMap = (carts: AbandonedCart[]) => {
    const statusMap: Record<string, 'not_contacted' | 'contacted' | 'recovered'> = {};
    carts.forEach((c) => {
      if (c.phone) {
        statusMap[c.phone] = (c as any).recoveryStatus || 'not_contacted';
      }
    });
    setCartRecoveryStatus(statusMap);
  };

  const loadOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      if (data.success && data.orders) {
        const parsed = data.orders.map((o: any) => ({
          order_id: o.order_id,
          customer_name: o.customer_name,
          phone_number: o.phone_number,
          address: o.address,
          city: o.city,
          items: o.items || [],
          subtotal: o.subtotal || 0,
          discount_amount: o.discount_amount || 0,
          applied_coupon: o.applied_coupon || null,
          gift_item: o.gift_item || null,
          total: o.total || 0,
          status: o.status || 'Pending',
          created_at: o.created_at || new Date().toISOString(),
          tracking_number: o.tracking_number || undefined,
          tracking_link: o.tracking_link || undefined,
          courier: o.courier || undefined,
          skin_diagnostic: o.skin_diagnostic || null,
          notified_at: o.notified_at || undefined,
          reconciled: o.reconciled || false,
          reconciled_at: o.reconciled_at || undefined,
          settled_amount: o.settled_amount || 0,
          courier_fee: o.courier_fee || 0,
          reconciliation_notes: o.reconciliation_notes || '',
          payment_status: o.payment_status || 'unpaid'
        }));
        setOrders(parsed);
      } else {
        setOrders([]);
      }
    } catch (e) {
      console.error("Failed to load orders:", e);
      setOrders([]);
    }
  };

  const loadProducts = async () => {
    try {
      const res = await fetch('/api/admin/products?limit=20000');
      const data = await res.json();
      if (data.success && data.products) {
        setProducts(data.products);
      } else {
        setProducts(PRODUCTS_DB);
      }
    } catch (e) {
      setProducts(PRODUCTS_DB);
    }
  };

  const loadReviews = async () => {
    try {
      const res = await fetch('/api/admin/reviews');
      const data = await res.json();
      if (data.success && data.reviews) {
        setReviews(data.reviews);
      } else {
        setReviews([]);
      }
    } catch (e) {}
  };

  const loadAuditLogs = async () => {
    try {
      const res = await fetch('/api/admin/audit-logs');
      const data = await res.json();
      if (data.success && data.logs) {
        setAuditLogs(data.logs);
      } else {
        setAuditLogs([]);
      }
    } catch (e) {}
  };

  const loadAbandonedCarts = async () => {
    try {
      const res = await fetch('/api/admin/abandoned-carts');
      const data = await res.json();
      if (data.success && data.carts) {
        setAbandonedCarts(data.carts);
        syncRecoveryStatusMap(data.carts);
      } else {
        setAbandonedCarts([]);
        syncRecoveryStatusMap([]);
      }
    } catch (e) {}
  };

  const loadDiagnostics = async () => {
    try {
      const res = await fetch('/api/diagnostics');
      const data = await res.json();
      if (data.success && data.diagnostics) {
        setDiagnosticsList(data.diagnostics);
      } else {
        setDiagnosticsList([]);
      }
    } catch (e) {
      console.error("Failed to load diagnostics:", e);
    }
  };

  const loadLeads = async () => {
    try {
      const res = await fetch('/api/leads');
      const data = await res.json();
      if (data.success && data.leads) {
        setLeadsList(data.leads);
      } else {
        setLeadsList([]);
      }
    } catch (e) {
      console.error("Failed to load leads:", e);
    }
  };

  const loadLoyaltyOverrides = async () => {
    try {
      const res = await fetch('/api/admin/loyalty');
      const data = await res.json();
      if (data.success && data.allOverrides) {
        setLoyaltyOverrides(data.allOverrides);
      } else {
        setLoyaltyOverrides({});
      }
    } catch (e) {
      console.error("Failed to load loyalty overrides:", e);
    }
  };

  const loadOperatorsList = useCallback(async () => {
    if (!currentUser || currentUser.role !== 'owner') return;
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success && data.users) {
        setOperatorsList(data.users);
      } else {
        setOperatorsList([]);
      }
    } catch (e) {
      console.error("Failed to load operators list:", e);
    }
  }, [currentUser]);

  const loadAdviceArticles = async () => {
    try {
      const res = await fetch('/api/admin/advice');
      const data = await res.json();
      if (data.success && data.articles) {
        setAdviceArticles(data.articles);
      } else {
        setAdviceArticles([]);
      }
    } catch (e) {
      console.error("Failed to load advice articles:", e);
      setAdviceArticles([]);
    }
  };

  const loadAllData = async () => {
    setIsDataLoading(true);
    try {
      await Promise.all([
        loadOrders(),
        loadProducts(),
        loadReviews(),
        loadAuditLogs(),
        loadAbandonedCarts(),
        loadDiagnostics(),
        loadLeads(),
        loadLoyaltyOverrides(),
        loadOperatorsList(),
        loadAdviceArticles()
      ]);
    } catch (e) {
      console.error("Error loading admin data:", e);
    } finally {
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && currentUser?.role === 'owner') {
      loadOperatorsList();
    }
  }, [isAuthenticated, currentUser, loadOperatorsList]);

  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const logAdminAction = async (action: string, details: string) => {
    try {
      const res = await fetch('/api/admin/audit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, details })
      });
      if (res.ok) {
        loadAuditLogs();
      }
    } catch (e) {
      console.error("Failed to write audit log:", e);
    }
  };

  // ── Memos / Computed Stats definitions ──
  const crmCustomers = useMemo(() => {
    const customersMap: Record<string, {
      phone: string;
      name: string;
      orders: Order[];
      totalSpend: number;
    }> = {};

    orders.forEach(o => {
      const phone = o.phone_number.trim();
      if (!customersMap[phone]) {
        customersMap[phone] = {
          phone,
          name: o.customer_name,
          orders: [],
          totalSpend: 0
        };
      }
      customersMap[phone].orders.push(o);
      if (o.status !== 'Cancelled') {
        customersMap[phone].totalSpend += o.total;
      }
      customersMap[phone].name = o.customer_name;
    });

    return Object.values(customersMap).sort((a, b) => b.totalSpend - a.totalSpend);
  }, [orders]);

  const getDashboardStats = useCallback((
    range: 'today' | '7d' | '30d' | 'month' | 'all' | 'custom',
    customFrom?: string,
    customTo?: string
  ) => {
    const now = new Date();
    let startDate: Date | null = null;
    let endDate: Date | null = null;

    if (range === 'today') {
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);
    } else if (range === '7d') {
      startDate = new Date(now.getTime() - 7 * 86400000);
      endDate = now;
    } else if (range === '30d') {
      startDate = new Date(now.getTime() - 30 * 86400000);
      endDate = now;
    } else if (range === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = now;
    } else if (range === 'custom' && customFrom) {
      startDate = new Date(customFrom);
      startDate.setHours(0, 0, 0, 0);
      if (customTo) {
        endDate = new Date(customTo);
        endDate.setHours(23, 59, 59, 999);
      } else {
        endDate = now;
      }
    } else {
      startDate = new Date(0);
      endDate = now;
    }

    const inRange = (dateStr: string | null | undefined, start: Date, end: Date) => {
      if (!dateStr) return false;
      const d = new Date(dateStr);
      return d >= start && d <= end;
    };

    const rangedOrders = orders.filter(o => inRange(o.created_at || o.date, startDate || new Date(0), endDate || now));
    const rangedAbandonedCarts = abandonedCarts.filter(c => inRange(c.created_at || c.date, startDate || new Date(0), endDate || now));

    const totalSales = rangedOrders.filter(o => o.status !== 'Cancelled').reduce((sum, o) => sum + o.total, 0);
    const ordersCount = rangedOrders.length;
    const avgOrderValue = ordersCount > 0 ? totalSales / ordersCount : 0;
    const abandonedCartsCount = rangedAbandonedCarts.length;
    const totalDiscounts = rangedOrders.reduce((sum, o) => sum + (o.discount_amount || 0), 0);
    const todaySales = orders
      .filter(o => o.status !== 'Cancelled' && new Date(o.created_at || o.date || Date.now()).toDateString() === now.toDateString())
      .reduce((sum, o) => sum + o.total, 0);
    const ordersToday = orders.filter(o => new Date(o.created_at || o.date || Date.now()).toDateString() === now.toDateString()).length;

    const citySales: Record<string, number> = {};
    rangedOrders.forEach(o => {
      if (o.status !== 'Cancelled') {
        citySales[o.city] = (citySales[o.city] || 0) + o.total;
      }
    });
    const topCities = Object.entries(citySales).sort((a, b) => b[1] - a[1]).slice(0, 5);

    const couponUsageStats: Record<string, { count: number; totalDiscount: number; revenue: number }> = {};
    rangedOrders.forEach(o => {
      if (o.applied_coupon) {
        const code = o.applied_coupon.toUpperCase();
        if (!couponUsageStats[code]) couponUsageStats[code] = { count: 0, totalDiscount: 0, revenue: 0 };
        couponUsageStats[code].count += 1;
        couponUsageStats[code].totalDiscount += o.discount_amount || 0;
        if (o.status !== 'Cancelled') {
          couponUsageStats[code].revenue += o.total || 0;
        }
      }
    });

    const statusFunnel: Record<string, number> = { Pending: 0, Confirmed: 0, Shipped: 0, Delivered: 0, Cancelled: 0 };
    rangedOrders.forEach(o => {
      const s = o.status || 'Pending';
      statusFunnel[s] = (statusFunnel[s] || 0) + 1;
    });

    const salesCurve: { date: string; amount: number; count: number }[] = [];
    if (range === 'today') {
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      for (let i = 0; i < 6; i++) {
        const slotHour = i * 4;
        const slotStart = new Date(startOfDay);
        slotStart.setHours(slotHour, 0, 0, 0);
        const slotEnd = new Date(startOfDay);
        slotEnd.setHours(slotHour + 3, 59, 59, 999);
        const label = `${String(slotHour).padStart(2, '0')}h`;
        const ordersForSlot = orders.filter(o => {
          if (o.status === 'Cancelled') return false;
          const od = new Date(o.created_at || o.date || Date.now());
          return od >= slotStart && od <= slotEnd;
        });
        const salesForSlot = ordersForSlot.reduce((sum, o) => sum + o.total, 0);
        salesCurve.push({ date: label, amount: salesForSlot, count: ordersForSlot.length });
      }
    } else {
      let numDays = 30;
      if (range === '7d') numDays = 7;
      else if (range === 'month') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        numDays = Math.ceil((now.getTime() - startOfMonth.getTime()) / 86400000) || 1;
      } else if (range === 'custom' && startDate && endDate) {
        numDays = Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000) || 1;
      }
      const curveStart = new Date(endDate || now);
      curveStart.setDate(curveStart.getDate() - (numDays - 1));
      for (let i = 0; i < numDays; i++) {
        const d = new Date(curveStart);
        d.setDate(curveStart.getDate() + i);
        const label = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
        const ordersForDay = orders.filter(o => {
          if (o.status === 'Cancelled') return false;
          const od = new Date(o.created_at || o.date || Date.now());
          return od.toDateString() === d.toDateString();
        });
        const salesForDay = ordersForDay.reduce((sum, o) => sum + o.total, 0);
        salesCurve.push({ date: label, amount: salesForDay, count: ordersForDay.length });
      }
    }

    const threshold = settings.lowStockThreshold !== undefined ? settings.lowStockThreshold : 5;
    const lowStockProductsList = products.filter(p => p.stock !== undefined && p.stock !== null && p.stock <= threshold);

    return {
      totalSales, ordersCount, avgOrderValue, abandonedCartsCount, totalDiscounts,
      todaySales, ordersToday,
      topCities, couponUsageStats, last7DaysSales: salesCurve, statusFunnel, lowStockProducts: lowStockProductsList
    };
  }, [orders, abandonedCarts, products, settings.lowStockThreshold]);

  const dashboardStats = useMemo(() => getDashboardStats('all'), [getDashboardStats]);

  const parsedLoyaltyLogs = useMemo(() => {
    return auditLogs
      .filter(log => log.action === "Ajustement Points Fidélité" || log.details.includes("Points Fidélité") || log.details.includes("points"))
      .map(log => {
        let clientName = "Client";
        let clientPhone = "—";
        let pointsChange = "—";
        let newBalance = "—";
        let reason = log.details;

        const match = log.details.match(/Solde client \((.+) - ([^\)]+)\) ajusté de ([+-]?\d+) points\. Nouveau Solde: (\d+) pts\. Raison: (.+)/);
        if (match) {
          clientName = match[1];
          clientPhone = match[2];
          pointsChange = match[3];
          newBalance = match[4] + " pts";
          reason = match[5];
        } else {
          const simpleChangeMatch = log.details.match(/ajusté de ([+-]?\d+)/);
          if (simpleChangeMatch) {
            pointsChange = simpleChangeMatch[1];
          }
        }

        return {
          id: log.id,
          date: log.date,
          clientName,
          clientPhone,
          pointsChange,
          newBalance,
          reason,
          operator: "Administrateur"
        };
      });
  }, [auditLogs]);

  const diagnosticsStats = useMemo(() => {
    const skinTypes: Record<string, number> = {};
    const concerns: Record<string, number> = {};
    const sunExposures: Record<string, number> = {};

    diagnosticsList.forEach(d => {
      skinTypes[d.skinType] = (skinTypes[d.skinType] || 0) + 1;
      concerns[d.concern] = (concerns[d.concern] || 0) + 1;
      sunExposures[d.sunExposure] = (sunExposures[d.sunExposure] || 0) + 1;
    });

    return { skinTypes, concerns, sunExposures };
  }, [diagnosticsList]);

  const lowStockProducts = useMemo(() => {
    const threshold = settings?.lowStockThreshold ?? 5;
    return products
      .filter(p => (p.stock ?? 0) <= threshold)
      .sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0));
  }, [products, settings?.lowStockThreshold]);

  const topProductsByRevenue = useMemo(() => {
    const revenueMap: Record<number, { title: string; revenue: number; qty: number; image: string }> = {};
    orders.filter(o => o.status !== 'Cancelled').forEach(o => {
      o.items.forEach(item => {
        if (!revenueMap[item.id]) revenueMap[item.id] = { title: item.title, revenue: 0, qty: 0, image: '' };
        revenueMap[item.id].revenue += item.price * item.quantity;
        revenueMap[item.id].qty += item.quantity;
      });
    });
    return Object.entries(revenueMap)
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 5);
  }, [orders]);

  const cartRecoveryStats = useMemo(() => {
    const total = abandonedCarts.length;
    const recovered = Object.values(cartRecoveryStatus).filter(s => s === 'recovered').length;
    const contacted = Object.values(cartRecoveryStatus).filter(s => s === 'contacted').length;
    const totalAbandonedRevenue = abandonedCarts.reduce((sum, c) => sum + (c.total || 0), 0);
    const recoveredRevenue = abandonedCarts
      .filter(c => cartRecoveryStatus[c.phone] === 'recovered')
      .reduce((sum, c) => sum + (c.total || 0), 0);
    return { total, recovered, contacted, totalAbandonedRevenue, recoveredRevenue, rate: total > 0 ? ((recovered / total) * 100).toFixed(0) : '0' };
  }, [abandonedCarts, cartRecoveryStatus]);

  const analyticsData = useCallback((
    range: 'today' | '7d' | '30d' | 'month' | 'all' | 'custom',
    customFrom?: string,
    customTo?: string,
    sortCol: 'date' | 'orders' | 'gross' | 'net' | 'avg' = 'gross',
    sortDir: 'asc' | 'desc' = 'desc'
  ) => {
    const now = new Date();
    let startDate: Date | null = null;
    let endDate: Date | null = null;
    let prevStartDate: Date | null = null;
    let prevEndDate: Date | null = null;

    if (range === 'today') {
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);
      prevStartDate = new Date(startDate.getTime() - 86400000);
      prevEndDate = new Date(endDate.getTime() - 86400000);
    } else if (range === '7d') {
      startDate = new Date(now.getTime() - 7 * 86400000);
      endDate = now;
      prevStartDate = new Date(now.getTime() - 14 * 86400000);
      prevEndDate = startDate;
    } else if (range === '30d') {
      startDate = new Date(now.getTime() - 30 * 86400000);
      endDate = now;
      prevStartDate = new Date(now.getTime() - 60 * 86400000);
      prevEndDate = startDate;
    } else if (range === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = now;
      prevStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      prevEndDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (range === 'custom' && customFrom) {
      startDate = new Date(customFrom);
      startDate.setHours(0, 0, 0, 0);
      if (customTo) {
        endDate = new Date(customTo);
        endDate.setHours(23, 59, 59, 999);
      } else {
        endDate = now;
      }
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      prevStartDate = new Date(startDate.getTime() - diffTime);
      prevEndDate = startDate;
    } else {
      startDate = new Date(0);
      endDate = now;
      prevStartDate = new Date(0);
      prevEndDate = new Date(0);
    }

    const inRange = (o: Order, start: Date, end: Date) => {
      const d = new Date(o.created_at || o.date || Date.now());
      return d >= start && d <= end;
    };

    const currOrders = orders.filter(o => inRange(o, startDate || new Date(0), endDate || now));
    const prevOrders = orders.filter(o => {
      if (!prevStartDate || !prevEndDate) return false;
      return inRange(o, prevStartDate, prevEndDate);
    });

    const calcMetrics = (arr: Order[]) => {
      const gross = arr.reduce((sum, o) => sum + o.total, 0);
      const cancelled = arr.filter(o => o.status.toLowerCase().includes('annul') || o.status === 'Cancelled');
      const cancelledTotal = cancelled.reduce((sum, o) => sum + o.total, 0);
      const net = gross - cancelledTotal;
      const count = arr.length;
      const avg = count ? gross / count : 0;
      const couponsUsed = arr.filter(o => o.applied_coupon).length;
      const discountVal = arr.reduce((sum, o) => sum + (o.discount_amount || 0), 0);
      
      const activeOrders = arr.filter(o => !o.status.toLowerCase().includes('annul') && o.status !== 'Cancelled');
      const netCogs = activeOrders.reduce((sum, o) => {
        const orderCost = (o.items || []).reduce((itemSum, item) => {
          const matched = products.find(p => p.id === item.id);
          const cost = matched?.buyingCost || 0;
          return itemSum + (cost * item.quantity);
        }, 0);
        return sum + orderCost;
      }, 0);
      const netMargin = net - netCogs;

      const uniqueCustomers = new Set(activeOrders.map(o => o.phone_number || o.customer_name));
      const avgLtv = uniqueCustomers.size ? net / uniqueCustomers.size : 0;

      return { 
        gross, net, avg, count, 
        cancelledCount: cancelled.length, cancelledTotal, 
        couponsUsed, discountVal, netMargin, avgLtv 
      };
    };

    const currMetrics = calcMetrics(currOrders);
    const prevMetrics = calcMetrics(prevOrders);

    const calcPct = (curr: number, prev: number) => {
      if (!prev) return curr ? 100 : null;
      return Math.round(((curr - prev) / prev) * 100);
    };

    const pct = {
      gross: calcPct(currMetrics.gross, prevMetrics.gross),
      net: calcPct(currMetrics.net, prevMetrics.net),
      count: calcPct(currMetrics.count, prevMetrics.count),
      avg: calcPct(currMetrics.avg, prevMetrics.avg),
      cancelledCount: calcPct(currMetrics.cancelledCount, prevMetrics.cancelledCount),
      couponsUsed: calcPct(currMetrics.couponsUsed, prevMetrics.couponsUsed),
      netMargin: calcPct(currMetrics.netMargin, prevMetrics.netMargin),
      avgLtv: calcPct(currMetrics.avgLtv, prevMetrics.avgLtv)
    };

    const dayMap: Record<string, { date: string; orders: number; gross: number; net: number; avg: number }> = {};
    currOrders.forEach(o => {
      const day = new Date(o.created_at || o.date || Date.now()).toLocaleDateString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit' });
      if (!dayMap[day]) dayMap[day] = { date: day, orders: 0, gross: 0, net: 0, avg: 0 };
      dayMap[day].orders += 1;
      dayMap[day].gross += o.total;
      if (o.status !== 'Cancelled' && !o.status.toLowerCase().includes('annul')) {
        dayMap[day].net += o.total;
      }
    });

    Object.keys(dayMap).forEach(d => {
      dayMap[d].avg = dayMap[d].orders ? dayMap[d].gross / dayMap[d].orders : 0;
    });

    const sortedDailyRows = Object.values(dayMap).sort((a, b) => {
      let valA: any = a[sortCol];
      let valB: any = b[sortCol];
      
      if (sortCol === 'date') {
        const [dA, mA, yA] = a.date.split('/');
        const [dB, mB, yB] = b.date.split('/');
        valA = new Date(`${yA}-${mA}-${dA}`).getTime();
        valB = new Date(`${yB}-${mB}-${dB}`).getTime();
      }

      if (sortDir === 'asc') return valA > valB ? 1 : -1;
      return valA < valB ? 1 : -1;
    });

    let numDays = range === '7d' ? 7 : range === '30d' ? 30 : range === 'month' ? now.getDate() : 30;
    if (range === 'custom' && startDate) {
      const diff = Math.abs(endDate.getTime() - startDate.getTime());
      numDays = Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
    }

    const chartData: { date: string; amount: number; prevAmount: number; count: number; prevCount: number }[] = [];
    const curveStart = (range === 'custom' && startDate) ? new Date(startDate) : (() => { const d = new Date(); d.setDate(d.getDate() - (numDays - 1)); return d; })();

    for (let i = 0; i < numDays; i++) {
      const d = new Date(curveStart);
      d.setDate(curveStart.getDate() + i);
      const label = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

      const dayOrders = currOrders.filter(o => {
        if (o.status === 'Cancelled' || o.status.toLowerCase().includes('annul')) return false;
        return new Date(o.created_at || o.date || Date.now()).toDateString() === d.toDateString();
      });
      const dayAmount = dayOrders.reduce((sum, o) => sum + o.total, 0);

      let prevDayAmount = 0;
      let prevDayCount = 0;
      if (prevStartDate) {
        const pd = new Date(d.getTime() - (numDays * 24 * 60 * 60 * 1000));
        const prevDayOrders = prevOrders.filter(o => {
          if (o.status === 'Cancelled' || o.status.toLowerCase().includes('annul')) return false;
          return new Date(o.created_at || o.date || Date.now()).toDateString() === pd.toDateString();
        });
        prevDayAmount = prevDayOrders.reduce((sum, o) => sum + o.total, 0);
        prevDayCount = prevDayOrders.length;
      }

      chartData.push({
        date: label,
        amount: dayAmount,
        prevAmount: prevDayAmount,
        count: dayOrders.length,
        prevCount: prevDayCount
      });
    }

    const productMap: Record<string, { name: string; revenue: number; qty: number }> = {};
    currOrders.forEach(o => {
      if (o.status !== 'Cancelled' && !o.status.toLowerCase().includes('annul')) {
        (o.items || []).forEach(item => {
          const key = String(item.id);
          if (!productMap[key]) productMap[key] = { name: item.title, revenue: 0, qty: 0 };
          productMap[key].revenue += item.price * item.quantity;
          productMap[key].qty += item.quantity;
        });
      }
    });
    const topProducts = Object.values(productMap).sort((a, b) => b.revenue - a.revenue).slice(0, 10);

    const cityMap: Record<string, { count: number; revenue: number }> = {};
    currOrders.forEach(o => {
      if (o.status !== 'Cancelled' && !o.status.toLowerCase().includes('annul')) {
        const city = o.city || 'Inconnu';
        if (!cityMap[city]) cityMap[city] = { count: 0, revenue: 0 };
        cityMap[city].count += 1;
        cityMap[city].revenue += o.total;
      }
    });
    const cityRows = Object.entries(cityMap)
      .map(([city, v]) => ({ city, ...v }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return {
      currMetrics,
      prevMetrics,
      pct,
      sortedDailyRows,
      chartData,
      topProducts,
      cityRows,
      numDays
    };
  }, [orders, products]);

  return (
    <AdminDataContext.Provider value={{
      orders,
      setOrders,
      products,
      setProducts,
      reviews,
      setReviews,
      auditLogs,
      abandonedCarts,
      diagnosticsList,
      leadsList,
      loyaltyOverrides,
      operatorsList,
      adviceArticles,
      setAdviceArticles,
      isDataLoading,
      setIsDataLoading,
      cartRecoveryStatus,
      setCartRecoveryStatus,

      loadAllData,
      loadOrders,
      loadProducts,
      loadReviews,
      loadAuditLogs,
      loadAbandonedCarts,
      loadDiagnostics,
      loadLeads,
      loadLoyaltyOverrides,
      loadOperatorsList,
      loadAdviceArticles,
      logAdminAction,

      // Computed Memos
      crmCustomers,
      dashboardStats,
      getDashboardStats,
      parsedLoyaltyLogs,
      diagnosticsStats,
      lowStockProducts,
      topProductsByRevenue,
      cartRecoveryStats,
      analyticsData
    }}>
      {children}
    </AdminDataContext.Provider>
  );
};

export const useAdminData = () => {
  const context = useContext(AdminDataContext);
  if (!context) {
    throw new Error('useAdminData must be used within an AdminDataProvider');
  }
  return context;
};
