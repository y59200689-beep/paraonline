'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAdmin } from '@/context/AdminContext';
import Link from 'next/link';
import {
  Brain, Search, Shield, ShieldOff, ShieldCheck, Package,
  AlertCircle, CheckCircle2, Loader2, Filter, RefreshCw,
  Sparkles, Eye, X, ChevronLeft, ChevronRight, Info, PackageCheck,
} from 'lucide-react';

interface CatalogueProduct {
  id: number;
  title: string;
  vendor: string;
  category: string;
  price: number;
  image: string;
  inDiagnosticPool: boolean;
  algorithmEligible: boolean;
  manuallyExcluded: boolean;
  hasExplicitData: boolean;
  exclusionInfo?: { excluded_by: string; reason: string; excluded_at: string } | null;
}

interface CatalogueStats {
  total: number;
  totalEligible: number;
  totalManuallyExcluded: number;
  totalWithExplicitData: number;
}

type FilterType = 'all' | 'eligible' | 'excluded' | 'manual_excluded' | 'with_data';

// ─── Product Card ────────────────────────────────────────────────────────────
function ProductCard({
  product,
  isDark,
  onToggle,
  toggling,
}: {
  product: CatalogueProduct;
  isDark: boolean;
  onToggle: (id: number, exclude: boolean) => void;
  toggling: boolean;
}) {
  const [showReason, setShowReason] = useState(false);
  const [reason, setReason] = useState('');

  const handleExclude = () => {
    if (showReason) {
      onToggle(product.id, true);
      setShowReason(false);
    } else {
      setShowReason(true);
    }
  };

  const borderColor = product.inDiagnosticPool
    ? (isDark ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.25)')
    : (isDark ? 'rgba(239,68,68,0.18)' : 'rgba(239,68,68,0.2)');

  const bgColor = product.inDiagnosticPool
    ? (isDark ? 'rgba(16,185,129,0.03)' : 'rgba(16,185,129,0.02)')
    : (isDark ? 'rgba(239,68,68,0.04)' : 'rgba(239,68,68,0.02)');

  return (
    <div style={{
      borderRadius: '14px',
      border: `1px solid ${borderColor}`,
      background: bgColor,
      padding: '14px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      transition: 'all 0.2s',
    }}>
      {/* Image + Info Row */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        {/* Product Image */}
        <div style={{
          width: 52, height: 52, flexShrink: 0, borderRadius: '10px',
          border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)',
          background: isDark ? '#1e293b' : '#f8fafc',
          overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {product.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          ) : (
            <Package size={20} style={{ color: isDark ? '#334155' : '#cbd5e1' }} />
          )}
        </div>

        {/* Title & Meta */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: '12.5px', fontWeight: 700,
            color: isDark ? '#e2e8f0' : '#0f172a',
            margin: 0, lineHeight: '1.3',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {product.title}
          </p>
          <p style={{ fontSize: '10px', color: isDark ? '#475569' : '#94a3b8', margin: '3px 0 0' }}>
            {product.vendor || '—'} · {product.category}
          </p>
          <p style={{ fontSize: '11px', fontWeight: 700, color: isDark ? '#34d399' : '#059669', margin: '2px 0 0' }}>
            {product.price.toLocaleString('fr-MA')} DH
          </p>
        </div>
      </div>

      {/* Status Badges */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
        {product.inDiagnosticPool ? (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            fontSize: '9.5px', fontWeight: 800, padding: '3px 8px', borderRadius: '999px',
            textTransform: 'uppercase', letterSpacing: '0.08em',
            background: isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.1)',
            color: isDark ? '#34d399' : '#059669',
          }}>
            <ShieldCheck size={10} /> Dans le pool IA
          </span>
        ) : (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            fontSize: '9.5px', fontWeight: 800, padding: '3px 8px', borderRadius: '999px',
            textTransform: 'uppercase', letterSpacing: '0.08em',
            background: isDark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.08)',
            color: isDark ? '#f87171' : '#dc2626',
          }}>
            <ShieldOff size={10} /> Exclu du pool
          </span>
        )}
        {product.hasExplicitData && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            fontSize: '9.5px', fontWeight: 800, padding: '3px 8px', borderRadius: '999px',
            textTransform: 'uppercase', letterSpacing: '0.08em',
            background: isDark ? 'rgba(168,85,247,0.12)' : 'rgba(168,85,247,0.08)',
            color: isDark ? '#c084fc' : '#7c3aed',
          }}>
            <Sparkles size={10} /> Données IA
          </span>
        )}
        {product.manuallyExcluded && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            fontSize: '9.5px', fontWeight: 800, padding: '3px 8px', borderRadius: '999px',
            textTransform: 'uppercase', letterSpacing: '0.08em',
            background: isDark ? 'rgba(245,158,11,0.12)' : 'rgba(245,158,11,0.08)',
            color: isDark ? '#fbbf24' : '#b45309',
          }}>
            <AlertCircle size={10} /> Manuel
          </span>
        )}
        {!product.algorithmEligible && !product.manuallyExcluded && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            fontSize: '9.5px', fontWeight: 800, padding: '3px 8px', borderRadius: '999px',
            textTransform: 'uppercase', letterSpacing: '0.08em',
            background: isDark ? 'rgba(100,116,139,0.12)' : 'rgba(100,116,139,0.08)',
            color: isDark ? '#94a3b8' : '#64748b',
          }}>
            <Shield size={10} /> Filtré (algo)
          </span>
        )}
      </div>

      {/* Exclusion reason if manually excluded */}
      {product.manuallyExcluded && product.exclusionInfo && (
        <p style={{ fontSize: '10px', color: isDark ? '#475569' : '#94a3b8', margin: 0, fontStyle: 'italic' }}>
          Exclu par {product.exclusionInfo.excluded_by}
          {product.exclusionInfo.reason ? ` · "${product.exclusionInfo.reason}"` : ''}
        </p>
      )}

      {/* Inline reason input on exclude */}
      {showReason && (
        <div style={{ display: 'flex', gap: '6px' }}>
          <input
            autoFocus
            type="text"
            placeholder="Raison (optionnel)…"
            value={reason}
            onChange={e => setReason(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleExclude(); if (e.key === 'Escape') setShowReason(false); }}
            style={{
              flex: 1, padding: '5px 9px', fontSize: '11px', borderRadius: '8px',
              border: isDark ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(239,68,68,0.3)',
              background: isDark ? 'rgba(239,68,68,0.05)' : 'rgba(239,68,68,0.03)',
              color: isDark ? '#e2e8f0' : '#0f172a', outline: 'none',
            }}
          />
          <button
            onClick={() => setShowReason(false)}
            style={{ padding: '5px', border: 'none', background: 'transparent', cursor: 'pointer', color: isDark ? '#475569' : '#94a3b8' }}
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={() => product.inDiagnosticPool ? handleExclude() : onToggle(product.id, false)}
        disabled={toggling || (showReason && !product.inDiagnosticPool)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          width: '100%', padding: '7px 12px', fontSize: '11px', fontWeight: 700,
          borderRadius: '9px', border: 'none', cursor: toggling ? 'not-allowed' : 'pointer',
          transition: 'all 0.18s',
          background: product.inDiagnosticPool
            ? (isDark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.08)')
            : 'linear-gradient(135deg,#10b981,#0d9488)',
          color: product.inDiagnosticPool
            ? (isDark ? '#f87171' : '#dc2626')
            : '#fff',
          opacity: toggling ? 0.6 : 1,
        }}
      >
        {toggling ? <Loader2 size={12} className="animate-spin" /> : null}
        {product.inDiagnosticPool
          ? (showReason ? 'Confirmer l\'exclusion →' : 'Exclure du pool IA')
          : 'Réintégrer dans le pool IA'}
      </button>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, isDark }: {
  label: string; value: number | string; icon: React.ElementType; color: string; isDark: boolean;
}) {
  return (
    <div style={{
      padding: '16px 18px', borderRadius: '14px',
      border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.07)',
      background: isDark ? 'rgba(255,255,255,0.02)' : '#fafafa',
      display: 'flex', alignItems: 'center', gap: '12px',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: '10px', flexShrink: 0,
        background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={16} style={{ color }} />
      </div>
      <div>
        <p style={{ fontSize: '20px', fontWeight: 900, color: isDark ? '#f1f5f9' : '#0f172a', margin: 0, lineHeight: 1 }}>
          {typeof value === 'number' ? value.toLocaleString('fr-MA') : value}
        </p>
        <p style={{ fontSize: '10px', fontWeight: 600, color: isDark ? '#475569' : '#94a3b8', margin: '3px 0 0', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {label}
        </p>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DiagnosticCataloguePage() {
  const { adminTheme } = useAdmin();
  const isDark = adminTheme === 'dark';

  const [products, setProducts] = useState<CatalogueProduct[]>([]);
  const [stats, setStats] = useState<CatalogueStats>({ total: 0, totalEligible: 0, totalManuallyExcluded: 0, totalWithExplicitData: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('eligible');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [toggling, setToggling] = useState<number | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const LIMIT = 48;

  const fetchProducts = useCallback(async (pg: number, q: string, f: FilterType) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: pg.toString(), limit: LIMIT.toString(), search: q, filter: f });
      const res = await fetch(`/api/admin/diagnostic-catalogue?${params}`);
      const data = await res.json();
      setProducts(data.products || []);
      setStats({
        total: data.total || 0,
        totalEligible: data.totalEligible || 0,
        totalManuallyExcluded: data.totalManuallyExcluded || 0,
        totalWithExplicitData: data.totalWithExplicitData || 0,
      });
      setTotalPages(Math.ceil((data.total || 0) / LIMIT));
    } catch {
      setNotification({ type: 'error', msg: 'Erreur de chargement.' });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts(page, search, filter);
  }, [page, filter, fetchProducts]); // search handled separately with debounce

  const handleSearchChange = (val: string) => {
    setSearch(val);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setPage(1);
      fetchProducts(1, val, filter);
    }, 400);
  };

  const handleFilterChange = (f: FilterType) => {
    setFilter(f);
    setPage(1);
  };

  const handleToggle = async (productId: number, exclude: boolean) => {
    setToggling(productId);
    try {
      const res = await fetch('/api/admin/diagnostic-catalogue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, action: exclude ? 'exclude' : 'include', excludedBy: 'admin' }),
      });
      if (res.ok) {
        setNotification({ type: 'success', msg: exclude ? 'Produit exclu du pool IA.' : 'Produit réintégré dans le pool IA.' });
        // Optimistic update
        setProducts(prev => prev.map(p => p.id === productId ? {
          ...p,
          inDiagnosticPool: !exclude,
          manuallyExcluded: exclude,
        } : p));
        // Refresh stats
        fetchProducts(page, search, filter);
      } else {
        setNotification({ type: 'error', msg: 'Erreur lors de la mise à jour.' });
      }
    } catch {
      setNotification({ type: 'error', msg: 'Erreur réseau.' });
    }
    setToggling(null);
    setTimeout(() => setNotification(null), 3000);
  };

  const filterOptions: { key: FilterType; label: string; count?: number }[] = [
    { key: 'eligible', label: '✅ Dans le pool IA', count: stats.totalEligible },
    { key: 'excluded', label: '🚫 Exclus', count: (stats.total - stats.totalEligible) },
    { key: 'manual_excluded', label: '⚠️ Excl. manuels', count: stats.totalManuallyExcluded },
    { key: 'with_data', label: '✨ Données IA', count: stats.totalWithExplicitData },
    { key: 'all', label: '📦 Tous les produits' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Toast Notification */}
      {notification && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 999,
          padding: '12px 18px', borderRadius: '12px',
          background: notification.type === 'success' ? (isDark ? '#064e3b' : '#d1fae5') : (isDark ? '#450a0a' : '#fee2e2'),
          border: notification.type === 'success' ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(239,68,68,0.4)',
          display: 'flex', alignItems: 'center', gap: '8px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          animation: 'slideIn 0.25s ease',
        }}>
          {notification.type === 'success'
            ? <CheckCircle2 size={16} style={{ color: '#10b981', flexShrink: 0 }} />
            : <AlertCircle size={16} style={{ color: '#ef4444', flexShrink: 0 }} />}
          <span style={{ fontSize: '12px', fontWeight: 600, color: notification.type === 'success' ? '#064e3b' : '#7f1d1d' }}>
            {notification.msg}
          </span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: 'var(--admin-text-xl)', fontWeight: 900, color: isDark ? '#f1f5f9' : '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Brain size={22} style={{ color: '#10b981' }} />
            Catalogue Diagnostic IA
          </h1>
          <p style={{ fontSize: '13px', color: isDark ? '#475569' : '#64748b', margin: '5px 0 0' }}>
            Gérez les produits auxquels l&apos;IA a accès pour générer les routines personnalisées.
          </p>
        </div>
        <button
          onClick={() => fetchProducts(page, search, filter)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 14px', fontSize: '11px', fontWeight: 700, borderRadius: '10px',
            border: isDark ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(0,0,0,0.1)',
            background: 'transparent', color: isDark ? '#64748b' : '#94a3b8', cursor: 'pointer',
          }}
        >
          <RefreshCw size={13} /> Actualiser
        </button>
      </div>

      {/* Sub-nav Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.07)', paddingBottom: '12px' }}>
        <Link
          href="/admin/experience/diagnostic"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '6px 14px', fontSize: '12px', fontWeight: 700, borderRadius: '10px',
            background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
            color: isDark ? '#94a3b8' : '#64748b', textDecoration: 'none',
          }}
        >
          <Brain size={14} /> Questions & Configuration
        </Link>
        <Link
          href="/admin/experience/diagnostic/catalogue"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '6px 14px', fontSize: '12px', fontWeight: 700, borderRadius: '10px',
            background: isDark ? '#10b981' : '#059669', color: '#fff', textDecoration: 'none',
          }}
        >
          <PackageCheck size={14} /> Catalogue IA
        </Link>
      </div>

      {/* Info Banner */}
      <div style={{
        padding: '12px 16px', borderRadius: '12px',
        border: isDark ? '1px solid rgba(99,102,241,0.2)' : '1px solid rgba(99,102,241,0.18)',
        background: isDark ? 'rgba(99,102,241,0.06)' : 'rgba(99,102,241,0.04)',
        display: 'flex', alignItems: 'flex-start', gap: '10px',
      }}>
        <Info size={14} style={{ color: '#6366f1', flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: '11.5px', color: isDark ? '#64748b' : '#64748b', margin: 0, lineHeight: '1.55' }}>
          Le <strong>pool IA</strong> contient tous les produits que le moteur de diagnostic peut recommander.
          Les produits sont filtrés automatiquement par l&apos;algorithme (exclusion des produits corps, dentaires, médicaux…).
          Vous pouvez <strong>exclure manuellement</strong> n&apos;importe quel produit ou <strong>réintégrer</strong> un produit exclu.
          Les produits avec <span style={{ color: '#a855f7' }}>✨ Données IA</span> ont des métadonnées explicites configurées et sont prioritaires dans le classement.
        </p>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
        <StatCard label="Produits live" value={stats.total} icon={Package} color="#6366f1" isDark={isDark} />
        <StatCard label="Dans le pool IA" value={stats.totalEligible} icon={ShieldCheck} color="#10b981" isDark={isDark} />
        <StatCard label="Excl. manuels" value={stats.totalManuallyExcluded} icon={ShieldOff} color="#ef4444" isDark={isDark} />
        <StatCard label="Données IA actives" value={stats.totalWithExplicitData} icon={Sparkles} color="#a855f7" isDark={isDark} />
      </div>

      {/* Filters + Search Row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px', justifyContent: 'space-between' }}>
        {/* Filter Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {filterOptions.map(opt => (
            <button
              key={opt.key}
              onClick={() => handleFilterChange(opt.key)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                padding: '6px 12px', fontSize: '11px', fontWeight: 700,
                borderRadius: '999px', border: 'none', cursor: 'pointer',
                transition: 'all 0.15s',
                background: filter === opt.key
                  ? (isDark ? '#10b981' : '#059669')
                  : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
                color: filter === opt.key ? '#fff' : (isDark ? '#64748b' : '#64748b'),
              }}
            >
              {opt.label}
              {opt.count !== undefined && (
                <span style={{
                  background: filter === opt.key ? 'rgba(255,255,255,0.25)' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'),
                  padding: '0 5px', borderRadius: '999px', fontSize: '9px',
                }}>
                  {opt.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', minWidth: '240px', maxWidth: '320px', flex: 1 }}>
          <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: isDark ? '#475569' : '#94a3b8' }} />
          <input
            type="text"
            placeholder="Rechercher un produit, marque, catégorie…"
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
            style={{
              width: '100%', padding: '8px 10px 8px 30px', fontSize: '12px', borderRadius: '10px',
              border: isDark ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(0,0,0,0.1)',
              background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
              color: isDark ? '#e2e8f0' : '#0f172a', outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px', gap: '12px' }}>
          <Loader2 size={22} className="animate-spin" style={{ color: '#10b981' }} />
          <span style={{ fontSize: '13px', color: isDark ? '#475569' : '#94a3b8' }}>Chargement du catalogue…</span>
        </div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Eye size={32} style={{ color: isDark ? '#334155' : '#cbd5e1', margin: '0 auto 12px' }} />
          <p style={{ fontSize: '14px', fontWeight: 600, color: isDark ? '#475569' : '#94a3b8', margin: 0 }}>
            Aucun produit trouvé
          </p>
          <p style={{ fontSize: '12px', color: isDark ? '#334155' : '#cbd5e1', marginTop: '4px' }}>
            Essayez de modifier le filtre ou la recherche.
          </p>
        </div>
      ) : (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '12px',
          }}>
            {products.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                isDark={isDark}
                onToggle={handleToggle}
                toggling={toggling === product.id}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', paddingTop: '8px' }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  padding: '7px 14px', fontSize: '12px', fontWeight: 600, borderRadius: '10px',
                  border: isDark ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(0,0,0,0.1)',
                  background: 'transparent', color: isDark ? '#64748b' : '#94a3b8',
                  cursor: page <= 1 ? 'not-allowed' : 'pointer', opacity: page <= 1 ? 0.4 : 1,
                }}
              >
                <ChevronLeft size={14} /> Précédent
              </button>
              <span style={{ fontSize: '12px', color: isDark ? '#475569' : '#94a3b8', fontWeight: 600 }}>
                Page {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  padding: '7px 14px', fontSize: '12px', fontWeight: 600, borderRadius: '10px',
                  border: isDark ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(0,0,0,0.1)',
                  background: 'transparent', color: isDark ? '#64748b' : '#94a3b8',
                  cursor: page >= totalPages ? 'not-allowed' : 'pointer', opacity: page >= totalPages ? 0.4 : 1,
                }}
              >
                Suivant <ChevronRight size={14} />
              </button>
            </div>
          )}
        </>
      )}

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-12px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
