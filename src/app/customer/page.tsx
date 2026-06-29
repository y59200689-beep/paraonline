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
    'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm',
    authModalState === 'open' ? 'is-open' : authModalState === 'closing' ? 'is-closing' : '',
  ].join(' ');

  const authModalCls = [
    't-modal',
    'bg-white rounded-3xl shadow-2xl w-full max-w-sm p-7 space-y-5 relative',
    authModalState === 'open' ? 'is-open' : authModalState === 'closing' ? 'is-closing' : '',
  ].join(' ');

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-[#FAF9F6] via-[#FCFBF9] to-[#FAF9F6] text-foreground py-16 px-4 md:px-6 transition-colors page-entry-animate relative"
      style={{ direction: isRTL ? 'rtl' : 'ltr' }}
    >
      {/* Film grain/noise overlay */}
      <div className="pointer-events-none fixed inset-0 z-45 opacity-[0.012] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px] mix-blend-overlay" />

      <div className="max-w-[760px] mx-auto space-y-10">
        
        {/* Navigation back */}
        <Link 
          href="/" 
          className={`group inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-accent transition-all duration-300 ${
            isRTL ? 'flex-row-reverse' : ''
          }`}
        >
          <ArrowLeft className={`w-3.5 h-3.5 transition-transform duration-300 ${isRTL ? 'rotate-180 group-hover:translate-x-0.5' : 'group-hover:-translate-x-0.5'}`} strokeWidth={2.5} />
          <span className="anim-underline after:bottom-[-4px]">{language === 'FR' ? 'Retour au magasin' : 'العودة للمتجر'}</span>
        </Link>

        {/* Brand Header */}
        <div className="text-center space-y-3 select-none">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-accent/5 to-gold/10 border border-slate-200/40 rounded-full text-[9px] font-black tracking-[0.25em] text-gold uppercase shadow-sm">
            {language === 'FR' ? 'ESPACE PORTAIL CLIENT' : 'بوابة حساب العميل'}
          </span>
          <h1 className="text-3xl sm:text-4.5xl font-black font-heading tracking-tight text-primary leading-tight uppercase">
            {language === 'FR' ? 'Mon Espace Para Officinal' : 'حسابي الخاص للجمال'}
          </h1>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed font-semibold">
            {language === 'FR'
              ? 'Suivez vos colis, gérez votre cagnotte fidélité et planifiez vos rituels de soin au quotidien.'
              : 'تتبعي طلبياتكِ، تفقدي رصيد نقاطكِ، وخططي لروتين العناية اليومي ببشرتكِ.'
            }
          </p>
        </div>

        {/* ── Auth Status Banner (Double-Bezel) ── */}
        <div className="bezel-outer bg-gradient-to-tr from-accent/5 via-white/50 to-gold/5 border-slate-200/40 p-[3px] rounded-2xl shadow-sm">
          <div className="bezel-inner rounded-[13px] bg-white px-5 py-4 border border-slate-100/40 flex items-center justify-between gap-4 relative overflow-hidden backdrop-blur-md">
            {isLoadingAuth ? (
              <div className="flex items-center gap-2.5 text-xs text-slate-500 font-semibold animate-pulse">
                <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                <span>{language === 'FR' ? 'Mise en relation…' : 'جاري التحميل…'}</span>
              </div>
            ) : clientUser ? (
              <>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-accent/10 border border-accent/15 flex items-center justify-center text-accent text-xs font-black shrink-0 select-none shadow-[inset_0_1px_3px_rgba(13,148,136,0.1)]">
                    {(clientUser.name || clientUser.email).charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 text-left" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                    <p className="text-xs font-black text-primary truncate leading-tight">{clientUser.name || clientUser.email}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="relative flex h-1.5 w-1.5 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                      </span>
                      <p className="text-[9px] font-extrabold text-emerald-600 uppercase tracking-wider leading-none">
                        {language === 'FR' ? 'Compte synchronisé' : 'حساب متزامن'}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={logoutClient}
                  className="text-[11px] font-black uppercase tracking-wider text-slate-400 hover:text-rose-500 py-1.5 px-3 rounded-lg hover:bg-rose-50/50 transition-all duration-300 cursor-pointer shrink-0 border-0 bg-transparent"
                >
                  {language === 'FR' ? 'Déconnexion' : 'خروج'}
                </button>
              </>
            ) : (
              <>
                <div className="min-w-0 text-left" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                  <p className="text-xs font-black text-primary leading-tight">
                    {language === 'FR' ? 'Connectez-vous pour sauvegarder vos données' : 'سجلي الدخول لحفظ بياناتكِ في الحساب'}
                  </p>
                  <p className="text-[10px] font-semibold text-slate-400 mt-1 leading-snug">
                    {language === 'FR' ? 'Points, journal & routines synchronisés dans le cloud.' : 'نقاطكِ، المفكرة والمخطط محفوظة في حسابكِ.'}
                  </p>
                </div>
                <button
                  onClick={() => { setShowAuthPanel(true); setAuthView('login'); setAuthError(null); }}
                  className="px-4.5 py-2.5 bg-primary hover:bg-accent text-white text-[9.5px] font-black uppercase tracking-widest rounded-xl transition duration-300 active:scale-[0.97] cursor-pointer border-0 shrink-0 shadow-sm"
                >
                  {language === 'FR' ? 'Se connecter' : 'تسجيل الدخول'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── Auth Modal ── */}
        {isAuthModalVisible && (
          <div
            className={authBackdropCls}
            onClick={(e) => { if (e.target === e.currentTarget) setShowAuthPanel(false); }}
          >
            <div className={authModalCls}>
              {/* Close */}
              <button
                onClick={() => setShowAuthPanel(false)}
                className="absolute top-4 right-4 w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-lg leading-none transition cursor-pointer border-0 active:scale-90"
                aria-label="Close"
              >×</button>

              {/* Header */}
              <div className="text-center space-y-2 select-none">
                <span className="text-[9px] font-black uppercase tracking-[0.25em] text-gold block">PARA OFFICINAL</span>
                <h2 className="text-xl font-black font-heading text-primary leading-tight">
                  {authView === 'login'
                    ? (language === 'FR' ? 'Connexion au compte' : 'تسجيل الدخول')
                    : (language === 'FR' ? 'Créer un compte' : 'إنشاء حساب جديد')}
                </h2>
                <p className="text-[10px] text-slate-400 font-semibold leading-normal max-w-[240px] mx-auto">
                  {language === 'FR'
                    ? 'Retrouvez votre statut, historique de points et calendrier de routines.'
                    : 'نقاطكِ، مفكرتكِ وتقدمكِ محفوظة في حسابكِ.'}
                </p>
              </div>

              {/* Tab toggle */}
              <div className="bg-slate-100/80 rounded-xl p-1 flex gap-1 select-none border border-slate-200/20">
                {(['login', 'signup'] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => { setAuthView(v); setAuthError(null); }}
                    className={`flex-1 py-2 rounded-lg text-[9.5px] font-black uppercase tracking-wider transition duration-300 cursor-pointer border-0 ${
                      authView === v ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600 bg-transparent'
                    }`}
                  >
                    {v === 'login'
                      ? (language === 'FR' ? 'Connexion' : 'دخول')
                      : (language === 'FR' ? 'Inscription' : 'إنشاء')}
                  </button>
                ))}
              </div>

              {/* Error */}
              {authError && (
                <div className="bg-rose-500/8 border border-rose-500/20 rounded-xl px-4 py-3 text-[11px] font-semibold text-rose-600 text-left">
                  {authError}
                </div>
              )}

              {/* Login form */}
              {authView === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-3 text-left">
                  <input
                    type="email"
                    placeholder={language === 'FR' ? 'Email' : 'البريد الإلكتروني'}
                    value={authEmail}
                    onChange={e => setAuthEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent bg-slate-50 focus:bg-white transition duration-200"
                  />
                  <input
                    type="password"
                    placeholder={language === 'FR' ? 'Mot de passe' : 'كلمة المرور'}
                    value={authPassword}
                    onChange={e => setAuthPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent bg-slate-50 focus:bg-white transition duration-200"
                  />
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3 bg-primary hover:bg-accent text-white text-xs font-black uppercase tracking-widest rounded-xl transition duration-300 active:scale-[0.97] cursor-pointer border-0 shadow-sm disabled:opacity-60"
                  >
                    {authLoading ? '…' : (language === 'FR' ? 'Se connecter' : 'دخول')}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSignup} className="space-y-3 text-left">
                  <input
                    type="text"
                    placeholder={language === 'FR' ? 'Prénom & Nom' : 'الاسم الكامل'}
                    value={authName}
                    onChange={e => setAuthName(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent bg-slate-50 focus:bg-white transition duration-200"
                  />
                  <input
                    type="tel"
                    placeholder={language === 'FR' ? 'Téléphone (ex: 0661234567)' : 'رقم الهاتف'}
                    value={authPhone}
                    onChange={e => setAuthPhone(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent bg-slate-50 focus:bg-white transition duration-200"
                  />
                  <input
                    type="email"
                    placeholder={language === 'FR' ? 'Email' : 'البريد الإلكتروني'}
                    value={authEmail}
                    onChange={e => setAuthEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent bg-slate-50 focus:bg-white transition duration-200"
                  />
                  <input
                    type="password"
                    placeholder={language === 'FR' ? 'Mot de passe (6 car. min.)' : 'كلمة المرور (6 أحرف على الأقل)'}
                    value={authPassword}
                    onChange={e => setAuthPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent bg-slate-50 focus:bg-white transition duration-200"
                  />
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3 bg-primary hover:bg-accent text-white text-xs font-black uppercase tracking-widest rounded-xl transition duration-300 active:scale-[0.97] cursor-pointer border-0 shadow-sm disabled:opacity-60"
                  >
                    {authLoading ? '…' : (language === 'FR' ? 'Créer mon compte' : 'إنشاء الحساب')}
                  </button>
                </form>
              )}

              <p className="text-[9px] text-center text-slate-400 font-semibold leading-relaxed">
                {language === 'FR'
                  ? "En créant un compte, vous acceptez nos conditions d'utilisation. Données sécurisées."
                  : 'بإنشاء حساب، توافقين على شروط الاستخدام. بياناتكِ محفوظة بأمان.'}
              </p>
            </div>
          </div>
        )}

        {/* Premium Tab Bar Navigation */}
        <div 
          ref={tabsRef} 
          className="t-tabs w-full border border-slate-200/40 rounded-2xl shadow-sm p-1.5 select-none backdrop-blur-md bg-white/75"
          style={{ 
            display: 'flex', 
            position: 'relative',
            padding: '6px',
            '--tabs-bar-bg': 'transparent',
            '--tabs-pill-bg': '#101f3d',
            '--tabs-text-muted': '#64748b',
            '--tabs-text-active': '#ffffff',
            '--tabs-dur': '250ms',
            '--tabs-ease': 'var(--ease-out-premium)'
          } as React.CSSProperties}
        >
          <div className="t-tabs-pill bg-primary" style={{ ...pillStyle, height: 'auto', top: '6px', bottom: '6px', borderRadius: '12px' }} />
          {([
            { id: 'suivi', labelFr: '📦 Suivi Colis', labelAr: '📦 تتبع الطلب' },
            { id: 'club', labelFr: '👑 Club Para', labelAr: '👑 نادي الجمال' },
            { id: 'journal', labelFr: '📓 Agenda & Journal', labelAr: '📓 المفكرة اليومية' }
          ] as const).map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                aria-selected={isActive}
                onClick={() => { setActiveTab(tab.id); setSuccessNotice(null); }}
                className={`t-tab flex-1 py-3 px-2 rounded-xl text-[10px] font-black uppercase tracking-wider text-center cursor-pointer transition-colors duration-300 z-10 ${
                  isActive ? 'text-white' : 'text-slate-400 hover:text-primary'
                }`}
                style={{ height: 'auto', border: 0, background: 'transparent' }}
              >
                {language === 'FR' ? tab.labelFr : tab.labelAr}
              </button>
            );
          })}
        </div>

        {/* Global Notifications Panel */}
        <div className="!mt-0">
          <div className={`grid transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${
            showNotice 
              ? 'grid-rows-[1fr] opacity-100 pt-6' 
              : 'grid-rows-[0fr] opacity-0 pt-0 pointer-events-none'
          }`}>
            <div className="overflow-hidden">
              {activeNotice && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 rounded-2xl text-xs font-bold text-center flex items-center justify-center gap-2">
                  <span className="t-success-check shrink-0 text-emerald-600" data-state="in">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
            {/* Search Bar Block (Double-Bezel) */}
            <div className="bezel-outer bg-gradient-to-tr from-accent/5 via-white/50 to-gold/5 border-slate-200/40 p-[3px] rounded-2xl shadow-sm">
              <div className="bezel-inner rounded-[13px] bg-white p-6 border border-slate-100/40">
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder={language === 'FR' ? 'Ex: 0661234567 ou Votre Nom...' : 'مثال: 0661234567 أو اسمكِ...'}
                      value={searchContact}
                      onChange={(e) => setSearchContact(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent focus:bg-white transition duration-200"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-8 py-3 bg-primary hover:bg-accent text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 active:scale-[0.97] flex items-center justify-center gap-1.5 cursor-pointer border-0 outline-none shadow-sm"
                  >
                    {isSearching ? '...' : (language === 'FR' ? 'Rechercher' : 'بحث')}
                  </button>
                </form>
              </div>
            </div>

            {/* Results Deck */}
            <div className="space-y-6">
              {isSearching ? (
                <div className="text-center py-14">
                  <div className="w-8 h-8 border-4 border-solid border-accent border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : hasSearched && orders.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/40 space-y-4 shadow-sm relative overflow-hidden">
                  <div className="absolute right-0 bottom-0 w-24 h-24 rounded-full bg-slate-50 blur-xl pointer-events-none" />
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-500">
                    <ShoppingBag className="w-5 h-5 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-primary font-heading uppercase tracking-wide">
                      {language === 'FR' ? 'Aucune commande trouvée' : 'لم يتم العثور على أي طلب'}
                    </h3>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                      {language === 'FR'
                        ? 'Nous n\'avons trouvé aucune commande correspondant à ces informations. Vérifiez le numéro de téléphone saisi.'
                        : 'لم نجد أي طلب مسجل بهذه البيانات. يرجى التحقق من الرقم المدخل.'
                      }
                    </p>
                  </div>
                </div>
              ) : (
                orders.map((order) => (
                  <div 
                    key={order.order_id}
                    className="bg-white border border-slate-200/40 rounded-2xl p-6 shadow-sm space-y-6 relative overflow-hidden"
                  >
                    {/* Brand line indicator */}
                    <div className="absolute top-0 right-0 left-0 h-[2.5px] bg-gradient-to-r from-accent via-gold to-primary" />

                    {/* Header card: ID and Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 text-left" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-black text-slate-400 block tracking-wider uppercase">{language === 'FR' ? 'NUMÉRO DE COMMANDE' : 'رقم الطلب'}</span>
                        <span className="text-sm font-heading font-black tracking-wider text-primary">{order.order_id}</span>
                      </div>

                      {/* Status Badge */}
                      <span className={`self-start sm:self-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        order.status.toLowerCase() === 'shipped' || order.status.toLowerCase() === 'delivered'
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/10'
                          : order.status.toLowerCase() === 'confirmed'
                          ? 'bg-accent/10 text-accent border border-accent/10'
                          : 'bg-amber-500/10 text-amber-600 border border-amber-500/10'
                      }`}>
                        {order.status.toLowerCase() === 'shipped' || order.status.toLowerCase() === 'delivered'
                          ? (language === 'FR' ? 'Expédié' : 'تم الشحن')
                          : order.status.toLowerCase() === 'confirmed'
                          ? (language === 'FR' ? 'Confirmé' : 'مؤكد')
                          : (language === 'FR' ? 'En Attente ⏳' : 'قيد الانتظار ⏳')
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
                          className="absolute top-4 -translate-y-1/2 h-1 bg-accent rounded-full z-0 transition-all duration-700" 
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
                          { id: 'pending', labelFr: 'En Attente', labelAr: 'قيد الانتظار', descFr: 'Reçu par l\'officine', descAr: 'تم استلام الطلب' },
                          { id: 'confirmed', labelFr: 'Confirmé', labelAr: 'مؤكد', descFr: 'Validé par téléphone', descAr: 'تم التأكيد الهاتفي' },
                          { id: 'shipped', labelFr: 'Expédié', labelAr: 'تم الشحن', descFr: 'Remis au distributeur', descAr: 'خرج مع الموزع' }
                        ].map((step, sIdx) => {
                          const isStepActive = 
                            sIdx === 0 || 
                            (sIdx === 1 && (order.status.toLowerCase() === 'confirmed' || order.status.toLowerCase() === 'shipped' || order.status.toLowerCase() === 'delivered')) ||
                            (sIdx === 2 && (order.status.toLowerCase() === 'shipped' || order.status.toLowerCase() === 'delivered'));
                          return (
                            <div key={step.id} className="relative z-10 flex flex-col items-center gap-2 flex-1">
                              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                                isStepActive 
                                  ? 'bg-accent border-accent text-white shadow-sm shadow-accent/20' 
                                  : 'bg-white border-slate-200 text-slate-300'
                              }`}>
                                <Check className="w-4.5 h-4.5" strokeWidth={3} />
                              </div>
                              <div className="text-center">
                                <p className={`text-[10px] font-black uppercase tracking-wider ${isStepActive ? 'text-primary' : 'text-slate-400'}`}>
                                  {language === 'FR' ? step.labelFr : step.labelAr}
                                </p>
                                <p className="text-[8px] font-semibold text-slate-400 max-w-[120px] mx-auto mt-0.5 leading-tight hidden sm:block">
                                  {language === 'FR' ? step.descFr : step.descAr}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Shipping Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs text-left border-t border-slate-50 pt-5">
                      <div className="flex gap-3 items-start">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/5 flex items-center justify-center shrink-0 text-emerald-500 border border-emerald-500/10">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div className="space-y-1">
                          <span className="font-black text-slate-400 uppercase text-[9px] tracking-wider block">{language === 'FR' ? 'Adresse de livraison' : 'عنوان التوصيل'}</span>
                          <p className="text-slate-700 font-bold leading-relaxed">{order.customer_name}, {order.address}, {order.city}</p>
                        </div>
                      </div>
                      <div className="flex gap-3 items-start">
                        <div className="w-8 h-8 rounded-full bg-gold/5 flex items-center justify-center shrink-0 text-gold border border-gold/10">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div className="space-y-1">
                          <span className="font-black text-slate-400 uppercase text-[9px] tracking-wider block">{language === 'FR' ? 'Délai d\'expédition' : 'مدة الشحن المتوقعة'}</span>
                          <p className="text-slate-700 font-bold leading-relaxed">
                            {language === 'FR' 
                              ? 'Livraison express sous 24 à 48 heures.'
                              : 'شحن سريع (الدفع عند الاستلام) خلال 24 إلى 48 ساعة.'
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Items Purchased list */}
                    <div className="border-t border-slate-100 pt-5 space-y-3.5 text-left">
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">{language === 'FR' ? 'PRODUITS COMMANDÉS' : 'المنتجات المطلوبة'}</span>
                      <div className="space-y-3">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex items-center gap-3 text-xs font-semibold p-2.5 rounded-xl bg-slate-50/50 border border-slate-100/50">
                            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200/40 flex items-center justify-center text-primary-dark shrink-0">
                              <ShoppingBag className="w-4 h-4 text-accent" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-slate-700 font-bold truncate">{item.title}</p>
                              <p className="text-[10px] text-slate-400 font-extrabold mt-0.5 uppercase">
                                {language === 'FR' ? 'Quantité' : 'الكمية'} <span className="text-accent font-black">x{item.quantity}</span>
                              </p>
                            </div>
                            <span className="shrink-0 text-primary font-black">{(item.price * item.quantity).toFixed(2)} DH</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Totals Summary */}
                    <div className="space-y-2 text-xs font-bold text-slate-500 text-left border-t border-slate-100 pt-5">
                      <div className="flex justify-between">
                        <span>{language === 'FR' ? 'Sous-total' : 'المجموع الفرعي'}</span>
                        <span className="font-bold text-slate-700">{order.subtotal.toFixed(2)} DH</span>
                      </div>
                      {order.discount_amount > 0 && (
                        <div className="flex justify-between text-emerald-600 font-black">
                          <span>{language === 'FR' ? 'Remise' : 'خصم قسيمة'}</span>
                          <span>-{order.discount_amount.toFixed(2)} DH</span>
                        </div>
                      )}
                      {order.gift_item && (
                        <div className="flex justify-between text-gold font-black">
                          <span>{language === 'FR' ? 'Cadeau' : 'الهدية'}</span>
                          <span>{order.gift_item}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-xs font-black text-primary pt-3 border-t border-slate-100">
                        <span>{language === 'FR' ? 'Total à payer (COD)' : 'المجموع الإجمالي عند الاستلام'}</span>
                        <span className="text-sm font-black text-accent">{order.total.toFixed(2)} DH</span>
                      </div>
                    </div>

                    {/* WhatsApp Action Hook */}
                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                      <a
                        href={`https://wa.me/${settings.storeWhatsApp || '212660808080'}?text=Bonjour, je souhaite avoir des informations concernant ma commande ${order.order_id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-accent hover:text-teal-900 transition-colors"
                      >
                        <span>{language === 'FR' ? 'Besoin d\'aide ? Contacter le support' : 'مساعدة؟ تواصل مع الدعم'}</span>
                      </a>
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
            {/* Loyalty Card */}
            <div 
              className={`w-full aspect-[1.66/1] md:aspect-[1.8/1] rounded-[24px] p-6 md:p-8 relative overflow-hidden flex flex-col justify-between ${cardStyle.shadow} border border-white/20`}
              style={{ background: cardStyle.bg }}
            >
              {/* Decorative Glass Highlights */}
              <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full bg-white/10 blur-3xl pointer-events-none" />
              <div className="absolute -left-10 -bottom-10 w-48 h-48 rounded-full bg-white/5 blur-3xl pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
              
              {/* Dynamic Sheen Line */}
              <div className="absolute -inset-y-12 -left-1/3 w-12 bg-white/10 blur-md transform rotate-12 animate-pulse" />

              <div className="flex items-start justify-between relative z-10 select-none">
                <div className="flex flex-col text-left" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                  <span className={`text-[8.5px] font-black uppercase tracking-[0.25em] ${cardStyle.text} opacity-60 leading-none`}>
                    CLUB PARA BEAUTY CARD
                  </span>
                  <span className={`text-sm font-black font-heading ${cardStyle.text} mt-2 leading-none`}>
                    {language === 'FR' ? 'Para Officinal S.A' : 'مستحضراتنا الرسمية'}
                  </span>
                </div>
                <span className={`text-[9px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full border ${cardStyle.badgeBg} shadow-sm backdrop-blur-sm`}>
                  {cardStyle.label}
                </span>
              </div>

              <div className="relative z-10 flex flex-col items-start my-3" style={{ alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
                <span className={`text-[8.5px] font-bold uppercase tracking-widest ${cardStyle.text} opacity-60`}>
                  {language === 'FR' ? 'SOLDE DE POINTS FIDÉLITÉ' : 'رصيد النقاط الفعال'}
                </span>
                <span className={`text-4xl md:text-5xl font-black ${cardStyle.text} tracking-tight leading-none mt-2`}>
                  {points} <span className="text-sm md:text-base font-semibold uppercase opacity-85 tracking-wider">pts</span>
                </span>
              </div>

              <div className="flex items-end justify-between relative z-10 select-none">
                <div className="flex flex-col text-left" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                  <span className={`text-[8px] font-black uppercase tracking-wider ${cardStyle.text} opacity-50`}>
                    {language === 'FR' ? 'Multiplicateur actif' : 'مضاعف النقاط'}
                  </span>
                  <span className={`text-xs font-black ${cardStyle.text} mt-1`}>
                    {tierMultiplier}x {language === 'FR' ? 'sur chaque commande' : 'نقاط على المشتريات'}
                  </span>
                </div>
                
                <div className="flex flex-col items-end" style={{ alignItems: isRTL ? 'flex-start' : 'flex-end' }}>
                  <span className={`text-[8px] font-black uppercase tracking-wider ${cardStyle.text} opacity-50`}>
                    {language === 'FR' ? 'Gains Cumulés' : 'النقاط التاريخية'}
                  </span>
                  <span className={`text-xs font-black ${cardStyle.text} mt-1`}>
                    {totalEarned} pts
                  </span>
                </div>
              </div>
            </div>

            {/* Tier Milestone Progress (Clinical Double Bezel style) */}
            {pointsToNextTier > 0 ? (
              <div className="bezel-outer bg-gradient-to-tr from-accent/5 via-white/50 to-gold/5 border-slate-200/40 p-[3px] rounded-2xl shadow-sm">
                <div className="bezel-inner rounded-[13px] bg-white p-5 border border-slate-100/40 flex flex-col gap-3.5 text-left">
                  <div className="flex items-center justify-between text-xs font-black text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <Award className="w-4.5 h-4.5 text-accent animate-pulse" />
                      <span>{language === 'FR' ? 'Objectif Prochain Niveau' : 'المستوى التالي'}</span>
                    </span>
                    <span className="text-slate-500 font-extrabold">{pointsToNextTier} pts</span>
                  </div>
                  
                  <div className="relative">
                    {/* Tick marks */}
                    <div className="absolute inset-x-0 -top-1.5 flex justify-between px-1 pointer-events-none select-none">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="w-[1.5px] h-1 bg-slate-300/60" />
                      ))}
                    </div>
                    
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/20">
                      <div 
                        className="h-full bg-gradient-to-r from-accent via-teal-500 to-gold rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: `${Math.min((totalEarned / (totalEarned + pointsToNextTier)) * 100, 100)}%`
                        }}
                      />
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                    {language === 'FR'
                      ? `Accumulez encore ${pointsToNextTier} points d'achat ou de journal de routine pour débloquer le statut supérieur.`
                      : `اكتسبي ${pointsToNextTier} نقطة إضافية عبر المشتريات أو تدوين الروتين لفتح مزايا فئة العضوية التالية.`}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-2xl p-5 flex gap-3.5 shadow-sm text-left">
                <div className="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 text-emerald-600">
                  <Award className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <span className="text-[10.5px] font-black text-emerald-600 uppercase tracking-widest block">
                    {language === 'FR' ? 'STATUT PLATINUM MAXIMUM' : 'عضوية VIP البلاتينية القصوى'}
                  </span>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-semibold mt-1">
                    {language === 'FR'
                      ? 'Félicitations ! Vous disposez du multiplicateur maximal x2.0 et d\'un traitement prioritaire de toutes vos livraisons.'
                      : 'تهانينا! أنتِ تتمتعين بمضاعف النقاط الأقصى x2.0 وأولوية التوصيل لجميع طلباتكِ.'}
                  </p>
                </div>
              </div>
            )}

            {/* Redeem Vouchers (Ticket-stub Card Design) */}
            <div className="flex flex-col gap-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 text-left block">
                {language === 'FR' ? 'BONS DISPONIBLES À DÉBLOQUER' : 'كوبونات متاحة للاسترداد بالنقاط'}
              </span>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {rewards.map((reward, index) => {
                  const canRedeem = points >= reward.cost;
                  return (
                    <div 
                      key={reward.id}
                      className="bg-white border border-slate-200/40 rounded-2xl flex flex-col justify-between relative overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 anim-card-lift"
                    >
                      {/* Left and Right Ticket Cutouts */}
                      <div className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-background border-r border-slate-200/40" />
                      <div className="absolute right-[-8px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-background border-l border-slate-200/40" />

                      {/* Upper Stub */}
                      <div className="p-5 flex-1 flex flex-col gap-3.5 text-left">
                        <div className="w-9 h-9 rounded-xl bg-accent/5 border border-accent/10 flex items-center justify-center text-accent">
                          <Ticket className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xs font-black text-slate-800 leading-tight">
                            {language === 'FR' ? reward.nameFr : reward.nameAr}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                            {language === 'FR' ? reward.descFr : reward.descAr}
                          </p>
                        </div>
                      </div>

                      {/* Dashed Separator */}
                      <div className="border-t border-dashed border-slate-200/60 mx-4" />

                      {/* Lower Stub */}
                      <div className="p-5 flex items-center justify-between select-none">
                        <span className="text-[10.5px] font-black text-primary bg-slate-50 border border-slate-200/40 px-2.5 py-1 rounded-md shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                          {reward.cost} pts
                        </span>
                        <button
                          onClick={() => handleRedeem(reward)}
                          disabled={!canRedeem}
                          className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 active:scale-[0.97] cursor-pointer border-0 outline-none ${
                            canRedeem
                              ? 'bg-primary text-white hover:bg-accent shadow-sm'
                              : 'bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed'
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
              <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in text-left">
                <div>
                  <span className="text-[9px] font-black text-emerald-600 block uppercase tracking-widest leading-none">{language === 'FR' ? 'CODE PROMO DÉBLOQUÉ' : 'رمز الخصم المفتوح'}</span>
                  <p className="text-[10px] text-slate-500 font-semibold mt-1 leading-snug">
                    {language === 'FR' ? 'Copiez ce code et collez-le au moment du panier' : 'انسخي الكود واستعمليه في صفحة الدفع'}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono text-xs font-black text-primary bg-white border px-4.5 py-2.5 rounded-xl select-all shadow-sm">
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
                {language === 'FR' ? 'HISTORIQUE DE TRANSACTIONS DE POINTS' : 'سجل حركات النقاط بالتفصيل'}
              </span>

              {pointsHistory.length === 0 ? (
                <div className="bg-white border border-slate-200/40 rounded-2xl p-10 text-center text-xs text-slate-400 font-semibold select-none shadow-sm">
                  {language === 'FR' ? 'Aucune transaction enregistrée' : 'لا توجد أي معاملات مسجلة بعد'}
                </div>
              ) : (
                <div className="bg-white border border-slate-200/40 rounded-2xl divide-y divide-slate-100/60 overflow-hidden shadow-sm">
                  {pointsHistory.map((tx) => (
                    <div key={tx.id} className="p-4.5 flex items-center justify-between gap-4 text-left transition-colors duration-200 hover:bg-slate-50/40">
                      <div className="flex items-center gap-3.5 min-w-0" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                          tx.amount > 0 
                            ? 'bg-emerald-50/10 border-emerald-500/10 text-emerald-500' 
                            : 'bg-rose-50/10 border-rose-500/10 text-rose-500'
                        }`}>
                          <Coins className="w-4.5 h-4.5" />
                        </div>
                        <div className="min-w-0" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                          <span className="text-xs font-bold text-slate-700 block leading-tight truncate">
                            {language === 'FR' ? tx.descriptionFr : tx.descriptionAr}
                          </span>
                          <span className="text-[9px] text-slate-400 block mt-1 font-extrabold uppercase tracking-wider">
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
            {/* Gamification point banner info */}
            <div className="bezel-outer bg-gradient-to-tr from-emerald-500/10 via-white/50 to-emerald-600/10 border-slate-200/40 p-[3px] rounded-2xl shadow-sm">
              <div 
                className="bezel-inner rounded-[13px] bg-gradient-to-br from-emerald-50/20 via-white/40 to-emerald-50/20 p-5 border border-emerald-500/10 flex items-start gap-4 text-left"
                style={{ textAlign: isRTL ? 'right' : 'left' }}
              >
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-emerald-600 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest block font-heading">
                    {language === 'FR' ? 'RITUELS QUOTIDIENS • COMPLÉTEZ & GAGNEZ' : 'الروتين اليومي • أتمي واحصلي على نقاط'}
                  </span>
                  <p className="text-xs text-emerald-950 font-medium leading-relaxed">
                    {language === 'FR'
                      ? 'Cochez vos étapes de soin du matin et du soir, puis validez pour gagner +5 Points Fidélité par rituel complété chaque jour !'
                      : 'سجلي إكمال روتين الصباح والمساء يومياً، واحصلي على +5 نقاط إضافية عند تأكيد كل روتين!'}
                  </p>
                </div>
              </div>
            </div>

            {/* Checklist AM and PM Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 t-stagger is-shown">
              
              {/* AM Skincare Planner */}
              <div className="bezel-outer bg-gradient-to-tr from-slate-100/80 via-white/50 to-slate-100/80 border-slate-200/40 p-[3px] rounded-2xl shadow-sm t-stagger-line flex flex-col h-full">
                <div 
                  className="bezel-inner rounded-[13px] bg-white p-5 border border-slate-100/40 flex-1 flex flex-col justify-between gap-5 text-left"
                  style={{ textAlign: isRTL ? 'right' : 'left' }}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h3 className="text-sm font-black text-primary font-heading uppercase tracking-wide">
                        {language === 'FR' ? '☀️ Rituel du Matin (AM)' : '☀️ روتين الصباح (AM)'}
                      </h3>
                      {isAmTodayCompleted && (
                        <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 rounded-md text-[9px] font-black uppercase tracking-wider select-none border border-emerald-500/10">
                          {language === 'FR' ? 'Validé' : 'مكتمل'}
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
                          className={`flex items-center gap-3.5 p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all duration-300 select-none ${
                            isAmTodayCompleted
                              ? 'bg-slate-50/40 border-slate-100 text-slate-400 cursor-not-allowed opacity-80'
                              : (amChecks as Record<string, boolean>)[step.key]
                              ? 'border-emerald-500/30 bg-emerald-500/5 text-primary'
                              : 'border-slate-100 text-slate-600 hover:bg-slate-50/85 hover:border-slate-200/50'
                          }`}
                        >
                          <div className="relative flex items-center justify-center">
                            <input
                              type="checkbox"
                              checked={isAmTodayCompleted || (amChecks as Record<string, boolean>)[step.key]}
                              disabled={isAmTodayCompleted}
                              onChange={(e) => setAmChecks(prev => ({ ...prev, [step.key]: e.target.checked }))}
                              className="peer sr-only"
                            />
                            <div className={`w-[18px] h-[18px] rounded-[5px] border transition-all duration-200 flex items-center justify-center ${
                              isAmTodayCompleted
                                ? 'bg-slate-100 border-slate-200 text-slate-500'
                                : (amChecks as Record<string, boolean>)[step.key]
                                ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                                : 'bg-white border-slate-300 peer-hover:border-slate-400'
                            }`}>
                              <Check className={`w-3 h-3 stroke-[3.5] transition-transform duration-200 ${
                                isAmTodayCompleted || (amChecks as Record<string, boolean>)[step.key] ? 'scale-100' : 'scale-0'
                              }`} />
                            </div>
                          </div>
                          <span className="flex-1 leading-normal">{language === 'FR' ? step.labelFr : step.labelAr}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleCompleteAmRoutine}
                    disabled={isAmTodayCompleted}
                    className={`w-full py-3 rounded-xl font-black text-[10.5px] uppercase tracking-wider transition-all duration-300 border-0 outline-none cursor-pointer ${
                      isAmTodayCompleted
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200/10'
                        : 'bg-primary hover:bg-accent text-white shadow-sm active:scale-[0.97]'
                    }`}
                  >
                    {isAmTodayCompleted 
                      ? (language === 'FR' ? 'Complété' : 'مكتمل')
                      : (language === 'FR' ? 'Valider le Matin (+5 pts)' : 'تأكيد روتين الصباح (+5 ن)')}
                  </button>
                </div>
              </div>

              {/* PM Skincare Planner */}
              <div className="bezel-outer bg-gradient-to-tr from-slate-100/80 via-white/50 to-slate-100/80 border-slate-200/40 p-[3px] rounded-2xl shadow-sm t-stagger-line t-stagger-line--2 flex flex-col h-full">
                <div 
                  className="bezel-inner rounded-[13px] bg-white p-5 border border-slate-100/40 flex-1 flex flex-col justify-between gap-5 text-left"
                  style={{ textAlign: isRTL ? 'right' : 'left' }}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h3 className="text-sm font-black text-primary font-heading uppercase tracking-wide">
                        {language === 'FR' ? '🌙 Rituel du Soir (PM)' : '🌙 روتين المساء (PM)'}
                      </h3>
                      {isPmTodayCompleted && (
                        <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 rounded-md text-[9px] font-black uppercase tracking-wider select-none border border-emerald-500/10">
                          {language === 'FR' ? 'Validé' : 'مكتمل'}
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
                          className={`flex items-center gap-3.5 p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all duration-300 select-none ${
                            isPmTodayCompleted
                              ? 'bg-slate-50/40 border-slate-100 text-slate-400 cursor-not-allowed opacity-80'
                              : (pmChecks as Record<string, boolean>)[step.key]
                              ? 'border-emerald-500/30 bg-emerald-500/5 text-primary'
                              : 'border-slate-100 text-slate-600 hover:bg-slate-50/85 hover:border-slate-200/50'
                          }`}
                        >
                          <div className="relative flex items-center justify-center">
                            <input
                              type="checkbox"
                              checked={isPmTodayCompleted || (pmChecks as Record<string, boolean>)[step.key]}
                              disabled={isPmTodayCompleted}
                              onChange={(e) => setPmChecks(prev => ({ ...prev, [step.key]: e.target.checked }))}
                              className="peer sr-only"
                            />
                            <div className={`w-[18px] h-[18px] rounded-[5px] border transition-all duration-200 flex items-center justify-center ${
                              isPmTodayCompleted
                                ? 'bg-slate-100 border-slate-200 text-slate-500'
                                : (pmChecks as Record<string, boolean>)[step.key]
                                ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                                : 'bg-white border-slate-300 peer-hover:border-slate-400'
                            }`}>
                              <Check className={`w-3 h-3 stroke-[3.5] transition-transform duration-200 ${
                                isPmTodayCompleted || (pmChecks as Record<string, boolean>)[step.key] ? 'scale-100' : 'scale-0'
                              }`} />
                            </div>
                          </div>
                          <span className="flex-1 leading-normal">{language === 'FR' ? step.labelFr : step.labelAr}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleCompletePmRoutine}
                    disabled={isPmTodayCompleted}
                    className={`w-full py-3 rounded-xl font-black text-[10.5px] uppercase tracking-wider transition-all duration-300 border-0 outline-none cursor-pointer ${
                      isPmTodayCompleted
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200/10'
                        : 'bg-primary hover:bg-accent text-white shadow-sm active:scale-[0.97]'
                    }`}
                  >
                    {isPmTodayCompleted 
                      ? (language === 'FR' ? 'Complété' : 'مكتمل')
                      : (language === 'FR' ? 'Valider le Soir (+5 pts)' : 'تأكيد روتين المساء (+5 ن)')}
                  </button>
                </div>
              </div>

            </div>

            {/* Daily Skin Diary logger */}
            <div className="bezel-outer bg-gradient-to-tr from-slate-100/80 via-white/50 to-slate-100/80 border-slate-200/40 p-[3px] rounded-2xl shadow-sm text-left">
              <div 
                className="bezel-inner rounded-[13px] bg-white p-6 border border-slate-100/40"
                style={{ textAlign: isRTL ? 'right' : 'left' }}
              >
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-5 select-none">
                  <BookOpen className="w-4.5 h-4.5 text-accent" />
                  <h3 className="text-sm font-black text-primary font-heading uppercase tracking-wide">
                    {language === 'FR' ? 'Journal d\'évolution de ma peau' : 'مفكرة تتبع حالة البشرة'}
                  </h3>
                </div>

                <form onSubmit={handleSubmitDiary} className="space-y-5">
                  
                  {/* Skin wellness Emojis selection */}
                  <div className="space-y-2.5 select-none">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                      {language === 'FR' ? 'État général de ma peau aujourd\'hui :' : 'حالة بشرتي اليوم :'}
                    </span>
                    <div className="flex flex-wrap gap-3">
                      {[
                        { emoji: '🤩', labelFr: 'Éclatante', labelAr: 'مشرقة' },
                        { emoji: '🙂', labelFr: 'Calme / Stable', labelAr: 'مستقرة' },
                        { emoji: '😕', labelFr: 'Tiraillements', labelAr: 'جافة/مشدودة' },
                        { emoji: '😭', labelFr: 'Imperfections', labelAr: 'متهيجة/حبوب' }
                      ].map((em) => (
                        <button
                          key={em.emoji}
                          type="button"
                          onClick={() => setDiaryEmoji(em.emoji)}
                          className={`px-4 py-3 rounded-xl border flex items-center gap-2 transition-all duration-300 active:scale-[0.95] cursor-pointer ${
                            diaryEmoji === em.emoji
                              ? 'border-emerald-600/40 bg-emerald-500/5 text-primary shadow-sm font-bold'
                              : 'border-slate-100 bg-slate-50/50 text-slate-600 hover:bg-slate-50 hover:border-slate-200/50'
                          }`}
                          title={language === 'FR' ? em.labelFr : em.labelAr}
                        >
                          <span className="text-xl leading-none">{em.emoji}</span>
                          <span className="text-xs">{language === 'FR' ? em.labelFr : em.labelAr}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Text diary note */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                      {language === 'FR' ? 'Notes journalières (ressenti, rougeurs, tiraillements) :' : 'ملاحظات اليوم (جفاف، تهيج، تحسن) :'}
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
                      className="w-full border border-slate-200 rounded-xl p-3.5 text-xs focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition duration-200 bg-slate-50 focus:bg-white resize-none"
                    />
                  </div>

                  {/* Photo attachment selector */}
                  <div className="space-y-2.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                      {language === 'FR' ? 'Photo de ma peau (optionnel) :' : 'صورة لبشرتي (اختياري) :'}
                    </span>
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="diary-image-upload"
                      />
                      
                      {diaryImage ? (
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 group">
                          <img
                            src={diaryImage}
                            alt="Skin selfie preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setDiaryImage(null)}
                            className="absolute top-1 right-1 w-5 h-5 bg-rose-600/90 text-white rounded-full flex items-center justify-center cursor-pointer transition hover:bg-rose-700 active:scale-95 border-0 outline-none"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <label
                          htmlFor="diary-image-upload"
                          className="flex flex-col items-center justify-center w-20 h-20 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 hover:border-accent/40 transition duration-300 select-none text-slate-400 hover:text-accent"
                        >
                          <Camera className="w-5 h-5 mb-1" />
                          <span className="text-[9px] font-bold uppercase tracking-wider">Selfie</span>
                        </label>
                      )}
                      
                      <div className="text-[11px] leading-normal text-slate-400 font-semibold max-w-[200px]">
                        {language === 'FR' 
                          ? "Ajoutez une photo pour suivre l'évolution visuelle dans votre frise chronologique."
                          : "أضيفي صورة لتتبع التطور البصري لحالة بشرتكِ في الخط الزمني."}
                      </div>
                    </div>
                  </div>

                  {/* Submit diary note button */}
                  <button
                    type="submit"
                    className="px-8 py-3 bg-primary hover:bg-accent text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 active:scale-[0.97] cursor-pointer border-0 outline-none shadow-sm"
                  >
                    {language === 'FR' ? 'Enregistrer ma note (+5 pts)' : 'حفظ الملاحظة (+5 ن)'}
                  </button>

                </form>
              </div>
            </div>

            {/* Diary logs timeline */}
            <div className="flex flex-col gap-4 text-left" style={{ textAlign: isRTL ? 'right' : 'left' }}>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 font-heading block">
                {language === 'FR' ? 'TIMELINE • HISTORIQUE ÉVOLUTION PEAU' : 'الخط الزمني • سجل تحسن البشرة'}
              </span>

              {compareLogA && !compareLogB && (
                <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 text-xs font-semibold text-accent flex items-center justify-between shadow-inner-sm animate-pulse mb-2">
                  <span>
                    {language === 'FR'
                      ? "Sélectionnez une deuxième photo pour lancer le comparatif avant/après."
                      : "يرجى تحديد صورة ثانية لبدء مقارنة قبل وبعد."}
                  </span>
                  <button
                    onClick={() => setCompareLogA(null)}
                    className="text-[10px] font-black uppercase tracking-wider underline cursor-pointer border-0 outline-none bg-transparent hover:text-primary transition"
                  >
                    {language === 'FR' ? "Annuler" : "إلغاء"}
                  </button>
                </div>
              )}

              {diaryLogs.length === 0 ? (
                <div className="bg-white border border-slate-200/40 rounded-2xl p-10 text-center text-xs text-slate-400 font-semibold select-none shadow-sm relative overflow-hidden">
                  <div className="absolute right-0 bottom-0 w-24 h-24 rounded-full bg-slate-50 blur-xl pointer-events-none" />
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                    <BookOpen className="w-4.5 h-4.5" />
                  </div>
                  <p className="max-w-xs mx-auto leading-relaxed">
                    {language === 'FR' ? 'Aucune note enregistrée dans votre journal' : 'مفكرتكِ فارغة حالياً، ابدئي بتدوين ملاحظاتكِ'}
                  </p>
                </div>
              ) : (
                <div 
                  className={`relative space-y-6 ${
                    isRTL 
                      ? 'border-r border-slate-200 mr-4 pr-6 pl-0' 
                      : 'border-l border-slate-200 ml-4 pl-6'
                  } text-left t-stagger is-shown`}
                  style={{ textAlign: isRTL ? 'right' : 'left' }}
                >
                  {diaryLogs.map((log, index) => {
                    const staggerClass = index < 4 ? `t-stagger-line${index > 0 ? ` t-stagger-line--${index + 1}` : ''}` : '';
                    return (
                      <div key={log.id} className={`relative ${staggerClass}`}>
                        {/* Timeline dot */}
                        <div 
                          className={`absolute top-2 w-4 h-4 rounded-full bg-white border-[3px] border-primary flex items-center justify-center shadow-sm ${
                            isRTL ? '-right-[35px] left-auto' : '-left-[35px] right-auto'
                          }`}
                        >
                          <div className="w-1 h-1 rounded-full bg-accent animate-pulse" />
                        </div>
                        
                        {/* Timeline Card */}
                        <div className="bg-white border border-slate-200/40 rounded-xl p-5 shadow-sm space-y-2.5 relative overflow-hidden">
                          <div className="absolute right-0 bottom-0 w-16 h-16 rounded-full bg-slate-50/50 blur-lg pointer-events-none" />
                          <div className="flex items-center justify-between gap-3 text-[10px] font-bold text-slate-400 select-none border-b border-slate-100 pb-2">
                            <span className="bg-slate-50 border border-slate-200/50 px-2 py-0.5 rounded text-slate-500 font-semibold">
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
                              <div className="relative rounded-lg overflow-hidden border border-slate-100 w-full max-h-48 flex justify-center bg-slate-50">
                                <img
                                  src={log.image}
                                  alt="Skin Selfie"
                                  className="w-full h-full object-cover max-h-48"
                                />
                              </div>
                              <div className="flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => handleSelectForCompare(log)}
                                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-300 active:scale-95 cursor-pointer border ${
                                    compareLogA?.id === log.id
                                      ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                                      : compareLogB?.id === log.id
                                      ? 'bg-blue-500 text-white border-blue-500 shadow-sm'
                                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                                  }`}
                                >
                                  {compareLogA?.id === log.id
                                    ? (language === 'FR' ? 'Photo A' : 'صورة أ')
                                    : compareLogB?.id === log.id
                                    ? (language === 'FR' ? 'Photo B' : 'صورة ب')
                                    : (language === 'FR' ? 'Comparer' : 'مقارنة')}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

        {/* Before/After Sliding Image Comparison Modal */}
        {isComparing && compareLogA && compareLogB && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
            <div className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
                <h3 className="text-sm font-black text-primary uppercase tracking-wide">
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
              <div className="relative flex-grow flex items-center justify-center bg-slate-50 p-6 overflow-hidden min-h-[300px]">
                <div className="relative w-full max-w-md aspect-[3/4] rounded-2xl overflow-hidden shadow-md bg-white select-none">
                  
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

                  {/* Vertical slider handler line */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-white cursor-ew-resize pointer-events-none shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                    style={{ left: `${sliderPosition}%` }}
                  >
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white border border-slate-200 shadow-lg flex items-center justify-center text-slate-500 font-bold text-xs select-none">
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
  );
}
