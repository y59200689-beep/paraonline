'use client';

import React, { useState, useMemo } from 'react';
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
  Package,
  Pin,
  Eye,
  EyeOff,
  MoveLeft,
  MoveRight,
  Settings2,
  RotateCcw,
  RefreshCw,
  Truck,
  AlertTriangle,
  ShieldAlert,
  Workflow,
} from 'lucide-react';

interface DashboardTabProps {
  setActiveTab: (tab: 'dashboard' | 'analytics' | 'orders' | 'catalog' | 'crm' | 'reviews' | 'settings' | 'loyalty' | 'branding' | 'advice' | 'snippets' | 'cron' | 'audit-logs' | 'coupons' | 'gallery') => void;
  setActiveSettingsSubTab: (sub: 'general' | 'banners' | 'coupons' | 'shipping' | 'loyalty' | 'faq' | 'logs' | 'notifications' | 'operators' | 'payment' | 'security' | 'gifts' | 'delivery' | 'homepage') => void;
  analyticsRange: 'today' | '7d' | '30d' | 'month' | 'all' | 'custom';
  setAnalyticsRange: (range: 'today' | '7d' | '30d' | 'month' | 'all' | 'custom') => void;
  customDateFrom: string;
  setCustomDateFrom: (date: string) => void;
  customDateTo: string;
  setCustomDateTo: (date: string) => void;
}

// ─── Executive KPI Card Component ──────────────────────────────────────────────

interface KpiCardProps {
  id: string;
  label: string;
  raw: number;
  suffix: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number; style?: React.CSSProperties }>;
  color: string;
  isDark: boolean;
  sparklineData?: number[];
  badgeText?: string;
  badgePositive?: boolean;
  isCustomizeMode?: boolean;
  isPinned?: boolean;
  onTogglePin?: () => void;
  onToggleHide?: () => void;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

