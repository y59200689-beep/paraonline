'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Printer, 
  ArrowLeft, 
  FileText, 
  Settings, 
  Filter, 
  Plus, 
  Search, 
  DollarSign, 
  AlertCircle, 
  Truck, 
  Percent,
  Calendar,
  X,
  FileDown
} from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { Product } from '@/lib/data';

interface RestockProduct extends Omit<Product, 'status'> {
  totalSold: number;
  velocityPerDay: number;
  velocityPerWeek: number;
  coverageDays: number;
  status: 'critical' | 'attention' | 'safe';
  suggestedQty: number;
}

export default function RestockForecastingTab() {
  const { 
    products, 
    orders, 
    currentUser, 
    adminTheme, 
    isDataLoading,
    logAdminAction
  } = useAdmin();

  // Role safety permission
  const isReadOnly = currentUser?.role === 'support';

  // ── Configuration States ──
  const [salesWindow, setSalesWindow] = useState<7 | 14 | 30>(30);
  const [targetCoverage, setTargetCoverage] = useState<30 | 60 | 90 | 120>(90);
  const [leadTime, setLeadTime] = useState<number>(30); // Default 30 days

  // ── Filter States ──
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // ── Selection States ──
  const [selectedProducts, setSelectedProducts] = useState<Record<number, boolean>>({});

  // ── Wizard & Print States ──
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // ── PO Form States ──
  const [supplierName, setSupplierName] = useState('');
  const [supplierEmail, setSupplierEmail] = useState('');
  const [supplierAddress, setSupplierAddress] = useState('');
  const [poReference, setPoReference] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  const [poDate, setPoDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [vatRate, setVatRate] = useState<number>(20); // 20% VAT default in Morocco

  // Editable Quantities & Buying Costs for selected items in PO
  const [poItems, setPoItems] = useState<Record<number, { quantity: number; unitCost: number }>>({});

  // Get unique vendors/brands and categories for filtering
  const uniqueVendors = useMemo(() => {
    const vendors = products.map(p => p.vendor).filter(Boolean);
    return Array.from(new Set(vendors)).sort();
  }, [products]);

  const uniqueCategories = useMemo(() => {
    const cats = products.map(p => p.category).filter(Boolean);
    return Array.from(new Set(cats)).sort();
  }, [products]);

  // Reset checkboxes when vendor filter changes
  useEffect(() => {
    setSelectedProducts({});
  }, [selectedVendor]);

  // ── Calculate sales velocities and coverage days ──
  const computedProducts = useMemo((): RestockProduct[] => {
    const now = new Date();
    const windowStart = new Date(now.getTime() - salesWindow * 24 * 60 * 60 * 1000);

    const productQuantities: Record<number, number> = {};

    orders.forEach(order => {
      const status = (order.status || '').toLowerCase();
      if (status.includes('annul') || status === 'cancelled') {
        return;
      }
      const orderDate = new Date(order.created_at || order.date || now);
      if (orderDate >= windowStart && orderDate <= now) {
        (order.items || []).forEach(item => {
          const id = item.id;
          const qty = item.quantity || 0;
          productQuantities[id] = (productQuantities[id] || 0) + qty;
        });
      }
    });

    return products.map(product => {
      const totalSold = productQuantities[product.id] || 0;
      const velocityPerDay = totalSold / salesWindow;
      const velocityPerWeek = velocityPerDay * 7;
      
      // Calculate stock recursively (either product.stock or sum of variants)
      const stock = product.stock !== undefined 
        ? product.stock 
        : (product.variants?.reduce((sum, v) => sum + (v.stock ?? 0), 0) ?? 0);

      let coverageDays = Infinity;
      if (velocityPerDay > 0) {
        coverageDays = stock / velocityPerDay;
      }

      let status: 'critical' | 'attention' | 'safe' = 'safe';
      if (velocityPerDay > 0) {
        if (coverageDays <= leadTime) {
          status = 'critical';
        } else if (coverageDays <= 1.5 * leadTime) {
          status = 'attention';
        }
      } else if (stock <= 5) {
        // Fallback for static low stock alert when there are no sales in current window
        status = 'critical';
      }

      const suggestedQty = velocityPerDay > 0
        ? Math.max(0, Math.ceil(velocityPerDay * targetCoverage) - stock)
        : (stock <= 5 ? Math.max(0, 15 - stock) : 0); // Seed suggestion for zero-velocity low-stock items

      return {
        ...product,
        stock,
        totalSold,
        velocityPerDay,
        velocityPerWeek,
        coverageDays,
        status,
        suggestedQty
      };
    });
  }, [products, orders, salesWindow, leadTime, targetCoverage]);

  // ── Filter products list ──
  const filteredProducts = useMemo(() => {
    return computedProducts.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (p.vendor || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesVendor = selectedVendor === 'all' || p.vendor === selectedVendor;
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || p.status === selectedStatus;
      
      return matchesSearch && matchesVendor && matchesCategory && matchesStatus;
    });
  }, [computedProducts, searchQuery, selectedVendor, selectedCategory, selectedStatus]);

  // Checkbox handlers
  const handleSelectAll = (checked: boolean) => {
    if (selectedVendor === 'all') return; // Cannot bulk select across all vendors
    const updated = { ...selectedProducts };
    filteredProducts.forEach(p => {
      if (p.vendor === selectedVendor) {
        if (checked) {
          updated[p.id] = true;
        } else {
          delete updated[p.id];
        }
      }
    });
    setSelectedProducts(updated);
  };

  const handleSelectProduct = (productId: number, checked: boolean) => {
    const updated = { ...selectedProducts };
    if (checked) {
      updated[productId] = true;
    } else {
      delete updated[productId];
    }
    setSelectedProducts(updated);
  };

  const selectedCount = Object.keys(selectedProducts).length;

  // Initialize PO Form and open wizard
  const handleOpenWizard = () => {
    if (selectedCount === 0 || isReadOnly) return;
    
    // Auto populate fields based on the vendor
    const vendor = selectedVendor !== 'all' ? selectedVendor : filteredProducts.find(p => selectedProducts[p.id])?.vendor || '';
    setSupplierName(`${vendor} Distributor`);
    setSupplierEmail(`orders@${vendor.toLowerCase().replace(/\s+/g, '')}.com`);
    setSupplierAddress(`K-Beauty Export Zone, Seoul, South Korea`);
    
    // Generating reference
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const cleanVendor = vendor.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
    setPoReference(`PO-${cleanVendor}-${dateStr}`);
    
    // Set quantities and costs
    const initialItems: Record<number, { quantity: number; unitCost: number }> = {};
    filteredProducts.forEach(p => {
      if (selectedProducts[p.id]) {
        // unit cost fallback: product.buyingCost -> product.buying_cost -> 60% of retail price
        const cost = p.buyingCost ?? (p as any).buying_cost ?? Math.round(p.price * 0.6);
        initialItems[p.id] = {
          quantity: p.suggestedQty > 0 ? p.suggestedQty : 10,
          unitCost: cost
        };
      }
    });
    setPoItems(initialItems);
    setIsWizardOpen(true);
  };

  // PO Totals calculations
  const poCalculations = useMemo(() => {
    let subtotal = 0;
    let totalItemsCount = 0;
    const itemsList: Array<{
      product: RestockProduct;
      quantity: number;
      unitCost: number;
      totalCost: number;
    }> = [];

    computedProducts.forEach(p => {
      if (poItems[p.id]) {
        const itemConfig = poItems[p.id];
        const totalCost = itemConfig.quantity * itemConfig.unitCost;
        subtotal += totalCost;
        totalItemsCount += itemConfig.quantity;
        itemsList.push({
          product: p,
          quantity: itemConfig.quantity,
          unitCost: itemConfig.unitCost,
          totalCost
        });
      }
    });

    const vatAmount = (subtotal * vatRate) / 100;
    const grandTotal = subtotal + vatAmount;

    return {
      subtotal,
      totalItemsCount,
      vatAmount,
      grandTotal,
      itemsList
    };
  }, [computedProducts, poItems, vatRate]);

  // Handle saving/printing
  const handlePrint = () => {
    // Audit logging
    logAdminAction(
      "Génération Bon de Commande", 
      `PO imprimé : Réf ${poReference} pour ${supplierName} (${poCalculations.totalItemsCount} articles, Total ${poCalculations.grandTotal.toFixed(2)} DH)`
    );
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Role Restriction Alert */}
      {isReadOnly && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>
            <strong>Mode Consultation Uniquement</strong> : Votre profil d&apos;administrateur support est en lecture seule. Vous pouvez consulter les prévisions mais la création de bons de commande est restreinte.
          </span>
        </div>
      )}

      {/* ── Configuration Dashboard Card ── */}
      <div className={`p-5 rounded-3xl border transition-all duration-300 ${
        adminTheme === 'light' 
          ? 'bg-white border-slate-200/80 shadow-sm' 
          : 'bg-slate-900/40 border-slate-800/80'
      }`}>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
          <div>
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-3.5 h-3.5" /> Moteur de Prévision
            </span>
            <h2 className={`text-lg font-black tracking-tight ${adminTheme === 'light' ? 'text-slate-800' : 'text-slate-100'}`}>
              Ravitaillement & Vélocité de Vente
            </h2>
            <p className={`text-xs font-light mt-0.5 ${adminTheme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
              Analyse de la couverture de stock pour contrer les délais de livraison importés (3 à 6 semaines)
            </p>
          </div>

          <div className="flex flex-wrap gap-4 w-full lg:w-auto items-end">
            {/* Sales window */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Période d&apos;analyse (Vélocité)
              </label>
              <select
                value={salesWindow}
                onChange={(e) => setSalesWindow(Number(e.target.value) as any)}
                className={`text-[11px] h-9 rounded-xl px-3 border outline-none font-medium cursor-pointer transition ${
                  adminTheme === 'light'
                    ? 'bg-slate-100 border-slate-200 text-slate-700 focus:bg-white focus:ring-1 focus:ring-emerald-500'
                    : 'bg-slate-950 border-slate-800 text-slate-200 focus:bg-slate-900 focus:ring-1 focus:ring-emerald-500'
                }`}
              >
                <option value={7}>7 Derniers Jours</option>
                <option value={14}>14 Derniers Jours</option>
                <option value={30}>30 Derniers Jours</option>
              </select>
            </div>

            {/* Target coverage */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Cible de Couverture (Jours)
              </label>
              <select
                value={targetCoverage}
                onChange={(e) => setTargetCoverage(Number(e.target.value) as any)}
                className={`text-[11px] h-9 rounded-xl px-3 border outline-none font-medium cursor-pointer transition ${
                  adminTheme === 'light'
                    ? 'bg-slate-100 border-slate-200 text-slate-700 focus:bg-white focus:ring-1 focus:ring-emerald-500'
                    : 'bg-slate-950 border-slate-800 text-slate-200 focus:bg-slate-900 focus:ring-1 focus:ring-emerald-500'
                }`}
              >
                <option value={30}>30 Jours de Stock</option>
                <option value={60}>60 Jours de Stock</option>
                <option value={90}>90 Jours de Stock (Recommandé)</option>
                <option value={120}>120 Jours de Stock</option>
              </select>
            </div>

            {/* Supplier Lead time */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Délai de Livraison (Jours)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  max={90}
                  value={leadTime}
                  onChange={(e) => setLeadTime(Math.max(1, Number(e.target.value)))}
                  className={`w-24 text-[11px] h-9 rounded-xl pl-3 pr-7 border outline-none font-medium transition ${
                    adminTheme === 'light'
                      ? 'bg-slate-100 border-slate-200 text-slate-700 focus:bg-white focus:ring-1 focus:ring-emerald-500'
                      : 'bg-slate-950 border-slate-800 text-slate-200 focus:bg-slate-900 focus:ring-1 focus:ring-emerald-500'
                  }`}
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400">J</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Alerts Summary Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5 pt-5 border-t border-slate-200/50 dark:border-slate-800/50">
          {[
            { 
              label: 'Alertes Critiques', 
              count: computedProducts.filter(p => p.status === 'critical').length, 
              color: 'text-rose-500 border-rose-500/10 bg-rose-500/5',
              desc: 'Stock restant inférieur au délai de livraison.'
            },
            { 
              label: 'Stock à Surveiller', 
              count: computedProducts.filter(p => p.status === 'attention').length, 
              color: 'text-amber-500 border-amber-500/10 bg-amber-500/5',
              desc: 'Couverture proche de la limite de commande.'
            },
            { 
              label: 'Niveaux Sécurisés', 
              count: computedProducts.filter(p => p.status === 'safe').length, 
              color: 'text-emerald-500 border-emerald-500/10 bg-emerald-500/5',
              desc: 'Quantité de stock suffisante.'
            }
          ].map((item, idx) => (
            <div key={idx} className={`p-3.5 rounded-2xl border ${item.color} flex items-center justify-between`}>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">{item.label}</span>
                <span className="text-[9px] font-light block mt-0.5 opacity-90">{item.desc}</span>
              </div>
              <span className="text-xl font-black">{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Filters and Actions Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[200px] md:max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher produit, marque, SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full text-xs h-9 rounded-xl pl-9 pr-4 border outline-none transition ${
                adminTheme === 'light'
                  ? 'bg-white border-slate-200 text-slate-800 focus:ring-1 focus:ring-emerald-500 shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-200 focus:ring-1 focus:ring-emerald-500'
              }`}
            />
          </div>

          {/* Brand Filter */}
          <select
            value={selectedVendor}
            onChange={(e) => setSelectedVendor(e.target.value)}
            className={`text-xs h-9 rounded-xl px-3 border outline-none font-medium cursor-pointer transition ${
              adminTheme === 'light'
                ? 'bg-white border-slate-200 text-slate-700 focus:ring-1 focus:ring-emerald-500 shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-200 focus:ring-1 focus:ring-emerald-500'
            }`}
          >
            <option value="all">Tous les fournisseurs ({uniqueVendors.length})</option>
            {uniqueVendors.map(vendor => (
              <option key={vendor} value={vendor}>{vendor.toUpperCase()}</option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={`text-xs h-9 rounded-xl px-3 border outline-none font-medium cursor-pointer transition ${
              adminTheme === 'light'
                ? 'bg-white border-slate-200 text-slate-700 focus:ring-1 focus:ring-emerald-500 shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-200 focus:ring-1 focus:ring-emerald-500'
            }`}
          >
            <option value="all">Toutes les catégories</option>
            {uniqueCategories.map(cat => (
              <option key={cat} value={cat}>{cat.toUpperCase()}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className={`text-xs h-9 rounded-xl px-3 border outline-none font-medium cursor-pointer transition ${
              adminTheme === 'light'
                ? 'bg-white border-slate-200 text-slate-700 focus:ring-1 focus:ring-emerald-500 shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-200 focus:ring-1 focus:ring-emerald-500'
            }`}
          >
            <option value="all">Tous les statuts</option>
            <option value="critical">🔴 Critique (Réapprovisionner d&apos;urgence)</option>
            <option value="attention">🟡 Attention</option>
            <option value="safe">🟢 Sûr</option>
          </select>
        </div>

        {/* PO Action Button */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          {selectedVendor === 'all' && (
            <span className={`text-[10px] font-medium hidden lg:inline-block ${adminTheme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
              Sélectionnez un fournisseur pour générer un PO
            </span>
          )}
          <button
            onClick={handleOpenWizard}
            disabled={selectedCount === 0 || isReadOnly}
            className={`h-9 px-4 text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition duration-200 active:scale-[0.98] w-full md:w-auto ${
              selectedCount > 0 && !isReadOnly
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                : 'bg-slate-200 text-slate-400 border border-slate-300/20 dark:bg-slate-900 dark:border-slate-800/80 dark:text-slate-600 cursor-not-allowed'
            }`}
          >
            <FileText className="w-4 h-4" />
            Générer un PO ({selectedCount})
          </button>
        </div>
      </div>

      {/* ── Forecasting Grid/Table ── */}
      <div className={`border rounded-[24px] overflow-hidden ${
        adminTheme === 'light' 
          ? 'bg-white border-slate-200/80 shadow-sm' 
          : 'bg-slate-950 border-slate-850'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b text-[10px] font-bold uppercase tracking-wider ${
                adminTheme === 'light' ? 'bg-slate-50/50 border-slate-200 text-slate-500' : 'bg-slate-900/20 border-slate-850 text-slate-400'
              }`}>
                <th className="px-5 py-4 w-12 text-center">
                  {selectedVendor !== 'all' && (
                    <input
                      type="checkbox"
                      disabled={isReadOnly}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      checked={filteredProducts.length > 0 && filteredProducts.every(p => selectedProducts[p.id])}
                      className="rounded border-slate-350 dark:border-slate-800 text-emerald-500 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer disabled:opacity-50"
                    />
                  )}
                </th>
                <th className="px-3 py-4">Produit</th>
                <th className="px-3 py-4">Fournisseur</th>
                <th className="px-3 py-4 text-center">Stock</th>
                <th className="px-3 py-4 text-center">Vitesse (Unité/Sem)</th>
                <th className="px-3 py-4 text-center">Couverture Restante</th>
                <th className="px-3 py-4 text-center">Statut Ravitaillement</th>
                <th className="px-5 py-4 text-center">Suggestion (Cible: {targetCoverage}j)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 dark:divide-slate-850/80">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => {
                  const isChecked = !!selectedProducts[product.id];
                  const isCheckboxDisabled = isReadOnly || (selectedVendor === 'all');
                  
                  return (
                    <tr 
                      key={product.id}
                      className={`text-xs transition hover:bg-slate-50/50 dark:hover:bg-slate-900/20 ${
                        isChecked ? (adminTheme === 'light' ? 'bg-emerald-500/5' : 'bg-emerald-500/5') : ''
                      }`}
                    >
                      {/* Selection Box */}
                      <td className="px-5 py-3.5 text-center">
                        <input
                          type="checkbox"
                          disabled={isCheckboxDisabled}
                          checked={isChecked}
                          onChange={(e) => handleSelectProduct(product.id, e.target.checked)}
                          className="rounded border-slate-350 dark:border-slate-800 text-emerald-500 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                          title={selectedVendor === 'all' ? "Filtrez par fournisseur spécifique d'abord" : ""}
                        />
                      </td>

                      {/* Product Detail */}
                      <td className="px-3 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg relative overflow-hidden bg-slate-100 dark:bg-slate-900 shrink-0 border border-slate-200/40 dark:border-slate-800/40">
                            {product.image ? (
                              <Image 
                                src={product.image} 
                                alt={product.title} 
                                fill 
                                sizes="40px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-[10px]">
                                NO
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <span className={`block font-bold truncate leading-tight ${adminTheme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>
                              {product.title}
                            </span>
                            <span className="block text-[9px] font-mono text-slate-400 mt-0.5">
                              {product.sku || `SKU-${product.id}`}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Vendor */}
                      <td className="px-3 py-3.5">
                        <span className={`font-semibold tracking-wide uppercase text-[9px] px-2 py-0.5 rounded border ${
                          adminTheme === 'light' 
                            ? 'bg-slate-100 border-slate-200 text-slate-600' 
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}>
                          {product.vendor}
                        </span>
                      </td>

                      {/* Stock */}
                      <td className="px-3 py-3.5 text-center font-mono font-bold">
                        <span className={product.stock !== undefined && product.stock <= 5 ? 'text-rose-500 font-black' : ''}>
                          {product.stock}
                        </span>
                      </td>

                      {/* Sales Velocity */}
                      <td className="px-3 py-3.5 text-center font-mono font-semibold">
                        {product.velocityPerWeek > 0 ? (
                          <span className={adminTheme === 'light' ? 'text-slate-700' : 'text-slate-300'}>
                            {product.velocityPerWeek.toFixed(1)} u
                          </span>
                        ) : (
                          <span className="text-slate-400 font-normal">—</span>
                        )}
                      </td>

                      {/* Days of Coverage */}
                      <td className="px-3 py-3.5 text-center font-mono font-bold">
                        {product.coverageDays === Infinity ? (
                          <span className="text-emerald-500 font-normal">Sûr (∞)</span>
                        ) : (
                          <span className={
                            product.coverageDays <= leadTime 
                              ? 'text-rose-500 font-black' 
                              : product.coverageDays <= 1.5 * leadTime 
                              ? 'text-amber-500' 
                              : 'text-emerald-500'
                          }>
                            {Math.round(product.coverageDays)} jours
                          </span>
                        )}
                      </td>

                      {/* Status badge */}
                      <td className="px-3 py-3.5 text-center">
                        {product.status === 'critical' && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            CRITIQUE
                          </span>
                        )}
                        {product.status === 'attention' && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            ATTENTION
                          </span>
                        )}
                        {product.status === 'safe' && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            SÛR
                          </span>
                        )}
                      </td>

                      {/* Suggested Quantity */}
                      <td className="px-5 py-3.5 text-center">
                        {product.suggestedQty > 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-500 bg-emerald-500/10 border border-emerald-500/15 px-2.5 py-0.5 rounded-lg font-mono">
                            +{product.suggestedQty}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-500">
                    Aucun produit ne correspond aux filtres de ravitaillement.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Wizard Dialog Modal (PO Form) ── */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-4xl rounded-[32px] border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] ${
            adminTheme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            {/* Modal Header */}
            <div className={`p-6 border-b flex justify-between items-center ${
              adminTheme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
            }`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`font-black text-base tracking-tight ${adminTheme === 'light' ? 'text-slate-850' : 'text-slate-100'}`}>
                    Créateur de Bon de Commande (Purchase Order)
                  </h3>
                  <p className={`text-xs font-light ${adminTheme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                    Générez un PO officiel pour votre distributeur ou transitaire.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsWizardOpen(false)}
                className={`p-1.5 rounded-lg border transition ${
                  adminTheme === 'light' ? 'hover:bg-slate-200 border-slate-200 text-slate-500' : 'hover:bg-slate-800 border-slate-800 text-slate-400'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scroll Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nom du Fournisseur</label>
                  <input
                    type="text"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    className={`w-full text-xs h-9 rounded-xl px-3 border outline-none transition ${
                      adminTheme === 'light' ? 'bg-slate-50 border-slate-200 focus:bg-white' : 'bg-slate-950 border-slate-800 focus:bg-slate-900'
                    }`}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email Contact</label>
                  <input
                    type="email"
                    value={supplierEmail}
                    onChange={(e) => setSupplierEmail(e.target.value)}
                    className={`w-full text-xs h-9 rounded-xl px-3 border outline-none transition ${
                      adminTheme === 'light' ? 'bg-slate-50 border-slate-200 focus:bg-white' : 'bg-slate-950 border-slate-800 focus:bg-slate-900'
                    }`}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Référence du PO</label>
                  <input
                    type="text"
                    value={poReference}
                    onChange={(e) => setPoReference(e.target.value)}
                    className={`w-full text-xs h-9 rounded-xl px-3 border outline-none transition ${
                      adminTheme === 'light' ? 'bg-slate-50 border-slate-200 focus:bg-white' : 'bg-slate-950 border-slate-800 focus:bg-slate-900'
                    }`}
                  />
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Adresse Fournisseur</label>
                  <input
                    type="text"
                    value={supplierAddress}
                    onChange={(e) => setSupplierAddress(e.target.value)}
                    className={`w-full text-xs h-9 rounded-xl px-3 border outline-none transition ${
                      adminTheme === 'light' ? 'bg-slate-50 border-slate-200 focus:bg-white' : 'bg-slate-950 border-slate-800 focus:bg-slate-900'
                    }`}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Date de Commande</label>
                  <input
                    type="date"
                    value={poDate}
                    onChange={(e) => setPoDate(e.target.value)}
                    className={`w-full text-xs h-9 rounded-xl px-3 border outline-none transition ${
                      adminTheme === 'light' ? 'bg-slate-50 border-slate-200 focus:bg-white' : 'bg-slate-950 border-slate-800 focus:bg-slate-900'
                    }`}
                  />
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Articles Sélectionnés</h4>
                <div className="border border-slate-200/60 dark:border-slate-800 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className={`border-b text-[10px] font-bold uppercase tracking-wider ${
                        adminTheme === 'light' ? 'bg-slate-50 text-slate-500 border-slate-200' : 'bg-slate-950/40 text-slate-400 border-slate-800'
                      }`}>
                        <th className="px-4 py-3">Produit</th>
                        <th className="px-3 py-3 text-center">Vitesse (/Sem)</th>
                        <th className="px-3 py-3 text-center w-28">Quantité PO</th>
                        <th className="px-3 py-3 text-center w-32">Coût Unitaire (DH)</th>
                        <th className="px-4 py-3 text-right">Total (DH)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800/80">
                      {poCalculations.itemsList.map(({ product, quantity, unitCost, totalCost }) => (
                        <tr key={product.id} className="hover:bg-slate-50/20 dark:hover:bg-slate-900/10">
                          <td className="px-4 py-3 font-semibold">
                            <div className="truncate max-w-xs">{product.title}</div>
                            <div className="text-[9px] text-slate-400 font-mono mt-0.5">{product.sku || `SKU-${product.id}`}</div>
                          </td>
                          <td className="px-3 py-3 text-center font-mono">{product.velocityPerWeek.toFixed(1)}</td>
                          <td className="px-3 py-3 text-center">
                            <input
                              type="number"
                              min={1}
                              value={quantity}
                              onChange={(e) => {
                                const val = Math.max(1, Number(e.target.value));
                                setPoItems(prev => ({
                                  ...prev,
                                  [product.id]: { ...prev[product.id], quantity: val }
                                }));
                              }}
                              className={`w-20 text-center font-mono text-xs h-8 rounded-lg border outline-none focus:ring-1 focus:ring-emerald-500 ${
                                adminTheme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-850'
                              }`}
                            />
                          </td>
                          <td className="px-3 py-3 text-center">
                            <input
                              type="number"
                              min={0.01}
                              step={0.01}
                              value={unitCost}
                              onChange={(e) => {
                                const val = Math.max(0.01, Number(e.target.value));
                                setPoItems(prev => ({
                                  ...prev,
                                  [product.id]: { ...prev[product.id], unitCost: val }
                                }));
                              }}
                              className={`w-24 text-center font-mono text-xs h-8 rounded-lg border outline-none focus:ring-1 focus:ring-emerald-500 ${
                                adminTheme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-850'
                              }`}
                            />
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-bold">
                            {totalCost.toFixed(2)} DH
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary and Terms */}
              <div className="flex flex-col md:flex-row justify-between gap-6 pt-2">
                <div className="flex-1 space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Conditions de Règlement</label>
                    <select
                      value={paymentTerms}
                      onChange={(e) => setPaymentTerms(e.target.value)}
                      className={`text-xs h-9 rounded-xl px-3 border outline-none font-medium cursor-pointer transition w-full md:w-60 ${
                        adminTheme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <option value="Net 30">Net 30 (30 jours de crédit)</option>
                      <option value="Net 45">Net 45 (45 jours de crédit)</option>
                      <option value="COD">COD (Paiement à la livraison)</option>
                      <option value="50% Upfront, 50% on Delivery">50% Acompte / 50% Solde</option>
                      <option value="L/C (Letter of Credit)">Lettre de Crédit</option>
                    </select>
                  </div>
                </div>

                <div className={`p-5 rounded-2xl border w-full md:w-80 space-y-3 ${
                  adminTheme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                }`}>
                  <div className="flex justify-between text-xs text-slate-400 font-medium">
                    <span>Articles Totaux:</span>
                    <span className="font-mono font-bold text-slate-200 dark:text-slate-100">{poCalculations.totalItemsCount} u</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400 font-medium">
                    <span>Sous-Total:</span>
                    <span className="font-mono font-bold text-slate-200 dark:text-slate-100">{poCalculations.subtotal.toFixed(2)} DH</span>
                  </div>
                  
                  {/* VAT Edit input */}
                  <div className="flex justify-between items-center text-xs text-slate-400 font-medium">
                    <span>Taux TVA (%):</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={vatRate}
                        onChange={(e) => setVatRate(Math.max(0, Number(e.target.value)))}
                        className={`w-12 text-center font-mono text-[11px] h-7 rounded border outline-none ${
                          adminTheme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                        }`}
                      />
                      <span>%</span>
                    </div>
                  </div>

                  <div className="flex justify-between text-xs text-slate-400 font-medium border-b border-slate-200/50 dark:border-slate-800/80 pb-2">
                    <span>Montant TVA:</span>
                    <span className="font-mono font-bold">{poCalculations.vatAmount.toFixed(2)} DH</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-emerald-500">
                    <span>Total Commande:</span>
                    <span className="font-mono">{poCalculations.grandTotal.toFixed(2)} DH</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`p-6 border-t flex justify-end gap-3 ${
              adminTheme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
            }`}>
              <button
                onClick={() => setIsWizardOpen(false)}
                className={`px-4 h-10 text-xs font-bold rounded-xl border transition ${
                  adminTheme === 'light'
                    ? 'hover:bg-slate-100 border-slate-200 text-slate-600'
                    : 'hover:bg-slate-800 border-slate-800 text-slate-300'
                }`}
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  setIsWizardOpen(false);
                  setIsPreviewOpen(true);
                }}
                className="px-4 h-10 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20 transition flex items-center gap-1.5"
              >
                <FileDown className="w-4 h-4" />
                Visualiser le PO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── printable A4 PO Invoice Overlay ── */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 overflow-y-auto p-4 md:p-8 animate-fade-in po-print-root">
          {/* Printable Content Sheet */}
          <div className="flex flex-col gap-6 max-w-4xl w-full">
            {/* Screen Action Bar (hidden in Print) */}
            <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl print:hidden">
              <button
                onClick={() => {
                  setIsPreviewOpen(false);
                  setIsWizardOpen(true); // Return to wizard
                }}
                className="px-3.5 h-9 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Retour au formulaire
              </button>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="px-3.5 h-9 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-400 transition"
                >
                  Fermer
                </button>
                <button
                  onClick={handlePrint}
                  className="px-4.5 h-9 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20 transition flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  Imprimer / PDF
                </button>
              </div>
            </div>

            {/* Document sheet A4 */}
            <div className="bg-white text-slate-950 p-12 md:p-16 rounded-[4px] shadow-2xl border border-slate-250 min-h-[297mm] flex flex-col justify-between print:shadow-none print:border-none print:p-0 print:m-0 font-body leading-relaxed text-[13px]">
              <div>
                {/* 1. Header Grid */}
                <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8">
                  <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 font-sans">
                      PARA OFFICINAL S.A
                    </h1>
                    <p className="text-[11px] font-sans font-semibold tracking-wider text-slate-500 uppercase mt-1">
                      PARAPHARMACIE & K-BEAUTY OFFICIEL
                    </p>
                    <div className="mt-4 space-y-0.5 text-xs text-slate-600 font-sans">
                      <p>Boulevard Zerktouni, Résidence El Bahja, N° 45</p>
                      <p>Casablanca, Maroc</p>
                      <p>Téléphone: +212 522 34 56 78</p>
                      <p>Email: logistics@paraofficinal.ma</p>
                      <p>Patente: 34568912 • RC: Casablanca 98765</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="inline-block bg-slate-900 text-white px-4 py-1.5 text-sm font-bold font-sans uppercase tracking-widest rounded-sm mb-4">
                      BON DE COMMANDE
                    </div>
                    <div className="space-y-1 font-sans text-xs text-slate-700">
                      <p><strong>N° Référence:</strong> {poReference}</p>
                      <p><strong>Date d&apos;émission:</strong> {new Date(poDate).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      <p><strong>Mode de paiement:</strong> {paymentTerms}</p>
                      <p><strong>Devise de facturation:</strong> Dirhams (MAD)</p>
                    </div>
                  </div>
                </div>

                {/* 2. Billing / Shipping Grid */}
                <div className="grid grid-cols-2 gap-8 my-8 font-sans">
                  <div className="border border-slate-200 p-4 rounded bg-slate-50/50">
                    <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Fournisseur / Distributeur</h3>
                    <p className="text-sm font-bold text-slate-900">{supplierName}</p>
                    <div className="text-xs text-slate-600 space-y-1 mt-1">
                      <p>{supplierAddress}</p>
                      <p>Email: {supplierEmail}</p>
                    </div>
                  </div>

                  <div className="border border-slate-200 p-4 rounded bg-slate-50/50">
                    <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Adresse de Livraison</h3>
                    <p className="text-sm font-bold text-slate-900">Entrepôt Logistique Para Officinal</p>
                    <div className="text-xs text-slate-600 space-y-1 mt-1">
                      <p>Zone Industrielle de Bouskoura, Lot 14</p>
                      <p>Casablanca, Maroc</p>
                      <p>À l&apos;attention de: Service Réception Logistique</p>
                    </div>
                  </div>
                </div>

                {/* 3. Items Table */}
                <table className="w-full text-left border-collapse my-8 font-sans">
                  <thead>
                    <tr className="border-b-2 border-slate-900 text-[10px] font-bold uppercase tracking-wider text-slate-800">
                      <th className="py-2.5 w-16">Réf SKU</th>
                      <th className="py-2.5">Description de l&apos;Article</th>
                      <th className="py-2.5 text-center w-24">Quantité</th>
                      <th className="py-2.5 text-right w-32">Prix Unitaire</th>
                      <th className="py-2.5 text-right w-32">Total Ligne</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {poCalculations.itemsList.map(({ product, quantity, unitCost, totalCost }) => (
                      <tr key={product.id} className="text-xs">
                        <td className="py-3 font-mono font-semibold">{product.sku || `SKU-${product.id}`}</td>
                        <td className="py-3 font-medium">
                          <p className="font-bold text-slate-900">{product.title}</p>
                          <p className="text-[10px] text-slate-500 font-normal">Marque: {product.vendor} | Catégorie: {product.category}</p>
                        </td>
                        <td className="py-3 text-center font-mono font-semibold">{quantity}</td>
                        <td className="py-3 text-right font-mono">{unitCost.toFixed(2)} DH</td>
                        <td className="py-3 text-right font-mono font-bold">{totalCost.toFixed(2)} DH</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 4. Footer Calculations / Signatures */}
              <div className="font-sans">
                <div className="flex justify-between items-start gap-8 border-t border-slate-250 pt-8">
                  {/* Notes / Special Instructions */}
                  <div className="flex-1 max-w-md text-xs text-slate-500 space-y-2 leading-relaxed">
                    <p className="font-bold text-slate-700 uppercase text-[9px] tracking-wider">Instructions Spéciales:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Toutes les marchandises livrées doivent correspondre aux spécifications de qualité de la marque.</li>
                      <li>Veuillez confirmer la réception de ce bon de commande par écrit ainsi que la date de livraison estimée.</li>
                      <li>Le transitaire doit être notifié au moins 48 heures avant l&apos;arrivée de la cargaison au port de Casablanca.</li>
                    </ul>
                  </div>

                  {/* Calculations Sheet */}
                  <div className="w-64 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600 font-medium">
                      <span>Sous-Total:</span>
                      <span className="font-mono font-semibold text-slate-900">{poCalculations.subtotal.toFixed(2)} DH</span>
                    </div>
                    <div className="flex justify-between text-slate-600 font-medium">
                      <span>TVA ({vatRate}%):</span>
                      <span className="font-mono font-semibold text-slate-900">{poCalculations.vatAmount.toFixed(2)} DH</span>
                    </div>
                    <div className="flex justify-between text-sm font-black text-slate-950 border-t-2 border-slate-900 pt-2.5">
                      <span>Total Commande:</span>
                      <span className="font-mono">{poCalculations.grandTotal.toFixed(2)} DH</span>
                    </div>
                  </div>
                </div>

                {/* Signatures Panel */}
                <div className="grid grid-cols-2 gap-12 mt-16 pt-8 border-t border-slate-100 text-center">
                  <div className="space-y-12">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Préparé & Demandé par</p>
                    <div className="space-y-1">
                      <div className="w-48 border-b border-slate-300 mx-auto" />
                      <p className="text-xs font-bold text-slate-800">{currentUser?.name || 'Administrateur'}</p>
                      <p className="text-[10px] text-slate-400 capitalize">{currentUser?.role === 'owner' ? 'Propriétaire' : currentUser?.role === 'logistician' ? 'Logisticien' : 'Gestionnaire'}</p>
                    </div>
                  </div>

                  <div className="space-y-12">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Approuvé pour Achat par</p>
                    <div className="space-y-1">
                      <div className="w-48 border-b border-slate-300 mx-auto" />
                      <p className="text-xs font-bold text-slate-800">Direction Générale / S.A</p>
                      <p className="text-[10px] text-slate-400">Para Officinal S.A</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Custom stylesheet injection for print support ── */}
      <style jsx global>{`
        @media print {
          /* Hide all other elements on the screen during print */
          body > *:not(.po-print-root) {
            display: none !important;
          }
          
          /* Force display print root container */
          .po-print-root {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            display: block !important;
            overflow: visible !important;
            z-index: 99999 !important;
          }
          
          .po-print-root > div {
            max-width: 100% !important;
            width: 100% !important;
          }
          
          .po-print-root .print\\:hidden {
            display: none !important;
          }
          
          /* Target A4 page format printing */
          @page {
            size: A4;
            margin: 1.5cm;
          }
          
          /* Styling overrides for printed sheet */
          .po-print-root .bg-white {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            color: black !important;
          }
        }
      `}</style>
    </div>
  );
}
