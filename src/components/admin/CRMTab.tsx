'use client';

import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Sliders, 
  ClipboardList, 
  Search, 
  FileText, 
  Bell, 
  X,
  Plus,
  Edit3,
  Trash2,
  Settings,
  Check,
  Target
} from 'lucide-react';
import { useAdmin, Order, DiagnosticData } from '@/context/AdminContext';
import { useSettings } from '@/context/SettingsContext';
import { useUi } from '@/context/UiContext';
import { useAdminUI } from '@/app/admin/AdminUIContext';
import RFMTab from './RFMTab';

export default function CRMTab() {
  const {
    crmCustomers,
    diagnosticsList,
    leadsList,
    diagnosticsStats,
    adminTheme,
    handleAdjustPoints,
    products
  } = useAdmin();

  const { settings, saveSettings } = useSettings();
  const { showToast } = useUi();

  // Sub-tabs: 'clients' | 'diagnostics' | 'leads' | 'rules'
  const { crmSubTab, setCrmSubTab } = useAdminUI();

  // States for Recommendation Rules
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [ruleForm, setRuleForm] = useState({
    concern: 'any',
    skinType: 'any',
    sunExposure: 'any',
    productIds: [] as number[],
    titleFr: '',
    titleAr: '',
    descriptionFr: '',
    descriptionAr: ''
  });
  const [ruleProductSearch, setRuleProductSearch] = useState('');

  // Search & Filters for Clients
  const [crmSearchQuery, setCrmSearchQuery] = useState('');
  const [crmTierFilter, setCrmTierFilter] = useState('ALL');
  const [crmSkinTypeFilter, setCrmSkinTypeFilter] = useState('ALL');

  // Filters for Diagnostics
  const [diagSkinTypeFilter, setDiagSkinTypeFilter] = useState('ALL');
  const [diagConcernFilter, setDiagConcernFilter] = useState('ALL');
  const [diagExposureFilter, setDiagExposureFilter] = useState('ALL');

  // Search for Leads
  const [leadsSearchQuery, setLeadsSearchQuery] = useState('');

  // Selected customer modal state
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

  const [reminders, setReminders] = useState<any[]>([]);
  const [remindersDays, setRemindersDays] = useState<number>(45);
  const [isRemindersLoading, setIsRemindersLoading] = useState<boolean>(false);

  React.useEffect(() => {
    if (crmSubTab !== 'reminders') return;
    const fetchReminders = async () => {
      setIsRemindersLoading(true);
      try {
        const res = await fetch(`/api/admin/reminders?days=${remindersDays}`);
        const data = await res.json();
        if (data.success && data.reminders) {
          setReminders(data.reminders);
        }
      } catch (err) {
        console.error('Failed to load restock reminders:', err);
      } finally {
        setIsRemindersLoading(false);
      }
    };
    fetchReminders();
  }, [crmSubTab, remindersDays]);

  const pointsPerDh = settings.loyaltyPointsPerDh || 1;

  // Filtered CRM Customers
  const filteredCrmCustomers = useMemo(() => {
    return crmCustomers.filter((c: any) => {
      const matchesSearch = (c.name || '').toLowerCase().includes(crmSearchQuery.toLowerCase()) ||
                            (c.phone || '').includes(crmSearchQuery);
      if (!matchesSearch) return false;

      if (crmTierFilter !== 'ALL') {
        let tier = 'Bronze';
        if (c.totalSpend >= 1500) tier = 'Platinum';
        else if (c.totalSpend >= 700) tier = 'Gold';
        else if (c.totalSpend >= 300) tier = 'Silver';
        if (tier !== crmTierFilter) return false;
      }

      if (crmSkinTypeFilter !== 'ALL') {
        const diag = diagnosticsList.find((d: any) => d.phone && d.phone.trim() === c.phone.trim());
        if (!diag || diag.skinType !== crmSkinTypeFilter) return false;
      }

      return true;
    });
  }, [crmCustomers, crmSearchQuery, crmTierFilter, crmSkinTypeFilter, diagnosticsList]);

  // CSV Helpers
  const escapeCsv = (val: any) => {
    if (val === null || val === undefined) return '';
    let str = String(val).replace(/"/g, '""');
    if (str.includes(',') || str.includes('\n') || str.includes('"')) {
      return `"${str}"`;
    }
    return str;
  };

  const handleExportCustomersToCsv = (customersToExport: any[]) => {
    if (customersToExport.length === 0) {
      showToast("Aucun client à exporter.", 'warning');
      return;
    }
    const headers = ["Nom Client", "Téléphone", "Commandes (Total)", "Dépenses Cumulées", "Palier Fidélité", "Solde de Points"];
    const rows = customersToExport.map(c => {
      let tier = 'Bronze';
      if (c.totalSpend >= 1500) tier = 'Platinum';
      else if (c.totalSpend >= 700) tier = 'Gold';
      else if (c.totalSpend >= 300) tier = 'Silver';
      
      const estimatedPoints = Math.round(c.totalSpend * pointsPerDh);
      
      return [
        c.name,
        c.phone,
        c.orders.length,
        c.totalSpend,
        tier,
        estimatedPoints
      ];
    });

    const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.map(escapeCsv).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `clients_crm_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportDiagnosticsToCsv = (diagnosticsToExport: DiagnosticData[]) => {
    if (diagnosticsToExport.length === 0) {
      showToast("Aucun diagnostic à exporter.", 'warning');
      return;
    }
    const headers = ["Date", "Type de Peau", "Préoccupation Principale", "Exposition Solaire"];
    const rows = diagnosticsToExport.map(d => [
      d.date ? new Date(d.date).toLocaleString('fr-FR') : '—',
      d.skinType,
      d.concern,
      d.sunExposure
    ]);

    const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.map(escapeCsv).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `diagnostics_peau_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportLeadsToCsv = (leadsToExport: any[]) => {
    if (leadsToExport.length === 0) {
      showToast("Aucun prospect à exporter.", 'warning');
      return;
    }
    const headers = ["Email", "Téléphone", "Date d'inscription"];
    const rows = leadsToExport.map(l => [
      l.email || '—',
      l.phone || '—',
      l.date ? new Date(l.date).toLocaleString('fr-FR') : '—'
    ]);

    const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.map(escapeCsv).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `prospects_newsletter_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

  return (
    <div className="space-y-6 admin-tab-enter">
      
      {/* Sub-tab navigation switcher: CRM & Clients */}
      <div className={`flex flex-wrap items-center gap-1 border rounded-xl p-1 w-fit transition-all duration-200 ${
        adminTheme === 'light' 
          ? 'bg-slate-100/85 border-slate-200/60 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]' 
          : 'bg-slate-900/60 border-slate-900'
      }`}>
        <button
          onClick={() => setCrmSubTab('clients')}
          className={`px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
            crmSubTab === 'clients' 
              ? (adminTheme === 'light' 
                  ? 'bg-white text-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] border border-slate-200/50 font-black' 
                  : 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm font-black') 
              : (adminTheme === 'light' 
                  ? 'text-slate-500 hover:text-slate-800 hover:bg-white/40' 
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30')
          }`}
        >
          <Users className="w-3.5 h-3.5" /> Clients
        </button>
        <button
          onClick={() => setCrmSubTab('diagnostics')}
          className={`px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
            crmSubTab === 'diagnostics' 
              ? (adminTheme === 'light' 
                  ? 'bg-white text-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] border border-slate-200/50 font-black' 
                  : 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm font-black') 
              : (adminTheme === 'light' 
                  ? 'text-slate-500 hover:text-slate-800 hover:bg-white/40' 
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30')
          }`}
        >
          <Sliders className="w-3.5 h-3.5" /> Diagnostics Peau
          <span className={`ml-1 text-[9px] font-black px-1.5 py-0.5 rounded-full transition-colors ${
            adminTheme === 'light' 
              ? (crmSubTab === 'diagnostics' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100/85' : 'bg-slate-200/60 text-slate-500 border border-slate-300/30')
              : 'bg-slate-700 text-slate-300'
          }`}>{diagnosticsList.length}</span>
        </button>
        <button
          onClick={() => setCrmSubTab('rules')}
          className={`px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
            crmSubTab === 'rules' 
              ? (adminTheme === 'light' 
                  ? 'bg-white text-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] border border-slate-200/50 font-black' 
                  : 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm font-black') 
              : (adminTheme === 'light' 
                  ? 'text-slate-500 hover:text-slate-800 hover:bg-white/40' 
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30')
          }`}
        >
          <Settings className="w-3.5 h-3.5" /> Règles Diagnostic
          <span className={`ml-1 text-[9px] font-black px-1.5 py-0.5 rounded-full transition-colors ${
            adminTheme === 'light' 
              ? (crmSubTab === 'rules' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100/85' : 'bg-slate-200/60 text-slate-500 border border-slate-300/30')
              : 'bg-slate-700 text-slate-300'
          }`}>{settings.diagnosticRules?.length || 0}</span>
        </button>
        <button
          onClick={() => setCrmSubTab('leads')}
          className={`px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
            crmSubTab === 'leads' 
              ? (adminTheme === 'light' 
                  ? 'bg-white text-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] border border-slate-200/50 font-black' 
                  : 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm font-black') 
              : (adminTheme === 'light' 
                  ? 'text-slate-500 hover:text-slate-800 hover:bg-white/40' 
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30')
          }`}
        >
          <ClipboardList className="w-3.5 h-3.5" /> Newsletter Leads
          <span className={`ml-1 text-[9px] font-black px-1.5 py-0.5 rounded-full transition-colors ${
            adminTheme === 'light' 
              ? (crmSubTab === 'leads' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100/85' : 'bg-slate-200/60 text-slate-500 border border-slate-300/30')
              : 'bg-slate-700 text-slate-300'
          }`}>{leadsList.length}</span>
        </button>
        <button
          onClick={() => setCrmSubTab('rfm')}
          className={`px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
            crmSubTab === 'rfm' 
              ? (adminTheme === 'light' 
                  ? 'bg-white text-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] border border-slate-200/50 font-black' 
                  : 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm font-black') 
              : (adminTheme === 'light' 
                  ? 'text-slate-500 hover:text-slate-800 hover:bg-white/40' 
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30')
          }`}
        >
          <Target className="w-3.5 h-3.5" /> Segmentation RFM
          <span className={`ml-1 text-[9px] font-black px-1.5 py-0.5 rounded-full transition-colors ${
            adminTheme === 'light' 
              ? (crmSubTab === 'rfm' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100/85' : 'bg-slate-200/60 text-slate-500 border border-slate-300/30')
              : 'bg-slate-700 text-slate-300'
          }`}>{crmCustomers.length}</span>
        </button>
        <button
          onClick={() => setCrmSubTab('reminders')}
          className={`px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
            crmSubTab === 'reminders' 
              ? (adminTheme === 'light' 
                  ? 'bg-white text-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] border border-slate-200/50 font-black' 
                  : 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm font-black') 
              : (adminTheme === 'light' 
                  ? 'text-slate-500 hover:text-slate-800 hover:bg-white/40' 
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30')
          }`}
        >
          <Bell className="w-3.5 h-3.5" /> Relances Réassort
        </button>
      </div>

      {crmSubTab === 'rfm' && (
        <RFMTab />
      )}

      {/* ---- SUB-TAB 1: CLIENTS & FIDELITE ---- */}
      {crmSubTab === 'clients' && (
        <div className="space-y-6 admin-tab-enter">
          {/* Search CRM and points summary */}
          <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl border transition-all duration-200 ${
            adminTheme === 'light'
              ? 'bg-white border-slate-200/80 shadow-sm'
              : 'bg-slate-900/30 border-slate-900'
          }`}>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4.5 h-4.5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Rechercher par nom client, téléphone..."
                  value={crmSearchQuery}
                  onChange={(e) => setCrmSearchQuery(e.target.value)}
                  className={`w-full text-xs transition outline-none focus:border-emerald-500/50 rounded-xl pl-10 pr-4 py-2 border ${
                    adminTheme === 'light'
                      ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white'
                      : 'bg-slate-950 border-slate-800 text-slate-100'
                  }`}
                />
              </div>

              <select
                value={crmTierFilter}
                onChange={(e) => setCrmTierFilter(e.target.value)}
                className={`text-xs transition outline-none rounded-xl px-3 py-2 border cursor-pointer ${
                  adminTheme === 'light'
                    ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white'
                    : 'bg-slate-950 border-slate-800 text-slate-200'
                }`}
              >
                <option value="ALL">Tous les paliers</option>
                <option value="Platinum">Palier Platinum</option>
                <option value="Gold">Palier Gold</option>
                <option value="Silver">Palier Silver</option>
                <option value="Bronze">Palier Bronze</option>
              </select>

              <select
                value={crmSkinTypeFilter}
                onChange={(e) => setCrmSkinTypeFilter(e.target.value)}
                className={`text-xs transition outline-none rounded-xl px-3 py-2 border cursor-pointer ${
                  adminTheme === 'light'
                    ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white'
                    : 'bg-slate-950 border-slate-800 text-slate-200'
                }`}
              >
                <option value="ALL">Tous les types de peau</option>
                <option value="Sèche / Dry">Peau Sèche</option>
                <option value="Grasse / Oily">Peau Grasse</option>
                <option value="Mixte / Combination">Peau Mixte</option>
                <option value="Sensible / Sensitive">Peau Sensible</option>
                <option value="Normale / Normal">Peau Normale</option>
              </select>

              <button
                onClick={() => handleExportCustomersToCsv(filteredCrmCustomers)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 shrink-0 cursor-pointer rounded-xl border ${
                  adminTheme === 'light'
                    ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700'
                }`}
              >
                <FileText className={`w-4 h-4 transition-colors ${
                  adminTheme === 'light' ? 'text-emerald-600' : 'text-emerald-400'
                }`} /> Exporter en CSV
              </button>
            </div>

            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-mono border transition ${
              adminTheme === 'light'
                ? 'bg-slate-50 border-slate-200/80 text-slate-600'
                : 'bg-slate-900 border border-slate-800 text-slate-400'
            }`}>
              <Users className={`w-3.5 h-3.5 ${adminTheme === 'light' ? 'text-emerald-600' : 'text-emerald-400'}`} />
              <span>Base CRM: {crmCustomers.length} clients uniques</span>
            </div>
          </div>

          {/* Customers table */}
          <div className={`border rounded-2xl overflow-hidden transition-all duration-200 ${
            adminTheme === 'light'
              ? 'bg-white border-slate-200 shadow-[0_4px_12px_-2px_rgba(15,30,54,0.03)]'
              : 'bg-slate-900/30 border-slate-900 shadow-xl'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className={`text-[10px] uppercase tracking-wider font-extrabold border-b transition-colors ${
                    adminTheme === 'light'
                      ? 'bg-slate-50 border-slate-200 text-slate-500'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400'
                  }`}>
                    <th className="p-4">Client</th>
                    <th className="p-4">Téléphone</th>
                    <th className="p-4">Commandes (Total)</th>
                    <th className="p-4">Dépenses Cumulées</th>
                    <th className="p-4">Palier Fidélité</th>
                    <th className="p-4">Solde de Points</th>
                    <th className="p-4 text-right">Profil</th>
                  </tr>
                </thead>
                <tbody className={`divide-y text-xs ${
                  adminTheme === 'light' ? 'divide-slate-100 text-slate-700' : 'divide-slate-900 text-slate-300'
                }`}>
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

                    const estimatedPoints = Math.round(cust.totalSpend * pointsPerDh);

                    return (
                      <tr 
                        key={idx} 
                        className={`transition-colors admin-row-enter ${
                          adminTheme === 'light' ? 'hover:bg-slate-50/50' : 'hover:bg-slate-900/10'
                        }`}
                      >
                        <td className="p-4">
                          <span className={`font-extrabold block ${adminTheme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>{cust.name}</span>
                        </td>
                        <td className="p-4 font-mono">{cust.phone}</td>
                        <td className="p-4 font-bold">{cust.orders.length} commande(s)</td>
                        <td className="p-4 font-extrabold font-mono">{cust.totalSpend.toFixed(2)} DH</td>
                        <td className="p-4">
                          <span className={`inline-flex px-2 py-0.5 rounded-full border text-[9px] uppercase font-black tracking-wider ${tierColors[tier]}`}>
                            {tier}
                          </span>
                        </td>
                        <td className={`p-4 font-extrabold font-mono ${adminTheme === 'light' ? 'text-emerald-600' : 'text-emerald-400'}`}>{estimatedPoints} pts</td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleOpenCrmCustomer(cust.phone, cust.name, cust.orders, cust.totalSpend)}
                            className={`px-2.5 py-1 text-[10px] font-bold uppercase transition rounded-lg border cursor-pointer ${
                              adminTheme === 'light'
                                ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80 shadow-sm'
                                : 'bg-slate-900 text-slate-300 hover:text-slate-200 border border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            Gérer
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredCrmCustomers.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500 italic">Aucun profil client trouvé.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {crmSubTab === 'diagnostics' && (
        <div className="space-y-6 admin-tab-enter">
          {/* Diagnostics Visual Stats Grid (Asymmetric Bento Dashboard) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Bento Box 1: Skin Type Radial Visualization (Col span 5) */}
            <div className={`lg:col-span-5 p-6 rounded-3xl border transition-all duration-200 flex flex-col justify-between ${
              adminTheme === 'light'
                ? 'bg-white border-slate-200/80 shadow-sm'
                : 'bg-slate-900/30 border-slate-900 shadow-lg'
            }`}>
              <div>
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest block mb-1">Dermatologie</span>
                <h4 className={`text-sm font-black tracking-tight ${adminTheme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>
                  Typologies Épidermiques
                </h4>
                <p className={`text-[10.5px] mt-1 font-light leading-relaxed ${adminTheme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                  Répartition des profils physiologiques diagnostiqués par l'IA.
                </p>
              </div>

              <div className="flex items-center gap-6 my-6">
                {/* SVG Visual Circular Ring */}
                <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                    <circle cx="50" cy="50" r="40" stroke={adminTheme === 'light' ? '#f1f5f9' : '#0f172a'} strokeWidth="8" fill="none" />
                    {/* Top Skin Type Segment */}
                    {(() => {
                      const total = diagnosticsList.length || 1;
                      const sortedTypes = (Object.entries(diagnosticsStats?.skinTypes || {}) as [string, number][]).sort((a,b) => b[1] - a[1]);
                      const topType = sortedTypes[0]?.[0] || 'Mixte';
                      const count = diagnosticsStats?.skinTypes?.[topType] || 0;
                      const pct = Math.round((count / total) * 100);
                      const strokeDash = 2 * Math.PI * 40; // 251.2
                      const strokeOffset = strokeDash - (pct / 100) * strokeDash;
                      return (
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="#10b981"
                          strokeWidth="8"
                          strokeDasharray={strokeDash}
                          strokeDashoffset={strokeOffset}
                          strokeLinecap="round"
                          fill="none"
                        />
                      );
                    })()}
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className={`text-base font-black leading-none ${adminTheme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                      {(() => {
                        const total = diagnosticsList.length || 1;
                        const sortedTypes = (Object.entries(diagnosticsStats?.skinTypes || {}) as [string, number][]).sort((a,b) => b[1] - a[1]);
                        const topType = sortedTypes[0]?.[0] || 'Mixte';
                        const count = diagnosticsStats?.skinTypes?.[topType] || 0;
                        return Math.round((count / total) * 100);
                      })()}%
                    </span>
                    <span className="text-[7.5px] font-bold text-slate-405 uppercase tracking-wider mt-0.5">Dominant</span>
                  </div>
                </div>

                {/* Legend list */}
                <div className="flex-1 space-y-2">
                  {["Mixte", "Grasse", "Sèche"].map((type, i) => {
                    const count = diagnosticsStats?.skinTypes?.[type] || 0;
                    const total = diagnosticsList.length || 1;
                    const pct = Math.round((count / total) * 100);
                    const indicatorColors = ['bg-emerald-500', 'bg-blue-500', 'bg-violet-500'];
                    return (
                      <div key={type} className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${indicatorColors[i % indicatorColors.length]}`} />
                          <span className={`font-semibold ${adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>{type}</span>
                        </div>
                        <span className={`font-mono font-black ${adminTheme === 'light' ? 'text-slate-700' : 'text-slate-200'}`}>{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className={`pt-3 border-t text-[10px] flex items-center justify-between font-semibold ${
                adminTheme === 'light' ? 'border-slate-100 text-slate-500' : 'border-slate-800/80 text-slate-400'
              }`}>
                <span>Majorité :</span>
                <span className="font-black text-emerald-500 uppercase tracking-wider">
                  {(Object.entries(diagnosticsStats?.skinTypes || {}) as [string, number][]).sort((a,b) => b[1] - a[1])[0]?.[0] || 'Mixte'}
                </span>
              </div>
            </div>

            {/* Bento Box 2: Concerns Breakdown Asymmetric List (Col span 4) */}
            <div className={`lg:col-span-4 p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between ${
              adminTheme === 'light'
                ? 'bg-white border-slate-200/80 shadow-sm'
                : 'bg-slate-900/30 border-slate-900 shadow-lg'
            }`}>
              <div>
                <span className="text-[10px] font-bold text-violet-500 uppercase tracking-widest block mb-1">Diagnostics Hub</span>
                <h4 className={`text-sm font-black tracking-tight ${adminTheme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>
                  Cibles de Traitement
                </h4>
              </div>

              <div className="space-y-3 my-4">
                {["Acné & Imperfections", "Hydratation & Sécheresse", "Taches brunes", "Rides & Fermeté"].map((concern, i) => {
                  const count = diagnosticsStats?.concerns?.[concern] || 0;
                  const total = diagnosticsList.length || 1;
                  const pct = Math.round((count / total) * 100);
                  const progressColors = ['bg-violet-500', 'bg-sky-500', 'bg-pink-500', 'bg-teal-500'];
                  return (
                    <div key={concern} className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span className={`truncate max-w-[130px] ${adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'}`} title={concern}>
                          {concern}
                        </span>
                        <span className={adminTheme === 'light' ? 'text-slate-900' : 'text-slate-200'}>{pct}%</span>
                      </div>
                      <div className={`w-full h-1 rounded-full overflow-hidden ${adminTheme === 'light' ? 'bg-slate-100' : 'bg-slate-950'}`}>
                        <div className={`${progressColors[i % progressColors.length]} h-full rounded-full`} style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <span className={`text-[9px] font-mono block ${adminTheme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
                *Préoccupations majeures triées par volume
              </span>
            </div>

            {/* Bento Box 3: Sun Exposure Dial Widget (Col span 3) */}
            <div className={`lg:col-span-3 p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between ${
              adminTheme === 'light'
                ? 'bg-white border-slate-200/80 shadow-sm'
                : 'bg-slate-900/30 border-slate-900 shadow-lg'
            }`}>
              <div>
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block mb-1">Environnement</span>
                <h4 className={`text-sm font-black tracking-tight ${adminTheme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>
                  Exposition Solaire
                </h4>
              </div>

              {/* Sun Exposure Dial Meter (SVG Semi-circle Arc) */}
              <div className="relative w-full aspect-[2/1] my-4 flex items-end justify-center overflow-hidden">
                <svg viewBox="0 0 100 50" className="w-[85%]">
                  <path d="M 10 50 A 40 40 0 0 1 90 50" stroke={adminTheme === 'light' ? '#f1f5f9' : '#0f172a'} strokeWidth="10" strokeLinecap="round" fill="none" />
                  {/* Glowing Exposure indicator */}
                  {(() => {
                    const total = diagnosticsList.length || 1;
                    const highCount = diagnosticsStats?.sunExposures?.["Forte"] || 0;
                    const modCount = diagnosticsStats?.sunExposures?.["Moyenne"] || 0;
                    const lowCount = diagnosticsStats?.sunExposures?.["Faible"] || 0;
                    const avgExposure = (lowCount * 1 + modCount * 2 + highCount * 3) / total;
                    const normalizedVal = (avgExposure - 1) / 2; // 0 to 1
                    const strokeDash = Math.PI * 40; // 125.6
                    const strokeOffset = strokeDash - (normalizedVal * strokeDash);
                    return (
                      <path
                        d="M 10 50 A 40 40 0 0 1 90 50"
                        stroke="url(#sunDialGradient)"
                        strokeWidth="10"
                        strokeDasharray={strokeDash}
                        strokeDashoffset={strokeOffset}
                        strokeLinecap="round"
                        fill="none"
                      />
                    );
                  })()}
                  <defs>
                    <linearGradient id="sunDialGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="50%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#ef4444" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute bottom-0 flex flex-col items-center justify-center">
                  <span className={`text-[10px] font-black uppercase tracking-wider ${adminTheme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>
                    Indice : {(() => {
                      const total = diagnosticsList.length || 1;
                      const highCount = diagnosticsStats?.sunExposures?.["Forte"] || 0;
                      const modCount = diagnosticsStats?.sunExposures?.["Moyenne"] || 0;
                      const lowCount = diagnosticsStats?.sunExposures?.["Faible"] || 0;
                      const ratio = (highCount * 3 + modCount * 2 + lowCount * 1) / total;
                      return ratio.toFixed(1);
                    })()} / 3
                  </span>
                  <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Niveau Moyen</span>
                </div>
              </div>

              <div className={`pt-3 border-t text-[10px] text-center font-mono ${
                adminTheme === 'light' ? 'border-slate-100 text-slate-500' : 'border-slate-800/80 text-slate-400'
              }`}>
                Total diagnostics : <span className="font-extrabold text-emerald-500">{diagnosticsList.length}</span>
              </div>
            </div>
          </div>

          {/* Filter and Table Card */}
          <div className="space-y-4">
            {/* Filters Row */}
            <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl border transition-all duration-200 ${
              adminTheme === 'light' ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-900/30 border-slate-900'
            }`}>
              <div className="flex flex-wrap items-center gap-3 flex-1">
                {/* Skin Type selector */}
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block ml-1">Type de peau</span>
                  <select
                    value={diagSkinTypeFilter}
                    onChange={(e) => setDiagSkinTypeFilter(e.target.value)}
                    className={`text-xs rounded-xl px-3 py-1.5 border outline-none font-bold ${
                      adminTheme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-950 border-slate-800 text-slate-300'
                    }`}
                  >
                    <option value="ALL">Tous les types</option>
                    <option value="Mixte">Mixte</option>
                    <option value="Grasse">Grasse</option>
                    <option value="Sèche">Sèche</option>
                    <option value="Normale">Normale</option>
                    <option value="Sensible">Sensible</option>
                  </select>
                </div>

                {/* Concern selector */}
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block ml-1">Préoccupation</span>
                  <select
                    value={diagConcernFilter}
                    onChange={(e) => setDiagConcernFilter(e.target.value)}
                    className={`text-xs rounded-xl px-3 py-1.5 border outline-none font-bold ${
                      adminTheme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-950 border-slate-800 text-slate-300'
                    }`}
                  >
                    <option value="ALL">Toutes</option>
                    <option value="Acné & Imperfections">Acné & Imperfections</option>
                    <option value="Hydratation & Sécheresse">Hydratation & Sécheresse</option>
                    <option value="Taches brunes">Taches brunes</option>
                    <option value="Rides & Fermeté">Rides & Fermeté</option>
                    <option value="Rougeurs">Rougeurs</option>
                    <option value="Teint terne">Teint terne</option>
                  </select>
                </div>

                {/* Exposure selector */}
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block ml-1">Exposition Solaire</span>
                  <select
                    value={diagExposureFilter}
                    onChange={(e) => setDiagExposureFilter(e.target.value)}
                    className={`text-xs rounded-xl px-3 py-1.5 border outline-none font-bold ${
                      adminTheme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-950 border-slate-800 text-slate-300'
                    }`}
                  >
                    <option value="ALL">Toutes</option>
                    <option value="Faible">Faible</option>
                    <option value="Moyenne">Moyenne</option>
                    <option value="Forte">Forte</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Export button */}
                <button
                  onClick={() => handleExportDiagnosticsToCsv(
                    diagnosticsList.filter(d => 
                      (diagSkinTypeFilter === 'ALL' || d.skinType === diagSkinTypeFilter) &&
                      (diagConcernFilter === 'ALL' || d.concern === diagConcernFilter) &&
                      (diagExposureFilter === 'ALL' || d.sunExposure === diagExposureFilter)
                    )
                  )}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer rounded-xl border ${
                    adminTheme === 'light'
                      ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  <FileText className={`w-4 h-4 ${adminTheme === 'light' ? 'text-emerald-600' : 'text-emerald-400'}`} /> Exporter en CSV
                </button>
              </div>
            </div>

            {/* Diagnostics Table */}
            <div className={`border rounded-2xl overflow-hidden transition-all duration-200 ${
              adminTheme === 'light'
                ? 'bg-white border-slate-200 shadow-[0_4px_12px_-2px_rgba(15,30,54,0.03)]'
                : 'bg-slate-900/30 border-slate-900 shadow-xl'
            }`}>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className={`text-[10px] uppercase tracking-wider font-extrabold border-b transition-colors ${
                      adminTheme === 'light'
                        ? 'bg-slate-50 border-slate-200 text-slate-500'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400'
                    }`}>
                      <th className="p-4">Date & Heure</th>
                      <th className="p-4">Type de Peau</th>
                      <th className="p-4">Préoccupation principale</th>
                      <th className="p-4">Exposition Solaire</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y text-xs ${
                    adminTheme === 'light' ? 'divide-slate-100 text-slate-700' : 'divide-slate-900 text-slate-300'
                  }`}>
                    {diagnosticsList
                      .filter(d => 
                        (diagSkinTypeFilter === 'ALL' || d.skinType === diagSkinTypeFilter) &&
                        (diagConcernFilter === 'ALL' || d.concern === diagConcernFilter) &&
                        (diagExposureFilter === 'ALL' || d.sunExposure === diagExposureFilter)
                      )
                      .map((d, idx) => (
                        <tr key={idx} className={`transition-colors ${
                          adminTheme === 'light' ? 'hover:bg-slate-50/50' : 'hover:bg-slate-900/10'
                        }`}>
                          <td className="p-4 font-mono">
                            {d.date ? new Date(d.date).toLocaleString('fr-FR') : '—'}
                          </td>
                          <td className="p-4 font-bold">{d.skinType}</td>
                          <td className="p-4">
                            <span className={`inline-flex px-2 py-0.5 rounded-full border text-[10px] font-semibold ${
                              adminTheme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-950 border-slate-800 text-slate-300'
                            }`}>
                              {d.concern}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] uppercase font-black border tracking-wider ${
                              d.sunExposure === 'Forte' 
                                ? (adminTheme === 'light' ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-rose-950/20 border-rose-900/40 text-rose-400')
                                : d.sunExposure === 'Moyenne'
                                  ? (adminTheme === 'light' ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-amber-950/20 border-amber-900/40 text-amber-400')
                                  : (adminTheme === 'light' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-emerald-950/20 border-emerald-900/40 text-emerald-400')
                            }`}>
                              {d.sunExposure}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => showToast(`Détails Diagnostic:\n\nType de Peau: ${d.skinType}\nPréoccupation: ${d.concern}\nExposition Solaire: ${d.sunExposure}\nDate: ${d.date ? new Date(d.date).toLocaleString() : 'N/A'}`, 'info', 6000)}
                              className={`px-2 py-1 text-[10px] uppercase font-bold rounded-lg border transition cursor-pointer ${
                                adminTheme === 'light'
                                  ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/80 shadow-sm'
                                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                              }`}
                            >
                              Voir
                            </button>
                          </td>
                        </tr>
                      ))}
                    {diagnosticsList.filter(d => 
                      (diagSkinTypeFilter === 'ALL' || d.skinType === diagSkinTypeFilter) &&
                      (diagConcernFilter === 'ALL' || d.concern === diagConcernFilter) &&
                      (diagExposureFilter === 'ALL' || d.sunExposure === diagExposureFilter)
                    ).length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-500 italic">Aucun diagnostic correspondant aux filtres.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---- SUB-TAB 3: NEWSLETTER LEADS ---- */}
      {crmSubTab === 'leads' && (
        <div className="space-y-6 admin-tab-enter">
          
          {/* Search and export headers */}
          <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl border transition-all duration-200 ${
            adminTheme === 'light' ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-900/30 border-slate-900'
          }`}>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4.5 h-4.5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Rechercher par email ou téléphone..."
                  value={leadsSearchQuery}
                  onChange={(e) => setLeadsSearchQuery(e.target.value)}
                  className={`w-full text-xs transition outline-none focus:border-emerald-500/50 rounded-xl pl-10 pr-4 py-2 border ${
                    adminTheme === 'light'
                      ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white'
                      : 'bg-slate-950 border-slate-800 text-slate-100'
                  }`}
                />
              </div>
              
              <button
                onClick={() => handleExportLeadsToCsv(
                  leadsList.filter(l => 
                    (l.email || '').toLowerCase().includes(leadsSearchQuery.toLowerCase()) ||
                    (l.phone || '').toLowerCase().includes(leadsSearchQuery.toLowerCase())
                  )
                )}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer rounded-xl border ${
                  adminTheme === 'light'
                    ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                <FileText className={`w-4 h-4 ${adminTheme === 'light' ? 'text-emerald-600' : 'text-emerald-400'}`} /> Exporter en CSV
              </button>
            </div>

            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-mono border transition ${
              adminTheme === 'light'
                ? 'bg-slate-50 border-slate-200/80 text-slate-600'
                : 'bg-slate-900 border border-slate-800 text-slate-400'
            }`}>
              <Bell className={`w-3.5 h-3.5 ${adminTheme === 'light' ? 'text-emerald-600' : 'text-emerald-400'}`} />
              <span>Total prospects abonnés: {leadsList.length}</span>
            </div>
          </div>

          {/* Leads table */}
          <div className={`border rounded-2xl overflow-hidden transition-all duration-200 ${
            adminTheme === 'light'
              ? 'bg-white border-slate-200 shadow-[0_4px_12px_-2px_rgba(15,30,54,0.03)]'
              : 'bg-slate-900/30 border-slate-900 shadow-xl'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className={`text-[10px] uppercase tracking-wider font-extrabold border-b transition-colors ${
                    adminTheme === 'light'
                      ? 'bg-slate-50 border-slate-200 text-slate-500'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400'
                  }`}>
                    <th className="p-4">Email</th>
                    <th className="p-4">Téléphone</th>
                    <th className="p-4">Date d'inscription</th>
                    <th className="p-4 text-right">Source</th>
                  </tr>
                </thead>
                <tbody className={`divide-y text-xs ${
                  adminTheme === 'light' ? 'divide-slate-100 text-slate-700' : 'divide-slate-900 text-slate-300'
                }`}>
                  {leadsList
                    .filter(l => 
                      (l.email || '').toLowerCase().includes(leadsSearchQuery.toLowerCase()) ||
                      (l.phone || '').toLowerCase().includes(leadsSearchQuery.toLowerCase())
                    )
                    .map((l, idx) => (
                      <tr key={idx} className={`transition-colors ${
                        adminTheme === 'light' ? 'hover:bg-slate-50/50' : 'hover:bg-slate-900/10'
                      }`}>
                        <td className="p-4">
                          <span className={`font-extrabold ${adminTheme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>
                            {l.email || '—'}
                          </span>
                        </td>
                        <td className="p-4 font-mono">{l.phone || '—'}</td>
                        <td className="p-4 font-mono">
                          {l.date ? new Date(l.date).toLocaleString('fr-FR') : '—'}
                        </td>
                        <td className="p-4 text-right">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[8px] tracking-wider uppercase font-black ${
                            adminTheme === 'light' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-emerald-950/20 text-emerald-400 border border-emerald-900/35'
                          }`}>
                            Newsletter
                          </span>
                        </td>
                      </tr>
                    ))}
                  {leadsList.filter(l => 
                    (l.email || '').toLowerCase().includes(leadsSearchQuery.toLowerCase()) ||
                    (l.phone || '').toLowerCase().includes(leadsSearchQuery.toLowerCase())
                  ).length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-500 italic">Aucun abonné newsletter trouvé.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---- SUB-TAB 4: RECOMMANDATION RULES ---- */}
      {crmSubTab === 'rules' && (
        <div className="space-y-6 admin-tab-enter">
          {/* Header Description */}
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl border transition-all duration-200 ${
            adminTheme === 'light' ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-900/30 border-slate-900 shadow-md'
          }`}>
            <div className="space-y-1">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Sliders className="w-4.5 h-4.5 text-emerald-500 animate-pulse" /> Gestionnaire de Recommandations Cliniques
              </h3>
              <p className={`text-[11px] ${adminTheme === 'light' ? 'text-slate-500' : 'text-slate-400'} font-light max-w-2xl`}>
                Configurez les rituels de soin recommandés aux clients suite au Diagnostic de Peau. Créez des règles basées sur le type de peau, les imperfections ciblées et l'exposition au soleil. L'algorithme sélectionne automatiquement la règle la plus spécifique.
              </p>
            </div>
            
            <button
              onClick={() => {
                setEditingRuleId(null);
                setRuleForm({
                  concern: 'any',
                  skinType: 'any',
                  sunExposure: 'any',
                  productIds: [],
                  titleFr: '',
                  titleAr: '',
                  descriptionFr: '',
                  descriptionAr: ''
                });
                setRuleProductSearch('');
                setIsRuleModalOpen(true);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/10 transition active:scale-[0.97] shrink-0"
            >
              <Plus className="w-4 h-4" /> Ajouter une Règle
            </button>
          </div>

          {/* Rules Grid */}
          <div className="grid grid-cols-1 gap-5">
            {(!settings.diagnosticRules || settings.diagnosticRules.length === 0) ? (
              <div className={`p-8 text-center border rounded-2xl ${
                adminTheme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/30 border-slate-900'
              }`}>
                <p className="text-xs text-slate-500 italic">Aucune règle personnalisée. Le diagnostic utilise les routines par défaut.</p>
              </div>
            ) : (
              settings.diagnosticRules.map((rule: any) => {
                // Map productIds to products list
                const ruleProducts = products ? products.filter((p: any) => rule.productIds?.includes(p.id)) : [];
                
                // Badge color mappings
                const getConcernBadge = (val: string) => {
                  const map: Record<string, string> = {
                    acne: adminTheme === 'light' ? 'text-rose-750 bg-rose-50 border-rose-100' : 'text-rose-400 bg-rose-950/20 border-rose-900/40',
                    spots: adminTheme === 'light' ? 'text-amber-750 bg-amber-50 border-amber-250' : 'text-amber-400 bg-amber-950/20 border-amber-900/30',
                    wrinkles: adminTheme === 'light' ? 'text-purple-750 bg-purple-50 border-purple-100' : 'text-purple-400 bg-purple-950/20 border-purple-900/40',
                    dryness: adminTheme === 'light' ? 'text-blue-755 bg-blue-50/70 border-blue-100' : 'text-blue-400 bg-blue-950/20 border-blue-900/40',
                    any: adminTheme === 'light' ? 'text-slate-600 bg-slate-100 border-slate-200' : 'text-slate-400 bg-slate-800/45 border-slate-700/50'
                  };
                  const label: Record<string, string> = { acne: 'Acné', spots: 'Taches', wrinkles: 'Rides', dryness: 'Sécheresse', any: 'Toutes Préoccupations' };
                  return <span className={`px-2.5 py-0.5 rounded-full border text-[9px] uppercase font-black tracking-wider ${map[val] || map.any}`}>{label[val] || val}</span>;
                };

                const getSkinTypeBadge = (val: string) => {
                  const map: Record<string, string> = {
                    oily: adminTheme === 'light' ? 'text-teal-750 bg-teal-50 border-teal-150' : 'text-teal-400 bg-teal-950/20 border-teal-900/40',
                    dry: adminTheme === 'light' ? 'text-blue-750 bg-blue-50 border-blue-150' : 'text-blue-400 bg-blue-950/20 border-blue-900/40',
                    mixed: adminTheme === 'light' ? 'text-emerald-750 bg-emerald-50 border-emerald-150' : 'text-emerald-400 bg-emerald-950/20 border-emerald-900/40',
                    sensitive: adminTheme === 'light' ? 'text-pink-750 bg-pink-50 border-pink-150' : 'text-pink-400 bg-pink-950/20 border-pink-900/40',
                    any: adminTheme === 'light' ? 'text-slate-600 bg-slate-100 border-slate-200' : 'text-slate-400 bg-slate-800/45 border-slate-700/50'
                  };
                  const label: Record<string, string> = { oily: 'Peau Grasse', dry: 'Peau Sèche', mixed: 'Peau Mixte', sensitive: 'Peau Sensible', any: 'Tous Types Peau' };
                  return <span className={`px-2.5 py-0.5 rounded-full border text-[9px] uppercase font-black tracking-wider ${map[val] || map.any}`}>{label[val] || val}</span>;
                };

                const getSunExposureBadge = (val: string) => {
                  const map: Record<string, string> = {
                    intense: adminTheme === 'light' ? 'text-orange-750 bg-orange-50 border-orange-200' : 'text-orange-400 bg-orange-950/20 border-orange-900/45',
                    moderate: adminTheme === 'light' ? 'text-amber-605 bg-amber-50 border-amber-200/60' : 'text-amber-400 bg-amber-950/20 border-amber-900/30',
                    low: adminTheme === 'light' ? 'text-emerald-750 bg-emerald-50 border-emerald-150' : 'text-emerald-400 bg-emerald-950/20 border-emerald-900/40',
                    any: adminTheme === 'light' ? 'text-slate-600 bg-slate-100 border-slate-200' : 'text-slate-400 bg-slate-800/45 border-slate-700/50'
                  };
                  const label: Record<string, string> = { intense: 'Soleil Intense', moderate: 'Soleil Modéré', low: 'Soleil Faible', any: 'Toutes Expos.' };
                  return <span className={`px-2.5 py-0.5 rounded-full border text-[9px] uppercase font-black tracking-wider ${map[val] || map.any}`}>{label[val] || val}</span>;
                };

                return (
                  <div 
                    key={rule.id}
                    className={`p-5 border rounded-3xl transition-all duration-200 flex flex-col md:flex-row justify-between gap-5 items-stretch md:items-center hover:shadow-md ${
                      adminTheme === 'light' 
                        ? 'bg-white border-slate-200 text-slate-800' 
                        : 'bg-slate-900/40 border-slate-900 text-slate-200 shadow-sm'
                    }`}
                  >
                    <div className="space-y-3 flex-1 min-w-0">
                      {/* Criteria header */}
                      <div className="flex flex-wrap items-center gap-2">
                        {getConcernBadge(rule.concern)}
                        {getSkinTypeBadge(rule.skinType)}
                        {getSunExposureBadge(rule.sunExposure)}
                      </div>

                      {/* Rule Title / Custom Description */}
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-xs md:text-sm text-slate-900 dark:text-slate-100">
                          {rule.titleFr || 'Routine Personnalisée'}
                        </h4>
                        {rule.titleAr && (
                          <span className="block text-[10px] font-medium text-slate-400 font-mono tracking-tight text-right dir-rtl">{rule.titleAr}</span>
                        )}
                        {rule.descriptionFr && (
                          <p className={`text-[10px] ${adminTheme === 'light' ? 'text-slate-500' : 'text-slate-450'} font-light leading-relaxed max-w-xl`}>
                            {rule.descriptionFr}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Mapped Products Preview */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex -space-x-2.5 overflow-hidden">
                        {ruleProducts.map((p: any) => (
                          <div 
                            key={p.id} 
                            className={`w-9 h-9 rounded-full border-2 overflow-hidden shrink-0 shadow-sm relative group bg-white ${
                              adminTheme === 'light' ? 'border-slate-100' : 'border-slate-800'
                            }`}
                            title={p.title || p.name}
                          >
                            <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                          </div>
                        ))}
                        {ruleProducts.length === 0 && (
                          <span className="text-[10px] text-slate-500 italic">Aucun produit associé</span>
                        )}
                      </div>
                      
                      <div className="text-[9.5px] font-mono font-bold text-slate-500 ml-1">
                        {ruleProducts.length} produit(s)
                      </div>
                    </div>

                    {/* Rule Actions */}
                    <div className="flex md:flex-col justify-end items-center gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 dark:border-slate-900/80">
                      <button
                        onClick={() => {
                          setEditingRuleId(rule.id);
                          setRuleForm({
                            concern: rule.concern || 'any',
                            skinType: rule.skinType || 'any',
                            sunExposure: rule.sunExposure || 'any',
                            productIds: rule.productIds || [],
                            titleFr: rule.titleFr || '',
                            titleAr: rule.titleAr || '',
                            descriptionFr: rule.descriptionFr || '',
                            descriptionAr: rule.descriptionAr || ''
                          });
                          setRuleProductSearch('');
                          setIsRuleModalOpen(true);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer transition border ${
                          adminTheme === 'light'
                            ? 'bg-slate-50 border-slate-200 hover:bg-slate-105 hover:border-slate-350 text-slate-700'
                            : 'bg-slate-950 border-slate-850 hover:bg-slate-900 text-slate-300'
                        }`}
                      >
                        <Edit3 className="w-3.5 h-3.5 animate-pulse" /> Modifier
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm('Voulez-vous vraiment supprimer cette règle de diagnostic ?')) {
                            const updatedRules = (settings.diagnosticRules || []).filter((r: any) => r.id !== rule.id);
                            const updatedSettings = {
                              ...settings,
                              diagnosticRules: updatedRules
                            };
                            const success = await saveSettings(updatedSettings);
                            if (success) {
                              showToast('Règle supprimée avec succès !', 'success');
                            } else {
                              showToast('Erreur lors de la suppression.', 'error');
                            }
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer transition border ${
                          adminTheme === 'light'
                            ? 'bg-rose-50 border-rose-100 hover:bg-rose-100/50 text-rose-700'
                            : 'bg-rose-950/20 border-rose-900/40 hover:bg-rose-950/40 text-rose-400'
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Supprimer
                      </button>
                    </div>
                  </div>
                );
              })
            )}
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

      {/* -------------------- MODAL DIALOG: DIAGNOSTIC RULE CREATION / EDIT -------------------- */}
      {isRuleModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-40 select-none animate-in fade-in-50 duration-200">
          <div className={`border rounded-3xl max-w-2xl w-full p-6 space-y-6 relative shadow-2xl max-h-[90vh] overflow-y-auto transition-all duration-200 ${
            adminTheme === 'light'
              ? 'bg-white border-slate-200 text-slate-800'
              : 'bg-slate-900 border-slate-800 text-slate-200'
          }`}>
            
            {/* Header info */}
            <div className="flex justify-between items-start border-b pb-3 border-slate-200/60 dark:border-slate-850">
              <div>
                <h3 className="text-sm font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-emerald-500" />
                  {editingRuleId ? 'Modifier la Règle' : 'Ajouter une Règle de Diagnostic'}
                </h3>
                <span className="text-[10px] text-slate-450 block mt-0.5">Associez un rituel de produits ciblés à des profils de peau.</span>
              </div>
              <button 
                onClick={() => setIsRuleModalOpen(false)}
                className={`p-1.5 rounded-full border transition cursor-pointer hover:scale-105 active:scale-95 ${
                  adminTheme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800' : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200'
                }`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Rule form body */}
            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                if (ruleForm.productIds.length === 0) {
                  showToast('Veuillez sélectionner au moins un produit recommandé.', 'warning');
                  return;
                }
                if (!ruleForm.titleFr.trim()) {
                  showToast('Le titre de la routine en français est requis.', 'warning');
                  return;
                }

                const currentRules = [...(settings.diagnosticRules || [])];
                const newRule = {
                  id: editingRuleId || `rule_${Math.random().toString(36).substring(2, 9)}`,
                  concern: ruleForm.concern,
                  skinType: ruleForm.skinType,
                  sunExposure: ruleForm.sunExposure,
                  productIds: ruleForm.productIds,
                  titleFr: ruleForm.titleFr.trim(),
                  titleAr: ruleForm.titleAr.trim() || undefined,
                  descriptionFr: ruleForm.descriptionFr.trim() || undefined,
                  descriptionAr: ruleForm.descriptionAr.trim() || undefined
                };

                let updatedRules;
                if (editingRuleId) {
                  updatedRules = currentRules.map((r: any) => r.id === editingRuleId ? newRule : r);
                } else {
                  updatedRules = [...currentRules, newRule];
                }

                const updatedSettings = {
                  ...settings,
                  diagnosticRules: updatedRules
                };

                const success = await saveSettings(updatedSettings);
                if (success) {
                  showToast(editingRuleId ? 'Règle modifiée avec succès !' : 'Nouvelle règle créée avec succès !', 'success');
                  setIsRuleModalOpen(false);
                } else {
                  showToast("Erreur lors de l'enregistrement.", 'error');
                }
              }}
              className="space-y-5"
            >
              
              {/* Row 1: Target Conditions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Concern selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Préoccupation</label>
                  <select
                    value={ruleForm.concern}
                    onChange={(e) => setRuleForm(prev => ({ ...prev, concern: e.target.value }))}
                    className={`w-full text-xs rounded-xl px-3 py-2 border outline-none font-semibold cursor-pointer ${
                      adminTheme === 'light' ? 'bg-slate-50 border-slate-200 focus:bg-white text-slate-800' : 'bg-slate-950 border-slate-850 text-slate-205'
                    }`}
                  >
                    <option value="any">Toutes (Générique)</option>
                    <option value="acne">Acné & Imperfections</option>
                    <option value="spots">Taches Brunes / Hyperpigmentation</option>
                    <option value="wrinkles">Rides & Relâchement (Anti-âge)</option>
                    <option value="dryness">Sécheresse / Déshydratation</option>
                  </select>
                </div>

                {/* Skin Type selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Type de Peau</label>
                  <select
                    value={ruleForm.skinType}
                    onChange={(e) => setRuleForm(prev => ({ ...prev, skinType: e.target.value }))}
                    className={`w-full text-xs rounded-xl px-3 py-2 border outline-none font-semibold cursor-pointer ${
                      adminTheme === 'light' ? 'bg-slate-50 border-slate-200 focus:bg-white text-slate-800' : 'bg-slate-950 border-slate-850 text-slate-205'
                    }`}
                  >
                    <option value="any">Tous (Générique)</option>
                    <option value="oily">Peau Grasse</option>
                    <option value="dry">Peau Sèche</option>
                    <option value="mixed">Peau Mixte</option>
                    <option value="sensitive">Peau Sensible</option>
                  </select>
                </div>

                {/* Sun Exposure selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Exposition UV</label>
                  <select
                    value={ruleForm.sunExposure}
                    onChange={(e) => setRuleForm(prev => ({ ...prev, sunExposure: e.target.value }))}
                    className={`w-full text-xs rounded-xl px-3 py-2 border outline-none font-semibold cursor-pointer ${
                      adminTheme === 'light' ? 'bg-slate-50 border-slate-200 focus:bg-white text-slate-800' : 'bg-slate-950 border-slate-850 text-slate-205'
                    }`}
                  >
                    <option value="any">Toutes (Générique)</option>
                    <option value="intense">Intense</option>
                    <option value="moderate">Modérée</option>
                    <option value="low">Faible</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Localized Titles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Titre du Rituel (FR) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Routine Pureté & Équilibre"
                    value={ruleForm.titleFr}
                    onChange={(e) => setRuleForm(prev => ({ ...prev, titleFr: e.target.value }))}
                    className={`w-full text-xs rounded-xl px-3.5 py-2 border outline-none font-medium ${
                      adminTheme === 'light' ? 'bg-slate-50 border-slate-200 focus:bg-white text-slate-800' : 'bg-slate-950 border-slate-850 text-slate-202'
                    }`}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Titre du Rituel (AR - Optionnel)</label>
                  <input
                    type="text"
                    placeholder="Ex: روتين النقاء والتوازن"
                    value={ruleForm.titleAr}
                    onChange={(e) => setRuleForm(prev => ({ ...prev, titleAr: e.target.value }))}
                    className={`w-full text-xs rounded-xl px-3.5 py-2 border outline-none font-medium text-right dir-rtl ${
                      adminTheme === 'light' ? 'bg-slate-50 border-slate-200 focus:bg-white text-slate-800' : 'bg-slate-950 border-slate-850 text-slate-202'
                    }`}
                  />
                </div>
              </div>

              {/* Row 3: Localized Descriptions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Conseil / Description (FR)</label>
                  <textarea
                    rows={2}
                    placeholder="Décrivez les bénéfices clés de ce rituel pour ce type de peau..."
                    value={ruleForm.descriptionFr}
                    onChange={(e) => setRuleForm(prev => ({ ...prev, descriptionFr: e.target.value }))}
                    className={`w-full text-xs rounded-xl px-3.5 py-2 border outline-none font-medium resize-none leading-relaxed ${
                      adminTheme === 'light' ? 'bg-slate-50 border-slate-200 focus:bg-white text-slate-800' : 'bg-slate-950 border-slate-850 text-slate-202'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Conseil / Description (AR)</label>
                  <textarea
                    rows={2}
                    placeholder="اشرحي فوائد هذا الروتين المخصص للبشرة..."
                    value={ruleForm.descriptionAr}
                    onChange={(e) => setRuleForm(prev => ({ ...prev, descriptionAr: e.target.value }))}
                    className={`w-full text-xs rounded-xl px-3.5 py-2 border outline-none font-medium resize-none leading-relaxed text-right dir-rtl ${
                      adminTheme === 'light' ? 'bg-slate-50 border-slate-200 focus:bg-white text-slate-800' : 'bg-slate-950 border-slate-850 text-slate-202'
                    }`}
                  />
                </div>
              </div>

              {/* Searchable Product Multi-Select */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Produits Recommandés *</label>
                  <span className="text-[9.5px] font-mono font-bold text-emerald-500">
                    {ruleForm.productIds.length} produit(s) sélectionné(s)
                  </span>
                </div>

                {/* Selected products tray */}
                <div className={`p-2.5 border rounded-2xl flex flex-wrap gap-2 min-h-12 items-center ${
                  adminTheme === 'light' ? 'bg-slate-50/50 border-slate-200/70' : 'bg-slate-950 border-slate-900'
                }`}>
                  {ruleForm.productIds.length === 0 ? (
                    <span className="text-[10px] text-slate-400 italic pl-1">Aucun produit sélectionné. Cliquez sur les produits ci-dessous pour les ajouter.</span>
                  ) : (
                    ruleForm.productIds.map(pid => {
                      const p = products ? products.find((x: any) => x.id === pid) : null;
                      if (!p) return null;
                      return (
                        <div 
                          key={pid}
                          className={`flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-full text-[10.5px] font-bold border transition ${
                            adminTheme === 'light'
                              ? 'bg-white border-slate-250 text-slate-800 shadow-sm'
                              : 'bg-slate-900 border-slate-800 text-slate-200 shadow-sm'
                          }`}
                        >
                          <img src={p.image} alt={p.title} className="w-5 h-5 rounded-full object-cover shrink-0" />
                          <span className="truncate max-w-[120px]">{p.title || p.name}</span>
                          <button
                            type="button"
                            onClick={() => setRuleForm(prev => ({ ...prev, productIds: prev.productIds.filter(id => id !== pid) }))}
                            className="text-slate-450 hover:text-rose-500 cursor-pointer ml-1 text-xs outline-none"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Search bar inside products list */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Filtrer les produits par nom, marque, catégorie..."
                    value={ruleProductSearch}
                    onChange={(e) => setRuleProductSearch(e.target.value)}
                    className={`w-full text-xs rounded-xl pl-9 pr-4 py-2 border outline-none focus:border-emerald-500/50 transition ${
                      adminTheme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white' : 'bg-slate-950 border-slate-800 text-slate-100'
                    }`}
                  />
                </div>

                {/* List container */}
                <div className={`border rounded-2xl overflow-y-auto max-h-[160px] divide-y ${
                  adminTheme === 'light' ? 'bg-white border-slate-200 divide-slate-100' : 'bg-slate-950 border-slate-900 divide-slate-900'
                }`}>
                  {products && products
                    .filter((p: any) => {
                      const q = ruleProductSearch.toLowerCase().trim();
                      if (!q) return true;
                      return (
                        (p.title || p.name || '').toLowerCase().includes(q) ||
                        (p.vendor || '').toLowerCase().includes(q) ||
                        (p.category || '').toLowerCase().includes(q)
                      );
                    })
                    .map((p: any) => {
                      const isSelected = ruleForm.productIds.includes(p.id);
                      return (
                        <div 
                          key={p.id}
                          onClick={() => {
                            setRuleForm(prev => {
                              const alreadySelected = prev.productIds.includes(p.id);
                              if (alreadySelected) {
                                return { ...prev, productIds: prev.productIds.filter(id => id !== p.id) };
                              } else {
                                return { ...prev, productIds: [...prev.productIds, p.id] };
                              }
                            });
                          }}
                          className={`p-2.5 text-xs flex justify-between items-center cursor-pointer transition select-none ${
                            isSelected 
                              ? (adminTheme === 'light' ? 'bg-emerald-50/30' : 'bg-emerald-950/10')
                              : (adminTheme === 'light' ? 'hover:bg-slate-50' : 'hover:bg-slate-900/40')
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img src={p.image} alt={p.title} className="w-8 h-8 rounded-lg object-cover border border-slate-200/50 shrink-0" />
                            <div className="min-w-0">
                              <span className={`font-bold block truncate ${isSelected ? 'text-emerald-600 dark:text-emerald-450' : ''}`}>{p.title || p.name}</span>
                              <span className="text-[9.5px] text-slate-505 uppercase font-mono tracking-wider">{p.vendor} • {p.category}</span>
                            </div>
                          </div>
                          
                          <div className="shrink-0 pl-3">
                            <div className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center transition ${
                              isSelected 
                                ? 'bg-emerald-500 border-emerald-500 text-white' 
                                : (adminTheme === 'light' ? 'border-slate-350' : 'border-slate-800')
                            }`}>
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Form Form Bottom Actions */}
              <div className={`pt-4 border-t flex justify-end gap-2.5 ${
                adminTheme === 'light' ? 'border-slate-100' : 'border-slate-800'
              }`}>
                <button
                  type="button"
                  onClick={() => setIsRuleModalOpen(false)}
                  className={`px-4 py-2 border font-bold rounded-xl text-xs uppercase tracking-wider transition ${
                    adminTheme === 'light'
                      ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm'
                      : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-300'
                  }`}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-md shadow-emerald-600/10 hover:shadow-lg transition active:scale-[0.97] cursor-pointer"
                >
                  Enregistrer
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ---- SUB-TAB 6: REFILL REMINDERS ---- */}
      {crmSubTab === 'reminders' && (
        <div className="space-y-6 admin-tab-enter">
          {/* Header Description */}
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl border transition-all duration-200 ${
            adminTheme === 'light' ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-900/30 border-slate-900 shadow-md'
          }`}>
            <div>
              <h3 className={`text-xs font-black uppercase tracking-wider ${adminTheme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>
                Relances Automatiques Réassort
              </h3>
              <p className="text-[11px] text-slate-400 font-semibold mt-1">
                Identifiez les clients dont les produits de soin arrivent bientôt à épuisement et envoyez-leur une relance WhatsApp personnalisée.
              </p>
            </div>
            
            {/* Days selector */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Période cible :</span>
              <select
                value={remindersDays}
                onChange={(e) => setRemindersDays(Number(e.target.value))}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer ${
                  adminTheme === 'light' ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-850 text-slate-200'
                }`}
              >
                <option value={30}>30 Jours (Solaire)</option>
                <option value={45}>45 Jours (Sérums/Crèmes)</option>
                <option value={60}>60 Jours (Nettoyants)</option>
              </select>
            </div>
          </div>

          {/* Reminders List Table */}
          <div className={`border rounded-3xl overflow-hidden transition-all duration-200 ${
            adminTheme === 'light' ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-900/30 border-slate-900'
          }`}>
            {isRemindersLoading ? (
              <div className="p-20 text-center text-xs text-slate-500 font-semibold select-none">
                Chargement des opportunités de réassort...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`border-b text-[10px] uppercase font-black tracking-wider ${
                      adminTheme === 'light' ? 'text-slate-400 border-slate-100' : 'text-slate-500 border-slate-800'
                    }`}>
                      <th className="p-4">Client</th>
                      <th className="p-4">Téléphone</th>
                      <th className="p-4">Produit à réapprovisionner</th>
                      <th className="p-4 text-center">Jours Écoulés</th>
                      <th className="p-4 text-center">Durée Estimée</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold">
                    {reminders.map((r, idx) => {
                      const msg = `Bonjour ${r.customerName}, nous espérons que votre produit de soin "${r.productTitle}" vous apporte satisfaction ! S'il commence à se vider, vous pouvez commander son réassort en un clic ici : https://paraofficinal.ma/products/${r.productId}`;
                      const waLink = `https://wa.me/${r.phone.replace(/[+\s]/g, '')}?text=${encodeURIComponent(msg)}`;

                      return (
                        <tr key={idx} className={adminTheme === 'light' ? 'hover:bg-slate-50/50' : 'hover:bg-slate-950/20'}>
                          <td className="p-4 font-bold">{r.customerName}</td>
                          <td className="p-4 font-mono">{r.phone}</td>
                          <td className="p-4 text-slate-600 dark:text-slate-350">{r.productTitle}</td>
                          <td className="p-4 text-center font-mono text-amber-600">{r.daysElapsed} jours</td>
                          <td className="p-4 text-center font-mono text-slate-500">{r.suggestedExhaustionDays} jours</td>
                          <td className="p-4 text-right">
                            <a
                              href={waLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] uppercase tracking-wider rounded-lg shadow-sm hover:shadow-md transition active:scale-95 border-0 outline-none"
                            >
                              Relancer via WhatsApp
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                    {reminders.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-12 text-center text-slate-500 italic">
                          Aucun client ne nécessite de relance réassort sur cette période cible.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
