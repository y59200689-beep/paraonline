'use client';

import React from 'react';
import { useAdmin } from '@/context/AdminContext';
import {
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Percent,
  XCircle,
  Tag,
  BarChart2,
  Table,
  Download,
  Globe
} from 'lucide-react';

interface AnalyticsTabProps {
  analyticsRange: 'today' | '7d' | '30d' | 'month' | 'all' | 'custom';
  setAnalyticsRange: (range: 'today' | '7d' | '30d' | 'month' | 'all' | 'custom') => void;
  customDateFrom: string;
  setCustomDateFrom: (date: string) => void;
  customDateTo: string;
  setCustomDateTo: (date: string) => void;
  analyticsSortCol: 'date' | 'orders' | 'gross' | 'net' | 'avg';
  setAnalyticsSortCol: (col: 'date' | 'orders' | 'gross' | 'net' | 'avg') => void;
  analyticsSortDir: 'asc' | 'desc';
  setAnalyticsSortDir: (dir: 'asc' | 'desc') => void;
  analyticsChartHoverIdx: number | null;
  setAnalyticsChartHoverIdx: (idx: number | null) => void;
}

interface AnalyticsKpiCardProps {
  label: string;
  value: number;
  suffix: string;
  icon: React.ComponentType<{ className?: string }>;
  pctChange: number | null;
  inverse?: boolean;
  color: string;
  bg: string;
  theme?: 'light' | 'dark';
}

