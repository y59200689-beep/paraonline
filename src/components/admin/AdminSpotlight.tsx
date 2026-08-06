'use client';

import React, { useState, useEffect } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { useSettings } from '@/context/SettingsContext';
import {
  Search,
  Sun,
  BarChart2,
  ShoppingCart,
  Truck,
  Package,
  ClipboardList,
  Award,
  Sliders,
  FileText,
  MessageSquare,
  Tag,
  Bell,
  HelpCircle,
  Save,
  Upload,
  Command,
  Gift,
  Layers,
  Users,
  Shield
} from 'lucide-react';

interface AdminSpotlightProps {
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  setActiveTab: (tab: 'dashboard' | 'analytics' | 'orders' | 'catalog' | 'crm' | 'reviews' | 'settings' | 'loyalty' | 'branding' | 'advice' | 'snippets' | 'cron' | 'audit-logs' | 'coupons' | 'gallery') => void;
  setOrdersSubTab: (sub: 'list' | 'abandoned' | 'shipping') => void;
  setCrmSubTab: (sub: 'clients' | 'diagnostics' | 'leads') => void;
  setActiveSettingsSubTab: (sub: 'general' | 'banners' | 'coupons' | 'shipping' | 'loyalty' | 'faq' | 'logs' | 'notifications' | 'operators') => void;
  setIsAddingCoupon: (adding: boolean) => void;
  setIsNewProductModalOpen: (open: boolean) => void;
  setSelectedOrder: (order: any) => void;
  setProductForm: (form: any) => void;
  setSpotlightTarget: (target: { type: 'order' | 'product'; id: string } | null) => void;
  handleOpenCrmCustomer: (phone: string, name: string, orders: any[], totalSpend: number) => void;
  setLoyaltySubTab: (sub: 'product_points' | 'bulk_points' | 'logs') => void;
}

