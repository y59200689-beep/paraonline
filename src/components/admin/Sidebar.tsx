'use client';

import React from 'react';
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
  Shield
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
  const {
    orders,
    reviews,
    currentUser,
    adminTheme,
    handleLogout
  } = useAdmin();
  const { settings } = useSettings();

  return (
    <>
      {isMobileDrawerOpen && (
        <div 
          onClick={() => setIsMobileDrawerOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-[1px] z-40 md:hidden transition-opacity duration-300 animate-fade-in"
        />
      )}
      
      <aside 
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        className={`shrink-0 flex flex-col p-3 space-y-6 justify-between transition-all duration-300 h-full overflow-y-auto ${
          isMobileDrawerOpen 
            ? 'fixed inset-y-0 left-0 w-64 z-50 flex shadow-2xl animate-slide-in' 
            : 'hidden md:flex'
        } ${
          sidebarCollapsed ? 'md:w-16' : 'md:w-64'
        } ${
          adminTheme === 'light' ? 'admin-sidebar-light' : 'admin-sidebar-dark'
        }`}
      >
        <div className="space-y-5">
          {/* Brand header */}
          <div className={`flex items-center gap-3 px-1 ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-black text-white text-[13px] shadow-md shadow-emerald-500/20 shrink-0 tracking-tight">
              PO
            </div>
            {!sidebarCollapsed && (
              <div>
                <h2 className={`font-bold text-[13px] tracking-tight leading-tight ${adminTheme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                  {settings?.storeName || 'Para Officinal'}
                </h2>
                <span className={`text-[10px] font-medium flex items-center gap-1.5 mt-0.5 ${adminTheme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${adminTheme === 'light' ? 'bg-emerald-500' : 'bg-emerald-400'}`} />
                  Base active
                </span>
              </div>
            )}
          </div>

          <nav className="space-y-1">
            {[
              { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard, count: orders.filter(o => o.status.toLowerCase() === 'pending').length > 0 ? orders.filter(o => o.status.toLowerCase() === 'pending').length : undefined, countColor: 'bg-rose-500' },
              { id: 'analytics', label: 'Analytiques', icon: BarChart2 },
              { id: 'orders', label: 'Commandes', icon: ShoppingBag, count: orders.filter(o => o.status.toLowerCase() === 'pending').length },
              { id: 'catalog', label: 'Catalogue Produits', icon: Table },
              { id: 'crm', label: 'Clients & CRM', icon: Users },
              { id: 'loyalty', label: 'Fidélité & Points', icon: Award },
              { id: 'reviews', label: 'Avis Clients', icon: Star, count: reviews.filter(r => r.status === 'pending').length },
              { id: 'advice', label: 'Espace Conseils', icon: BookOpen },
              { id: 'branding', label: 'Personnalisation', icon: Palette },
              { id: 'snippets', label: 'Snippets de Code', icon: Code },
              { id: 'cron', label: 'Tâches Planifiées', icon: Clock },
              { id: 'coupons', label: 'Promotions', icon: Ticket },
              ...(currentUser?.role === 'owner' ? [{ id: 'audit-logs', label: "Journaux d'Audit", icon: Shield }] : []),
              { id: 'settings', label: 'Paramètres', icon: Sliders }
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const badgeColor = (item as any).countColor || 'bg-emerald-500';
              return (
                <Link
                  key={item.id}
                  href={item.id === 'dashboard' ? '/admin' : `/admin/${item.id}`}
                  prefetch={true}
                  title={sidebarCollapsed ? item.label : undefined}
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                  }}
                  className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} px-3 py-2.5 rounded-xl text-[13px] font-semibold tracking-normal border transition-all duration-205 ease-out-premium hover:translate-x-1 active:scale-[0.97] relative cursor-pointer ${
                    isActive
                      ? (adminTheme === 'light'
                          ? `admin-nav-active-light text-emerald-700 font-extrabold ${!sidebarCollapsed ? 'border-l-2 border-l-emerald-600 border-y-transparent border-r-transparent pl-[9px]' : ''}`
                          : `admin-nav-active-dark text-emerald-400 font-extrabold ${!sidebarCollapsed ? 'border-l-2 border-l-emerald-400 border-y-transparent border-r-transparent pl-[9px]' : ''}`)
                      : (adminTheme === 'light'
                          ? 'text-slate-500 border-transparent hover:text-slate-800 hover:bg-slate-100/70'
                          : 'text-slate-500 border-transparent hover:text-slate-200 hover:bg-white/5')
                  }`}
                >
                  <div className={`flex items-center ${sidebarCollapsed ? '' : 'gap-2.5'}`}>
                    <Icon className={`w-4 h-4 shrink-0 transition ${
                      isActive
                        ? (adminTheme === 'light' ? 'text-emerald-600' : 'text-emerald-400')
                        : (adminTheme === 'light' ? 'text-slate-500' : 'text-slate-400')
                    }`} />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </div>
                  {!sidebarCollapsed && item.count !== undefined && item.count > 0 && (
                    <span className={`${badgeColor} text-white font-extrabold text-[10px] px-1.5 py-0.5 rounded-full min-w-4 text-center`}>
                      {item.count}
                    </span>
                  )}
                  {sidebarCollapsed && item.count !== undefined && item.count > 0 && (
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-rose-500" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className={`pt-4 border-t space-y-2 ${adminTheme === 'light' ? 'border-slate-100' : 'border-slate-900/80'}`}>
          {!sidebarCollapsed && (
            <div className={`p-2.5 rounded-xl flex items-center gap-2.5 transition border ${
              adminTheme === 'light' ? 'bg-slate-50/50 border-slate-200 text-slate-700' : 'bg-slate-900/40 border-slate-800/60 text-slate-300'
            }`}>
              <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-[10px] font-extrabold text-emerald-600 shrink-0">
                {currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : 'AD'}
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[11px] font-bold truncate leading-tight">
                  {currentUser?.name || 'Administrateur'}
                </span>
                <span className="flex items-center gap-1 text-[9px] text-slate-400 font-medium mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                  {currentUser?.role === 'owner' ? 'Propriétaire' : currentUser?.role === 'logistician' ? 'Logisticien' : currentUser?.role === 'support' ? 'Support' : 'Admin'}
                </span>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            title={sidebarCollapsed ? 'Se Déconnecter' : undefined}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-2.5'} px-3 py-2 text-xs font-semibold rounded-xl border border-transparent transition duration-200 cursor-pointer ${
              adminTheme === 'light'
                ? 'text-rose-600 hover:text-rose-700 hover:bg-rose-50 hover:border-rose-100/50'
                : 'text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 hover:border-rose-950/40'
            }`}
          >
            <LogOut className="w-4 h-4" />
            {!sidebarCollapsed && <span>Se Déconnecter</span>}
          </button>
          
          <button
            onClick={() => setSidebarCollapsed(c => !c)}
            className={`hidden md:flex w-full items-center justify-center px-3 py-2 text-[10px] font-semibold rounded-xl border border-transparent transition duration-205 gap-1 cursor-pointer ${
              adminTheme === 'light'
                ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 hover:border-slate-200/40'
                : 'text-slate-600 hover:text-slate-400 hover:bg-slate-900/50'
            }`}
          >
            {sidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <><ChevronLeft className="w-3.5 h-3.5" /><span>Réduire</span></>}
          </button>
        </div>
      </aside>
    </>
  );
};
