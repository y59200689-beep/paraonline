'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { useLoyalty, LoyaltyTier } from '@/context/LoyaltyContext';
import { useSettings } from '@/context/SettingsContext';
import { supabase } from '@/lib/supabase';
import { 
  Search, ShoppingBag, ArrowLeft, Clock, MapPin, 
  Award, Coins, Ticket, Check, Copy, Calendar, Plus, 
  Smile, Meh, Frown, Sparkles, BookOpen, Camera, X,
  Image as ImageIcon
} from 'lucide-react';
import { Product } from '@/lib/data';
import Link from 'next/link';
import { useUi } from '@/context/UiContext';
import { CustomerAuthPortal } from '@/components/CustomerAuthPortal';
import { ShopShell } from '@/components/ShopShell';

interface OrderItem {
  id: number;
  title: string;
  quantity: number;
  price: number;
}

interface LocalOrderItem {
  product: Product;
  quantity: number;
}

interface LocalOrder {
  order_id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  items: LocalOrderItem[];
  subtotal: number;
  discountAmount?: number;
  appliedCoupon: string | null;
  giftItem: string | null;
  total: number;
  status?: string;
  date?: string;
}

interface Order {
  order_id: string;
  customer_name: string;
  phone_number: string;
  address: string;
  city: string;
  notes?: string;
  items: OrderItem[];
  subtotal: number;
  discount_amount: number;
  applied_coupon: string | null;
  gift_item: string | null;
  total: number;
  status: string;
  date?: string;
  created_at?: string;
}

interface DiaryLog {
  id: string;
  date: string;
  emoji: string;
  note: string;
  image?: string;
}