export const AdminSpotlight: React.FC<AdminSpotlightProps> = ({
  isSearchOpen,
  setIsSearchOpen,
  setActiveTab,
  setOrdersSubTab,
  setCrmSubTab,
  setActiveSettingsSubTab,
  setIsAddingCoupon,
  setIsNewProductModalOpen,
  setSelectedOrder,
  setProductForm,
  setSpotlightTarget,
  handleOpenCrmCustomer,
  setLoyaltySubTab
}) => {
  const {
    orders,
    products,
    crmCustomers,
    adminTheme,
    toggleAdminTheme,
    handleUpdateOrderStatus,
    logAdminAction
  } = useAdmin();
  const { settings } = useSettings();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Clear query & reset index on open/close
  useEffect(() => {
    if (!isSearchOpen) {
      setSearchQuery('');
      setSelectedIndex(0);
    }
  }, [isSearchOpen]);

  // Copy helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
  };

  if (!isSearchOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-start justify-center pt-[10vh] p-4 z-[9999] select-none"
      onClick={() => setIsSearchOpen(false)}
    >
      <div 
        className={`w-full max-w-2xl border rounded-3xl overflow-hidden shadow-2xl flex flex-col ${
          adminTheme === 'light'
            ? 'bg-white/95 border-slate-200/80 text-slate-800'
            : 'bg-slate-900/95 border-slate-800 text-slate-100'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Box */}
        <div className={`flex items-center gap-3 px-4 py-3.5 border-b ${adminTheme === 'light' ? 'border-slate-100' : 'border-slate-800'}`}>
          <Search className={`w-4 h-4 shrink-0 ${adminTheme === 'light' ? 'text-emerald-600' : 'text-emerald-400'}`} />
          <input 
            type="text"
            autoFocus
            placeholder="Rechercher des commandes (#PO-), clients, produits ou actions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs font-bold bg-transparent outline-none border-none placeholder-slate-400 text-inherit"
          />
          <span className={`text-[9px] font-mono font-bold border rounded px-1.5 py-0.5 shrink-0 ${
            adminTheme === 'light'
              ? 'bg-slate-100 border-slate-200 text-slate-500'
              : 'bg-slate-950 border-slate-800 text-slate-400'
          }`}>
            ESC
          </span>
        </div>

        {/* Results body */}
        <div className="max-h-[420px] overflow-y-auto p-3 space-y-4">
          {/* Category 1: System Commands */}
          <div className="space-y-1">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 px-2.5 block mb-1.5">Raccourcis & Actions Rapides</span>
            {[
              { label: "Basculer le Thème (Clair/Sombre)", icon: Sun, aliases: ["theme", "light", "dark", "clair", "sombre", "mode"], action: () => { toggleAdminTheme(); setIsSearchOpen(false); } },
              { label: "Aller au Tableau de bord", icon: BarChart2, aliases: ["home", "accueil", "stats", "graphique", "analytics"], action: () => { setActiveTab('dashboard'); setIsSearchOpen(false); } },
              { label: "Voir les Analytiques", icon: BarChart2, aliases: ["analytics", "rapports", "revenu", "performance"], action: () => { setActiveTab('analytics'); setIsSearchOpen(false); } },
              { label: "Gérer les Commandes", icon: ShoppingCart, aliases: ["orders", "ventes", "livraison", "statut"], action: () => { setActiveTab('orders'); setOrdersSubTab('list'); setIsSearchOpen(false); } },
              { label: "Expéditions & Reconciliation COD", icon: Truck, aliases: ["shipping", "livraison", "cod", "yalidine", "cathedis", "reconciliation", "suivi"], action: () => { setActiveTab('orders'); setOrdersSubTab('shipping'); setIsSearchOpen(false); } },
              { label: "Voir le Catalogue Produits", icon: Package, aliases: ["products", "stock", "article", "nouveau produit", "produits"], action: () => { setActiveTab('catalog'); setIsSearchOpen(false); } },
              { label: "Gérer la Fidélité & CRM (Clients)", icon: ClipboardList, aliases: ["customers", "clients", "points", "beauty wallet", "fidélité"], action: () => { setActiveTab('crm'); setCrmSubTab('clients'); setIsSearchOpen(false); } },
              { label: "Gérer les Avis Clients", icon: MessageSquare, aliases: ["avis", "reviews", "commentaires", "notes"], action: () => { setActiveTab('reviews'); setIsSearchOpen(false); } },
              { label: "Gérer la Galerie Médias", icon: Layers, aliases: ["gallery", "images", "médias", "bannières"], action: () => { setActiveTab('gallery'); setIsSearchOpen(false); } },
              { label: "Ouvrir les Promotions", icon: Tag, aliases: ["promotions", "coupons", "réductions", "offres"], action: () => { setActiveTab('coupons'); setIsSearchOpen(false); } },
              { label: "Voir les Tâches Planifiées", icon: ClipboardList, aliases: ["cron", "sync", "automatisation", "stock"], action: () => { setActiveTab('cron'); setIsSearchOpen(false); } },
              { label: "Ouvrir les Paramètres", icon: Sliders, aliases: ["settings", "configuration", "paramètres", "paiement"], action: () => { setActiveTab('settings'); setIsSearchOpen(false); } },
              { label: "Créer un Code Promo", icon: Save, aliases: ["coupon", "réduction", "rabais", "code promo", "coupons", "promotions"], action: () => { setActiveTab('coupons'); setIsAddingCoupon(true); setIsSearchOpen(false); } },
              { label: "Créer un Nouveau Produit", icon: Upload, aliases: ["add product", "nouveau produit", "ajouter"], action: () => { setIsNewProductModalOpen(true); setIsSearchOpen(false); } }
            ].filter(cmd => 
              cmd.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
              (cmd.aliases || []).some(alias => alias.toLowerCase().includes(searchQuery.toLowerCase()))
            ).map((cmd, idx) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={idx}
                  onClick={cmd.action}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition duration-150 ease-out-premium flex items-center justify-between cursor-pointer border-0 active:scale-[0.98] ${
                    adminTheme === 'light'
                      ? 'hover:bg-slate-100 text-slate-700 hover:text-slate-900 bg-transparent'
                      : 'hover:bg-slate-800/80 text-slate-300 hover:text-slate-100 bg-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{cmd.label}</span>
                  </div>
                  <span className="text-[9px] font-mono opacity-50 uppercase">Exécuter</span>
                </button>
              );
            })}
          </div>

          {/* Category 2: Orders matching with direct status actions */}
          {searchQuery.length >= 2 && (
            <>
              {/* Matching Orders */}
              {(() => {
                const filteredOrders = orders.filter(o => 
                  o.order_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  o.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  o.phone_number.toLowerCase().includes(searchQuery.toLowerCase())
                ).slice(0, 4);

                if (filteredOrders.length === 0) return null;
                return (
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 px-2.5 block mb-1.5">Commandes avec Actions Directes</span>
                    {filteredOrders.map((o) => (
                      <div
                        key={o.order_id}
                        className={`p-3 rounded-2xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                          adminTheme === 'light'
                            ? 'bg-slate-50/80 border-slate-200/80 hover:bg-slate-100/80'
                            : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/70'
                        }`}
                      >
                        <div 
                          onClick={() => {
                            setOrdersSubTab('list');
                            setSpotlightTarget({ type: 'order', id: o.order_id });
                            setActiveTab('orders');
                            setIsSearchOpen(false);
                          }}
                          className="flex items-center gap-3 cursor-pointer min-w-0 flex-1"
                        >
                          <ShoppingCart className="w-4 h-4 text-blue-500 shrink-0" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold font-mono text-xs">{o.order_id}</span>
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                {o.status}
                              </span>
                            </div>
                            <span className="text-[10.5px] text-slate-400 block truncate">{o.customer_name} ({o.phone_number})</span>
                          </div>
                        </div>

                        {/* Inline Order Actions */}
                        <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                          <button
                            type="button"
                            onClick={() => {
                              handleUpdateOrderStatus(o.order_id, 'Confirmed');
                              logAdminAction('Statut Modifié via Spotlight', `Commande ${o.order_id} passée à Confirmed`);
                            }}
                            className="px-2 py-1 rounded-lg text-[9.5px] font-bold bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 border border-blue-500/30 transition cursor-pointer"
                            title="Marquer comme Confirmée"
                          >
                            Confirmée
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handleUpdateOrderStatus(o.order_id, 'Shipped');
                              logAdminAction('Statut Modifié via Spotlight', `Commande ${o.order_id} passée à Shipped`);
                            }}
                            className="px-2 py-1 rounded-lg text-[9.5px] font-bold bg-purple-500/15 text-purple-400 hover:bg-purple-500/25 border border-purple-500/30 transition cursor-pointer"
                            title="Marquer comme Expédiée"
                          >
                            Expédiée
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handleUpdateOrderStatus(o.order_id, 'Delivered');
                              logAdminAction('Statut Modifié via Spotlight', `Commande ${o.order_id} passée à Delivered`);
                            }}
                            className="px-2 py-1 rounded-lg text-[9.5px] font-bold bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30 transition cursor-pointer"
                            title="Marquer comme Livrée"
                          >
                            Livrée
                          </button>
                          <a
                            href={`https://wa.me/${o.phone_number.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1 rounded-lg text-[9.5px] font-bold text-white transition bg-emerald-600 hover:bg-emerald-500 cursor-pointer"
                            title="Contacter sur WhatsApp"
                          >
                            WhatsApp
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* Matching Products */}
              {(() => {
                const filteredProducts = products.filter(p => 
                  (p.name || p.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (p.category || '').toLowerCase().includes(searchQuery.toLowerCase())
                ).slice(0, 4);

                if (filteredProducts.length === 0) return null;
                return (
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 px-2.5 block mb-1.5">Produits Catalogue</span>
                    {filteredProducts.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setSpotlightTarget({ type: 'product', id: String(p.id) });
                          setActiveTab('catalog');
                          setIsSearchOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs transition duration-150 flex items-center justify-between cursor-pointer border-0 active:scale-[0.98] ${
                          adminTheme === 'light'
                            ? 'hover:bg-slate-100 text-slate-700 bg-transparent'
                            : 'hover:bg-slate-800/70 text-slate-300 bg-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Package className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                          <div className="min-w-0">
                            <span className="font-bold block truncate">{p.name || p.title}</span>
                            <span className="text-[10px] text-slate-400 block truncate">{p.category} • Stock: {p.stock || 0}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-extrabold font-mono text-emerald-500 shrink-0">{p.price.toFixed(0)} DH</span>
                      </button>
                    ))}
                  </div>
                );
              })()}

              {/* Matching Clients CRM */}
              {(() => {
                const filteredClients = crmCustomers.filter((c: any) => 
                  c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  c.phone.toLowerCase().includes(searchQuery.toLowerCase())
                ).slice(0, 4);

                if (filteredClients.length === 0) return null;
                return (
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 px-2.5 block mb-1.5">Clients CRM</span>
                    {filteredClients.map((c: any, i: number) => (
                      <div
                        key={i}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                          adminTheme === 'light'
                            ? 'bg-slate-50 border-slate-200/80 hover:bg-slate-100'
                            : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/70'
                        }`}
                      >
                        <div 
                          onClick={() => {
                            handleOpenCrmCustomer(c.phone, c.name, c.orders, c.totalSpend);
                            setIsSearchOpen(false);
                          }}
                          className="flex items-center gap-3 cursor-pointer min-w-0 flex-1"
                        >
                          <Users className="w-4 h-4 text-rose-500 shrink-0" />
                          <div className="min-w-0">
                            <span className="font-extrabold block truncate text-xs">{c.name || 'Client Anonyme'}</span>
                            <span className="text-[10px] text-slate-400 block truncate">{c.phone} • {c.orders.length} commande(s)</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <a
                            href={`https://wa.me/${c.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1 rounded-lg text-[9.5px] font-bold text-white transition bg-emerald-600 hover:bg-emerald-500 cursor-pointer"
                          >
                            WhatsApp
                          </a>
                          <button
                            type="button"
                            onClick={() => handleCopy(c.phone, 'Téléphone')}
                            className="px-2 py-1 rounded-lg text-[9.5px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                          >
                            Copier Tél
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </>
          )}
        </div>

        {/* Bottom Footer Info */}
        <div className={`px-4 py-2 text-[9px] font-semibold text-slate-400 border-t flex justify-between items-center ${
          adminTheme === 'light' ? 'bg-slate-50 border-slate-100' : 'bg-slate-950/50 border-slate-800'
        }`}>
          <span>Astuce: Recherchez un n° de commande (#PO-), client ou action rapide.</span>
          <span className="flex items-center gap-1 font-mono"><Command className="w-2.5 h-2.5" /> + K</span>
        </div>
      </div>
    </div>
  );
};
