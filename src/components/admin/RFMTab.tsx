'use client';

import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Target, 
  TrendingUp, 
  Copy, 
  Send, 
  Percent, 
  Calendar, 
  DollarSign, 
  Search, 
  AlertTriangle, 
  Loader2, 
  CheckCircle2, 
  MessageSquare, 
  HelpCircle, 
  Lock, 
  Play,
  X,
  Sparkles
} from 'lucide-react';
import { useAdmin, Order, AdminUser } from '@/context/AdminContext';
import { useSettings } from '@/context/SettingsContext';

interface RFMCustomer {
  phone: string;
  name: string;
  ordersCount: number;
  totalSpend: number;
  lastOrderDays: number;
  rScore: number;
  fScore: number;
  mScore: number;
  avgScore: number;
  segment: 'champions' | 'fideles' | 'nouveaux' | 'attention' | 'risque' | 'perdus';
  points: number;
}

export default function RFMTab() {
  const { 
    orders, 
    currentUser, 
    adminTheme, 
    loyaltyOverrides,
    logAdminAction
  } = useAdmin();
  const { settings } = useSettings();

  const isReadOnly = currentUser?.role === 'support';
  const pointsPerDh = settings?.loyaltyPointsPerDh || 1;

  // ── UI Filters & Actions States ──
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSegmentFilter, setSelectedSegmentFilter] = useState<string>('all');
  
  // ── Campaign Modal States ──
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [campaignMessage, setCampaignMessage] = useState(
    "Bonjour {NAME},\n\nMerci pour votre fidélité chez Para Officinal ! Pour vous remercier, nous vous offrons 15% de réduction sur votre prochain soin K-Beauty avec le code FIDELITE15.\n\nVotre solde actuel est de {POINTS} points.\n\nA très bientôt !"
  );
  
  // Simulation progress states
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);
  const [simulationComplete, setSimulationComplete] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // ── RFM Segment Definitions ──
  const segmentConfig = {
    champions: {
      label: 'Champions',
      desc: 'Spendeurs fréquents, actifs et récents. Porteurs de croissance.',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      color: 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5',
      accentColor: 'bg-emerald-500',
      descriptionAr: 'عملاء النخبة الأكثر نشاطاً وشراءً'
    },
    fideles: {
      label: 'Fidèles',
      desc: 'Acheteurs réguliers avec un bon panier d\'achat. Réceptifs aux offres.',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      color: 'text-indigo-500 border-indigo-500/20 bg-indigo-500/5',
      accentColor: 'bg-indigo-500',
      descriptionAr: 'العملاء الأوفياء أصحاب المشتريات المنتظمة'
    },
    nouveaux: {
      label: 'Prometteurs',
      desc: 'Clients ayant commandé récemment (1ère commande). À couver.',
      badgeColor: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
      color: 'text-cyan-500 border-cyan-500/20 bg-cyan-500/5',
      accentColor: 'bg-cyan-500',
      descriptionAr: 'العملاء الجدد ذوي التفاعل الأولي الممتاز'
    },
    attention: {
      label: 'Besoin d\'attention',
      desc: 'Dernière commande il y a 2-3 mois. Nécessite un rappel rapide.',
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-450 border-amber-500/20',
      color: 'text-amber-500 border-amber-500/20 bg-amber-500/5',
      accentColor: 'bg-amber-500',
      descriptionAr: 'عملاء متوسطي النشاط بحاجة لتنبيه ترويجي'
    },
    risque: {
      label: 'À Risque',
      desc: 'Anciens clients réguliers sans achat récent. Perte imminente.',
      badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-450 border-rose-500/20',
      color: 'text-rose-500 border-rose-500/20 bg-rose-500/5',
      accentColor: 'bg-rose-500',
      descriptionAr: 'عملاء أوفياء سابقاً لم يشتروا منذ مدة طويلة'
    },
    perdus: {
      label: 'Perdus / Endormis',
      desc: 'Achat unique lointain. Réactivation difficile et coûteuse.',
      badgeColor: 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/20',
      color: 'text-slate-550 dark:text-slate-400 border-slate-500/20 bg-slate-500/5',
      accentColor: 'bg-slate-500',
      descriptionAr: 'عملاء غير نشطين منذ فترات طويلة جداً'
    }
  };

  // ── RFM Calculations ──
  const rfmCustomersList = useMemo((): RFMCustomer[] => {
    const customersMap: Record<string, {
      phone: string;
      name: string;
      successfulOrders: Order[];
      totalSpend: number;
      lastOrderDate: Date;
    }> = {};

    const now = new Date();

    orders.forEach(order => {
      const phone = order.phone_number.trim();
      const status = (order.status || '').toLowerCase();
      
      // Skip cancelled/disputed orders for core RFM scoring
      if (status.includes('annul') || status === 'cancelled') {
        return;
      }

      const orderDate = new Date(order.created_at || order.date || now);

      if (!customersMap[phone]) {
        customersMap[phone] = {
          phone,
          name: order.customer_name,
          successfulOrders: [],
          totalSpend: 0,
          lastOrderDate: orderDate
        };
      }

      customersMap[phone].successfulOrders.push(order);
      customersMap[phone].totalSpend += order.total;
      
      if (orderDate > customersMap[phone].lastOrderDate) {
        customersMap[phone].lastOrderDate = orderDate;
      }
    });

    return Object.values(customersMap).map(c => {
      const ordersCount = c.successfulOrders.length;
      const lastOrderDays = Math.max(0, Math.floor((now.getTime() - c.lastOrderDate.getTime()) / (1000 * 60 * 60 * 24)));

      // 1. Recency Score (R)
      let rScore = 1;
      if (lastOrderDays <= 30) rScore = 5;
      else if (lastOrderDays <= 60) rScore = 4;
      else if (lastOrderDays <= 90) rScore = 3;
      else if (lastOrderDays <= 180) rScore = 2;

      // 2. Frequency Score (F)
      let fScore = 1;
      if (ordersCount >= 5) fScore = 5;
      else if (ordersCount === 4) fScore = 4;
      else if (ordersCount === 3) fScore = 3;
      else if (ordersCount === 2) fScore = 2;

      // 3. Monetary Score (M)
      let mScore = 1;
      if (c.totalSpend >= 2000) mScore = 5;
      else if (c.totalSpend >= 1000) mScore = 4;
      else if (c.totalSpend >= 500) mScore = 3;
      else if (c.totalSpend >= 200) mScore = 2;

      const avgScore = (rScore + fScore + mScore) / 3;

      // 4. Segment Assignment Rules
      let segment: RFMCustomer['segment'] = 'perdus';
      
      if (rScore <= 2 && fScore >= 3) {
        segment = 'risque';
      } else if (rScore <= 2 && fScore <= 2) {
        segment = 'perdus';
      } else if (avgScore >= 4.5) {
        segment = 'champions';
      } else if (avgScore >= 3.5) {
        segment = 'fideles';
      } else if (rScore >= 4 && fScore <= 1) {
        segment = 'nouveaux';
      } else {
        segment = 'attention';
      }

      // 5. Points calculation
      const override = loyaltyOverrides[c.phone];
      const points = override !== undefined ? override.points : Math.round(c.totalSpend * pointsPerDh);

      return {
        phone: c.phone,
        name: c.name,
        ordersCount,
        totalSpend: c.totalSpend,
        lastOrderDays,
        rScore,
        fScore,
        mScore,
        avgScore,
        segment,
        points
      };
    }).sort((a, b) => b.totalSpend - a.totalSpend);
  }, [orders, loyaltyOverrides, pointsPerDh]);

  // Segment count stats
  const segmentStats = useMemo(() => {
    const stats = {
      all: rfmCustomersList.length,
      champions: 0,
      fideles: 0,
      nouveaux: 0,
      attention: 0,
      risque: 0,
      perdus: 0
    };
    rfmCustomersList.forEach(c => {
      stats[c.segment] += 1;
    });
    return stats;
  }, [rfmCustomersList]);

  // ── Filtered list ──
  const filteredCustomers = useMemo(() => {
    return rfmCustomersList.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            c.phone.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSegment = selectedSegmentFilter === 'all' || c.segment === selectedSegmentFilter;
      return matchesSearch && matchesSegment;
    });
  }, [rfmCustomersList, searchQuery, selectedSegmentFilter]);

  // ── WhatsApp E.164 Exporter ──
  const handleCopyNumbers = () => {
    if (filteredCustomers.length === 0) return;
    
    // Normalize and clean to E.164 (without '+' or leading zeros, e.g. 2126xxxxxxxx)
    const numbers = filteredCustomers.map(c => {
      let raw = c.phone.replace(/\D/g, '');
      if (raw.startsWith('0')) {
        raw = '212' + raw.slice(1);
      }
      if (!raw.startsWith('212')) {
        raw = '212' + raw;
      }
      return raw;
    });

    const listStr = numbers.join(',');
    navigator.clipboard.writeText(listStr);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);

    // Audit log
    logAdminAction(
      "Export RFM Contacts", 
      `Extraction de ${numbers.length} numéros WhatsApp pour le segment "${selectedSegmentFilter}"`
    );
  };

  // ── Campaign Simulator ──
  const startCampaignSimulation = async () => {
    if (filteredCustomers.length === 0 || isReadOnly || isSimulating) return;

    setIsSimulating(true);
    setSimulationProgress(0);
    setSimulationComplete(false);
    setSimulationLogs([]);

    const customersToNotify = [...filteredCustomers];
    const logEntries: string[] = [];

    // Helper to format simulated timestamp
    const getTimestamp = () => {
      const d = new Date();
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
    };

    logEntries.push(`[${getTimestamp()}] 🚀 Démarrage de la campagne pour le segment "${selectedSegmentFilter === 'all' ? 'Tous' : segmentConfig[selectedSegmentFilter as keyof typeof segmentConfig].label}" (${customersToNotify.length} clients)...`);
    setSimulationLogs([...logEntries]);

    for (let i = 0; i < customersToNotify.length; i++) {
      // Simulate network dispatch delay
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const c = customersToNotify[i];
      // Interpolate tokens
      const personalizedMsg = campaignMessage
        .replace(/{NAME}/g, c.name)
        .replace(/{POINTS}/g, String(c.points));

      const cleanPhone = c.phone.replace(/\D/g, '');
      const formattedPhone = cleanPhone.startsWith('0') ? '212' + cleanPhone.slice(1) : cleanPhone;

      logEntries.push(`[${getTimestamp()}] Message envoyé à ${c.name} (+${formattedPhone}) : "${personalizedMsg.slice(0, 45)}..." - SUCCÈS ✅`);
      setSimulationLogs([...logEntries]);
      setSimulationProgress(Math.round(((i + 1) / customersToNotify.length) * 100));
    }

    logEntries.push(`[${getTimestamp()}] 🏁 Campagne de diffusion complétée avec succès ! ${customersToNotify.length}/${customersToNotify.length} messages délivrés.`);
    setSimulationLogs([...logEntries]);
    setSimulationComplete(true);
    setIsSimulating(false);

    // Write audit log
    logAdminAction(
      "Campagne WhatsApp RFM", 
      `Campagne simulée WhatsApp envoyée au segment "${selectedSegmentFilter}" (${customersToNotify.length} destinataires)`
    );
  };

  return (
    <div className="space-y-6">
      
      {/* ── Explanatory Accordion Header ── */}
      <div className={`p-5 rounded-3xl border transition-all duration-300 ${
        adminTheme === 'light' 
          ? 'bg-white border-slate-200/80 shadow-sm' 
          : 'bg-slate-900/40 border-slate-800/80 shadow-lg'
      }`}>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1.5 mb-1">
              <Target className="w-3.5 h-3.5" /> Segmentation RFM
            </span>
            <h2 className={`text-lg font-black tracking-tight ${adminTheme === 'light' ? 'text-slate-800' : 'text-slate-100'}`}>
              Analyse Comportementale RFM des Clients
            </h2>
            <p className={`text-xs font-light mt-0.5 ${adminTheme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
              Classez vos clients par Récence (R), Fréquence (F) et Montant (M) pour optimiser vos campagnes de fidélisation WhatsApp.
            </p>
          </div>

          <div className="text-right">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 border rounded-full text-[10px] font-mono font-semibold ${
              adminTheme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-600 shadow-sm' : 'bg-slate-950 border-slate-850 text-slate-400'
            }`}>
              <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" /> BASE ANALYSÉE : {rfmCustomersList.length} CLIENTS
            </span>
          </div>
        </div>

        {/* ── Segment Distribution Bento Layout ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6 pt-6 border-t border-slate-200/40">
          
          {/* Left Column: Concentric Activity Rings visualization (Col span 4) */}
          <div className="md:col-span-4 flex items-center gap-6 justify-center bg-slate-50/50 dark:bg-slate-950/20 p-4 rounded-2xl border border-slate-100 dark:border-slate-900">
            <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {/* Ring 1: Champions (Outer) */}
                {(() => {
                  const count = segmentStats.champions || 0;
                  const pct = statsPct(count, rfmCustomersList.length || 1);
                  const strokeDash = 2 * Math.PI * 38; // ~238.76
                  const strokeOffset = strokeDash - (pct / 100) * strokeDash;
                  return (
                    <>
                      <circle cx="50" cy="50" r="38" stroke={adminTheme === 'light' ? '#f1f5f9' : '#0f172a'} strokeWidth="6" fill="none" />
                      <circle cx="50" cy="50" r="38" stroke="#10b981" strokeWidth="6" strokeDasharray={strokeDash} strokeDashoffset={strokeOffset} strokeLinecap="round" fill="none" />
                    </>
                  );
                })()}
                {/* Ring 2: Fidèles (Middle) */}
                {(() => {
                  const count = segmentStats.fideles || 0;
                  const pct = statsPct(count, rfmCustomersList.length || 1);
                  const strokeDash = 2 * Math.PI * 28; // ~175.92
                  const strokeOffset = strokeDash - (pct / 100) * strokeDash;
                  return (
                    <>
                      <circle cx="50" cy="50" r="28" stroke={adminTheme === 'light' ? '#f1f5f9' : '#0f172a'} strokeWidth="6" fill="none" />
                      <circle cx="50" cy="50" r="28" stroke="#6366f1" strokeWidth="6" strokeDasharray={strokeDash} strokeDashoffset={strokeOffset} strokeLinecap="round" fill="none" />
                    </>
                  );
                })()}
                {/* Ring 3: Prometteurs (Inner) */}
                {(() => {
                  const count = segmentStats.nouveaux || 0;
                  const pct = statsPct(count, rfmCustomersList.length || 1);
                  const strokeDash = 2 * Math.PI * 18; // ~113.09
                  const strokeOffset = strokeDash - (pct / 100) * strokeDash;
                  return (
                    <>
                      <circle cx="50" cy="50" r="18" stroke={adminTheme === 'light' ? '#f1f5f9' : '#0f172a'} strokeWidth="6" fill="none" />
                      <circle cx="50" cy="50" r="18" stroke="#06b6d4" strokeWidth="6" strokeDasharray={strokeDash} strokeDashoffset={strokeOffset} strokeLinecap="round" fill="none" />
                    </>
                  );
                })()}
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Rings</span>
                <span className={`text-[8px] font-mono mt-0.5 ${adminTheme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Top 3</span>
              </div>
            </div>

            <div className="space-y-1.5 flex-1 min-w-0">
              <span className={`text-[10px] font-bold uppercase tracking-wider block ${adminTheme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>Fidélité Active</span>
              <p className={`text-[9.5px] leading-relaxed font-light ${adminTheme === 'light' ? 'text-slate-500' : 'text-slate-450'}`}>
                Visualisation concentrique des trois segments clés de croissance de la boutique.
              </p>
            </div>
          </div>

          {/* Right Column: Segment pills interactive filter selection list (Col span 8) */}
          <div className="md:col-span-8 flex flex-col justify-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2.5">
              Filtrer par segment client
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {Object.entries(segmentConfig).map(([key, config]) => {
                const count = segmentStats[key as keyof typeof segmentStats] || 0;
                const pct = statsPct(count, rfmCustomersList.length);
                const isSelected = selectedSegmentFilter === key;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedSegmentFilter(isSelected ? 'all' : key)}
                    className={`flex items-center justify-between p-2 px-3.5 rounded-xl border text-left cursor-pointer transition-all duration-200 ${
                      isSelected 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 font-bold ring-1 ring-emerald-500/20' 
                        : (adminTheme === 'light' 
                            ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-800' 
                            : 'bg-slate-900/40 hover:bg-slate-900 border-slate-900 text-slate-400 hover:text-slate-200')
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${config.accentColor}`} />
                      <span className="text-[11px] font-extrabold truncate">{config.label}</span>
                    </div>
                    <span className="text-[9.5px] font-mono text-slate-400 font-bold ml-1.5">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* ── Segment Metric Cards Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {Object.entries(segmentConfig).map(([key, config]) => {
          const count = segmentStats[key as keyof typeof segmentStats] || 0;
          const pct = statsPct(count, rfmCustomersList.length);
          const isActive = selectedSegmentFilter === key;

          return (
            <button
              key={key}
              onClick={() => setSelectedSegmentFilter(isActive ? 'all' : key)}
              className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between h-28 relative overflow-hidden active:scale-[0.98] ${
                isActive 
                  ? `${config.color} ring-1 ring-emerald-500` 
                  : (adminTheme === 'light' ? 'bg-white border-slate-200/80 hover:bg-slate-50' : 'bg-slate-900/20 border-slate-900 hover:bg-slate-900/40')
              }`}
            >
              <div className="space-y-1">
                <span className="text-[11px] font-black uppercase tracking-wider block">{config.label}</span>
                <span className={`text-[8.5px] font-light leading-tight block truncate ${adminTheme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                  {config.desc}
                </span>
              </div>
              
              <div className="flex justify-between items-end mt-2">
                <span className="text-2xl font-black font-mono leading-none">{count}</span>
                <span className="text-[10px] font-mono font-bold text-slate-400 leading-none">{pct}%</span>
              </div>

              {/* Accent bottom indicator */}
              <div className={`absolute bottom-0 left-0 right-0 h-1.5 ${config.accentColor}`} />
            </button>
          );
        })}
      </div>

      {/* ── Filters and Export Toolbar ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
          {/* Search box */}
          <div className="relative flex-1 min-w-[220px] md:max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher nom, téléphone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full text-xs h-9 rounded-xl pl-9 pr-4 border outline-none transition ${
                adminTheme === 'light'
                  ? 'bg-white border-slate-200 text-slate-800 focus:ring-1 focus:ring-emerald-500 shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-200 focus:ring-1 focus:ring-emerald-500'
              }`}
            />
          </div>

          {/* Segment dropdown filter */}
          <select
            value={selectedSegmentFilter}
            onChange={(e) => setSelectedSegmentFilter(e.target.value)}
            className={`text-xs h-9 rounded-xl px-3 border outline-none font-medium cursor-pointer transition ${
              adminTheme === 'light'
                ? 'bg-white border-slate-200 text-slate-700 focus:ring-1 focus:ring-emerald-500 shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-200 focus:ring-1 focus:ring-emerald-500'
            }`}
          >
            <option value="all">Tous les segments ({rfmCustomersList.length})</option>
            {Object.entries(segmentConfig).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>

        {/* Actions Button Panel */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={handleCopyNumbers}
            disabled={filteredCustomers.length === 0}
            className={`h-9 px-3.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition duration-200 active:scale-[0.98] border ${
              filteredCustomers.length > 0
                ? (adminTheme === 'light' ? 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm' : 'bg-slate-900 border-slate-800 hover:bg-slate-850 text-slate-200')
                : 'bg-slate-100 border-slate-200/50 text-slate-400 dark:bg-slate-950 dark:border-slate-900 dark:text-slate-700 cursor-not-allowed'
            }`}
          >
            <Copy className="w-3.5 h-3.5" />
            {isCopied ? 'Copié !' : 'Copier numéros WhatsApp'}
          </button>
          
          <button
            onClick={() => setIsCampaignModalOpen(true)}
            disabled={filteredCustomers.length === 0 || isReadOnly}
            className={`h-9 px-4 text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition duration-200 active:scale-[0.98] ${
              filteredCustomers.length > 0 && !isReadOnly
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                : 'bg-slate-200 text-slate-400 border border-slate-300/20 dark:bg-slate-900 dark:border-slate-850 dark:text-slate-600 cursor-not-allowed'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Diffuser Campagne ({filteredCustomers.length})
          </button>
        </div>
      </div>

      {/* ── Customer RFM Table Grid ── */}
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
                <th className="px-5 py-4">Client</th>
                <th className="px-3 py-4">Téléphone</th>
                <th className="px-3 py-4 text-center">Dernier Achat</th>
                <th className="px-3 py-4 text-center">Commandes</th>
                <th className="px-3 py-4 text-right">Dépenses Totales</th>
                <th className="px-3 py-4 text-center">Scores R-F-M</th>
                <th className="px-5 py-4 text-center">Segment RFM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 dark:divide-slate-850/80">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer, idx) => (
                  <tr 
                    key={idx}
                    className="text-xs transition hover:bg-slate-50/50 dark:hover:bg-slate-900/20"
                  >
                    <td className="px-5 py-3.5">
                      <span className={`block font-bold truncate leading-tight ${adminTheme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>
                        {customer.name}
                      </span>
                    </td>
                    
                    <td className="px-3 py-3.5 font-mono text-slate-500">
                      {customer.phone}
                    </td>

                    <td className="px-3 py-3.5 text-center">
                      <span className={`font-mono font-semibold ${customer.lastOrderDays > 90 ? 'text-rose-500 font-bold' : ''}`}>
                        {customer.lastOrderDays === 0 ? "Aujourd'hui" : `Il y a ${customer.lastOrderDays}j`}
                      </span>
                    </td>

                    <td className="px-3 py-3.5 text-center font-mono font-bold">
                      {customer.ordersCount}
                    </td>

                    <td className="px-3 py-3.5 text-right font-mono font-bold">
                      {customer.totalSpend.toFixed(2)} DH
                    </td>

                    <td className="px-3 py-3.5 text-center">
                      <span className="inline-flex gap-1 items-center font-mono text-[10.5px]">
                        <span className={`px-1.5 py-0.5 rounded font-black ${getScoreColor(customer.rScore, adminTheme)}`}>R:{customer.rScore}</span>
                        <span className={`px-1.5 py-0.5 rounded font-black ${getScoreColor(customer.fScore, adminTheme)}`}>F:{customer.fScore}</span>
                        <span className={`px-1.5 py-0.5 rounded font-black ${getScoreColor(customer.mScore, adminTheme)}`}>M:{customer.mScore}</span>
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-center">
                      <span className={`inline-flex px-2.5 py-1 border rounded-full text-[9px] font-black uppercase tracking-wider ${
                        segmentConfig[customer.segment].badgeColor
                      }`}>
                        {segmentConfig[customer.segment].label}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-500 italic">
                    Aucun client ne correspond aux filtres RFM.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Campaign Simulation Modal ── */}
      {isCampaignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-2xl rounded-[32px] border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] ${
            adminTheme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            {/* Modal Header */}
            <div className={`p-6 border-b flex justify-between items-center ${
              adminTheme === 'light' ? 'bg-slate-55 border-slate-200' : 'bg-slate-950/60 border-slate-800'
            }`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl">
                  <Send className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className={`font-black text-base tracking-tight ${adminTheme === 'light' ? 'text-slate-850' : 'text-slate-100'}`}>
                    Simulateur de Campagne WhatsApp RFM
                  </h3>
                  <p className={`text-xs font-light ${adminTheme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                    Configurez le modèle de message et simulez la diffusion de masse sur le segment sélectionné.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsCampaignModalOpen(false);
                  setSimulationComplete(false);
                  setSimulationProgress(0);
                  setSimulationLogs([]);
                }}
                disabled={isSimulating}
                className={`p-1.5 rounded-lg border transition ${
                  adminTheme === 'light' ? 'hover:bg-slate-250 border-slate-200 text-slate-500' : 'hover:bg-slate-800 border-slate-800 text-slate-400'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cible de la Campagne</span>
                  <span className="text-[10.5px] font-bold text-emerald-500 font-mono">
                    {filteredCustomers.length} destinataire(s)
                  </span>
                </div>
                <div className={`p-3.5 rounded-xl border text-xs font-semibold ${
                  adminTheme === 'light' ? 'bg-slate-50 border-slate-200/80 text-slate-700' : 'bg-slate-950 border-slate-900 text-slate-300'
                }`}>
                  Segment ciblé : <strong className="uppercase font-black text-emerald-500">{selectedSegmentFilter === 'all' ? 'Tous les clients' : segmentConfig[selectedSegmentFilter as keyof typeof segmentConfig].label}</strong>
                </div>
              </div>

              {/* Message Template Form */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Message de Diffusion</label>
                  <span className="text-[9px] text-slate-505 font-medium">Balises : <code className="font-mono bg-slate-100 dark:bg-slate-950 px-1 py-0.5 rounded text-emerald-500">{`{NAME}`}</code>, <code className="font-mono bg-slate-100 dark:bg-slate-950 px-1 py-0.5 rounded text-emerald-500">{`{POINTS}`}</code></span>
                </div>
                
                <textarea
                  rows={5}
                  value={campaignMessage}
                  onChange={(e) => setCampaignMessage(e.target.value)}
                  disabled={isSimulating}
                  className={`w-full text-xs rounded-xl px-3.5 py-2.5 border outline-none font-medium leading-relaxed resize-none transition focus:border-emerald-500/50 ${
                    adminTheme === 'light' ? 'bg-slate-50 border-slate-200 focus:bg-white text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-100'
                  }`}
                />
              </div>

              {/* Simulation Progress & Live log console */}
              {(isSimulating || simulationComplete) && (
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <span>Statut de la diffusion</span>
                    <span>{simulationProgress}%</span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="h-2 rounded-full overflow-hidden bg-slate-150 dark:bg-slate-950 border border-slate-200/10">
                    <div 
                      style={{ width: `${simulationProgress}%` }}
                      className="bg-emerald-500 h-full transition-all duration-150"
                    />
                  </div>

                  {/* Terminal console */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Journal de la Simulation</span>
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-900 font-mono text-[9.5px] leading-relaxed text-emerald-400 max-h-40 overflow-y-auto custom-scrollbar select-none">
                      {simulationLogs.map((log, idx) => (
                        <div key={idx} className="whitespace-pre-wrap">{log}</div>
                      ))}
                      {isSimulating && (
                        <div className="flex items-center gap-1.5 text-slate-400 mt-1 animate-pulse">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Envoi en cours...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className={`p-6 border-t flex justify-end gap-3 ${
              adminTheme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
            }`}>
              <button
                onClick={() => {
                  setIsCampaignModalOpen(false);
                  setSimulationComplete(false);
                  setSimulationProgress(0);
                  setSimulationLogs([]);
                }}
                disabled={isSimulating}
                className={`px-4 h-10 text-xs font-bold rounded-xl border transition ${
                  adminTheme === 'light'
                    ? 'hover:bg-slate-100 border-slate-200 text-slate-650'
                    : 'hover:bg-slate-800 border-slate-800 text-slate-300'
                }`}
              >
                Fermer
              </button>

              <button
                onClick={startCampaignSimulation}
                disabled={isSimulating || isReadOnly || simulationComplete}
                className={`px-5 h-10 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
                  isSimulating || isReadOnly || simulationComplete
                    ? 'bg-slate-100 text-slate-400 dark:bg-slate-950 dark:text-slate-700 cursor-not-allowed'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20 active:scale-[0.97] cursor-pointer'
                }`}
              >
                {isSimulating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Envoi...
                  </>
                ) : simulationComplete ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-350" />
                    Complété !
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    Lancer la Diffusion
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ── Helpers ──
function statsPct(count: number, total: number) {
  if (total === 0) return 0;
  return Math.round((count / total) * 100);
}

function getScoreColor(score: number, theme: 'light' | 'dark') {
  if (score >= 4) {
    return theme === 'light' 
      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100/50' 
      : 'bg-emerald-950/20 text-emerald-400 border border-emerald-900/30';
  }
  if (score >= 3) {
    return theme === 'light' 
      ? 'bg-indigo-50 text-indigo-700 border border-indigo-100/50' 
      : 'bg-indigo-950/20 text-indigo-400 border border-indigo-900/30';
  }
  if (score >= 2) {
    return theme === 'light' 
      ? 'bg-amber-50 text-amber-700 border border-amber-100/50' 
      : 'bg-amber-950/20 text-amber-400 border border-amber-900/30';
  }
  return theme === 'light' 
    ? 'bg-rose-50 text-rose-700 border border-rose-100/50' 
    : 'bg-rose-950/20 text-rose-400 border border-rose-900/30';
}