export default function CustomerDashboard() {
  const { language } = useTranslation();
  const { settings } = useSettings();
  const isRTL = language === 'AR';

  // Loyalty states
  const {
    points,
    totalEarned,
    tier,
    pointsHistory,
    redeemReward,
    tierMultiplier,
    pointsToNextTier,
    earnPoints,
    clientUser,
    isLoadingAuth,
    loginClient,
    signUpClient,
    logoutClient,
    syncDiaryLogs,
    syncPlannerDates,
    fetchDiaryLogs,
    fetchPlannerDates,
  } = useLoyalty();
  const { showToast } = useUi();

  // Tab State
  const [activeTab, setActiveTab] = useState<'suivi' | 'club' | 'journal'>('suivi');

  // Tab Bar Sliding Pill logic
  const [pillStyle, setPillStyle] = useState<{ transform: string; width: string }>({ transform: 'translateX(0)', width: '0px' });
  const tabsRef = React.useRef<HTMLDivElement>(null);

  // Auth form states
  const [showAuthPanel, setShowAuthPanel] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Auth Modal transition states
  const [isAuthModalVisible, setIsAuthModalVisible] = useState(false);
  const [authModalState, setAuthModalState] = useState<'closed' | 'opening' | 'open' | 'closing'>('closed');
  const closeMs = 160; // must match --modal-close-dur

  // Auth modal lifecycle
  useEffect(() => {
    if (showAuthPanel) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsAuthModalVisible(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAuthModalState('open'));
      });
    } else if (authModalState === 'open') {
      setAuthModalState('closing');
      const t = setTimeout(() => {
        setAuthModalState('closed');
        setIsAuthModalVisible(false);
      }, closeMs);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAuthPanel]);

  useEffect(() => {
    if (tabsRef.current) {
      const activeEl = tabsRef.current.querySelector('[aria-selected="true"]') as HTMLElement;
      if (activeEl) {
        setPillStyle({
          transform: `translateX(${activeEl.offsetLeft}px)`,
          width: `${activeEl.offsetWidth}px`
        });
      }
    }
  }, [activeTab, language]);

  // Tracking states
  const [searchContact, setSearchContact] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Skincare Diary & Planner States
  const [diaryNote, setDiaryNote] = useState('');
  const [diaryEmoji, setDiaryEmoji] = useState('🙂');
  const [diaryLogs, setDiaryLogs] = useState<DiaryLog[]>([]);
  const [diaryImage, setDiaryImage] = useState<string | null>(null);
  const [compareLogA, setCompareLogA] = useState<DiaryLog | null>(null);
  const [compareLogB, setCompareLogB] = useState<DiaryLog | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  // Checklist State for Today
  const [amChecks, setAmChecks] = useState({ cleanse: false, treat: false, hydrate: false, protect: false });
  const [pmChecks, setPmChecks] = useState({ cleanse: false, treat: false, hydrate: false });
  const [amDoneDates, setAmDoneDates] = useState<string[]>([]);
  const [pmDoneDates, setPmDoneDates] = useState<string[]>([]);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Success Notice height transition lifecycle states
  const [activeNotice, setActiveNotice] = useState<string | null>(null);
  const [showNotice, setShowNotice] = useState(false);

  useEffect(() => {
    if (successNotice) {
      setActiveNotice(successNotice);
      setShowNotice(true);
    } else {
      setShowNotice(false);
      const timer = setTimeout(() => {
        setActiveNotice(null);
      }, 300); // matches transition-all duration-300
      return () => clearTimeout(timer);
    }
  }, [successNotice]);

  // Rewards definition
  const rewards = [
    {
      id: 'reward-1',
      cost: 200,
      code: 'FREESHIP',
      nameFr: 'Livraison Gratuite',
      nameAr: 'توصيل مجاني',
      descFr: 'Annule les frais de livraison sur votre prochaine commande.',
      descAr: 'يلغي مصاريف الشحن لطلبكِ القادم بدون حد أدنى.'
    },
    {
      id: 'reward-2',
      cost: 300,
      code: 'BEAUTY10',
      nameFr: 'Bon de Réduction −10%',
      nameAr: 'خصم −10% إضافي',
      descFr: 'Bénéficiez de 10% de réduction immédiate à la caisse.',
      descAr: 'احصلي على خصم 10% فوري عند الدفع عند تأكيد الطلب.'
    },
    {
      id: 'reward-3',
      cost: 500,
      code: 'CLINICAL15',
      nameFr: 'Bon de Réduction −15%',
      nameAr: 'خصم −15% إضافي',
      descFr: 'Bénéficiez de 15% de réduction immédiate à la caisse.',
      descAr: 'احصلي على خصم 15% فوري عند الدفع عند تأكيد الطلب.'
    }
  ];

  // Load Diary & Planner — from Supabase if logged in, localStorage otherwise
  useEffect(() => {
    const loadData = async () => {
      try {
        const logs = await fetchDiaryLogs();
        setDiaryLogs(logs);
        const { amDates, pmDates } = await fetchPlannerDates();
        setAmDoneDates(amDates);
        setPmDoneDates(pmDates);
      } catch (e) {
        console.error('Error loading diary/planner data:', e);
      }
    };
    loadData();
  // Re-load whenever auth user changes (login / logout)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientUser]);

  const getTodayDateString = () => {
    return new Date().toISOString().split('T')[0];
  };

  const todayStr = getTodayDateString();
  const isAmTodayCompleted = amDoneDates.includes(todayStr);
  const isPmTodayCompleted = pmDoneDates.includes(todayStr);

  // Auth handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);
    const result = await loginClient(authEmail, authPassword);
    setAuthLoading(false);
    if (result.success) {
      setShowAuthPanel(false);
      setAuthEmail('');
      setAuthPassword('');
    } else {
      setAuthError(result.error || (language === 'FR' ? 'Erreur de connexion.' : 'خطأ في تسجيل الدخول.'));
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);
    const result = await signUpClient(authEmail, authPassword, authName, authPhone);
    setAuthLoading(false);
    if (result.success) {
      setShowAuthPanel(false);
      setAuthEmail('');
      setAuthPassword('');
      setAuthName('');
      setAuthPhone('');
    } else {
      setAuthError(result.error || (language === 'FR' ? 'Erreur lors de la création du compte.' : 'خطأ أثناء إنشاء الحساب.'));
    }
  };

  // Submit Order Tracking Search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchContact.trim()) return;

    setIsSearching(true);
    setHasSearched(true);
    let matchedOrders: Order[] = [];

    // 1. Try secure server-side lookup
    try {
      const res = await fetch(`/api/orders?search=${encodeURIComponent(searchContact.trim())}`);
      const data = await res.json();
      if (data.success && data.orders) {
        matchedOrders = data.orders;
      }
    } catch (err) {
      console.error('Server lookup failed, falling back to local:', err);
    }

    // 2. Local Fallback lookup
    if (matchedOrders.length === 0) {
      try {
        const localOrders = JSON.parse(localStorage.getItem('ordersBM') || '[]') as LocalOrder[];
        matchedOrders = localOrders.filter(
          (o) =>
            o.phone?.includes(searchContact) ||
            o.name?.toLowerCase().includes(searchContact.toLowerCase()) ||
            o.order_id?.includes(searchContact)
        ).map(o => ({
          order_id: o.order_id,
          customer_name: o.name,
          phone_number: o.phone,
          address: o.address,
          city: o.city,
          items: o.items.map((item) => ({
            id: item.product.id,
            title: item.product.title,
            quantity: item.quantity,
            price: item.product.price
          })),
          subtotal: o.subtotal,
          discount_amount: o.discountAmount || 0,
          applied_coupon: o.appliedCoupon,
          gift_item: o.giftItem,
          total: o.total,
          status: o.status || 'Pending',
          date: o.date
        }));
      } catch (err) {
        console.error('Local fallback failed:', err);
      }
    }

    setOrders(matchedOrders);
    setIsSearching(false);
  };

  // Redeem coupon flow
  const handleRedeem = (reward: typeof rewards[0]) => {
    setSuccessNotice(null);
    if (points < reward.cost) {
      showToast(
        language === 'FR' 
          ? `Points insuffisants. Il vous manque ${reward.cost - points} points.` 
          : `نقاط غير كافية. يتبقى لكِ ${reward.cost - points} نقطة.`,
        'warning'
      );
      return;
    }

    const success = redeemReward(
      reward.cost, 
      reward.code, 
      `Coupon ${reward.nameFr}`, 
      `كوبون ${reward.nameAr}`
    );

    if (success) {
      setSuccessNotice(
        language === 'FR' 
          ? `Succès ! Code ${reward.code} débloqué. Copiez-le ci-dessous.` 
          : `تم بنجاح! تم فتح الرمز ${reward.code}. انسخيه بالأسفل.`
      );
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      // Use window.Image instead of react element
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600;
        const scale = img.width > MAX_WIDTH ? MAX_WIDTH / img.width : 1;
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const base64 = canvas.toDataURL('image/jpeg', 0.7);
          setDiaryImage(base64);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSelectForCompare = (log: DiaryLog) => {
    if (!log.image) return;
    if (compareLogA?.id === log.id) {
      setCompareLogA(null);
    } else if (compareLogB?.id === log.id) {
      setCompareLogB(null);
    } else if (!compareLogA) {
      setCompareLogA(log);
    } else if (!compareLogB) {
      // Set second photo and start comparison
      setCompareLogB(log);
      setIsComparing(true);
    } else {
      setCompareLogA(log);
      setCompareLogB(null);
    }
  };

  // Submit skincare diary log entry
  const handleSubmitDiary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!diaryNote.trim() && !diaryImage) return;

    const newLog: DiaryLog = {
      id: Math.random().toString(36).substring(2, 9),
      date: new Date().toISOString(),
      emoji: diaryEmoji,
      note: diaryNote.trim(),
      ...(diaryImage ? { image: diaryImage } : {})
    };

    const updatedLogs = [newLog, ...diaryLogs];
    setDiaryLogs(updatedLogs);
    syncDiaryLogs(updatedLogs);
    
    // Reward points for checking in on skincare diary (+5 points)
    earnPoints(5, "Entrée dans le journal de peau", "تسجيل في مفكرة البشرة اليومية");

    setDiaryNote('');
    setDiaryImage(null);
    setSuccessNotice(
      language === 'FR'
        ? "Journal de peau enregistré (+5 Points) !"
        : "تم تسجيل مفكرة البشرة (+5 نقاط)!"
    );
    setTimeout(() => setSuccessNotice(null), 4000);
  };

  // Complete AM Checklist & earn points
  const handleCompleteAmRoutine = () => {
    if (isAmTodayCompleted) return;
    if (!amChecks.cleanse || !amChecks.treat || !amChecks.hydrate || !amChecks.protect) {
      showToast(
        language === 'FR'
          ? "Veuillez cocher toutes les étapes de votre rituel Matin."
          : "يرجى تحديد جميع خطوات روتين الصباح أولاً.",
        'warning'
      );
      return;
    }

    const updatedDates = [...amDoneDates, todayStr];
    setAmDoneDates(updatedDates);
    syncPlannerDates(updatedDates, pmDoneDates);

    // Award +5 points
    earnPoints(5, "Rituel de soin du Matin complété", "إتمام روتين العناية الصباحي");

    setSuccessNotice(
      language === 'FR'
        ? "Rituel du Matin validé ! +5 Points Fidélité ajoutés."
        : "تم إكمال روتين الصباح! تم إضافة +5 نقاط."
    );
    setTimeout(() => setSuccessNotice(null), 4000);
  };

  // Complete PM Checklist & earn points
  const handleCompletePmRoutine = () => {
    if (isPmTodayCompleted) return;
    if (!pmChecks.cleanse || !pmChecks.treat || !pmChecks.hydrate) {
      showToast(
        language === 'FR'
          ? "Veuillez cocher toutes les étapes de votre rituel Soir."
          : "يرجى تحديد جميع خطوات روتين المساء أولاً.",
        'warning'
      );
      return;
    }

    const updatedDates = [...pmDoneDates, todayStr];
    setPmDoneDates(updatedDates);
    syncPlannerDates(amDoneDates, updatedDates);

    // Award +5 points
    earnPoints(5, "Rituel de soin du Soir complété", "إتمام روتين العناية المسائي");

    setSuccessNotice(
      language === 'FR'
        ? "Rituel du Soir validé ! +5 Points Fidélité ajoutés."
        : "تم إكمال روتين المساء! تم إضافة +5 نقاط."
    );
    setTimeout(() => setSuccessNotice(null), 4000);
  };

  // Loyalty Card Styles configuration
  const getCardStyles = (activeTier: LoyaltyTier) => {
    switch (activeTier) {
      case 'Platinum':
        return {
          bg: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%)',
          text: 'text-slate-100',
          badgeBg: 'bg-slate-700/50 border-slate-500/50 text-slate-200',
          shadow: 'shadow-[0_12px_36px_rgba(15,23,42,0.25)]',
          label: language === 'FR' ? 'Membre Platinum' : 'عضو بلاتيني'
        };
      case 'Gold':
        return {
          bg: 'linear-gradient(135deg, #B45309 0%, #D97706 50%, #F59E0B 100%)',
          text: 'text-amber-50',
          badgeBg: 'bg-amber-800/40 border-amber-500/50 text-amber-200',
          shadow: 'shadow-[0_12px_36px_rgba(217,119,6,0.25)]',
          label: language === 'FR' ? 'Membre Gold' : 'عضو ذهبي'
        };
      case 'Silver':
        return {
          bg: 'linear-gradient(135deg, #475569 0%, #64748B 50%, #94A3B8 100%)',
          text: 'text-slate-50',
          badgeBg: 'bg-slate-700/30 border-slate-500/30 text-slate-200',
          shadow: 'shadow-[0_12px_36px_rgba(100,116,139,0.25)]',
          label: language === 'FR' ? 'Membre Silver' : 'عضو فضي'
        };
      default: // Bronze
        return {
          bg: 'linear-gradient(135deg, #78350F 0%, #92400E 50%, #B45309 100%)',
          text: 'text-amber-50',
          badgeBg: 'bg-amber-900/30 border-amber-700/30 text-amber-200',
          shadow: 'shadow-[0_12px_36px_rgba(146,64,14,0.2)]',
          label: language === 'FR' ? 'Membre Bronze' : 'عضو برونزي'
        };
    }
  };

  const cardStyle = getCardStyles(tier);

  const authBackdropCls = [
    't-modal-backdrop',
    'fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md transition-all duration-300',
    authModalState === 'open' ? 'opacity-100' : 'opacity-0 pointer-events-none',
  ].join(' ');

  const authModalCls = [
    't-modal',
    'bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100/80 dark:border-slate-800/80 w-full max-w-md p-8 relative overflow-hidden transition-all duration-300 transform shadow-premium',
    authModalState === 'open' ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4 pointer-events-none',
  ].join(' ');

  return (
    <ShopShell hideHeader={!clientUser}>
      <div 
        className={`min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950 relative overflow-hidden transition-colors page-entry-animate ${
          !clientUser ? 'flex flex-col items-center justify-center p-4 sm:p-6 lg:p-10' : 'py-12 px-4 sm:px-6 lg:px-8'
        }`}
        style={{ direction: isRTL ? 'rtl' : 'ltr' }}
      >
        {/* Radial ambient background blurs */}
        <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.02] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="pointer-events-none absolute -top-40 left-1/3 w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-40 right-1/3 w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-[120px]" />

        <div className={`w-full relative z-10 ${!clientUser ? 'max-w-6xl' : 'max-w-5xl mx-auto space-y-8'}`}>
          {/* ── Welcome Account / Login Banner ── */}
          {!clientUser && !isLoadingAuth ? (
          <CustomerAuthPortal
            authView={authView}
            setAuthView={setAuthView}
            authEmail={authEmail}
            setAuthEmail={setAuthEmail}
            authPassword={authPassword}
            setAuthPassword={setAuthPassword}
            authName={authName}
            setAuthName={setAuthName}
            authPhone={authPhone}
            setAuthPhone={setAuthPhone}
            authError={authError}
            authLoading={authLoading}
            handleLogin={handleLogin}
            handleSignup={handleSignup}
          />
        ) : (
          <div className="bg-white border border-slate-200/50 rounded-3xl p-6 shadow-premium relative overflow-hidden backdrop-blur-md">
            {/* Subtle glow background */}
            <div className="absolute -right-24 -top-24 w-48 h-48 rounded-full bg-accent/5 blur-3xl pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row items-center justify-between gap-5 relative z-10">
              {isLoadingAuth ? (
                <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold py-2">
                  <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                  <span>{language === 'FR' ? 'Connexion en cours…' : 'جاري التحميل…'}</span>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4 min-w-0" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center text-sm font-black shrink-0 select-none shadow-md">
                      {(clientUser?.name || clientUser?.email || 'C').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                      <p className="text-sm font-black text-slate-800 leading-tight">{clientUser?.name || clientUser?.email}</p>
                      <div className="flex items-center gap-2 mt-1.5" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                        <span className="relative flex h-2 w-2 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <p className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider leading-none">
                          {language === 'FR' ? 'Compte Synchronisé Cloud' : 'حساب متزامن بالكامل'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={logoutClient}
                    className="text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-rose-500 py-2.5 px-4 rounded-xl hover:bg-rose-50/50 transition-all duration-300 cursor-pointer shrink-0 border border-slate-100 hover:border-rose-100 bg-transparent"
                  >
                    {language === 'FR' ? 'Déconnexion' : 'خروج'}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── Rebranded Luxury Auth Modal ── */}
        {isAuthModalVisible && (
          <div
            className={authBackdropCls}
            onClick={(e) => { if (e.target === e.currentTarget) setShowAuthPanel(false); }}
          >
            <div className="w-full max-w-4xl p-2 relative">
              <button
                onClick={() => setShowAuthPanel(false)}
                className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-slate-900 border border-slate-800 text-white flex items-center justify-center hover:bg-slate-800 transition cursor-pointer z-50"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              
              <CustomerAuthPortal
                authView={authView}
                setAuthView={setAuthView}
                authEmail={authEmail}
                setAuthEmail={setAuthEmail}
                authPassword={authPassword}
                setAuthPassword={setAuthPassword}
                authName={authName}
                setAuthName={setAuthName}
                authPhone={authPhone}
                setAuthPhone={setAuthPhone}
                authError={authError}
                authLoading={authLoading}
                handleLogin={handleLogin}
                handleSignup={handleSignup}
                onClose={() => setShowAuthPanel(false)}
                isModal={true}
              />
            </div>
          </div>
        )}



        {/* Global Notifications Panel */}
        <div className="!mt-0">
          <div className={`grid transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${
            showNotice 
              ? 'grid-rows-[1fr] opacity-100 pt-6' 
              : 'grid-rows-[0fr] opacity-0 pt-0 pointer-events-none'
          }`}>
            <div className="overflow-hidden">
              {activeNotice && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 rounded-2xl text-xs font-bold text-center flex items-center justify-center gap-2 shadow-sm animate-scale-pop">
                  <span className="t-success-check shrink-0 text-emerald-600" data-state="in">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 8.5L6.5 12L13 4" />
                    </svg>
                  </span>
                  <span>{activeNotice}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ──────── TAB 1: SUIVI DE COMMANDE ──────── */}
        {activeTab === 'suivi' && (
          <div className="space-y-6 animate-fade-in">


            {/* Results Deck */}
            <div className="space-y-6">
              {isSearching ? (
                <div className="text-center py-14">
                  <div className="w-8 h-8 border-4 border-solid border-accent border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : hasSearched && orders.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/50 space-y-4 shadow-sm relative overflow-hidden">
                  <div className="absolute right-0 bottom-0 w-24 h-24 rounded-full bg-slate-50 blur-xl pointer-events-none" />
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-500">
                    <ShoppingBag className="w-5 h-5 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-slate-800 font-heading uppercase tracking-wide">
                      {language === 'FR' ? 'Aucune commande trouvée' : 'لم يتم العثور على أي طلب'}
                    </h3>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed font-semibold">
                      {language === 'FR'
                        ? 'Aucune commande trouvée pour ces informations. Vérifiez le numéro de téléphone.'
                        : 'لم نجد أي طلب مسجل بهذه البيانات. يرجى التحقق من الرقم المدخل.'}
                    </p>
                  </div>
                </div>
              ) : (
                orders.map((order) => (
                  <div 
                    key={order.order_id}
                    className="bg-white border border-slate-200/50 rounded-3xl p-6 shadow-premium space-y-6 relative overflow-hidden"
                  >
                    {/* Brand line indicator */}
                    <div className="absolute top-0 right-0 left-0 h-[3px] bg-gradient-to-r from-accent via-gold to-slate-900" />

                    {/* Header card: ID and Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 text-left" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-black text-slate-450 block tracking-wider uppercase">{language === 'FR' ? 'RÉFÉRENCE DE COMMANDE' : 'رقم الطلب'}</span>
                        <span className="text-sm font-mono font-black tracking-wider text-slate-900">{order.order_id}</span>
                      </div>

                      {/* Status Badge */}
                      <span className={`self-start sm:self-center px-3.5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                        order.status.toLowerCase() === 'shipped' || order.status.toLowerCase() === 'delivered'
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/10'
                          : order.status.toLowerCase() === 'confirmed'
                          ? 'bg-accent/10 text-accent border-accent/10'
                          : 'bg-amber-500/10 text-amber-600 border-amber-500/10'
                      }`}>
                        {order.status.toLowerCase() === 'shipped' || order.status.toLowerCase() === 'delivered'
                          ? (language === 'FR' ? 'Expédié & Livré' : 'تم الشحن والتوصيل')
                          : order.status.toLowerCase() === 'confirmed'
                          ? (language === 'FR' ? 'Confirmé' : 'مؤكد')
                          : (language === 'FR' ? 'En Cours ⏳' : 'قيد الانتظار ⏳')
                        }
                      </span>
                    </div>

                    {/* Visual Timeline Tracking */}
                    <div className="py-4 select-none">
                      <div className="relative flex items-center justify-between w-full">
                        {/* Progress track background line */}
                        <div className="absolute left-0 right-0 top-4 -translate-y-1/2 h-1 bg-slate-100 rounded-full z-0" />
                        {/* Active progress line */}
                        <div 
                          className="absolute top-4 -translate-y-1/2 h-1 bg-accent rounded-full z-0 transition-all duration-750" 
                          style={{ 
                            width: order.status.toLowerCase() === 'shipped' || order.status.toLowerCase() === 'delivered' 
                              ? '100%' 
                              : order.status.toLowerCase() === 'confirmed' 
                              ? '50%' 
                              : '0%',
                            right: isRTL ? 0 : 'auto',
                            left: isRTL ? 'auto' : 0
                          }} 
                        />
                        {[
                          { id: 'pending', labelFr: 'Reçu', labelAr: 'تم التوصل', descFr: 'Reçu par l\'officine', descAr: 'تم استلام الطلب' },
                          { id: 'confirmed', labelFr: 'Confirmé', labelAr: 'مؤكد', descFr: 'Validé en préparation', descAr: 'تم التأكيد الهاتفي' },
                          { id: 'shipped', labelFr: 'Livré', labelAr: 'تم التوصيل', descFr: 'Colis remis au coursier', descAr: 'خارج للتوصيل حالياً' }
                        ].map((step, idx) => {
                          const isDone = 
                            idx === 0 || 
                            (idx === 1 && (order.status.toLowerCase() === 'confirmed' || order.status.toLowerCase() === 'shipped' || order.status.toLowerCase() === 'delivered')) ||
                            (idx === 2 && (order.status.toLowerCase() === 'shipped' || order.status.toLowerCase() === 'delivered'));
                          
                          return (
                            <div key={step.id} className="relative z-10 flex flex-col items-center">
                              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                                isDone 
                                  ? 'bg-accent border-accent text-white shadow-md' 
                                  : 'bg-white border-slate-200 text-slate-400'
                              }`}>
                                {isDone ? (
                                  <Check className="w-4 h-4 stroke-[3]" />
                                ) : (
                                  <span className="text-[10px] font-black">{idx + 1}</span>
                                )}
                              </div>
                              <span className="text-[9px] font-black uppercase tracking-wider text-slate-800 mt-2.5">{language === 'FR' ? step.labelFr : step.labelAr}</span>
                              <span className="text-[7.5px] font-semibold text-slate-400 mt-0.5 leading-none max-w-[80px] text-center hidden sm:block">{language === 'FR' ? step.descFr : step.descAr}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Order Details & Summary Accordion */}
                    <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4.5 space-y-4">
                      <div className="flex items-center gap-2 border-b border-slate-100/50 pb-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase">{language === 'FR' ? 'ADRESSE DE LIVRAISON' : 'عنوان التسليم'}</span>
                      </div>
                      <p className="text-xs text-slate-700 font-semibold leading-relaxed text-left" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                        <span className="font-extrabold text-slate-900">{order.customer_name}</span> • {order.phone_number} <br />
                        {order.address}, <span className="font-black">{order.city}</span>
                      </p>

                      <div className="border-t border-slate-100/80 pt-3 space-y-2">
                        <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase block text-left" style={{ textAlign: isRTL ? 'right' : 'left' }}>{language === 'FR' ? 'PRODUITS COMMANDÉS' : 'المنتجات المطلوبة'}</span>
                        <div className="divide-y divide-slate-100/40">
                          {order.items && order.items.map((item: any, i: number) => (
                            <div key={i} className="py-2.5 flex items-center justify-between text-xs font-semibold gap-4 text-left" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                              <span className="text-slate-750 truncate flex-1 leading-normal" style={{ textAlign: isRTL ? 'right' : 'left' }}>{item.title} <span className="text-[10px] text-slate-400 font-bold ml-1">x{item.quantity}</span></span>
                              <span className="text-slate-900 font-mono font-bold shrink-0">{item.price * item.quantity} DH</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs font-black text-slate-900" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                        <span>TOTAL À PAYER (COD) :</span>
                        <span className="text-sm font-mono tracking-tight text-accent bg-accent/5 px-3 py-1 rounded-lg border border-accent/10">{order.total} DH</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ──────── TAB 2: CLUB PARA (LOYALTY) ──────── */}
        {activeTab === 'club' && (
          <div className="space-y-8 animate-fade-in">
            
            {/* ── Rebranded Premium Loyalty Card ── */}
            <div 
              className={`w-full aspect-[1.66/1] md:aspect-[1.8/1] rounded-[28px] p-6 md:p-8 relative overflow-hidden flex flex-col justify-between ${cardStyle.shadow} border border-white/25 select-none`}
              style={{ background: cardStyle.bg }}
            >
              {/* Luxury ambient light glares */}
              <div className="absolute -right-12 -top-12 w-52 h-52 rounded-full bg-white/10 blur-3xl pointer-events-none" />
              <div className="absolute -left-12 -bottom-12 w-52 h-52 rounded-full bg-white/5 blur-3xl pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
              
              {/* Animated reflective glare */}
              <div className="absolute -inset-y-16 -left-1/4 w-16 bg-gradient-to-r from-transparent via-white/15 to-transparent blur-md transform rotate-25 animate-pulse" />

              {/* Card Header */}
              <div className="flex items-start justify-between relative z-10" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                <div className="flex flex-col text-left" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                  <span className={`text-[9px] font-black uppercase tracking-[0.25em] ${cardStyle.text} opacity-60 leading-none`}>
                    CLUB PARA BEAUTY VIP
                  </span>
                  <span className={`text-sm font-black font-heading ${cardStyle.text} mt-2.5 leading-none`}>
                    {language === 'FR' ? 'Para Officinal S.A' : 'مستحضراتنا الرسمية'}
                  </span>
                </div>
                <span className={`text-[8.5px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-xl border ${cardStyle.badgeBg} shadow-sm backdrop-blur-sm`}>
                  {cardStyle.label}
                </span>
              </div>

              {/* Card Chip & Contactless Waves */}
              <div className="flex items-center gap-4 relative z-10" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                {/* Chip Mockup */}
                <div className="w-10 h-7 rounded-[7px] bg-gradient-to-br from-amber-300 via-amber-200 to-amber-400 border border-amber-400/40 relative shadow-[inset_0_1px_3px_rgba(255,255,255,0.7)] opacity-90 overflow-hidden shrink-0">
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-amber-600/30" />
                  <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] bg-amber-600/30" />
                  <div className="absolute inset-[3px] rounded-[3px] border border-amber-600/20" />
                </div>
                
                {/* NFC Contactless waves */}
                <svg className="w-6 h-6 text-white/40 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 00-6-6M12 22.5c-4.142 0-7.5-3.358-7.5-7.5m7.5 11.25a9.75 9.75 0 00-9.75-9.75m9.75 13.5A12 12 0 003 15" />
                </svg>
              </div>

              {/* Balances */}
              <div className="flex items-end justify-between relative z-10" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                <div className="flex flex-col items-start" style={{ alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
                  <span className={`text-[8.5px] font-bold uppercase tracking-widest ${cardStyle.text} opacity-60`}>
                    {language === 'FR' ? 'SOLDE DE POINTS FIDÉLITÉ' : 'رصيد النقاط الفعال'}
                  </span>
                  <span className={`text-4xl md:text-5xl font-black ${cardStyle.text} tracking-tight leading-none mt-1.5`}>
                    {points} <span className="text-xs md:text-sm font-semibold uppercase opacity-80 tracking-wider">pts</span>
                  </span>
                </div>

                <div className="flex flex-col text-left" style={{ textAlign: isRTL ? 'left' : 'right', alignItems: isRTL ? 'flex-start' : 'flex-end' }}>
                  <span className={`text-[8px] font-black uppercase tracking-wider ${cardStyle.text} opacity-50`}>
                    {language === 'FR' ? 'Multiplicateur' : 'مضاعف النقats'}
                  </span>
                  <span className={`text-xs font-black ${cardStyle.text} mt-1`}>
                    {tierMultiplier}x {language === 'FR' ? 'Points' : 'نقاط'}
                  </span>
                </div>
              </div>
            </div>

            {/* Tier Milestone Progress */}
            {pointsToNextTier > 0 ? (
              <div className="bg-white border border-slate-200/50 rounded-3xl p-5 shadow-sm text-left">
                <div className="flex items-center justify-between text-xs font-black text-slate-700 mb-3.5">
                  <span className="flex items-center gap-1.5">
                    <Award className="w-4.5 h-4.5 text-accent animate-pulse" />
                    <span>{language === 'FR' ? 'Objectif Prochain Niveau' : 'المستوى التالي'}</span>
                  </span>
                  <span className="text-slate-500 font-extrabold">{pointsToNextTier} pts</span>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-x-0 -top-1.5 flex justify-between px-1 pointer-events-none select-none">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="w-[1.5px] h-1.5 bg-slate-200" />
                    ))}
                  </div>
                  
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/20">
                    <div 
                      className="h-full bg-gradient-to-r from-accent via-teal-500 to-gold rounded-full transition-all duration-750 ease-out"
                      style={{
                        width: `${Math.min((totalEarned / (totalEarned + pointsToNextTier)) * 100, 100)}%`
                      }}
                    />
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 leading-relaxed font-semibold mt-3">
                  {language === 'FR'
                    ? `Cumulez ${pointsToNextTier} points supplémentaires d'achat ou de journal pour passer au statut supérieur.`
                    : `اكتسبي ${pointsToNextTier} نقطة إضافية لتفعيل فئة العضوية التالية.`}
                </p>
              </div>
            ) : (
              <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-3xl p-5 flex gap-4 shadow-sm text-left">
                <div className="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 text-emerald-600">
                  <Award className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <span className="text-[10.5px] font-black text-emerald-600 uppercase tracking-widest block">
                    {language === 'FR' ? 'STATUT PLATINUM MAXIMUM' : 'عضوية VIP البلاتينية القصوى'}
                  </span>
                  <p className="text-[10px] text-slate-450 leading-relaxed font-semibold mt-1">
                    {language === 'FR'
                      ? 'Traitement VIP activé : Vous disposez du multiplicateur x2.0 et de la livraison express prioritaire.'
                      : 'تهانينا! حسابكِ يتمتع بمضاعف النقاط الأقصى x2.0 وأولوية الشحن السريع لجميع طلباتكِ.'}
                  </p>
                </div>
              </div>
            )}

            {/* Redeem Vouchers (Premium Ticket Card Design) */}
            <div className="flex flex-col gap-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 text-left block">
                {language === 'FR' ? 'BONS DISPONIBLES À DÉBLOQUER' : 'كوبونات متاحة للاسترداد بالنقاط'}
              </span>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {rewards.map((reward, index) => {
                  const canRedeem = points >= reward.cost;
                  return (
                    <div 
                      key={reward.id}
                      className="bg-white border border-slate-200/50 rounded-2xl flex flex-col justify-between relative overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
                    >
                      {/* Ticket Rounded Punches */}
                      <div className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-4 h-5 rounded-r-full bg-[#FAF9F6] border-y border-r border-slate-200/50" />
                      <div className="absolute right-[-8px] top-1/2 -translate-y-1/2 w-4 h-5 rounded-l-full bg-[#FAF9F6] border-y border-l border-slate-200/50" />

                      {/* Upper Stub */}
                      <div className="p-5 flex-1 flex flex-col gap-3.5 text-left" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                        <div className="w-9 h-9 rounded-xl bg-accent/5 border border-accent/10 flex items-center justify-center text-accent">
                          <Ticket className="w-4.5 h-4.5" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xs font-black text-slate-800 leading-tight">
                            {language === 'FR' ? reward.nameFr : reward.nameAr}
                          </h4>
                          <p className="text-[10.5px] text-slate-400 font-semibold leading-relaxed">
                            {language === 'FR' ? reward.descFr : reward.descAr}
                          </p>
                        </div>
                      </div>

                      {/* Dashed Separator */}
                      <div className="border-t border-dashed border-slate-200 mx-4" />

                      {/* Lower Stub */}
                      <div className="p-5 flex items-center justify-between select-none" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                        <span className="text-[11px] font-black text-slate-800 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
                          {reward.cost} pts
                        </span>
                        <button
                          onClick={() => handleRedeem(reward)}
                          disabled={!canRedeem}
                          className={`px-4 py-2.5 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 active:scale-[0.97] cursor-pointer border-0 outline-none ${
                            canRedeem
                              ? 'bg-primary text-white hover:bg-accent shadow-sm'
                              : 'bg-slate-55 text-slate-300 border border-slate-100 cursor-not-allowed'
                          }`}
                        >
                          {language === 'FR' ? 'Prendre' : 'استرداد'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Unlocked coupon copy field */}
            {successNotice?.includes('débloqué') && (
              <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 animate-scale-pop text-left" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                <div>
                  <span className="text-[9px] font-black text-emerald-600 block uppercase tracking-widest leading-none">{language === 'FR' ? 'CODE PROMO DÉBLOQUÉ' : 'رمز الخصم المفتوح'}</span>
                  <p className="text-[10.5px] text-slate-500 font-semibold mt-1 leading-snug">
                    {language === 'FR' ? 'Copiez ce code de réduction et collez-le au moment du paiement.' : 'انسخي الكود واستعمليه في صفحة الدفع لتطبيق الخصم.'}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                  <span className="font-mono text-xs font-black text-slate-900 bg-white border border-slate-200 px-4.5 py-2.5 rounded-xl select-all shadow-sm">
                    {successNotice.match(/Code ([A-Z0-9]+) /)?.[1] || 'FREESHIP'}
                  </span>
                  <button
                    onClick={() => handleCopy(successNotice.match(/Code ([A-Z0-9]+) /)?.[1] || 'FREESHIP')}
                    className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-700 rounded-xl transition active:scale-95 cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Loyalty Ledger history */}
            <div className="flex flex-col gap-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 text-left block">
                {language === 'FR' ? 'HISTORIQUE DES GAINS DE POINTS' : 'سجل حركة النقاط بالتفصيل'}
              </span>

              {pointsHistory.length === 0 ? (
                <div className="bg-white border border-slate-200/50 rounded-3xl p-10 text-center text-xs text-slate-450 font-semibold select-none shadow-sm">
                  {language === 'FR' ? 'Aucune transaction enregistrée.' : 'لا توجد أي معاملات مسجلة بعد'}
                </div>
              ) : (
                <div className="bg-white border border-slate-200/50 rounded-3xl divide-y divide-slate-100 overflow-hidden shadow-sm">
                  {pointsHistory.map((tx) => (
                    <div key={tx.id} className="p-4.5 flex items-center justify-between gap-4 text-left transition-colors duration-200 hover:bg-slate-50/40" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                      <div className="flex items-center gap-3.5 min-w-0" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                        <div className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center shrink-0 border ${
                          tx.amount > 0 
                            ? 'bg-emerald-55/10 border-emerald-500/10 text-emerald-500' 
                            : 'bg-rose-55/10 border-rose-500/10 text-rose-500'
                        }`}>
                          <Coins className="w-4 h-4" />
                        </div>
                        <div className="min-w-0" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                          <span className="text-xs font-bold text-slate-700 block leading-tight truncate">
                            {language === 'FR' ? tx.descriptionFr : tx.descriptionAr}
                          </span>
                          <span className="text-[9px] text-slate-450 block mt-1 font-extrabold uppercase tracking-wider">
                            {new Date(tx.date).toLocaleDateString(language === 'FR' ? 'fr-FR' : 'ar-MA', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                      
                      <span className={`text-xs font-black shrink-0 ${
                        tx.amount > 0 ? 'text-emerald-500' : 'text-rose-500'
                      }`}>
                        {tx.amount > 0 ? `+${tx.amount}` : tx.amount} pts
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ──────── TAB 3: DAILY ROUTINE PLANNER & SKIN DIARY ──────── */}
        {activeTab === 'journal' && (
          <div className="space-y-6 animate-fade-in">
            {/* Gamification points info */}
            <div className="bg-white border border-slate-200/50 rounded-3xl p-5 shadow-sm">
              <div 
                className="flex items-start gap-4 text-left"
                style={{ textAlign: isRTL ? 'right' : 'left', flexDirection: isRTL ? 'row-reverse' : 'row' }}
              >
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4.5 h-4.5 text-emerald-600 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-emerald-800 uppercase tracking-widest block font-heading">
                    {language === 'FR' ? 'COMPLÉTEZ VOS ÉTAPES & GAGNEZ DES POINTS' : 'أتمي طقوسكِ اليومية واحصلي على نقاط'}
                  </span>
                  <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                    {language === 'FR'
                      ? 'Cochez vos étapes de soin du matin et du soir, puis validez pour gagner +5 Points Fidélité par rituel chaque jour.'
                      : 'سجلي إكمال خطوات روتين الصباح والمساء يومياً، واحصلي على +5 نقاط إضافية عند تأكيد كل روتين.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Checklist AM and PM Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none">
              
              {/* AM Skincare Planner */}
              <div className="bg-white border border-slate-200/50 rounded-3xl p-5 shadow-sm flex flex-col justify-between gap-5 text-left" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                    <h3 className="text-xs font-black text-slate-800 font-heading uppercase tracking-wide">
                      {language === 'FR' ? '☀️ Rituel du Matin (AM)' : '☀️ روتين الصباح (AM)'}
                    </h3>
                    {isAmTodayCompleted && (
                      <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 rounded-md text-[9px] font-black uppercase tracking-wider select-none border border-emerald-500/10">
                        {language === 'FR' ? 'Complété' : 'مكتمل'}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    {[
                      { key: 'cleanse', labelFr: 'Nettoyer 🧼 (Gel/Eau micellaire)', labelAr: 'تنظيف 🧼 (منظف لطيف)' },
                      { key: 'treat', labelFr: 'Traiter 🧪 (Sérum/Actif)', labelAr: 'علاج 🧪 (سيروم للوجه)' },
                      { key: 'hydrate', labelFr: 'Hydrater 🧴 (Crème de jour)', labelAr: 'ترطيب 🧴 (كريم النهار)' },
                      { key: 'protect', labelFr: 'Protéger ☀️ (Écran Solaire SPF)', labelAr: 'حماية ☀️ (واقي شمس)' }
                    ].map((step) => (
                      <label 
                        key={step.key}
                        className={`flex items-center gap-3.5 p-3 rounded-2xl border text-xs font-semibold cursor-pointer transition-all duration-300 select-none ${
                          isAmTodayCompleted
                            ? 'bg-slate-50/40 border-slate-100 text-slate-400 cursor-not-allowed opacity-80'
                            : (amChecks as Record<string, boolean>)[step.key]
                            ? 'border-emerald-500/30 bg-emerald-500/5 text-slate-800'
                            : 'border-slate-100 text-slate-650 hover:bg-slate-50 hover:border-slate-200'
                        }`}
                        style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}
                      >
                        <div className="relative flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={isAmTodayCompleted || (amChecks as Record<string, boolean>)[step.key]}
                            disabled={isAmTodayCompleted}
                            onChange={(e) => setAmChecks(prev => ({ ...prev, [step.key]: e.target.checked }))}
                            className="peer sr-only"
                          />
                          <div className={`w-[18px] h-[18px] rounded-[6px] border transition-all duration-200 flex items-center justify-center ${
                            isAmTodayCompleted
                              ? 'bg-slate-100 border-slate-200 text-slate-450'
                              : (amChecks as Record<string, boolean>)[step.key]
                              ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                              : 'bg-white border-slate-350 peer-hover:border-slate-400'
                          }`}>
                            <Check className={`w-3 h-3 stroke-[3.5] transition-transform duration-200 ${
                              isAmTodayCompleted || (amChecks as Record<string, boolean>)[step.key] ? 'scale-100' : 'scale-0'
                            }`} />
                          </div>
                        </div>
                        <span className="flex-grow leading-normal">{language === 'FR' ? step.labelFr : step.labelAr}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleCompleteAmRoutine}
                  disabled={isAmTodayCompleted}
                  className={`w-full py-3 rounded-2xl font-black text-[10px] uppercase tracking-wider transition-all duration-300 border-0 outline-none cursor-pointer ${
                    isAmTodayCompleted
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200/10'
                      : 'bg-slate-900 hover:bg-accent text-white shadow-sm active:scale-[0.97]'
                  }`}
                >
                  {isAmTodayCompleted 
                    ? (language === 'FR' ? 'Complété' : 'مكتمل')
                    : (language === 'FR' ? 'Valider le Matin (+5 pts)' : 'تأكيد روتين الصباح (+5 ن)')}
                </button>
              </div>

              {/* PM Skincare Planner */}
              <div className="bg-white border border-slate-200/50 rounded-3xl p-5 shadow-sm flex flex-col justify-between gap-5 text-left" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                    <h3 className="text-xs font-black text-slate-800 font-heading uppercase tracking-wide">
                      {language === 'FR' ? '🌙 Rituel du Soir (PM)' : '🌙 روتين المساء (PM)'}
                    </h3>
                    {isPmTodayCompleted && (
                      <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 rounded-md text-[9px] font-black uppercase tracking-wider select-none border border-emerald-500/10">
                        {language === 'FR' ? 'Complété' : 'مكتمل'}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    {[
                      { key: 'cleanse', labelFr: 'Double Nettoyage 🧼 (Huile + Gel)', labelAr: 'تنظيف مزدوج 🧼 (زيت + جل)' },
                      { key: 'treat', labelFr: 'Traiter 🧪 (Sérum de nuit)', labelAr: 'علاج 🧪 (سيروم ليلي)' },
                      { key: 'hydrate', labelFr: 'Hydrater 🧴 (Crème riche/Masque)', labelAr: 'ترطيب 🧴 (كريم ليلي مغذي)' }
                    ].map((step) => (
                      <label 
                        key={step.key}
                        className={`flex items-center gap-3.5 p-3 rounded-2xl border text-xs font-semibold cursor-pointer transition-all duration-300 select-none ${
                          isPmTodayCompleted
                            ? 'bg-slate-50/40 border-slate-100 text-slate-400 cursor-not-allowed opacity-80'
                            : (pmChecks as Record<string, boolean>)[step.key]
                            ? 'border-emerald-500/30 bg-emerald-500/5 text-slate-800'
                            : 'border-slate-100 text-slate-650 hover:bg-slate-50 hover:border-slate-200'
                        }`}
                        style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}
                      >
                        <div className="relative flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={isPmTodayCompleted || (pmChecks as Record<string, boolean>)[step.key]}
                            disabled={isPmTodayCompleted}
                            onChange={(e) => setPmChecks(prev => ({ ...prev, [step.key]: e.target.checked }))}
                            className="peer sr-only"
                          />
                          <div className={`w-[18px] h-[18px] rounded-[6px] border transition-all duration-200 flex items-center justify-center ${
                            isPmTodayCompleted
                              ? 'bg-slate-100 border-slate-200 text-slate-450'
                              : (pmChecks as Record<string, boolean>)[step.key]
                              ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                              : 'bg-white border-slate-350 peer-hover:border-slate-400'
                          }`}>
                            <Check className={`w-3 h-3 stroke-[3.5] transition-transform duration-200 ${
                              isPmTodayCompleted || (pmChecks as Record<string, boolean>)[step.key] ? 'scale-100' : 'scale-0'
                            }`} />
                          </div>
                        </div>
                        <span className="flex-grow leading-normal">{language === 'FR' ? step.labelFr : step.labelAr}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleCompletePmRoutine}
                  disabled={isPmTodayCompleted}
                  className={`w-full py-3 rounded-2xl font-black text-[10px] uppercase tracking-wider transition-all duration-300 border-0 outline-none cursor-pointer ${
                    isPmTodayCompleted
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200/10'
                      : 'bg-slate-900 hover:bg-accent text-white shadow-sm active:scale-[0.97]'
                  }`}
                >
                  {isPmTodayCompleted 
                    ? (language === 'FR' ? 'Complété' : 'مكتمل')
                    : (language === 'FR' ? 'Valider le Soir (+5 pts)' : 'تأكيد روتين المساء (+5 ن)')}
                </button>
              </div>

            </div>

            {/* Daily Skin Diary Logger */}
            <div className="bg-white border border-slate-200/50 rounded-3xl p-6 shadow-premium text-left" style={{ textAlign: isRTL ? 'right' : 'left' }}>
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-5 select-none" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                <BookOpen className="w-4.5 h-4.5 text-accent" />
                <h3 className="text-xs font-black text-slate-800 font-heading uppercase tracking-wide">
                  {language === 'FR' ? 'Journal Clinique d\'Évolution de la Peau' : 'سجل ومفكرة تتبع حالة البشرة'}
                </h3>
              </div>

              <form onSubmit={handleSubmitDiary} className="space-y-5">
                {/* Mood Wellness selection */}
                <div className="space-y-3 select-none text-left" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    {language === 'FR' ? 'État général de ma peau aujourd\'hui :' : 'حالة بشرتي اليوم :'}
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    {[
                      { emoji: '🤩', labelFr: 'Éclatante', labelAr: 'مشرقة' },
                      { emoji: '🙂', labelFr: 'Stable', labelAr: 'مستقرة' },
                      { emoji: '😕', labelFr: 'Sèche', labelAr: 'جافة/مشدودة' },
                      { emoji: '😭', labelFr: 'Moyenne', labelAr: 'متهيجة/حبوب' }
                    ].map((em) => (
                      <button
                        key={em.emoji}
                        type="button"
                        onClick={() => setDiaryEmoji(em.emoji)}
                        className={`px-4.5 py-3 rounded-2xl border flex items-center gap-2 transition-all duration-300 active:scale-[0.95] cursor-pointer ${
                          diaryEmoji === em.emoji
                            ? 'border-emerald-500/40 bg-emerald-500/5 text-slate-800 shadow-sm font-black'
                            : 'border-slate-100 bg-slate-50/50 text-slate-500 hover:bg-slate-50 hover:border-slate-200'
                        }`}
                        title={language === 'FR' ? em.labelFr : em.labelAr}
                      >
                        <span className="text-xl leading-none">{em.emoji}</span>
                        <span className="text-[10.5px] uppercase tracking-wider font-extrabold">{language === 'FR' ? em.labelFr : em.labelAr}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text input note */}
                <div className="space-y-2 text-left" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    {language === 'FR' ? 'Observations Cliniques (ressenti, rougeurs, améliorations) :' : 'ملاحظات اليوم (جفاف، تهيج، تحسن) :'}
                  </span>
                  <textarea
                    rows={3}
                    placeholder={
                      language === 'FR'
                        ? "Ex: Ma peau est très douce après l'application de l'acide hyaluronique. Moins de rougeurs."
                        : "مثال: بشرتي رطبة وناعمة اليوم، خفت الحساسية والاحمرار بشكل ملحوظ."
                    }
                    value={diaryNote}
                    onChange={(e) => setDiaryNote(e.target.value)}
                    className="w-full border border-slate-200 rounded-2xl p-3.5 text-xs focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition duration-200 bg-slate-50 focus:bg-white resize-none text-slate-800"
                  />
                </div>

                {/* Upload Image Selfie */}
                <div className="space-y-2 text-left" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    {language === 'FR' ? 'Photo de ma peau (optionnel) :' : 'صورة لبشرتي (اختياري) :'}
                  </span>
                  <div className="flex items-center gap-4" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="diary-image-upload"
                    />
                    
                    {diaryImage ? (
                      <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-slate-200 shrink-0">
                        <img
                          src={diaryImage}
                          alt="Selfie preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setDiaryImage(null)}
                          className="absolute top-1 right-1 w-5 h-5 bg-rose-600/90 text-white rounded-full flex items-center justify-center cursor-pointer transition hover:bg-rose-700 active:scale-95 border-0 outline-none"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor="diary-image-upload"
                        className="flex flex-col items-center justify-center w-20 h-20 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 hover:border-accent/40 transition duration-300 select-none text-slate-450 hover:text-accent shrink-0"
                      >
                        <Camera className="w-5 h-5 mb-1" />
                        <span className="text-[9px] font-black uppercase tracking-wider">Selfie</span>
                      </label>
                    )}
                    
                    <div className="text-[11px] leading-normal text-slate-400 font-semibold max-w-[200px]" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                      {language === 'FR' 
                        ? "Ajoutez une photo pour suivre l'évolution clinique de votre teint."
                        : "أضيفي صورة لتتبع التطور البصري لحالة بشرتكِ في الخط الزمني."}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-8 py-3.5 bg-slate-900 hover:bg-accent text-white text-[10.5px] font-black uppercase tracking-widest rounded-2xl transition-all duration-300 active:scale-[0.97] cursor-pointer border-0 outline-none shadow-md"
                >
                  {language === 'FR' ? 'Enregistrer ma note (+5 pts)' : 'حفظ الملاحظة (+5 ن)'}
                </button>
              </form>
            </div>

            {/* Timeline log history */}
            <div className="flex flex-col gap-4 text-left" style={{ textAlign: isRTL ? 'right' : 'left' }}>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 font-heading block">
                {language === 'FR' ? 'FRISES CHRONOLOGIQUES • ÉVOLUTION PEAU' : 'الخط الزمني • سجل تحسن البشرة'}
              </span>

              {compareLogA && !compareLogB && (
                <div className="bg-accent/10 border border-accent/20 rounded-2xl p-4.5 text-xs font-semibold text-accent flex items-center justify-between shadow-inner-sm animate-pulse mb-2" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                  <span>
                    {language === 'FR'
                      ? "Sélectionnez une deuxième photo pour lancer la comparaison avant/après."
                      : "يرجى تحديد صورة ثانية لبدء مقارنة قبل وبعد."}
                  </span>
                  <button
                    onClick={() => setCompareLogA(null)}
                    className="text-[10px] font-black uppercase tracking-wider underline cursor-pointer border-0 outline-none bg-transparent hover:text-slate-900 transition"
                  >
                    {language === 'FR' ? "Annuler" : "إلغاء"}
                  </button>
                </div>
              )}

              {diaryLogs.length === 0 ? (
                <div className="bg-white border border-slate-200/50 rounded-3xl p-10 text-center text-xs text-slate-400 font-semibold select-none shadow-sm relative overflow-hidden">
                  <div className="absolute right-0 bottom-0 w-24 h-24 rounded-full bg-slate-50/50 blur-xl pointer-events-none" />
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                    <BookOpen className="w-4.5 h-4.5" />
                  </div>
                  <p className="max-w-xs mx-auto leading-relaxed font-semibold">
                    {language === 'FR' ? 'Aucune note enregistrée dans votre journal' : 'مفكرتكِ فارغة حالياً، ابدئي بتدوين ملاحظاتكِ'}
                  </p>
                </div>
              ) : (
                <div 
                  className={`relative space-y-6 ${
                    isRTL 
                      ? 'border-r border-slate-250/60 mr-4 pr-6 pl-0' 
                      : 'border-l border-slate-250/60 ml-4 pl-6'
                  } text-left`}
                  style={{ textAlign: isRTL ? 'right' : 'left' }}
                >
                  {diaryLogs.map((log) => (
                    <div key={log.id} className="relative">
                      {/* Timeline dot */}
                      <div 
                        className={`absolute top-2 w-4.5 h-4.5 rounded-full bg-white border-2 border-slate-900 flex items-center justify-center shadow-sm z-10 ${
                          isRTL ? '-right-[35px] left-auto' : '-left-[35px] right-auto'
                        }`}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                      </div>
                      
                      {/* Timeline Card */}
                      <div className="bg-white border border-slate-200/50 rounded-2xl p-5 shadow-sm space-y-3 relative overflow-hidden">
                        <div className="flex items-center justify-between gap-3 text-[10px] font-bold text-slate-400 select-none border-b border-slate-100 pb-2" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                          <span className="bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded-lg text-slate-500 font-semibold">
                            {new Date(log.date).toLocaleDateString(language === 'FR' ? 'fr-FR' : 'ar-MA', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xl leading-none">{log.emoji}</span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                          {log.note}
                        </p>

                        {log.image && (
                          <div className="space-y-3">
                            <div className="relative rounded-2xl overflow-hidden border border-slate-100 w-full max-h-48 flex justify-center bg-slate-50">
                              <img
                                src={log.image}
                                alt="Skin selfie"
                                className="w-full h-full object-cover max-h-48"
                              />
                            </div>
                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={() => handleSelectForCompare(log)}
                                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 active:scale-95 cursor-pointer border ${
                                  compareLogA?.id === log.id
                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                    : compareLogB?.id === log.id
                                    ? 'bg-blue-650 text-white border-blue-650 shadow-sm'
                                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                                }`}
                              >
                                {compareLogA?.id === log.id
                                  ? (language === 'FR' ? 'Photo Avant (A)' : 'صورة أ')
                                  : compareLogB?.id === log.id
                                  ? (language === 'FR' ? 'Photo Après (B)' : 'صورة ب')
                                  : (language === 'FR' ? 'Choisir pour comparer' : 'مقارنة')}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* Before/After Sliding Image Comparison Modal */}
        {isComparing && compareLogA && compareLogB && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
            <div className="relative w-full max-w-xl bg-white rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-scale-pop">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  {language === 'FR' ? 'Comparatif Évolution Peau' : 'مقارنة تطور البشرة'}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsComparing(false);
                    setCompareLogA(null);
                    setCompareLogB(null);
                  }}
                  className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer transition border-0 outline-none"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Slider comparison viewport */}
              <div className="relative flex-grow flex items-center justify-center bg-slate-50 p-6 overflow-hidden min-h-[350px]">
                <div className="relative w-full max-w-sm aspect-[3/4] rounded-2xl overflow-hidden shadow-lg bg-white select-none">
                  
                  {/* Photo B (Newer / After - Underneath) */}
                  {compareLogB.image && (
                    <img
                      src={compareLogB.image}
                      alt="After"
                      className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    />
                  )}
                  
                  {/* Photo A (Older / Before - Overlay) */}
                  {compareLogA.image && (
                    <div 
                      className="absolute inset-0 overflow-hidden pointer-events-none"
                      style={{ width: `${sliderPosition}%` }}
                    >
                      <img
                        src={compareLogA.image}
                        alt="Before"
                        className="absolute inset-0 w-full h-full object-cover max-w-none pointer-events-none"
                        style={{ width: '100%', height: '100%' }}
                      />
                    </div>
                  )}

                  {/* Vertical slider handler line with gold circles */}
                  <div
                    className="absolute top-0 bottom-0 w-[3px] bg-white cursor-ew-resize pointer-events-none shadow-[0_0_10px_rgba(0,0,0,0.4)]"
                    style={{ left: `${sliderPosition}%` }}
                  >
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white border-2 border-gold shadow-xl flex items-center justify-center text-gold font-bold text-xs select-none">
                      ↔
                    </div>
                  </div>

                  {/* Range input slider overlaid on top */}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sliderPosition}
                    onChange={(e) => setSliderPosition(Number(e.target.value))}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-ew-resize z-20"
                  />

                  {/* Badges */}
                  <div className="absolute bottom-4 left-4 z-10 bg-slate-900/60 backdrop-blur-sm text-white text-[9px] font-black tracking-wider uppercase px-2.5 py-1 rounded">
                    {language === 'FR' 
                      ? `Avant (${new Date(compareLogA.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })})` 
                      : `قبل (${new Date(compareLogA.date).toLocaleDateString('ar-MA', { day: 'numeric', month: 'short' })})`}
                  </div>
                  <div className="absolute bottom-4 right-4 z-10 bg-emerald-600/75 backdrop-blur-sm text-white text-[9px] font-black tracking-wider uppercase px-2.5 py-1 rounded">
                    {language === 'FR' 
                      ? `Après (${new Date(compareLogB.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })})` 
                      : `بعد (${new Date(compareLogB.date).toLocaleDateString('ar-MA', { day: 'numeric', month: 'short' })})`}
                  </div>
                </div>
              </div>

              {/* Bottom info */}
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0 text-center text-[11px] leading-relaxed text-slate-500 font-semibold">
                {language === 'FR' 
                  ? "Faites glisser le séparateur pour comparer l'évolution visuelle de votre peau." 
                  : "اسحبي المنزلق لمقارنة التطور البصري لحالة بشرتكِ بين الصورتين."}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
    </ShopShell>
  );
}
