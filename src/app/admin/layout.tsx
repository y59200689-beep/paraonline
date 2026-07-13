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
      <section className="flex-1 min-w-0 p-6 md:p-8 space-y-6 overflow-y-auto max-h-screen relative z-10 transition-colors duration-300">
        
        {/* Loading Skeleton Screen */}
        {isDataLoading && (
          <div className={`absolute inset-0 z-50 p-6 md:p-8 space-y-6 transition-colors duration-300 ${adminTheme === 'light' ? 'bg-slate-50' : 'bg-slate-950'}`}>
            <div className="space-y-6 animate-pulse">
              <div className={`flex justify-between items-center pb-4 border-b ${adminTheme === 'light' ? 'border-slate-200' : 'border-slate-900'}`}>
                <div className="space-y-2">
                  <div className={`h-6 w-48 rounded-lg ${adminTheme === 'light' ? 'bg-slate-200' : 'bg-slate-800/50'}`} />
                  <div className={`h-3 w-32 rounded ${adminTheme === 'light' ? 'bg-slate-100' : 'bg-slate-800/30'}`} />
                </div>
                <div className={`h-9 w-24 rounded-lg ${adminTheme === 'light' ? 'bg-slate-200' : 'bg-slate-800/50'}`} />
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-5">
                <div className={`col-span-2 h-28 rounded-2xl border ${adminTheme === 'light' ? 'bg-slate-100/50 border-slate-200' : 'bg-slate-900/30 border-slate-900'}`} />
                <div className={`h-28 rounded-2xl border ${adminTheme === 'light' ? 'bg-slate-100/50 border-slate-200' : 'bg-slate-900/30 border-slate-900'}`} />
                <div className={`h-28 rounded-2xl border ${adminTheme === 'light' ? 'bg-slate-100/50 border-slate-200' : 'bg-slate-900/30 border-slate-900'}`} />
                <div className={`h-28 rounded-2xl border ${adminTheme === 'light' ? 'bg-slate-100/50 border-slate-200' : 'bg-slate-900/30 border-slate-900'}`} />
              </div>
            </div>
          </div>
        )}

        {/* Header toolbar */}
        <header className={`flex justify-between items-center pb-4 border-b flex-wrap gap-4 ${adminTheme === 'light' ? 'border-slate-200' : 'border-slate-900'}`}>
          <div>
            {/* Dynamic Breadcrumbs */}
            <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1 select-none">
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className="hover:text-emerald-500 hover:underline transition cursor-pointer border-0 bg-transparent outline-none p-0 text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500"
              >
                Admin
              </button>
              <span>/</span>
              <button
                type="button"
                onClick={() => {
                  if (activeTab === 'crm') setCrmSubTab('clients');
                  if (activeTab === 'orders') setOrdersSubTab('list');
                  if (activeTab === 'loyalty') setLoyaltySubTab('members');
                  if (activeTab === 'settings') setActiveSettingsSubTab('general');
                }}
                className="text-emerald-600 dark:text-emerald-400 font-black hover:text-emerald-500 hover:underline transition cursor-pointer border-0 bg-transparent outline-none p-0 text-[9px] uppercase tracking-wider"
              >
                {activeTab}
              </button>
              {activeTab === 'crm' && crmSubTab && crmSubTab !== 'clients' && (
                <>
                  <span>/</span>
                  <span className="text-slate-500 dark:text-slate-400">{crmSubTab}</span>
                </>
              )}
              {activeTab === 'orders' && ordersSubTab && ordersSubTab !== 'list' && (
                <>
                  <span>/</span>
                  <span className="text-slate-500 dark:text-slate-400">{ordersSubTab}</span>
                </>
              )}
              {activeTab === 'loyalty' && loyaltySubTab && loyaltySubTab !== 'members' && (
                <>
                  <span>/</span>
                  <span className="text-slate-500 dark:text-slate-400">{loyaltySubTab}</span>
                </>
              )}
              {activeTab === 'settings' && activeSettingsSubTab && activeSettingsSubTab !== 'general' && (
                <>
                  <span>/</span>
                  <span className="text-slate-500 dark:text-slate-400">{activeSettingsSubTab}</span>
                </>
              )}
            </div>

            <h1 className={`text-xl font-black tracking-tight flex items-center gap-2.5 uppercase ${adminTheme === 'light' ? 'text-slate-800' : 'text-slate-100'}`}>
              <button
                onClick={() => setIsMobileDrawerOpen(true)}
                className={`md:hidden p-1.5 rounded-lg border cursor-pointer transition ${
                  adminTheme === 'light' ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50' : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
                title="Ouvrir le menu"
              >
                <Menu className="w-4 h-4" />
              </button>
              {activeTab === 'dashboard' && 'Tableau de bord'}
              {activeTab === 'analytics' && 'Analytiques'}
              {activeTab === 'orders' && 'Gestion des Commandes'}
              {activeTab === 'catalog' && 'Catalogue de Produits'}
              {activeTab === 'crm' && 'Clients & CRM'}
              {activeTab === 'loyalty' && 'Fidélité & Points'}
              {activeTab === 'reviews' && 'Modération des Avis'}
              {activeTab === 'advice' && 'Espace Conseils'}
              {activeTab === 'branding' && 'Personnalisation & Couleurs'}
              {activeTab === 'snippets' && 'Snippets de Code'}
              {activeTab === 'cron' && 'Tâches Planifiées (Cron)'}
              {activeTab === 'audit-logs' && "Journaux d'Audit"}
              {activeTab === 'coupons' && 'Promotions & Codes Promo'}
              {activeTab === 'settings' && 'Paramètres de la Boutique'}
            </h1>
            <p className={`text-xs font-light mt-0.5 ${adminTheme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
              Administrateur • {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Spotlight Search Trigger Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              title="Rechercher (Cmd+K)"
              className={`px-3 py-1.5 border rounded-xl transition duration-200 flex items-center gap-2.5 cursor-pointer text-xs shrink-0 select-none ${
                adminTheme === 'light' 
                  ? 'bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 shadow-sm' 
                  : 'bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline font-normal text-slate-400 dark:text-slate-500">Rechercher...</span>
              <kbd className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-slate-100/40 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500">
                ⌘K
              </kbd>
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleAdminTheme}
              title={adminTheme === 'light' ? 'Sombre' : 'Clair'}
              className={`p-2 border rounded-full transition duration-205 flex items-center justify-center shrink-0 cursor-pointer ${
                adminTheme === 'light' 
                  ? 'bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 shadow-sm' 
                  : 'bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {adminTheme === 'light' ? <Moon className="w-3.5 h-3.5 text-indigo-500" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
            </button>

            {/* User Profile Hub Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(prev => !prev)}
                className={`flex items-center gap-2 px-2.5 py-1.5 border rounded-xl transition duration-200 cursor-pointer select-none ${
                  adminTheme === 'light'
                    ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-slate-100'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-emerald-500/10 dark:bg-emerald-400/10 flex items-center justify-center text-[9px] font-black text-emerald-600 dark:text-emerald-400">
                  {currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : 'AD'}
                </div>
                <span className="hidden sm:inline text-xs font-bold leading-none">{currentUser?.name || 'Admin'}</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProfileOpen && (
                <>
                  {/* Backdrop overlay to close on click outside */}
                  <div 
                    onClick={() => setIsProfileOpen(false)}
                    className="fixed inset-0 z-40 bg-transparent"
                  />
                  <div className={`absolute right-0 mt-2.5 w-60 rounded-2xl border p-4 shadow-xl z-50 animate-fade-in transition-all duration-200 ${
                    adminTheme === 'light'
                      ? 'bg-white border-slate-200 text-slate-800'
                      : 'bg-slate-900 border-slate-800 text-slate-100'
                  }`}>
                    {/* User Profile Header */}
                    <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-[10px] font-black text-white">
                        {currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : 'AD'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="block text-xs font-black truncate">{currentUser?.name || 'Administrateur'}</span>
                        <span className="block text-[10px] text-slate-400 truncate mt-0.5">{currentUser?.username || 'admin@ecom.ma'}</span>
                      </div>
                    </div>

                    {/* Quick Metadata */}
                    <div className="py-2.5 space-y-2 text-[10px] font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between items-center">
                        <span>Rôle :</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase ${
                          currentUser?.role === 'owner'
                            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {currentUser?.role === 'owner' ? 'Propriétaire' : currentUser?.role || 'Admin'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Sécurité MFA :</span>
                        <span className="flex items-center gap-1 font-black text-slate-400">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Protégé
                        </span>
                      </div>
                    </div>

                    {/* Actions Menu */}
                    <div className="pt-2">
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          setActiveTab('settings');
                          setActiveSettingsSubTab('security');
                        }}
                        className={`w-full flex items-center gap-2 px-2.5 py-2 text-xs font-semibold rounded-xl transition cursor-pointer ${
                          adminTheme === 'light' ? 'hover:bg-slate-50 text-slate-700' : 'hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <Key className="w-3.5 h-3.5" /> Sécurité & Mot de passe
                      </button>
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition cursor-pointer mt-1"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Déconnexion
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <span className={`px-2.5 py-1 border rounded-full text-[10px] font-mono font-semibold flex items-center gap-1.5 shrink-0 ${
              adminTheme === 'light' ? 'bg-white border-slate-200 text-slate-600 shadow-sm' : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}>
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-md animate-pulse" /> API MAROC ACTIVE
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
