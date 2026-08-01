'use client';

import React, { useEffect } from 'react';
import { useAdmin, AdminProvider } from '@/context/AdminContext';
import { AdminUIProvider, useAdminUI } from './AdminUIContext';
import { usePathname, useRouter } from 'next/navigation';
import '../styles/admin.css';
import {
  Menu,
  Search,
  Moon,
  Sun,
  ChevronDown,
  LogOut,
  Key,
  ShieldCheck
} from 'lucide-react';
import { Sidebar } from '@/components/admin/Sidebar';
import { AdminSpotlight } from '@/components/admin/AdminSpotlight';

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const {
    isAuthenticated,
    isVerifyingSession,
    adminTheme,
    toggleAdminTheme,
    isDataLoading,
    currentUser,
    handleLogout
  } = useAdmin();

  const {
    activeTab,
    setActiveTab,
    sidebarCollapsed,
    setSidebarCollapsed,
    isMobileDrawerOpen,
    setIsMobileDrawerOpen,
    isSearchOpen,
    setIsSearchOpen,
    setSpotlightTarget,
    setOrdersSubTab,
    ordersSubTab,
    setCrmSubTab,
    crmSubTab,
    setLoyaltySubTab,
    loyaltySubTab,
    setActiveSettingsSubTab,
    activeSettingsSubTab,
    setIsAddingCoupon,
    setIsNewProductModalOpen,
    setSelectedOrder,
    setProductForm,
  } = useAdminUI();

  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect to login if session verification completes and user is not authenticated
  useEffect(() => {
    if (mounted && !isVerifyingSession && !isAuthenticated && pathname !== '/admin/login') {
      window.location.href = `/admin/login?from=${encodeURIComponent(pathname)}`;
    }
  }, [mounted, isVerifyingSession, isAuthenticated, pathname]);

  // Shortcut key: Cmd+K or Ctrl+K to open spotlight
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsSearchOpen]);

  const handleOpenCrmCustomer = (phone: string, name: string, ordersList: any[], totalSpend: number) => {
    setActiveTab('crm');
    setCrmSubTab('clients');
  };

  // If rendering the login page, render it directly without the layout shell
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // If not mounted or verifying session, show admin-themed loading indicator
  if (!mounted || isVerifyingSession) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-950 text-slate-100 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-slate-700 border-t-emerald-500 rounded-full animate-spin" />
          <span className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
            Vérification de la session...
          </span>
        </div>
      </div>
    );
  }

  // If not authenticated, show redirection screen while router navigates to login
  if (!isAuthenticated) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-950 text-slate-100 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-slate-700 border-t-emerald-500 rounded-full animate-spin" />
          <span className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
            Redirection vers la connexion...
          </span>
        </div>
      </div>
    );
  }

  const isDark = adminTheme === 'dark';

  return (
    <main className={`h-screen overflow-hidden font-sans flex flex-col md:flex-row relative transition-colors duration-300 ${
      isDark ? 'text-slate-100 admin-dark admin-page-bg-dark' : 'text-slate-900 admin-light admin-page-bg'
    }`}>
      
      {/* 1. Sidebar Nav */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        isMobileDrawerOpen={isMobileDrawerOpen}
        setIsMobileDrawerOpen={setIsMobileDrawerOpen}
      />

      {/* 2. Main content container */}
      <section className="admin-workspace flex-1 min-w-0 px-5 py-5 md:px-8 md:py-7 space-y-5 overflow-y-auto max-h-screen relative z-10 transition-colors duration-300">
        
        {/* Loading Skeleton Screen */}
        {isDataLoading && (
          <div
            className="absolute inset-0 z-50 p-6 md:p-8 space-y-6 transition-colors duration-300"
            style={{ background: isDark ? 'hsl(224,28%,7%)' : 'hsl(220,20%,96%)' }}
          >
            <div className="space-y-6">
              <div
                className="flex justify-between items-center pb-5"
                style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.06)' }}
              >
                <div className="space-y-2">
                  <div className={`h-6 w-48 ${isDark ? 'admin-skeleton-dark' : 'admin-skeleton'}`} />
                  <div className={`h-3.5 w-32 ${isDark ? 'admin-skeleton-dark' : 'admin-skeleton'}`} />
                </div>
                <div className={`h-9 w-24 ${isDark ? 'admin-skeleton-dark' : 'admin-skeleton'}`} />
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-5">
                <div className={`col-span-2 h-28 border ${isDark ? 'admin-skeleton-dark border-slate-800' : 'admin-skeleton border-slate-200'}`} style={{ borderRadius: 'var(--admin-radius-lg)' }} />
                <div className={`h-28 border ${isDark ? 'admin-skeleton-dark border-slate-800' : 'admin-skeleton border-slate-200'}`} style={{ borderRadius: 'var(--admin-radius-lg)' }} />
                <div className={`h-28 border ${isDark ? 'admin-skeleton-dark border-slate-800' : 'admin-skeleton border-slate-200'}`} style={{ borderRadius: 'var(--admin-radius-lg)' }} />
                <div className={`h-28 border ${isDark ? 'admin-skeleton-dark border-slate-800' : 'admin-skeleton border-slate-200'}`} style={{ borderRadius: 'var(--admin-radius-lg)' }} />
              </div>
            </div>
          </div>
        )}

        {/* ── Header toolbar ─────────────────────────────────────────── */}
        <header
          className="flex justify-between items-center pb-5 flex-wrap gap-4"
          style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.06)' }}
        >
          {/* Left: breadcrumb + title ───────────────────────────────── */}
          <div>
            {/* Breadcrumb */}
            <nav
              className="flex items-center gap-1 mb-2 select-none"
              aria-label="Breadcrumb"
              style={{ fontSize: 'var(--admin-text-2xs)' }}
            >
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className="font-semibold uppercase tracking-widest transition cursor-pointer border-0 bg-transparent outline-none p-0"
                style={{ color: 'var(--admin-text-faint)' }}
              >
                Admin
              </button>
              <span style={{ color: 'var(--admin-text-faint)' }}>/</span>
              <button
                type="button"
                onClick={() => {
                  if (activeTab === 'crm') setCrmSubTab('clients');
                  if (activeTab === 'orders') setOrdersSubTab('list');
                  if (activeTab === 'loyalty') setLoyaltySubTab('members');
                  if (activeTab === 'settings') setActiveSettingsSubTab('general');
                }}
                className="font-bold uppercase tracking-widest transition cursor-pointer border-0 bg-transparent outline-none p-0 text-emerald-500 hover:text-emerald-400"
              >
                {activeTab}
              </button>
              {activeTab === 'crm' && crmSubTab && crmSubTab !== 'clients' && (
                <>
                  <span style={{ color: 'var(--admin-text-faint)' }}>/</span>
                  <span className="font-semibold uppercase tracking-widest" style={{ color: 'var(--admin-text-muted)' }}>{crmSubTab}</span>
                </>
              )}
              {activeTab === 'orders' && ordersSubTab && ordersSubTab !== 'list' && (
                <>
                  <span style={{ color: 'var(--admin-text-faint)' }}>/</span>
                  <span className="font-semibold uppercase tracking-widest" style={{ color: 'var(--admin-text-muted)' }}>{ordersSubTab}</span>
                </>
              )}
              {activeTab === 'loyalty' && loyaltySubTab && loyaltySubTab !== 'product_points' && (
                <>
                  <span style={{ color: 'var(--admin-text-faint)' }}>/</span>
                  <span className="font-semibold uppercase tracking-widest" style={{ color: 'var(--admin-text-muted)' }}>{loyaltySubTab}</span>
                </>
              )}
              {activeTab === 'settings' && activeSettingsSubTab && activeSettingsSubTab !== 'general' && (
                <>
                  <span style={{ color: 'var(--admin-text-faint)' }}>/</span>
                  <span className="font-semibold uppercase tracking-widest" style={{ color: 'var(--admin-text-muted)' }}>{activeSettingsSubTab}</span>
                </>
              )}
            </nav>

            {/* Page title */}
            <h1
              className="font-black tracking-tight flex items-center gap-2.5"
              style={{ fontSize: 'var(--admin-text-xl)', color: 'var(--admin-text-primary)' }}
            >
              <button
                onClick={() => setIsMobileDrawerOpen(true)}
                className={`md:hidden p-1.5 rounded-lg border cursor-pointer transition ${
                  isDark
                    ? 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
                title="Ouvrir le menu"
                aria-label="Ouvrir la navigation"
                aria-expanded={isMobileDrawerOpen}
              >
                <Menu className="w-4 h-4" />
              </button>
              {activeTab === 'dashboard' && 'Tableau de bord'}
              {activeTab === 'analytics' && 'Analytiques'}
              {activeTab === 'orders' && 'Commandes'}
              {activeTab === 'catalog' && 'Catalogue Produits'}
              {activeTab === 'crm' && 'Clients & CRM'}
              {activeTab === 'loyalty' && 'Fidélité & Points'}
              {activeTab === 'reviews' && 'Avis Clients'}
              {activeTab === 'advice' && 'Espace Conseils'}
              {activeTab === 'branding' && 'Personnalisation'}
              {activeTab === 'snippets' && 'Snippets de Code'}
              {activeTab === 'cron' && 'Tâches Planifiées'}
              {activeTab === 'audit-logs' && "Journaux d'Audit"}
              {activeTab === 'coupons' && 'Promotions & Promo'}
              {activeTab === 'settings' && 'Paramètres'}
              {activeTab === 'gallery' && 'Galerie Médias'}
            </h1>

            {/* Subtitle: greeting + date */}
            <p
              className="mt-1 font-medium font-mono text-[10.5px]"
              style={{ color: 'var(--admin-text-muted)' }}
            >
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* Right: toolbar actions ──────────────────────────────────── */}
          <div className="flex items-center gap-2">
            {/* Spotlight Search */}
            <button
              onClick={() => setIsSearchOpen(true)}
              title="Rechercher (Cmd+K)"
              className="flex items-center gap-2 px-3 py-2 rounded-2xl cursor-pointer shrink-0 select-none transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)',
                fontSize: 'var(--admin-text-xs)',
              }}
            >
              <Search className="w-3.5 h-3.5 shrink-0" style={{ color: isDark ? '#475569' : '#94a3b8' }} />
              <span className="hidden sm:inline font-medium" style={{ color: isDark ? '#475569' : '#94a3b8' }}>Rechercher...</span>
              <kbd
                className="font-mono px-1.5 py-0.5 rounded-lg text-[9px]"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)',
                  color: isDark ? '#3d4f65' : '#b0bcc9',
                }}
              >
                ⌘K
              </kbd>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleAdminTheme}
              title={isDark ? 'Mode clair' : 'Mode sombre'}
              className="p-2 rounded-full cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95 flex items-center justify-center"
              style={{
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.07)',
                width: '32px',
                height: '32px',
              }}
            >
              {isDark
                ? <Sun className="w-3.5 h-3.5 text-amber-400" />
                : <Moon className="w-3.5 h-3.5 text-indigo-500" />}
            </button>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(prev => !prev)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-2xl cursor-pointer select-none transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                  border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)',
                }}
              >
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-white font-black"
                  style={{ background: 'linear-gradient(135deg, #10b981, #6366f1)', fontSize: '9px' }}
                >
                  {currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : 'AD'}
                </div>
                <span className="hidden sm:inline font-semibold leading-none" style={{ fontSize: '11px', color: isDark ? '#94a3b8' : '#64748b' }}>
                  {currentUser?.name || 'Admin'}
                </span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} style={{ color: isDark ? '#475569' : '#94a3b8' }} />
              </button>

              {isProfileOpen && (
                <>
                  <div onClick={() => setIsProfileOpen(false)} className="fixed inset-0 z-40 bg-transparent" />
                  <div
                    className="absolute right-0 mt-2 w-64 rounded-2xl p-4 z-50 animate-fade-in"
                    style={{
                      background: isDark
                        ? 'linear-gradient(160deg, hsl(224,28%,9%) 0%, hsl(228,26%,7%) 100%)'
                        : '#ffffff',
                      border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.08)',
                      boxShadow: isDark
                        ? '0 24px 64px rgba(0,0,0,0.6)'
                        : '0 16px 48px rgba(0,0,0,0.12)',
                    }}
                  >
                    {/* Profile header */}
                    <div
                      className="flex items-center gap-3 p-3 rounded-xl mb-3"
                      style={{
                        background: isDark
                          ? 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(99,102,241,0.06) 100%)'
                          : 'linear-gradient(135deg, rgba(16,185,129,0.06) 0%, rgba(99,102,241,0.04) 100%)',
                        border: isDark ? '1px solid rgba(16,185,129,0.12)' : '1px solid rgba(16,185,129,0.15)',
                      }}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0"
                        style={{ background: 'linear-gradient(135deg, #10b981, #6366f1)', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}
                      >
                        {currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : 'AD'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="block font-black text-[12px] truncate" style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>
                          {currentUser?.name || 'Administrateur'}
                        </span>
                        <span className="block truncate mt-0.5 font-mono text-[9px]" style={{ color: isDark ? '#475569' : '#94a3b8' }}>
                          {currentUser?.username || 'admin@ecom.ma'}
                        </span>
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div
                      className="pb-2.5 mb-1.5 space-y-2 border-b"
                      style={{
                        fontSize: '10px',
                        borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.06)'
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <span style={{ color: isDark ? '#475569' : '#94a3b8' }}>Rôle</span>
                        <span
                          className="px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider"
                          style={{
                            background: currentUser?.role === 'owner'
                              ? (isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.1)')
                              : (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)'),
                            color: currentUser?.role === 'owner'
                              ? (isDark ? '#a5b4fc' : '#4f46e5')
                              : (isDark ? '#64748b' : '#94a3b8'),
                            border: currentUser?.role === 'owner'
                              ? (isDark ? '1px solid rgba(99,102,241,0.25)' : '1px solid rgba(99,102,241,0.2)')
                              : (isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)'),
                          }}
                        >
                          {currentUser?.role === 'owner' ? 'Owner' : currentUser?.role || 'Admin'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span style={{ color: isDark ? '#475569' : '#94a3b8' }}>Sécurité MFA</span>
                        <span className="flex items-center gap-1 font-bold text-[9px]" style={{ color: isDark ? '#34d399' : '#059669' }}>
                          <ShieldCheck className="w-3.5 h-3.5" /> Protégé
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-1.5 space-y-0.5">
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          setActiveTab('settings');
                          setActiveSettingsSubTab('security');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[11px] font-semibold cursor-pointer transition-all duration-150"
                        style={{ color: isDark ? '#64748b' : '#64748b', background: 'transparent' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'; (e.currentTarget as HTMLElement).style.color = isDark ? '#cbd5e1' : '#334155'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = isDark ? '#64748b' : '#64748b'; }}
                      >
                        <Key className="w-3.5 h-3.5" style={{ color: isDark ? '#475569' : '#94a3b8' }} /> Sécurité & Mot de passe
                      </button>
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[11px] font-semibold cursor-pointer transition-all duration-150"
                        style={{ color: isDark ? '#fb7185' : '#e11d48', background: 'transparent' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(244,63,94,0.08)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                      >
                        <LogOut className="w-3.5 h-3.5" /> Déconnexion
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* API status badge */}
            <div
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-2xl shrink-0"
              style={{
                background: isDark ? 'rgba(16,185,129,0.06)' : 'rgba(16,185,129,0.06)',
                border: isDark ? '1px solid rgba(16,185,129,0.15)' : '1px solid rgba(16,185,129,0.2)',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="font-mono font-bold text-[9px] uppercase tracking-widest" style={{ color: isDark ? '#34d399' : '#059669' }}>API Live</span>
            </div>
          </div>
        </header>

        {children}

      </section>

      {/* -------------------- SPOTLIGHT COMMAND PALETTE (Cmd+K) -------------------- */}
      <AdminSpotlight 
        isSearchOpen={isSearchOpen}
        setIsSearchOpen={setIsSearchOpen}
        setActiveTab={setActiveTab}
        setOrdersSubTab={setOrdersSubTab}
        setCrmSubTab={setCrmSubTab}
        setActiveSettingsSubTab={setActiveSettingsSubTab}
        setIsAddingCoupon={setIsAddingCoupon}
        setIsNewProductModalOpen={setIsNewProductModalOpen}
        setSelectedOrder={setSelectedOrder}
        setProductForm={setProductForm}
        setSpotlightTarget={setSpotlightTarget}
        handleOpenCrmCustomer={handleOpenCrmCustomer}
        setLoyaltySubTab={setLoyaltySubTab}
      />

    </main>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <AdminUIProvider>
        <AdminLayoutInner>{children}</AdminLayoutInner>
      </AdminUIProvider>
    </AdminProvider>
  );
}
