'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { 
  Users, 
  Package, 
  Layers, 
  FileText, 
  Award, 
  TrendingUp, 
  Edit3, 
  Search, 
  X 
} from 'lucide-react';
import { useAdmin, Order } from '@/context/AdminContext';
import { useSettings } from '@/context/SettingsContext';
import { useUi } from '@/context/UiContext';
import { useAdminUI } from '@/app/admin/AdminUIContext';

export default function LoyaltyTab() {
  const {
    products,
    crmCustomers,
    loyaltyOverrides,
    parsedLoyaltyLogs,
    adminTheme,
    handleAdjustPoints,
    handleSaveProductPoints,
    handleBulkSavePoints
  } = useAdmin();

  const { settings } = useSettings();
  const { showToast } = useUi();

  // Local UI sub-tab
  const { loyaltySubTab, setLoyaltySubTab } = useAdminUI();

  // Search & Filters for Product Points tab
  const [productPointsSearch, setProductPointsSearch] = useState('');
  const [productPointsVendorFilter, setProductPointsVendorFilter] = useState('ALL');
  const [productPointsEdits, setProductPointsEdits] = useState<Record<number, number>>({});
  const [savingProductPointsId, setSavingProductPointsId] = useState<number | null>(null);

  // Search & Filters for Bulk Points tab
  const [bulkPointsVendor, setBulkPointsVendor] = useState('ALL');
  const [bulkPointsCategory, setBulkPointsCategory] = useState('ALL');
  const [bulkPointsSearch, setBulkPointsSearch] = useState('');
  const [bulkPointsValue, setBulkPointsValue] = useState<number | ''>('');
  const [bulkSelectedIds, setBulkSelectedIds] = useState<number[]>([]);
  const [isBulkSaving, setIsBulkSaving] = useState(false);

  // CRM Customer members filter
  const [crmSearchQuery, setCrmSearchQuery] = useState('');

  // Selected CRM customer profile modal local state
  const [selectedCustomer, setSelectedCustomer] = useState<{
    phone: string;
    name: string;
    orders: Order[];
    totalSpend: number;
    points: number;
    pointsOverrideReason: string;
  } | null>(null);
  const [loyaltyPointsAdjustment, setLoyaltyPointsAdjustment] = useState<number>(0);
  const [loyaltyAdjustmentReason, setLoyaltyAdjustmentReason] = useState<string>('');
  const [isAdjustingPoints, setIsAdjustingPoints] = useState<boolean>(false);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(false);

  const pointsPerDh = settings.loyaltyPointsPerDh || 1;

  // Filtered members list
  const filteredCrmCustomers = useMemo(() => {
    return crmCustomers.filter((c: any) => {
      const q = crmSearchQuery.toLowerCase();
      return (c.name || '').toLowerCase().includes(q) || (c.phone || '').includes(crmSearchQuery);
    });
  }, [crmCustomers, crmSearchQuery]);

  // Vendors and Categories lists from products
  const allVendors = useMemo(() => {
    return Array.from(new Set(products.map((p: any) => p.vendor).filter(Boolean))).sort() as string[];
  }, [products]);

  const allCategories = useMemo(() => {
    return Array.from(new Set(products.map((p: any) => p.category).filter(Boolean))).sort() as string[];
  }, [products]);

  // Filtered products for Product Points tab
  const ppFiltered = useMemo(() => {
    return products.filter((p: any) => {
      const matchVendor = productPointsVendorFilter === 'ALL' || p.vendor === productPointsVendorFilter;
      const matchSearch = !productPointsSearch || (p.name || p.title || '').toLowerCase().includes(productPointsSearch.toLowerCase());
      return matchVendor && matchSearch;
    });
  }, [products, productPointsVendorFilter, productPointsSearch]);

  // Filtered products for Bulk Points tab
  const bpFiltered = useMemo(() => {
    return products.filter((p: any) => {
      const matchVendor = bulkPointsVendor === 'ALL' || p.vendor === bulkPointsVendor;
      const matchCat = bulkPointsCategory === 'ALL' || p.category === bulkPointsCategory;
      const matchSearch = !bulkPointsSearch || (p.name || p.title || '').toLowerCase().includes(bulkPointsSearch.toLowerCase());
      return matchVendor && matchCat && matchSearch;
    });
  }, [products, bulkPointsVendor, bulkPointsCategory, bulkPointsSearch]);

  const allBpFilteredSelected = useMemo(() => {
    return bpFiltered.length > 0 && bpFiltered.every((p: any) => bulkSelectedIds.includes(p.id));
  }, [bpFiltered, bulkSelectedIds]);

  // Handlers
  const handleOpenCrmCustomer = async (customerPhone: string, customerName: string, customerOrders: Order[], totalSpend: number) => {
    setIsDataLoading(true);
    try {
      const res = await fetch(`/api/admin/loyalty?phone=${customerPhone}`);
      const data = await res.json();
      
      let points = 0;
      let reason = '';
      if (data.success && data.loyaltyOverride) {
        points = data.loyaltyOverride.points;
        reason = data.loyaltyOverride.reason || '';
      } else {
        points = Math.round(totalSpend * pointsPerDh);
      }

      setSelectedCustomer({
        phone: customerPhone,
        name: customerName,
        orders: customerOrders,
        totalSpend,
        points,
        pointsOverrideReason: reason
      });
      setLoyaltyPointsAdjustment(0);
      setLoyaltyAdjustmentReason('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsDataLoading(false);
    }
  };

  const handleAdjustPointsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    setIsAdjustingPoints(true);
    try {
      const newPoints = await handleAdjustPoints(
        selectedCustomer.phone,
        selectedCustomer.name,
        selectedCustomer.points,
        loyaltyPointsAdjustment,
        loyaltyAdjustmentReason
      );
      if (newPoints !== null) {
        setSelectedCustomer(prev => prev ? { 
          ...prev, 
          points: newPoints, 
          pointsOverrideReason: loyaltyAdjustmentReason 
        } : null);
        setLoyaltyPointsAdjustment(0);
        setLoyaltyAdjustmentReason('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdjustingPoints(false);
    }
  };

  const handleSaveProductPointsWrapper = async (productId: number) => {
    const pts = productPointsEdits[productId];
    if (pts === undefined) return;
    setSavingProductPointsId(productId);
    try {
      const success = await handleSaveProductPoints(productId, pts);
      if (success) {
        setProductPointsEdits(prev => {
          const next = { ...prev };
          delete next[productId];
          return next;
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingProductPointsId(null);
    }
  };

  const handleBulkSavePointsWrapper = async () => {
    if (bulkSelectedIds.length === 0 || !bulkPointsValue) return;
    setIsBulkSaving(true);
    try {
      const success = await handleBulkSavePoints(Number(bulkPointsValue), bulkSelectedIds);
      if (success) {
        setBulkSelectedIds([]);
        setBulkPointsValue('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsBulkSaving(false);
    }
  };

  const handleExportLoyaltyLogsToCsv = () => {
    if (parsedLoyaltyLogs.length === 0) {
      showToast("Aucun log à exporter.", 'warning');
      return;
    }

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headers = [
      'Date & Heure', 'Opérateur', 'Client Nom', 'Client Téléphone', 
      'Modification (pts)', 'Nouveau Solde (pts)', 'Motif'
    ];

    const rows = parsedLoyaltyLogs.map((log: any) => [
      new Date(log.date).toLocaleString('fr-FR'),
      log.operator || '',
      log.clientName || '',
      log.clientPhone || '',
      log.pointsChange || '',
      log.newBalance || '',
      log.reason || ''
    ]);

    const csvContent = "\uFEFF" + [headers, ...rows].map(row => row.map(escapeCsv).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `audit_points_fidelite_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 admin-tab-enter">

      {/* Sub-tab navigation */}
      <div className={`flex flex-wrap items-center gap-1 border rounded-xl p-1 w-fit transition-all duration-200 ${
        adminTheme === 'light'
          ? 'bg-slate-100/85 border-slate-200/60 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]'
          : 'bg-slate-900/60 border-slate-900'
      }`}>
        {([
          { id: 'members', label: 'Membres', icon: Users },
          { id: 'product_points', label: 'Points Produits', icon: Package },
          { id: 'bulk_points', label: 'Modification Groupée', icon: Layers },
          { id: 'logs', label: 'Logs & Historique', icon: FileText }
        ] as const).map(tab => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setLoyaltySubTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                loyaltySubTab === tab.id
                  ? (adminTheme === 'light'
                      ? 'bg-white text-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] border border-slate-200/50 font-black'
                      : 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm font-black')
                  : (adminTheme === 'light'
                      ? 'text-slate-500 hover:text-slate-800 hover:bg-white/40'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30')
              }`}
            >
              <TabIcon className="w-3.5 h-3.5" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* ---- SUB-TAB: MEMBRES ---- */}
      {loyaltySubTab === 'members' && (
        <div className="space-y-6 admin-tab-enter">
          {/* KPI summary strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Membres', value: crmCustomers.length, icon: Users, color: 'emerald' },
              { label: 'Pts distribuées', value: crmCustomers.reduce((acc: number, c: any) => acc + (loyaltyOverrides[c.phone]?.points ?? Math.round(c.totalSpend * pointsPerDh)), 0), icon: Award, color: 'violet' },
              { label: 'Solde moyen', value: crmCustomers.length > 0 ? Math.round(crmCustomers.reduce((acc: number, c: any) => acc + (loyaltyOverrides[c.phone]?.points ?? Math.round(c.totalSpend * pointsPerDh)), 0) / crmCustomers.length) : 0, icon: TrendingUp, color: 'blue' },
              { label: 'Surclassés manuels', value: Object.keys(loyaltyOverrides).length, icon: Edit3, color: 'amber' }
            ].map((kpi, i) => {
              const KpiIcon = kpi.icon;
              const colorMap: Record<string, string> = { emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100', violet: 'bg-violet-50 text-violet-600 border-violet-100', blue: 'bg-blue-50 text-blue-600 border-blue-100', amber: 'bg-amber-50 text-amber-600 border-amber-100' };
              return (
                <div key={i} className={`p-4 rounded-2xl border flex items-center gap-3 ${adminTheme === 'light' ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-900/30 border-slate-900'}`}>
                  <div className={`p-2.5 rounded-xl border text-sm ${adminTheme === 'light' ? colorMap[kpi.color] : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
                    <KpiIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className={`text-[10px] font-semibold uppercase tracking-wider ${adminTheme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>{kpi.label}</div>
                    <div className={`text-lg font-extrabold font-mono ${adminTheme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>{kpi.value.toLocaleString('fr-FR')}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Search bar */}
          <div className={`flex items-center gap-3 p-4 rounded-2xl border ${adminTheme === 'light' ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-900/30 border-slate-900'}`}>
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher client..."
                value={crmSearchQuery}
                onChange={e => setCrmSearchQuery(e.target.value)}
                className={`w-full text-xs outline-none focus:border-emerald-500/50 rounded-xl pl-10 pr-4 py-2 border ${adminTheme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white' : 'bg-slate-950 border-slate-800 text-slate-100'}`}
              />
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-mono border ${adminTheme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
              <Users className={`w-3.5 h-3.5 ${adminTheme === 'light' ? 'text-emerald-600' : 'text-emerald-400'}`} />
              <span>{crmCustomers.length} membres</span>
            </div>
          </div>

          {/* Members table */}
          <div className={`border rounded-2xl overflow-hidden ${adminTheme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/30 border-slate-900'}`}>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className={`text-[10px] uppercase tracking-wider font-extrabold border-b ${adminTheme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-slate-900/60 border-slate-800 text-slate-400'}`}>
                    <th className="p-4">Client</th>
                    <th className="p-4">Téléphone</th>
                    <th className="p-4">Commandes</th>
                    <th className="p-4">Dépenses</th>
                    <th className="p-4">Palier</th>
                    <th className="p-4">Solde Points</th>
                    <th className="p-4">Source</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y text-xs ${adminTheme === 'light' ? 'divide-slate-100 text-slate-700' : 'divide-slate-900 text-slate-300'}`}>
                  {filteredCrmCustomers.map((cust: any, idx: number) => {
                    let tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' = 'Bronze';
                    if (cust.totalSpend >= 1500) tier = 'Platinum';
                    else if (cust.totalSpend >= 700) tier = 'Gold';
                    else if (cust.totalSpend >= 300) tier = 'Silver';
                    const tierColors: Record<string, string> = {
                      Bronze: adminTheme === 'light' ? 'text-amber-800 bg-amber-50 border-amber-100' : 'text-amber-500 bg-amber-950/20 border-amber-900/30',
                      Silver: adminTheme === 'light' ? 'text-slate-600 bg-slate-100 border-slate-200' : 'text-slate-300 bg-slate-900/40 border-slate-800',
                      Gold: adminTheme === 'light' ? 'text-yellow-700 bg-yellow-50 border-yellow-200' : 'text-yellow-400 bg-yellow-950/20 border-yellow-900/30',
                      Platinum: adminTheme === 'light' ? 'text-violet-700 bg-violet-50 border-violet-100' : 'text-violet-400 bg-violet-950/20 border-violet-900/30'
                    };
                    const override = loyaltyOverrides[cust.phone];
                    const pts = override ? override.points : Math.round(cust.totalSpend * pointsPerDh);
                    const isManual = !!override;

                    return (
                      <tr key={idx} className={`transition-colors ${adminTheme === 'light' ? 'hover:bg-slate-50/50' : 'hover:bg-slate-900/10'}`}>
                        <td className="p-4">
                          <span className={`font-extrabold block ${adminTheme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>{cust.name}</span>
                        </td>
                        <td className="p-4 font-mono">{cust.phone}</td>
                        <td className="p-4 font-bold">{cust.orders.length}</td>
                        <td className="p-4 font-extrabold font-mono">{cust.totalSpend.toFixed(0)} DH</td>
                        <td className="p-4">
                          <span className={`inline-flex px-2 py-0.5 rounded-full border text-[9px] uppercase font-black tracking-wider ${tierColors[tier]}`}>{tier}</span>
                        </td>
                        <td className={`p-4 font-extrabold font-mono ${adminTheme === 'light' ? 'text-emerald-600' : 'text-emerald-400'}`}>{pts} pts</td>
                        <td className="p-4">
                          {isManual
                            ? <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold uppercase ${adminTheme === 'light' ? 'bg-violet-50 border-violet-100 text-violet-700' : 'bg-violet-950/30 border-violet-900/40 text-violet-400'}`}>Manuel</span>
                            : <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold uppercase ${adminTheme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>Auto</span>
                          }
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleOpenCrmCustomer(cust.phone, cust.name, cust.orders, cust.totalSpend)}
                            className={`px-2.5 py-1 text-[10px] font-bold uppercase transition rounded-lg border cursor-pointer ${adminTheme === 'light' ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80 shadow-sm' : 'bg-slate-900 text-slate-300 hover:text-slate-200 border border-slate-800 hover:border-slate-700'}`}
                          >
                            Ajuster
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredCrmCustomers.length === 0 && (
                    <tr><td colSpan={8} className="p-8 text-center text-slate-500 italic">Aucun membre trouvé.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---- SUB-TAB: POINTS PRODUITS ---- */}
      {loyaltySubTab === 'product_points' && (
        <div className="space-y-6 admin-tab-enter">
          {/* Filter bar */}
          <div className={`flex flex-wrap items-center gap-3 p-4 rounded-2xl border ${adminTheme === 'light' ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-900/30 border-slate-900'}`}>
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher produit..."
                value={productPointsSearch}
                onChange={e => setProductPointsSearch(e.target.value)}
                className={`w-full text-xs outline-none focus:border-emerald-500/50 rounded-xl pl-10 pr-4 py-2 border ${adminTheme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white' : 'bg-slate-950 border-slate-800 text-slate-100'}`}
              />
            </div>
            <select
              value={productPointsVendorFilter}
              onChange={e => setProductPointsVendorFilter(e.target.value)}
              className={`text-xs border rounded-xl px-3 py-2 outline-none cursor-pointer ${adminTheme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-950 border-slate-800 text-slate-300'}`}
            >
              <option value="ALL">Toutes les marques</option>
              {allVendors.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
            <div className={`text-[10px] font-mono px-3 py-1.5 rounded-xl border ${adminTheme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
              {ppFiltered.length} produit(s)
            </div>
          </div>

          {/* Products grid with inline points editing */}
          <div className={`border rounded-2xl overflow-hidden ${adminTheme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/30 border-slate-900'}`}>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className={`text-[10px] uppercase tracking-wider font-extrabold border-b ${adminTheme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-slate-900/60 border-slate-800 text-slate-400'}`}>
                    <th className="p-4">Produit</th>
                    <th className="p-4">Marque</th>
                    <th className="p-4">Catégorie</th>
                    <th className="p-4">Prix</th>
                    <th className="p-4">Points Fidélité</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className={`divide-y text-xs ${adminTheme === 'light' ? 'divide-slate-100 text-slate-700' : 'divide-slate-900 text-slate-300'}`}>
                  {ppFiltered.map((product: any) => {
                    const currentPoints = productPointsEdits[product.id] !== undefined ? productPointsEdits[product.id] : (product.points ?? '');
                    const hasEdit = productPointsEdits[product.id] !== undefined;
                    const isSaving = savingProductPointsId === product.id;
                    return (
                      <tr key={product.id} className={`transition-colors ${adminTheme === 'light' ? 'hover:bg-slate-50/40' : 'hover:bg-slate-900/10'}`}>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                          <div className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0">
                            <Image src={product.image || '/placeholder.png'} alt="" fill className="object-cover border border-slate-200/60" sizes="36px" />
                          </div>
                            <span className={`font-semibold line-clamp-2 max-w-[220px] ${adminTheme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>{product.name || product.title}</span>
                          </div>
                        </td>
                        <td className="p-4">{product.vendor}</td>
                        <td className="p-4 capitalize">{product.category}</td>
                        <td className={`p-4 font-mono font-bold ${adminTheme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>{product.price} DH</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              placeholder="0 pts"
                              value={currentPoints}
                              onChange={e => setProductPointsEdits(prev => ({ ...prev, [product.id]: Number(e.target.value) }))}
                              className={`w-24 font-mono text-center font-bold border rounded-lg px-2 py-1.5 text-xs outline-none transition ${
                                hasEdit
                                  ? (adminTheme === 'light' ? 'border-emerald-400 bg-emerald-50 text-emerald-800 focus:ring-1 focus:ring-emerald-400/30' : 'border-emerald-600 bg-emerald-950/20 text-emerald-300')
                                  : (adminTheme === 'light' ? 'border-slate-200 bg-slate-50 text-slate-700 focus:border-emerald-400' : 'border-slate-700 bg-slate-900 text-slate-300 focus:border-emerald-500')
                              }`}
                            />
                            <span className={`text-[10px] ${adminTheme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>pts</span>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleSaveProductPointsWrapper(product.id)}
                            disabled={!hasEdit || isSaving}
                            className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition rounded-lg border cursor-pointer ${
                              hasEdit && !isSaving
                                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-emerald-600 shadow-sm shadow-emerald-500/20'
                                : (adminTheme === 'light' ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-slate-800 text-slate-600 border-slate-700 cursor-not-allowed')
                            }`}
                          >
                            {isSaving ? '...' : 'Sauvegarder'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {ppFiltered.length === 0 && (
                    <tr><td colSpan={6} className="p-8 text-center text-slate-500 italic">Aucun produit trouvé.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---- SUB-TAB: MODIFICATION GROUPÉE ---- */}
      {loyaltySubTab === 'bulk_points' && (
        <div className="space-y-6 admin-tab-enter">
          {/* Filter / Apply controls */}
          <div className={`p-5 rounded-2xl border space-y-4 ${adminTheme === 'light' ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-900/30 border-slate-900'}`}>
            <div>
              <h4 className={`text-xs font-black uppercase tracking-wider mb-1 ${adminTheme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>Filtres produits</h4>
              <p className={`text-[10px] mb-3 ${adminTheme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>Filtrez les produits puis sélectionnez ceux auxquels appliquer les points en masse.</p>
              <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[180px]">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Rechercher produit..."
                    value={bulkPointsSearch}
                    onChange={e => setBulkPointsSearch(e.target.value)}
                    className={`w-full text-xs outline-none rounded-xl pl-10 pr-4 py-2 border ${adminTheme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-800 focus:border-emerald-400' : 'bg-slate-950 border-slate-800 text-slate-100'}`}
                  />
                </div>
                <select
                  value={bulkPointsVendor}
                  onChange={e => setBulkPointsVendor(e.target.value)}
                  className={`text-xs border rounded-xl px-3 py-2 outline-none cursor-pointer ${adminTheme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-950 border-slate-800 text-slate-300'}`}
                >
                  <option value="ALL">Toutes marques</option>
                  {allVendors.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
                <select
                  value={bulkPointsCategory}
                  onChange={e => setBulkPointsCategory(e.target.value)}
                  className={`text-xs border rounded-xl px-3 py-2 outline-none cursor-pointer ${adminTheme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-950 border-slate-800 text-slate-300'}`}
                >
                  <option value="ALL">Toutes catégories</option>
                  {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className={`border-t pt-4 flex flex-wrap items-end gap-4 ${adminTheme === 'light' ? 'border-slate-100' : 'border-slate-800'}`}>
              <div className="space-y-1">
                <label className={`text-[9px] font-bold uppercase tracking-wider ${adminTheme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Valeur de points à appliquer</label>
                <input
                  type="number"
                  min="0"
                  placeholder="Ex: 150"
                  value={bulkPointsValue}
                  onChange={e => setBulkPointsValue(e.target.value === '' ? '' : Number(e.target.value))}
                  className={`font-mono font-bold text-center text-sm border rounded-xl px-4 py-2 outline-none transition w-36 ${adminTheme === 'light' ? 'border-slate-200 bg-slate-50 text-slate-800 focus:border-emerald-400' : 'border-slate-700 bg-slate-900 text-slate-200 focus:border-emerald-500'}`}
                />
              </div>
              <div className="space-y-1">
                <label className={`text-[9px] font-bold uppercase tracking-wider ${adminTheme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Produits sélectionnés</label>
                <div className={`font-mono font-extrabold text-lg ${bulkSelectedIds.length > 0 ? (adminTheme === 'light' ? 'text-emerald-700' : 'text-emerald-400') : (adminTheme === 'light' ? 'text-slate-400' : 'text-slate-600')}`}>
                  {bulkSelectedIds.length} produit(s)
                </div>
              </div>
              <button
                onClick={handleBulkSavePointsWrapper}
                disabled={bulkSelectedIds.length === 0 || !bulkPointsValue || isBulkSaving}
                className={`px-5 py-2.5 text-xs font-black uppercase tracking-wider transition rounded-xl border cursor-pointer ${
                  bulkSelectedIds.length > 0 && bulkPointsValue && !isBulkSaving
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-emerald-600 shadow-md shadow-emerald-500/20'
                    : (adminTheme === 'light' ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-slate-800 text-slate-600 border-slate-700 cursor-not-allowed')
                }`}
              >
                {isBulkSaving ? 'Application...' : `Appliquer ${bulkPointsValue ? `${bulkPointsValue} pts` : ''} en masse`}
              </button>
              {bulkSelectedIds.length > 0 && (
                <button
                  onClick={() => setBulkSelectedIds([])}
                  className={`px-3 py-2.5 text-xs font-bold uppercase tracking-wider transition rounded-xl border cursor-pointer ${adminTheme === 'light' ? 'border-slate-200 text-slate-500 hover:bg-slate-50' : 'border-slate-700 text-slate-500 hover:bg-slate-800'}`}
                >
                  Désélectionner tout
                </button>
              )}
            </div>
          </div>

          {/* Bulk product selection grid */}
          <div className={`border rounded-2xl overflow-hidden ${adminTheme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/30 border-slate-900'}`}>
            <div className={`flex items-center justify-between px-4 py-3 border-b ${adminTheme === 'light' ? 'border-slate-100 bg-slate-50' : 'border-slate-800 bg-slate-900/50'}`}>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="select-all-bulk"
                  checked={allBpFilteredSelected}
                  onChange={() => {
                    if (allBpFilteredSelected) {
                      setBulkSelectedIds(prev => prev.filter(id => !bpFiltered.map((p: any) => p.id).includes(id)));
                    } else {
                      const ids = bpFiltered.map((p: any) => p.id);
                      setBulkSelectedIds(prev => Array.from(new Set([...prev, ...ids])));
                    }
                  }}
                  className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
                />
                <label htmlFor="select-all-bulk" className={`text-[11px] font-bold uppercase tracking-wider cursor-pointer ${adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                  Sélectionner tout ({bpFiltered.length})
                </label>
              </div>
              <span className={`text-[10px] font-mono ${adminTheme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>{bpFiltered.length} résultat(s)</span>
            </div>
            <div className="divide-y divide-slate-100 max-h-[480px] overflow-y-auto">
              {bpFiltered.map((product: any) => {
                const isSelected = bulkSelectedIds.includes(product.id);
                return (
                  <label
                    key={product.id}
                    className={`flex items-center gap-4 px-4 py-3 cursor-pointer transition-colors ${
                      isSelected
                        ? (adminTheme === 'light' ? 'bg-emerald-50/60' : 'bg-emerald-950/10')
                        : (adminTheme === 'light' ? 'hover:bg-slate-50' : 'hover:bg-slate-900/20')
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {
                        setBulkSelectedIds(prev =>
                          isSelected ? prev.filter(id => id !== product.id) : [...prev, product.id]
                        );
                      }}
                      className="w-4 h-4 rounded accent-emerald-500 cursor-pointer shrink-0"
                    />
                    <div className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0">
                      <Image src={product.image || '/placeholder.png'} alt="" fill className="object-cover border border-slate-200/60" sizes="36px" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-semibold text-xs truncate ${adminTheme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>{product.name || product.title}</div>
                      <div className={`text-[10px] font-mono ${adminTheme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>{product.vendor} · {product.category}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`font-mono font-bold text-xs ${adminTheme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>{product.price} DH</div>
                      <div className={`text-[10px] font-mono ${product.points ? (adminTheme === 'light' ? 'text-emerald-600 font-bold' : 'text-emerald-400 font-bold') : (adminTheme === 'light' ? 'text-slate-400' : 'text-slate-600')}`}>
                        {product.points ? `${product.points} pts` : '— pts'}
                      </div>
                    </div>
                  </label>
                );
              })}
              {bpFiltered.length === 0 && (
                <div className="p-8 text-center text-slate-500 italic text-xs">Aucun produit correspondant aux filtres.</div>
              )}
            </div>
          </div>
        </div>
      )}

       {/* ---- SUB-TAB: LOGS & HISTORIQUE ---- */}
      {loyaltySubTab === 'logs' && (
        <div className="space-y-6 admin-tab-enter">
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${adminTheme === 'light' ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-900/30 border-slate-900'}`}>
            <div className="space-y-0.5">
              <h4 className={`text-xs font-black uppercase tracking-wider ${adminTheme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>Historique des Ajustements Fidélité</h4>
              <p className={`text-[10px] ${adminTheme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                Traçabilité complète de toutes les modifications manuelles de points fidélité.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleExportLoyaltyLogsToCsv}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 transition cursor-pointer ${
                  adminTheme === 'light'
                    ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-800 shadow-sm'
                    : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-emerald-500" />
                Exporter en CSV
              </button>
              <div className={`px-3 py-1 rounded-xl text-[10px] font-mono border ${adminTheme === 'light' ? 'bg-slate-50 border-slate-200/80 text-slate-600' : 'bg-slate-900 border border-slate-800 text-slate-400'}`}>
                Total : <span className="font-extrabold text-emerald-500">{parsedLoyaltyLogs.length}</span>
              </div>
            </div>
          </div>

          <div className={`border rounded-2xl overflow-hidden ${adminTheme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/30 border-slate-900'}`}>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className={`text-[10px] uppercase tracking-wider font-extrabold border-b ${adminTheme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-slate-900/60 border-slate-800 text-slate-400'}`}>
                    <th className="p-4">Date & Heure</th>
                    <th className="p-4">Opérateur</th>
                    <th className="p-4">Client</th>
                    <th className="p-4">Modification</th>
                    <th className="p-4">Nouveau Solde</th>
                    <th className="p-4">Motif</th>
                  </tr>
                </thead>
                <tbody className={`divide-y text-xs ${adminTheme === 'light' ? 'divide-slate-100 text-slate-700' : 'divide-slate-900 text-slate-300'}`}>
                  {parsedLoyaltyLogs.map((log: any) => {
                    const isAdd = !log.pointsChange.startsWith('-');
                    const changeColor = isAdd
                      ? (adminTheme === 'light' ? 'text-emerald-700 font-extrabold bg-emerald-50 border border-emerald-100' : 'text-emerald-400 font-black')
                      : (adminTheme === 'light' ? 'text-rose-700 font-extrabold bg-rose-50 border border-rose-100' : 'text-rose-400 font-black');
                    return (
                      <tr key={log.id} className={`transition-colors ${adminTheme === 'light' ? 'hover:bg-slate-50/50' : 'hover:bg-slate-900/10'}`}>
                        <td className="p-4 font-mono">{new Date(log.date).toLocaleString('fr-FR')}</td>
                        <td className="p-4">
                          <span className={`font-mono text-[10px] px-2 py-0.5 rounded border ${adminTheme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>{log.operator}</span>
                        </td>
                        <td className="p-4">
                          <span className={`font-extrabold block ${adminTheme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>{log.clientName}</span>
                          <span className={`text-[10px] font-mono ${adminTheme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>{log.clientPhone}</span>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[10px] ${changeColor}`}>{isAdd && '+'}{log.pointsChange} pts</span>
                        </td>
                        <td className="p-4 font-extrabold font-mono">{log.newBalance}</td>
                        <td className={`p-4 font-light max-w-xs truncate ${adminTheme === 'light' ? 'text-slate-600' : 'text-slate-300'}`} title={log.reason}>{log.reason}</td>
                      </tr>
                    );
                  })}
                  {parsedLoyaltyLogs.length === 0 && (
                    <tr><td colSpan={6} className="p-8 text-center text-slate-500 italic">Aucun log d&apos;ajustement fidélité enregistré.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- DRAWER MODAL: CRM CUSTOMER PROFILE -------------------- */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-40 select-none animate-in fade-in-50 duration-200">
          <div className={`border rounded-3xl max-w-xl w-full p-6 space-y-6 relative shadow-2xl max-h-[90vh] overflow-y-auto transition-all duration-200 ${
            adminTheme === 'light'
              ? 'bg-white border-slate-200 text-slate-800'
              : 'bg-slate-900 border-slate-800 text-slate-200'
          }`}>
            
            {/* Header customer card */}
            <div className={`flex justify-between items-start border-b pb-3 ${
              adminTheme === 'light' ? 'border-slate-100' : 'border-slate-800'
            }`}>
              <div>
                <span className="text-[9px] font-mono text-emerald-400 uppercase font-black block tracking-wider bg-emerald-950/40 border border-emerald-900/30 rounded px-1.5 py-0.5 w-fit mb-1.5">Fiche Client CRM</span>
                <h3 className={`text-base font-extrabold flex items-center gap-1.5 font-sans ${
                  adminTheme === 'light' ? 'text-slate-800' : 'text-slate-100'
                }`}>
                  {selectedCustomer.name} 
                </h3>
                <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{selectedCustomer.phone}</span>
              </div>
              <button 
                onClick={() => setSelectedCustomer(null)} 
                className={`transition-colors ${
                  adminTheme === 'light' ? 'text-slate-400 hover:text-slate-600' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Loyalty points overrides panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Column: Loyalty metrics & overrides adjustment */}
              <div className="space-y-4">
                <div className={`p-4 rounded-2xl border space-y-2 ${
                  adminTheme === 'light' ? 'bg-slate-50 border-slate-200/80' : 'bg-slate-950 border-slate-900'
                }`}>
                  <h4 className={`text-[10px] font-bold uppercase tracking-widest block border-b pb-1.5 ${
                    adminTheme === 'light' ? 'text-slate-700 border-slate-200/60' : 'text-slate-400 border-slate-900/60'
                  }`}>Beauty Wallet Balance</h4>
                  <div className="flex justify-between items-baseline font-mono text-xs">
                    <span className={adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'}>Points cumulés:</span>
                    <strong className={`text-lg font-extrabold ${
                      adminTheme === 'light' ? 'text-emerald-700' : 'text-emerald-400'
                    }`}>{selectedCustomer.points} pts</strong>
                  </div>
                  {selectedCustomer.pointsOverrideReason && (
                    <div className={`pt-1 text-[10px] italic ${
                      adminTheme === 'light' ? 'text-indigo-600' : 'text-indigo-400'
                    }`}>
                      Dernier motif d&apos;ajustement : &ldquo;{selectedCustomer.pointsOverrideReason}&rdquo;
                    </div>
                  )}
                </div>

                {/* Adjust Points Balance Form */}
                <form 
                  onSubmit={handleAdjustPointsSubmit} 
                  className={`p-4 rounded-2xl border space-y-3 ${
                    adminTheme === 'light' ? 'bg-slate-50 border-slate-200/80' : 'bg-slate-950 border-slate-900'
                  }`}
                >
                  <h4 className={`text-[10px] font-bold uppercase tracking-widest block border-b pb-1 ${
                    adminTheme === 'light' ? 'text-slate-700 border-slate-200/60' : 'text-slate-400 border-slate-900/60'
                  }`}>Ajuster le solde de points</h4>
                  
                  <div className="space-y-1.5 text-xs">
                    <label className={`text-[9px] font-bold uppercase tracking-wider ${
                      adminTheme === 'light' ? 'text-slate-600' : 'text-slate-500'
                    }`}>Ajouter / Soustraire des points (ex: +100 ou -50)</label>
                    <input 
                      type="number" 
                      placeholder="Ex: +150"
                      value={loyaltyPointsAdjustment || ''} 
                      onChange={(e) => setLoyaltyPointsAdjustment(Number(e.target.value))}
                      className={`w-full font-mono text-center font-bold border rounded-xl px-3 py-2 transition outline-none ${
                        adminTheme === 'light'
                          ? 'bg-white border-slate-200 text-slate-800 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 shadow-sm'
                          : 'bg-slate-900 border-slate-800 focus:border-emerald-500/50 text-slate-200'
                      }`} 
                      required 
                    />
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <label className={`text-[9px] font-bold uppercase tracking-wider ${
                      adminTheme === 'light' ? 'text-slate-600' : 'text-slate-500'
                    }`}>Raison de la modification</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Correction de points manquants"
                      value={loyaltyAdjustmentReason} 
                      onChange={(e) => setLoyaltyAdjustmentReason(e.target.value)}
                      className={`w-full border rounded-xl px-3 py-2 transition outline-none ${
                        adminTheme === 'light'
                          ? 'bg-white border-slate-200 text-slate-800 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 shadow-sm'
                          : 'bg-slate-900 border-slate-800 focus:border-emerald-500/50 text-slate-200'
                      }`} 
                      required 
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={isAdjustingPoints}
                    className="w-full py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-md shadow-emerald-500/10 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-200 cursor-pointer"
                  >
                    {isAdjustingPoints ? 'Ajustement...' : 'Valider l\'Ajustement'}
                  </button>
                </form>
              </div>

              {/* Right Column: Customer Orders history */}
              <div className="space-y-3">
                <h4 className={`text-[10px] font-bold uppercase tracking-widest block border-b pb-1 ${
                  adminTheme === 'light' ? 'text-slate-700 border-slate-200/60' : 'text-slate-400 border-slate-900/60'
                }`}>Historique des Commandes</h4>
                
                <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                  {(selectedCustomer.orders || []).map((ord, idx) => (
                    <div 
                      key={idx} 
                      className={`p-3 border rounded-xl text-xs flex justify-between items-center gap-4 hover:scale-[1.005] transition duration-200 ${
                        adminTheme === 'light'
                          ? 'bg-slate-50/50 border-slate-200/60 text-slate-800 hover:bg-slate-100/50 hover:border-slate-300'
                          : 'bg-slate-950 border-slate-900 text-slate-200 hover:border-slate-800'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <span className={`font-mono font-bold block ${adminTheme === 'light' ? 'text-slate-800' : 'text-slate-300'}`}>{ord.order_id}</span>
                        <span className="text-[9px] text-slate-500 font-mono block">{new Date(ord.created_at || ord.date || Date.now()).toLocaleDateString()}</span>
                      </div>
                      <div className="text-right">
                        <span className={`font-bold block font-mono ${adminTheme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>{ord.total?.toFixed(0) || 0} DH</span>
                        <span className={`text-[9px] uppercase font-black tracking-wider ${adminTheme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>{ord.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Bottom Actions */}
            <div className={`pt-4 border-t flex justify-end ${
              adminTheme === 'light' ? 'border-slate-100' : 'border-slate-800'
            }`}>
              <button 
                onClick={() => setSelectedCustomer(null)} 
                className={`px-4 py-2 border font-bold rounded-xl text-xs uppercase transition-all ${
                  adminTheme === 'light'
                    ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                }`}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
