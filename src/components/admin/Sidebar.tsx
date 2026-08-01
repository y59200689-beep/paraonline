'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAdmin } from '@/context/AdminContext';
import { useSettings } from '@/context/SettingsContext';
import { AdminUIContextProps } from '@/app/admin/AdminUIContext';
import {
  LayoutDashboard,
  ShoppingBag,
  Table,
  Users,
  Star,
  Sliders,
  Award,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BarChart2,
  BookOpen,
  Palette,
  Code,
  Clock,
  Ticket,
  Shield,
  Images
} from 'lucide-react';

interface SidebarProps {
  activeTab: AdminUIContextProps['activeTab'];
  setActiveTab: AdminUIContextProps['setActiveTab'];
  sidebarCollapsed: boolean;
  setSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  isMobileDrawerOpen: boolean;
  setIsMobileDrawerOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  sidebarCollapsed,
  setSidebarCollapsed,
  isMobileDrawerOpen,
  setIsMobileDrawerOpen
}) => {
  const { orders, reviews, currentUser, adminTheme, handleLogout } = useAdmin();
  const { settings } = useSettings();
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const isDark = adminTheme === 'dark';

  const groups = [
    {
      label: 'Opérations',
      items: [
        { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard, count: orders.filter(o => o.status.toLowerCase() === 'pending').length || undefined, countColor: '#f43f5e' },
        { id: 'analytics', label: 'Statistiques', icon: BarChart2 },
        { id: 'orders', label: 'Commandes', icon: ShoppingBag, count: orders.filter(o => o.status.toLowerCase() === 'pending').length || undefined, countColor: '#f43f5e' },
        { id: 'catalog', label: 'Catalogue', icon: Table },
      ],
    },
    {
      label: 'Clients',
      items: [
        { id: 'crm', label: 'Clients', icon: Users },
        { id: 'loyalty', label: 'Fidélité', icon: Award },
        { id: 'reviews', label: 'Avis Clients', icon: Star, count: reviews.filter(r => r.status === 'pending').length || undefined, countColor: '#f59e0b' },
      ],
    },
    {
      label: 'Boutique',
      items: [
        { id: 'advice', label: 'Espace Conseils', icon: BookOpen },
        { id: 'branding', label: 'Personnalisation', icon: Palette },
        { id: 'gallery', label: 'Galerie Médias', icon: Images },
        { id: 'coupons', label: 'Promotions', icon: Ticket },
        { id: 'settings', label: 'Paramètres', icon: Sliders },
      ],
    },
  ];

  const advancedItems = [
    { id: 'cron', label: 'Automatisations planifiées', icon: Clock },
    { id: 'snippets', label: 'Scripts du site', icon: Code },
    ...(currentUser?.role === 'owner' ? [{ id: 'audit-logs', label: "Journal d'activité", icon: Shield }] : []),
  ];

  useEffect(() => {
    if (['cron', 'snippets', 'audit-logs'].includes(activeTab)) setAdvancedOpen(true);
  }, [activeTab]);

  useEffect(() => {
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMobileDrawerOpen(false);
    };
    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [setIsMobileDrawerOpen]);

  const sidebarStyle: React.CSSProperties = {
    background: isDark
      ? 'linear-gradient(180deg, hsl(224,30%,8%) 0%, hsl(228,28%,6%) 100%)'
      : 'linear-gradient(180deg, #ffffff 0%, hsl(220,20%,98.5%) 100%)',
    borderRight: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.07)',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
  } as React.CSSProperties;

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileDrawerOpen && (
        <div
          onClick={() => setIsMobileDrawerOpen(false)}
          className="fixed inset-0 z-40 md:hidden"
          aria-hidden="true"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' } as React.CSSProperties}
        />
      )}

      <aside
        style={sidebarStyle}
        className={`shrink-0 flex flex-col justify-between transition-all duration-300 h-full overflow-y-auto ${
          isMobileDrawerOpen
            ? 'fixed inset-y-0 left-0 w-64 z-50 flex shadow-2xl animate-slide-in'
            : 'hidden md:flex'
        } ${sidebarCollapsed ? 'md:w-[68px]' : 'md:w-64'}`}
        aria-label="Navigation principale de l'administration"
      >
        {/* ── TOP SECTION ───────────────────────────────────────────── */}
        <div className="flex flex-col gap-5 p-3">

          {/* Brand mark */}
          <div className={`flex items-center gap-3 px-2 pt-1 ${sidebarCollapsed ? 'justify-center' : ''}`}>
            {/* Logo */}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-[13px] shrink-0 tracking-tight"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #0891b2 100%)',
                boxShadow: isDark
                  ? '0 4px 16px rgba(16,185,129,0.35), 0 0 0 1px rgba(16,185,129,0.2)'
                  : '0 4px 12px rgba(16,185,129,0.30)',
              } as React.CSSProperties}
            >
              PO
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <h2 className={`font-black text-[13px] tracking-tight leading-tight truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {settings?.storeName || 'Para Officinal'}
                </h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-semibold" style={{ color: isDark ? '#475569' : '#94a3b8' }}>
                    Boutique active
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Nav groups */}
          <nav className="space-y-1">
            {groups.map((group, gIdx) => (
              <div key={group.label} className={gIdx > 0 ? 'pt-4' : ''}>
                {/* Group divider */}
                {gIdx > 0 && (
                  <div
                    className="mb-2 mx-2"
                    style={{ height: '1px', background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)' }}
                  />
                )}

                {/* Group label */}
                {!sidebarCollapsed && (
                  <p
                    className="px-3 mb-1.5 text-[9px] font-black uppercase tracking-[0.2em]"
                    style={{ color: isDark ? '#2d3a4d' : '#c4cdd9' }}
                  >
                    {group.label}
                  </p>
                )}

                {/* Items */}
                <div className="space-y-0.5">
                  {group.items.map(item => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    const count = (item as any).count as number | undefined;
                    const countColor = (item as any).countColor as string | undefined;

                    return (
                      <Link
                        key={item.id}
                        href={item.id === 'dashboard' ? '/admin' : `/admin/${item.id}`}
                        prefetch={true}
                        title={sidebarCollapsed ? item.label : undefined}
                        onClick={() => {
                          if (item.id === 'orders') window.dispatchEvent(new Event('admin:open-orders-list'));
                          setIsMobileDrawerOpen(false);
                        }}
                        className={`relative flex items-center rounded-xl border transition-all duration-150 cursor-pointer select-none group ${
                          sidebarCollapsed ? 'justify-center px-2 py-2.5' : 'justify-between px-3 py-2.5'
                        }`}
                        style={{
                          background: isActive
                            ? (isDark
                              ? 'linear-gradient(135deg, rgba(16,185,129,0.13) 0%, rgba(99,102,241,0.08) 100%)'
                              : 'linear-gradient(135deg, rgba(16,185,129,0.09) 0%, rgba(99,102,241,0.05) 100%)')
                            : 'transparent',
                          borderColor: isActive
                            ? (isDark ? 'rgba(16,185,129,0.22)' : 'rgba(16,185,129,0.28)')
                            : 'transparent',
                          boxShadow: isActive && isDark ? 'inset 0 0 0 1px rgba(16,185,129,0.07)' : 'none',
                        } as React.CSSProperties}
                        onMouseEnter={e => {
                          if (!isActive) {
                            (e.currentTarget as HTMLElement).style.background = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
                          }
                        }}
                        onMouseLeave={e => {
                          if (!isActive) {
                            (e.currentTarget as HTMLElement).style.background = 'transparent';
                          }
                        }}
                      >
                        <div className={`flex items-center ${sidebarCollapsed ? '' : 'gap-2.5'} min-w-0`}>
                          {/* Left accent bar for active */}
                          {isActive && !sidebarCollapsed && (
                            <div
                              className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                              style={{ background: 'linear-gradient(180deg, #10b981, #6366f1)' }}
                            />
                          )}
                          <Icon
                            className="w-4 h-4 shrink-0"
                            style={{
                              color: isActive
                                ? (isDark ? '#34d399' : '#059669')
                                : (isDark ? '#3d4f65' : '#b0bcc9'),
                              transition: 'color 0.15s',
                            }}
                          />
                          {!sidebarCollapsed && (
                            <span
                              className="text-[12px] font-semibold truncate"
                              style={{
                                color: isActive
                                  ? (isDark ? '#d1fae5' : '#065f46')
                                  : (isDark ? '#64748b' : '#64748b'),
                                fontWeight: isActive ? 700 : 500,
                              }}
                            >
                              {item.label}
                            </span>
                          )}
                        </div>

                        {/* Count badge — expanded */}
                        {!sidebarCollapsed && count !== undefined && count > 0 && (
                          <span
                            className="text-white font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center shrink-0 text-[9px]"
                            style={{ background: countColor || '#10b981' }}
                          >
                            {count}
                          </span>
                        )}

                        {/* Count dot — collapsed */}
                        {sidebarCollapsed && count !== undefined && count > 0 && (
                          <span
                            className="absolute top-1 right-1 w-2 h-2 rounded-full border-2"
                            style={{
                              background: countColor || '#10b981',
                              borderColor: isDark ? 'hsl(224,30%,8%)' : '#fff',
                            }}
                          />
                        )}

                        {/* Active dot — collapsed */}
                        {isActive && sidebarCollapsed && (
                          <span
                            className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                            style={{ background: '#10b981' }}
                          />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="pt-4">
              <div
                className="mb-2 mx-2"
                style={{ height: '1px', background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)' }}
              />
              <button
                type="button"
                onClick={() => setAdvancedOpen(open => !open)}
                aria-expanded={advancedOpen}
                className={`w-full flex items-center rounded-xl border transition-all duration-150 cursor-pointer select-none ${
                  sidebarCollapsed ? 'justify-center px-2 py-2.5' : 'justify-between px-3 py-2.5'
                }`}
                style={{
                  color: isDark ? '#64748b' : '#64748b',
                  borderColor: 'transparent',
                  background: advancedOpen ? (isDark ? 'rgba(255,255,255,0.035)' : 'rgba(15,23,42,0.035)') : 'transparent',
                }}
                title={sidebarCollapsed ? 'Configuration avancée' : undefined}
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <Sliders className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span className="text-[11px] font-bold">Configuration avancée</span>}
                </span>
                {!sidebarCollapsed && <ChevronRight className={`w-3.5 h-3.5 transition-transform ${advancedOpen ? 'rotate-90' : ''}`} />}
              </button>
              {advancedOpen && (
                <div className="mt-1 space-y-0.5">
                  {advancedItems.map(item => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <Link
                        key={item.id}
                        href={`/admin/${item.id}`}
                        prefetch={true}
                        onClick={() => setIsMobileDrawerOpen(false)}
                        className={`relative flex items-center rounded-xl border transition-all duration-150 cursor-pointer select-none ${
                          sidebarCollapsed ? 'justify-center px-2 py-2.5' : 'gap-2.5 px-3 py-2.5'
                        }`}
                        style={{
                          background: isActive ? (isDark ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.08)') : 'transparent',
                          color: isActive ? (isDark ? '#6ee7b7' : '#047857') : (isDark ? '#64748b' : '#64748b'),
                          borderColor: isActive ? (isDark ? 'rgba(16,185,129,0.22)' : 'rgba(16,185,129,0.2)') : 'transparent',
                        }}
                        title={sidebarCollapsed ? item.label : undefined}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        {!sidebarCollapsed && <span className="text-[11px] font-semibold truncate">{item.label}</span>}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* ── BOTTOM SECTION ────────────────────────────────────────────── */}
        <div className="p-3 space-y-1">
          {/* Divider */}
          <div
            className="mb-3 mx-1"
            style={{ height: '1px', background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)' }}
          />

          {/* User card */}
          {!sidebarCollapsed && (
            <div
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-1"
              style={{
                background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
              } as React.CSSProperties}
            >
              <div
                className="w-7 h-7 rounded-xl flex items-center justify-center text-white font-black text-[10px] shrink-0"
                style={{ background: 'linear-gradient(135deg, #10b981, #6366f1)' }}
              >
                {currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : 'AD'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold truncate" style={{ color: isDark ? '#cbd5e1' : '#334155' }}>
                  {currentUser?.name || 'Admin'}
                </p>
                <p className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: isDark ? '#334155' : '#94a3b8' }}>
                  {currentUser?.role === 'owner' ? 'Propriétaire' : currentUser?.role || 'Admin'}
                </p>
              </div>
            </div>
          )}

          {/* Collapse toggle */}
          <button
            onClick={() => setSidebarCollapsed(c => !c)}
            className="hidden md:flex w-full items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-semibold transition-all duration-200 cursor-pointer"
            style={{
              color: isDark ? '#2d3a4d' : '#c4cdd9',
              background: 'transparent',
              border: 'none',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
              (e.currentTarget as HTMLElement).style.color = isDark ? '#94a3b8' : '#64748b';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
              (e.currentTarget as HTMLElement).style.color = isDark ? '#2d3a4d' : '#c4cdd9';
            }}
          >
            {sidebarCollapsed
              ? <ChevronRight className="w-3.5 h-3.5" />
              : <><ChevronLeft className="w-3.5 h-3.5" /><span>Réduire</span></>}
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-2.5'} px-3 py-2 rounded-xl text-[11px] font-semibold transition-all duration-200 cursor-pointer`}
            style={{
              color: isDark ? '#3d4f65' : '#b0bcc9',
              background: 'transparent',
              border: 'none',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(244,63,94,0.08)';
              (e.currentTarget as HTMLElement).style.color = isDark ? '#fb7185' : '#e11d48';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
              (e.currentTarget as HTMLElement).style.color = isDark ? '#3d4f65' : '#b0bcc9';
            }}
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            {!sidebarCollapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