function KpiCard({
  label,
  raw,
  suffix,
  icon: Icon,
  color,
  isDark,
  sparklineData,
  badgeText,
  badgePositive = true,
  isCustomizeMode,
  isPinned,
  onTogglePin,
  onToggleHide,
  onMoveLeft,
  onMoveRight,
  isFirst,
  isLast,
}: KpiCardProps) {
  // Kinetic counter
  const [value, setValue] = useState(0);

  React.useEffect(() => {
    let start = 0;
    const end = Math.round(raw);
    if (start === end) {
      setValue(end);
      return;
    }
    const duration = 800;
    const stepTime = 16;
    const increment = Math.max(1, Math.ceil(end / (duration / stepTime)));

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

  // Micro SVG sparkline
  const renderSparkline = () => {
    if (!sparklineData || sparklineData.length < 2) return null;
    const points = sparklineData.slice(-7);
    const max = Math.max(...points, 1);
    const min = Math.min(...points, 0);
    const range = max - min || 1;

    const width = 80;
    const height = 28;
    const pad = 2;

    const pts = points.map((val, idx) => {
      const x = pad + (idx / (points.length - 1)) * (width - pad * 2);
      const y = pad + (height - pad * 2) - ((val - min) / range) * (height - pad * 2);
      return `${x},${y}`;
    });

    const lineD = `M ${pts.join(' L ')}`;
    const areaD = `${lineD} L ${width - pad},${height} L ${pad},${height} Z`;
    const gradId = `sparkGrad-${label.replace(/\s+/g, '')}`;

    return (
      <div className="w-20 h-7 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
        <svg width={width} height={height} className="overflow-visible">
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path d={areaD} fill={`url(#${gradId})`} />
          <path d={lineD} fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          {pts.length > 0 && (() => {
            const lastPt = pts[pts.length - 1].split(',');
            return <circle cx={lastPt[0]} cy={lastPt[1]} r="2" fill={color} className="animate-pulse" />;
          })()}
        </svg>
      </div>
    );
  };

  return (
    <div
      className={`group relative flex flex-col justify-between min-h-[154px] p-4 rounded-lg transition-all duration-200 overflow-hidden ${
        isCustomizeMode ? 'ring-2 ring-emerald-500/50' : ''
      }`}
      style={{
        background: isDark
          ? 'hsl(224,25%,9%)'
          : '#ffffff',
        border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.07)',
        boxShadow: isDark ? 'none' : '0 1px 2px rgba(15,30,54,0.03)',
      }}
    >
      {/* Customize overlay controls */}
      {isCustomizeMode && (
        <div className="absolute top-2 right-2 z-30 flex items-center gap-1 p-1 rounded-lg bg-slate-950/90 border border-slate-700 text-white">
          {!isFirst && (
            <button
              onClick={onMoveLeft}
              className="p-1 rounded hover:bg-slate-800 text-slate-300 cursor-pointer"
              title="Déplacer à gauche"
            >
              <MoveLeft className="w-3.5 h-3.5" />
            </button>
          )}
          {!isLast && (
            <button
              onClick={onMoveRight}
              className="p-1 rounded hover:bg-slate-800 text-slate-300 cursor-pointer"
              title="Déplacer à droite"
            >
              <MoveRight className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={onTogglePin}
            className={`p-1 rounded cursor-pointer ${isPinned ? 'bg-amber-500 text-slate-950 font-bold' : 'hover:bg-slate-800 text-slate-300'}`}
            title={isPinned ? 'Dépingler' : 'Épingler'}
          >
            <Pin className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onToggleHide}
            className="p-1 rounded hover:bg-rose-500/30 text-rose-400 cursor-pointer"
            title="Masquer le widget"
          >
            <EyeOff className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header: Label + Icon */}
      <div className="flex items-center justify-between gap-2 relative z-10">
        <div className="flex items-center gap-1.5 min-w-0">
          {isPinned && <Pin className="w-3 h-3 text-amber-500 shrink-0" />}
          <span
            className="text-[10px] font-bold uppercase tracking-wider block truncate"
            style={{ color: isDark ? '#64748b' : '#94a3b8' }}
          >
            {label}
          </span>
        </div>
        {!isCustomizeMode && (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105"
            style={{
              background: `${color}18`,
              border: `1px solid ${color}30`,
            }}
          >
            <Icon className="w-4 h-4" style={{ color }} strokeWidth={2} />
          </div>
        )}
      </div>

      {/* Body: Kinetic number + Sparkline */}
      <div className="flex items-end justify-between gap-2 mt-5 relative z-10">
        <div>
          <h3
            className="text-[26px] font-black tracking-tight leading-none tabular-nums"
            style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}
          >
            {value.toLocaleString('fr-FR')}
            {suffix && (
              <span className="text-[11px] font-bold ml-1 font-sans opacity-60">
                {suffix.trim()}
              </span>
            )}
          </h3>
          {badgeText && (
            <div className="flex items-center gap-1 mt-1.5">
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 rounded inline-flex items-center gap-0.5"
                style={{
                  background: badgePositive ? 'rgba(16,185,129,0.12)' : 'rgba(244,63,94,0.12)',
                  color: badgePositive ? '#10b981' : '#f43f5e',
                  border: badgePositive ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(244,63,94,0.2)',
                }}
              >
                {badgePositive ? '↑' : '↓'} {badgeText}
              </span>
            </div>
          )}
        </div>
        {renderSparkline()}
      </div>
    </div>
  );
}

// ─── Main Dashboard Tab Component ────────────────────────────────────────────

export const DashboardTab: React.FC<DashboardTabProps> = ({
  setActiveTab,
  setActiveSettingsSubTab,
  analyticsRange,
  setAnalyticsRange,
  customDateFrom,
  setCustomDateFrom,
  customDateTo,
  setCustomDateTo,
}) => {
  const {
    orders,
    getDashboardStats,
    abandonedCarts,
    adminTheme,
    currentUser,
    operatorsList,
  } = useAdmin();
  const { settings } = useSettings();

  const isDark = adminTheme === 'dark';

  const [chartHoverIdx, setChartHoverIdx] = useState<number | null>(null);
  const [lowStockCount, setLowStockCount] = useState<number | null>(null);
  const [atlasSync, setAtlasSync] = useState<{ lastRun: string; status: string; logs: string }>({ lastRun: '', status: '', logs: '' });
  const [isRetryingAtlas, setIsRetryingAtlas] = useState(false);
  const [atlasRetryMessage, setAtlasRetryMessage] = useState('');
  const lowStockThreshold = settings.lowStockThreshold ?? 5;

  React.useEffect(() => {
    const controller = new AbortController();

    const loadLowStockCount = async () => {
      try {
        const response = await fetch(
          `/api/admin/products?summary=low-stock&lowStockThreshold=${lowStockThreshold}`,
          { signal: controller.signal, cache: 'no-store' }
        );
        const data = await response.json();
        if (response.ok && data.success) {
          setLowStockCount(Number(data.lowStockCount) || 0);
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Failed to load low-stock count:', error);
        }
      }
    };

    void loadLowStockCount();
    return () => controller.abort();
  }, [lowStockThreshold]);

  const loadOperationalHealth = React.useCallback(async () => {
    try {
      const snippetsResponse = await fetch('/api/admin/snippets', { cache: 'no-store' });
      const snippetsData = await snippetsResponse.json().catch(() => null);

      if (snippetsResponse.ok && snippetsData?.success) {
        const atlasSnippet = (snippetsData.snippets || []).find((snippet: any) => snippet.id === 'cron_1782133436889');
        setAtlasSync(atlasSnippet ? {
          lastRun: atlasSnippet.last_run || '',
          status: atlasSnippet.last_run_status || '',
          logs: atlasSnippet.last_run_logs || '',
        } : { lastRun: '', status: '', logs: '' });
      }
    } catch (error) {
      console.error('Failed to load supplier sync health:', error);
    }
  }, []);

  const retryAtlasSync = async () => {
    setIsRetryingAtlas(true);
    setAtlasRetryMessage('');
    try {
      const response = await fetch('/api/admin/atlascom-sync', { method: 'POST' });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Échec de la synchronisation.');
      setAtlasRetryMessage(`${result.updated || 0} mis à jour, ${result.inserted || 0} nouveaux.`);
      await loadOperationalHealth();
    } catch (error: any) {
      setAtlasRetryMessage(error.message || 'Échec de la synchronisation.');
    } finally {
      setIsRetryingAtlas(false);
    }
  };

  React.useEffect(() => {
    void loadOperationalHealth();
  }, [loadOperationalHealth]);

  // Widget Layout Configuration
  const DEFAULT_WIDGETS = [
    { id: 'sales', visible: true, pinned: true },
    { id: 'orders', visible: true, pinned: true },
    { id: 'aov', visible: true, pinned: false },
    { id: 'abandoned', visible: true, pinned: false },
    { id: 'cod_pending', visible: true, pinned: false },
    { id: 'low_stock', visible: true, pinned: false },
  ];

  const [widgetConfig, setWidgetConfig] = useState(DEFAULT_WIDGETS);
  const [isCustomizeMode, setIsCustomizeMode] = useState(false);

  React.useEffect(() => {
    const saved = localStorage.getItem('admin_kpi_widgets_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setWidgetConfig(parsed);
        }
      } catch {
        // Fallback
      }
    }
  }, []);

  const saveWidgetConfig = (newConfig: typeof DEFAULT_WIDGETS) => {
    setWidgetConfig(newConfig);
    localStorage.setItem('admin_kpi_widgets_config', JSON.stringify(newConfig));
  };

  const handleMoveWidget = (index: number, direction: -1 | 1) => {
    const newIdx = index + direction;
    if (newIdx < 0 || newIdx >= widgetConfig.length) return;
    const next = [...widgetConfig];
    const temp = next[index];
    next[index] = next[newIdx];
    next[newIdx] = temp;
    saveWidgetConfig(next);
  };

  const handleTogglePin = (id: string) => {
    const next = widgetConfig.map(w => w.id === id ? { ...w, pinned: !w.pinned } : w);
    saveWidgetConfig(next);
  };

  const handleToggleHide = (id: string) => {
    const next = widgetConfig.map(w => w.id === id ? { ...w, visible: !w.visible } : w);
    saveWidgetConfig(next);
  };

  const handleResetWidgets = () => {
    saveWidgetConfig(DEFAULT_WIDGETS);
  };

  // Compute stats for selected range
  const dashboardStats = useMemo(() => {
    return getDashboardStats(analyticsRange, customDateFrom, customDateTo);
  }, [getDashboardStats, analyticsRange, customDateFrom, customDateTo]);

  // Compute top products for selected range
  const topProductsRanged = useMemo(() => {
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
      endDate = customDateTo ? new Date(customDateTo) : now;
      if (customDateTo) endDate.setHours(23, 59, 59, 999);
    } else {
      startDate = new Date(0);
      endDate = now;
    }

    const inRange = (dStr: string | null | undefined) => {
      if (!dStr) return false;
      const d = new Date(dStr);
      return d >= (startDate || new Date(0)) && d <= (endDate || now);
    };

    const rangedOrders = (orders || []).filter(o =>
      inRange(o.created_at || o.date)
    );

    const revenueMap: Record<string, { title: string; revenue: number; qty: number }> = {};

    rangedOrders
      .filter(o => o.status !== 'Cancelled')
      .forEach(o => {
        o.items?.forEach(item => {
          const key = item.title || `Product-${item.id}`;
          if (!revenueMap[key]) {
            revenueMap[key] = { title: item.title, revenue: 0, qty: 0 };
          }
          revenueMap[key].revenue += (item.price || 0) * (item.quantity || 1);
          revenueMap[key].qty += item.quantity || 1;
        });
      });

    return Object.values(revenueMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [orders, analyticsRange, customDateFrom, customDateTo]);

  // WhatsApp recovery link generator
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

  // Color & Surface styles
  const cardBg = isDark ? 'hsl(224,25%,9%)' : '#ffffff';
  const borderStyle = `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)'}`;
  const textPrimary = isDark ? 'hsl(214,35%,95%)' : 'hsl(222,47%,10%)';
  const textMuted = isDark ? 'hsl(215,22%,46%)' : 'hsl(215,18%,46%)';

  // Recent 6 orders
  const recentOrders = useMemo(() => {
    return [...orders].sort((a, b) => new Date(b.created_at || b.date || 0).getTime() - new Date(a.created_at || a.date || 0).getTime()).slice(0, 6);
  }, [orders]);

  const pendingOperators = operatorsList.filter((op: any) => !op.isActive);

  return (
    <div className="space-y-5 admin-tab-enter pb-10 max-w-[1640px]">

      {/* ── Pending Approvals Banner (Owner only) ────────────────────────────── */}
      {currentUser?.role === 'owner' && pendingOperators.length > 0 && (
        <div
          className="flex items-center justify-between gap-4 p-4 rounded-2xl cursor-pointer group animate-in fade-in duration-300"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(245,158,11,0.10) 0%, rgba(245,158,11,0.05) 100%)'
              : 'linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(245,158,11,0.06) 100%)',
            border: '1px solid rgba(245,158,11,0.30)',
          }}
          onClick={() => {
            setActiveSettingsSubTab('operators');
            setActiveTab('settings');
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', boxShadow: '0 4px 14px rgba(245,158,11,0.35)' }}
            >
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[13px] font-black text-amber-400">
                {pendingOperators.length} demande{pendingOperators.length > 1 ? 's' : ''} d&apos;accès administrateur en attente
              </p>
              <p className="text-[10.5px] font-medium text-amber-300/70">
                {pendingOperators.map((op: any) => op.name).join(', ')} — Cliquez pour approuver ou refuser
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 group-hover:bg-amber-400 transition">
              Gérer les accès →
            </span>
          </div>
        </div>
      )}

      {/* ── Dashboard toolbar ─────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between gap-5 flex-wrap px-1 py-1"
        style={{
          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(15,30,54,0.08)'}`,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: 'rgba(16,185,129,0.12)',
              border: '1px solid rgba(16,185,129,0.22)',
            }}
          >
            <BarChart2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-[18px] font-black tracking-tight" style={{ color: textPrimary }}>
              Tableau de bord
            </p>
            <p className="text-[11px] font-medium" style={{ color: textMuted }}>
              Performance commerciale et opérations en temps réel
            </p>
          </div>
        </div>

        {/* Date range filter pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {(['today', '7d', '30d', 'month', 'all', 'custom'] as const).map(range => {
            const isActive = analyticsRange === range;
            return (
              <button
                key={range}
                onClick={() => setAnalyticsRange(range)}
                className="px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors duration-200"
                style={{
                  background: isActive
                    ? '#0f766e'
                    : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'),
                  border: isActive
                    ? '1px solid #0f766e'
                    : `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
                  color: isActive ? '#ffffff' : (isDark ? '#94a3b8' : '#64748b'),
                }}
              >
                {range === 'today'
                  ? getTodayLabel()
                  : range === '7d'
                  ? '7 Jours'
                  : range === '30d'
                  ? '30 Jours'
                  : range === 'month'
                  ? 'Ce Mois'
                  : range === 'all'
                  ? 'Tout'
                  : 'Personnalisé'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Date Range Picker */}
      {analyticsRange === 'custom' && (
        <div
          className="flex flex-wrap items-center gap-3 rounded-lg px-4 py-3"
          style={{
            background: cardBg,
            border: borderStyle,
          }}
        >
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500">
            Plage personnalisée :
          </span>
          <div className="flex items-center gap-2">
            <label className="text-[9px] font-bold uppercase tracking-wider" style={{ color: textMuted }}>Du</label>
            <input
              type="date"
              value={customDateFrom}
              max={customDateTo || new Date().toISOString().split('T')[0]}
              onChange={e => setCustomDateFrom(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-[11px] font-mono outline-none cursor-pointer"
              style={{
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                border: borderStyle,
                color: textPrimary,
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[9px] font-bold uppercase tracking-wider" style={{ color: textMuted }}>Au</label>
            <input
              type="date"
              value={customDateTo}
              min={customDateFrom}
              max={new Date().toISOString().split('T')[0]}
              onChange={e => setCustomDateTo(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-[11px] font-mono outline-none cursor-pointer"
              style={{
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                border: borderStyle,
                color: textPrimary,
              }}
            />
          </div>
          {customDateFrom && (
            <button
              onClick={() => { setCustomDateFrom(''); setCustomDateTo(''); }}
              className="text-[9px] font-black uppercase px-3 py-1.5 rounded-lg text-rose-500 cursor-pointer"
              style={{
                background: 'rgba(244,63,94,0.1)',
                border: '1px solid rgba(244,63,94,0.2)',
              }}
            >
              Réinitialiser
            </button>
          )}
        </div>
      )}

      {/* ── Supplier synchronization health ───────────────────────────────── */}
      {(() => {
        const changed = atlasSync.logs.match(/Updated\s+(\d+), inserted\s+(\d+)/i);
        const duration = atlasSync.logs.match(/Duration\s+(\d+s)/i);
        const hasRecentSuccess = atlasSync.status === 'success';
        return (
          <section className="rounded-lg px-4 py-3.5" style={{ background: cardBg, border: borderStyle, boxShadow: isDark ? 'none' : '0 1px 2px rgba(15,30,54,0.03)' }}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${hasRecentSuccess ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                  <Workflow className={`h-4 w-4 ${hasRecentSuccess ? 'text-emerald-500' : 'text-rose-500'}`} />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-[12px] font-black" style={{ color: textPrimary }}>Santé Atlascom / WooCommerce</h2>
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${hasRecentSuccess ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-500'}`}>{hasRecentSuccess ? 'Synchronisé' : 'À vérifier'}</span>
                  </div>
                  <p className="mt-0.5 text-[10px] font-medium" style={{ color: textMuted }}>
                    {atlasSync.lastRun ? `Dernière exécution : ${new Date(atlasSync.lastRun).toLocaleString('fr-FR')}` : 'Aucune exécution enregistrée'}
                    {changed ? ` · ${Number(changed[1]) + Number(changed[2])} produits modifiés` : ''}
                    {duration ? ` · ${duration[1]}` : ''}
                  </p>
                  {atlasRetryMessage && <p className={`mt-1 text-[10px] font-semibold ${atlasRetryMessage.includes('Échec') || atlasRetryMessage.includes('configuré') ? 'text-rose-500' : 'text-emerald-600'}`}>{atlasRetryMessage}</p>}
                </div>
              </div>
              <button type="button" onClick={() => void retryAtlasSync()} disabled={isRetryingAtlas} className="po-ui-button po-ui-button--primary po-ui-button--md inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-[10px] font-black text-white transition hover:bg-slate-700 disabled:cursor-wait disabled:opacity-60 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400">
                <RefreshCw className={`h-3.5 w-3.5 ${isRetryingAtlas ? 'animate-spin' : ''}`} />
                {isRetryingAtlas ? 'Synchronisation...' : 'Relancer'}
              </button>
            </div>
          </section>
        );
      })()}

      {/* ── Executive KPI Cards Grid Header Controls ────────────────────────── */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
            Indicateurs Clés (KPIs)
          </span>
          {widgetConfig.some(w => w.pinned) && (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center gap-1">
              <Pin className="w-2.5 h-2.5" /> Widgets Épinglés
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCustomizeMode(!isCustomizeMode)}
            className={`px-3 py-1.5 rounded-lg text-[10.5px] font-bold transition flex items-center gap-1.5 cursor-pointer ${
              isCustomizeMode
                ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                : 'bg-slate-200/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>{isCustomizeMode ? 'Terminer la Personnalisation' : 'Personnaliser KPIs'}</span>
          </button>
          {isCustomizeMode && (
            <button
              type="button"
              onClick={handleResetWidgets}
            className="px-2.5 py-1.5 rounded-lg text-[10.5px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-rose-400 transition flex items-center gap-1 cursor-pointer"
              title="Réinitialiser la disposition"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Réinitialiser</span>
            </button>
          )}
        </div>
      </div>

      {/* Hidden Widgets Drawer when in Customize Mode */}
      {isCustomizeMode && widgetConfig.some(w => !w.visible) && (
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-slate-300 text-xs space-y-2">
          <span className="text-[10px] font-extrabold uppercase text-amber-400 block">Widgets Masqués (Cliquez pour réafficher) :</span>
          <div className="flex items-center gap-2 flex-wrap">
            {widgetConfig.filter(w => !w.visible).map(w => (
              <button
                key={w.id}
                onClick={() => handleToggleHide(w.id)}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-[10.5px] font-bold flex items-center gap-1 hover:border-emerald-500 transition cursor-pointer"
              >
                <Eye className="w-3 h-3 text-emerald-400" />
                <span>{w.id === 'sales' ? "Chiffre d'Affaires" : w.id === 'orders' ? 'Commandes' : w.id === 'aov' ? 'Panier Moyen' : w.id === 'abandoned' ? 'Paniers Abandonnés' : w.id === 'cod_pending' ? 'COD Non Encaissé' : 'Stock Faible'}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Dynamic KPI Cards Grid ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-3">
        {(() => {
          const pendingCodAmount = orders
            .filter(o => o.courier && !o.reconciled && o.status !== 'Cancelled')
            .reduce((sum, o) => sum + (o.total || 0), 0);

          const WIDGET_DEFS: Record<string, any> = {
            sales: {
              label: "Chiffre d'Affaires",
              raw: dashboardStats.totalSales,
              suffix: " DH",
              icon: DollarSign,
              color: "#10b981",
              accentGradient: "#10b981",
              sparklineData: dashboardStats.last7DaysSales.map((d: any) => d.amount),
              badgeText: "Chiffre Brut",
              badgePositive: true,
            },
            orders: {
              label: "Commandes Total",
              raw: dashboardStats.ordersCount,
              suffix: "",
              icon: ShoppingBag,
              color: "#3b82f6",
              accentGradient: "#3b82f6",
              sparklineData: dashboardStats.last7DaysSales.map((d: any) => d.count),
              badgeText: "Total",
              badgePositive: true,
            },
            aov: {
              label: "Panier Moyen",
              raw: dashboardStats.avgOrderValue,
              suffix: " DH",
              icon: TrendingUp,
              color: "#8b5cf6",
              accentGradient: "#8b5cf6",
              sparklineData: dashboardStats.last7DaysSales.map((d: any) => d.count > 0 ? d.amount / d.count : 0),
              badgeText: "Par commande",
              badgePositive: true,
            },
            abandoned: {
              label: "Paniers Abandonnés",
              raw: dashboardStats.abandonedCartsCount,
              suffix: "",
              icon: ClipboardList,
              color: "#f43f5e",
              accentGradient: "#f43f5e",
              badgeText: "À relancer",
              badgePositive: false,
            },
            cod_pending: {
              label: "COD Non Encaissé",
              raw: pendingCodAmount,
              suffix: " DH",
              icon: Truck,
              color: "#f59e0b",
              accentGradient: "#f59e0b",
              badgeText: "En cours livraison",
              badgePositive: true,
            },
            low_stock: {
              label: "Stock Faible (Alertes)",
              raw: lowStockCount ?? 0,
              suffix: " art.",
              icon: AlertTriangle,
              color: "#ef4444",
              accentGradient: "#ef4444",
              badgeText: lowStockCount === null ? "Chargement..." : "Réapprovisionner",
              badgePositive: false,
            },
          };

          const activeWidgets = widgetConfig.filter(w => w.visible);

          return activeWidgets.map((w, index) => {
            const def = WIDGET_DEFS[w.id];
            if (!def) return null;
            return (
              <KpiCard
                key={w.id}
                id={w.id}
                label={def.label}
                raw={def.raw}
                suffix={def.suffix}
                icon={def.icon}
                color={def.color}
                isDark={isDark}
                sparklineData={def.sparklineData}
                badgeText={def.badgeText}
                badgePositive={def.badgePositive}
                isCustomizeMode={isCustomizeMode}
                isPinned={w.pinned}
                onTogglePin={() => handleTogglePin(w.id)}
                onToggleHide={() => handleToggleHide(w.id)}
                onMoveLeft={() => handleMoveWidget(index, -1)}
                onMoveRight={() => handleMoveWidget(index, 1)}
                isFirst={index === 0}
                isLast={index === activeWidgets.length - 1}
              />
            );
          });
        })()}
      </div>

      {/* ── Main Section: Sales Trend SVG Chart & Status Breakdown ─────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* Sales Trend SVG Area Chart (2 cols) */}
        <div
          className="xl:col-span-2 rounded-lg p-5 flex flex-col justify-between relative overflow-hidden transition-all duration-200"
          style={{
            background: cardBg,
            border: borderStyle,
            boxShadow: isDark ? 'none' : '0 1px 2px rgba(15,30,54,0.03)',
          }}
        >
          {/* Card Header */}
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)' }}
              >
                <BarChart2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-[13px] font-black leading-tight" style={{ color: textPrimary }}>
                  Évolution des ventes
                </h3>
                <p className="text-[10px] font-medium" style={{ color: textMuted }}>
                  Tendance sur les 7 derniers jours
                </p>
              </div>
            </div>

            <div
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10.5px] font-bold tabular-nums"
              style={{
                background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.2)',
                color: '#10b981',
              }}
            >
              {dashboardStats.totalSales.toFixed(0)} DH
            </div>
          </div>

          {/* SVG Chart */}
          {(() => {
            const chartData = dashboardStats.last7DaysSales;
            const W = 600, H = 190, padL = 44, padR = 12, padT = 10, padB = 28;
            const innerW = W - padL - padR;
            const innerH = H - padT - padB;
            const maxVal = Math.max(...chartData.map((d: any) => d.amount), 1);
            const pts = chartData.map((d: any, i: number) => ({
              x: padL + (i / Math.max(chartData.length - 1, 1)) * innerW,
              y: padT + innerH - (d.amount / maxVal) * innerH,
              ...d,
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
            const areaPath = linePath ? `${linePath} L ${pts[pts.length - 1].x},${padT + innerH} L ${pts[0].x},${padT + innerH} Z` : '';
            const gridVals = [0, 0.25, 0.5, 0.75, 1].map(f => ({ y: padT + innerH - f * innerH, label: Math.round(f * maxVal).toLocaleString('fr-FR') }));
            const showEvery = chartData.length > 14 ? 4 : chartData.length > 7 ? 2 : 1;

            return (
              <div className="relative w-full h-52 mt-2" onMouseLeave={() => setChartHoverIdx(null)}>
                <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full h-full">
                  <defs>
                    <linearGradient id="dashboardAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.28" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="dashboardLineGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="50%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal grid lines */}
                  {gridVals.map((g, i) => (
                    <g key={i}>
                      <line x1={padL} y1={g.y} x2={W - padR} y2={g.y} stroke={isDark ? '#1e293b' : '#f1f5f9'} strokeWidth="1" strokeDasharray="3,6" />
                      <text x={padL - 6} y={g.y + 3} textAnchor="end" fontSize="8" fill={isDark ? '#475569' : '#94a3b8'} fontFamily="monospace">{g.label}</text>
                    </g>
                  ))}

                  {areaPath && <path d={areaPath} fill="url(#dashboardAreaGrad)" />}
                  {linePath && <path d={linePath} fill="none" stroke="url(#dashboardLineGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}

                  {/* X axis labels */}
                  {pts.map((pt: any, i: number) => i % showEvery === 0 && (
                    <text key={i} x={pt.x} y={H - 4} textAnchor="middle" fontSize="8" fill={isDark ? '#475569' : '#94a3b8'} fontFamily="monospace">{pt.date}</text>
                  ))}

                  {/* Interactive points */}
                  {pts.map((pt: any, i: number) => (
                    <g key={i} onMouseEnter={() => setChartHoverIdx(i)} style={{ cursor: 'pointer' }}>
                      <rect x={i === 0 ? pt.x - 10 : (pts[i - 1].x + pt.x) / 2} y={padT} width={i === pts.length - 1 ? 20 : ((i === 0 ? pt.x - 10 : (pts[i - 1].x + pt.x) / 2) - pt.x) * -1 + (i < pts.length - 1 ? (pt.x + pts[i + 1].x) / 2 - pt.x : 10)} height={innerH} fill="transparent" />
                      {chartHoverIdx === i && (
                        <>
                          <line x1={pt.x} y1={padT} x2={pt.x} y2={padT + innerH} stroke="#10b981" strokeWidth="1.5" strokeDasharray="2,2" opacity="0.6" />
                          <circle cx={pt.x} cy={pt.y} r="7" className="animate-ping" fill="none" stroke="#10b981" strokeWidth="1.5" style={{ transformOrigin: `${pt.x}px ${pt.y}px` }} />
                          <circle cx={pt.x} cy={pt.y} r="4" fill={isDark ? '#0f172a' : '#ffffff'} stroke="#10b981" strokeWidth="2.5" />
                        </>
                      )}
                    </g>
                  ))}
                </svg>

                {/* Tooltip */}
                {chartHoverIdx !== null && pts[chartHoverIdx] && (
                  <div
                    className="absolute z-30 pointer-events-none p-3 rounded-2xl border text-[10px] shadow-2xl flex flex-col gap-1 min-w-[150px] animate-fade-in"
                    style={{
                      left: `${(pts[chartHoverIdx].x / W) * 100}%`,
                      top: `${Math.max(10, (pts[chartHoverIdx].y / H) * 100 - 18)}%`,
                      transform: 'translate(-50%, -100%)',
                      background: isDark ? 'hsl(224,28%,9%)' : '#ffffff',
                      border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
                    }}
                  >
                    <span className="font-bold opacity-60" style={{ color: textMuted }}>{pts[chartHoverIdx].date}</span>
                    <span className="font-extrabold text-[12px] text-emerald-500 font-mono">
                      {pts[chartHoverIdx].amount > 0 ? `${pts[chartHoverIdx].amount.toLocaleString('fr-FR')} DH` : '0 DH'}
                    </span>
                    <span className="font-mono text-[9.5px] font-semibold" style={{ color: textMuted }}>
                      {pts[chartHoverIdx].count || 0} commande(s)
                    </span>
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* Order Status Breakdown (1 col) */}
        <div
          className="rounded-lg p-5 flex flex-col justify-between transition-all duration-200"
          style={{
            background: cardBg,
            border: borderStyle,
            boxShadow: isDark ? 'none' : '0 1px 2px rgba(15,30,54,0.03)',
          }}
        >
          <div className="flex items-center gap-2.5 mb-4">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)' }}
            >
              <ClipboardList className="w-4 h-4 text-indigo-500" />
            </div>
            <div>
              <h3 className="text-[13px] font-black leading-tight" style={{ color: textPrimary }}>
                Répartition des statuts
              </h3>
              <p className="text-[10px] font-medium" style={{ color: textMuted }}>
                Aperçu du tunnel de commande
              </p>
            </div>
          </div>

          <div className="space-y-3 flex-1 flex flex-col justify-around py-1">
            {Object.entries(dashboardStats.statusFunnel).map(([status, count]) => {
              const total = dashboardStats.ordersCount || 1;
              const pct = Math.round(((count as number) / total) * 100);

              const statusConfigs: Record<string, { color: string; label: string }> = {
                Pending: { color: '#f59e0b', label: 'En attente' },
                Confirmed: { color: '#3b82f6', label: 'Confirmées' },
                Shipped: { color: '#6366f1', label: 'Expédiées' },
                Delivered: { color: '#10b981', label: 'Livrées' },
                Cancelled: { color: '#f43f5e', label: 'Annulées' },
              };
              const cfg = statusConfigs[status] || { color: '#94a3b8', label: status };

              return (
                <div key={status} className="space-y-1">
                  <div className="flex justify-between items-center text-[10.5px]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ background: cfg.color }} />
                      <span className="font-semibold" style={{ color: textPrimary }}>{cfg.label}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                      <span
                        className="text-[9px] px-1.5 py-0.2 rounded font-bold"
                        style={{
                          background: `${cfg.color}18`,
                          color: cfg.color,
                          border: `1px solid ${cfg.color}30`,
                        }}
                      >
                        {pct}%
                      </span>
                      <span className="font-bold text-[11px]" style={{ color: textPrimary }}>
                        {count as number}
                      </span>
                    </div>
                  </div>
                  <div
                      className="h-1.5 rounded overflow-hidden"
                    style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
                  >
                    <div
                      className="h-full rounded transition-all duration-500"
                      style={{ width: `${pct}%`, background: cfg.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Bottom Section: Recent Orders & Bestsellers ───────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* Recent Orders Card */}
        <div
          className="xl:col-span-2 rounded-lg p-5 flex flex-col justify-between transition-all duration-200 relative overflow-hidden"
          style={{
            background: cardBg,
            border: borderStyle,
            boxShadow: isDark ? 'none' : '0 1px 2px rgba(15,30,54,0.03)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-200 hover:scale-105"
                style={{
                  background: 'rgba(59,130,246,0.11)',
                  border: '1px solid rgba(59,130,246,0.25)',
                }}
              >
                <ShoppingBag className="w-5 h-5 text-blue-500" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-sm font-black tracking-tight leading-tight" style={{ color: textPrimary }}>
                  Dernières commandes
                </h3>
                <p className="text-[11px] font-medium" style={{ color: textMuted }}>
                  Les 6 transactions les plus récentes
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('orders')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[11px] font-extrabold transition-all duration-200 cursor-pointer active:scale-95"
              style={{
                background: isDark ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.08)',
                border: '1px solid rgba(16,185,129,0.25)',
                color: '#10b981',
              }}
            >
              <span>Voir tout</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Orders Feed List */}
          <div className="overflow-x-auto">
            {/* Column Headers */}
            <div
              className="grid min-w-[620px] grid-cols-12 gap-3 px-3 py-2 text-[9.5px] font-black uppercase tracking-widest border-b"
              style={{ color: textMuted, borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,30,54,0.08)' }}
            >
              <div className="col-span-5">Client</div>
              <div className="col-span-3">Statut</div>
              <div className="col-span-2 text-right">Montant</div>
              <div className="col-span-2 text-right">Date</div>
            </div>

            {recentOrders.map((order, idx) => {
              // Custom Status Pill Configs
              const statusPills: Record<string, { bg: string; text: string; border: string; label: string; dot: string }> = {
                Confirmed: {
                  bg: isDark ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.1)',
                  text: '#10b981',
                  border: 'rgba(16,185,129,0.25)',
                  label: 'Confirmée',
                  dot: '#10b981',
                },
                Pending: {
                  bg: isDark ? 'rgba(245,158,11,0.12)' : 'rgba(245,158,11,0.1)',
                  text: '#f59e0b',
                  border: 'rgba(245,158,11,0.25)',
                  label: 'En attente',
                  dot: '#f59e0b',
                },
                Shipped: {
                  bg: isDark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.1)',
                  text: '#6366f1',
                  border: 'rgba(99,102,241,0.25)',
                  label: 'Expédiée',
                  dot: '#6366f1',
                },
                Delivered: {
                  bg: isDark ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.1)',
                  text: '#10b981',
                  border: 'rgba(16,185,129,0.25)',
                  label: 'Livrée',
                  dot: '#10b981',
                },
                Cancelled: {
                  bg: isDark ? 'rgba(244,63,94,0.12)' : 'rgba(244,63,94,0.1)',
                  text: '#f43f5e',
                  border: 'rgba(244,63,94,0.25)',
                  label: 'Annulée',
                  dot: '#f43f5e',
                },
              };

              const pill = statusPills[order.status] || {
                bg: 'rgba(148,163,184,0.12)',
                text: '#94a3b8',
                border: 'rgba(148,163,184,0.25)',
                label: order.status,
                dot: '#94a3b8',
              };

              // Gradient avatar palette
              const avatarGradients = [
                'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
                'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
              ];
              const avatarBg = avatarGradients[idx % avatarGradients.length];

              return (
                <div
                  key={order.order_id || idx}
                  onClick={() => setActiveTab('orders')}
                  className="group grid min-w-[620px] grid-cols-12 gap-3 items-center px-3 py-3 border-b transition-colors duration-200 cursor-pointer"
                  style={{
                    background: 'transparent',
                    borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(15,30,54,0.06)',
                  }}
                >
                  {/* Customer Info */}
                  <div className="col-span-5 flex items-center gap-3 min-w-0">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center font-black text-white text-[10px] shrink-0 transition-transform duration-200 group-hover:scale-105"
                      style={{ background: avatarBg }}
                    >
                      {order.customer_name ? order.customer_name.slice(0, 2).toUpperCase() : 'CL'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-extrabold text-[12.5px] truncate transition-colors group-hover:text-emerald-500" style={{ color: textPrimary }}>
                        {order.customer_name || 'Client Officinal'}
                      </p>
                      <p className="text-[10px] font-mono truncate opacity-70" style={{ color: textMuted }}>
                        {order.city || 'Maroc'}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="col-span-3">
                    <span
                      className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-extrabold"
                      style={{
                        background: pill.bg,
                        color: pill.text,
                        border: `1px solid ${pill.border}`,
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: pill.dot }} />
                      {pill.label}
                    </span>
                  </div>

                  {/* Amount */}
                  <div className="col-span-2 text-right">
                    <span className="font-extrabold font-mono text-[12.5px] text-emerald-500">
                      {(order.total || 0).toLocaleString('fr-FR')} <span className="text-[9.5px] font-sans font-bold">DH</span>
                    </span>
                  </div>

                  {/* Date */}
                  <div className="col-span-2 text-right">
                    <span
                      className="inline-block px-2 py-0.5 rounded text-[9.5px] font-mono font-bold"
                      style={{
                        background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                        color: textMuted,
                      }}
                    >
                      {new Date(order.created_at || order.date || Date.now()).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>
              );
            })}

            {recentOrders.length === 0 && (
              <div className="py-12 text-center text-[11px] italic" style={{ color: textMuted }}>
                Aucune commande enregistrée
              </div>
            )}
          </div>
        </div>

        {/* Top 5 Bestsellers (1 col) */}
        <div
          className="rounded-lg p-5 flex flex-col justify-between transition-all duration-200"
          style={{
            background: cardBg,
            border: borderStyle,
            boxShadow: isDark ? 'none' : '0 1px 2px rgba(15,30,54,0.03)',
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-2.5 mb-4">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)' }}
            >
              <Package className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <h3 className="text-[13px] font-black leading-tight" style={{ color: textPrimary }}>
                Top 5 Bestsellers
              </h3>
              <p className="text-[10px] font-medium" style={{ color: textMuted }}>
                Produits générant le plus de CA
              </p>
            </div>
          </div>

          <div className="space-y-3.5 flex-1 flex flex-col justify-around">
            {topProductsRanged.map((p, idx) => {
              const maxRev = topProductsRanged[0]?.revenue || 1;
              const pct = Math.min(100, Math.max(4, (p.revenue / maxRev) * 100));

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between gap-2 text-[11px]">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-4 h-4 rounded-full flex items-center justify-center text-[8.5px] font-black shrink-0"
                        style={{
                          background: idx === 0
                            ? 'rgba(245,158,11,0.2)'
                            : idx === 1
                            ? 'rgba(148,163,184,0.2)'
                            : idx === 2
                            ? 'rgba(217,119,6,0.2)'
                            : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'),
                          color: idx === 0 ? '#f59e0b' : idx === 1 ? '#94a3b8' : idx === 2 ? '#d97706' : textMuted,
                        }}
                      >
                        {idx + 1}
                      </span>
                      <span className="font-bold truncate" style={{ color: textPrimary }}>
                        {p.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-[10px] shrink-0">
                      <span style={{ color: textMuted }}>{p.qty} v.</span>
                      <span className="font-bold text-emerald-500">
                        {p.revenue.toLocaleString('fr-FR')} DH
                      </span>
                    </div>
                  </div>

                  <div
                    className="h-1.5 rounded-full overflow-hidden"
                    style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        background: 'linear-gradient(90deg, #10b981 0%, #06b6d4 100%)',
                      }}
                    />
                  </div>
                </div>
              );
            })}

            {topProductsRanged.length === 0 && (
              <p className="text-[11px] text-center italic py-6" style={{ color: textMuted }}>
                Aucune vente enregistrée sur cette période
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Abandoned Carts Recovery Card ────────────────────────────────────── */}
      {abandonedCarts && abandonedCarts.length > 0 && (
        <div
          className="rounded-lg p-5 transition-all duration-200 space-y-4"
          style={{
            background: cardBg,
            border: borderStyle,
            boxShadow: isDark ? 'none' : '0 1px 2px rgba(15,30,54,0.03)',
          }}
        >
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.25)' }}
              >
                <ClipboardList className="w-4 h-4 text-rose-500" />
              </div>
              <div>
                <h3 className="text-[13px] font-black leading-tight" style={{ color: textPrimary }}>
                  Relance des paniers abandonnés
                </h3>
                <p className="text-[10px] font-medium" style={{ color: textMuted }}>
                  Relancez directement vos clients sur WhatsApp
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('orders')}
              className="flex items-center gap-1 text-[11px] font-bold text-emerald-500 hover:text-emerald-400 transition cursor-pointer"
            >
              Gérer la relance <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {abandonedCarts.slice(0, 3).map((cart: AbandonedCart, idx: number) => {
              const itemsCount = cart.items?.length || 0;
              return (
                <div
                  key={cart.phone || idx}
                  className="flex flex-col justify-between p-3.5 rounded-xl space-y-3 transition"
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[11.5px] font-bold" style={{ color: textPrimary }}>
                        {cart.name || 'Client Inconnu'}
                      </p>
                      <p className="text-[9.5px] font-mono" style={{ color: textMuted }}>
                        {cart.phone || 'Pas de numéro'}
                      </p>
                    </div>
                    <span className="font-mono font-bold text-[11.5px] text-emerald-500">
                      {(cart.total || 0).toLocaleString('fr-FR')} DH
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="text-[9.5px] font-semibold" style={{ color: textMuted }}>
                      {itemsCount} article{itemsCount > 1 ? 's' : ''} en attente
                    </span>

                    <a
                      href={buildCartRecoveryLink(cart, 'Fr')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-bold text-white transition active:scale-95"
                      style={{
                        background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                        boxShadow: '0 2px 8px rgba(37,211,102,0.3)',
                      }}
                    >
                      <MessageSquare className="w-3 h-3" />
                      Relancer WhatsApp
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
