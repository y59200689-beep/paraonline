'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAdmin } from '@/context/AdminContext';
import { useSettings } from '@/context/SettingsContext';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Star,
  Sliders,
  Award,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  BarChart2,
  Ticket,
  Images,
  FileText,
  Layers,
  Globe,
  Navigation,
  Languages,
  SearchCode,
  Brain,
  MessageSquare,
  Truck,
  CreditCard,
  Plug,
  UserCog,
  ScrollText,
  Gift,
  Tag,
  BookOpen,
  Shield,
  Code,
  Clock,
} from 'lucide-react';
import {
  canEditContent,
  canManageBrands,
  canManageDiagnostic,
  canManageChat,
  canManageSettings,
  canManageOperators,
  canViewAuditLog,
  canManageSnippets,
} from '@/lib/permissions';
import { AdminUIContextProps } from '@/app/admin/AdminUIContext';

interface SidebarProps {
  activeTab: AdminUIContextProps['activeTab'];
  setActiveTab: AdminUIContextProps['setActiveTab'];
  sidebarCollapsed: boolean;
  setSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  isMobileDrawerOpen: boolean;
  setIsMobileDrawerOpen: (open: boolean) => void;
}

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
  count?: number;
  countColor?: string;
  roleCheck?: boolean;
}

interface NavGroup {
  label?: string;
  items: NavItem[];
  collapsible?: boolean;
  defaultOpen?: boolean;
  groupId?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  sidebarCollapsed,
  setSidebarCollapsed,
  isMobileDrawerOpen,
  setIsMobileDrawerOpen,
}) => {
  const { orders, reviews, currentUser, adminTheme, handleLogout } = useAdmin();
  const { settings } = useSettings();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isDark = adminTheme === 'dark';
  const role = (currentUser?.role ?? 'viewer') as any;

  const pendingOrders = orders.filter(o => o.status.toLowerCase() === 'pending').length;
  const pendingReviews = reviews.filter(r => r.status === 'pending').length;

  // Collapsible group state
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    vente: true,
    contenu: true,
    experience: true,
    parametres: false,
    advanced: false,
  });

  const toggleGroup = (id: string) => setOpenGroups(s => ({ ...s, [id]: !s[id] }));

  // Keyboard close for mobile
  useEffect(() => {
    const onEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsMobileDrawerOpen(false); };
    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [setIsMobileDrawerOpen]);

  // Auto-open group that contains the current path
  useEffect(() => {
    if (pathname.includes('/content') || pathname.includes('/gallery')) setOpenGroups(s => ({ ...s, contenu: true }));
    if (pathname.includes('/experience')) setOpenGroups(s => ({ ...s, experience: true }));
    if (pathname.includes('/settings')) setOpenGroups(s => ({ ...s, parametres: true }));
    if (pathname.includes('/coupons') || pathname.includes('/loyalty')) setOpenGroups(s => ({ ...s, vente: true }));
    if (pathname.includes('/cron') || pathname.includes('/snippets') || pathname.includes('/audit')) setOpenGroups(s => ({ ...s, advanced: true }));
  }, [pathname]);

  // ── Navigation structure ──────────────────────────────────────
  const primaryItems: NavItem[] = [
    { id: 'dashboard', label: 'Accueil', href: '/admin', icon: LayoutDashboard },
    { id: 'orders',    label: 'Commandes', href: '/admin/orders', icon: ShoppingBag, count: pendingOrders || undefined, countColor: '#f43f5e' },
    { id: 'catalog',   label: 'Produits', href: '/admin/catalog', icon: Package },
    { id: 'crm',       label: 'Clients', href: '/admin/crm', icon: Users },
    { id: 'analytics', label: 'Statistiques', href: '/admin/analytics', icon: BarChart2 },
  ];

  const venteItems: NavItem[] = [
    { id: 'coupons',  label: 'Promotions', href: '/admin/coupons', icon: Ticket },
    { id: 'gifts',    label: 'Cadeaux', href: '/admin/settings?tab=gifts', icon: Gift },
    { id: 'loyalty',  label: 'Fidélité', href: '/admin/loyalty', icon: Award },
  ];

  const contenuItems: NavItem[] = [
    ...(canEditContent(role) ? [{ id: 'content-pages',       label: 'Pages',               href: '/admin/content/pages',       icon: FileText }] : []),
    ...(canEditContent(role) ? [{ id: 'content-sections',    label: 'Sections',             href: '/admin/content/sections',    icon: Layers }] : []),
    ...(canManageBrands(role) ? [{ id: 'content-brands',     label: 'Marques',              href: '/admin/content/brands',      icon: Tag }] : []),
    { id: 'gallery',                                           label: 'Média',               href: '/admin/gallery',             icon: Images },
    ...(canEditContent(role) ? [{ id: 'content-global',      label: 'Navigation & footer',  href: '/admin/content/global',      icon: Navigation }] : []),
    ...(canEditContent(role) ? [{ id: 'content-translations',label: 'Traductions',          href: '/admin/content/translations',icon: Languages }] : []),
    ...(canEditContent(role) ? [{ id: 'content-seo',         label: 'SEO',                  href: '/admin/content/seo',         icon: SearchCode }] : []),
  ];

  const experienceItems: NavItem[] = [
    ...(canManageDiagnostic(role) ? [{ id: 'experience-diagnostic', label: 'Diagnostic IA',    href: '/admin/experience/diagnostic', icon: Brain }] : []),
    ...(canManageChat(role)       ? [{ id: 'experience-assistant',  label: 'Assistant chat',   href: '/admin/experience/assistant',  icon: MessageSquare }] : []),
    { id: 'reviews',                                                  label: 'Avis',            href: '/admin/reviews', icon: Star, count: pendingReviews || undefined, countColor: '#f59e0b' },
    { id: 'advice',                                                   label: 'FAQ & Conseils',  href: '/admin/advice', icon: BookOpen },
  ];

  const parametresItems: NavItem[] = [
    ...(canManageSettings(role)   ? [{ id: 'settings-shipping',     label: 'Livraison',        href: '/admin/settings?tab=shipping',  icon: Truck }] : []),
    ...(canManageSettings(role)   ? [{ id: 'settings-payment',      label: 'Paiements',        href: '/admin/settings?tab=payment',   icon: CreditCard }] : []),
    ...(canManageSettings(role)   ? [{ id: 'settings-integrations', label: 'Intégrations',     href: '/admin/settings?tab=general',   icon: Plug }] : []),
    ...(canManageOperators(role)  ? [{ id: 'settings-team',         label: 'Équipe & rôles',   href: '/admin/settings/team', icon: UserCog }] : []),
    ...(canViewAuditLog(role)     ? [{ id: 'audit-logs',            label: 'Journal des changements', href: '/admin/audit-logs', icon: ScrollText }] : []),
  ];

  const advancedItems: NavItem[] = [
    ...(canManageSettings(role)   ? [{ id: 'cron',     label: 'Automatisations', href: '/admin/cron', icon: Clock }] : []),
    ...(canManageSnippets(role)   ? [{ id: 'snippets', label: 'Scripts du site', href: '/admin/snippets', icon: Code }] : []),
    ...(canManageOperators(role)  ? [{ id: 'branding', label: 'Personnalisation',href: '/admin/branding', icon: Sliders }] : []),
  ];

  // ── Helpers ──────────────────────────────────────────────────

  const isActive = (item: NavItem): boolean => {
    if (item.href === '/admin') return pathname === '/admin';
    // Strip query params for prefix matching
    const hrefPath = item.href.split('?')[0];
    const currentTab = searchParams.get('tab');
    // Items with ?tab= params: exact match on both path + tab value
    if (item.id === 'gifts')                 return pathname === '/admin/settings' && currentTab === 'gifts';
    if (item.id === 'settings-shipping')     return pathname === '/admin/settings' && (currentTab === 'shipping' || currentTab === null);
    if (item.id === 'settings-payment')      return pathname === '/admin/settings' && currentTab === 'payment';
    if (item.id === 'settings-integrations') return pathname === '/admin/settings' && currentTab === 'general';
    // Loyalty vs gifts: exact match so neither bleeds into the other
    if (item.id === 'loyalty') return pathname === '/admin/loyalty' || pathname.startsWith('/admin/loyalty/');
    return pathname.startsWith(hrefPath);
  };

  const sidebarStyle: React.CSSProperties = {
    background: isDark
      ? 'linear-gradient(180deg, hsl(224,30%,8%) 0%, hsl(228,28%,6%) 100%)'
      : 'linear-gradient(180deg, #ffffff 0%, hsl(220,20%,98.5%) 100%)',
    borderRight: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.07)',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
  } as React.CSSProperties;

  // ── Render helpers ───────────────────────────────────────────

  const renderItem = (item: NavItem) => {
    const active = isActive(item);
    const Icon = item.icon;

    return (
      <Link
        key={item.id}
        href={item.href}
        prefetch={true}
        title={sidebarCollapsed ? item.label : undefined}
        onClick={() => setIsMobileDrawerOpen(false)}
        className={`relative flex items-center rounded-xl border transition-all duration-150 cursor-pointer select-none group ${
          sidebarCollapsed ? 'justify-center px-2 py-2.5' : 'justify-between px-3 py-2.5'
        }`}
        style={{
          background: active
            ? (isDark ? 'linear-gradient(135deg,rgba(16,185,129,0.13) 0%,rgba(99,102,241,0.08) 100%)' : 'linear-gradient(135deg,rgba(16,185,129,0.09) 0%,rgba(99,102,241,0.05) 100%)')
            : 'transparent',
          borderColor: active
            ? (isDark ? 'rgba(16,185,129,0.22)' : 'rgba(16,185,129,0.28)')
            : 'transparent',
        }}
        onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'; }}
        onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
      >
        <div className={`flex items-center ${sidebarCollapsed ? '' : 'gap-2.5'} min-w-0`}>
          {/* Active indicator bar */}
          {active && !sidebarCollapsed && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full" style={{ background: 'linear-gradient(180deg,#10b981,#6366f1)' }} />
          )}
          <Icon
            className="w-4 h-4 shrink-0"
            style={{ color: active ? (isDark ? '#34d399' : '#059669') : (isDark ? '#3d4f65' : '#b0bcc9'), transition: 'color 0.15s' }}
          />
          {!sidebarCollapsed && (
            <span
              className="text-[12px] truncate"
              style={{ color: active ? (isDark ? '#d1fae5' : '#065f46') : (isDark ? '#64748b' : '#64748b'), fontWeight: active ? 700 : 500 }}
            >
              {item.label}
            </span>
          )}
        </div>
        {/* Count badge */}
        {!sidebarCollapsed && item.count !== undefined && item.count > 0 && (
          <span className="text-white font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center shrink-0 text-[9px]" style={{ background: item.countColor ?? '#10b981' }}>
            {item.count}
          </span>
        )}
        {sidebarCollapsed && item.count !== undefined && item.count > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full border-2" style={{ background: item.countColor ?? '#10b981', borderColor: isDark ? 'hsl(224,30%,8%)' : '#fff' }} />
        )}
        {active && sidebarCollapsed && (
          <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" style={{ background: '#10b981' }} />
        )}
      </Link>
    );
  };

  const renderGroup = (label: string, groupId: string, items: NavItem[]) => {
    if (items.length === 0) return null;
    const open = openGroups[groupId] ?? true;

    return (
      <div className="pt-3" key={groupId}>
        <div className="mb-1 mx-2" style={{ height: '1px', background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)' }} />

        {!sidebarCollapsed && (
          <button
            type="button"
            onClick={() => toggleGroup(groupId)}
            className="w-full flex items-center justify-between px-3 mb-1 py-0.5 cursor-pointer"
            style={{ background: 'transparent', border: 'none', outline: 'none' }}
          >
            <span className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: isDark ? '#2d3a4d' : '#c4cdd9' }}>
              {label}
            </span>
            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${open ? '' : '-rotate-90'}`} style={{ color: isDark ? '#2d3a4d' : '#c4cdd9' }} />
          </button>
        )}

        {(open || sidebarCollapsed) && (
          <div className="space-y-0.5">
            {items.map(renderItem)}
          </div>
        )}
      </div>
    );
  };

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
        {/* ── TOP SECTION ─────────────────────────────────────────── */}
        <div className="flex flex-col gap-1 p-3">

          {/* Brand mark */}
          <div className={`flex items-center gap-3 px-2 pt-1 pb-3 ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-[13px] shrink-0 tracking-tight"
              style={{ background: 'linear-gradient(135deg, #10b981 0%, #0891b2 100%)', boxShadow: isDark ? '0 4px 16px rgba(16,185,129,0.35), 0 0 0 1px rgba(16,185,129,0.2)' : '0 4px 12px rgba(16,185,129,0.30)' } as React.CSSProperties}
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
                  <span className="text-[10px] font-semibold" style={{ color: isDark ? '#475569' : '#94a3b8' }}>Boutique active</span>
                </div>
              </div>
            )}
          </div>

          {/* Primary nav */}
          <nav className="space-y-0.5" aria-label="Navigation primaire">
            {primaryItems.map(renderItem)}
          </nav>

          {/* Grouped nav */}
          {renderGroup('Vente', 'vente', venteItems)}
          {renderGroup('Contenu', 'contenu', contenuItems)}
          {renderGroup('Expérience client', 'experience', experienceItems)}
          {renderGroup('Paramètres', 'parametres', parametresItems)}
          {advancedItems.length > 0 && renderGroup('Avancé', 'advanced', advancedItems)}
        </div>

        {/* ── BOTTOM SECTION ─────────────────────────────────────── */}
        <div className="p-3 space-y-1">
          <div className="mb-3 mx-1" style={{ height: '1px', background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)' }} />

          {/* User card */}
          {!sidebarCollapsed && (
            <div
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-1"
              style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)' } as React.CSSProperties}
            >
              <div className="w-7 h-7 rounded-xl flex items-center justify-center text-white font-black text-[10px] shrink-0" style={{ background: 'linear-gradient(135deg,#10b981,#6366f1)' }}>
                {currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : 'AD'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold truncate" style={{ color: isDark ? '#cbd5e1' : '#334155' }}>
                  {currentUser?.name || 'Admin'}
                </p>
                <p className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: isDark ? '#334155' : '#94a3b8' }}>
                  {currentUser?.role === 'owner' ? 'Propriétaire'
                    : currentUser?.role === 'manager' ? 'Manager'
                    : currentUser?.role === 'content_editor' ? 'Éditeur contenu'
                    : currentUser?.role === 'catalogue_editor' ? 'Éditeur catalogue'
                    : currentUser?.role === 'logistician' || currentUser?.role === 'fulfilment' ? 'Logistique'
                    : currentUser?.role === 'support' ? 'Support'
                    : currentUser?.role || 'Admin'}
                </p>
              </div>
            </div>
          )}

          {/* Collapse toggle */}
          <button
            onClick={() => setSidebarCollapsed(c => !c)}
            className="hidden md:flex w-full items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-semibold transition-all duration-200 cursor-pointer"
            style={{ color: isDark ? '#2d3a4d' : '#c4cdd9', background: 'transparent', border: 'none' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'; (e.currentTarget as HTMLElement).style.color = isDark ? '#94a3b8' : '#64748b'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = isDark ? '#2d3a4d' : '#c4cdd9'; }}
          >
            {sidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <><ChevronLeft className="w-3.5 h-3.5" /><span>Réduire</span></>}
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-2.5'} px-3 py-2 rounded-xl text-[11px] font-semibold transition-all duration-200 cursor-pointer`}
            style={{ color: isDark ? '#3d4f65' : '#b0bcc9', background: 'transparent', border: 'none' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(244,63,94,0.08)'; (e.currentTarget as HTMLElement).style.color = isDark ? '#fb7185' : '#e11d48'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = isDark ? '#3d4f65' : '#b0bcc9'; }}
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            {!sidebarCollapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
