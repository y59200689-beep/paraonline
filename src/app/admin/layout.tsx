'use client';

import React, { useEffect } from 'react';
import { useAdmin, AdminProvider } from '@/context/AdminContext';
import { AdminUIProvider, useAdminUI } from './AdminUIContext';
import { usePathname } from 'next/navigation';
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
  const [mounted, setMounted] = React.useState(false);
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  // If not mounted on client, render nothing to avoid hydration mismatches
  if (!mounted) {
    return null;
  }

  // If not authenticated, render nothing (Middleware will redirect the user)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <main className={`h-screen overflow-hidden font-sans flex flex-col md:flex-row relative transition-colors duration-300 ${
      adminTheme === 'light' ? 'text-slate-900 admin-light admin-page-bg' : 'text-slate-100 admin-dark admin-page-bg-dark'
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
      <section className="flex-1 min-w-0 px-6 py-6 md:px-9 md:py-8 space-y-7 overflow-y-auto max-h-screen relative z-10 transition-colors duration-300">
        
        {/* Loading Skeleton Screen */}
        {isDataLoading && (
          <div className={`absolute inset-0 z-50 p-6 md:p-8 space-y-6 transition-colors duration-300 ${adminTheme === 'light' ? 'bg-slate-50' : 'bg-slate-950'}`}>
            <div className="space-y-6">
              <div className={`flex justify-between items-center pb-4 border-b ${adminTheme === 'light' ? 'border-slate-200' : 'border-slate-900'}`}>
                <div className="space-y-2">
                  <div className={`h-6 w-48 ${adminTheme === 'light' ? 'admin-skeleton' : 'admin-skeleton-dark'}`} />
                  <div className={`h-3.5 w-32 ${adminTheme === 'light' ? 'admin-skeleton' : 'admin-skeleton-dark'}`} />
                </div>
                <div className={`h-9 w-24 ${adminTheme === 'light' ? 'admin-skeleton' : 'admin-skeleton-dark'}`} />
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-5">
                <div className={`col-span-2 h-28 border ${adminTheme === 'light' ? 'admin-skeleton border-slate-200' : 'admin-skeleton-dark border-slate-900'}`} style={{ borderRadius: 'var(--admin-radius-lg)' }} />
                <div className={`h-28 border ${adminTheme === 'light' ? 'admin-skeleton border-slate-200' : 'admin-skeleton-dark border-slate-900'}`} style={{ borderRadius: 'var(--admin-radius-lg)' }} />
                <div className={`h-28 border ${adminTheme === 'light' ? 'admin-skeleton border-slate-200' : 'admin-skeleton-dark border-slate-900'}`} style={{ borderRadius: 'var(--admin-radius-lg)' }} />
                <div className={`h-28 border ${adminTheme === 'light' ? 'admin-skeleton border-slate-200' : 'admin-skeleton-dark border-slate-900'}`} style={{ borderRadius: 'var(--admin-radius-lg)' }} />
              </div>
            </div>
          </div>
        )}

        {/* ── Header toolbar ─────────────────────────────────────────── */}
        <header
          className={`flex justify-between items-center pb-5 border-b flex-wrap gap-4 ${
            adminTheme === 'light' ? 'border-[hsl(220_13%_90%)]' : 'border-[hsl(224_15%_16%)]'
          }`}
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
              {activeTab === 'loyalty' && loyaltySubTab && loyaltySubTab !== 'members' && (
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
              className="font-bold tracking-tight flex items-center gap-2.5"
              style={{ fontSize: 'var(--admin-text-xl)', color: 'var(--admin-text-primary)' }}
            >
              <button
                onClick={() => setIsMobileDrawerOpen(true)}
                className={`md:hidden p-1.5 rounded-lg border cursor-pointer transition ${
                  adminTheme === 'light'
                    ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
                title="Ouvrir le menu"
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
            </h1>

            {/* Subtitle: greeting + date */}
            <p
              className="mt-1 font-medium"
              style={{ fontSize: 'var(--admin-text-xs)', color: 'var(--admin-text-muted)' }}
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
              className={`px-3 py-2 border rounded-xl transition duration-200 flex items-center gap-2 cursor-pointer shrink-0 select-none ${
                adminTheme === 'light'
                  ? 'bg-white border-[hsl(220_13%_90%)] text-slate-500 hover:text-slate-800 hover:bg-slate-50 shadow-[var(--admin-shadow-xs)]'
                  : 'bg-[hsl(224_18%_10%)] hover:bg-[hsl(224_16%_13%)] border-[hsl(224_15%_16%)] text-slate-400 hover:text-slate-200'
              }`}
              style={{ fontSize: 'var(--admin-text-xs)' }}
            >
              <Search className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--admin-text-faint)' }} />
              <span className="hidden sm:inline" style={{ color: 'var(--admin-text-faint)' }}>Rechercher...</span>
              <kbd
                className={`font-mono px-1.5 py-0.5 rounded border ${
                  adminTheme === 'light'
                    ? 'bg-slate-50 border-slate-200 text-slate-400'
                    : 'bg-slate-950/60 border-slate-800 text-slate-500'
                }`}
                style={{ fontSize: 'var(--admin-text-2xs)' }}
              >
                ⌘K
              </kbd>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleAdminTheme}
              title={adminTheme === 'light' ? 'Mode sombre' : 'Mode clair'}
              className={`p-2 border rounded-full transition duration-200 flex items-center justify-center shrink-0 cursor-pointer ${
                adminTheme === 'light'
                  ? 'bg-white border-[hsl(220_13%_90%)] text-slate-500 hover:text-slate-800 hover:bg-slate-50 shadow-[var(--admin-shadow-xs)]'
                  : 'bg-[hsl(224_18%_10%)] hover:bg-[hsl(224_16%_13%)] border-[hsl(224_15%_16%)] text-slate-400 hover:text-slate-200'
              }`}
            >
              {adminTheme === 'light'
                ? <Moon className="w-3.5 h-3.5 text-indigo-500" />
                : <Sun className="w-3.5 h-3.5 text-amber-400" />}
            </button>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(prev => !prev)}
                className={`flex items-center gap-2 px-2.5 py-2 border rounded-xl transition duration-200 cursor-pointer select-none ${
                  adminTheme === 'light'
                    ? 'bg-white border-[hsl(220_13%_90%)] text-slate-700 hover:bg-slate-50 shadow-[var(--admin-shadow-xs)]'
                    : 'bg-[hsl(224_18%_10%)] border-[hsl(224_15%_16%)] text-slate-300 hover:bg-[hsl(224_16%_13%)] hover:text-slate-100'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-black text-white" style={{ fontSize: 'var(--admin-text-2xs)' }}>
                  {currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : 'AD'}
                </div>
                <span className="hidden sm:inline font-semibold leading-none" style={{ fontSize: 'var(--admin-text-xs)', color: 'var(--admin-text-secondary)' }}>
                  {currentUser?.name || 'Admin'}
                </span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} style={{ color: 'var(--admin-text-faint)' }} />
              </button>

              {isProfileOpen && (
                <>
                  <div
                    onClick={() => setIsProfileOpen(false)}
                    className="fixed inset-0 z-40 bg-transparent"
                  />
                  <div
                    className={`absolute right-0 mt-2 w-60 rounded-2xl border p-4 z-50 animate-fade-in ${
                      adminTheme === 'light'
                        ? 'bg-white border-[hsl(220_13%_90%)] shadow-[var(--admin-shadow-md)]'
                        : 'bg-[hsl(224_18%_10%)] border-[hsl(224_15%_16%)] shadow-[var(--admin-shadow-lg)]'
                    }`}
                  >
                    {/* Profile header */}
                    <div className={`flex items-center gap-2.5 pb-3 mb-2.5 border-b ${
                      adminTheme === 'light' ? 'border-slate-100' : 'border-[hsl(224_15%_16%)]'
                    }`}>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-black text-white" style={{ fontSize: '10px' }}>
                        {currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : 'AD'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="block font-bold truncate" style={{ fontSize: 'var(--admin-text-xs)', color: 'var(--admin-text-primary)' }}>
                          {currentUser?.name || 'Administrateur'}
                        </span>
                        <span className="block truncate mt-0.5" style={{ fontSize: 'var(--admin-text-2xs)', color: 'var(--admin-text-faint)' }}>
                          {currentUser?.username || 'admin@ecom.ma'}
                        </span>
                      </div>
                    </div>

                    {/* Meta */}
                    <div className={`pb-2.5 mb-1 space-y-2 border-b ${
                      adminTheme === 'light' ? 'border-slate-100' : 'border-[hsl(224_15%_16%)]'
                    }`} style={{ fontSize: 'var(--admin-text-2xs)' }}>
                      <div className="flex justify-between items-center">
                        <span style={{ color: 'var(--admin-text-muted)' }}>Rôle</span>
                        <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          currentUser?.role === 'owner'
                            ? (adminTheme === 'light' ? 'bg-indigo-50 text-indigo-700' : 'bg-indigo-950/40 text-indigo-400')
                            : (adminTheme === 'light' ? 'bg-slate-100 text-slate-600' : 'bg-slate-800/60 text-slate-400')
                        }`}>
                          {currentUser?.role === 'owner' ? 'Propriétaire' : currentUser?.role || 'Admin'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span style={{ color: 'var(--admin-text-muted)' }}>Sécurité MFA</span>
                        <span className="flex items-center gap-1 font-bold" style={{ color: 'var(--admin-text-muted)' }}>
                          <ShieldCheck className="w-3.5 h-3.5" /> Protégé
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-1">
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          setActiveTab('settings');
                          setActiveSettingsSubTab('security');
                        }}
                        className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl transition cursor-pointer ${
                          adminTheme === 'light' ? 'hover:bg-slate-50 text-slate-600' : 'hover:bg-[hsl(224_16%_13%)] text-slate-400'
                        }`}
                        style={{ fontSize: 'var(--admin-text-xs)' }}
                      >
                        <Key className="w-3.5 h-3.5" /> Sécurité & Mot de passe
                      </button>
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition cursor-pointer font-semibold"
                        style={{ fontSize: 'var(--admin-text-xs)' }}
                      >
                        <LogOut className="w-3.5 h-3.5" /> Déconnexion
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* API status badge */}
            <span
              className={`px-2.5 py-1.5 border rounded-full flex items-center gap-1.5 shrink-0 font-semibold select-none ${
                adminTheme === 'light'
                  ? 'bg-white border-[hsl(220_13%_90%)] text-slate-500 shadow-[var(--admin-shadow-xs)]'
                  : 'bg-[hsl(224_18%_10%)] border-[hsl(224_15%_16%)] text-slate-500'
              }`}
              style={{ fontSize: 'var(--admin-text-2xs)', fontFamily: 'var(--font-geist-mono)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              API Maroc
            </span>
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
