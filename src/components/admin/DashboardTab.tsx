'use client';

import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useAdmin, AbandonedCart } from '@/context/AdminContext';
import { useSettings } from '@/context/SettingsContext';
import {
  ShoppingBag,
  DollarSign,
  TrendingUp,
  ClipboardList,
  BarChart2,
  ChevronRight,
  MessageSquare,
  Check,
  X,
  Clock
} from 'lucide-react';
import { StatusBadge } from '@/components/admin/ui';

// ── Local bento card header ────────────────────────────────────────────────────
function BentoCardHeader({ eyebrow, title, icon: Icon, action, theme }: {
  eyebrow: string;
  title: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  action?: React.ReactNode;
  theme: 'light' | 'dark';
}) {
  return (
    <div className={`flex ${action ? 'justify-between' : 'items-center'} items-center gap-3 mb-6`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl border ${
          theme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-slate-900 border-slate-800 text-slate-400'
        }`}>
          <Icon className="w-4 h-4" strokeWidth={1.5} />
        </div>
        <div>
          <span
            className="block leading-none"
            style={{ fontSize: 'var(--admin-text-2xs)', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--admin-text-faint)' }}
          >
            {eyebrow}
          </span>
          <h3
            className="leading-none mt-1.5 font-semibold tracking-tight"
            style={{ fontSize: 'var(--admin-text-sm)', color: 'var(--admin-text-primary)' }}
          >
            {title}
          </h3>
        </div>
      </div>
      {action}
    </div>
  );
}

interface DashboardTabProps {
  setActiveTab: (tab: 'dashboard' | 'analytics' | 'orders' | 'catalog' | 'crm' | 'reviews' | 'settings' | 'loyalty') => void;
  setCatalogStockFilter: (filter: boolean) => void;
  setActiveSettingsSubTab: (sub: 'general' | 'banners' | 'coupons' | 'shipping' | 'loyalty' | 'faq' | 'logs' | 'notifications' | 'operators') => void;
  analyticsRange: 'today' | '7d' | '30d' | 'month' | 'all' | 'custom';
  setAnalyticsRange: (range: 'today' | '7d' | '30d' | 'month' | 'all' | 'custom') => void;
  customDateFrom: string;
  setCustomDateFrom: (date: string) => void;
  customDateTo: string;
  setCustomDateTo: (date: string) => void;
}

// Sparkline/Microbars rendering component with premium SVG wave curve
interface KpiCardProps {
  label: string;
  raw: number;
  suffix: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  color: string;
  bg: string;
  theme?: 'light' | 'dark';
  isWide?: boolean;
  isMobileWide?: boolean;
  sparklineData?: number[];
}

function KpiCard({ label, raw, suffix, icon: Icon, color, bg, theme, isWide, isMobileWide, sparklineData }: KpiCardProps) {
  // Count-up kinetic effect
  const [value, setValue] = React.useState(0);
  React.useEffect(() => {
    let start = 0;
    const end = Math.round(raw);
    if (start === end) {
      setValue(end);
      return;
    }
    
    const duration = 900;
    const stepTime = 15;
    const increment = Math.ceil(end / (duration / stepTime));
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        start = end;
        clearInterval(timer);
      }
      setValue(start);
    }, stepTime);
    
    return () => clearInterval(timer);
  }, [raw]);

  let iconColors = {
    text: 'text-emerald-500',
    bg: 'bg-emerald-500/10 border-emerald-500/20'
  };
  if (color.includes('blue')) {
    iconColors = { text: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/20' };
  } else if (color.includes('violet')) {
    iconColors = { text: 'text-violet-500', bg: 'bg-violet-500/10 border-violet-500/20' };
  } else if (color.includes('rose')) {
    iconColors = { text: 'text-rose-500', bg: 'bg-rose-500/10 border-rose-500/20' };
  }

  const renderMicroTrend = () => {
    if (!sparklineData || sparklineData.length < 2) return null;
    const points = sparklineData.slice(-7); // Last 7 data points
    const max = Math.max(...points, 1);
    const min = Math.min(...points, 0);
    const range = max - min;
    
    const width = 76;
    const height = 30;
    const padding = 2;
    const pts = points.map((val, idx) => {
      const x = padding + (idx / (points.length - 1)) * (width - padding * 2);
      const y = padding + (height - padding * 2) - ((val - min) / (range || 1)) * (height - padding * 2);
      return `${x},${y}`;
    });
    
    const lineD = `M ${pts.join(' L ')}`;
    const areaD = `${lineD} L ${width - padding},${height} L ${padding},${height} Z`;
    
    let strokeColor = '#10b981';
    let gradStart = '#10b981';
    if (color.includes('blue')) {
      strokeColor = '#3b82f6';
      gradStart = '#3b82f6';
    } else if (color.includes('violet')) {
      strokeColor = '#8b5cf6';
      gradStart = '#8b5cf6';
    } else if (color.includes('rose')) {
      strokeColor = '#f43f5e';
      gradStart = '#f43f5e';
    }

    const gradId = `sparklineGrad-${label.replace(/\s+/g, '')}`;

    return (
      <div className="w-20 h-8 shrink-0 transition-opacity duration-300 group-hover:opacity-100 opacity-70">
        <svg width={width} height={height} className="overflow-visible">
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={gradStart} stopOpacity="0.25" />
              <stop offset="100%" stopColor={gradStart} stopOpacity="0.00" />
            </linearGradient>
          </defs>
          <path d={areaD} fill={`url(#${gradId})`} />
          <path d={lineD} fill="none" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          {pts.length > 0 && (() => {
            const lastPt = pts[pts.length - 1].split(',');
            return (
              <circle cx={lastPt[0]} cy={lastPt[1]} r="2" fill={strokeColor} className="animate-pulse" />
            );
          })()}
        </svg>
      </div>
    );
  };

  return (
    <div className={`rounded-[32px] p-1 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-2xl ${
      theme === 'light' 
        ? 'bg-slate-200/50 border border-slate-200/60 shadow-[0_4px_12px_-2px_rgba(15,30,54,0.02)] hover:border-slate-300' 
        : 'bg-white/5 border border-white/10 hover:border-white/15'
    } ${
      isWide ? 'col-span-2 lg:col-span-2' : isMobileWide ? 'col-span-2 lg:col-span-1' : ''
    }`}>
      <div className={`rounded-[calc(32px-4px)] p-6 flex flex-col justify-between h-36 transition-all duration-300 ${
        theme === 'light'
          ? 'bg-white text-slate-800 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]'
          : 'bg-slate-950/80 backdrop-blur-md text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'
      }`}>
        <div className="flex items-center justify-between w-full">
          <span
            className="block leading-none"
            style={{ fontSize: 'var(--admin-text-2xs)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--admin-text-muted)' }}
          >
            {label}
          </span>
          <div className={`p-2 rounded-xl border ${iconColors.bg} ${iconColors.text} transition duration-300`}>
            <Icon className="w-4 h-4" strokeWidth={1.5} />
          </div>
        </div>
        
        <div className="flex items-end justify-between w-full mt-2">
          <h3
            className="font-bold tracking-tight leading-none"
            style={{ fontSize: 'var(--admin-text-2xl)', fontVariantNumeric: 'tabular-nums', color: 'var(--admin-text-primary)' }}
          >
            {Math.round(value).toLocaleString('fr-FR')}
            {suffix && (
              <span className="font-semibold ml-1.5 opacity-60" style={{ fontSize: 'var(--admin-text-xs)' }}>
                {suffix.trim()}
              </span>
            )}
          </h3>
          {renderMicroTrend()}
        </div>
      </div>
    </div>
  );
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  setActiveTab,
  setCatalogStockFilter,
  setActiveSettingsSubTab,
  analyticsRange,
  setAnalyticsRange,
  customDateFrom,
  setCustomDateFrom,
  customDateTo,
  setCustomDateTo
}) => {
  const {
    orders,
    getDashboardStats,
    topProductsByRevenue,
    cartRecoveryStats,
    cartRecoveryStatus,
    abandonedCarts,
    auditLogs,
    adminTheme,
    handleUpdateCartRecovery,
    products
  } = useAdmin();
  const { settings } = useSettings();

  const dashboardStats = React.useMemo(() => {
    return getDashboardStats(analyticsRange, customDateFrom, customDateTo);
  }, [getDashboardStats, analyticsRange, customDateFrom, customDateTo]);

  const topProductsByRevenueRanged = React.useMemo(() => {
    const now = new Date();
    let startDate: Date | null = null;
    let endDate: Date | null = null;

    if (analyticsRange === 'today') {
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);
    } else if (analyticsRange === '7d') {
      startDate = new Date(now.getTime() - 7 * 86400000);
      endDate = now;
    } else if (analyticsRange === '30d') {
      startDate = new Date(now.getTime() - 30 * 86400000);
      endDate = now;
    } else if (analyticsRange === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = now;
    } else if (analyticsRange === 'custom' && customDateFrom) {
      startDate = new Date(customDateFrom);
      startDate.setHours(0, 0, 0, 0);
      if (customDateTo) {
        endDate = new Date(customDateTo);
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

    const rangedOrders = (orders || []).filter(o => 
      inRange(o.created_at || o.date, startDate || new Date(0), endDate || now)
    );

    const revenueMap: Record<number, { title: string; revenue: number; qty: number; image: string }> = {};
    
    rangedOrders.filter(o => o.status !== 'Cancelled').forEach(o => {
      o.items.forEach(item => {
        if (!revenueMap[item.id]) {
          revenueMap[item.id] = { title: item.title, revenue: 0, qty: 0, image: '' };
        }
        revenueMap[item.id].revenue += item.price * item.quantity;
        revenueMap[item.id].qty += item.quantity;
      });
    });

    return Object.entries(revenueMap)
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 5);
  }, [orders, analyticsRange, customDateFrom, customDateTo]);

  const getTodayLabel = () => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }).replace('.', '');
    const parts = formattedDate.split(' ');
    if (parts.length === 2) {
      parts[1] = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
      return `Aujourd'hui (${parts.join(' ')})`;
    }
    return `Aujourd'hui (${formattedDate})`;
  };
  const [chartHoverIdx, setChartHoverIdx] = useState<number | null>(null);
  const [selectedAbandonedCart, setSelectedAbandonedCart] = useState<AbandonedCart | null>(null);

  const buildCartRecoveryLink = (cart: AbandonedCart, lang: 'Fr' | 'Ar' = 'Fr') => {
    const templates = settings?.notificationTemplates;
    if (!templates) return '#';
    const key = lang === 'Ar' ? 'recoveryAr' : 'recoveryFr';
    let msg = (templates[key] || '') as string;
    
    const itemsStr = cart.items?.map((i: any) => i.title || i.product?.title || 'Produit').join(', ') || 'vos produits';
    const discountCode = (settings?.coupons?.[0]?.code) || 'BEAUTY10';
    
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const recoverParams = cart.items?.map((i: any) => `${i.id || i.product?.id || ''}:${i.quantity || 1}`).filter(Boolean).join(',') || '';
    const recoveryUrl = recoverParams ? `${origin}/checkout?recover=${encodeURIComponent(recoverParams)}` : '';
    
    msg = msg
      .replace(/{customer_name}/g, cart.name || 'Cher(e) client(e)')
      .replace(/{cart_items}/g, itemsStr)
      .replace(/{cart_total}/g, String(cart.total || 0))
      .replace(/{discount_code}/g, discountCode)
      .replace(/{recovery_link}/g, recoveryUrl);
      
    const phone = (cart.phone || '').replace(/\D/g, '');
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="space-y-8 admin-tab-enter relative min-h-screen pb-12">
      {/* Premium Background Mesh Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 blur-[120px] animate-pulse" />
        <div className="absolute top-[20%] left-[-15%] w-[45%] h-[45%] rounded-full bg-teal-500/10 dark:bg-teal-500/5 blur-[120px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[35%] h-[35%] rounded-full bg-indigo-500/5 dark:bg-indigo-500/3 blur-[100px]" />
      </div>


      {/* Date range selector + Custom Date Range */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className={`flex items-center gap-1 border rounded-2xl p-1 flex-wrap shadow-sm transition-colors duration-200 ${
            adminTheme === 'light'
              ? 'bg-slate-100/80 border-slate-200/60'
              : 'bg-slate-950 border-slate-900'
          }`}>
            {(['today', '7d', '30d', 'month', 'all', 'custom'] as const).map(range => (
              <button
                key={range}
                onClick={() => setAnalyticsRange(range)}
                className={`px-3.5 py-1.5 rounded-xl font-semibold uppercase tracking-widest transition-all duration-200 border-0 cursor-pointer ${
                  analyticsRange === range
                    ? (adminTheme === 'light'
                        ? 'bg-white text-slate-800 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)] font-bold'
                        : 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700 font-bold')
                    : (adminTheme === 'light'
                        ? 'text-slate-500 hover:text-slate-800 hover:bg-white/40 bg-transparent'
                        : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30 bg-transparent')
                }`}
                style={{ fontSize: 'var(--admin-text-2xs)' }}
              >
                {range === 'today' ? getTodayLabel() : range === '7d' ? '7 Jours' : range === '30d' ? '30 Jours' : range === 'month' ? 'Ce Mois' : range === 'all' ? 'Tout' : 'Personnalisé'}
              </button>
            ))}
          </div>
          
          {analyticsRange === 'custom' && (
            <div className={`flex flex-wrap items-center gap-3 rounded-2xl px-4 py-2 border transition-all duration-200 ${
              adminTheme === 'light' ? 'bg-slate-50 border-slate-200/60 shadow-sm' : 'bg-slate-950 border-slate-900'
            }`}>
              <div className="flex items-center gap-2">
                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500 shrink-0">Du</label>
                <input
                  type="date"
                  value={customDateFrom}
                  max={customDateTo || new Date().toISOString().split('T')[0]}
                  onChange={e => setCustomDateFrom(e.target.value)}
                  className={`border focus:border-emerald-500/50 rounded-xl px-3 py-1.5 text-[11px] font-mono outline-none transition cursor-pointer ${
                    adminTheme === 'light' ? 'bg-white border-slate-200 text-slate-800 focus:ring-1 focus:ring-emerald-500/35' : 'bg-slate-900 border-slate-800 text-slate-200'
                  }`}
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500 shrink-0">Au</label>
                <input
                  type="date"
                  value={customDateTo}
                  min={customDateFrom}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={e => setCustomDateTo(e.target.value)}
                  className={`border focus:border-emerald-500/50 rounded-xl px-3 py-1.5 text-[11px] font-mono outline-none transition cursor-pointer ${
                    adminTheme === 'light' ? 'bg-white border-slate-200 text-slate-800 focus:ring-1 focus:ring-emerald-500/35' : 'bg-slate-900 border-slate-800 text-slate-200'
                  }`}
                />
              </div>
              {customDateFrom && (
                <button
                  onClick={() => { setCustomDateFrom(''); setCustomDateTo(''); }}
                  className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-xl transition border cursor-pointer border-0 ${
                    adminTheme === 'light' ? 'text-rose-600 hover:text-rose-700 border-rose-100 bg-rose-50' : 'text-rose-400 hover:text-rose-300 border-rose-900/40 bg-rose-950/20'
                  }`}
                >
                  Réinitialiser
                </button>
              )}
            </div>
          )}
        </div>
      </div>


      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-5 lg:gap-6">
        {[
          { 
            label: "Chiffre d'Affaires", 
            raw: dashboardStats.totalSales, 
            suffix: ' DH', 
            icon: DollarSign, 
            color: 'text-emerald-400', 
            bg: 'from-emerald-500/10 to-teal-500/10 border-emerald-900/40',
            isWide: true,
            sparklineData: dashboardStats.last7DaysSales.map((d: any) => d.amount)
          },
          { 
            label: 'Commandes', 
            raw: dashboardStats.ordersCount, 
            suffix: '', 
            icon: ShoppingBag, 
            color: 'text-blue-400', 
            bg: 'from-blue-500/10 to-indigo-500/10 border-blue-900/40',
            isWide: false,
            sparklineData: dashboardStats.last7DaysSales.map((d: any) => d.count)
          },
          { 
            label: 'Panier Moyen', 
            raw: dashboardStats.avgOrderValue, 
            suffix: ' DH', 
            icon: TrendingUp, 
            color: 'text-violet-400', 
            bg: 'from-violet-500/10 to-purple-500/10 border-violet-900/40',
            isWide: false,
            sparklineData: dashboardStats.last7DaysSales.map((d: any) => d.count > 0 ? d.amount / d.count : 0)
          },
          { 
            label: 'Paniers Abandonnés', 
            raw: dashboardStats.abandonedCartsCount, 
            suffix: '', 
            icon: ClipboardList, 
            color: 'text-rose-400', 
            bg: 'from-rose-500/10 to-pink-500/10 border-rose-900/40',
            isWide: false,
            isMobileWide: true
          },
        ].map((kpi, idx) => (
          <KpiCard key={idx} {...kpi} theme={adminTheme} />
        ))}
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

        {/* Bento Cell 1: Sales SVG Line Chart */}
        <div className={`p-1 rounded-[36px] lg:col-span-2 xl:col-span-3 xl:row-span-2 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-2xl ${
          adminTheme === 'light'
            ? 'bg-slate-200/50 border border-slate-200/60 shadow-[0_4px_12px_-2px_rgba(15,30,54,0.02)] hover:border-slate-300'
            : 'bg-white/5 border border-white/10 hover:border-white/15'
        }`}>
          <div className={`rounded-[calc(36px-4px)] p-6 h-full flex flex-col justify-between ${
            adminTheme === 'light' ? 'bg-white text-slate-800 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]' : 'bg-slate-950/80 backdrop-blur-md text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'
          }`}>
            <BentoCardHeader
              eyebrow="Évolution Globale"
              title="Évolution des ventes"
              icon={BarChart2}
              theme={adminTheme}
              action={
                <span
                  className={`px-2.5 py-1 rounded-full font-bold border font-mono ${
                    adminTheme === 'light' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-emerald-950/30 border-emerald-900/40 text-emerald-400'
                  }`}
                  style={{ fontSize: 'var(--admin-text-2xs)' }}
                >
                  {dashboardStats.totalSales.toFixed(0)} DH total
                </span>
              }
            />

            {(() => {
              const data = dashboardStats.last7DaysSales;
              const W = 600, H = 180, padL = 48, padR = 12, padT = 10, padB = 28;
              const innerW = W - padL - padR;
              const innerH = H - padT - padB;
              const maxVal = Math.max(...data.map((d: any) => d.amount), 1);
              const pts = data.map((d: any, i: number) => ({
                x: padL + (i / Math.max(data.length - 1, 1)) * innerW,
                y: padT + innerH - (d.amount / maxVal) * innerH,
                ...d
              }));
              const linePath = pts.length < 2
                ? ''
                : pts.reduce((acc: string, pt: any, i: number) => {
                    if (i === 0) return `M ${pt.x},${pt.y}`;
                    const prev = pts[i - 1];
                    const cx1 = prev.x + (pt.x - prev.x) / 2;
                    const cy1 = prev.y;
                    const cx2 = prev.x + (pt.x - prev.x) / 2;
                    const cy2 = pt.y;
                    return `${acc} C ${cx1},${cy1} ${cx2},${cy2} ${pt.x},${pt.y}`;
                  }, '');
              const areaPath = linePath ? `${linePath} L ${pts[pts.length-1].x},${padT+innerH} L ${pts[0].x},${padT+innerH} Z` : '';
              const gridVals = [0, 0.25, 0.5, 0.75, 1].map(f => ({ y: padT + innerH - f * innerH, label: Math.round(f * maxVal).toLocaleString('fr-FR') }));
              const showEvery = data.length > 14 ? 4 : data.length > 7 ? 2 : 1;
              
              return (
                <div className="relative w-full h-48 md:h-64 mt-2" onMouseLeave={() => setChartHoverIdx(null)}>
                  <style>{`@keyframes chartDraw{from{stroke-dashoffset:2000}to{stroke-dashoffset:0}}.chart-line{stroke-dasharray:2000;animation:chartDraw 1.2s cubic-bezier(.4,0,.2,1) forwards}.chart-area{animation:fadeIn .8s ease forwards}@keyframes fadeIn{from{opacity:0}to{opacity:1}}`}</style>
                  <svg
                    viewBox={`0 0 ${W} ${H}`}
                    preserveAspectRatio="none"
                    className="w-full h-full animate-fade-in"
                  >
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.00" />
                      </linearGradient>
                      <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="50%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                    {gridVals.map((g, i) => (
                      <g key={i}>
                        <line x1={padL} y1={g.y} x2={W - padR} y2={g.y} stroke={adminTheme === 'light' ? "#f1f5f9" : "#1e293b"} strokeWidth="1" strokeDasharray="3,6" opacity={adminTheme === 'light' ? "1" : "0.5"} />
                        <text x={padL - 8} y={g.y + 3} textAnchor="end" fontSize="8" fill={adminTheme === 'light' ? "#94a3b8" : "#475569"} fontFamily="monospace">{g.label}</text>
                      </g>
                    ))}
                    {areaPath && <path d={areaPath} fill="url(#areaGrad)" className="chart-area" />}
                    {linePath && <path d={linePath} fill="none" stroke="url(#lineGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="chart-line" />}
                    {pts.map((pt: any, i: number) => i % showEvery === 0 && (
                      <text key={i} x={pt.x} y={H - 4} textAnchor="middle" fontSize="8" fill={adminTheme === 'light' ? "#94a3b8" : "#475569"} fontFamily="monospace">{pt.date}</text>
                    ))}
                    {pts.map((pt: any, i: number) => (
                      <g key={i} onMouseEnter={() => setChartHoverIdx(i)} style={{ cursor: 'crosshair' }}>
                        <rect x={i === 0 ? pt.x - 10 : (pts[i-1].x + pt.x) / 2} y={padT} width={i === pts.length-1 ? 20 : ((i === 0 ? pt.x - 10 : (pts[i-1].x + pt.x)/2) - pt.x) * -1 + (i < pts.length-1 ? (pt.x + pts[i+1].x)/2 - pt.x : 10)} height={innerH} fill="transparent" />
                        {chartHoverIdx === i && (
                          <>
                            <line x1={pt.x} y1={padT} x2={pt.x} y2={padT + innerH} stroke="#10b981" strokeWidth="1.5" strokeDasharray="2,2" opacity="0.5" />
                            <circle cx={pt.x} cy={pt.y} r="8" className="animate-ping" fill="none" stroke="#10b981" strokeWidth="1.5" style={{ transformOrigin: `${pt.x}px ${pt.y}px` }} />
                            <circle cx={pt.x} cy={pt.y} r="4.5" fill={adminTheme === 'light' ? "#ffffff" : "#0f172a"} stroke="#10b981" strokeWidth="2.5" />
                          </>
                        )}
                        {chartHoverIdx !== i && pt.amount > 0 && (
                          <circle cx={pt.x} cy={pt.y} r="2.5" fill="#10b981" opacity="0.6" />
                        )}
                      </g>
                    ))}
                  </svg>
                  {chartHoverIdx !== null && pts[chartHoverIdx] && (
                    <div 
                      className={`absolute z-30 pointer-events-none p-4 rounded-2xl border text-[10px] leading-snug transition-all duration-150 backdrop-blur-xl shadow-2xl flex flex-col gap-1.5 min-w-[160px] animate-fade-in ${
                        adminTheme === 'light'
                          ? 'bg-white/85 border-slate-200/50 text-slate-800 shadow-slate-200/40'
                          : 'bg-slate-950/85 border-slate-800/60 text-slate-200 shadow-black/60'
                      }`}
                      style={{
                        left: `${(pts[chartHoverIdx].x / W) * 100}%`,
                        top: `${Math.max(10, (pts[chartHoverIdx].y / H) * 100 - 18)}%`,
                        transform: 'translate(-50%, -100%)',
                      }}
                    >
                      <span className={`font-bold ${adminTheme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>{pts[chartHoverIdx].date}</span>
                      <span className="font-extrabold text-[12px] text-emerald-500 font-mono">
                        {pts[chartHoverIdx].amount > 0 ? `${pts[chartHoverIdx].amount.toLocaleString('fr-FR')} DH` : '0 DH'}
                      </span>
                      <span className={`font-mono text-[9px] font-semibold opacity-70`}>
                        {pts[chartHoverIdx].count || 0} commande(s)
                      </span>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Bento Cell 2: Tunnel des Commandes */}
        <div className={`p-1 rounded-[36px] xl:row-span-2 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-2xl ${
          adminTheme === 'light'
            ? 'bg-slate-200/50 border border-slate-200/60 shadow-[0_4px_12px_-2px_rgba(15,30,54,0.02)] hover:border-slate-300'
            : 'bg-white/5 border border-white/10 hover:border-white/15'
        }`}>
          <div className={`rounded-[calc(36px-4px)] p-6 h-full flex flex-col ${
            adminTheme === 'light' ? 'bg-white text-slate-800 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]' : 'bg-slate-950/80 backdrop-blur-md text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'
          }`}>
            <BentoCardHeader eyebrow="Conversion" title="Tunnel des commandes" icon={ClipboardList} theme={adminTheme} />
            
            <div className="flex-1 flex flex-col justify-between py-1 min-h-0 gap-3">
              {Object.entries(dashboardStats.statusFunnel).map(([status, count]) => {
                const total = dashboardStats.ordersCount || 1;
                const pct = Math.round(((count as number) / total) * 100);
                const colors: Record<string, { bg: string; text: string; progress: string }> = { 
                  Pending: { bg: 'bg-amber-500/10 border-amber-500/20', text: 'text-amber-500', progress: 'bg-amber-500' }, 
                  Confirmed: { bg: 'bg-blue-500/10 border-blue-500/20', text: 'text-blue-500', progress: 'bg-blue-500' }, 
                  Shipped: { bg: 'bg-indigo-500/10 border-indigo-500/20', text: 'text-indigo-500', progress: 'bg-indigo-500' }, 
                  Delivered: { bg: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-500', progress: 'bg-emerald-500' }, 
                  Cancelled: { bg: 'bg-rose-500/10 border-rose-500/20', text: 'text-rose-500', progress: 'bg-rose-500' } 
                };
                const labelMap: Record<string, string> = { Pending: 'En attente', Confirmed: 'Confirmées', Shipped: 'Expédiées', Delivered: 'Livrées', Cancelled: 'Annulées' };
                const c = colors[status] || { bg: 'bg-slate-500/10 border-slate-500/20', text: 'text-slate-500', progress: 'bg-slate-500' };
                
                return (
                  <div key={status} className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10.5px]">
                      <span className={`font-semibold ${adminTheme === 'light' ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>{labelMap[status] || status}</span>
                      <div className="flex items-center gap-2">
                        <span className={`font-mono text-[9px] px-1.5 py-0.2 rounded border ${c.bg} ${c.text} font-bold`}>{pct}%</span>
                        <span className="font-bold font-mono opacity-80">{count as number}</span>
                      </div>
                    </div>
                    <div className={`h-1.5 rounded-full overflow-hidden border ${adminTheme === 'light' ? 'bg-slate-100 border-slate-200/40' : 'bg-slate-900 border-slate-900'}`}>
                      <div className={`h-full ${c.progress} transition-all duration-500`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bento Cell 4: Journal d'Activité */}
        <div className={`p-1 rounded-[36px] lg:col-span-2 xl:col-span-2 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-2xl ${
          adminTheme === 'light'
            ? 'bg-slate-200/50 border border-slate-200/60 shadow-[0_4px_12px_-2px_rgba(15,30,54,0.02)] hover:border-slate-300'
            : 'bg-white/5 border border-white/10 hover:border-white/15'
        }`}>
          <div className={`rounded-[calc(36px-4px)] p-6 h-full flex flex-col justify-between ${
            adminTheme === 'light' ? 'bg-white text-slate-800 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]' : 'bg-slate-950/80 backdrop-blur-md text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'
          }`}>
            <div>
              <BentoCardHeader
                eyebrow="Audits"
                title="Journal d'activité"
                icon={TrendingUp}
                theme={adminTheme}
                action={
                  <button
                    onClick={() => { setActiveTab('settings'); setActiveSettingsSubTab('logs'); }}
                    className={`flex items-center gap-1 font-semibold border-0 bg-transparent cursor-pointer hover:underline ${
                      adminTheme === 'light' ? 'text-emerald-600' : 'text-emerald-400'
                    }`}
                    style={{ fontSize: 'var(--admin-text-2xs)' }}
                  >
                    Tout voir <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                }
              />
              
              {(() => {
                const getActionBadge = (action: string) => {
                  const act = (action || '').toLowerCase();
                  if (act.includes('suppr') || act.includes('retir') || act.includes('annulation')) {
                    return {
                      badge: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
                      dot: 'bg-rose-500'
                    };
                  }
                  if (act.includes('créa') || act.includes('ajout') || act.includes('enregistr')) {
                    return {
                      badge: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
                      dot: 'bg-emerald-500'
                    };
                  }
                  if (act.includes('connex') || act.includes('authentif')) {
                    return {
                      badge: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
                      dot: 'bg-amber-500'
                    };
                  }
                  return {
                    badge: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
                    dot: 'bg-blue-500'
                  };
                };
                
                return (
                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                    {auditLogs.slice(0, 6).map(log => {
                      const badgeInfo = getActionBadge(log.action);
                      return (
                        <div
                          key={log.id}
                          className={`p-3 border rounded-2xl space-y-1.5 transition-all hover:bg-slate-500/[0.02] ${
                            adminTheme === 'light' ? 'bg-slate-50/50 border-slate-100 hover:border-slate-200' : 'bg-slate-950 border-slate-900 hover:border-slate-800'
                          }`}
                        >
                          <div className="flex justify-between items-center gap-2">
                            <StatusBadge status={log.action} label={log.action} size="xs" dot={true} theme={adminTheme} />
                            <span className="font-mono shrink-0" style={{ fontSize: 'var(--admin-text-2xs)', color: 'var(--admin-text-faint)' }}>
                              {new Date(log.date).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p
                            className="leading-relaxed font-medium"
                            style={{ fontSize: 'var(--admin-text-xs)', color: 'var(--admin-text-secondary)' }}
                          >
                            {log.details}
                          </p>
                        </div>
                      );
                    })}
                    {auditLogs.length === 0 && <p className="text-xs text-slate-500 italic text-center py-6">Aucune activité récente</p>}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Bento Cell 3: Top Produits (Ventes) */}
        <div className={`p-1 rounded-[36px] lg:col-span-2 xl:col-span-2 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-2xl ${
          adminTheme === 'light'
            ? 'bg-slate-200/50 border border-slate-200/60 shadow-[0_4px_12px_-2px_rgba(15,30,54,0.02)] hover:border-slate-300'
            : 'bg-white/5 border border-white/10 hover:border-white/15'
        }`}>
          <div className={`rounded-[calc(36px-4px)] p-6 h-full flex flex-col justify-between ${
            adminTheme === 'light' ? 'bg-white text-slate-800 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]' : 'bg-slate-950/80 backdrop-blur-md text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'
          }`}>
            <div>
              <BentoCardHeader eyebrow="Classement" title="Top produits (Ventes)" icon={ShoppingBag} theme={adminTheme} />

              <div className="flex flex-col gap-3">
                {/* Header row */}
                <div
                  className="flex items-center justify-between gap-3 pb-2 border-b px-1"
                  style={{ borderColor: 'var(--admin-border)', fontSize: 'var(--admin-text-2xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--admin-text-faint)' }}
                >
                  <div className="flex-1 min-w-0">
                    <span>Produit</span>
                  </div>
                  <div className="w-16 shrink-0 text-center hidden sm:block">
                    <span>Quantité</span>
                  </div>
                  <div className="w-20 shrink-0 text-right">
                    <span>Revenu</span>
                  </div>
                </div>

                {topProductsByRevenueRanged.length === 0 ? (
                  <p className="text-[11px] text-slate-500 italic text-center py-6">Aucune vente enregistrée</p>
                ) : (
                  (() => {
                    const topProductsBySales = [...topProductsByRevenueRanged].sort((a, b) => b[1].qty - a[1].qty);
                    const maxQty = topProductsBySales[0]?.[1].qty || 1;
                    return topProductsBySales.slice(0, 4).map(([id, data]: any, idx: number) => {
                      const pct = ((data.qty / maxQty) * 100).toFixed(0);
                      const rankGradients = [
                        'from-amber-400 to-yellow-500 text-white shadow-md shadow-amber-500/10',
                        'from-slate-300 to-slate-400 text-white shadow-md shadow-slate-400/10',
                        'from-amber-600 to-amber-700 text-white shadow-md shadow-amber-700/10',
                      ];
                      
                      const productFromDb = products?.find((p: any) => p.id === Number(id));
                      const brand = productFromDb?.vendor || 'Officine';
                      const productImage = productFromDb?.image || 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=320&auto=format&fit=crop';
                      
                      return (
                        <div 
                          key={id} 
                          className={`flex items-center justify-between gap-3 py-2 px-1 rounded-2xl transition-all duration-300 hover:bg-slate-500/[0.02] border border-transparent ${
                            adminTheme === 'light' ? 'hover:border-slate-100' : 'hover:border-slate-900/60'
                          }`}
                        >
                          {/* Rank + Image + Title */}
                          <div className="flex-1 min-w-0 flex items-center gap-3">
                            <div className="relative shrink-0">
                              {idx < 3 ? (
                                <span className={`absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black z-10 bg-gradient-to-tr ${rankGradients[idx]}`}>
                                  {idx + 1}
                                </span>
                              ) : (
                                <span className={`absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black z-10 ${
                                  adminTheme === 'light' ? 'bg-slate-100 text-slate-500 border border-slate-200' : 'bg-slate-900 text-slate-400 border border-slate-800'
                                }`}>
                                  {idx + 1}
                                </span>
                              )}
                              <img 
                                src={productImage} 
                                alt={data.title}
                                className="w-10 h-10 object-cover rounded-xl border border-slate-200/50 dark:border-slate-800/50 shadow-[0_2px_4px_rgba(0,0,0,0.02)]"
                              />
                            </div>
                            
                            <div className="min-w-0">
                              <span className={`text-[8.5px] font-extrabold tracking-wider uppercase block leading-none mb-1 ${adminTheme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
                                {brand}
                              </span>
                              <h4 className={`text-[11.5px] font-bold truncate ${adminTheme === 'light' ? 'text-slate-700' : 'text-slate-200'}`} title={data.title}>
                                {data.title}
                              </h4>
                            </div>
                          </div>

                          {/* Quantity */}
                          <div className={`w-16 shrink-0 hidden sm:flex items-center justify-center font-mono text-xs font-black ${adminTheme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                            {data.qty}
                          </div>

                          {/* Revenue */}
                          <div className="w-20 shrink-0 text-right flex flex-col justify-center">
                            <span className="font-mono text-[11px] font-extrabold text-emerald-500">
                              {data.revenue.toLocaleString('fr-FR')} DH
                            </span>
                            <span className="text-[8.5px] text-slate-400 dark:text-slate-500 block font-medium mt-0.5 sm:hidden">
                              Qté: {data.qty}
                            </span>
                          </div>
                        </div>
                      );
                    });
                  })()
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bento Cell 5: Relance Paniers Abandonnés */}
        <div className={`p-1 rounded-[36px] lg:col-span-2 xl:col-span-2 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-2xl ${
          adminTheme === 'light'
            ? 'bg-slate-200/50 border border-slate-200/60 shadow-[0_4px_12px_-2px_rgba(15,30,54,0.02)] hover:border-slate-300'
            : 'bg-white/5 border border-white/10 hover:border-white/15'
        }`}>
          <div className={`rounded-[calc(36px-4px)] p-6 h-full flex flex-col justify-between ${
            adminTheme === 'light' ? 'bg-white text-slate-800 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]' : 'bg-slate-950/80 backdrop-blur-md text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'
          }`}>
            <div>
              <BentoCardHeader
                eyebrow="Relances"
                title="Relance paniers abandonnés"
                icon={ClipboardList}
                theme={adminTheme}
                action={
                  <div className="flex gap-1.5">
                    <StatusBadge status="cancelled" label={`${cartRecoveryStats.total} abandons`} dot={false} theme={adminTheme} size="xs" />
                    <StatusBadge status="active" label={`${cartRecoveryStats.rate}% récup.`} dot={false} theme={adminTheme} size="xs" />
                  </div>
                }
              />
              
              {/* Recovery KPIs Summary */}
              <div className="grid grid-cols-3 gap-2.5 text-center mb-4">
                {[
                  { 
                    label: 'Non contactés', 
                    value: cartRecoveryStats.total - cartRecoveryStats.contacted - cartRecoveryStats.recovered, 
                    color: adminTheme === 'light' ? 'text-slate-700' : 'text-slate-300',
                    border: adminTheme === 'light' ? 'border-slate-200/80 shadow-[0_2px_4px_rgba(0,0,0,0.01)]' : 'border-slate-900',
                    bg: adminTheme === 'light' ? 'bg-slate-50/60' : 'bg-slate-950/40'
                  },
                  { 
                    label: 'Contactés', 
                    value: cartRecoveryStats.contacted, 
                    color: adminTheme === 'light' ? 'text-amber-707 text-amber-700' : 'text-amber-400',
                    border: adminTheme === 'light' ? 'border-amber-200/50 shadow-[0_2px_4px_rgba(0,0,0,0.01)]' : 'border-amber-950/20 border-amber-950/20',
                    bg: adminTheme === 'light' ? 'bg-amber-50/25' : 'bg-amber-950/10 bg-amber-950/10'
                  },
                  { 
                    label: 'Récupérés', 
                    value: cartRecoveryStats.recovered, 
                    color: adminTheme === 'light' ? 'text-emerald-707 text-emerald-700' : 'text-emerald-400',
                    border: adminTheme === 'light' ? 'border-emerald-200/50 shadow-[0_2px_4px_rgba(0,0,0,0.01)]' : 'border-emerald-950/20 border-emerald-950/20',
                    bg: adminTheme === 'light' ? 'bg-emerald-50/25' : 'bg-emerald-950/10 bg-emerald-950/10'
                  }
                ].map((s, i) => (
                  <div key={i} className={`rounded-[20px] py-2 px-1 border transition-all hover:scale-[1.02] ${s.bg} ${s.border}`}>
                    <span className={`text-base font-extrabold font-mono block ${s.color}`}>{s.value}</span>
                    <span className="text-[8px] text-slate-500 uppercase font-bold tracking-wider">{s.label}</span>
                  </div>
                ))}
              </div>
              
              <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
                {abandonedCarts.map((cart, idx) => {
                  const status = cartRecoveryStatus[cart.phone] || 'not_contacted';
                  const statusLabels: Record<string, string> = {
                    not_contacted: 'Non contacté',
                    contacted: 'Relancé',
                    recovered: 'Récupéré'
                  };
                  
                  const statusBadgeStyle = {
                    not_contacted: adminTheme === 'light' 
                      ? 'bg-slate-100 border-slate-200 text-slate-600' 
                      : 'bg-slate-900/50 border-slate-900 text-slate-400',
                    contacted: adminTheme === 'light' 
                      ? 'bg-amber-50 border-amber-100 text-amber-700' 
                      : 'bg-amber-500/10 border-amber-500/20 text-amber-400',
                    recovered: adminTheme === 'light' 
                      ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                      : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  }[status];

                  const dotColor = {
                    not_contacted: 'bg-slate-400',
                    contacted: 'bg-amber-500',
                    recovered: 'bg-emerald-500'
                  }[status];

                   const buyerInitials = (cart.name || 'A').split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase();
                  const detailsStr = cart.items?.map((item: any) => {
                    const title = item.title || item.product?.title || 'Produit';
                    const qty = item.quantity || 1;
                    const price = item.price || item.product?.price;
                    const priceStr = price ? ` (${price} DH)` : '';
                    return `${qty}x ${title}${priceStr}`;
                  }).join(', ') || 'Aucun produit';
                  
                   return (
                    <div 
                      key={idx} 
                      onClick={() => setSelectedAbandonedCart(cart)}
                      className={`p-3.5 rounded-2xl text-xs flex justify-between items-start gap-3 border cursor-pointer transition-all duration-200 ${
                        adminTheme === 'light'
                          ? 'bg-slate-50/40 border-slate-200/50 hover:bg-slate-50 hover:border-slate-300 hover:shadow-md hover:scale-[1.01]'
                          : 'bg-slate-950 border-slate-900 hover:border-slate-800 hover:bg-slate-900/20 hover:scale-[1.01]'
                      }`}
                    >
                      <div className="min-w-0 flex-1 space-y-2 animate-fade-in flex items-start gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5 ${
                          adminTheme === 'light' ? 'bg-slate-100 text-slate-700 border border-slate-200/40' : 'bg-slate-900 text-slate-300 border border-slate-800/60'
                        }`}>
                          {buyerInitials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex gap-1.5 items-center flex-wrap">
                              <span className={`font-bold text-[11px] ${adminTheme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>{cart.name || 'Anonyme'}</span>
                              <StatusBadge
                                status={status === 'not_contacted' ? 'inactive' : status === 'recovered' ? 'active' : 'warning'}
                                label={statusLabels[status]}
                                size="xs"
                                theme={adminTheme}
                              />
                            </div>
                            <span className="text-[9.5px] text-slate-500 font-semibold select-none leading-none">
                              Compte : <span className={cart.clientProfileName ? 'text-indigo-500 font-bold' : 'text-rose-500 italic font-bold'}>{cart.clientProfileName || 'unavailable'}</span>
                            </span>
                            {cart.date && (
                              <span className="text-[9px] text-slate-400 font-mono leading-none flex items-center gap-1 mt-0.5">
                                <Clock className="w-2.5 h-2.5 inline-block shrink-0" />
                                {new Date(cart.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                {' · '}
                                {new Date(cart.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>

                          {/* Beautiful professional UI for item pills */}
                          <div className="flex flex-wrap gap-1 mt-2.5">
                            {cart.items?.slice(0, 3).map((item: any, iIdx: number) => {
                              const title = item.title || item.product?.title || 'Produit';
                              const qty = item.quantity || 1;
                              const price = item.price || item.product?.price;
                              return (
                                <span 
                                  key={iIdx} 
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-bold border ${
                                    adminTheme === 'light' 
                                      ? 'bg-slate-100/70 border-slate-200/50 text-slate-700' 
                                      : 'bg-slate-900 border-slate-800 text-slate-300'
                                  }`}
                                >
                                  <span className="text-emerald-500 font-extrabold">{qty}x</span>
                                  <span className="truncate max-w-[120px]">{title}</span>
                                  {price && <span className="opacity-60 font-mono">({price} DH)</span>}
                                </span>
                              );
                            })}
                            {cart.items && cart.items.length > 3 && (
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded-lg text-[9px] font-black border uppercase tracking-wider ${
                                adminTheme === 'light'
                                  ? 'bg-indigo-50 border-indigo-100 text-indigo-600'
                                  : 'bg-indigo-950/20 border-indigo-900/30 text-indigo-400'
                              }`}>
                                +{cart.items.length - 3} de plus
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="shrink-0 flex flex-col items-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <span className={`font-black text-[11.5px] font-mono leading-none ${adminTheme === 'light' ? 'text-slate-800' : 'text-slate-100'}`}>{cart.total} DH</span>
                        <div className="flex gap-1.5">
                          <a
                            href={buildCartRecoveryLink(cart)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => handleUpdateCartRecovery(cart.phone, 'contacted')}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 text-[9px] font-black uppercase rounded-lg border transition-all duration-200 hover:scale-[1.04] active:scale-[0.96] ${
                              adminTheme === 'light'
                                ? 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-500 hover:text-white hover:border-emerald-500'
                                : 'text-emerald-400 bg-emerald-950/30 border-emerald-900/40 hover:bg-emerald-500 hover:text-slate-950 hover:border-emerald-500'
                            }`}
                          >
                            <MessageSquare className="w-3 h-3" /> WA
                          </a>
                          {status !== 'recovered' && (
                            <button
                              onClick={() => handleUpdateCartRecovery(cart.phone, 'recovered')}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 text-[9px] font-black uppercase rounded-lg border transition-all duration-200 cursor-pointer hover:scale-[1.04] active:scale-[0.96] ${
                                adminTheme === 'light'
                                  ? 'text-slate-700 bg-slate-100 border-slate-200 hover:bg-emerald-500 hover:text-white hover:border-emerald-500'
                                  : 'text-slate-400 bg-slate-900 border-slate-800 hover:bg-emerald-500 hover:text-slate-950 hover:border-emerald-500'
                              }`}
                            >
                              <Check className="w-3 h-3" /> OK
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {abandonedCarts.length === 0 && <p className="text-xs text-slate-500 italic text-center py-4">Aucun panier abandonné</p>}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Abandoned Cart Detail Modal - Premium Redesign (Portal) */}
      {selectedAbandonedCart && typeof window !== 'undefined' && ReactDOM.createPortal((() => {
        const cart = selectedAbandonedCart;
        const cartStatus = cartRecoveryStatus[cart.phone] || 'not_contacted';
        const statusColors: Record<string, string> = {
          not_contacted: 'bg-slate-100 text-slate-600 border-slate-200',
          contacted: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
          recovered: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
        };
        const statusLabelsM: Record<string, string> = { not_contacted: 'Non contacté', contacted: 'Relancé', recovered: 'Récupéré' };
        const hasSalicylic = cart.items?.some((i: any) => (i.title || i.product?.title || '').toLowerCase().match(/salicyl|acne|bha/));
        const hasRetinol = cart.items?.some((i: any) => (i.title || i.product?.title || '').toLowerCase().match(/retinol|retin/));
        const hasVitC = cart.items?.some((i: any) => (i.title || i.product?.title || '').toLowerCase().match(/vitamine c|vit c|ascorb/));
        const suggestion = hasSalicylic
          ? "Soin BHA détecté — rappeler d'appliquer le soir avec SPF 50 en journée."
          : hasRetinol
          ? "Rétinol détecté — éviter de combiner avec un exfoliant AHA/BHA."
          : hasVitC
          ? "Vitamine C présente — parfaite pour relancer en insistant sur l'éclat du matin."
          : null;

        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/55 backdrop-blur-md"
            onClick={() => setSelectedAbandonedCart(null)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-[640px] rounded-[28px] shadow-2xl overflow-hidden flex flex-col border ${
                adminTheme === 'light'
                  ? 'bg-white border-slate-100/80 text-slate-800'
                  : 'bg-[#0f1117] border-white/5 text-white'
              }`}
              style={{ maxHeight: '88vh' }}
            >
              {/* ── Header ── */}
              <div className={`flex items-center justify-between px-6 py-4 border-b shrink-0 ${adminTheme === 'light' ? 'border-slate-100' : 'border-white/5'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black ${adminTheme === 'light' ? 'bg-slate-100 text-slate-600' : 'bg-white/5 text-white/70'}`}>
                    {(cart.name || 'A').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm leading-tight">{cart.name || 'Anonyme'}</h3>
                    <span className="text-[10px] text-slate-400 font-mono">{cart.phone}</span>
                  </div>
                  <span className={`ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${statusColors[cartStatus]}`}>
                    {statusLabelsM[cartStatus]}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedAbandonedCart(null)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition active:scale-90 cursor-pointer border-0 outline-none ${adminTheme === 'light' ? 'bg-slate-100 hover:bg-slate-200 text-slate-500' : 'bg-white/5 hover:bg-white/10 text-white/50'}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* ── Two-column Body ── */}
              <div className="flex flex-1 min-h-0 overflow-hidden">

                {/* Left — Client Meta */}
                <div className={`w-48 shrink-0 p-4 flex flex-col gap-3 border-r text-xs ${adminTheme === 'light' ? 'bg-slate-50/60 border-slate-100' : 'bg-white/[0.02] border-white/5'}`}>
                  <div>
                    <span className="text-[8.5px] font-black uppercase tracking-widest text-slate-400 block mb-1">Compte Client</span>
                    <span className={`font-bold text-[11px] leading-snug ${cart.clientProfileName ? 'text-indigo-500' : 'text-rose-400 italic'}`}>
                      {cart.clientProfileName || 'unavailable'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[8.5px] font-black uppercase tracking-widest text-slate-400 block mb-1">Abandon le</span>
                    <span className="font-semibold text-[10px] leading-snug">
                      {cart.date ? new Date(cart.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[8.5px] font-black uppercase tracking-widest text-slate-400 block mb-1">Articles</span>
                    <span className="font-bold text-[13px]">{cart.items?.length || 0}</span>
                  </div>
                  <div className="mt-auto pt-3 border-t border-slate-100/60 dark:border-white/5">
                    <span className="text-[8.5px] font-black uppercase tracking-widest text-slate-400 block mb-1">Total Estimé</span>
                    <span className="font-black text-base font-mono">{cart.total.toFixed(2)} <span className="text-[10px]">DH</span></span>
                  </div>
                  {suggestion && (
                    <div className="mt-2 p-2.5 rounded-xl bg-indigo-500/8 border border-indigo-500/15 text-[9.5px] text-indigo-400 leading-relaxed font-medium">
                      💡 {suggestion}
                    </div>
                  )}
                </div>

                {/* Right — Items list */}
                <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-2">
                  <span className="text-[8.5px] font-black uppercase tracking-widest text-slate-400 block mb-2">Articles sélectionnés</span>
                  {cart.items?.map((item: any, iIdx: number) => {
                    const title = item.title || item.product?.title || 'Produit';
                    const qty = item.quantity || 1;
                    const price = parseFloat(item.price || item.product?.price || '0');
                    const img = item.product?.image || item.image;
                    return (
                      <div
                        key={iIdx}
                        className={`flex items-center gap-3 p-3 rounded-2xl border ${
                          adminTheme === 'light'
                            ? 'bg-slate-50/80 border-slate-100'
                            : 'bg-white/[0.03] border-white/5'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center overflow-hidden border ${adminTheme === 'light' ? 'bg-white border-slate-100' : 'bg-white/5 border-white/5'}`}>
                          {img
                            ? <img src={img} alt={title} className="w-full h-full object-contain" />
                            : <ShoppingBag className="w-4 h-4 text-slate-400" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-[11.5px] leading-snug truncate">{title}</h4>
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                            <span className="text-emerald-500 font-black">{qty}×</span> {price.toFixed(2)} DH
                          </p>
                        </div>
                        <span className="font-mono font-extrabold text-[12px] shrink-0">
                          {(price * qty).toFixed(2)} <span className="text-[9px] text-slate-400">DH</span>
                        </span>
                      </div>
                    );
                  })}
                  {(!cart.items || cart.items.length === 0) && (
                    <p className="text-xs text-slate-400 italic text-center py-8">Aucun article dans ce panier</p>
                  )}
                </div>
              </div>

              {/* ── Footer ── */}
              <div className={`px-5 py-3.5 flex items-center justify-between gap-2 border-t shrink-0 ${adminTheme === 'light' ? 'bg-slate-50/50 border-slate-100' : 'border-white/5'}`}>
                <span className="text-[9px] text-slate-400 font-semibold">Cliquez sur Relancer pour ouvrir WhatsApp</span>
                <div className="flex gap-2">
                  <a
                    href={buildCartRecoveryLink(cart, 'Fr')}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => { handleUpdateCartRecovery(cart.phone, 'contacted'); setSelectedAbandonedCart(null); }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition active:scale-95 border-0 outline-none"
                  >
                    <MessageSquare className="w-3 h-3" /> FR
                  </a>
                  <a
                    href={buildCartRecoveryLink(cart, 'Ar')}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => { handleUpdateCartRecovery(cart.phone, 'contacted'); setSelectedAbandonedCart(null); }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition active:scale-95 border-0 outline-none"
                  >
                    <MessageSquare className="w-3 h-3" /> AR
                  </a>
                  {cartStatus !== 'recovered' && (
                    <button
                      onClick={() => { handleUpdateCartRecovery(cart.phone, 'recovered'); setSelectedAbandonedCart(null); }}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition active:scale-95 border-0 outline-none cursor-pointer ${
                        adminTheme === 'light'
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          : 'bg-white/5 hover:bg-white/10 text-white/70'
                      }`}
                    >
                      <Check className="w-3 h-3" /> Récupéré
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()
      , document.body)}
    </div>
  );
};
