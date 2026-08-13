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
  Target,
  Activity,
  ArrowLeft,
  Package,
  Truck,
  ShoppingBag,
  Ticket,
  Gift,
  BarChart3
} from 'lucide-react';
import { useAdmin, Order, DiagnosticData } from '@/context/AdminContext';
import { useSettings } from '@/context/SettingsContext';
import { useUi } from '@/context/UiContext';
import { useAdminUI } from '@/app/admin/AdminUIContext';
import { StatusBadge, EmptyState } from '@/components/admin/ui';
import { ConfirmDialog } from '@/components/admin/ui/ConfirmDialog';
import { PRODUCTS_DB } from '@/lib/data';
import RFMTab from './RFMTab';
import AutomationsTab from './AutomationsTab';

export default function CRMTab() {
  const {
    crmCustomers,
    diagnosticsList,
    leadsList,
    diagnosticsStats,
    adminTheme,
    handleAdjustPoints,
    handleUpdateOrderStatus,
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
  const [ruleToDelete, setRuleToDelete] = useState<string | null>(null);
  const [isDeletingRule, setIsDeletingRule] = useState(false);

  const confirmDeleteRule = async () => {
    if (!ruleToDelete) return;
    setIsDeletingRule(true);
    try {
      const updatedRules = (settings.diagnosticRules || []).filter((rule: any) => rule.id !== ruleToDelete);
      const success = await saveSettings({ ...settings, diagnosticRules: updatedRules });
      if (!success) throw new Error('La suppression n’a pas pu être enregistrée.');
      showToast('Règle supprimée avec succès.', 'success');
      setRuleToDelete(null);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Erreur lors de la suppression.', 'error');
    } finally {
      setIsDeletingRule(false);
    }
  };

  // Search & Filters for Clients
  const [crmSearchQuery, setCrmSearchQuery] = useState('');
  const [crmTierFilter, setCrmTierFilter] = useState('ALL');
  const [crmSkinTypeFilter, setCrmSkinTypeFilter] = useState('ALL');
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [crmAccountFilter, setCrmAccountFilter] = useState('ALL');
  const [crmTagFilter, setCrmTagFilter] = useState('ALL');
  const [customerTags, setCustomerTags] = useState<Record<string, string[]>>({});
  const [customerNotes, setCustomerNotes] = useState<Record<string, { id: string; text: string; date: string; author: string }[]>>({});
  const [newNoteText, setNewNoteText] = useState('');
  const [customerSamples, setCustomerSamples] = useState<Record<string, {
    id: string;
    sampleName: string;
    category: string;
    dateSent: string;
  }[]>>({});
  const [newSampleName, setNewSampleName] = useState('');
  const [newSampleCategory, setNewSampleCategory] = useState('Sérum / Essence');
  // WhatsApp Campaign Builder State
  const [campaignSegment, setCampaignSegment] = useState<'OVERDUE_RESTOCK' | 'GOLD_VIP' | 'DERMO_ACNE' | 'BY_CITY' | 'ALL_CLIENTS'>('OVERDUE_RESTOCK');
  const [campaignCity, setCampaignCity] = useState<string>('Casablanca');
  const [campaignDiscountPct, setCampaignDiscountPct] = useState<number>(15);
    const [pointsLogs, setPointsLogs] = useState<Record<string, {
    id: string;
    points: number;
    reason: string;
    date: string;
    author: string;
  }[]>>({});

  const loadSharedCustomerRecords = React.useCallback(async () => {
    try {
      const resources = ['customer-tags', 'customer-notes', 'customer-samples', 'points-adjustments'];
      const responses = await Promise.all(resources.map(resource =>
        fetch(`/api/admin/operational-records?resource=${resource}`, { cache: 'no-store' }).then(response => response.json())
      ));
      const [tags, notes, samples, adjustments] = responses.map(response => response?.success ? response.records || [] : []);
      setCustomerTags(tags.reduce((groups: Record<string, string[]>, item: any) => ({ ...groups, [item.phone]: [...(groups[item.phone] || []), item.tag] }), {}));
      setCustomerNotes(notes.reduce((groups: Record<string, { id: string; text: string; date: string; author: string }[]>, item: any) => ({ ...groups, [item.phone]: [...(groups[item.phone] || []), { id: item.id, text: item.text, date: new Date(item.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }), author: item.created_by }] }), {}));
      setCustomerSamples(samples.reduce((groups: Record<string, { id: string; sampleName: string; category: string; dateSent: string }[]>, item: any) => ({ ...groups, [item.phone]: [...(groups[item.phone] || []), { id: item.id, sampleName: item.sample_name, category: item.category, dateSent: new Date(item.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) }] }), {}));
      setPointsLogs(adjustments.reduce((groups: Record<string, { id: string; points: number; reason: string; date: string; author: string }[]>, item: any) => ({ ...groups, [item.phone]: [...(groups[item.phone] || []), { id: item.id, points: Number(item.points), reason: item.reason, date: new Date(item.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }), author: item.created_by }] }), {}));
    } catch {
      showToast('Les données CRM partagées sont momentanément indisponibles.', 'error');
    }
  }, [showToast]);

  React.useEffect(() => { void loadSharedCustomerRecords(); }, [loadSharedCustomerRecords]);

  const createSharedRecord = async (resource: string, record: Record<string, unknown>) => {
    const response = await fetch('/api/admin/operational-records', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resource, record }) });
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.error || 'Operation impossible.');
    return data.record;
  };

  const deleteSharedRecord = async (resource: string, id: string) => {
    const response = await fetch(`/api/admin/operational-records?resource=${resource}&id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.error || 'Suppression impossible.');
  };

  const handleAddPointsAdjustment = async (phone: string, pts: number, reason: string) => {
    if (!pts || isNaN(pts)) return;
    try {
      await createSharedRecord('points-adjustments', { phone, points: pts, reason: reason || (pts > 0 ? 'Bonus Admin' : 'Ajustement Admin') });
      await loadSharedCustomerRecords();
    } catch (error: any) {
      showToast(error.message || 'Impossible d’enregistrer l’ajustement.', 'error');
      return;
    }
    if (selectedCustomer) setSelectedCustomer({ ...selectedCustomer, points: Math.max(0, (selectedCustomer.points || 0) + pts), pointsOverrideReason: reason });
    setLoyaltyPointsAdjustment(0);
    setLoyaltyAdjustmentReason('');
  };
  const [campaignTemplateText, setCampaignTemplateText] = useState<string>(
    'Bonjour {firstname}, il est temps de renouveler votre soin préféré ({favorite_product}) ! Profitez de -{discount_pct}% avec votre code promo personnel : {custom_code}. ✨'
  );

  const handleAddSample = async (phone: string, sampleName: string, category: string) => {
    if (!sampleName.trim()) return;
    try {
      await createSharedRecord('customer-samples', { phone, sample_name: sampleName.trim(), category: category || 'Echantillon' });
      setNewSampleName('');
      await loadSharedCustomerRecords();
    } catch (error: any) {
      showToast(error.message || 'Impossible d’enregistrer l’échantillon.', 'error');
    }
  };

  const handleDeleteSample = async (_phone: string, sampleId: string) => {
    try { await deleteSharedRecord('customer-samples', sampleId); await loadSharedCustomerRecords(); }
    catch (error: any) { showToast(error.message || 'Impossible de supprimer l’échantillon.', 'error'); }
  };

  const handleAddTag = async (phone: string, tag: string) => {
    if (!tag.trim()) return;
    if ((customerTags[phone] || []).includes(tag.trim())) return;
    try { await createSharedRecord('customer-tags', { phone, tag: tag.trim() }); await loadSharedCustomerRecords(); }
    catch (error: any) { showToast(error.message || 'Impossible d’ajouter l’étiquette.', 'error'); }
  };

  const handleRemoveTag = async (phone: string, tagToRemove: string) => {
    try {
      const response = await fetch(`/api/admin/operational-records?resource=customer-tags&phone=${encodeURIComponent(phone)}`, { cache: 'no-store' });
      const data = await response.json();
      const record = (data.records || []).find((item: any) => item.tag === tagToRemove);
      if (!record) return;
      await deleteSharedRecord('customer-tags', record.id);
      await loadSharedCustomerRecords();
    } catch (error: any) { showToast(error.message || 'Impossible de supprimer l’étiquette.', 'error'); }
  };

  const handleAddNote = async (phone: string, text: string) => {
    if (!text.trim()) return;
    try { await createSharedRecord('customer-notes', { phone, text: text.trim() }); setNewNoteText(''); await loadSharedCustomerRecords(); }
    catch (error: any) { showToast(error.message || 'Impossible d’enregistrer la note.', 'error'); }
  };

  const handleDeleteNote = async (_phone: string, noteId: string) => {
    try { await deleteSharedRecord('customer-notes', noteId); await loadSharedCustomerRecords(); }
    catch (error: any) { showToast(error.message || 'Impossible de supprimer la note.', 'error'); }
  };

  const getTagBadgeStyle = (tag: string, theme: string) => {
    if (tag.includes('VIP')) return theme === 'light' ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-amber-950/40 text-amber-400 border-amber-800/60';
    if (tag.includes('Sensible') || tag.includes('Allergique')) return theme === 'light' ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-rose-950/40 text-rose-400 border-rose-800/60';
    if (tag.includes('Solaire')) return theme === 'light' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' : 'bg-yellow-950/40 text-yellow-400 border-yellow-800/60';
    if (tag.includes('Livreur') || tag.includes('Amana')) return theme === 'light' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60';
    if (tag.includes('Réassort')) return theme === 'light' ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-blue-950/40 text-blue-400 border-blue-800/60';
    return theme === 'light' ? 'bg-indigo-100 text-indigo-800 border-indigo-300' : 'bg-indigo-950/40 text-indigo-400 border-indigo-800/60';
  };

  // Filters for Diagnostics
  const [diagSkinTypeFilter, setDiagSkinTypeFilter] = useState('ALL');
  const [diagConcernFilter, setDiagConcernFilter] = useState('ALL');
  const [diagExposureFilter, setDiagExposureFilter] = useState('ALL');

  // Search for Leads
  const [leadsSearchQuery, setLeadsSearchQuery] = useState('');
  const [selectedDiagnostic, setSelectedDiagnostic] = useState<any | null>(null);

  // Selected customer modal state
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<Order | null>(null);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState<boolean>(false);
  const [promoDiscountPct, setPromoDiscountPct] = useState<number>(15);
  const [promoExpiryDays, setPromoExpiryDays] = useState<number>(7);
  const [promoCustomCode, setPromoCustomCode] = useState<string>('');
  const [isGeneratingPromo, setIsGeneratingPromo] = useState<boolean>(false);
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
      const custCity = c.orders?.find((o: any) => o.city)?.city || '';
      const matchesSearch = (c.name || '').toLowerCase().includes(crmSearchQuery.toLowerCase()) ||
                            (c.phone || '').includes(crmSearchQuery) ||
                            (custCity || '').toLowerCase().includes(crmSearchQuery.toLowerCase());
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

      if (crmAccountFilter !== 'ALL') {
        const hasAcc = c.has_account || c.orders?.some((o: any) => o.has_account || o.user_id || o.email);
        if (crmAccountFilter === 'WITH_ACCOUNT' && !hasAcc) return false;
        if (crmAccountFilter === 'GUEST' && hasAcc) return false;
      }

      return true;
    });
  }, [crmCustomers, crmSearchQuery, crmTierFilter, crmSkinTypeFilter, crmAccountFilter, diagnosticsList]);

  // CSV Helpers
  const escapeCsv = (val: any) => {
    if (val === null || val === undefined) return '';
    const str = String(val).replace(/"/g, '""');
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
    <div className="space-y-6">
      {/* ── Premium Sliding Pill Sub-Tab Nav ───────────────────────── */}
      <div className={`flex flex-wrap items-center gap-1 p-1.5 rounded-2xl transition-all duration-300 w-fit max-w-full ${
        adminTheme === 'light'
          ? 'bg-slate-200/50 border border-slate-300/60 shadow-[0_2px_8px_rgba(15,23,42,0.04)]'
          : 'bg-slate-900/80 border border-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.5)]'
      }`}
      role="tablist"
      >
        {([
          { id: 'clients',     label: 'Clients',      icon: Users,         count: crmCustomers.length },
          { id: 'analytics',   label: 'Analytics',    icon: BarChart3,     count: null },
          { id: 'diagnostics', label: 'Diagnostics',  icon: Sliders,       count: diagnosticsList.length },
          { id: 'rules',       label: 'Règles',       icon: Settings,      count: settings.diagnosticRules?.length || 0 },
          { id: 'leads',       label: 'Leads',        icon: ClipboardList, count: leadsList.length },
          { id: 'rfm',         label: 'RFM',          icon: Target,        count: crmCustomers.length },
          { id: 'reminders',   label: 'Relances',     icon: Bell,          count: null },
          { id: 'automations', label: 'Automation',   icon: Activity,      count: null },
        ] as { id: string; label: string; icon: React.ComponentType<{ className?: string }>; count: number | null }[]).map((tab) => {
          const TabIcon = tab.icon;
          const isActive = crmSubTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setCrmSubTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl font-bold tracking-tight transition-all duration-200 flex items-center gap-1.5 cursor-pointer active:scale-[0.97] text-[11px] whitespace-nowrap ${
                isActive
                  ? (adminTheme === 'light'
                      ? 'bg-white text-slate-900 shadow-[0_2px_8px_rgba(15,23,42,0.08)] border border-slate-200/90 font-black'
                      : 'bg-emerald-500 text-slate-950 shadow-[0_4px_16px_rgba(16,185,129,0.3)] font-black')
                  : (adminTheme === 'light'
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-semibold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.06] font-semibold')
              }`}
            >
              <TabIcon className={`w-3.5 h-3.5 ${isActive ? (adminTheme === 'light' ? 'text-emerald-600' : 'text-slate-950') : 'opacity-65'}`} />
              {tab.label}
              {tab.count !== null && (
                <span className={`px-1.5 py-0.5 rounded-full font-mono font-extrabold text-[9px] ${
                  isActive
                    ? (adminTheme === 'light' ? 'bg-slate-100 text-slate-800' : 'bg-slate-950/20 text-slate-950')
                    : (adminTheme === 'light' ? 'bg-slate-300/50 text-slate-600' : 'bg-white/10 text-slate-400')
                }`}>{tab.count}</span>
              )}
            </button>
          );
        })}
      </div>

      {crmSubTab === 'rfm' && (
        <RFMTab />
      )}

      {/* ── SUB-TAB: ANALYTICS & GÉOLOCALISATION CLIENTS ──────────── */}
      {crmSubTab === 'analytics' && (() => {
        const cityMap: Record<string, {
          cityName: string;
          totalRevenue: number;
          totalOrders: number;
          clientsCount: number;
          clients: any[];
          orders: Order[];
          tiers: Record<string, number>;
        }> = {};

        (crmCustomers || []).forEach((c: any) => {
          const custOrders = c.orders || [];
          const custCity = custOrders.find((o: any) => o.city)?.city?.trim() || 'Casablanca';

          if (!cityMap[custCity]) {
            cityMap[custCity] = {
              cityName: custCity,
              totalRevenue: 0,
              totalOrders: 0,
              clientsCount: 0,
              clients: [],
              orders: [],
              tiers: { Bronze: 0, Silver: 0, Gold: 0, Platinum: 0 }
            };
          }

          cityMap[custCity].clientsCount += 1;
          cityMap[custCity].clients.push(c);
          cityMap[custCity].totalRevenue += (c.totalSpend || 0);

          let t = 'Bronze';
          if (c.totalSpend >= 1500) t = 'Platinum';
          else if (c.totalSpend >= 700) t = 'Gold';
          else if (c.totalSpend >= 300) t = 'Silver';
          cityMap[custCity].tiers[t] = (cityMap[custCity].tiers[t] || 0) + 1;

          custOrders.forEach((o: any) => {
            cityMap[custCity].orders.push(o);
            cityMap[custCity].totalOrders += 1;
          });
        });

        const grandTotalRevenue = Object.values(cityMap).reduce((sum, c) => sum + c.totalRevenue, 0) || 1;
        const grandTotalOrders = Object.values(cityMap).reduce((sum, c) => sum + c.totalOrders, 0) || 1;

        const cityList = Object.values(cityMap).map(c => ({
          ...c,
          aov: c.totalOrders > 0 ? c.totalRevenue / c.totalOrders : 0,
          avgSpendPerClient: c.clientsCount > 0 ? c.totalRevenue / c.clientsCount : 0,
          marketShareRev: Math.round((c.totalRevenue / grandTotalRevenue) * 100),
          marketShareOrd: Math.round((c.totalOrders / grandTotalOrders) * 100),
          dominantTier: (c.tiers.Platinum > 0) ? 'Platinum' : (c.tiers.Gold > 0) ? 'Gold' : 'Silver'
        })).sort((a, b) => b.totalRevenue - a.totalRevenue);

        const topRevCity = cityList[0] || { cityName: 'Casablanca', totalRevenue: 0, marketShareRev: 0 };
        const topVolCity = [...cityList].sort((a, b) => b.totalOrders - a.totalOrders)[0] || { cityName: 'Rabat', totalOrders: 0 };
        const topAovCity = [...cityList].sort((a, b) => b.aov - a.aov)[0] || { cityName: 'Marrakech', aov: 0 };

        return (
          <div className="space-y-6 admin-tab-enter">
            {/* Hero Analytics Header */}
            <div className={`relative overflow-hidden rounded-3xl border p-6 md:p-8 ${
              adminTheme === 'light'
                ? 'bg-gradient-to-br from-white via-slate-50 to-indigo-50/30 border-slate-200/80 shadow-[0_8px_32px_-8px_rgba(15,30,54,0.06)]'
                : 'bg-gradient-to-br from-slate-900 via-slate-900/60 to-indigo-950/30 border-white/[0.06] shadow-xl'
            }`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500">
                      📊 Geolocation & Customer Analytics
                    </span>
                    <span className={`text-[9px] font-mono ${adminTheme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
                      {cityList.length} villes représentées
                    </span>
                  </div>
                  <h1 className={`text-2xl md:text-4xl font-black tracking-tight ${adminTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                    Cartographie & Performance par Ville
                  </h1>
                  <p className={`text-xs font-mono max-w-xl ${adminTheme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                    Analyse détaillée de la rentabilité, du volume de commandes et du panier moyen (AOV) à travers les villes du Maroc.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      const headers = ['Rang', 'Ville', 'Clients', 'Commandes', 'CA (DH)', 'Panier Moyen (DH)', 'Part de Marche (%)'];
                      const rows = cityList.map((c, i) => [
                        i + 1,
                        c.cityName,
                        c.clientsCount,
                        c.totalOrders,
                        c.totalRevenue.toFixed(0),
                        c.aov.toFixed(0),
                        c.marketShareRev
                      ]);
                      const csvStr = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
                      const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `CRM_Analytics_Villes_${new Date().toISOString().slice(0, 10)}.csv`;
                      a.click();
                    }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black border transition cursor-pointer ${
                      adminTheme === 'light'
                        ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <FileText className="w-4 h-4 text-emerald-500" /> Exporter Rapport CSV
                  </button>
                </div>
              </div>
            </div>

            {/* 4 Geographic Insight Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Top Revenue City */}
              <div className={`p-5 rounded-2xl border transition hover:scale-[1.01] ${
                adminTheme === 'light' ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-900/50 border-white/[0.06]'
              }`}>
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block mb-1.5">🏆 Ville #1 en CA</span>
                <span className="text-xl font-black font-mono block text-emerald-600 dark:text-emerald-400 leading-tight">
                  📍 {topRevCity.cityName}
                </span>
                <span className="text-[10px] font-mono text-slate-400 block mt-1">
                  {topRevCity.totalRevenue.toFixed(0)} DH ({topRevCity.marketShareRev}% du CA)
                </span>
              </div>

              {/* Top Orders Volume City */}
              <div className={`p-5 rounded-2xl border transition hover:scale-[1.01] ${
                adminTheme === 'light' ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-900/50 border-white/[0.06]'
              }`}>
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block mb-1.5">📦 Top Volume Commandes</span>
                <span className="text-xl font-black font-mono block text-blue-600 dark:text-blue-400 leading-tight">
                  📍 {topVolCity.cityName}
                </span>
                <span className="text-[10px] font-mono text-slate-400 block mt-1">
                  {(() => {
                    const deliveredCount = (topVolCity.orders || []).filter((o: any) => (o.status || '').toLowerCase() === 'delivered').length;
                    return deliveredCount > 0
                      ? `${topVolCity.totalOrders} commande${topVolCity.totalOrders > 1 ? 's' : ''} (${deliveredCount} livrée${deliveredCount > 1 ? 's' : ''})`
                      : `${topVolCity.totalOrders} commande${topVolCity.totalOrders > 1 ? 's' : ''} au total`;
                  })()}
                </span>
              </div>

              {/* Highest AOV City */}
              <div className={`p-5 rounded-2xl border transition hover:scale-[1.01] ${
                adminTheme === 'light' ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-900/50 border-white/[0.06]'
              }`}>
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block mb-1.5">💎 Panier Moyen Max (AOV)</span>
                <span className="text-xl font-black font-mono block text-violet-600 dark:text-violet-400 leading-tight">
                  📍 {topAovCity.cityName}
                </span>
                <span className="text-[10px] font-mono text-slate-400 block mt-1">
                  {topAovCity.aov.toFixed(0)} DH / commande
                </span>
              </div>

              {/* Total Cities Covered */}
              <div className={`p-5 rounded-2xl border transition hover:scale-[1.01] ${
                adminTheme === 'light' ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-900/50 border-white/[0.06]'
              }`}>
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block mb-1.5">🗺️ Couverture Territoriale</span>
                <span className={`text-xl font-black font-mono block leading-tight ${adminTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                  {cityList.length} Villes
                </span>
                <span className="text-[9px] font-mono text-slate-400 block mt-1">
                  {crmCustomers.length} clients répartis
                </span>
              </div>
            </div>

            {/* ── Table: Classement des Villes & Part de Marché ── */}
            <div className={`rounded-3xl border overflow-hidden ${
              adminTheme === 'light' ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-900/50 border-white/[0.06]'
            }`}>
              <div className={`p-5 border-b flex justify-between items-center flex-wrap gap-3 ${
                adminTheme === 'light' ? 'bg-slate-50/60 border-slate-100' : 'bg-slate-900/80 border-white/5'
              }`}>
                <div>
                  <h3 className={`text-sm font-black uppercase tracking-wider ${adminTheme === 'light' ? 'text-slate-800' : 'text-slate-100'}`}>
                    Classement des Villes les Plus Rentables
                  </h3>
                  <p className={`text-[10px] font-mono ${adminTheme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
                    Trié par Chiffre d&apos;Affaires cumulé (DH)
                  </p>
                </div>

                {/* Search by City */}
                <div className="relative min-w-[180px]">
                  <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${adminTheme === 'light' ? 'text-slate-400' : 'text-slate-500'}`} />
                  <input
                    type="text"
                    placeholder="Filtrer une ville..."
                    value={citySearchQuery}
                    onChange={e => setCitySearchQuery(e.target.value)}
                    className={`w-full text-xs rounded-xl pl-9 pr-3 py-2 border outline-none transition ${
                      adminTheme === 'light'
                        ? 'bg-white border-slate-200 text-slate-800 focus:border-indigo-500 shadow-2xs'
                        : 'bg-slate-950 border-slate-800 text-slate-100 focus:border-indigo-500'
                    }`}
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`text-[10px] font-black uppercase tracking-wider border-b ${
                      adminTheme === 'light' ? 'bg-slate-100/70 border-slate-200/60 text-slate-500' : 'bg-slate-950/60 border-white/5 text-slate-400'
                    }`}>
                      <th className="py-3.5 px-4 w-12 text-center">#</th>
                      <th className="py-3.5 px-4">Ville</th>
                      <th className="py-3.5 px-4 text-center">Clients</th>
                      <th className="py-3.5 px-4 text-center">Commandes</th>
                      <th className="py-3.5 px-4 text-right">CA Cumulé (DH)</th>
                      <th className="py-3.5 px-4 text-right">Panier Moyen (AOV)</th>
                      <th className="py-3.5 px-4 min-w-[160px]">Part de Marché</th>
                      <th className="py-3.5 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                    {cityList
                      .filter(c => c.cityName.toLowerCase().includes(citySearchQuery.toLowerCase()))
                      .map((c, idx) => {
                        const rankGrad = idx === 0 ? 'text-yellow-500 font-black' : idx === 1 ? 'text-slate-400 font-black' : idx === 2 ? 'text-amber-600 font-black' : 'text-slate-400';
                        return (
                          <tr key={c.cityName} className={`transition-colors ${
                            adminTheme === 'light' ? 'hover:bg-slate-50/80' : 'hover:bg-slate-800/40'
                          }`}>
                            <td className={`py-4 px-4 text-center font-mono text-sm ${rankGrad}`}>
                              {idx + 1}
                            </td>

                            <td className="py-4 px-4 font-black font-sans">
                              <span className="flex items-center gap-1.5">
                                📍 {c.cityName}
                              </span>
                            </td>

                            <td className="py-4 px-4 text-center font-mono font-bold">
                              <span className={`px-2.5 py-1 rounded-full text-[11px] ${
                                adminTheme === 'light' ? 'bg-slate-100 text-slate-700' : 'bg-slate-800 text-slate-300'
                              }`}>
                                {c.clientsCount} clients
                              </span>
                            </td>

                            <td className="py-4 px-4 text-center font-mono font-bold">
                              {c.totalOrders} cmds
                            </td>

                            <td className="py-4 px-4 text-right font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                              {c.totalRevenue.toFixed(0)} DH
                            </td>

                            <td className="py-4 px-4 text-right font-mono font-bold">
                              {c.aov.toFixed(0)} DH
                            </td>

                            <td className="py-4 px-4">
                              <div className="space-y-1">
                                <div className="flex justify-between text-[10px] font-mono">
                                  <span className="font-bold">{c.marketShareRev}% du CA</span>
                                </div>
                                <div className={`h-2 rounded-full overflow-hidden ${adminTheme === 'light' ? 'bg-slate-100' : 'bg-slate-800'}`}>
                                  <div
                                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                                    style={{ width: `${Math.max(5, c.marketShareRev)}%` }}
                                  />
                                </div>
                              </div>
                            </td>

                            <td className="py-4 px-4 text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  setCrmSearchQuery(c.cityName);
                                  setCrmSubTab('clients');
                                }}
                                className="po-ui-button po-ui-button--primary po-ui-button--md inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_4px_14px_rgba(16,185,129,0.35)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.5)] transition-all duration-200 cursor-pointer active:scale-95 whitespace-nowrap"
                              >
                                Voir Clients →
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── SUB-TAB 1: CLIENTS & FIDÉLITÉ — PREMIUM REDESIGN ──────────── */}
      {crmSubTab === 'clients' && (
        <div className="space-y-5 admin-tab-enter">

          {/* ── KPI Command Center ── */}
          {(() => {
            const isFiltered = crmSearchQuery.trim() !== '' || crmTierFilter !== 'ALL' || crmSkinTypeFilter !== 'ALL' || crmAccountFilter !== 'ALL';
            const targetList = filteredCrmCustomers;

            const totalCA = targetList.reduce((s: number, c: any) => s + (c.totalSpend || 0), 0);
            const avgPts = targetList.length > 0 ? Math.round(targetList.reduce((s: number, c: any) => s + Math.round((c.totalSpend || 0) * pointsPerDh), 0) / targetList.length) : 0;
            const platCount = targetList.filter((c: any) => c.totalSpend >= 1500).length;
            const goldCount = targetList.filter((c: any) => c.totalSpend >= 700 && c.totalSpend < 1500).length;
            const silverCount = targetList.filter((c: any) => c.totalSpend >= 300 && c.totalSpend < 700).length;

            const withAccCount = targetList.filter((c: any) => c.has_account || c.orders?.some((o: any) => o.has_account || o.user_id || o.email)).length;
            const guestCount = targetList.length - withAccCount;

            const domTier = platCount >= goldCount && platCount >= silverCount && platCount > 0 ? 'Platinum' : goldCount >= silverCount && goldCount > 0 ? 'Gold' : silverCount > 0 ? 'Silver' : 'Bronze';

            const kpis = [
              { label: isFiltered ? `Clients (${crmSearchQuery.length > 15 ? crmSearchQuery.slice(0, 12) + '...' : crmSearchQuery || 'Filtrés'})` : 'Total Clients', value: targetList.length.toString(), sub: `${withAccCount} comptes · ${guestCount} invités`, color: 'text-blue-400', lightColor: 'text-blue-600', bg: 'from-blue-500/10 to-indigo-500/10 border-blue-900/40', lightBg: 'bg-blue-50', icon: Users },
              { label: 'CA Cumulé', value: `${totalCA >= 1000 ? (totalCA / 1000).toFixed(1) + 'k' : totalCA.toFixed(0)} DH`, sub: `Moy. ${targetList.length > 0 ? (totalCA / targetList.length).toFixed(0) : 0} DH/client`, color: 'text-emerald-400', lightColor: 'text-emerald-600', bg: 'from-emerald-500/10 to-teal-500/10 border-emerald-900/40', lightBg: 'bg-emerald-50', icon: FileText },
              { label: 'Fidélité Moy.', value: `${avgPts} pts`, sub: `${pointsPerDh} pt / DH dépensé`, color: 'text-violet-400', lightColor: 'text-violet-600', bg: 'from-violet-500/10 to-purple-500/10 border-violet-900/40', lightBg: 'bg-violet-50', icon: ClipboardList },
              { label: 'Palier Dominant', value: domTier, sub: `${platCount} Plat · ${goldCount} Gold`, color: 'text-amber-400', lightColor: 'text-amber-600', bg: 'from-amber-500/10 to-yellow-500/10 border-amber-900/40', lightBg: 'bg-amber-50', icon: Target },
            ];
            return (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((k, i) => {
                  const Icon = k.icon;
                  return (
                    <div key={i} className={`group relative overflow-hidden rounded-2xl border p-4 flex items-center gap-3.5 transition-all duration-300 hover:scale-[1.015] ${
                      adminTheme === 'light'
                        ? 'bg-white border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(15,30,54,0.06)] hover:shadow-[0_8px_28px_-4px_rgba(15,30,54,0.1)]'
                        : `bg-gradient-to-br ${k.bg} shadow-xl hover:shadow-2xl`
                    }`}>
                      <div className={`p-2.5 rounded-xl shrink-0 transition ${
                        adminTheme === 'light'
                          ? `${k.lightBg} ${k.lightColor} border border-transparent`
                          : `bg-slate-950/60 border border-slate-800/80 ${k.color}`
                      }`}><Icon className="w-4 h-4" /></div>
                      <div className="min-w-0">
                        <span className={`text-[9px] font-semibold uppercase tracking-wider block ${ adminTheme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>{k.label}</span>
                        <span className={`text-lg font-extrabold font-mono block leading-tight ${ adminTheme === 'light' ? 'text-slate-900' : k.color}`}>{k.value}</span>
                        <span className={`text-[9px] font-mono block ${ adminTheme === 'light' ? 'text-slate-400' : 'text-slate-600'}`}>{k.sub}</span>
                      </div>
                      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${
                        adminTheme === 'light' ? 'bg-gradient-to-br from-white/60 to-transparent' : 'bg-gradient-to-br from-white/[0.03] to-transparent'
                      }`} />
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {/* ── Tier Filter Chips + Search Row ── */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className={`relative flex-1 min-w-[200px] max-w-xs`}>
              <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${ adminTheme === 'light' ? 'text-slate-400' : 'text-slate-500'}`} />
              <input
                type="text"
                placeholder="Nom, téléphone..."
                value={crmSearchQuery}
                onChange={e => setCrmSearchQuery(e.target.value)}
                className={`w-full text-xs rounded-xl pl-9 pr-4 py-2.5 border outline-none transition ${
                  adminTheme === 'light'
                    ? 'bg-white border-slate-200 text-slate-800 focus:border-emerald-500/50 shadow-sm'
                    : 'bg-slate-900/60 border-slate-800 text-slate-100 focus:border-emerald-500/40'
                }`}
              />
            </div>

            {/* Tier chips */}
            <div className={`flex items-center gap-1 p-1 rounded-xl ${ adminTheme === 'light' ? 'bg-slate-100 border border-slate-200' : 'bg-slate-900/60 border border-slate-800'}`}>
              {[['ALL', 'Tous'], ['Platinum', '💎 Platinum'], ['Gold', '🥇 Gold'], ['Silver', '🥈 Silver'], ['Bronze', '🥉 Bronze']].map(([val, lbl]) => (
                <button
                  key={val}
                  onClick={() => setCrmTierFilter(val)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                    crmTierFilter === val
                      ? (adminTheme === 'light' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'bg-emerald-500 text-slate-950 shadow-[0_2px_8px_rgba(16,185,129,0.3)]')
                      : (adminTheme === 'light' ? 'text-slate-500 hover:text-slate-800' : 'text-slate-500 hover:text-slate-300')
                  }`}
                >{lbl}</button>
              ))}
            </div>

            {/* Skin type chips */}
            <div className={`flex items-center gap-1 p-1 rounded-xl ${ adminTheme === 'light' ? 'bg-slate-100 border border-slate-200' : 'bg-slate-900/60 border border-slate-800'}`}>
              {[['ALL','Toutes'], ['Sèche / Dry','Sèche'], ['Grasse / Oily','Grasse'], ['Mixte / Combination','Mixte'], ['Sensible / Sensitive','Sensible']].map(([val, lbl]) => (
                <button
                  key={val}
                  onClick={() => setCrmSkinTypeFilter(val)}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                    crmSkinTypeFilter === val
                      ? (adminTheme === 'light' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'bg-slate-700 text-emerald-400 shadow-sm')
                      : (adminTheme === 'light' ? 'text-slate-500 hover:text-slate-800' : 'text-slate-500 hover:text-slate-300')
                  }`}
                >{lbl}</button>
              ))}
            </div>

            {/* Account Status Chips */}
            <div className={`flex items-center gap-1 p-1 rounded-xl ${ adminTheme === 'light' ? 'bg-slate-100 border border-slate-200' : 'bg-slate-900/60 border border-slate-800'}`}>
              {[['ALL','Tous comptes'], ['WITH_ACCOUNT','👤 Avec Compte'], ['GUEST','🛍️ Invités']].map(([val, lbl]) => (
                <button
                  key={val}
                  onClick={() => setCrmAccountFilter(val)}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                    crmAccountFilter === val
                      ? (adminTheme === 'light' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'bg-emerald-500 text-slate-950 shadow-sm')
                      : (adminTheme === 'light' ? 'text-slate-500 hover:text-slate-800' : 'text-slate-500 hover:text-slate-300')
                  }`}
                >{lbl}</button>
              ))}
            </div>

            {/* Tag Filter Chips */}
            <div className={`flex items-center gap-1 p-1 rounded-xl ${ adminTheme === 'light' ? 'bg-slate-100 border border-slate-200' : 'bg-slate-900/60 border border-slate-800'}`}>
              {[['ALL','Tous Tags'], ['VIP-KBeauty','🏷️ VIP-KBeauty'], ['Sensible-Allergique','🏷️ Sensible'], ['Acheteuse-Solaire','🏷️ Solaire'], ['Livreur-Préféré-Amana','🏷️ Amana']].map(([val, lbl]) => (
                <button
                  key={val}
                  onClick={() => setCrmTagFilter(val)}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                    crmTagFilter === val
                      ? (adminTheme === 'light' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'bg-amber-500 text-slate-950 shadow-sm')
                      : (adminTheme === 'light' ? 'text-slate-500 hover:text-slate-800' : 'text-slate-500 hover:text-slate-300')
                  }`}
                >{lbl}</button>
              ))}
            </div>

            <div className="ml-auto flex items-center gap-2">
              <span className={`text-[10px] font-mono ${ adminTheme === 'light' ? 'text-slate-400' : 'text-slate-600'}`}>{filteredCrmCustomers.length} clients</span>
              <button
                onClick={() => handleExportCustomersToCsv(filteredCrmCustomers)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold border transition cursor-pointer ${
                  adminTheme === 'light' ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm' : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" /> Exporter CSV
              </button>
            </div>
          </div>

          {/* ── Premium Client Cards ── */}
          <div className="space-y-2.5">
            {filteredCrmCustomers.length === 0 && (
              <div className={`p-12 text-center rounded-2xl border ${ adminTheme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/30 border-slate-900'}`}>
                <Users className={`w-8 h-8 mx-auto mb-2 ${ adminTheme === 'light' ? 'text-slate-300' : 'text-slate-700'}`} />
                <p className={`text-sm font-semibold ${ adminTheme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Aucun profil client trouvé.</p>
              </div>
            )}
            {filteredCrmCustomers.map((cust: any, idx: number) => {
              let tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' = 'Bronze';
              if (cust.totalSpend >= 1500) tier = 'Platinum';
              else if (cust.totalSpend >= 700) tier = 'Gold';
              else if (cust.totalSpend >= 300) tier = 'Silver';

              const estimatedPoints = Math.round(cust.totalSpend * pointsPerDh);
              const tierGradients: Record<string, { ring: string; badge: string; badgeText: string; glow: string; emoji: string }> = {
                Bronze:   { ring: 'from-amber-700 to-amber-500',    badge: adminTheme === 'light' ? 'bg-amber-50 border-amber-200 text-amber-700'           : 'bg-amber-950/30 border-amber-800/40 text-amber-400',   badgeText: 'Bronze',   glow: 'shadow-amber-500/10',   emoji: '🥉' },
                Silver:   { ring: 'from-slate-400 to-slate-300',    badge: adminTheme === 'light' ? 'bg-slate-200/80 border-slate-400/60 text-slate-700'   : 'bg-slate-800/40 border-slate-700 text-slate-300',       badgeText: 'Silver',   glow: 'shadow-slate-400/10',   emoji: '🥈' },
                Gold:     { ring: 'from-yellow-500 to-amber-300',   badge: adminTheme === 'light' ? 'bg-yellow-50 border-yellow-200 text-yellow-700'         : 'bg-yellow-950/30 border-yellow-800/40 text-yellow-400', badgeText: 'Gold',     glow: 'shadow-yellow-500/15',  emoji: '🥇' },
                Platinum: { ring: 'from-violet-500 to-indigo-400',  badge: adminTheme === 'light' ? 'bg-violet-50 border-violet-200 text-violet-700'         : 'bg-violet-950/30 border-violet-800/40 text-violet-400', badgeText: 'Platinum', glow: 'shadow-violet-500/20',  emoji: '💎' },
              };
              const tg = tierGradients[tier];
              const initials = (cust.name || '?').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
              const spendPct = Math.min(100, Math.round((cust.totalSpend / 1500) * 100));
              const waPhone = (cust.phone || '').replace(/[^0-9]/g, '');

              return (
                <div
                  key={idx}
                  className={`group relative flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 cursor-pointer hover:scale-[1.005] ${
                    adminTheme === 'light'
                      ? `bg-white border-slate-200/80 shadow-[0_2px_12px_-2px_rgba(15,30,54,0.04)] hover:shadow-[0_6px_20px_-4px_rgba(15,30,54,0.08)] hover:border-slate-300/80`
                      : `bg-slate-900/40 border-slate-900 hover:border-slate-700/80 shadow-lg hover:shadow-xl hover:shadow-${tg.glow}`
                  }`}
                  onClick={() => handleOpenCrmCustomer(cust.phone, cust.name, cust.orders, cust.totalSpend)}
                >
                  {/* Avatar with tier ring */}
                  <div className="relative shrink-0">
                    <div className={`w-11 h-11 rounded-full p-[2px] bg-gradient-to-br ${tg.ring} shadow-md`}>
                      <div className={`w-full h-full rounded-full flex items-center justify-center text-sm font-black ${
                        adminTheme === 'light' ? 'bg-white text-slate-800' : 'bg-slate-950 text-slate-100'
                      }`}>
                        {initials}
                      </div>
                    </div>
                    {/* Tier emoji mini badge */}
                    <span className="absolute -bottom-0.5 -right-0.5 text-[10px] leading-none">{tg.emoji}</span>
                  </div>

                  {/* Client info */}
                  {(() => {
                    const hasAcc = cust.has_account || cust.orders?.some((o: any) => o.has_account || o.user_id || o.email);
                    const custEmail = cust.email || cust.orders?.find((o: any) => o.email)?.email;
                    return (
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-black text-sm ${ adminTheme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>{cust.name || 'Anonyme'}</span>
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${tg.badge}`}>{tg.badgeText}</span>
                          {hasAcc ? (
                            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                              adminTheme === 'light'
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                : 'bg-emerald-950/30 border-emerald-900/40 text-emerald-400'
                            }`}>
                              👤 Compte Membre
                            </span>
                          ) : (
                            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                              adminTheme === 'light'
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                                : 'bg-slate-800/40 border-slate-700 text-slate-400'
                            }`}>
                              🛍️ Invité
                            </span>
                          )}
                          {(() => {
                            const orders = cust.orders || [];
                            const total = orders.length;
                            const delivered = orders.filter((o: any) => (o.status || '').toLowerCase() === 'delivered').length;
                            const refused = orders.filter((o: any) => ['cancelled', 'returned', 'refused'].includes((o.status || '').toLowerCase())).length;

                            if (refused > 0) {
                              return (
                                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border bg-red-50 border-red-200 text-red-700 dark:bg-red-950/30 dark:border-red-900/40 dark:text-red-400">
                                  🚨 {refused} Refus Colis
                                </span>
                              );
                            }
                            if (delivered > 0) {
                              return (
                                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900/40 dark:text-emerald-400">
                                  🛡️ COD 100% ({delivered}/{total})
                                </span>
                              );
                            }
                            return null;
                          })()}
                        </div>
                        {(() => {
                          const custCity = cust.orders?.find((o: any) => o.city)?.city || null;
                          return (
                            <span className={`text-[10px] font-mono block mt-0.5 ${ adminTheme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                              {cust.phone} {custCity ? `· 📍 ${custCity}` : ''} {custEmail ? `· ${custEmail}` : ''} · {cust.orders.length} commande{cust.orders.length > 1 ? 's' : ''}
                            </span>
                          );
                        })()}
                        {/* Spend progress bar */}
                        <div className={`mt-2 h-1 rounded-full overflow-hidden ${ adminTheme === 'light' ? 'bg-slate-100' : 'bg-slate-800/60'}`}>
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${tg.ring} transition-all duration-700`}
                            style={{ width: `${spendPct}%` }}
                          />
                        </div>

                        {/* Customer Tags */}
                        {((customerTags[cust.phone] || []) as string[]).length > 0 && (
                          <div className="flex flex-wrap items-center gap-1 mt-2">
                            {((customerTags[cust.phone] || []) as string[]).map(t => (
                              <span key={t} className={`text-[8.5px] font-mono font-bold px-2 py-0.5 rounded-full border ${getTagBadgeStyle(t, adminTheme)}`}>
                                🏷️ {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Stats */}
                  <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
                    <span className={`text-base font-black font-mono ${ adminTheme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>{cust.totalSpend.toFixed(0)} DH</span>
                    <span className={`text-[10px] font-mono ${ adminTheme === 'light' ? 'text-emerald-600' : 'text-emerald-400'}`}>{estimatedPoints} pts</span>
                  </div>

                  {/* Actions (show on hover) */}
                  <div className="flex items-center gap-2 shrink-0">
                    {waPhone && (
                      <a
                        href={`https://wa.me/${waPhone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20 text-xs font-bold"
                        title="WhatsApp"
                      >
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      </a>
                    )}
                    <button
                      onClick={e => { e.stopPropagation(); handleOpenCrmCustomer(cust.phone, cust.name, cust.orders, cust.totalSpend); }}
                      className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all duration-200 cursor-pointer ${
                        adminTheme === 'light'
                          ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 shadow-sm'
                          : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-emerald-950/30 hover:border-emerald-800/40 hover:text-emerald-400'
                      }`}
                    >
                      Gérer →
                    </button>
                  </div>
                </div>
              );
            })}
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
                    <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Dominant</span>
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
                    className="admin-input"
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
                    className="admin-input"
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
                    className="admin-input"
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
                  className="admin-btn admin-btn-secondary flex items-center gap-1.5 shrink-0"
                >
                  <FileText className="w-4 h-4" style={{ color: 'var(--admin-text-muted)' }} /> Exporter en CSV
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
                        <tr key={idx} className={`transition-colors admin-row-enter ${
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
                            <StatusBadge
                              status={d.sunExposure === 'Forte' ? 'error' : d.sunExposure === 'Moyenne' ? 'warning' : 'active'}
                              label={d.sunExposure}
                              theme={adminTheme}
                              size="xs"
                            />
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => setSelectedDiagnostic(d)}
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
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--admin-text-faint)' }} />
                <input
                  type="text"
                  placeholder="Rechercher par email ou téléphone..."
                  value={leadsSearchQuery}
                  onChange={(e) => setLeadsSearchQuery(e.target.value)}
                  className="admin-input admin-focus-ring w-full pl-10"
                />
              </div>
              
              <button
                onClick={() => handleExportLeadsToCsv(
                  leadsList.filter(l => 
                    (l.email || '').toLowerCase().includes(leadsSearchQuery.toLowerCase()) ||
                    (l.phone || '').toLowerCase().includes(leadsSearchQuery.toLowerCase())
                  )
                )}
                className="admin-btn admin-btn-secondary flex items-center gap-1.5 shrink-0"
              >
                <FileText className="w-4 h-4" style={{ color: 'var(--admin-text-muted)' }} /> Exporter en CSV
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
                  <tr style={{ borderBottom: '1px solid var(--admin-border)', background: 'var(--admin-surface-2)' }}>
                    {['Email', 'Téléphone', "Date d'inscription", ''].map((h, i) => (
                      <th key={i} className={`p-4 font-bold uppercase tracking-widest ${i === 3 ? 'text-right' : ''}`} style={{ fontSize: 'var(--admin-text-2xs)', color: 'var(--admin-text-faint)' }}>
                        {h}
                      </th>
                    ))}
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
                      <tr key={idx} className={`transition-colors admin-row-enter ${
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
                          <StatusBadge status="inactive" label="Newsletter" dot={false} theme={adminTheme} size="xs" />
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
                    acne: adminTheme === 'light' ? 'text-rose-700 bg-rose-50 border-rose-100' : 'text-rose-400 bg-rose-950/20 border-rose-900/40',
                    spots: adminTheme === 'light' ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-amber-400 bg-amber-950/20 border-amber-900/30',
                    wrinkles: adminTheme === 'light' ? 'text-purple-700 bg-purple-50 border-purple-100' : 'text-purple-400 bg-purple-950/20 border-purple-900/40',
                    dryness: adminTheme === 'light' ? 'text-blue-700 bg-blue-50/70 border-blue-100' : 'text-blue-400 bg-blue-950/20 border-blue-900/40',
                    any: adminTheme === 'light' ? 'text-slate-600 bg-slate-100 border-slate-200' : 'text-slate-400 bg-slate-800/45 border-slate-700/50'
                  };
                  const label: Record<string, string> = { acne: 'Acné', spots: 'Taches', wrinkles: 'Rides', dryness: 'Sécheresse', any: 'Toutes Préoccupations' };
                  return <span className={`px-2.5 py-0.5 rounded-full border text-[9px] uppercase font-black tracking-wider ${map[val] || map.any}`}>{label[val] || val}</span>;
                };

                const getSkinTypeBadge = (val: string) => {
                  const map: Record<string, string> = {
                    oily: adminTheme === 'light' ? 'text-teal-700 bg-teal-50 border-teal-100' : 'text-teal-400 bg-teal-950/20 border-teal-900/40',
                    dry: adminTheme === 'light' ? 'text-blue-700 bg-blue-50 border-blue-100' : 'text-blue-400 bg-blue-950/20 border-blue-900/40',
                    mixed: adminTheme === 'light' ? 'text-emerald-700 bg-emerald-50 border-emerald-100' : 'text-emerald-400 bg-emerald-950/20 border-emerald-900/40',
                    sensitive: adminTheme === 'light' ? 'text-pink-700 bg-pink-50 border-pink-100' : 'text-pink-400 bg-pink-950/20 border-pink-900/40',
                    any: adminTheme === 'light' ? 'text-slate-600 bg-slate-100 border-slate-200' : 'text-slate-400 bg-slate-800/45 border-slate-700/50'
                  };
                  const label: Record<string, string> = { oily: 'Peau Grasse', dry: 'Peau Sèche', mixed: 'Peau Mixte', sensitive: 'Peau Sensible', any: 'Tous Types Peau' };
                  return <span className={`px-2.5 py-0.5 rounded-full border text-[9px] uppercase font-black tracking-wider ${map[val] || map.any}`}>{label[val] || val}</span>;
                };

                const getSunExposureBadge = (val: string) => {
                  const map: Record<string, string> = {
                    intense: adminTheme === 'light' ? 'text-orange-700 bg-orange-50 border-orange-200' : 'text-orange-400 bg-orange-950/20 border-orange-900/45',
                    moderate: adminTheme === 'light' ? 'text-amber-600 bg-amber-50 border-amber-200/60' : 'text-amber-400 bg-amber-950/20 border-amber-900/30',
                    low: adminTheme === 'light' ? 'text-emerald-700 bg-emerald-50 border-emerald-100' : 'text-emerald-400 bg-emerald-950/20 border-emerald-900/40',
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
                          <p className={`text-[10px] ${adminTheme === 'light' ? 'text-slate-500' : 'text-slate-400'} font-light leading-relaxed max-w-xl`}>
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
                            ? 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-700'
                            : 'bg-slate-950 border-slate-800 hover:bg-slate-900 text-slate-300'
                        }`}
                      >
                        <Edit3 className="w-3.5 h-3.5 animate-pulse" /> Modifier
                      </button>
                      <button
                        onClick={() => setRuleToDelete(rule.id)}
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

      {/* -------------------- MODAL: SKIN DIAGNOSTIC VISUALIZER & HOTSPOTS -------------------- */}
      {selectedDiagnostic && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-40 select-none animate-in fade-in-50 duration-200">
          <div className={`border rounded-[32px] max-w-2xl w-full p-6 space-y-6 relative shadow-2xl overflow-hidden transition-all duration-200 ${
            adminTheme === 'light'
              ? 'bg-white border-slate-200 text-slate-800'
              : 'bg-slate-900 border-slate-800 text-slate-200'
          }`}>
            {/* Header */}
            <div className={`flex justify-between items-center border-b pb-4 ${
              adminTheme === 'light' ? 'border-slate-100' : 'border-slate-800'
            }`}>
              <div>
                <span className="text-[9px] font-mono text-emerald-400 uppercase font-black block tracking-wider bg-emerald-950/40 border border-emerald-900/30 rounded px-1.5 py-0.5 w-fit mb-1">
                  Analyse Diagnostique
                </span>
                <h3 className="text-md font-extrabold flex items-center gap-1.5 font-sans">
                  Profil Cutané & Diagnostic de Peau
                </h3>
              </div>
              <button 
                onClick={() => setSelectedDiagnostic(null)} 
                className={`transition-colors p-1.5 rounded-full border cursor-pointer ${
                  adminTheme === 'light' ? 'text-slate-400 hover:bg-slate-50 border-slate-200' : 'text-slate-400 hover:bg-slate-800 border-slate-800'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Split layout: Details & Face Hotspots */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              
              {/* Left Side: Attributes Info */}
              <div className="space-y-4 text-left">
                {/* Date */}
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Date du diagnostic</span>
                  <span className="text-xs font-mono font-extrabold block">
                    {selectedDiagnostic.date ? new Date(selectedDiagnostic.date).toLocaleString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : '—'}
                  </span>
                </div>

                {/* Skin Type Pill */}
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Type de Peau</span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase border tracking-wider ${
                    selectedDiagnostic.skinType === 'Gras'
                      ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-md shadow-amber-500/5'
                      : selectedDiagnostic.skinType === 'Sec'
                      ? 'bg-sky-500/10 text-sky-400 border-sky-500/20 shadow-md shadow-sky-500/5'
                      : selectedDiagnostic.skinType === 'Sensible'
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-md shadow-rose-500/5'
                      : selectedDiagnostic.skinType === 'Mixte'
                      ? 'bg-violet-500/10 text-violet-400 border-violet-500/20 shadow-md shadow-violet-500/5'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-md shadow-emerald-500/5'
                  }`}>
                    {selectedDiagnostic.skinType || 'Normal'}
                  </span>
                </div>

                {/* Concern Pill */}
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Préoccupation Ciblée</span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase border tracking-wider ${
                    selectedDiagnostic.concern === 'Acné' || selectedDiagnostic.concern === 'Imperfections'
                      ? 'bg-red-500/10 text-red-500 border-red-500/20'
                      : selectedDiagnostic.concern === 'Sécheresse'
                      ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                      : selectedDiagnostic.concern === 'Rides' || selectedDiagnostic.concern === 'Anti-âge'
                      ? 'bg-pink-500/10 text-pink-400 border-pink-500/20'
                      : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                  }`}>
                    {selectedDiagnostic.concern || 'Hydratation'}
                  </span>
                </div>

                {/* Sun Exposure */}
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Exposition Solaire</span>
                  <StatusBadge
                    status={selectedDiagnostic.sunExposure === 'Forte' ? 'error' : selectedDiagnostic.sunExposure === 'Moyenne' ? 'warning' : 'active'}
                    label={selectedDiagnostic.sunExposure}
                    theme={adminTheme}
                    size="sm"
                  />
                </div>

                {/* Customer Contact */}
                {selectedDiagnostic.phone && (
                  <div className="space-y-1 pt-2 border-t dark:border-slate-800">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Coordonnées Client</span>
                    <span className="text-xs font-mono font-bold block">{selectedDiagnostic.phone}</span>
                  </div>
                )}
              </div>

              {/* Right Side: Graphic Face Vector & Hotspots */}
              <div className="flex flex-col items-center justify-center p-4 bg-slate-950/20 rounded-3xl border dark:border-slate-800/60 relative overflow-hidden h-[240px]">
                {/* Stylized Face Outline */}
                <svg className="w-36 h-36 opacity-30 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.2">
                  {/* Head outline */}
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C7.5 2 4.5 5.5 4.5 10c0 4.5 3 8 7.5 11 4.5-3 7.5-6.5 7.5-11 0-4.5-3-8-7.5-8z" />
                  {/* Eyes */}
                  <circle cx="9" cy="9.5" r="0.8" fill="currentColor" />
                  <circle cx="15" cy="9.5" r="0.8" fill="currentColor" />
                  {/* Eyebrows */}
                  <path d="M7.5 8c.5-.5 1.5-.5 2 0M14.5 8c.5-.5 1.5-.5 2 0" strokeLinecap="round" />
                  {/* Nose */}
                  <path d="M12 9.5v2.5M11.5 12h1" strokeLinecap="round" />
                  {/* Mouth */}
                  <path d="M10 15c1 .5 3 .5 4 0" strokeLinecap="round" />
                </svg>

                {/* Glowing hotspots overlay based on skin concern */}
                {(selectedDiagnostic.concern === 'Acné' || selectedDiagnostic.concern === 'Imperfections') && (
                  <>
                    {/* Forehead Acne Spot */}
                    <div className="absolute top-[28%] left-[50%] -translate-x-1/2 w-4 h-4 rounded-full bg-red-500/25 animate-ping border border-red-500" />
                    <div className="absolute top-[30%] left-[50%] -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-red-500 border border-white" />
                    
                    {/* Left Cheek Acne Spot */}
                    <div className="absolute top-[48%] left-[40%] -translate-x-1/2 w-4 h-4 rounded-full bg-red-500/25 animate-ping border border-red-500" />
                    <div className="absolute top-[50%] left-[40%] -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-red-500 border border-white" />

                    {/* Right Cheek Acne Spot */}
                    <div className="absolute top-[48%] left-[60%] -translate-x-1/2 w-4 h-4 rounded-full bg-red-500/25 animate-ping border border-red-500" />
                    <div className="absolute top-[50%] left-[60%] -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-red-500 border border-white" />
                    
                    <span className="absolute bottom-3 text-[9px] font-black uppercase text-red-500 tracking-wider">
                      Hotspots Acné / Éruption active
                    </span>
                  </>
                )}

                {selectedDiagnostic.concern === 'Sécheresse' && (
                  <>
                    {/* Left Cheek Dryness zone */}
                    <div className="absolute top-[52%] left-[36%] w-6 h-6 rounded-full bg-cyan-500/10 border border-cyan-400/40 animate-pulse" />
                    {/* Right Cheek Dryness zone */}
                    <div className="absolute top-[52%] left-[58%] w-6 h-6 rounded-full bg-cyan-500/10 border border-cyan-400/40 animate-pulse" />
                    {/* Chin dry zone */}
                    <div className="absolute top-[72%] left-[47%] w-5 h-5 rounded-full bg-cyan-500/10 border border-cyan-400/40 animate-pulse" />
                    
                    <span className="absolute bottom-3 text-[9px] font-black uppercase text-cyan-400 tracking-wider">
                      Zones de Déshydratation / Sècheresse
                    </span>
                  </>
                )}

                {(selectedDiagnostic.concern === 'Rides' || selectedDiagnostic.concern === 'Anti-âge') && (
                  <>
                    {/* Forehead wrinkles lines */}
                    <div className="absolute top-[26%] left-[42%] w-10 h-0.5 bg-pink-500/50 rounded animate-pulse" />
                    <div className="absolute top-[31%] left-[40%] w-12 h-0.5 bg-pink-500/50 rounded animate-pulse" />
                    
                    {/* Crow's feet around eyes */}
                    <div className="absolute top-[42%] left-[33%] w-3 h-0.5 bg-pink-500/40 rotate-12" />
                    <div className="absolute top-[42%] left-[61%] w-3 h-0.5 bg-pink-500/40 -rotate-12" />

                    <span className="absolute bottom-3 text-[9px] font-black uppercase text-pink-400 tracking-wider">
                      Rides & Perte de Fermeté détectées
                    </span>
                  </>
                )}

                {selectedDiagnostic.concern !== 'Acné' && selectedDiagnostic.concern !== 'Imperfections' && selectedDiagnostic.concern !== 'Sécheresse' && selectedDiagnostic.concern !== 'Rides' && selectedDiagnostic.concern !== 'Anti-âge' && (
                  <>
                    {/* Hyperpigmentation/Teint hotspots */}
                    <div className="absolute top-[50%] left-[48%] w-2 h-2 rounded bg-amber-500/40 border border-white" />
                    <div className="absolute top-[48%] left-[42%] w-1.5 h-1.5 rounded bg-amber-500/40 border border-white" />
                    <div className="absolute top-[53%] left-[54%] w-1.5 h-1.5 rounded bg-amber-500/40 border border-white" />

                    <span className="absolute bottom-3 text-[9px] font-black uppercase text-amber-500 tracking-wider">
                      Pigmentation / Taches localisées
                    </span>
                  </>
                )}

                {/* Glowing T-zone outline if skin type is Oily/Gras */}
                {selectedDiagnostic.skinType === 'Gras' && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-[12px] h-[50px] bg-yellow-400/20 absolute top-[25%] left-[47%] blur-sm rounded animate-pulse" />
                    <div className="w-[60px] h-[12px] bg-yellow-400/20 absolute top-[24%] left-[38%] blur-sm rounded animate-pulse" />
                    <div className="absolute top-[18%] text-[8px] font-bold text-yellow-500 bg-slate-950 px-1 border border-yellow-500/35 rounded tracking-widest uppercase">T-Zone Grasse</div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end pt-4 border-t dark:border-slate-800">
              <button
                onClick={() => setSelectedDiagnostic(null)}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md shadow-emerald-500/10"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Full-Page Customer Profile (Shopify-style) ─────────────────── */}
      {selectedCustomer && (() => {
        const spend = selectedCustomer.totalSpend;
        let tier = 'Bronze';
        if (spend >= 1500) tier = 'Platinum';
        else if (spend >= 700) tier = 'Gold';
        else if (spend >= 300) tier = 'Silver';

        const tierMeta: Record<string, { ring: string; badge: string; emoji: string; accent: string }> = {
          Bronze:   { ring: 'from-amber-600  to-amber-400',   badge: adminTheme === 'light' ? 'bg-amber-50  border-amber-200  text-amber-700'  : 'bg-amber-950/30  border-amber-800/40  text-amber-400',  emoji: '🥉', accent: adminTheme === 'light' ? 'text-amber-600'  : 'text-amber-400'  },
          Silver:   { ring: 'from-slate-400  to-slate-300',   badge: adminTheme === 'light' ? 'bg-slate-100 border-slate-300  text-slate-600'  : 'bg-slate-800/40  border-slate-700     text-slate-300',  emoji: '🥈', accent: adminTheme === 'light' ? 'text-slate-500'  : 'text-slate-300'  },
          Gold:     { ring: 'from-yellow-500 to-amber-300',   badge: adminTheme === 'light' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 'bg-yellow-950/30 border-yellow-800/40 text-yellow-400', emoji: '🥇', accent: adminTheme === 'light' ? 'text-yellow-600' : 'text-yellow-400' },
          Platinum: { ring: 'from-violet-500 to-indigo-400',  badge: adminTheme === 'light' ? 'bg-violet-50 border-violet-200 text-violet-700' : 'bg-violet-950/30 border-violet-800/40 text-violet-400', emoji: '💎', accent: adminTheme === 'light' ? 'text-violet-600' : 'text-violet-400' },
        };
        const tm = tierMeta[tier];
        const initials = (selectedCustomer.name || '?').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
        const maxPts = 5000;
        const ptsPct = Math.min(100, Math.round((selectedCustomer.points / maxPts) * 100));
        const spendPct = Math.min(100, Math.round((spend / 1500) * 100));
        const circumference = 2 * Math.PI * 44;
        const dashOffset = circumference - (ptsPct / 100) * circumference;
        const avgOrderValue = selectedCustomer.orders.length > 0 ? (spend / selectedCustomer.orders.length).toFixed(0) : '0';
        const lastOrderDate = selectedCustomer.orders.length > 0
          ? new Date(selectedCustomer.orders[0].created_at || selectedCustomer.orders[0].date || Date.now()).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
          : '—';
        const waPhone = (selectedCustomer.phone || '').replace(/[^0-9]/g, '');
        const waMsg = encodeURIComponent(`Bonjour ${selectedCustomer.name}, nous vous remercions pour votre fidélité ! 💚`);
        const waSvg = <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>;

        return (
          <div
            className={`fixed inset-0 z-[200] overflow-y-auto ${adminTheme === 'light' ? 'bg-slate-50' : 'bg-[#090f1a]'}`}
          >
            {/* Sticky Top Bar */}
            <div className={`sticky top-0 z-10 flex items-center justify-between px-6 py-3.5 border-b ${
              adminTheme === 'light'
                ? 'bg-white/95 border-slate-200/80 shadow-[0_2px_16px_-4px_rgba(15,30,54,0.08)] backdrop-blur-xl'
                : 'bg-slate-950/95 border-white/[0.06] shadow-[0_4px_24px_rgba(0,0,0,0.5)] backdrop-blur-xl'
            }`}>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer hover:scale-[0.98] active:scale-[0.96] ${
                    adminTheme === 'light'
                      ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Retour Clients
                </button>
                <span className={`hidden sm:flex items-center gap-1.5 text-xs font-mono ${adminTheme === 'light' ? 'text-slate-400' : 'text-slate-600'}`}>
                  <span className={adminTheme === 'light' ? 'text-slate-300' : 'text-slate-700'}>/</span>
                  Clients
                  <span className={adminTheme === 'light' ? 'text-slate-300' : 'text-slate-700'}>/</span>
                  <span className={adminTheme === 'light' ? 'text-slate-700 font-bold' : 'text-slate-300 font-bold'}>{selectedCustomer.name}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const cleanName = (selectedCustomer.name || 'CLIENT').replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 10);
                    setPromoCustomCode(`SPECIAL-${cleanName}-${promoDiscountPct}`);
                    setIsPromoModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md transition cursor-pointer active:scale-[0.97]"
                >
                  <Ticket className="w-3.5 h-3.5" />
                  Code Promo
                </button>
                {waPhone && (
                  <a
                    href={`https://wa.me/${waPhone}?text=${waMsg}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="po-ui-button po-ui-button--primary po-ui-button--md flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_4px_12px_rgba(16,185,129,0.3)] transition cursor-pointer active:scale-[0.97]"
                  >
                    {waSvg}
                    WhatsApp
                  </a>
                )}
              </div>
            </div>

            {/* Page Content */}
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-7">

              {/* Hero Header */}
              <div className={`relative overflow-hidden rounded-3xl border p-7 md:p-10 ${
                adminTheme === 'light'
                  ? 'bg-white border-slate-200/80 shadow-[0_8px_32px_-8px_rgba(15,30,54,0.08)]'
                  : 'bg-slate-900/60 border-white/[0.06] shadow-[0_16px_48px_rgba(0,0,0,0.4)]'
              }`}>
                <div className={`absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl pointer-events-none ${
                  tier === 'Platinum' ? 'bg-violet-500/8' : tier === 'Gold' ? 'bg-yellow-500/8' : 'bg-amber-500/8'
                }`} />
                <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-7">
                  {/* Loyalty ring */}
                  <div className="relative shrink-0">
                    <svg width="108" height="108" viewBox="0 0 108 108">
                      <circle cx="54" cy="54" r="44" stroke={adminTheme === 'light' ? '#f1f5f9' : '#1e293b'} strokeWidth="7" fill="none" />
                      <circle
                        cx="54" cy="54" r="44"
                        stroke="url(#cpRing)"
                        strokeWidth="7"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={dashOffset}
                        transform="rotate(-90 54 54)"
                        style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.32,0.72,0,1)' }}
                      />
                      <defs>
                        <linearGradient id="cpRing" x1="0%" y1="0%" x2="100%" y2="0%">
                          {tier === 'Platinum' ? <><stop offset="0%" stopColor="#8b5cf6"/><stop offset="100%" stopColor="#6366f1"/></> :
                           tier === 'Gold'     ? <><stop offset="0%" stopColor="#eab308"/><stop offset="100%" stopColor="#f59e0b"/></> :
                           tier === 'Silver'   ? <><stop offset="0%" stopColor="#94a3b8"/><stop offset="100%" stopColor="#cbd5e1"/></> :
                                                 <><stop offset="0%" stopColor="#b45309"/><stop offset="100%" stopColor="#d97706"/></>}
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-2xl font-black ${adminTheme === 'light' ? 'text-slate-800' : 'text-white'}`}>{initials}</span>
                    </div>
                    <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap ${
                      adminTheme === 'light' ? 'bg-slate-900 text-white' : 'bg-white/90 text-slate-900'
                    }`}>{ptsPct}%</div>
                  </div>

                  {/* Name + meta */}
                  <div className="flex-1 min-w-0">
                  {(() => {
                    const hasAcc = selectedCustomer.orders?.some((o: any) => o.has_account || o.user_id || o.email);
                    const custEmail = selectedCustomer.orders?.find((o: any) => o.email)?.email;
                    return (
                      <div className="flex items-center gap-2 flex-wrap mb-3">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${tm.badge}`}>{tm.emoji} {tier}</span>
                        {hasAcc ? (
                          <span className="text-[9px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900/40 dark:text-emerald-400 flex items-center gap-1 font-bold">
                            👤 Compte Client Officiel {custEmail ? `(${custEmail})` : ''}
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 dark:bg-amber-950/30 dark:border-amber-900/40 dark:text-amber-400 flex items-center gap-1 font-bold">
                            🛍️ Profil Invité (Sans Compte)
                          </span>
                        )}
                        {(() => {
                          const custOrders = selectedCustomer.orders || [];
                          const totalOrd = custOrders.length;
                          const delivOrd = custOrders.filter((o: any) => (o.status || '').toLowerCase() === 'delivered').length;
                          const refOrd = custOrders.filter((o: any) => ['cancelled', 'returned', 'refused'].includes((o.status || '').toLowerCase())).length;
                          const confOrd = custOrders.filter((o: any) => ['confirmed', 'shipped', 'delivered'].includes((o.status || '').toLowerCase())).length;
                          const confRate = totalOrd > 0 ? Math.round((confOrd / totalOrd) * 100) : 100;
                          const delivRate = (delivOrd + refOrd) > 0 ? Math.round((delivOrd / (delivOrd + refOrd)) * 100) : 0;

                          return (
                            <span className="text-[9px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 dark:bg-slate-800/80 dark:border-slate-700 dark:text-slate-200 flex items-center gap-1 font-bold">
                              📦 Historique Livraisons: {delivOrd}/{totalOrd} Livrés {refOrd > 0 ? `· ${refOrd} Refusé(s)` : ''}
                            </span>
                          );
                        })()}
                      </div>
                    );
                  })()}
                    <h1 className={`text-3xl md:text-5xl font-black tracking-tight leading-none ${adminTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                      {selectedCustomer.name}
                    </h1>
                    {(() => {
                      const custCity = selectedCustomer.orders?.find((o: any) => o.city)?.city || null;
                      return (
                        <div className="flex items-center gap-2.5 mt-3 flex-wrap">
                          <span className={`text-sm font-mono font-bold ${adminTheme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                            {selectedCustomer.phone}
                          </span>
                          {custCity && (
                            <span className={`inline-flex items-center gap-1 text-xs font-bold font-mono px-2.5 py-0.5 rounded-full border ${
                              adminTheme === 'light'
                                ? 'bg-slate-100 border-slate-200 text-slate-700 shadow-2xs'
                                : 'bg-slate-800/80 border-slate-700 text-slate-200'
                            }`}>
                              📍 {custCity}
                            </span>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Points display */}
                  <div className="hidden lg:flex flex-col items-end shrink-0">
                    <span className={`text-[9px] font-bold uppercase tracking-widest mb-1 ${adminTheme === 'light' ? 'text-slate-400' : 'text-slate-600'}`}>Beauty Points</span>
                    <span className={`text-6xl font-black font-mono leading-none ${adminTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>{selectedCustomer.points}</span>
                    <span className={`text-xs font-bold mt-1 ${adminTheme === 'light' ? 'text-slate-400' : 'text-slate-600'}`}>sur 5 000 pts max</span>
                    <div className={`w-36 h-1.5 rounded-full overflow-hidden mt-2 ${adminTheme === 'light' ? 'bg-slate-100' : 'bg-slate-800'}`}>
                      <div className={`h-full rounded-full bg-gradient-to-r ${tm.ring}`} style={{ width: `${ptsPct}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Produits Préférés (Most Purchased Products Gallery) ── */}
              {(() => {
                const custOrders = selectedCustomer.orders || [];
                if (custOrders.length === 0) return null;

                const productMap: Record<string, {
                  id: number | string;
                  title: string;
                  image: string;
                  price: number;
                  totalUnits: number;
                  ordersCount: number;
                }> = {};

                const allCatalog = [...(products || []), ...PRODUCTS_DB];

                custOrders.forEach(ord => {
                  (ord.items || []).forEach(item => {
                    const key = (item.title || '').trim().toLowerCase() || String(item.id);
                    const matchingProd = allCatalog.find(
                      p => p.id === item.id ||
                      (p.title && item.title && p.title.toLowerCase() === item.title.toLowerCase()) ||
                      (p.name && item.title && p.name.toLowerCase() === item.title.toLowerCase()) ||
                      (p.title && item.title && item.title.toLowerCase().includes(p.title.toLowerCase()))
                    );
                    const itemImg = item.image || matchingProd?.image || (matchingProd as any)?.images?.[0] || 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=320&auto=format&fit=crop';
                    const itemPrice = item.price || matchingProd?.price || 0;
                    const qty = item.quantity || 1;

                    if (!productMap[key]) {
                      productMap[key] = {
                        id: item.id || matchingProd?.id || key,
                        title: item.title || matchingProd?.title || matchingProd?.name || 'Produit',
                        image: itemImg,
                        price: itemPrice,
                        totalUnits: 0,
                        ordersCount: 0
                      };
                    }
                    productMap[key].totalUnits += qty;
                    productMap[key].ordersCount += 1;
                  });
                });

                const topPurchasedProducts = Object.values(productMap).sort((a, b) => b.totalUnits - a.totalUnits);

                if (topPurchasedProducts.length === 0) return null;

                const cPhone = (selectedCustomer.phone || '').replace(/[^0-9]/g, '');

                return (
                  <div className={`rounded-3xl border p-6 md:p-7 space-y-5 ${
                    adminTheme === 'light'
                      ? 'bg-white border-slate-200/80 shadow-[0_8px_32px_-8px_rgba(15,30,54,0.06)]'
                      : 'bg-slate-900/60 border-white/[0.06] shadow-xl'
                  }`}>
                    {/* Header */}
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                          <ShoppingBag className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className={`text-base font-black tracking-tight ${adminTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                            Produits les plus achetés ({topPurchasedProducts.length})
                          </h3>
                          <span className={`text-[10px] font-mono block ${adminTheme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
                            Historique des soins favoris et fréquence d&apos;achat du client
                          </span>
                        </div>
                      </div>

                      <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full ${
                        adminTheme === 'light' ? 'bg-amber-50 border border-amber-200 text-amber-700' : 'bg-amber-950/30 border border-amber-900/30 text-amber-400'
                      }`}>
                        {topPurchasedProducts.reduce((sum, p) => sum + p.totalUnits, 0)} articles cumulés
                      </span>
                    </div>

                    {/* Grid of Top Purchased Products */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {topPurchasedProducts.slice(0, 6).map((prod, idx) => {
                        const restockMsg = encodeURIComponent(`Bonjour ${selectedCustomer.name}, souhaitez-vous réapprovisionner votre soin habituel "${prod.title}" (${prod.price.toFixed(0)} DH) ? Vous pouvez commander en 1 clic ici : https://paraofficinal.ma`);
                        return (
                          <div key={idx} className={`group relative rounded-2xl border p-4 flex items-center gap-4 transition-all duration-200 hover:scale-[1.01] ${
                            adminTheme === 'light'
                              ? 'bg-slate-50/60 border-slate-200/80 hover:bg-white hover:border-amber-300 hover:shadow-md'
                              : 'bg-slate-950/50 border-slate-800 hover:border-amber-500/30'
                          }`}>
                            {/* Product Thumbnail with Frequency Badge */}
                            <div className="relative shrink-0">
                              <img
                                src={prod.image}
                                alt={prod.title}
                                className="w-14 h-14 rounded-2xl object-cover border border-slate-200/70 dark:border-slate-800"
                              />
                              <span className="absolute -top-1.5 -right-1.5 text-[9.5px] font-mono font-black bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded-full shadow-md">
                                ×{prod.totalUnits}
                              </span>
                            </div>

                            {/* Title & Stats */}
                            <div className="flex-1 min-w-0">
                              <h4 className={`text-xs font-black truncate leading-snug ${adminTheme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                                {prod.title}
                              </h4>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span className={`text-[11px] font-mono font-black ${adminTheme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>
                                  {prod.price.toFixed(0)} DH
                                </span>
                                <span className="text-[9px] font-mono text-slate-400">
                                  · {prod.ordersCount} commande{prod.ordersCount > 1 ? 's' : ''}
                                </span>
                              </div>

                              {/* 1-Click WhatsApp Restock CTA */}
                              {cPhone && (
                                <a
                                  href={`https://wa.me/${cPhone}?text=${restockMsg}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[9.5px] font-extrabold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 mt-2 hover:underline cursor-pointer"
                                >
                                  💬 Relance Réassort WhatsApp →
                                </a>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* ── Intelligence Fréquence d'Achat & Prédiction LTV ── */}
              {(() => {
                const custOrders = selectedCustomer.orders || [];
                if (custOrders.length === 0) return null;

                const sortedOrders = [...custOrders].sort((a, b) => {
                  const tA = new Date(a.created_at || a.date || Date.now()).getTime();
                  const tB = new Date(b.created_at || b.date || Date.now()).getTime();
                  return tA - tB;
                });

                const firstOrderDate = new Date(sortedOrders[0].created_at || sortedOrders[0].date || Date.now());
                const latestOrderDate = new Date(sortedOrders[sortedOrders.length - 1].created_at || sortedOrders[sortedOrders.length - 1].date || Date.now());
                const nowTime = Date.now();

                const daysSinceLastOrder = Math.max(0, Math.floor((nowTime - latestOrderDate.getTime()) / (1000 * 60 * 60 * 24)));

                let avgIntervalDays = 45;
                if (sortedOrders.length >= 2) {
                  const diffs: number[] = [];
                  for (let i = 1; i < sortedOrders.length; i++) {
                    const prevT = new Date(sortedOrders[i - 1].created_at || sortedOrders[i - 1].date || Date.now()).getTime();
                    const currT = new Date(sortedOrders[i].created_at || sortedOrders[i].date || Date.now()).getTime();
                    const dDays = Math.max(1, Math.floor((currT - prevT) / (1000 * 60 * 60 * 24)));
                    diffs.push(dDays);
                  }
                  avgIntervalDays = Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length);
                }

                const daysUntilNextOrder = avgIntervalDays - daysSinceLastOrder;
                const nextOrderEstDate = new Date(latestOrderDate.getTime() + avgIntervalDays * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

                let statusBadge = {
                  label: `Réassort probable dans ${daysUntilNextOrder} jours`,
                  subText: `Prochain réassort estimé le ${nextOrderEstDate}`,
                  bg: adminTheme === 'light' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-emerald-950/30 border-emerald-900/40 text-emerald-400',
                  dot: 'bg-emerald-500',
                  riskLevel: 'Faible (Client Actif)',
                  riskBadge: adminTheme === 'light' ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-900/50 text-emerald-300',
                  isOverdue: false,
                  isUrgent: false
                };

                if (daysUntilNextOrder <= 0 && Math.abs(daysUntilNextOrder) <= 15) {
                  const overdueDays = Math.abs(daysUntilNextOrder);
                  statusBadge = {
                    label: `⚠️ Réassort en retard (${overdueDays} jours de décalage)`,
                    subText: `Dépassement du cycle moyen de ${avgIntervalDays} jours`,
                    bg: adminTheme === 'light' ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-amber-950/30 border-amber-900/40 text-amber-400',
                    dot: 'bg-amber-500',
                    riskLevel: 'Modéré (Relance recommandée)',
                    riskBadge: adminTheme === 'light' ? 'bg-amber-100 text-amber-800' : 'bg-amber-900/50 text-amber-300',
                    isOverdue: true,
                    isUrgent: false
                  };
                } else if (daysUntilNextOrder <= 0 && Math.abs(daysUntilNextOrder) > 15) {
                  const overdueDays = Math.abs(daysUntilNextOrder);
                  statusBadge = {
                    label: `🚨 Risque d'Inactivité (${daysSinceLastOrder} jours sans commande)`,
                    subText: `Inactif depuis +${overdueDays} jours par rapport au rythme habituel`,
                    bg: adminTheme === 'light' ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-rose-950/30 border-rose-900/40 text-rose-400',
                    dot: 'bg-rose-500',
                    riskLevel: 'Élevé (Offre de rétention nécessaire)',
                    riskBadge: adminTheme === 'light' ? 'bg-rose-100 text-rose-800' : 'bg-rose-900/50 text-rose-300',
                    isOverdue: true,
                    isUrgent: true
                  };
                }

                const daysSinceFirstOrder = Math.max(1, Math.floor((nowTime - firstOrderDate.getTime()) / (1000 * 60 * 60 * 24)));
                const dailySpendRate = spend / daysSinceFirstOrder;
                const predictedAnnualSpend = (dailySpendRate * 365).toFixed(0);
                const predicted3YearLTV = (dailySpendRate * 365 * 3).toFixed(0);

                const cPhone = (selectedCustomer.phone || '').replace(/[^0-9]/g, '');

                return (
                  <div className={`rounded-3xl border p-6 md:p-7 space-y-6 ${
                    adminTheme === 'light'
                      ? 'bg-white border-slate-200/80 shadow-[0_8px_32px_-8px_rgba(15,30,54,0.06)]'
                      : 'bg-slate-900/60 border-white/[0.06] shadow-xl'
                  }`}>
                    {/* Header */}
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500">
                          <Activity className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className={`text-base font-black tracking-tight ${adminTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                            Intelligence Fréquence & Prédiction LTV
                          </h3>
                          <span className={`text-[10px] font-mono block ${adminTheme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
                            Analyse algorithmique du comportement d&apos;achat client
                          </span>
                        </div>
                      </div>

                      <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border ${statusBadge.riskBadge}`}>
                        Risque: {statusBadge.riskLevel}
                      </span>
                    </div>

                    {/* Main Alert Status Banner */}
                    <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${statusBadge.bg}`}>
                      <div className="flex items-center gap-3">
                        <span className={`w-3 h-3 rounded-full shrink-0 ${statusBadge.dot} animate-pulse`} />
                        <div>
                          <h4 className="text-xs font-black uppercase tracking-wider">{statusBadge.label}</h4>
                          <p className="text-[11px] font-mono mt-0.5 opacity-80">{statusBadge.subText}</p>
                        </div>
                      </div>

                      {statusBadge.isOverdue && cPhone && (
                        <a
                          href={`https://wa.me/${cPhone}?text=${encodeURIComponent(`Bonjour ${selectedCustomer.name}, votre rituel de soin Para Officinal touche probablement à sa fin ! Profitez de -10% sur votre réassort aujourd'hui avec le code REASSORT10 : https://paraofficinal.ma`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="po-ui-button po-ui-button--primary po-ui-button--md flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md transition active:scale-95 cursor-pointer shrink-0"
                        >
                          💬 Envoyer Relance WhatsApp (-10%)
                        </a>
                      )}
                    </div>

                    {/* 4 Metric Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                      {/* Intervalle Moyen */}
                      <div className={`p-4 rounded-2xl border ${adminTheme === 'light' ? 'bg-slate-50/70 border-slate-200/80' : 'bg-slate-950/50 border-slate-800'}`}>
                        <span className="text-[9px] font-extrabold uppercase tracking-widest block text-slate-400 mb-1">Cycle d&apos;Achat Moyen</span>
                        <span className={`text-lg font-black font-mono block ${adminTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                          Tous les {avgIntervalDays} jours
                        </span>
                        <span className="text-[9px] font-mono text-slate-400 block mt-0.5">Basé sur {custOrders.length} commande{custOrders.length > 1 ? 's' : ''}</span>
                      </div>

                      {/* Temps Écoulé */}
                      <div className={`p-4 rounded-2xl border ${adminTheme === 'light' ? 'bg-slate-50/70 border-slate-200/80' : 'bg-slate-950/50 border-slate-800'}`}>
                        <span className="text-[9px] font-extrabold uppercase tracking-widest block text-slate-400 mb-1">Dernière Commande</span>
                        <span className={`text-lg font-black font-mono block ${adminTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                          Il y a {daysSinceLastOrder} jours
                        </span>
                        <span className="text-[9px] font-mono text-slate-400 block mt-0.5">Date: {new Date(latestOrderDate).toLocaleDateString('fr-FR')}</span>
                      </div>

                      {/* LTV Annuelle Estimée */}
                      <div className={`p-4 rounded-2xl border ${adminTheme === 'light' ? 'bg-slate-50/70 border-slate-200/80' : 'bg-slate-950/50 border-slate-800'}`}>
                        <span className="text-[9px] font-extrabold uppercase tracking-widest block text-slate-400 mb-1">CA Annuel Prédictif</span>
                        <span className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400 block">
                          ~{predictedAnnualSpend} DH / an
                        </span>
                        <span className="text-[9px] font-mono text-slate-400 block mt-0.5">Basé sur la récurrence actuelle</span>
                      </div>

                      {/* LTV 3 Ans (Valeur Totale) */}
                      <div className={`p-4 rounded-2xl border ${adminTheme === 'light' ? 'bg-slate-50/70 border-slate-200/80' : 'bg-slate-950/50 border-slate-800'}`}>
                        <span className="text-[9px] font-extrabold uppercase tracking-widest block text-slate-400 mb-1">Valeur LTV 3 Ans</span>
                        <span className="text-lg font-black font-mono text-violet-600 dark:text-violet-400 block">
                          ~{predicted3YearLTV} DH
                        </span>
                        <span className="text-[9px] font-mono text-slate-400 block mt-0.5">Potentiel total estimé</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* ── CARD: K-BEAUTY SAMPLES & FREE GIFT LOG ── */}
              {(() => {
                const samplesList = (customerSamples[selectedCustomer.phone] || []) as {
                  id: string;
                  sampleName: string;
                  category: string;
                  dateSent: string;
                }[];

                return (
                  <div className={`p-6 rounded-3xl border ${
                    adminTheme === 'light' ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-900/60 border-white/[0.06]'
                  }`}>
                    <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-pink-500/10 text-pink-500 border border-pink-500/20">
                          <Gift className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className={`text-base font-black uppercase tracking-wider ${adminTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                            🎁 Historique des Échantillons K-Beauty Offerts
                          </h3>
                          <p className={`text-xs font-mono ${adminTheme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                            Suivi des échantillons et cadeaux distribués pour éviter les doublons et stimuler les ventes
                          </p>
                        </div>
                      </div>

                      <span className="text-xs font-mono font-black uppercase tracking-wider px-3 py-1 rounded-full bg-pink-500/10 text-pink-500 border border-pink-500/30">
                        {samplesList.length} échantillon{samplesList.length > 1 ? 's' : ''} offert{samplesList.length > 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="space-y-2 mb-5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        + Logger un Échantillon Rapide (K-Beauty Best-Sellers):
                      </span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {[
                          'Anua Heartleaf Serum 10ml',
                          'Beauty of Joseon Sun Relief 10ml',
                          'COSRX Snail Mucin 20ml',
                          'Skin1004 Centella Ampoule 10ml',
                          'Round Lab Birch Juice 10ml',
                          'Mixsoon Bean Essence 5ml'
                        ].map(preset => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => handleAddSample(selectedCustomer.phone, preset, 'Sérum / Solaire')}
                            className={`px-2.5 py-1 rounded-full text-[9.5px] font-mono font-bold border transition cursor-pointer active:scale-95 ${
                              adminTheme === 'light'
                                ? 'bg-pink-50 border-pink-200 text-pink-700 hover:bg-pink-100'
                                : 'bg-pink-950/40 border-pink-900/40 text-pink-300 hover:bg-pink-900/50'
                            }`}
                          >
                            + {preset}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 mb-5 flex-wrap sm:flex-nowrap">
                      <input
                        type="text"
                        placeholder="Entrer le nom du produit offert (ex: Garnier Vitamin C Serum 5ml...)"
                        value={newSampleName}
                        onChange={e => setNewSampleName(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleAddSample(selectedCustomer.phone, newSampleName, newSampleCategory);
                        }}
                        className={`flex-1 text-xs rounded-xl px-3.5 py-2.5 border outline-none transition min-w-[200px] ${
                          adminTheme === 'light'
                            ? 'bg-white border-slate-200 text-slate-800 focus:border-pink-500 shadow-2xs'
                            : 'bg-slate-950 border-slate-800 text-slate-100 focus:border-pink-500'
                        }`}
                      />
                      <select
                        value={newSampleCategory}
                        onChange={e => setNewSampleCategory(e.target.value)}
                        className={`text-xs rounded-xl px-3 py-2.5 border outline-none font-mono ${
                          adminTheme === 'light' ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-200'
                        }`}
                      >
                        <option value="Sérum / Essence">Sérum / Essence</option>
                        <option value="Protection Solaire">Protection Solaire</option>
                        <option value="Nettoyant / Huile">Nettoyant / Huile</option>
                        <option value="Hydratant / Crème">Hydratant / Crème</option>
                        <option value="Masque / Tonique">Masque / Tonique</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => handleAddSample(selectedCustomer.phone, newSampleName, newSampleCategory)}
                        className="px-4 py-2.5 rounded-xl text-xs font-black bg-pink-500 hover:bg-pink-400 text-white shadow-md transition cursor-pointer active:scale-95 whitespace-nowrap"
                      >
                        + Logger Échantillon
                      </button>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Journal des Échantillons Déjà Envoyés
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {samplesList.map(item => (
                          <div key={item.id} className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition ${
                            adminTheme === 'light' ? 'bg-pink-50/40 border-pink-200/60' : 'bg-pink-950/20 border-pink-900/30'
                          }`}>
                            <div className="space-y-0.5 min-w-0">
                              <span className="text-[9px] font-bold uppercase font-mono text-pink-600 dark:text-pink-400 block">
                                🌸 {item.category}
                              </span>
                              <h5 className={`text-xs font-black truncate ${adminTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                                {item.sampleName}
                              </h5>
                              <span className="text-[9px] font-mono text-slate-400 block">
                                Envoyé le {item.dateSent}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteSample(selectedCustomer.phone, item.id)}
                              className="text-slate-400 hover:text-red-500 text-xs transition cursor-pointer p-1 shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                      {samplesList.length === 0 && (
                        <span className="text-xs font-mono text-slate-400 italic block pt-1">
                          Aucun échantillon encore enregistré pour ce client. Offrez-lui son premier échantillon K-Beauty !
                        </span>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* ── CARD: MOROCCAN COD DELIVERY HEALTH & RELIABILITY ── */}
              {(() => {
                const custOrders = selectedCustomer.orders || [];
                const totalOrd = custOrders.length;
                const delivOrd = custOrders.filter((o: any) => (o.status || '').toLowerCase() === 'delivered').length;
                const refOrd = custOrders.filter((o: any) => ['cancelled', 'returned', 'refused'].includes((o.status || '').toLowerCase())).length;
                const confOrd = custOrders.filter((o: any) => ['confirmed', 'shipped', 'delivered'].includes((o.status || '').toLowerCase())).length;
                const pendingOrd = custOrders.filter((o: any) => (o.status || '').toLowerCase() === 'pending').length;

                const confRate = totalOrd > 0 ? Math.round((confOrd / totalOrd) * 100) : 100;
                const delivRate = (delivOrd + refOrd) > 0 ? Math.round((delivOrd / (delivOrd + refOrd)) * 100) : 0;

                const isHighRisk = refOrd > 0;
                const isModerateRisk = !isHighRisk && pendingOrd >= 2 && delivOrd === 0;

                return (
                  <div className={`p-6 rounded-3xl border ${
                    adminTheme === 'light' ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-900/60 border-white/[0.06]'
                  }`}>
                    <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-2xl border ${
                          isHighRisk
                            ? 'bg-red-500/10 text-red-500 border-red-500/20'
                            : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                        }`}>
                          <Truck className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className={`text-base font-black uppercase tracking-wider ${adminTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                            🛡️ Statut & Historique des Expéditions COD
                          </h3>
                          <p className={`text-xs font-mono ${adminTheme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                            Analyse du taux d&apos;acceptation et de confirmation des colis expédiés en Cash on Delivery
                          </p>
                        </div>
                      </div>

                      <span className={`text-xs font-mono font-black uppercase tracking-wider px-3 py-1 rounded-full border ${
                        isHighRisk
                          ? 'bg-red-500/10 text-red-500 border-red-500/30'
                          : isModerateRisk
                          ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                          : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                      }`}>
                        {refOrd > 0 ? '⚠️ Historique: Refus Colis' : '📦 Historique Livraisons'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                      <div className={`p-4 rounded-2xl border ${adminTheme === 'light' ? 'bg-slate-50/70 border-slate-200/80' : 'bg-slate-950/50 border-slate-800'}`}>
                        <span className="text-[9px] font-extrabold uppercase tracking-widest block text-slate-400 mb-1">Taux de Livraison Réussie</span>
                        <span className={`text-2xl font-black font-mono block ${isHighRisk ? 'text-red-500' : delivOrd > 0 ? 'text-emerald-500' : 'text-slate-400'}`}>
                          {delivRate}%
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 block mt-1">
                          {delivOrd} livrée{delivOrd > 1 ? 's' : ''} · {refOrd} refusée{refOrd > 1 ? 's' : ''} / annulée{refOrd > 1 ? 's' : ''}
                        </span>
                      </div>

                      <div className={`p-4 rounded-2xl border ${adminTheme === 'light' ? 'bg-slate-50/70 border-slate-200/80' : 'bg-slate-950/50 border-slate-800'}`}>
                        <span className="text-[9px] font-extrabold uppercase tracking-widest block text-slate-400 mb-1">Confirmation Téléphone</span>
                        <span className="text-2xl font-black font-mono text-blue-500 block">
                          {confRate}%
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 block mt-1">
                          {confOrd} confirmée{confOrd > 1 ? 's' : ''} sur {totalOrd} commande{totalOrd > 1 ? 's' : ''}
                        </span>
                      </div>

                      <div className={`p-4 rounded-2xl border ${adminTheme === 'light' ? 'bg-slate-50/70 border-slate-200/80' : 'bg-slate-950/50 border-slate-800'}`}>
                        <span className="text-[9px] font-extrabold uppercase tracking-widest block text-slate-400 mb-1">Historique Expéditions</span>
                        <span className={`text-2xl font-black font-mono block ${adminTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                          {totalOrd} Colis
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 block mt-1">
                          {pendingOrd} en cours de préparation
                        </span>
                      </div>
                    </div>

                    {isHighRisk ? (
                      <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-between gap-4 flex-wrap">
                        <div className="space-y-1">
                          <span className="text-xs font-black uppercase tracking-wider block">
                            🚨 Attention: Ce client a au moins {refOrd} commande(s) annulée(s) ou refusée(s)
                          </span>
                          <p className="text-[11px] font-mono">
                            Recommandation: Demandez un acompte de livraison par virement/WhatsApp avant d&apos;expédier le colis.
                          </p>
                        </div>
                        {waPhone && (
                          <a
                            href={`https://wa.me/${waPhone}?text=${encodeURIComponent(`Bonjour ${selectedCustomer.name}, nous préparons votre commande. Merci de confirmer votre disponibilité pour la livraison Cash on Delivery.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-2 rounded-xl text-xs font-black bg-red-500 hover:bg-red-400 text-white shadow-md transition cursor-pointer active:scale-95 whitespace-nowrap"
                          >
                            💬 Demander Confirmation WhatsApp
                          </a>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-between gap-4 flex-wrap">
                        <div className="space-y-1">
                          <span className="text-xs font-black uppercase tracking-wider block">
                            📦 Historique des Livraisons
                          </span>
                          <p className="text-[11px] font-mono">
                            Aucun refus de colis enregistré dans l&apos;historique des commandes.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* ── CARD: ETIQUETTES & NOTES PRIVÉES ADMIN ── */}
              <div className={`p-6 rounded-3xl border ${
                adminTheme === 'light' ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-900/60 border-white/[0.06]'
              }`}>
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      <Ticket className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className={`text-base font-black uppercase tracking-wider ${adminTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                        🏷️ Étiquettes & Notes Privées Admin
                      </h3>
                      <p className={`text-xs font-mono ${adminTheme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                        Journal opérationnel et tags réservés à l&apos;équipe d&apos;administration
                      </p>
                    </div>
                  </div>
                </div>

                {/* Active Tags */}
                <div className="space-y-2 mb-6">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Étiquettes Clients</span>
                  <div className="flex flex-wrap items-center gap-2">
                    {((customerTags[selectedCustomer.phone] || []) as string[]).map(t => (
                      <span key={t} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border ${getTagBadgeStyle(t, adminTheme)}`}>
                        🏷️ {t}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(selectedCustomer.phone, t)}
                          className="hover:text-red-500 ml-0.5 transition cursor-pointer font-extrabold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    {(customerTags[selectedCustomer.phone] || []).length === 0 && (
                      <span className="text-xs font-mono text-slate-400 italic">Aucune étiquette assignée</span>
                    )}
                  </div>

                  {/* Quick Add Tag Presets */}
                  <div className="pt-2 flex flex-wrap items-center gap-1.5">
                    <span className="text-[9px] font-mono text-slate-400 font-bold uppercase mr-1">+ Ajouter rapide:</span>
                    {['VIP-KBeauty', 'Sensible-Allergique', 'Acheteuse-Solaire', 'Livreur-Préféré-Amana', 'Réassort-Fréquent', 'Client-Fidèle'].map(preset => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handleAddTag(selectedCustomer.phone, preset)}
                        className={`px-2.5 py-1 rounded-full text-[9.5px] font-mono font-bold border transition cursor-pointer active:scale-95 ${
                          adminTheme === 'light'
                            ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                            : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                        }`}
                      >
                        + {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Private Notes Ledger */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Notes Privées (Journal Opérationnel)</span>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ajouter une note privée (ex: Préfère livraison matin à Casablanca, offrir échantillon Solaire...)"
                      value={newNoteText}
                      onChange={e => setNewNoteText(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleAddNote(selectedCustomer.phone, newNoteText);
                      }}
                      className={`flex-1 text-xs rounded-xl px-3.5 py-2.5 border outline-none transition ${
                        adminTheme === 'light'
                          ? 'bg-white border-slate-200 text-slate-800 focus:border-amber-500 shadow-2xs'
                          : 'bg-slate-950 border-slate-800 text-slate-100 focus:border-amber-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => handleAddNote(selectedCustomer.phone, newNoteText)}
                      className="px-4 py-2.5 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition cursor-pointer active:scale-95 whitespace-nowrap"
                    >
                      + Note Privée
                    </button>
                  </div>

                  {/* Notes List */}
                  <div className="space-y-2 pt-2">
                    {((customerNotes[selectedCustomer.phone] || []) as { id: string; text: string; date: string; author: string }[]).map(note => (
                      <div key={note.id} className={`p-3.5 rounded-2xl border flex items-start justify-between gap-3 transition ${
                        adminTheme === 'light' ? 'bg-amber-50/40 border-amber-200/60' : 'bg-amber-950/20 border-amber-900/30'
                      }`}>
                        <div className="space-y-1 min-w-0">
                          <p className={`text-xs font-medium ${adminTheme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>
                            📝 {note.text}
                          </p>
                          <span className="text-[9px] font-mono text-slate-400 block">
                            Par {note.author} · {note.date}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteNote(selectedCustomer.phone, note.id)}
                          className="text-slate-400 hover:text-red-500 text-xs transition cursor-pointer p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    {(customerNotes[selectedCustomer.phone] || []).length === 0 && (
                      <span className="text-xs font-mono text-slate-400 italic block">Aucune note privée enregistrée pour ce client</span>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Profil Dermo-Cosmétique & Routine Sur Mesure ── */}
              {(() => {
                const cPhone = (selectedCustomer.phone || '').replace(/[^0-9]/g, '');
                const foundDiag = (diagnosticsList || []).find((d: any) => {
                  const dP = (d.phone || d.phone_number || '').replace(/[^0-9]/g, '');
                  return (dP && dP === cPhone) ||
                         (d.customerName && d.customerName.toLowerCase().trim() === selectedCustomer.name.toLowerCase().trim());
                }) || selectedCustomer.orders?.find((o: any) => o.skin_diagnostic)?.skin_diagnostic;

                const skinTypeLabels: Record<string, { label: string; bg: string; text: string; icon: string }> = {
                  oily:      { label: 'Peau Grasse', bg: 'bg-teal-50 border-teal-200 dark:bg-teal-950/30 dark:border-teal-900/30', text: 'text-teal-700 dark:text-teal-400', icon: '💧' },
                  dry:       { label: 'Peau Sèche', bg: 'bg-sky-50 border-sky-200 dark:bg-sky-950/30 dark:border-sky-900/30', text: 'text-sky-700 dark:text-sky-400', icon: '🌾' },
                  mixed:     { label: 'Peau Mixte', bg: 'bg-violet-50 border-violet-200 dark:bg-violet-950/30 dark:border-violet-900/30', text: 'text-violet-700 dark:text-violet-400', icon: '⚖️' },
                  sensitive: { label: 'Peau Sensible', bg: 'bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-900/30', text: 'text-rose-700 dark:text-rose-400', icon: '🌸' },
                  normal:    { label: 'Peau Normale', bg: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', icon: '✨' },
                };

                const concernLabels: Record<string, string> = {
                  acne: 'Acné & Imperfections',
                  spots: 'Taches Brunes / Hyperpigmentation',
                  wrinkles: 'Rides & Relâchement (Anti-âge)',
                  dryness: 'Sécheresse & Déshydratation',
                  redness: 'Rougeurs & Irritations',
                };

                const sunLabels: Record<string, string> = {
                  intense: 'Intense ☀️',
                  moderate: 'Modérée 🌤️',
                  low: 'Faible ☁️',
                };

                const rawSkin = (foundDiag?.skinType || (foundDiag as any)?.skin_type || '').toLowerCase();
                const rawConcern = (foundDiag?.concern || (foundDiag as any)?.primaryConcern || '').toLowerCase();
                const rawSun = (foundDiag?.sunExposure || (foundDiag as any)?.sun_exposure || '').toLowerCase();

                const stMeta = skinTypeLabels[rawSkin] || { label: foundDiag?.skinType || 'Non spécifié', bg: 'bg-slate-100 border-slate-200 dark:bg-slate-800 dark:border-slate-700', text: 'text-slate-700 dark:text-slate-300', icon: '🧴' };
                const concernMeta = concernLabels[rawConcern] || foundDiag?.concern || 'Non spécifiée';
                const sunMeta = sunLabels[rawSun] || foundDiag?.sunExposure || 'Modérée';

                const matchingRules = (settings?.diagnosticRules || []).filter((r: any) => {
                  const mSkin = r.skinType === 'any' || r.skinType === rawSkin;
                  const mConcern = r.concern === 'any' || r.concern === rawConcern;
                  const mSun = r.sunExposure === 'any' || r.sunExposure === rawSun;
                  return mSkin && mConcern && mSun;
                });

                const recommendedPids = Array.from(new Set(matchingRules.flatMap((r: any) => r.productIds || [])));
                const allCatalog = [...(products || []), ...PRODUCTS_DB];
                const routineProducts = recommendedPids.map(pid => allCatalog.find(p => p.id === pid)).filter(Boolean);

                const diagDate = foundDiag?.date ? new Date(foundDiag.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : null;

                return (
                  <div className={`rounded-3xl border p-6 md:p-7 space-y-6 ${
                    adminTheme === 'light'
                      ? 'bg-gradient-to-br from-white via-slate-50/50 to-emerald-50/20 border-slate-200/80 shadow-[0_8px_32px_-8px_rgba(15,30,54,0.06)]'
                      : 'bg-gradient-to-br from-slate-900/80 via-slate-900/40 to-emerald-950/20 border-white/[0.06] shadow-xl'
                  }`}>
                    {/* Header */}
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                          <Sliders className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className={`text-base font-black tracking-tight ${adminTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                            Profil Dermo-Cosmétique
                          </h3>
                          <span className={`text-[10px] font-mono block ${adminTheme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
                            {foundDiag ? `Diagnostic réalisé ${diagDate ? `le ${diagDate}` : 'en ligne'}` : 'Évaluation personnalisée de la peau'}
                          </span>
                        </div>
                      </div>

                      {foundDiag ? (
                        <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900/40 dark:text-emerald-400">
                          ✓ Diagnostic Complété
                        </span>
                      ) : (
                        <a
                          href={`https://wa.me/${cPhone}?text=${encodeURIComponent(`Bonjour ${selectedCustomer.name}, effectuez gratuitement votre diagnostic peau personnalisé ici : https://paraofficinal.ma/skin-diagnostic`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="po-ui-button po-ui-button--primary po-ui-button--md flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_4px_12px_rgba(16,185,129,0.25)] transition active:scale-95 cursor-pointer"
                        >
                          💬 Envoyer test diagnostic via WhatsApp
                        </a>
                      )}
                    </div>

                    {foundDiag ? (
                      <div className="space-y-6">
                        {/* Diagnostic Snapshot Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                          {/* Skin Type */}
                          <div className={`p-4 rounded-2xl border ${stMeta.bg}`}>
                            <span className="text-[9px] font-extrabold uppercase tracking-widest block text-slate-400 mb-1">Type de Peau</span>
                            <span className={`text-sm font-black flex items-center gap-1.5 ${stMeta.text}`}>
                              <span>{stMeta.icon}</span> {stMeta.label}
                            </span>
                          </div>

                          {/* Concern */}
                          <div className={`p-4 rounded-2xl border ${adminTheme === 'light' ? 'bg-white border-slate-200/80' : 'bg-slate-950/50 border-slate-800'}`}>
                            <span className="text-[9px] font-extrabold uppercase tracking-widest block text-slate-400 mb-1">Préoccupation Majeure</span>
                            <span className={`text-sm font-black block truncate ${adminTheme === 'light' ? 'text-slate-800' : 'text-slate-100'}`}>
                              🎯 {concernMeta}
                            </span>
                          </div>

                          {/* UV Exposure */}
                          <div className={`p-4 rounded-2xl border ${adminTheme === 'light' ? 'bg-white border-slate-200/80' : 'bg-slate-950/50 border-slate-800'}`}>
                            <span className="text-[9px] font-extrabold uppercase tracking-widest block text-slate-400 mb-1">Exposition UV</span>
                            <span className={`text-sm font-black block ${adminTheme === 'light' ? 'text-slate-800' : 'text-slate-100'}`}>
                              {sunMeta}
                            </span>
                          </div>
                        </div>

                        {/* Routine Sur Mesure Recommandée */}
                        {routineProducts.length > 0 && (
                          <div className="space-y-3 pt-2">
                            <div className="flex items-center justify-between">
                              <h4 className={`text-xs font-black uppercase tracking-wider ${adminTheme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                                ✨ Rituel Sur Mesure Recommandé ({routineProducts.length} soins)
                              </h4>
                              {cPhone && (
                                <a
                                  href={`https://wa.me/${cPhone}?text=${encodeURIComponent(`Bonjour ${selectedCustomer.name}, voici votre rituel de soin sur mesure Para Officinal recommandé par nos experts : ${routineProducts.map((p: any) => p.title || p.name).join(', ')}.`)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] font-bold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 underline cursor-pointer"
                                >
                                  Envoyer le rituel sur WhatsApp →
                                </a>
                              )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                              {routineProducts.slice(0, 6).map((prod: any, idx: number) => (
                                <div key={idx} className={`p-3 rounded-2xl border flex items-center gap-3 transition hover:scale-[1.01] ${
                                  adminTheme === 'light' ? 'bg-white border-slate-200/80 shadow-xs' : 'bg-slate-950/60 border-slate-800'
                                }`}>
                                  <img src={prod.image} alt={prod.title || prod.name} className="w-11 h-11 rounded-xl object-cover border border-slate-200/60 shrink-0" />
                                  <div className="min-w-0 flex-1">
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block font-mono">
                                      Soin #{idx + 1}
                                    </span>
                                    <h5 className={`text-xs font-black truncate ${adminTheme === 'light' ? 'text-slate-800' : 'text-slate-100'}`}>
                                      {prod.title || prod.name}
                                    </h5>
                                    <span className="text-[10px] font-mono text-slate-400 block font-bold">
                                      {(prod.price || 0).toFixed(0)} DH
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className={`p-6 rounded-2xl border text-center space-y-3 ${
                        adminTheme === 'light' ? 'bg-slate-50/80 border-slate-200' : 'bg-slate-950/40 border-slate-800'
                      }`}>
                        <p className={`text-xs font-semibold ${adminTheme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                          Aucun bilan dermo-cosmétique n&apos;est enregistré pour ce client. Offrez-lui une consultation sur mesure !
                        </p>
                        {cPhone && (
                          <a
                            href={`https://wa.me/${cPhone}?text=${encodeURIComponent(`Bonjour ${selectedCustomer.name}, effectuez gratuitement votre diagnostic peau personnalisé sur Para Officinal pour recevoir votre routine sur mesure : https://paraofficinal.ma/skin-diagnostic`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="po-ui-button po-ui-button--primary po-ui-button--md inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_4px_12px_rgba(16,185,129,0.25)] transition active:scale-95 cursor-pointer"
                          >
                            💬 Envoyer le lien de diagnostic gratuit via WhatsApp
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* 4 KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Commandes', value: selectedCustomer.orders.length.toString(), sub: `Dernière: ${lastOrderDate}` },
                  { label: 'CA Cumulé', value: `${spend.toFixed(0)} DH`, sub: `Moy. ${avgOrderValue} DH / cmd` },
                  { label: 'Points Fidélité', value: `${selectedCustomer.points} pts`, sub: `${ptsPct}% vers 5 000 pts` },
                  { label: 'Palier actuel', value: `${tm.emoji} ${tier}`, sub: spend >= 1500 ? 'Niveau max ✓' : `${(1500 - spend).toFixed(0)} DH → Platinum` },
                ].map((s, i) => (
                  <div key={i} className={`rounded-2xl border p-5 transition-all duration-300 hover:scale-[1.015] ${
                    adminTheme === 'light'
                      ? 'bg-white border-slate-200/80 shadow-sm hover:shadow-md'
                      : 'bg-slate-900/50 border-white/[0.06] hover:border-white/[0.12]'
                  }`}>
                    <span className={`text-[9px] font-bold uppercase tracking-widest block mb-2 ${adminTheme === 'light' ? 'text-slate-400' : 'text-slate-600'}`}>{s.label}</span>
                    <span className={`text-xl font-black font-mono block leading-tight ${adminTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>{s.value}</span>
                    <span className={`text-[10px] font-mono block mt-1.5 ${adminTheme === 'light' ? 'text-slate-400' : 'text-slate-600'}`}>{s.sub}</span>
                  </div>
                ))}
              </div>

              {/* Two-column body */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* ── CARD: TIMELINE D'ACTIVITÉ CHRONOLOGIQUE ── */}
                <div className={`p-6 rounded-3xl border mb-6 ${
                  adminTheme === 'light' ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-900/60 border-white/[0.06]'
                }`}>
                  <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                        <Activity className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className={`text-base font-black uppercase tracking-wider ${adminTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                          📜 Timeline d&apos;Activité Chronologique
                        </h3>
                        <p className={`text-xs font-mono ${adminTheme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                          Historique complet des actions client (commandes, diagnostics, échantillons, points et notes)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Timeline Feed */}
                  {(() => {
                    const cPhone = (selectedCustomer.phone || '').replace(/[^0-9]/g, '');
                    const events: {
                      id: string;
                      type: string;
                      title: string;
                      desc: string;
                      dateStr: string;
                      icon: string;
                      badgeBg: string;
                    }[] = [];

                    // Orders
                    (selectedCustomer.orders || []).forEach((o: any) => {
                      const oDate = new Date(o.created_at || o.date || Date.now());
                      events.push({
                        id: 'ord_' + (o.id || Math.random()),
                        type: 'ORDER',
                        title: `Commande #${o.id || o.order_number || '1001'}`,
                        desc: `${(o.total || o.total_price || 0).toFixed(0)} DH · ${o.items?.length || 1} article(s) · Statut: ${o.status || 'Livrée'}`,
                        dateStr: oDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
                        icon: '🛍️',
                        badgeBg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                      });
                    });

                    // Diagnostics
                    const diag = (diagnosticsList || []).find((d: any) => {
                      const dP = (d.phone || d.phone_number || '').replace(/[^0-9]/g, '');
                      return dP && dP === cPhone;
                    });
                    if (diag) {
                      events.push({
                        id: 'diag_' + ((diag as any).id || '1'),
                        type: 'DIAGNOSTIC',
                        title: 'Bilan Dermo-Cosmétique Effectué',
                        desc: `Type de peau: ${diag.skinType || 'Normal'} · Préoccupation: ${diag.concern || 'Hydratation'}`,
                        dateStr: new Date((diag as any).created_at || Date.now()).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
                        icon: '🧴',
                        badgeBg: 'bg-violet-500/10 text-violet-500 border-violet-500/20'
                      });
                    }

                    // Samples
                    const samples = (customerSamples[selectedCustomer.phone] || []) as any[];
                    samples.forEach(s => {
                      events.push({
                        id: s.id,
                        type: 'SAMPLE',
                        title: `Échantillon Offert: ${s.sampleName}`,
                        desc: `Catégorie: ${s.category}`,
                        dateStr: s.dateSent,
                        icon: '🎁',
                        badgeBg: 'bg-pink-500/10 text-pink-500 border-pink-500/20'
                      });
                    });

                    // Notes
                    const notes = (customerNotes[selectedCustomer.phone] || []) as any[];
                    notes.forEach(n => {
                      events.push({
                        id: n.id,
                        type: 'NOTE',
                        title: 'Note Privée Admin',
                        desc: `"${n.text}" · Par ${n.author}`,
                        dateStr: n.date,
                        icon: '📝',
                        badgeBg: 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                      });
                    });

                    // Points Logs
                    const pLogs = (pointsLogs[selectedCustomer.phone] || []) as any[];
                    pLogs.forEach(p => {
                      events.push({
                        id: p.id,
                        type: 'POINTS',
                        title: `Ajustement Points: ${p.points > 0 ? '+' : ''}${p.points} pts`,
                        desc: `Motif: "${p.reason}" · Par ${p.author}`,
                        dateStr: p.date,
                        icon: p.points > 0 ? '🏆' : '⚠️',
                        badgeBg: p.points > 0 ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                      });
                    });

                    return (
                      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                        {events.map((ev) => (
                          <div key={ev.id} className="relative flex items-start gap-3.5 group">
                            {/* Dot icon */}
                            <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-[10px] shadow-xs shrink-0">
                              {ev.icon}
                            </div>
                            
                            <div className={`flex-1 p-3.5 rounded-2xl border transition ${
                              adminTheme === 'light' ? 'bg-slate-50/60 border-slate-200/80 hover:bg-white' : 'bg-slate-950/40 border-slate-800 hover:bg-slate-900/60'
                            }`}>
                              <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                                <span className={`text-xs font-black ${adminTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                                  {ev.title}
                                </span>
                                <span className="text-[9.5px] font-mono text-slate-400">
                                  {ev.dateStr}
                                </span>
                              </div>
                              <p className={`text-[11px] font-mono ${adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                                {ev.desc}
                              </p>
                            </div>
                          </div>
                        ))}

                        {events.length === 0 && (
                          <p className="text-xs font-mono text-slate-400 italic">Aucune activité enregistrée pour l&apos;instant.</p>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Order History */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className={`text-sm font-black uppercase tracking-wider ${adminTheme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>Historique des Commandes</h2>
                    <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full border ${
                      adminTheme === 'light' ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>{selectedCustomer.orders.length} commandes</span>
                  </div>
                  {selectedCustomer.orders.length === 0 ? (
                    <div className={`rounded-2xl border p-12 text-center ${adminTheme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/40 border-white/[0.06]'}`}>
                      <p className={`text-sm italic ${adminTheme === 'light' ? 'text-slate-400' : 'text-slate-600'}`}>Aucune commande enregistrée.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedCustomer.orders.map((ord, idx) => {
                        const smDot = ord.status === 'delivered' ? 'bg-emerald-500 shadow-emerald-500/50' : ord.status === 'shipped' ? 'bg-blue-500 shadow-blue-500/50' : ord.status === 'cancelled' ? 'bg-rose-500 shadow-rose-500/50' : 'bg-amber-500 shadow-amber-500/50';
                        const smBadge = ord.status === 'delivered'
                          ? (adminTheme === 'light' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-emerald-950/30 border-emerald-900/30 text-emerald-400')
                          : ord.status === 'shipped'
                          ? (adminTheme === 'light' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-blue-950/30 border-blue-900/30 text-blue-400')
                          : ord.status === 'cancelled'
                          ? (adminTheme === 'light' ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-rose-950/30 border-rose-900/30 text-rose-400')
                          : (adminTheme === 'light' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-amber-950/30 border-amber-900/30 text-amber-400');
                        const ordDate = new Date(ord.created_at || ord.date || Date.now()).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
                        return (
                          <div key={idx}
                            onClick={() => setSelectedOrderDetail(ord)}
                            className={`group rounded-2xl border p-5 flex items-center gap-5 transition-all duration-200 cursor-pointer hover:scale-[1.008] active:scale-[0.99] ${
                            adminTheme === 'light'
                              ? 'bg-white border-slate-200/80 shadow-sm hover:shadow-md hover:border-emerald-300'
                              : 'bg-slate-900/40 border-white/[0.06] hover:border-emerald-500/40'
                          }`}>
                            <div className={`w-3 h-3 rounded-full shrink-0 ${smDot} shadow-lg`} />
                            <div className="flex-1 min-w-0">
                              <span className={`font-black font-mono text-sm block ${adminTheme === 'light' ? 'text-slate-800' : 'text-slate-100'}`}>{ord.order_id}</span>
                              <span className={`text-[10px] font-mono block mt-0.5 ${adminTheme === 'light' ? 'text-slate-400' : 'text-slate-600'}`}>{ordDate}</span>
                            </div>
                            <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${smBadge}`}>{ord.status}</span>
                            <div className="text-right shrink-0 flex items-center gap-3">
                              <div>
                                <span className={`text-xl font-black font-mono block ${adminTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>{(ord.total || 0).toFixed(0)}</span>
                                <span className={`text-[10px] font-bold ${adminTheme === 'light' ? 'text-slate-400' : 'text-slate-600'}`}>DH</span>
                              </div>
                              <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl border transition ${
                                adminTheme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-600 group-hover:bg-emerald-50 group-hover:border-emerald-200 group-hover:text-emerald-700' : 'bg-slate-800 border-slate-700 text-slate-400 group-hover:bg-emerald-950/40 group-hover:border-emerald-800 group-hover:text-emerald-400'
                              }`}>Détails →</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Right column */}
                <div className="space-y-5">

                  {/* Beauty Wallet */}
                  <div className={`rounded-2xl border overflow-hidden ${adminTheme === 'light' ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-900/50 border-white/[0.06]'}`}>
                    <div className={`h-1.5 w-full bg-gradient-to-r ${tm.ring}`} />
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className={`text-[10px] font-black uppercase tracking-widest ${adminTheme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>💎 Beauty Wallet</h3>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${adminTheme === 'light' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-emerald-950/30 border border-emerald-900/30 text-emerald-400'}`}>Live</span>
                      </div>
                      <div>
                        <span className={`text-4xl font-black font-mono leading-none block ${adminTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>{selectedCustomer.points}</span>
                        <span className={`text-xs font-mono mt-1 block ${adminTheme === 'light' ? 'text-slate-400' : 'text-slate-600'}`}>points de fidélité</span>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1.5">
                          <span className={`text-[9px] font-bold uppercase tracking-wider ${adminTheme === 'light' ? 'text-slate-400' : 'text-slate-600'}`}>Vers Platinum</span>
                          <span className={`text-[9px] font-mono font-bold ${adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>{spendPct}%</span>
                        </div>
                        <div className={`h-2 rounded-full overflow-hidden ${adminTheme === 'light' ? 'bg-slate-100' : 'bg-slate-800'}`}>
                          <div className={`h-full rounded-full bg-gradient-to-r ${tm.ring}`} style={{ width: `${spendPct}%` }} />
                        </div>
                        <span className={`text-[9px] font-mono mt-1 block ${adminTheme === 'light' ? 'text-slate-400' : 'text-slate-600'}`}>
                          {spend >= 1500 ? 'Platinum atteint ✓' : `${(1500 - spend).toFixed(0)} DH restants`}
                        </span>
                      </div>
                      {selectedCustomer.pointsOverrideReason && (
                        <p className={`text-[10px] italic ${adminTheme === 'light' ? 'text-indigo-500' : 'text-indigo-400'}`}>&ldquo;{selectedCustomer.pointsOverrideReason}&rdquo;</p>
                      )}
                    </div>
                  </div>

                  {/* Points Adjustment */}
                  <div className={`rounded-2xl border p-5 space-y-4 ${adminTheme === 'light' ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-900/50 border-white/[0.06]'}`}>
                    <h3 className={`text-[10px] font-black uppercase tracking-widest ${adminTheme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Ajustement de points</h3>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      handleAddPointsAdjustment(selectedCustomer.phone, loyaltyPointsAdjustment, loyaltyAdjustmentReason);
                    }} className="space-y-3">
                      <div className="flex flex-wrap items-center gap-1.5 mb-2">
                        <span className="text-[9px] font-mono text-slate-400 uppercase font-bold mr-1">+ Presets:</span>
                        {[
                          { label: '+100 pts Anniversaire', val: 100, reason: 'Bonus Anniversaire' },
                          { label: '+150 pts Fidélité', val: 150, reason: 'Bonus Fidélité VIP' },
                          { label: '+200 pts Parrainage', val: 200, reason: 'Bonus Parrainage' },
                          { label: '-50 pts Correctif', val: -50, reason: 'Correction Solde' }
                        ].map(p => (
                          <button
                            key={p.label}
                            type="button"
                            onClick={() => {
                              setLoyaltyPointsAdjustment(p.val);
                              setLoyaltyAdjustmentReason(p.reason);
                            }}
                            className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border transition cursor-pointer active:scale-95 ${
                              adminTheme === 'light' ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100' : 'bg-amber-950/40 border-amber-900/40 text-amber-400 hover:bg-amber-900/50'
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                      <div>
                        <label className={`text-[9px] font-bold uppercase tracking-wider block mb-1.5 ${adminTheme === 'light' ? 'text-slate-400' : 'text-slate-600'}`}>Montant (+ ajouter / − retirer)</label>
                        <input
                          type="number"
                          placeholder="Ex: +150 ou -50"
                          value={loyaltyPointsAdjustment || ''}
                          onChange={e => setLoyaltyPointsAdjustment(Number(e.target.value))}
                          className={`w-full text-sm font-mono text-center font-bold border rounded-xl px-4 py-3 outline-none transition ${
                            adminTheme === 'light'
                              ? 'bg-slate-50 border-slate-200 text-slate-800 focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/10'
                              : 'bg-slate-950/80 border-slate-700 text-slate-100 focus:border-emerald-500/50'
                          }`}
                          required
                        />
                      </div>
                      <div>
                        <label className={`text-[9px] font-bold uppercase tracking-wider block mb-1.5 ${adminTheme === 'light' ? 'text-slate-400' : 'text-slate-600'}`}>Motif</label>
                        <input
                          type="text"
                          placeholder="Ex: Correction, promotion spéciale..."
                          value={loyaltyAdjustmentReason}
                          onChange={e => setLoyaltyAdjustmentReason(e.target.value)}
                          className={`w-full text-xs border rounded-xl px-4 py-3 outline-none transition ${
                            adminTheme === 'light'
                              ? 'bg-slate-50 border-slate-200 text-slate-800 focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/10'
                              : 'bg-slate-950/80 border-slate-700 text-slate-100 focus:border-emerald-500/50'
                          }`}
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isAdjustingPoints}
                        className="po-ui-button po-ui-button--primary po-ui-button--md w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_4px_16px_rgba(16,185,129,0.3)] transition cursor-pointer active:scale-[0.98] disabled:opacity-60"
                      >
                        {isAdjustingPoints ? '⏳ Traitement...' : "✓ Valider l'Ajustement"}
                      </button>
                    </form>
                  </div>

                  {/* Quick Actions */}
                  <div className={`rounded-2xl border p-5 space-y-3 ${adminTheme === 'light' ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-900/50 border-white/[0.06]'}`}>
                    <h3 className={`text-[10px] font-black uppercase tracking-widest ${adminTheme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Actions rapides</h3>
                    <button
                      type="button"
                      onClick={() => {
                        const cleanName = (selectedCustomer.name || 'CLIENT').replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 10);
                        setPromoCustomCode(`SPECIAL-${cleanName}-${promoDiscountPct}`);
                        setIsPromoModalOpen(true);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-[0_4px_16px_rgba(245,158,11,0.3)] transition cursor-pointer active:scale-[0.97]"
                    >
                      <Ticket className="w-4 h-4" />
                      ⚡ Offrir Code Promo Exclusif
                    </button>
                    {waPhone && (
                      <a
                        href={`https://wa.me/${waPhone}?text=${waMsg}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="po-ui-button po-ui-button--primary po-ui-button--md w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_4px_12px_rgba(16,185,129,0.25)] transition cursor-pointer active:scale-[0.97]"
                      >
                        {waSvg}
                        Envoyer un message WhatsApp
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(selectedCustomer.phone || '')}
                      className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        adminTheme === 'light' ? 'border-slate-200 text-slate-600 hover:bg-slate-50' : 'border-slate-800 text-slate-400 hover:bg-slate-800/50'
                      }`}
                    >
                      📋 Copier le numéro
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedCustomer(null)}
                      className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        adminTheme === 'light' ? 'border-slate-200 text-slate-500 hover:bg-slate-50' : 'border-slate-800 text-slate-500 hover:bg-slate-800/50'
                      }`}
                    >
                      ← Retour à la liste
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}


      {/* -------------------- MODAL DIALOG: DIAGNOSTIC RULE CREATION / EDIT -------------------- */}
      {isRuleModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-40 select-none animate-in fade-in-50 duration-200">
          <div className={`border rounded-3xl max-w-2xl w-full p-6 space-y-6 relative shadow-2xl max-h-[90vh] overflow-y-auto transition-all duration-200 ${
            adminTheme === 'light'
              ? 'bg-white border-slate-200 text-slate-800'
              : 'bg-slate-900 border-slate-800 text-slate-200'
          }`}>
            
            {/* Header info */}
            <div className="flex justify-between items-start border-b pb-3 border-slate-200/60 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-emerald-500" />
                  {editingRuleId ? 'Modifier la Règle' : 'Ajouter une Règle de Diagnostic'}
                </h3>
                <span className="text-[10px] text-slate-400 block mt-0.5">Associez un rituel de produits ciblés à des profils de peau.</span>
              </div>
              <button 
                onClick={() => setIsRuleModalOpen(false)}
                className={`p-1.5 rounded-full border transition cursor-pointer hover:scale-105 active:scale-95 ${
                  adminTheme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
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
                      adminTheme === 'light' ? 'bg-slate-50 border-slate-200 focus:bg-white text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-200'
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
                      adminTheme === 'light' ? 'bg-slate-50 border-slate-200 focus:bg-white text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-200'
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
                      adminTheme === 'light' ? 'bg-slate-50 border-slate-200 focus:bg-white text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-200'
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
                      adminTheme === 'light' ? 'bg-slate-50 border-slate-200 focus:bg-white text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-202'
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
                      adminTheme === 'light' ? 'bg-slate-50 border-slate-200 focus:bg-white text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-202'
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
                      adminTheme === 'light' ? 'bg-slate-50 border-slate-200 focus:bg-white text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-202'
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
                      adminTheme === 'light' ? 'bg-slate-50 border-slate-200 focus:bg-white text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-202'
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
                              ? 'bg-white border-slate-200 text-slate-800 shadow-sm'
                              : 'bg-slate-900 border-slate-800 text-slate-200 shadow-sm'
                          }`}
                        >
                          <img src={p.image} alt={p.title} className="w-5 h-5 rounded-full object-cover shrink-0" />
                          <span className="truncate max-w-[120px]">{p.title || p.name}</span>
                          <button
                            type="button"
                            onClick={() => setRuleForm(prev => ({ ...prev, productIds: prev.productIds.filter(id => id !== pid) }))}
                            className="text-slate-400 hover:text-rose-500 cursor-pointer ml-1 text-xs outline-none"
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
                              <span className={`font-bold block truncate ${isSelected ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>{p.title || p.name}</span>
                              <span className="text-[9.5px] text-slate-500 uppercase font-mono tracking-wider">{p.vendor} • {p.category}</span>
                            </div>
                          </div>
                          
                          <div className="shrink-0 pl-3">
                            <div className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center transition ${
                              isSelected 
                                ? 'bg-emerald-500 border-emerald-500 text-white' 
                                : (adminTheme === 'light' ? 'border-slate-300' : 'border-slate-800')
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
                      : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
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

      {/* ---- SUB-TAB 6: REFILL REMINDERS & WHATSAPP CAMPAIGNS ---- */}
      {crmSubTab === 'reminders' && (() => {
        const campaignTargetClients = (crmCustomers || []).filter((c: any) => {
          const custOrders = c.orders || [];
          const custCity = custOrders.find((o: any) => o.city)?.city?.trim() || '';

          if (campaignSegment === 'OVERDUE_RESTOCK') {
            const latest = custOrders[0]?.created_at || custOrders[0]?.date;
            if (!latest) return false;
            const days = (Date.now() - new Date(latest).getTime()) / (1000 * 60 * 60 * 24);
            return days >= 30;
          }
          if (campaignSegment === 'GOLD_VIP') {
            return c.totalSpend >= 700;
          }
          if (campaignSegment === 'DERMO_ACNE') {
            const diag = (diagnosticsList || []).find((d: any) => d.phone && d.phone.trim() === c.phone?.trim());
            return diag && (diag.concern === 'Acné' || diag.concern === 'Imperfections' || diag.skinType === 'Gras');
          }
          if (campaignSegment === 'BY_CITY') {
            return custCity.toLowerCase().includes(campaignCity.toLowerCase());
          }
          return true;
        });

        return (
          <div className="space-y-7 admin-tab-enter">
            {/* ── CARD: SIMULATEUR DE CAMPAGNE WHATSAPP CIBLÉE ── */}
            <div className={`p-6 md:p-8 rounded-3xl border ${
              adminTheme === 'light'
                ? 'bg-gradient-to-br from-white via-slate-50 to-emerald-50/30 border-slate-200/80 shadow-[0_8px_32px_-8px_rgba(15,30,54,0.06)]'
                : 'bg-gradient-to-br from-slate-900 via-slate-900/60 to-emerald-950/30 border-white/[0.06] shadow-xl'
            }`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                      📢 WhatsApp Campaign Broadcast
                    </span>
                    <span className="text-[9px] font-mono text-slate-400">
                      Targeting Engine
                    </span>
                  </div>
                  <h2 className={`text-2xl md:text-3xl font-black tracking-tight ${adminTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                    Simulateur de Campagne WhatsApp Ciblée
                  </h2>
                  <p className={`text-xs font-mono max-w-2xl ${adminTheme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                    Sélectionnez un segment client, personnalisez les jetons dynamiques et lancez votre campagne WhatsApp en 1 clic.
                  </p>
                </div>

                <div className="px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 shrink-0">
                  <span className="text-xl font-black font-mono block leading-none">
                    🎯 {campaignTargetClients.length} Clients
                  </span>
                  <span className="text-[9px] font-mono text-slate-400 block mt-1">Audience ciblée</span>
                </div>
              </div>

              {/* Segment & Controls Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Control 1: Segment Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    1. Segment Client Cible
                  </label>
                  <select
                    value={campaignSegment}
                    onChange={(e) => setCampaignSegment(e.target.value as any)}
                    className={`w-full text-xs font-mono font-bold px-3.5 py-2.5 rounded-xl border outline-none cursor-pointer transition ${
                      adminTheme === 'light' ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-200'
                    }`}
                  >
                    <option value="OVERDUE_RESTOCK">🚨 Clients en Retard de Réassort (+30j)</option>
                    <option value="GOLD_VIP">🥇 Membres VIP (Gold & Platinum)</option>
                    <option value="DERMO_ACNE">🧴 Peaux à Tendance Acnéique</option>
                    <option value="BY_CITY">📍 Filtrer par Ville de Livraison</option>
                    <option value="ALL_CLIENTS">👥 Tous les Clients de la Base</option>
                  </select>
                </div>

                {/* Control 2: City filter (if BY_CITY selected) or Discount Pct */}
                {campaignSegment === 'BY_CITY' ? (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Nom de la Ville
                    </label>
                    <input
                      type="text"
                      placeholder="ex: Casablanca, Rabat..."
                      value={campaignCity}
                      onChange={e => setCampaignCity(e.target.value)}
                      className={`w-full text-xs font-mono rounded-xl px-3.5 py-2.5 border outline-none transition ${
                        adminTheme === 'light' ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-100'
                      }`}
                    />
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      2. Remise Promo Offerte ({campaignDiscountPct}%)
                    </label>
                    <div className="flex items-center gap-2">
                      {[10, 15, 20, 25].map(pct => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setCampaignDiscountPct(pct)}
                          className={`px-3 py-2 rounded-xl text-xs font-mono font-black border transition cursor-pointer ${
                            campaignDiscountPct === pct
                              ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                              : adminTheme === 'light' ? 'bg-white border-slate-200 text-slate-700' : 'bg-slate-950 border-slate-800 text-slate-300'
                          }`}
                        >
                          -{pct}%
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Control 3: Quick Preset Templates */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    3. Modèle de Message Préréglé
                  </label>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setCampaignTemplateText('Bonjour {firstname}, il est temps de renouveler votre soin préféré ({favorite_product}) ! Profitez de -{discount_pct}% avec votre code promo personnel : {custom_code}. ✨')}
                      className="px-2.5 py-2 rounded-xl text-[10px] font-mono font-bold border bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20 transition cursor-pointer"
                    >
                      Réassort
                    </button>
                    <button
                      type="button"
                      onClick={() => setCampaignTemplateText('Bonjour {firstname}, en tant que membre VIP à {city}, nous vous offrons {discount_pct}% sur tout le catalogue K-Beauty ! Code promo : {custom_code}. 💎')}
                      className="px-2.5 py-2 rounded-xl text-[10px] font-mono font-bold border bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20 transition cursor-pointer"
                    >
                      Offre VIP
                    </button>
                    <button
                      type="button"
                      onClick={() => setCampaignTemplateText('Bonjour {firstname}, besoin d\'un conseil dermo-cosmétique ? Bénéficiez de -{discount_pct}% avec le code {custom_code} sur Para Officinal ! 🌸')}
                      className="px-2.5 py-2 rounded-xl text-[10px] font-mono font-bold border bg-violet-500/10 text-violet-600 border-violet-500/20 hover:bg-violet-500/20 transition cursor-pointer"
                    >
                      Conseil
                    </button>
                  </div>
                </div>
              </div>

              {/* Message Template Textarea */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Éditeur de Message (Jetons: <span className="text-emerald-500">{'{firstname}'}</span>, <span className="text-emerald-500">{'{city}'}</span>, <span className="text-emerald-500">{'{favorite_product}'}</span>, <span className="text-emerald-500">{'{custom_code}'}</span>, <span className="text-emerald-500">{'{discount_pct}'}</span>)
                  </label>
                </div>
                <textarea
                  rows={2}
                  value={campaignTemplateText}
                  onChange={e => setCampaignTemplateText(e.target.value)}
                  className={`w-full text-xs font-mono p-3 rounded-2xl border outline-none transition ${
                    adminTheme === 'light' ? 'bg-white border-slate-200 text-slate-800 focus:border-emerald-500' : 'bg-slate-950 border-slate-800 text-slate-100 focus:border-emerald-500'
                  }`}
                />
              </div>

              {/* Batch Dispatch Audience List Table */}
              <div className={`rounded-2xl border overflow-hidden ${
                adminTheme === 'light' ? 'bg-white border-slate-200/80' : 'bg-slate-950/60 border-slate-800'
              }`}>
                <div className="p-4 border-b flex justify-between items-center">
                  <h4 className={`text-xs font-black uppercase tracking-wider ${adminTheme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                    Liste d&apos;Envoi WhatsApp Personnalisée ({campaignTargetClients.length} destinataires)
                  </h4>
                </div>

                <div className="overflow-x-auto max-h-[320px] overflow-y-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className={`text-[9.5px] font-black uppercase tracking-wider border-b ${
                        adminTheme === 'light' ? 'bg-slate-100/70 text-slate-500 border-slate-200' : 'bg-slate-900/80 text-slate-400 border-slate-800'
                      }`}>
                        <th className="py-2.5 px-4">Client</th>
                        <th className="py-2.5 px-4">Ville</th>
                        <th className="py-2.5 px-4">Produit Préféré</th>
                        <th className="py-2.5 px-4">Code Généré</th>
                        <th className="py-2.5 px-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                      {campaignTargetClients.map((c: any) => {
                        const custCity = c.orders?.find((o: any) => o.city)?.city || 'Maroc';
                        const firstOrderProd = c.orders?.[0]?.items?.[0]?.title || c.orders?.[0]?.items?.[0]?.name || 'Soin K-Beauty';
                        const cleanName = (c.name || 'CLIENT').replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 8);
                        const code = `SPECIAL-${cleanName}-${campaignDiscountPct}`;
                        const firstName = (c.name || '').split(' ')[0] || 'Client';

                        const waMessage = campaignTemplateText
                          .replace(/\{firstname\}/g, firstName)
                          .replace(/\{fullname\}/g, c.name)
                          .replace(/\{city\}/g, custCity)
                          .replace(/\{favorite_product\}/g, firstOrderProd)
                          .replace(/\{custom_code\}/g, code)
                          .replace(/\{discount_pct\}/g, campaignDiscountPct.toString());

                        const waPhone = (c.phone || '').replace(/[^0-9]/g, '');

                        return (
                          <tr key={c.phone} className={`transition ${adminTheme === 'light' ? 'hover:bg-slate-50' : 'hover:bg-slate-900/40'}`}>
                            <td className="py-3 px-4">
                              <span className="font-bold block">{c.name}</span>
                              <span className="text-[10px] font-mono text-slate-400">{c.phone}</span>
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-xs">
                              📍 {custCity}
                            </td>
                            <td className="py-3 px-4 truncate max-w-[180px] font-mono text-xs">
                              {firstOrderProd}
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                {code}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              {waPhone ? (
                                <a
                                  href={`https://wa.me/${waPhone}?text=${encodeURIComponent(waMessage)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="po-ui-button po-ui-button--primary po-ui-button--md inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-sm transition active:scale-95 whitespace-nowrap"
                                >
                                  Envoyer WhatsApp →
                                </a>
                              ) : (
                                <span className="text-[10px] font-mono text-slate-400 italic">Pas de tel</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                      {campaignTargetClients.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-xs font-mono text-slate-400 italic">
                            Aucun client ne correspond actuellement à ce segment.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* ---- EXISTING REFILL REMINDERS SECTION ---- */}
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
                  adminTheme === 'light' ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-200'
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
                        <tr key={idx} className={`admin-row-enter ${adminTheme === 'light' ? 'hover:bg-slate-50/50' : 'hover:bg-slate-950/20'}`}>
                          <td className="p-4 font-bold">{r.customerName}</td>
                          <td className="p-4 font-mono">{r.phone}</td>
                          <td className="p-4 text-slate-600 dark:text-slate-300">{r.productTitle}</td>
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
        );
      })()}

      {crmSubTab === 'automations' && (
        <AutomationsTab />
      )}


      {/* ── Order Detail Modal Overlay (Shopify-Style) ─────────────────── */}
      {selectedOrderDetail && (() => {
        const ord = selectedOrderDetail;
        const isDark = adminTheme === 'dark';
        const st = (ord.status || 'pending').toLowerCase();

        const statusMeta: Record<string, { label: string; bg: string; text: string; dot: string; border: string }> = {
          pending:   { label: 'En attente',  bg: adminTheme === 'light' ? 'bg-amber-50'   : 'bg-amber-950/30',   text: adminTheme === 'light' ? 'text-amber-700'   : 'text-amber-400',   dot: 'bg-amber-500',   border: adminTheme === 'light' ? 'border-amber-200'   : 'border-amber-900/30' },
          confirmed: { label: 'Confirmée',   bg: adminTheme === 'light' ? 'bg-blue-50'    : 'bg-blue-950/30',    text: adminTheme === 'light' ? 'text-blue-700'    : 'text-blue-400',    dot: 'bg-blue-500',    border: adminTheme === 'light' ? 'border-blue-200'    : 'border-blue-900/30' },
          shipped:   { label: 'Expédiée',    bg: adminTheme === 'light' ? 'bg-indigo-50'  : 'bg-indigo-950/30',  text: adminTheme === 'light' ? 'text-indigo-700'  : 'text-indigo-400',  dot: 'bg-indigo-500',  border: adminTheme === 'light' ? 'border-indigo-200'  : 'border-indigo-900/30' },
          delivered: { label: 'Livrée',      bg: adminTheme === 'light' ? 'bg-emerald-50' : 'bg-emerald-950/30', text: adminTheme === 'light' ? 'text-emerald-700' : 'text-emerald-400', dot: 'bg-emerald-500', border: adminTheme === 'light' ? 'border-emerald-200' : 'border-emerald-900/30' },
          cancelled: { label: 'Annulée',     bg: adminTheme === 'light' ? 'bg-rose-50'    : 'bg-rose-950/30',    text: adminTheme === 'light' ? 'text-rose-700'    : 'text-rose-400',    dot: 'bg-rose-500',    border: adminTheme === 'light' ? 'border-rose-200'    : 'border-rose-900/30' },
          returned:  { label: 'Retournée',   bg: adminTheme === 'light' ? 'bg-orange-50'  : 'bg-orange-950/30',  text: adminTheme === 'light' ? 'text-orange-700'  : 'text-orange-400',  dot: 'bg-orange-500',  border: adminTheme === 'light' ? 'border-orange-200'  : 'border-orange-900/30' },
        };
        const sm = statusMeta[st] || statusMeta.pending;

        const steps = [
          { id: 'pending',   label: 'Enregistrée', done: ['pending','confirmed','shipped','delivered'].includes(st) },
          { id: 'confirmed', label: 'Confirmée',   done: ['confirmed','shipped','delivered'].includes(st) },
          { id: 'shipped',   label: 'Expédiée',    done: ['shipped','delivered'].includes(st) },
          { id: 'delivered', label: 'Livrée',      done: st === 'delivered' },
        ];

        const orderDateStr = new Date(ord.created_at || ord.date || Date.now()).toLocaleDateString('fr-FR', {
          day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        const waPhone = (ord.phone_number || selectedCustomer?.phone || '').replace(/[^0-9]/g, '');
        const waMsg = encodeURIComponent(`Bonjour ${ord.customer_name || selectedCustomer?.name || ''}, concernant votre commande ${ord.order_id} (${(ord.total || 0).toFixed(0)} DH) : `);
        const calculatedShipping = Math.max(0, (ord.total || 0) - (ord.subtotal || 0) + (ord.discount_amount || 0));

        return (
          <div
            className="fixed inset-0 z-[300] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 md:p-6 overflow-y-auto animate-in fade-in-50 duration-200"
            onClick={() => setSelectedOrderDetail(null)}
          >
            <div
              className={`w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl border shadow-2xl transition-all duration-300 ${
                adminTheme === 'light' ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#0b1322] border-white/10 text-slate-100'
              }`}
              onClick={e => e.stopPropagation()}
            >
              {/* Sticky Header */}
              <div className={`sticky top-0 z-20 flex items-center justify-between px-6 py-4 border-b backdrop-blur-xl ${
                adminTheme === 'light' ? 'bg-white/95 border-slate-100' : 'bg-[#0b1322]/95 border-white/10'
              }`}>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedOrderDetail(null)}
                    className={`p-2 rounded-xl border transition cursor-pointer hover:scale-105 active:scale-95 ${
                      adminTheme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100' : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className={`text-xl font-black font-mono tracking-tight ${adminTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                        {ord.order_id}
                      </h2>
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${sm.bg} ${sm.text} ${sm.border}`}>
                        ● {sm.label}
                      </span>
                    </div>
                    <p className={`text-[10px] font-mono mt-0.5 ${adminTheme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
                      Passée le {orderDateStr}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {waPhone && (
                    <a
                      href={`https://wa.me/${waPhone}?text=${waMsg}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="po-ui-button po-ui-button--primary po-ui-button--md flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_4px_12px_rgba(16,185,129,0.3)] transition active:scale-95 cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      Contacter client
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedOrderDetail(null)}
                    className={`p-2 rounded-xl transition cursor-pointer ${
                      adminTheme === 'light' ? 'hover:bg-slate-100 text-slate-400 hover:text-slate-700' : 'hover:bg-slate-800 text-slate-500 hover:text-slate-200'
                    }`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">

                {/* Stepper Progress Bar */}
                <div className={`p-5 rounded-2xl border ${
                  adminTheme === 'light' ? 'bg-slate-50/70 border-slate-200/80' : 'bg-slate-900/50 border-white/5'
                }`}>
                  <div className="flex items-center justify-between relative">
                    <div className={`absolute top-3.5 left-6 right-6 h-0.5 -z-0 ${adminTheme === 'light' ? 'bg-slate-200' : 'bg-slate-800'}`} />
                    
                    {steps.map((stStep, idx) => (
                      <div key={stStep.id} className="relative z-10 flex flex-col items-center text-center">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                          stStep.done
                            ? 'bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                            : (adminTheme === 'light' ? 'bg-white border-2 border-slate-300 text-slate-400' : 'bg-slate-900 border-2 border-slate-700 text-slate-600')
                        }`}>
                          {stStep.done ? '✓' : idx + 1}
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider mt-1.5 ${
                          stStep.done
                            ? (adminTheme === 'light' ? 'text-slate-800' : 'text-slate-200')
                            : (adminTheme === 'light' ? 'text-slate-400' : 'text-slate-600')
                        }`}>{stStep.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Main 2-Column Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                  {/* Left Column (2/3): Items & Shipping info */}
                  <div className="lg:col-span-2 space-y-5">

                    {/* Items Card */}
                    <div className={`rounded-2xl border overflow-hidden ${
                      adminTheme === 'light' ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-900/40 border-white/5'
                    }`}>
                      <div className={`px-5 py-3.5 border-b flex justify-between items-center ${
                        adminTheme === 'light' ? 'border-slate-100 bg-slate-50/50' : 'border-white/5 bg-slate-900/60'
                      }`}>
                        <h3 className={`text-xs font-black uppercase tracking-wider ${adminTheme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>
                          Articles Commandés ({(ord.items || []).reduce((acc, it) => acc + (it.quantity || 1), 0)})
                        </h3>
                        <span className={`text-[10px] font-mono ${adminTheme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
                          {(ord.items || []).length} référence{(ord.items || []).length > 1 ? 's' : ''}
                        </span>
                      </div>

                      <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {(ord.items || []).length === 0 ? (
                          <div className="p-6 text-center text-xs text-slate-400 italic">Détails des articles indisponibles.</div>
                        ) : (
                          (ord.items || []).map((item, i) => {
                            const allCatalog = [...(products || []), ...PRODUCTS_DB];
                            const matchingProd = allCatalog.find(
                              p => p.id === item.id ||
                              (p.title && item.title && p.title.toLowerCase() === item.title.toLowerCase()) ||
                              (p.name && item.title && p.name.toLowerCase() === item.title.toLowerCase()) ||
                              (p.title && item.title && item.title.toLowerCase().includes(p.title.toLowerCase())) ||
                              (p.name && item.title && item.title.toLowerCase().includes(p.name.toLowerCase()))
                            );
                            const defaultFallback = 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=320&auto=format&fit=crop';
                            const itemImg = item.image || matchingProd?.image || (matchingProd as any)?.images?.[0] || defaultFallback;

                            return (
                              <div key={i} className="p-4 flex items-center gap-4">
                                <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-200/80 dark:border-white/10 bg-slate-100 dark:bg-slate-800 shadow-xs group">
                                  <img
                                    src={itemImg}
                                    alt={item.title}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                  />
                                </div>

                              <div className="flex-1 min-w-0">
                                <h4 className={`text-xs font-black truncate ${adminTheme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                                  {item.title}
                                </h4>
                                <span className={`text-[10px] font-mono block mt-0.5 ${adminTheme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
                                  Prix unitaire: {(item.price || 0).toFixed(0)} DH
                                </span>
                              </div>

                              <div className="text-right shrink-0">
                                <span className={`text-xs font-mono font-bold block ${adminTheme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                                  x{item.quantity || 1}
                                </span>
                                <span className={`text-sm font-mono font-black ${adminTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                                  {((item.price || 0) * (item.quantity || 1)).toFixed(0)} DH
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}

                        {(ord.gift_item || ord.applied_coupon) && (
                          <div className={`p-4 space-y-2 ${adminTheme === 'light' ? 'bg-slate-50/50' : 'bg-slate-900/30'}`}>
                            {ord.gift_item && (
                              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                <span>🎁 Cadeau Inclus:</span>
                                <span className="font-mono text-[11px] underline">{ord.gift_item}</span>
                              </div>
                            )}
                            {ord.applied_coupon && (
                              <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                <span>🏷️ Code Promo Appliqué:</span>
                                <span className="font-mono text-[11px] uppercase bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">{ord.applied_coupon}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Shipping & Delivery Details Card */}
                    <div className={`rounded-2xl border p-5 space-y-3 ${
                      adminTheme === 'light' ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-900/40 border-white/5'
                    }`}>
                      <h3 className={`text-xs font-black uppercase tracking-wider flex items-center gap-2 ${
                        adminTheme === 'light' ? 'text-slate-800' : 'text-slate-200'
                      }`}>
                        <Truck className="w-4 h-4 text-emerald-500" /> Informations de Livraison & Transport
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className={`text-[10px] font-bold uppercase tracking-wider block ${adminTheme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>Destinataire</span>
                          <p className="font-black mt-0.5">{ord.customer_name || selectedCustomer?.name}</p>
                          <p className="font-mono text-slate-500">{ord.phone_number || selectedCustomer?.phone}</p>
                        </div>
                        <div>
                          <span className={`text-[10px] font-bold uppercase tracking-wider block ${adminTheme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>Adresse de livraison</span>
                          <p className="font-bold mt-0.5">{ord.city || 'Maroc'}</p>
                          <p className="text-slate-500 leading-tight mt-0.5">{ord.address || 'Non spécifiée'}</p>
                        </div>
                        {ord.courier && (
                          <div>
                            <span className={`text-[10px] font-bold uppercase tracking-wider block ${adminTheme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>Livreur / Transporteur</span>
                            <span className="font-black font-mono text-emerald-600 dark:text-emerald-400 uppercase">{ord.courier}</span>
                          </div>
                        )}
                        {ord.tracking_number && (
                          <div>
                            <span className={`text-[10px] font-bold uppercase tracking-wider block ${adminTheme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>N° de Suivi</span>
                            <span className="font-mono font-bold">{ord.tracking_number}</span>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Right Column (1/3): Financial Summary & Actions */}
                  <div className="space-y-5">

                    {/* Financial breakdown */}
                    <div className={`rounded-2xl border p-5 space-y-3.5 ${
                      adminTheme === 'light' ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-900/40 border-white/5'
                    }`}>
                      <h3 className={`text-xs font-black uppercase tracking-wider border-b pb-2 ${
                        adminTheme === 'light' ? 'text-slate-800 border-slate-100' : 'text-slate-200 border-white/5'
                      }`}>
                        Récapitulatif Financier
                      </h3>

                      <div className="space-y-2 text-xs font-mono">
                        <div className="flex justify-between">
                          <span className={adminTheme === 'light' ? 'text-slate-500' : 'text-slate-400'}>Sous-total articles :</span>
                          <span className="font-bold">{(ord.subtotal || 0).toFixed(2)} DH</span>
                        </div>

                        {ord.discount_amount > 0 && (
                          <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                            <span>Remise appliquée :</span>
                            <span className="font-bold">-{(ord.discount_amount || 0).toFixed(2)} DH</span>
                          </div>
                        )}

                        <div className="flex justify-between">
                          <span className={adminTheme === 'light' ? 'text-slate-500' : 'text-slate-400'}>Frais de livraison :</span>
                          <span className="font-bold">{calculatedShipping.toFixed(2)} DH</span>
                        </div>

                        <div className={`pt-3 border-t flex justify-between items-baseline ${
                          adminTheme === 'light' ? 'border-slate-100' : 'border-white/5'
                        }`}>
                          <span className="font-bold uppercase text-[10px] tracking-wider text-slate-500">Total COD :</span>
                          <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">{(ord.total || 0).toFixed(0)} DH</span>
                        </div>
                      </div>
                    </div>

                    {/* Order Status quick updater */}
                    <div className={`rounded-2xl border p-5 space-y-3 ${
                      adminTheme === 'light' ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-900/40 border-white/5'
                    }`}>
                      <h3 className={`text-xs font-black uppercase tracking-wider ${
                        adminTheme === 'light' ? 'text-slate-800' : 'text-slate-200'
                      }`}>
                        Statut de Commande
                      </h3>
                      <select
                        value={ord.status}
                        onChange={async (e) => {
                          const newSt = e.target.value;
                          if (handleUpdateOrderStatus) {
                            await handleUpdateOrderStatus(ord.order_id, newSt);
                            setSelectedOrderDetail(prev => prev ? { ...prev, status: newSt } : null);
                            showToast(`Statut de ${ord.order_id} mis à jour en ${newSt}`, 'success');
                          }
                        }}
                        className={`w-full text-xs font-bold rounded-xl px-3.5 py-2.5 border outline-none cursor-pointer transition ${
                          adminTheme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white' : 'bg-slate-950 border-slate-800 text-slate-100'
                        }`}
                      >
                        <option value="pending">En attente (Pending)</option>
                        <option value="confirmed">Confirmée (Confirmed)</option>
                        <option value="shipped">Expédiée (Shipped)</option>
                        <option value="delivered">Livrée (Delivered)</option>
                        <option value="cancelled">Annulée (Cancelled)</option>
                        <option value="returned">Retournée (Returned)</option>
                      </select>
                    </div>

                  </div>

                </div>

              </div>

            </div>
          </div>
        );
      })()}


      {/* ── Modal: Générateur de Code Promo WhatsApp Instantané ───────── */}
      {isPromoModalOpen && selectedCustomer && (() => {
        const cPhone = (selectedCustomer.phone || '').replace(/[^0-9]/g, '');
        const promoMessage = `Bonjour ${selectedCustomer.name} 🎁 ! Pour vous remercier de votre fidélité sur Para Officinal, voici votre code promo exclusif de -${promoDiscountPct}% : *${promoCustomCode}*. Valable pendant ${promoExpiryDays} jours sur tout le site : https://paraofficinal.ma`;

        return (
          <div
            className="fixed inset-0 z-[350] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in-50 duration-200"
            onClick={() => setIsPromoModalOpen(false)}
          >
            <div
              className={`w-full max-w-lg rounded-3xl border p-6 space-y-6 shadow-2xl transition-all ${
                adminTheme === 'light' ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-white/10 text-slate-100'
              }`}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b pb-4 border-slate-200/70 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                    <Ticket className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black tracking-tight">Générateur de Code Promo Exclusif</h3>
                    <p className="text-[10px] text-slate-400 font-mono">Créez & envoyez instantanément un bon de réduction par WhatsApp</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsPromoModalOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Discount selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Pourcentage de réduction</label>
                <div className="flex items-center gap-2">
                  {[10, 15, 20, 25, 30].map(pct => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => {
                        setPromoDiscountPct(pct);
                        const cleanName = (selectedCustomer.name || 'CLIENT').replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 10);
                        setPromoCustomCode(`SPECIAL-${cleanName}-${pct}`);
                      }}
                      className={`flex-1 py-2 rounded-xl text-xs font-black border transition cursor-pointer ${
                        promoDiscountPct === pct
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-extrabold'
                          : (adminTheme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100' : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800')
                      }`}
                    >
                      -{pct}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Code Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Code Promo Généré</label>
                <input
                  type="text"
                  value={promoCustomCode}
                  onChange={e => setPromoCustomCode(e.target.value.toUpperCase())}
                  className={`w-full text-base font-black font-mono text-center tracking-wider border rounded-xl px-4 py-3 outline-none transition ${
                    adminTheme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500' : 'bg-slate-950 border-slate-700 text-amber-400 focus:border-amber-500'
                  }`}
                  required
                />
              </div>

              {/* Expiry Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Durée de validité</label>
                <div className="flex items-center gap-2">
                  {[3, 7, 14, 30].map(days => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setPromoExpiryDays(days)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        promoExpiryDays === days
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md font-extrabold'
                          : (adminTheme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-950 border-slate-800 text-slate-300')
                      }`}
                    >
                      {days} Jours
                    </button>
                  ))}
                </div>
              </div>

              {/* WhatsApp Message Preview */}
              <div className={`p-4 rounded-2xl border space-y-1.5 ${
                adminTheme === 'light' ? 'bg-emerald-50/50 border-emerald-200/80' : 'bg-emerald-950/20 border-emerald-900/40'
              }`}>
                <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">💬 Aperçu du message WhatsApp</span>
                <p className="text-xs font-mono text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {promoMessage}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPromoModalOpen(false)}
                  className={`flex-1 py-3 rounded-xl text-xs font-bold border transition ${
                    adminTheme === 'light' ? 'border-slate-200 text-slate-600 hover:bg-slate-50' : 'border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  disabled={isGeneratingPromo}
                  onClick={async () => {
                    setIsGeneratingPromo(true);
                    try {
                      const newCoupon = {
                        code: promoCustomCode.trim().toUpperCase(),
                        discountPercent: Number(promoDiscountPct),
                        freeShipping: false,
                        discountType: 'percent' as const,
                        expiryDate: new Date(Date.now() + promoExpiryDays * 24 * 60 * 60 * 1000).toISOString(),
                        isActive: true
                      };
                      const updatedCoupons = [newCoupon, ...(settings.coupons || []).filter((c: any) => c.code !== newCoupon.code)];
                      const success = await saveSettings({ ...settings, coupons: updatedCoupons });

                      if (success) {
                        showToast(`Code promo ${newCoupon.code} activé avec succès !`, 'success');
                        setIsPromoModalOpen(false);
                        if (cPhone) {
                          window.open(`https://wa.me/${cPhone}?text=${promoMessage}`, '_blank');
                        }
                      } else {
                        showToast('Erreur lors de la création du code promo.', 'error');
                      }
                    } catch (err) {
                      showToast('Erreur lors de la sauvegarde.', 'error');
                    } finally {
                      setIsGeneratingPromo(false);
                    }
                  }}
                  className="po-ui-button po-ui-button--primary po-ui-button--md flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_4px_16px_rgba(16,185,129,0.3)] transition cursor-pointer active:scale-[0.98] disabled:opacity-50"
                >
                  {isGeneratingPromo ? 'Enregistrement...' : '🚀 Créer & Envoyer'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      <ConfirmDialog
        open={Boolean(ruleToDelete)}
        title="Supprimer cette règle ?"
        description="Cette règle de recommandation ne sera plus utilisée par le diagnostic. Cette action ne modifie pas les produits associés."
        confirmLabel="Supprimer la règle"
        busy={isDeletingRule}
        onClose={() => { if (!isDeletingRule) setRuleToDelete(null); }}
        onConfirm={confirmDeleteRule}
      />

    </div>
  );
}
