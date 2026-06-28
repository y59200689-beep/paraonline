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
  setActiveTab: (tab: 'dashboard' | 'analytics' | 'orders' | 'catalog' | 'crm' | 'reviews' | 'settings' | 'loyalty' | 'branding' | 'advice' | 'snippets' | 'cron' | 'audit-logs' | 'coupons') => void;
  setOrdersSubTab: (sub: 'list' | 'abandoned' | 'shipping') => void;
  setCrmSubTab: (sub: 'clients' | 'diagnostics' | 'leads') => void;
  setActiveSettingsSubTab: (sub: 'general' | 'banners' | 'coupons' | 'shipping' | 'loyalty' | 'faq' | 'logs' | 'notifications' | 'operators') => void;
  setIsAddingCoupon: (adding: boolean) => void;
  setIsNewProductModalOpen: (open: boolean) => void;
  setSelectedOrder: (order: any) => void;
  setProductForm: (form: any) => void;
  handleOpenCrmCustomer: (phone: string, name: string, orders: any[], totalSpend: number) => void;
  setLoyaltySubTab: (sub: 'members' | 'product_points' | 'bulk_points' | 'logs') => void;
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
  handleOpenCrmCustomer,
  setLoyaltySubTab
}) => {
  const {
    orders,
    products,
    crmCustomers,
    adminTheme,
    toggleAdminTheme
  } = useAdmin();
  const { settings } = useSettings();
  const [searchQuery, setSearchQuery] = useState('');

  // Clear query on close
  useEffect(() => {
    if (!isSearchOpen) {
      setSearchQuery('');
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex items-start justify-center pt-[15vh] p-4 z-50 select-none"
      onClick={() => setIsSearchOpen(false)}
    >
      <div 
        className={`w-full max-w-xl border rounded-3xl overflow-hidden shadow-2xl flex flex-col ${
          adminTheme === 'light'
            ? 'bg-white/95 border-slate-200/80 text-slate-800'
            : 'bg-slate-900/95 border-slate-800 text-slate-100'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Box */}
        <div className={`flex items-center gap-3 px-4 py-3.5 border-b ${adminTheme === 'light' ? 'border-slate-100' : 'border-slate-800'}`}>
          <Search className={`w-4 h-4 shrink-0 ${adminTheme === 'light' ? 'text-slate-500' : 'text-slate-400'}`} />
          <input 
            type="text"
            autoFocus
            placeholder="Rechercher des commandes, produits, clients ou commandes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs font-semibold bg-transparent outline-none border-none placeholder-slate-500 text-inherit"
          />
          <span className={`text-[9px] font-mono font-bold border rounded px-1.5 py-0.5 shrink-0 ${
            adminTheme === 'light'
              ? 'bg-slate-50 border-slate-200 text-slate-400'
              : 'bg-slate-950 border-slate-800 text-slate-500'
          }`}>
            ESC
          </span>
        </div>

        {/* Results body */}
        <div className="max-h-[350px] overflow-y-auto p-3 space-y-4">
          {/* Category 1: Navigation / Core actions */}
          <div className="space-y-1">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 px-2.5 block mb-1.5">Commandes Système</span>
            {[
              { label: "Basculer le Thème (Clair/Sombre)", icon: Sun, aliases: ["theme", "light", "dark", "clair", "sombre", "mode"], action: () => { toggleAdminTheme(); setIsSearchOpen(false); } },
              { label: "Aller au Tableau de bord", icon: BarChart2, aliases: ["home", "accueil", "stats", "graphique", "analytics"], action: () => { setActiveTab('dashboard'); setIsSearchOpen(false); } },
              { label: "Gérer les Commandes", icon: ShoppingCart, aliases: ["orders", "ventes", "livraison", "statut"], action: () => { setActiveTab('orders'); setOrdersSubTab('list'); setIsSearchOpen(false); } },
              { label: "Expéditions & Reconciliation COD", icon: Truck, aliases: ["shipping", "livraison", "cod", "yalidine", "cathedis", "reconciliation", "suivi"], action: () => { setActiveTab('orders'); setOrdersSubTab('shipping'); setIsSearchOpen(false); } },
              { label: "Voir le Catalogue Produits", icon: Package, aliases: ["products", "stock", "article", "nouveau produit", "produits"], action: () => { setActiveTab('catalog'); setIsSearchOpen(false); } },
              { label: "Gérer la Fidélité & CRM (Clients)", icon: ClipboardList, aliases: ["customers", "clients", "points", "beauty wallet", "fidélité"], action: () => { setActiveTab('crm'); setCrmSubTab('clients'); setIsSearchOpen(false); } },
              { label: "Skin Diagnostics Hub", icon: Sliders, aliases: ["skin", "diagnostic", "peau", "dermocosmetic", "visage"], action: () => { setActiveTab('crm'); setCrmSubTab('diagnostics'); setIsSearchOpen(false); } },
              { label: "Leads & Prospects (Newsletter)", icon: ClipboardList, aliases: ["leads", "newsletter", "emails", "prospects", "contacts"], action: () => { setActiveTab('crm'); setCrmSubTab('leads'); setIsSearchOpen(false); } },
              { label: "Fidélité: Membres & Tiers", icon: Award, aliases: ["loyalty members", "membres fidélité", "tiers clients", "points fidélité"], action: () => { setActiveTab('loyalty'); setLoyaltySubTab('members'); setIsSearchOpen(false); } },
              { label: "Fidélité: Points Produits", icon: Layers, aliases: ["product points", "points par produit", "configurer points"], action: () => { setActiveTab('loyalty'); setLoyaltySubTab('product_points'); setIsSearchOpen(false); } },
              { label: "Fidélité: Modification Groupée", icon: Gift, aliases: ["bulk points", "modification groupée points", "points en masse"], action: () => { setActiveTab('loyalty'); setLoyaltySubTab('bulk_points'); setIsSearchOpen(false); } },
              { label: "Fidélité: Logs & Historique", icon: FileText, aliases: ["loyalty logs", "historique fidélité", "audit points", "ajustements points"], action: () => { setActiveTab('loyalty'); setLoyaltySubTab('logs'); setIsSearchOpen(false); } },
              { label: "Modérer les Avis Clients", icon: MessageSquare, aliases: ["reviews", "commentaires", "étoiles", "avis"], action: () => { setActiveTab('reviews'); setIsSearchOpen(false); } },
              { label: "Ouvrir les Paramètres Boutique", icon: Tag, aliases: ["settings", "general", "configuration"], action: () => { setActiveTab('settings'); setActiveSettingsSubTab('general'); setIsSearchOpen(false); } },
              { label: "Consulter les Journaux d'Audit", icon: Shield, aliases: ["logs", "audit", "historique", "connexions", "actions", "sécurité", "journaux"], action: () => { setActiveTab('audit-logs'); setIsSearchOpen(false); } },
              { label: "WhatsApp & Notifications", icon: Bell, aliases: ["whatsapp", "notifications", "messages", "alertes", "modèles"], action: () => { setActiveTab('settings'); setActiveSettingsSubTab('notifications'); setIsSearchOpen(false); } },
              { label: "Bannières & Diaporama", icon: Sliders, aliases: ["banners", "bannières", "carrousel", "slideshow", "images", "pub"], action: () => { setActiveTab('settings'); setActiveSettingsSubTab('banners'); setIsSearchOpen(false); } },
              { label: "Règles Fidélité Beauty Wallet", icon: Users, aliases: ["loyalty", "fidélité", "points", "règles", "beauty wallet"], action: () => { setActiveTab('settings'); setActiveSettingsSubTab('loyalty'); setIsSearchOpen(false); } },
              { label: "Gestion de la FAQ", icon: HelpCircle, aliases: ["faq", "questions", "réponses", "aide"], action: () => { setActiveTab('settings'); setActiveSettingsSubTab('faq'); setIsSearchOpen(false); } },
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
                  className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-bold transition duration-150 ease-out-premium flex items-center gap-3 cursor-pointer border-0 active:scale-[0.98] ${
                    adminTheme === 'light'
                      ? 'hover:bg-slate-50 text-slate-700 hover:text-slate-900 bg-transparent'
                      : 'hover:bg-slate-800/60 text-slate-300 hover:text-slate-100 bg-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{cmd.label}</span>
                </button>
              );
            })}
          </div>

          {/* Category 2: Orders matching */}
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
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 px-2.5 block mb-1.5">Commandes Correspondantes</span>
                    {filteredOrders.map((o) => (
                      <button
                        key={o.order_id}
                        onClick={() => {
                          setSelectedOrder(o);
                          setIsSearchOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-2 rounded-xl text-xs transition duration-150 ease-out-premium flex items-center justify-between cursor-pointer border-0 active:scale-[0.98] ${
                          adminTheme === 'light'
                            ? 'hover:bg-slate-50 text-slate-700 bg-transparent'
                            : 'hover:bg-slate-800/60 text-slate-300 bg-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <ShoppingCart className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <div className="min-w-0">
                            <span className="font-bold block font-mono">{o.order_id}</span>
                            <span className="text-[10px] text-slate-400 block truncate">{o.customer_name} ({o.phone_number})</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-extrabold font-mono text-emerald-500 shrink-0">{o.total.toFixed(0)} DH</span>
                      </button>
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
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 px-2.5 block mb-1.5">Produits Correspondants</span>
                    {filteredProducts.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setProductForm({
                            id: p.id,
                            title: p.title,
                            name: p.name || '',
                            price: p.price,
                            comparePrice: p.comparePrice || 0,
                            stock: p.stock || 0,
                            image: p.image,
                            category: p.category || '',
                            description: p.description || '',
                            ingredients: p.ingredients || '',
                            usage: p.usage || '',
                            slug: p.slug || '',
                            metaTitle: p.metaTitle || '',
                            metaDescription: p.metaDescription || ''
                          });
                          setIsNewProductModalOpen(true);
                          setIsSearchOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-2 rounded-xl text-xs transition duration-150 ease-out-premium flex items-center justify-between cursor-pointer border-0 active:scale-[0.98] ${
                          adminTheme === 'light'
                            ? 'hover:bg-slate-50 text-slate-700 bg-transparent'
                            : 'hover:bg-slate-800/60 text-slate-300 bg-transparent'
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
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 px-2.5 block mb-1.5">Clients CRM Correspondants</span>
                    {filteredClients.map((c: any, i: number) => (
                      <button
                        key={i}
                        onClick={() => {
                          handleOpenCrmCustomer(c.phone, c.name, c.orders, c.totalSpend);
                          setIsSearchOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-2 rounded-xl text-xs transition duration-150 ease-out-premium flex items-center justify-between cursor-pointer border-0 active:scale-[0.98] ${
                          adminTheme === 'light'
                            ? 'hover:bg-slate-50 text-slate-700 bg-transparent'
                            : 'hover:bg-slate-800/60 text-slate-300 bg-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <ClipboardList className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <div className="min-w-0">
                            <span className="font-bold block truncate">{c.name || 'Client Anonyme'}</span>
                            <span className="text-[10px] text-slate-400 block truncate">{c.phone} • {c.orders.length} commande(s)</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-extrabold font-mono text-amber-500 shrink-0">
                          {Math.round(c.totalSpend * (settings.loyaltyPointsPerDh || 1))} pts
                        </span>
                      </button>
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
          <span>Astuce: Recherchez par mots-clés. Appuyez sur Esc pour quitter.</span>
          <span className="flex items-center gap-1"><Command className="w-2.5 h-2.5" /> + K pour fermer</span>
        </div>
      </div>
    </div>
  );
};