function AnalyticsKpiCard({ label, value, suffix, icon: Icon, pctChange, inverse = false, color, bg, theme }: AnalyticsKpiCardProps) {
  const [animatedValue, setAnimatedValue] = React.useState(0);
  React.useEffect(() => {
    let start = 0;
    const end = Math.round(value);
    if (start === end) {
      setAnimatedValue(end);
      return;
    }
    
    const duration = 600;
    const stepTime = Math.max(10, Math.abs(Math.floor(duration / Math.max(1, end))));
    const timer = setInterval(() => {
      start += Math.max(1, Math.ceil(end / 25));
      if (start >= end) {
        setAnimatedValue(end);
        clearInterval(timer);
      } else {
        setAnimatedValue(start);
      }
    }, stepTime);
    
    return () => clearInterval(timer);
  }, [value]);

  const isPositive = pctChange !== null && pctChange > 0;
  const isNegative = pctChange !== null && pctChange < 0;
  
  let pctBadge = 'text-slate-500 bg-slate-100 dark:bg-slate-800/80 dark:text-slate-400 border-slate-200 dark:border-slate-700';
  if (pctChange !== null && pctChange !== 0) {
    if (isPositive) {
      pctBadge = inverse 
        ? 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800'
        : 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800';
    } else if (isNegative) {
      pctBadge = inverse
        ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800'
        : 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800';
    }
  }

  return (
    <div className={`relative overflow-hidden rounded-3xl border p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group ${
      theme === 'light'
        ? 'bg-white border-slate-200/90 text-slate-800 shadow-sm shadow-slate-200/50'
        : 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-xl shadow-slate-950/50'
    }`}>
      {/* Background Micro Glow Gradient */}
      <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-10 blur-2xl transition-opacity group-hover:opacity-25 ${
        color.includes('emerald') ? 'bg-emerald-500' :
        color.includes('blue') ? 'bg-blue-500' :
        color.includes('violet') ? 'bg-violet-500' :
        color.includes('indigo') ? 'bg-indigo-500' : 'bg-emerald-500'
      }`} />

      <div className="flex items-center justify-between gap-3 relative z-10">
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border shrink-0 transition-transform duration-300 group-hover:scale-105 ${
          theme === 'light'
            ? 'bg-slate-50 border-slate-200/80 text-slate-700 shadow-xs'
            : 'bg-slate-950 border-slate-800 text-slate-200'
        }`}>
          <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>

        {pctChange !== null && pctChange !== 0 ? (
          <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full border flex items-center gap-1 shrink-0 ${pctBadge}`}>
            <span>{isPositive ? '↑' : '↓'}</span>
            <span>{Math.abs(pctChange)}%</span>
          </span>
        ) : (
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/60 px-2.5 py-1 rounded-full border border-slate-200/60 dark:border-slate-800 shrink-0">
            En direct
          </span>
        )}
      </div>

      <div className="mt-4 relative z-10">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 block truncate">
          {label}
        </span>
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-2xl font-black font-mono tracking-tight">
            {animatedValue.toLocaleString('fr-FR')}
          </span>
          {suffix && (
            <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400">
              {suffix.trim()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
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
  setAnalyticsChartHoverIdx
}) => {
  const { adminTheme, analyticsData, orders, abandonedCarts } = useAdmin();

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

  // Compute analytics for the selected date range
  const data = analyticsData(analyticsRange, customDateFrom, customDateTo, analyticsSortCol, analyticsSortDir);

  const getCohortData = () => {
    const customerOrdersMap: Record<string, typeof orders> = {};
    orders.forEach(o => {
      if (o.status === 'Cancelled' || o.status.toLowerCase().includes('annul')) return;
      const key = o.phone_number || o.customer_name;
      if (!customerOrdersMap[key]) customerOrdersMap[key] = [];
      customerOrdersMap[key].push(o);
    });

    const cohortCohortsMap: Record<string, Set<string>> = {};
    const retentionCountsMap: Record<string, Record<number, Set<string>>> = {};

    Object.entries(customerOrdersMap).forEach(([customerKey, cOrders]) => {
      const sorted = [...cOrders].sort((a, b) => new Date(a.created_at || a.date || 0).getTime() - new Date(b.created_at || b.date || 0).getTime());
      if (sorted.length === 0) return;
      
      const firstOrderDate = new Date(sorted[0].created_at || sorted[0].date || 0);
      const cohortMonth = firstOrderDate.toLocaleDateString('fr-FR', { year: 'numeric', month: '2-digit' });

      if (!cohortCohortsMap[cohortMonth]) {
        cohortCohortsMap[cohortMonth] = new Set();
        retentionCountsMap[cohortMonth] = {};
      }
      cohortCohortsMap[cohortMonth].add(customerKey);

      sorted.slice(1).forEach(order => {
        const orderDate = new Date(order.created_at || order.date || 0);
        const diffYears = orderDate.getFullYear() - firstOrderDate.getFullYear();
        const diffMonths = orderDate.getMonth() - firstOrderDate.getMonth() + (diffYears * 12);
        if (diffMonths > 0) {
          if (!retentionCountsMap[cohortMonth][diffMonths]) {
            retentionCountsMap[cohortMonth][diffMonths] = new Set();
          }
          retentionCountsMap[cohortMonth][diffMonths].add(customerKey);
        }
      });
    });

    const cohortMonths = Object.keys(cohortCohortsMap).sort((a, b) => {
      const [mA, yA] = a.split('/');
      const [mB, yB] = b.split('/');
      return new Date(Number(yB), Number(mB) - 1).getTime() - new Date(Number(yA), Number(mA) - 1).getTime();
    }).slice(0, 6);

    return cohortMonths.map(cohortMonth => {
      const size = cohortCohortsMap[cohortMonth].size;
      const retentionOffsets = [1, 2, 3].map(offset => {
        const repeatCount = retentionCountsMap[cohortMonth][offset]?.size || 0;
        const pct = size > 0 ? Math.round((repeatCount / size) * 100) : 0;
        return { offset, count: repeatCount, pct };
      });
      return {
        cohort: cohortMonth,
        size,
        retention: retentionOffsets
      };
    });
  };

  const cohorts = getCohortData();

  const [funnelHoverIdx, setFunnelHoverIdx] = React.useState<number | null>(null);

  // Helper to filter orders and abandoned carts by range for conversion funnel
  const getFilteredData = () => {
    const now = new Date();
    let startDate = new Date(0);
    let endDate = now;

    if (analyticsRange === 'today') {
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);
    } else if (analyticsRange === '7d') {
      startDate = new Date(now.getTime() - 7 * 86400000);
    } else if (analyticsRange === '30d') {
      startDate = new Date(now.getTime() - 30 * 86400000);
    } else if (analyticsRange === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (analyticsRange === 'custom' && customDateFrom) {
      startDate = new Date(customDateFrom);
      startDate.setHours(0, 0, 0, 0);
      if (customDateTo) {
        endDate = new Date(customDateTo);
        endDate.setHours(23, 59, 59, 999);
      }
    }

    const inRange = (dStr: string) => {
      if (!dStr) return false;
      const d = new Date(dStr);
      return d >= startDate && d <= endDate;
    };

    const rangeOrders = orders.filter(o => inRange(o.created_at || o.date || ''));
    const rangeAbandoned = abandonedCarts.filter(c => inRange(c.date || ''));

    return { rangeOrders, rangeAbandoned };
  };

  const { rangeOrders, rangeAbandoned } = getFilteredData();

  const visits = Math.max(120, Math.round((rangeOrders.length + rangeAbandoned.length) * 12 + 55));
  const addtoCart = Math.max(18, Math.round((rangeOrders.length + rangeAbandoned.length) * 1.8 + 12));
  const checkoutStarts = Math.max(6, rangeOrders.length + rangeAbandoned.length);
  const paidOrders = rangeOrders.filter(o => o.status !== 'Cancelled').length;

  const funnelSteps = [
    { label: 'Visites', count: visits, pctOfVisits: 100, pctOfPrev: 100, desc: 'Sessions sur la boutique' },
    { label: 'Ajouts au panier', count: addtoCart, pctOfVisits: Math.round((addtoCart / Math.max(1, visits)) * 100), pctOfPrev: Math.round((addtoCart / Math.max(1, visits)) * 100), desc: 'Intention d\'achat' },
    { label: 'Débuts de commande', count: checkoutStarts, pctOfVisits: Math.round((checkoutStarts / Math.max(1, visits)) * 100), pctOfPrev: addtoCart > 0 ? Math.round((checkoutStarts / addtoCart) * 100) : 0, desc: 'Saisie coordonnées' },
    { label: 'Commandes payées', count: paidOrders, pctOfVisits: Math.round((paidOrders / Math.max(1, visits)) * 100), pctOfPrev: checkoutStarts > 0 ? Math.round((paidOrders / checkoutStarts) * 100) : 0, desc: 'Conversions réussies' },
  ];

  const cx = 300;
  const funnelInnerW = 320;
  const w0 = funnelInnerW;
  const w1 = Math.max(40, (funnelSteps[1].pctOfVisits / 100) * funnelInnerW);
  const w2 = Math.max(30, (funnelSteps[2].pctOfVisits / 100) * funnelInnerW);
  const w3 = Math.max(20, (funnelSteps[3].pctOfVisits / 100) * funnelInnerW);

  const x_start_0 = cx - w0 / 2;
  const x_end_0 = cx + w0 / 2;
  const y_0 = 10;

  const x_start_1 = cx - w1 / 2;
  const x_end_1 = cx + w1 / 2;
  const y_1 = 82;

  const x_start_2 = cx - w2 / 2;
  const x_end_2 = cx + w2 / 2;
  const y_2 = 154;

  const x_start_3 = cx - w3 / 2;
  const x_end_3 = cx + w3 / 2;
  const y_3 = 226;



  return (
    <div className="space-y-6 admin-tab-enter">
      {/* Range selection header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={`text-xl font-black tracking-tight ${adminTheme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
            Analytiques de la Boutique
          </h1>
        </div>

        {/* Range pills */}
        <div className={`flex items-center gap-1 border rounded-xl p-1 flex-wrap transition-colors duration-200 ${
          adminTheme === 'light' ? 'bg-slate-100/80 border-slate-200/60 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]' : 'bg-slate-900/60 border-slate-900'
        }`}>
          {(['today', '7d', '30d', 'month', 'all', 'custom'] as const).map(range => (
            <button
              key={range}
              onClick={() => setAnalyticsRange(range)}
              className={`px-3.5 py-1.5 rounded-lg font-semibold uppercase tracking-widest transition-all duration-200 border-0 cursor-pointer ${
                analyticsRange === range
                  ? (adminTheme === 'light'
                      ? 'bg-white text-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] border border-slate-200/50 font-bold'
                      : 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700 font-bold')
                  : (adminTheme === 'light'
                      ? 'text-slate-500 hover:text-slate-800 hover:bg-white/40 bg-transparent cursor-pointer'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30 bg-transparent cursor-pointer')
              }`}
              style={{ fontSize: 'var(--admin-text-2xs)' }}
            >
              {range === 'today' ? getTodayLabel() : range === '7d' ? '7 Jours' : range === '30d' ? '30 Jours' : range === 'month' ? 'Ce Mois' : range === 'all' ? 'Tout' : 'Personnalisé'}
            </button>
          ))}
        </div>
      </div>

      {/* Custom date range inputs */}
      {analyticsRange === 'custom' && (
        <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 rounded-xl px-4 py-3 border transition-all duration-200 ${
          adminTheme === 'light' ? 'bg-slate-50 border-slate-200/60 shadow-sm' : 'bg-slate-900/40 border-emerald-500/20'
        }`}>
          <span className={`text-[10px] font-black uppercase tracking-wider shrink-0 ${adminTheme === 'light' ? 'text-emerald-700' : 'text-emerald-400'}`}>
            Plage personnalisée
          </span>
          <div className="flex flex-wrap items-center gap-2 flex-1">
            <div className="flex items-center gap-2">
              <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500 shrink-0">Du</label>
              <input
                type="date"
                value={customDateFrom}
                onChange={e => setCustomDateFrom(e.target.value)}
                className={`text-xs px-2.5 py-1.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                  adminTheme === 'light' ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-200'
                }`}
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500 shrink-0">Au</label>
              <input
                type="date"
                value={customDateTo}
                onChange={e => setCustomDateTo(e.target.value)}
                className={`text-xs px-2.5 py-1.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                  adminTheme === 'light' ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-200'
                }`}
              />
            </div>
          </div>
        </div>
      )}

      {/* 2-Tier Executive KPI Cards Grid */}
      <div className="space-y-4">
        {/* Primary 4 Hero Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AnalyticsKpiCard
            label="CA Brut"
            value={data.currMetrics.gross}
            suffix=" DH"
            icon={DollarSign}
            pctChange={data.pct.gross}
            color="text-emerald-400"
            bg="from-emerald-500/10 to-teal-500/10 border-emerald-900/40"
            theme={adminTheme}
          />
          <AnalyticsKpiCard
            label="Commandes"
            value={data.currMetrics.count}
            suffix=""
            icon={ShoppingBag}
            pctChange={data.pct.count}
            color="text-violet-400"
            bg="from-violet-500/10 to-purple-500/10 border-violet-900/40"
            theme={adminTheme}
          />
          <AnalyticsKpiCard
            label="Panier Moyen"
            value={data.currMetrics.avg}
            suffix=" DH"
            icon={Percent}
            pctChange={data.pct.avg}
            color="text-amber-400"
            bg="from-amber-500/10 to-orange-500/10 border-amber-900/40"
            theme={adminTheme}
          />
          <AnalyticsKpiCard
            label="Marge Nette"
            value={data.currMetrics.netMargin}
            suffix=" DH"
            icon={TrendingUp}
            pctChange={data.pct.netMargin}
            color="text-emerald-400"
            bg="from-emerald-500/10 to-teal-500/10 border-emerald-900/40"
            theme={adminTheme}
          />
        </div>

        {/* Secondary 4 Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <AnalyticsKpiCard
            label="CA Net"
            value={data.currMetrics.net}
            suffix=" DH"
            icon={TrendingUp}
            pctChange={data.pct.net}
            color="text-blue-400"
            bg="from-blue-500/10 to-indigo-500/10 border-blue-900/40"
            theme={adminTheme}
          />
          <AnalyticsKpiCard
            label="LTV Moyen"
            value={data.currMetrics.avgLtv}
            suffix=" DH"
            icon={DollarSign}
            pctChange={data.pct.avgLtv}
            color="text-indigo-400"
            bg="from-indigo-500/10 to-blue-500/10 border-indigo-900/40"
            theme={adminTheme}
          />
          <AnalyticsKpiCard
            label="Annulations"
            value={data.currMetrics.cancelledCount}
            suffix=""
            icon={XCircle}
            pctChange={data.pct.cancelledCount}
            inverse={true}
            color="text-rose-400"
            bg="from-rose-500/10 to-pink-500/10 border-rose-900/40"
            theme={adminTheme}
          />
          <AnalyticsKpiCard
            label="Code Promos"
            value={data.currMetrics.couponsUsed}
            suffix=""
            icon={Tag}
            pctChange={data.pct.couponsUsed}
            color="text-orange-400"
            bg="from-orange-500/10 to-yellow-500/10 border-orange-900/40"
            theme={adminTheme}
          />
        </div>
      </div>

      {/* Dual-line Revenue Chart Card */}
      <div className={`border rounded-3xl p-6 space-y-4 transition duration-300 hover:shadow-lg flex flex-col justify-between ${
        adminTheme === 'light' ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-900/40 border-slate-900'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 animate-fade-in">
          <div className="flex items-center gap-2">
            <BarChart2 className={`w-4 h-4 ${adminTheme === 'light' ? 'text-emerald-600' : 'text-emerald-400'}`} />
            <h3
              className={`font-bold uppercase tracking-widest ${adminTheme === 'light' ? 'text-slate-800' : 'text-slate-300'}`}
              style={{ fontSize: 'var(--admin-text-xs)' }}
            >
              Comparatif de Revenu Brut
            </h3>
          </div>
          
          <div className="flex items-center gap-4 text-[10px] font-bold">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span className={adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'}>Période en cours</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className={adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'}>Période précédente</span>
            </div>
          </div>
        </div>

        {(() => {
          const chartData = data.chartData;
          const W = 600, H = 200, padL = 48, padR = 12, padT = 10, padB = 28;
          const innerW = W - padL - padR;
          const innerH = H - padT - padB;
          const maxVal = Math.max(...chartData.map((d: any) => Math.max(d.amount, d.prevAmount)), 2500);

          const ptsCurr = chartData.map((d: any, i: number) => ({
            x: padL + (i / Math.max(chartData.length - 1, 1)) * innerW,
            y: padT + innerH - (d.amount / maxVal) * innerH,
            ...d
          }));

          const ptsPrev = chartData.map((d: any, i: number) => ({
            x: padL + (i / Math.max(chartData.length - 1, 1)) * innerW,
            y: padT + innerH - (d.prevAmount / maxVal) * innerH,
            ...d
          }));

          const linePathCurr = ptsCurr.length < 2
            ? ''
            : ptsCurr.reduce((acc: string, pt: any, i: number) => {
                if (i === 0) return `M ${pt.x},${pt.y}`;
                const prev = ptsCurr[i - 1];
                const cx1 = prev.x + (pt.x - prev.x) / 2;
                const cy1 = prev.y;
                const cx2 = prev.x + (pt.x - prev.x) / 2;
                const cy2 = pt.y;
                return `${acc} C ${cx1},${cy1} ${cx2},${cy2} ${pt.x},${pt.y}`;
              }, '');

          const linePathPrev = ptsPrev.length < 2
            ? ''
            : ptsPrev.reduce((acc: string, pt: any, i: number) => {
                if (i === 0) return `M ${pt.x},${pt.y}`;
                const prev = ptsPrev[i - 1];
                const cx1 = prev.x + (pt.x - prev.x) / 2;
                const cy1 = prev.y;
                const cx2 = prev.x + (pt.x - prev.x) / 2;
                const cy2 = pt.y;
                return `${acc} C ${cx1},${cy1} ${cx2},${cy2} ${pt.x},${pt.y}`;
              }, '');

          const areaPathCurr = linePathCurr ? `${linePathCurr} L ${ptsCurr[ptsCurr.length-1].x},${padT+innerH} L ${ptsCurr[0].x},${padT+innerH} Z` : '';
          const areaPathPrev = linePathPrev ? `${linePathPrev} L ${ptsPrev[ptsPrev.length-1].x},${padT+innerH} L ${ptsPrev[0].x},${padT+innerH} Z` : '';
          const gridVals = [0, 0.25, 0.5, 0.75, 1].map(f => ({ y: padT + innerH - f * innerH, label: Math.round(f * maxVal).toLocaleString('fr-FR') }));
          const showEvery = chartData.length > 14 ? 4 : chartData.length > 7 ? 2 : 1;

          return (
            <div className="relative w-full h-44 md:h-60" onMouseLeave={() => setAnalyticsChartHoverIdx(null)}>
              <style>{`
                @keyframes chartDraw {
                  from { stroke-dashoffset: 2000; }
                  to { stroke-dashoffset: 0; }
                }
                .chart-line-curr {
                  stroke-dasharray: 2000;
                  animation: chartDraw 1.2s cubic-bezier(.4,0,.2,1) forwards;
                }
                .chart-line-prev {
                  stroke-dasharray: 6,4;
                }
                .chart-area {
                  animation: fadeIn .8s ease forwards;
                }
              `}</style>
              
              <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full h-full">
                <defs>
                  <linearGradient id="areaGradCurr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.01" />
                  </linearGradient>
                  <linearGradient id="areaGradPrev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.005" />
                  </linearGradient>
                </defs>

                {gridVals.map((g, i) => (
                  <g key={i}>
                    <line x1={padL} y1={g.y} x2={W - padR} y2={g.y} stroke={adminTheme === 'light' ? "#e2e8f0" : "#1e293b"} strokeWidth="1" />
                    <text x={padL - 6} y={g.y + 3} textAnchor="end" fontSize="9" fill={adminTheme === 'light' ? "#64748b" : "#475569"} fontFamily="monospace">{g.label}</text>
                  </g>
                ))}

                {areaPathPrev && <path d={areaPathPrev} fill="url(#areaGradPrev)" className="chart-area" />}
                {areaPathCurr && <path d={areaPathCurr} fill="url(#areaGradCurr)" className="chart-area" />}

                {linePathPrev && (
                  <path d={linePathPrev} fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="chart-line-prev" opacity="0.7" />
                )}

                {linePathCurr && (
                  <path d={linePathCurr} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="chart-line-curr" />
                )}

                {ptsCurr.map((pt: any, i: number) => i % showEvery === 0 && (
                  <text key={i} x={pt.x} y={H - 4} textAnchor="middle" fontSize="8" fill={adminTheme === 'light' ? "#64748b" : "#475569"} fontFamily="monospace">{pt.date}</text>
                ))}

                {ptsCurr.map((pt: any, i: number) => (
                  <g key={i} onMouseEnter={() => setAnalyticsChartHoverIdx(i)} style={{ cursor: 'crosshair' }}>
                    <rect
                      x={i === 0 ? pt.x - 10 : (ptsCurr[i-1].x + pt.x) / 2}
                      y={padT}
                      width={i === ptsCurr.length-1 ? 20 : ((i === 0 ? pt.x - 10 : (ptsCurr[i-1].x + pt.x)/2) - pt.x) * -1 + (i < ptsCurr.length-1 ? (pt.x + ptsCurr[i+1].x)/2 - pt.x : 10)}
                      height={innerH}
                      fill="transparent"
                    />
                    
                    {analyticsChartHoverIdx === i && (
                      <>
                        <line x1={pt.x} y1={padT} x2={pt.x} y2={padT + innerH} stroke="#3b82f6" strokeWidth="1" strokeDasharray="3,3" opacity="0.6" />
                        <circle cx={pt.x} cy={pt.y} r="8" className="animate-ping" fill="none" stroke="#3b82f6" strokeWidth="1.5" style={{ transformOrigin: `${pt.x}px ${pt.y}px` }} />
                        <circle cx={pt.x} cy={pt.y} r="4.5" fill={adminTheme === 'light' ? "#ffffff" : "#0f172a"} stroke="#3b82f6" strokeWidth="2.5" />
                        <circle cx={ptsPrev[i].x} cy={ptsPrev[i].y} r="7" className="animate-ping" fill="none" stroke="#10b981" strokeWidth="1" style={{ transformOrigin: `${ptsPrev[i].x}px ${ptsPrev[i].y}px` }} opacity="0.8" />
                        <circle cx={ptsPrev[i].x} cy={ptsPrev[i].y} r="3.5" fill={adminTheme === 'light' ? "#ffffff" : "#0f172a"} stroke="#10b981" strokeWidth="2" />
                      </>
                    )}
                  </g>
                ))}
              </svg>

              {analyticsChartHoverIdx !== null && ptsCurr[analyticsChartHoverIdx] && (
                <div 
                  className={`absolute z-30 pointer-events-none p-3.5 rounded-2xl border text-[10px] leading-snug transition-all duration-150 backdrop-blur-md shadow-2xl flex flex-col gap-1.5 min-w-[170px] ${
                    adminTheme === 'light'
                      ? 'bg-white/80 border-slate-200/50 text-slate-800 shadow-slate-200/30'
                      : 'bg-slate-950/85 border-slate-800/50 text-slate-200 shadow-black/40'
                  }`}
                  style={{
                    left: `${(ptsCurr[analyticsChartHoverIdx].x / W) * 100}%`,
                    top: `${Math.max(10, (ptsCurr[analyticsChartHoverIdx].y / H) * 100 - 18)}%`,
                    transform: 'translate(-50%, -100%)',
                  }}
                >
                  <div className={`font-black border-b pb-1 text-[11px] ${
                    adminTheme === 'light' ? 'border-slate-100 text-slate-900' : 'border-slate-800 text-slate-100'
                  }`}>
                    {ptsCurr[analyticsChartHoverIdx].date}
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-slate-400">Période en cours:</span>
                    <span className="font-extrabold font-mono text-blue-500">
                      {ptsCurr[analyticsChartHoverIdx].amount.toLocaleString('fr-FR')} DH
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Période préc.:</span>
                    <span className="font-extrabold font-mono text-emerald-500">
                      {ptsPrev[analyticsChartHoverIdx].prevAmount.toLocaleString('fr-FR')} DH
                    </span>
                  </div>
                  {ptsPrev[analyticsChartHoverIdx].prevAmount > 0 && (
                    <div className="flex justify-between items-center border-t border-dashed border-slate-100 dark:border-slate-800 pt-1 mt-0.5">
                      <span className="text-slate-500">Variation:</span>
                      <span className={`font-black font-mono ${
                        ptsCurr[analyticsChartHoverIdx].amount >= ptsPrev[analyticsChartHoverIdx].prevAmount
                          ? 'text-emerald-500'
                          : 'text-rose-500'
                      }`}>
                        {ptsCurr[analyticsChartHoverIdx].amount >= ptsPrev[analyticsChartHoverIdx].prevAmount ? '+' : ''}
                        {Math.round(((ptsCurr[analyticsChartHoverIdx].amount - ptsPrev[analyticsChartHoverIdx].prevAmount) / ptsPrev[analyticsChartHoverIdx].prevAmount) * 100)}%
                      </span>
                    </div>
                  )}
                  <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                    {ptsCurr[analyticsChartHoverIdx].count || 0} commande(s)
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </div>



      {/* Daily stats sortable table */}
      <div className={`border rounded-3xl p-6 transition duration-300 hover:shadow-lg ${
        adminTheme === 'light' ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-900/40 border-slate-900'
      }`}>
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Table className={`w-4 h-4 ${adminTheme === 'light' ? 'text-emerald-600' : 'text-emerald-400'}`} />
            <h3 className={`text-xs font-extrabold uppercase tracking-wider ${adminTheme === 'light' ? 'text-slate-800' : 'text-slate-300'}`}>Rapport Journalier des Ventes</h3>
          </div>
          <button
            onClick={() => {
              if (data.sortedDailyRows.length === 0) return;
              const header = ['Date', 'Commandes', 'CA Brut (DH)', 'CA Net (DH)', 'Panier Moyen (DH)'];
              const rows = data.sortedDailyRows.map((r: any) => [
                r.date,
                r.orders,
                r.gross.toFixed(2),
                r.net.toFixed(2),
                r.avg.toFixed(2)
              ]);
              const totalOrders = data.sortedDailyRows.reduce((s: number, r: any) => s + r.orders, 0);
              const totalGross = data.sortedDailyRows.reduce((s: number, r: any) => s + r.gross, 0);
              const totalNet = data.sortedDailyRows.reduce((s: number, r: any) => s + r.net, 0);
              const totalAvg = totalOrders ? totalGross / totalOrders : 0;
              const totalsRow = ['TOTAL', totalOrders, totalGross.toFixed(2), totalNet.toFixed(2), totalAvg.toFixed(2)];
              const csv = [header, ...rows, totalsRow].map(r => r.join(',')).join('\n');
              const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `rapport-ventes-${analyticsRange}-${new Date().toISOString().slice(0,10)}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            disabled={!data?.sortedDailyRows?.length}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              adminTheme === 'light'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                : 'bg-emerald-950/30 border-emerald-800/50 text-emerald-400 hover:bg-emerald-950/50'
            }`}
          >
            <Download className="w-3 h-3" />
            Exporter CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b text-[10px] font-black uppercase tracking-wider ${
                adminTheme === 'light' ? 'border-slate-100 text-slate-400' : 'border-slate-800 text-slate-500'
              }`}>
                {(
                  [
                    { key: 'date', label: 'Date' },
                    { key: 'orders', label: 'Commandes' },
                    { key: 'gross', label: 'CA Brut' },
                    { key: 'net', label: 'CA Net' },
                    { key: 'avg', label: 'Panier Moyen' }
                  ] as const
                ).map(col => {
                  const isSorted = analyticsSortCol === col.key;
                  return (
                    <th 
                      key={col.key}
                      onClick={() => {
                        if (analyticsSortCol === col.key) {
                          setAnalyticsSortDir(analyticsSortDir === 'asc' ? 'desc' : 'asc');
                        } else {
                          setAnalyticsSortCol(col.key);
                          setAnalyticsSortDir('desc');
                        }
                      }}
                      className="py-3 px-4 cursor-pointer hover:bg-slate-500/5 select-none transition duration-150"
                    >
                      <div className="flex items-center gap-1">
                        <span>{col.label}</span>
                        {isSorted && (
                          <span className={adminTheme === 'light' ? 'text-slate-700' : 'text-slate-300'}>
                            {analyticsSortDir === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className={`divide-y text-xs font-mono ${
              adminTheme === 'light' ? 'divide-slate-100 text-slate-700' : 'divide-slate-800 text-slate-300'
            }`}>
              {data.sortedDailyRows.map((row: any, i: number) => (
                <tr 
                  key={i} 
                  style={{ animationDelay: `${i * 20}ms` }}
                  className="hover:bg-slate-500/5 transition duration-150 admin-row-enter"
                >
                  <td className="py-2.5 px-4 font-sans font-medium">
                    {new Date(row.date.split('/').reverse().join('-')).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </td>
                  <td className="py-2.5 px-4 font-bold">{row.orders}</td>
                  <td className="py-2.5 px-4 font-bold text-blue-500">{row.gross.toLocaleString('fr-FR')} DH</td>
                  <td className="py-2.5 px-4 font-bold text-emerald-500">{row.net.toLocaleString('fr-FR')} DH</td>
                  <td className="py-2.5 px-4 font-bold">{Math.round(row.avg).toLocaleString('fr-FR')} DH</td>
                </tr>
              ))}
              {data.sortedDailyRows.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2.5 max-w-[260px] mx-auto">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        adminTheme === 'light' ? 'bg-slate-100 text-slate-400' : 'bg-slate-900/60 text-slate-500'
                      }`}>
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <h4 className={`text-xs font-bold ${adminTheme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>Aucune vente enregistrée</h4>
                      <p className="text-[10px] text-slate-500 leading-normal">
                        Les ventes journalières s&apos;afficheront ici dès que vos premiers clients passeront commande.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
            {data.sortedDailyRows.length > 0 && (
              <tfoot>
                {(() => {
                  const totalOrders = data.sortedDailyRows.reduce((sum: number, r: any) => sum + r.orders, 0);
                  const totalGross = data.sortedDailyRows.reduce((sum: number, r: any) => sum + r.gross, 0);
                  const totalNet = data.sortedDailyRows.reduce((sum: number, r: any) => sum + r.net, 0);
                  const overallAvg = totalOrders ? totalGross / totalOrders : 0;
                  return (
                    <tr className={`border-t font-black text-xs ${
                      adminTheme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-900/30 border-slate-800 text-slate-100'
                    }`}>
                      <td className="py-3 px-4 font-sans font-black">TOTAL</td>
                      <td className="py-3 px-4 font-black">{totalOrders}</td>
                      <td className="py-3 px-4 font-black text-blue-500">{totalGross.toLocaleString('fr-FR')} DH</td>
                      <td className="py-3 px-4 font-black text-emerald-500">{totalNet.toLocaleString('fr-FR')} DH</td>
                      <td className="py-3 px-4 font-black">{Math.round(overallAvg).toLocaleString('fr-FR')} DH</td>
                    </tr>
                  );
                })()}
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Bottom 2 columns: Top Products + Cities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Top Products by Revenue */}
        <div className={`border rounded-3xl p-6 transition duration-300 hover:shadow-lg ${
          adminTheme === 'light' ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-900/40 border-slate-900'
        }`}>
          <div className="flex items-center gap-2 mb-6">
            <ShoppingBag className={`w-4 h-4 ${adminTheme === 'light' ? 'text-emerald-600' : 'text-emerald-400'}`} />
            <h3 className={`text-xs font-extrabold uppercase tracking-wider ${adminTheme === 'light' ? 'text-slate-800' : 'text-slate-300'}`}>Top 10 Produits par CA</h3>
          </div>

          <div className="space-y-4 animate-fade-in">
            {data.topProducts.map((p: any, index: number) => {
              const maxRev = data.topProducts[0]?.revenue || 1;
              const percent = Math.min(100, Math.max(2, (p.revenue / maxRev) * 100));
              return (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-[9px] font-black ${
                        index === 0
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/45 dark:text-amber-300'
                          : index === 1
                          ? 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                          : index === 2
                          ? 'bg-amber-50 text-amber-700 dark:bg-orange-950/35 dark:text-amber-400'
                          : 'bg-slate-50 text-slate-500 dark:bg-slate-900 dark:text-slate-500'
                      }`}>
                        {index + 1}
                      </span>
                      <span className="font-bold truncate text-[11px] leading-tight" title={p.name}>
                        {p.name}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3 shrink-0 font-mono text-[10px]">
                      <span className={adminTheme === 'light' ? 'text-slate-500' : 'text-slate-400'}>{p.qty} Ventes</span>
                      <span className="font-bold text-blue-500">{p.revenue.toLocaleString('fr-FR')} DH</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className={`h-1.5 w-full rounded-full overflow-hidden ${adminTheme === 'light' ? 'bg-slate-100' : 'bg-slate-800'}`}>
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500" 
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {data.topProducts.length === 0 && (
              <p className="text-xs text-slate-500 italic text-center py-8">Aucun produit vendu sur cette période</p>
            )}
          </div>
        </div>

        {/* Right Column: City Geographic distribution */}
        <div className={`border rounded-3xl p-6 transition duration-300 hover:shadow-lg ${
          adminTheme === 'light' ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-900/40 border-slate-900'
        }`}>
          <div className="flex items-center gap-2 mb-6">
            <Globe className={`w-4 h-4 ${adminTheme === 'light' ? 'text-emerald-600' : 'text-emerald-400'}`} />
            <h3 className={`text-xs font-extrabold uppercase tracking-wider ${adminTheme === 'light' ? 'text-slate-800' : 'text-slate-300'}`}>Répartition des Ventes par Ville</h3>
          </div>

          <div className="space-y-4 animate-fade-in">
            {data.cityRows.map((city: any, index: number) => {
              const maxCityRev = data.cityRows[0]?.revenue || 1;
              const percent = Math.min(100, Math.max(2, (city.revenue / maxCityRev) * 100));
              return (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-[9px] font-black ${
                        index === 0
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/45 dark:text-emerald-300'
                          : 'bg-slate-50 text-slate-500 dark:bg-slate-900 dark:text-slate-500'
                      }`}>
                        {index + 1}
                      </span>
                      <span className="font-extrabold text-[11px]">
                        {city.city}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 font-mono text-[10px]">
                      <span className={adminTheme === 'light' ? 'text-slate-500' : 'text-slate-400'}>{city.count} Commandes</span>
                      <span className="font-bold text-emerald-500">{city.revenue.toLocaleString('fr-FR')} DH</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className={`h-1.5 w-full rounded-full overflow-hidden ${adminTheme === 'light' ? 'bg-slate-100' : 'bg-slate-800'}`}>
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500" 
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {data.cityRows.length === 0 && (
              <p className="text-xs text-slate-500 italic text-center py-8">Aucune commande enregistrée sur cette période</p>
            )}
          </div>
        </div>
      </div>

      {/* Cohort Retention Analytics Card */}
      <div className={`mt-6 border rounded-3xl p-6 transition duration-300 hover:shadow-lg ${
        adminTheme === 'light' ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-900/40 border-slate-900'
      }`}>
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className={`w-4 h-4 ${adminTheme === 'light' ? 'text-emerald-600' : 'text-emerald-400'}`} />
          <h3 className={`text-xs font-extrabold uppercase tracking-wider ${adminTheme === 'light' ? 'text-slate-800' : 'text-slate-300'}`}>
            Rétention de la Clientèle par Cohorte (LTV)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b text-[10px] uppercase font-black tracking-wider ${
                adminTheme === 'light' ? 'text-slate-400 border-slate-100' : 'text-slate-500 border-slate-800'
              }`}>
                <th className="py-3 px-4">Mois de Cohorte</th>
                <th className="py-3 px-4">Taille (Clients)</th>
                <th className="py-3 px-4">Mois +1 (Rétention)</th>
                <th className="py-3 px-4">Mois +2 (Rétention)</th>
                <th className="py-3 px-4">Mois +3 (Rétention)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold">
              {cohorts.map((c, i) => (
                <tr key={i} className={adminTheme === 'light' ? 'hover:bg-slate-50/50' : 'hover:bg-slate-950/20'}>
                  <td className="py-4 px-4 font-mono font-bold">{c.cohort}</td>
                  <td className="py-4 px-4 font-mono">{c.size}</td>
                  {c.retention.map((r, ri) => {
                    let colorClass = 'text-slate-400 bg-slate-50 dark:bg-slate-900';
                    if (r.pct > 50) {
                      colorClass = 'bg-emerald-500/20 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 font-bold';
                    } else if (r.pct > 25) {
                      colorClass = 'bg-emerald-500/10 text-emerald-600/80 dark:bg-emerald-500/5 dark:text-emerald-500/80';
                    } else if (r.pct > 0) {
                      colorClass = 'bg-emerald-500/5 text-emerald-500/60';
                    }
                    return (
                      <td key={ri} className="py-4 px-4">
                        <div className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-mono ${colorClass}`}>
                          {r.pct}% ({r.count})
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
              {cohorts.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 italic">
                    Données de cohorte insuffisantes pour cette période
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
