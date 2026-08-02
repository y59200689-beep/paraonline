'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { useLoyalty, LoyaltyTier } from '@/context/LoyaltyContext';
import { useSettings } from '@/context/SettingsContext';
import { supabase } from '@/lib/supabase';
import { 
  Search, ShoppingBag, ArrowLeft, ArrowRight, Clock, MapPin, 
  Award, Coins, Ticket, Copy, Calendar, Plus,
  Smile, Meh, Frown, Sparkles, Camera, X,
  Image as ImageIcon, Heart, Trash2, Sun, Moon, ShieldCheck,
  User, Settings, FileText, Printer, Truck, MessageCircle,
  ExternalLink, Activity, RefreshCw, ChevronRight, Zap, Gift,
  Percent, Compass, Droplet, Star, CheckCircle2, AlertCircle,
  Box, CreditCard, ChevronDown, SlidersHorizontal, Edit3, Save, Layers, KeyRound
} from 'lucide-react';
import { Product, PRODUCTS_DB } from '@/lib/data';
import Link from 'next/link';
import { useUi } from '@/context/UiContext';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { CustomerAuthPortal } from '@/components/CustomerAuthPortal';
import { ShopShell } from '@/components/ShopShell';

interface OrderItem {
  id: number;
  title: string;
  quantity: number;
  price: number;
  image?: string;
}

type CustomerProductImage = Pick<OrderItem, 'title' | 'image'> & { id?: number };

const CUSTOMER_PRODUCT_IMAGE_FALLBACK = '/images/categories/visage.webp';

function resolveCustomerProductImage(item: CustomerProductImage): string {
  const image = item.image?.trim();
  if (image) {
    // Product packshots were migrated to WebP. Preserve external image URLs while
    // keeping older order snapshots pointing at their current local asset.
    if (image.startsWith('/images/')) return image.replace(/\.png$/i, '.webp');
    return image;
  }

  const matchingProduct = PRODUCTS_DB.find((product) =>
    product.id === item.id || product.title.toLowerCase() === item.title?.toLowerCase()
  );

  return matchingProduct?.image || CUSTOMER_PRODUCT_IMAGE_FALLBACK;
}

function applyCustomerImageFallback(event: React.SyntheticEvent<HTMLImageElement>) {
  const image = event.currentTarget;
  if (image.dataset.fallbackApplied) return;
  image.dataset.fallbackApplied = 'true';
  image.src = CUSTOMER_PRODUCT_IMAGE_FALLBACK;
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
  carrier?: string;
  tracking_number?: string;
  estimated_delivery?: string;
  date?: string;
  created_at?: string;
}

interface UserAddress {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  city: string;
  address: string;
  isDefault: boolean;
}

const SAMPLE_ORDERS_PRESETS: Order[] = [
  {
    order_id: 'PO-2026-8942',
    customer_name: 'Fatima-Zohra Alami',
    phone_number: '0661234567',
    address: 'Boulevard Anfa, Résidence Les Fleurs',
    city: 'Casablanca',
    subtotal: 780,
    discount_amount: 78,
    applied_coupon: 'BEAUTY10',
    gift_item: 'Masque Hydra-Glow Offert (50ml)',
    total: 702,
    status: 'In Transit',
    carrier: 'Yalidine Express',
    tracking_number: 'YL-CAS-994821',
    estimated_delivery: "Aujourd'hui avant 19:00",
    date: '2026-07-22T14:30:00Z',
    created_at: '2026-07-22T14:30:00Z',
    items: [
      { id: 1, title: 'Sérum Concentré Niacinamide 10% Pure Pureté', quantity: 1, price: 340, image: '/images/hero_serum_dropper.webp' },
      { id: 2, title: 'Crème Hydratante Réparatrice Cicaplast B5+', quantity: 2, price: 220, image: '/images/cicaplast_hero_packshot.webp' }
    ]
  },
  {
    order_id: 'PO-2026-4102',
    customer_name: 'Fatima-Zohra Alami',
    phone_number: '0661234567',
    address: 'Avenue Mohammed V, Agdal',
    city: 'Rabat',
    subtotal: 540,
    discount_amount: 0,
    applied_coupon: null,
    gift_item: null,
    total: 540,
    status: 'Delivered',
    carrier: 'Cathedis Logistics',
    tracking_number: 'CT-RBT-881240',
    estimated_delivery: 'Livré le 20 Juillet',
    date: '2026-07-20T09:15:00Z',
    created_at: '2026-07-20T09:15:00Z',
    items: [
      { id: 3, title: 'Gel Nettoyant Purifiant Effaclar Duo+ M', quantity: 1, price: 290, image: '/images/effaclar_hero_packshot.webp' },
      { id: 4, title: 'Fluide Solaire Anti-Taches SPF50+ Ultra-Léger', quantity: 1, price: 250, image: '/images/anthelios_hero_packshot.webp' }
    ]
  }
];

const MOCK_DIAGNOSTIC_RESULT = {
  date: '18 Juillet 2026',
  score: 88,
  skinTypeFr: 'Boutons & Taches / Peaux Mixtes à Tendances Acnéiques',
  skinTypeAr: 'مختلطة مع تصبغات وحبوب خفيفة',
  metrics: {
    hydration: 85,
    elasticity: 90,
    sebumControl: 74,
    skinBarrier: 92
  },
  concerns: ['Taches d\'hyper-pigmentation', 'Brillance Zone T', 'Déshydratation ponctuelle'],
  routineAm: [
    { title: 'Gel Nettoyant Doux Purifiant', brand: 'La Roche-Posay', image: '/images/effaclar_hero_packshot.webp', price: 210 },
    { title: 'Sérum Éclat Vitamine C Pure', brand: 'Vichy', image: '/images/hero_serum_dropper.webp', price: 340 },
    { title: 'Fluide Solaire Invisible SPF50+', brand: 'La Roche-Posay', image: '/images/anthelios_hero_packshot.webp', price: 250 }
  ],
  routinePm: [
    { title: 'Huile Démaquillante Solide', brand: 'CeraVe', image: '/images/categories/visage.webp', price: 190 },
    { title: 'Sérum Concentré Niacinamide 10%', brand: 'La Roche-Posay', image: '/images/hero_serum_dropper.webp', price: 320 },
    { title: 'Baume Réparateur Intense Cicaplast B5+', brand: 'La Roche-Posay', image: '/images/cicaplast_hero_packshot.webp', price: 220 }
  ]
};

const AVAILABLE_COUPONS = [
  {
    code: 'BEAUTY10',
    discountFr: '-10% de Réduction Immédiate',
    discountAr: 'خصم 10% فوري',
    minSpend: 'Dès 300 MAD',
    expires: 'Valable encore 14 jours',
    categoryFr: 'Sur tout le catalogue'
  },
  {
    code: 'FREESHIP',
    discountFr: 'Livraison Express Gratuite',
    discountAr: 'توصيل مجاني لكافة المدن',
    minSpend: 'Dès 250 MAD',
    expires: 'Offert pour membre VIP',
    categoryFr: 'Partout au Maroc'
  },
  {
    code: 'VIP15',
    discountFr: '-15% sur la gamme Anti-Âge & Sérums',
    discountAr: 'خصم 15% على مستحضرات الشباب',
    minSpend: 'Dès 500 MAD',
    expires: 'Offre exclusive membre Gold',
    categoryFr: 'Sérums & Anti-Âge'
  }
];

export default function CustomerDashboard() {
  const { language } = useTranslation();
  const { settings } = useSettings();
  const isRTL = language === 'AR';

  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('customer_portal_theme');
      if (saved === 'dark' || saved === 'light') {
        setThemeMode(saved);
      }
    } catch (e) {}
  }, []);

  const toggleThemeMode = () => {
    const next = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(next);
    try {
      localStorage.setItem('customer_portal_theme', next);
    } catch (e) {}
  };

  // Loyalty states
  const {
    points,
    totalEarned,
    tier,
    pointsHistory,
    redeemReward,
    tierMultiplier,
    pointsToNextTier,
    clientUser,
    isLoadingAuth,
    loginClient,
    signUpClient,
    updateClientProfile,
    logoutClient,
  } = useLoyalty();
  const { showToast, setDiagnosticOpen } = useUi();

  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  // Customer portal sections
  type TabType = 'overview' | 'commandes' | 'diagnostic' | 'cagnotte' | 'favoris' | 'profil';
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab')?.toLowerCase();
      if (tabParam === 'favoris') setActiveTab('favoris');
      else if (tabParam === 'commandes' || tabParam === 'suivi') setActiveTab('commandes');
      else if (tabParam === 'diagnostic') setActiveTab('diagnostic');
      else if (tabParam === 'cagnotte' || tabParam === 'club') setActiveTab('cagnotte');
      else if (tabParam === 'profil') setActiveTab('profil');
      else if (tabParam === 'overview' || tabParam === 'vue') setActiveTab('overview');
    }
  }, []);

  const tabsRef = useRef<HTMLDivElement>(null);

  // Auth form states
  const [showAuthPanel, setShowAuthPanel] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const authSubmissionInFlight = useRef(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authSubmissionInFlight.current) return;
    authSubmissionInFlight.current = true;
    setAuthLoading(true);
    setAuthError(null);
    setAuthNotice(null);
    try {
      const res = await loginClient(authEmail, authPassword);
      if (!res.success) setAuthError(res.error || 'Erreur de connexion.');
    } finally {
      authSubmissionInFlight.current = false;
      setAuthLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authSubmissionInFlight.current) return;
    authSubmissionInFlight.current = true;
    setAuthLoading(true);
    setAuthError(null);
    setAuthNotice(null);
    try {
      const res = await signUpClient(authEmail, authPassword, authName, authPhone);
      if (!res.success) {
        setAuthError(res.error || 'Erreur de création de compte.');
        return;
      }

      if (res.emailConfirmationRequired) {
        setAuthPassword('');
        setAuthNotice(isRTL
          ? 'تم إنشاء حسابك وإرسال رسالة تأكيد إلى بريدك الإلكتروني. افتحي الرسالة واضغطي على الرابط، ثم سجّلي الدخول.'
          : 'Votre compte a été créé. Un email de confirmation vient de vous être envoyé : ouvrez-le, cliquez sur le lien, puis connectez-vous.');
        setAuthView('login');
      }
    } finally {
      authSubmissionInFlight.current = false;
      setAuthLoading(false);
    }
  };

  // Orders State & Search
  const [orders, setOrders] = useState<Order[]>(SAMPLE_ORDERS_PRESETS);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderFilterStatus, setOrderFilterStatus] = useState<'all' | 'in_transit' | 'delivered'>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyCouponToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast(isRTL ? `تم نسخ الكود: ${code}` : `Code promo ${code} copié !`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // Reorder 1-click helper
  const handleReorder = (order: Order) => {
    order.items.forEach((item) => {
      const foundInDb = PRODUCTS_DB.find((p) => p.title.toLowerCase().includes(item.title.toLowerCase()) || p.id === item.id);
      if (foundInDb) {
        addToCart(foundInDb, item.quantity);
      } else {
        // Fallback dummy product
        addToCart({
          id: item.id || Math.floor(Math.random() * 100000),
          title: item.title,
          name: item.title,
          price: item.price,
          image: resolveCustomerProductImage(item),
          category: 'Visage',
          description: item.title
        } as Product, item.quantity);
      }
    });
    showToast(isRTL ? 'تمت إضافة جميع منتجات الطلبية إلى السلة!' : 'Tous les soins de la commande ont été ajoutés à votre panier !');
  };

  // Add Entire Prescribed Routine to Cart
  const handleAddFullRoutineToCart = () => {
    [...MOCK_DIAGNOSTIC_RESULT.routineAm, ...MOCK_DIAGNOSTIC_RESULT.routinePm].forEach((item) => {
      const match = PRODUCTS_DB.find((p) => p.title.toLowerCase().includes(item.title.toLowerCase()));
      if (match) {
        addToCart(match, 1);
      } else {
        addToCart({
          id: Math.floor(Math.random() * 100000),
          title: item.title,
          name: item.title,
          price: item.price,
          image: item.image,
          category: 'Visage',
          description: item.title
        } as Product, 1);
      }
    });
    showToast(isRTL ? 'تمت إضافة الروتين الكامل إلى السلة!' : 'La routine complète a été ajoutée à votre panier !');
  };

  // Filtered Orders calculation
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch = !orderSearchQuery || 
        o.order_id.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
        o.items.some((i) => i.title.toLowerCase().includes(orderSearchQuery.toLowerCase()));
      
      const matchesStatus = 
        orderFilterStatus === 'all' ? true :
        orderFilterStatus === 'in_transit' ? (o.status.toLowerCase().includes('transit') || o.status.toLowerCase().includes('shipped') || o.status.toLowerCase().includes('expédié')) :
        (o.status.toLowerCase().includes('deliver') || o.status.toLowerCase().includes('livré'));

      return matchesSearch && matchesStatus;
    });
  }, [orders, orderSearchQuery, orderFilterStatus]);

  // Profile & Address States
  const [profileName, setProfileName] = useState(clientUser?.name || 'Fatima-Zohra Alami');
  const [profilePhone, setProfilePhone] = useState(clientUser?.phone || '0661234567');
  const [profileEmail, setProfileEmail] = useState(clientUser?.email || 'fatimazohra@exemple.com');
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([
    {
      id: 'addr_1',
      label: 'Adresse Principale (Domicile)',
      fullName: 'Fatima-Zohra Alami',
      phone: '0661234567',
      city: 'Casablanca',
      address: 'Boulevard Anfa, Résidence Les Fleurs, Appt 14',
      isDefault: true
    },
    {
      id: 'addr_2',
      label: 'Bureau (Travail)',
      fullName: 'Fatima-Zohra Alami',
      phone: '0661234567',
      city: 'Casablanca',
      address: 'Tour Marina Casablanca, 12ème Étage',
      isDefault: false
    }
  ]);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [newAddrLabel, setNewAddrLabel] = useState('');
  const [newAddrCity, setNewAddrCity] = useState('Casablanca');
  const [newAddrStreet, setNewAddrStreet] = useState('');

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrStreet.trim()) return;
    const newAddr: UserAddress = {
      id: 'addr_' + Date.now(),
      label: newAddrLabel || 'Adresse Secondaire',
      fullName: profileName,
      phone: profilePhone,
      city: newAddrCity,
      address: newAddrStreet,
      isDefault: false
    };
    setSavedAddresses([...savedAddresses, newAddr]);
    setShowAddAddressModal(false);
    setNewAddrLabel('');
    setNewAddrStreet('');
    showToast(isRTL ? 'تمت إضافة العنوان الجديد بنجاح' : 'Nouvelle adresse de livraison enregistrée !');
  };

  useEffect(() => {
    if (!clientUser) return;
    setProfileName(clientUser.name || '');
    setProfilePhone(clientUser.phone || '');
    setProfileEmail(clientUser.email || '');
  }, [clientUser]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProfileSaving(true);
    const result = await updateClientProfile({ name: profileName, phone: profilePhone });
    setIsProfileSaving(false);
    if (!result.success) {
      showToast(result.error || (isRTL ? 'تعذر تحديث الملف الشخصي.' : 'Impossible de mettre à jour votre profil.'));
      return;
    }
    showToast(isRTL ? 'تم تحديث معلومات الحساب بنجاح' : 'Vos informations personnelles ont été mises à jour.');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordFeedback(null);

    if (newPassword.length < 8) {
      setPasswordFeedback({ type: 'error', message: 'Utilisez au moins 8 caractères pour votre nouveau mot de passe.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordFeedback({ type: 'error', message: 'Les deux mots de passe ne correspondent pas.' });
      return;
    }

    setIsPasswordSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setIsPasswordSaving(false);
    if (error) {
      setPasswordFeedback({ type: 'error', message: error.message || 'Impossible de modifier votre mot de passe.' });
      return;
    }

    setNewPassword('');
    setConfirmPassword('');
    setPasswordFeedback({ type: 'success', message: 'Votre mot de passe a bien été mis à jour.' });
  };

  // Convert points to MAD value
  const walletMadValue = useMemo(() => {
    return Math.floor(points / 10);
  }, [points]);

  return (
    <ShopShell hideHeader={!clientUser}>
      <div 
        className={`min-h-screen relative overflow-hidden transition-colors ${
          themeMode === 'dark' 
            ? 'bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950' 
            : 'bg-[#FAF9F6] text-slate-900 selection:bg-emerald-500 selection:text-white'
        } ${
          !clientUser ? 'flex flex-col items-center justify-center p-4 sm:p-6 lg:p-10' : 'py-10 px-4 sm:px-6 lg:px-8'
        }`}
        style={{ direction: isRTL ? 'rtl' : 'ltr' }}
      >
        {/* Subtle Ambient Glow Background Orbs */}
        <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.02] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="pointer-events-none absolute -top-40 left-1/3 w-[700px] h-[700px] rounded-full bg-emerald-500/10 blur-[140px]" />
        <div className="pointer-events-none absolute -bottom-40 right-1/3 w-[700px] h-[700px] rounded-full bg-cyan-500/10 blur-[140px]" />

        <div className={`w-full relative z-10 ${!clientUser ? 'max-w-6xl' : 'max-w-6xl mx-auto space-y-8'}`}>
          
          {/* ── NOT LOGGED IN: RENDERS AUTH PORTAL ── */}
          {!clientUser ? (
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
              authNotice={authNotice}
              authLoading={authLoading}
              handleLogin={handleLogin}
              handleSignup={handleSignup}
              themeMode={themeMode}
              onToggleTheme={toggleThemeMode}
            />
          ) : (
            /* ── LOGGED IN: FLAGSHIP SHOPIFY-PLUS DASHBOARD ── */
            <>
              {/* ──────────────── 1. ACCOUNT WORKSPACE HEADER ──────────────── */}
              <section className={`rounded-2xl border p-5 sm:p-6 transition-colors duration-200 ${
                themeMode === 'dark'
                  ? 'border-slate-800 bg-slate-900 text-slate-100'
                  : 'border-slate-200 bg-slate-50/70 text-slate-900'
              }`}>
                <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex min-w-0 items-center gap-4" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-lg font-bold text-white shadow-sm">
                      {(clientUser.name || clientUser.email || 'C').charAt(0).toUpperCase()}
                      <span className={`absolute -bottom-1 ${isRTL ? '-left-1' : '-right-1'} flex h-5 w-5 items-center justify-center rounded-full border-2 ${themeMode === 'dark' ? 'border-slate-900 bg-emerald-400 text-slate-950' : 'border-slate-50 bg-emerald-500 text-white'}`}>
                        <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                      </span>
                    </div>

                    <div className="min-w-0" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                      <div className="mb-1 flex flex-wrap items-center gap-2" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                        <p className={`text-[11px] font-semibold uppercase tracking-[0.12em] ${themeMode === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                          {isRTL ? 'مساحتي الشخصية' : 'Espace personnel'}
                        </p>
                        <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] ${
                          themeMode === 'dark'
                            ? 'border-amber-400/30 bg-amber-400/10 text-amber-300'
                            : 'border-amber-600/25 bg-amber-50 text-amber-800'
                        }`}>
                          <Award className="h-3 w-3" aria-hidden="true" />
                          {isRTL ? `${tier} عضو` : `Membre ${tier}`}
                        </span>
                      </div>
                      <h2 className={`truncate text-xl font-bold tracking-tight sm:text-2xl ${themeMode === 'dark' ? 'text-white' : 'text-slate-950'}`}>
                        {clientUser.name?.trim() || clientUser.email.split('@')[0]}
                      </h2>
                      <div className={`mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm ${themeMode === 'dark' ? 'text-slate-400' : 'text-slate-600'}`} style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                        <span className="truncate">{clientUser.email}</span>
                        <span aria-hidden="true" className="hidden sm:inline">•</span>
                        <span className={`inline-flex items-center gap-1.5 whitespace-nowrap ${themeMode === 'dark' ? 'text-emerald-400' : 'text-emerald-700'}`}>
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          {isRTL ? 'حساب نشط وآمن' : 'Compte actif et sécurisé'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2" style={{ justifyContent: isRTL ? 'flex-start' : 'flex-end' }}>
                    <button
                      onClick={() => setDiagnosticOpen(true)}
                      className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-emerald-600 px-4 text-xs font-bold text-white transition-colors hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 cursor-pointer"
                    >
                      <Sparkles className="h-4 w-4" aria-hidden="true" />
                      <span>{isRTL ? 'بدء تشخيص البشرة' : 'Diagnostic peau'}</span>
                    </button>

                    <a
                      href="https://wa.me/212660808080"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex min-h-10 items-center gap-2 rounded-lg border px-3.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                        themeMode === 'dark'
                          ? 'border-slate-700 bg-slate-950 text-slate-200 hover:bg-slate-800'
                          : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <MessageCircle className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                      <span>{isRTL ? 'الدعم' : 'Support'}</span>
                    </a>

                    <button
                      onClick={toggleThemeMode}
                      aria-label={themeMode === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
                      title={themeMode === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 cursor-pointer ${
                        themeMode === 'dark'
                          ? 'border-slate-700 bg-slate-950 text-amber-300 hover:bg-slate-800'
                          : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {themeMode === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </button>

                    <button
                      onClick={logoutClient}
                      className={`min-h-10 rounded-lg border px-3.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 cursor-pointer ${
                        themeMode === 'dark'
                          ? 'border-slate-700 bg-slate-950 text-slate-300 hover:border-rose-400/50 hover:text-rose-300'
                          : 'border-slate-300 bg-white text-slate-600 hover:border-rose-300 hover:text-rose-700'
                      }`}
                    >
                      {isRTL ? 'خروج' : 'Déconnexion'}
                    </button>
                  </div>
                </div>
              </section>


              {/* ──────────────── CUSTOMER PORTAL NAVIGATION ──────────────── */}
              <nav
                aria-label={isRTL ? 'أقسام حساب العميل' : 'Sections de votre espace client'}
                className={`w-full rounded-[1.35rem] border p-1.5 shadow-[0_16px_40px_-30px_oklch(0.22_0.03_180/0.45)] ${
                  themeMode === 'dark'
                    ? 'border-slate-800 bg-slate-900/95'
                    : 'border-[oklch(0.91_0.012_175)] bg-[oklch(0.985_0.006_175)]'
                }`}
              >
                <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <div
                    ref={tabsRef}
                    role="tablist"
                    aria-orientation="horizontal"
                    className="grid min-w-max grid-flow-col auto-cols-[minmax(9.5rem,1fr)] gap-1 lg:min-w-0 lg:grid-flow-row lg:grid-cols-6 lg:auto-cols-auto"
                  >
                    {[
                      { id: 'overview', labelFr: 'Vue d\'ensemble', labelAr: 'ملخص الحساب', icon: LayoutGridIcon },
                      { id: 'commandes', labelFr: 'Mes commandes', labelAr: 'طلباتي والشحن', icon: Box },
                      { id: 'diagnostic', labelFr: 'Diagnostic IA', labelAr: 'تشخيص البشرة', icon: Sparkles },
                      { id: 'cagnotte', labelFr: 'Cagnotte & VIP', labelAr: 'المحفظة والكوبونات', icon: Ticket },
                      { id: 'favoris', labelFr: 'Mes favoris', labelAr: 'المفضلة', icon: Heart },
                      { id: 'profil', labelFr: 'Profil & adresses', labelAr: 'الملف والعناوين', icon: User }
                    ].map((tab, index, allTabs) => {
                      const isActive = activeTab === tab.id;
                      const TabIcon = tab.icon;

                      const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
                        const direction = isRTL ? -1 : 1;
                        let nextIndex: number | null = null;

                        if (event.key === 'ArrowRight') nextIndex = (index + direction + allTabs.length) % allTabs.length;
                        if (event.key === 'ArrowLeft') nextIndex = (index - direction + allTabs.length) % allTabs.length;
                        if (event.key === 'Home') nextIndex = 0;
                        if (event.key === 'End') nextIndex = allTabs.length - 1;
                        if (nextIndex === null) return;

                        event.preventDefault();
                        setActiveTab(allTabs[nextIndex].id as TabType);
                        const buttons = tabsRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
                        buttons?.[nextIndex]?.focus();
                      };

                      return (
                        <button
                          key={tab.id}
                          id={`customer-tab-${tab.id}`}
                          type="button"
                          role="tab"
                          aria-selected={isActive}
                          tabIndex={isActive ? 0 : -1}
                          onKeyDown={handleKeyDown}
                          onClick={() => setActiveTab(tab.id as TabType)}
                          className={`group relative min-h-14 rounded-[1rem] px-3.5 py-3 text-[0.78rem] font-semibold tracking-[-0.01em] outline-none transition-[background-color,color,box-shadow,transform] duration-200 ease-out motion-reduce:transition-none flex items-center justify-center gap-2.5 cursor-pointer border-0 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 active:translate-y-px ${
                            isActive
                              ? themeMode === 'dark'
                                ? 'bg-slate-800 text-slate-50 shadow-[0_8px_20px_-14px_oklch(0.2_0.02_175/0.8)]'
                                : 'bg-[oklch(0.955_0.022_175)] text-[oklch(0.28_0.055_175)] shadow-[0_8px_22px_-16px_oklch(0.42_0.07_175/0.45)]'
                              : themeMode === 'dark'
                                ? 'bg-transparent text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
                                : 'bg-transparent text-slate-600 hover:bg-[oklch(0.965_0.008_175)] hover:text-slate-900'
                          }`}
                        >
                          <TabIcon
                            aria-hidden="true"
                            strokeWidth={isActive ? 2.25 : 1.8}
                            className={`h-[1.05rem] w-[1.05rem] shrink-0 transition-colors duration-200 motion-reduce:transition-none ${
                              isActive
                                ? 'text-emerald-600'
                                : themeMode === 'dark'
                                  ? 'text-slate-500 group-hover:text-slate-300'
                                  : 'text-slate-400 group-hover:text-slate-600'
                            }`}
                          />
                          <span className="whitespace-nowrap">{language === 'AR' ? tab.labelAr : tab.labelFr}</span>
                          <span
                            aria-hidden="true"
                            className={`absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-emerald-500 transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none ${
                              isActive ? 'scale-x-100 opacity-100' : 'scale-x-50 opacity-0'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </nav>


              {/* ──────────────── TAB 1: VUE D'ENSEMBLE (OVERVIEW BENTO GRID) ──────────────── */}
              {activeTab === 'overview' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  
                  {/* Executive Metric Cards Bento */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    
                    {/* Bento 1: Wallet Balance */}
                    <div className={`p-6 rounded-3xl border shadow-lg relative overflow-hidden flex flex-col justify-between space-y-4 ${
                      themeMode === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/90'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-500">
                          SOLDE CAGNOTTE
                        </span>
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center">
                          <Coins className="w-5 h-5" />
                        </div>
                      </div>

                      <div>
                        <span className={`text-3xl font-black font-heading ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                          {points} <span className="text-xs font-mono font-bold text-emerald-500">PTS</span>
                        </span>
                        <p className={`text-xs mt-1 ${themeMode === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                          Valeur estimée: <strong className="text-emerald-500 font-bold">{walletMadValue} MAD</strong>
                        </p>
                      </div>

                      <button
                        onClick={() => setActiveTab('cagnotte')}
                        className="w-full py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 font-bold text-xs flex items-center justify-center gap-1.5 border border-emerald-500/20 transition cursor-pointer"
                      >
                        <span>Convertir mes points</span>
                        <ChevronRight className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
                      </button>
                    </div>

                    {/* Bento 2: Active Orders */}
                    <div className={`p-6 rounded-3xl border shadow-lg relative overflow-hidden flex flex-col justify-between space-y-4 ${
                      themeMode === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/90'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-500">
                          COMMANDES EN COURS
                        </span>
                        <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 flex items-center justify-center">
                          <Truck className="w-5 h-5" />
                        </div>
                      </div>

                      <div>
                        <span className={`text-3xl font-black font-heading ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                          {orders.filter(o => o.status.toLowerCase().includes('transit') || o.status.toLowerCase().includes('shipped')).length || 1} <span className="text-xs font-mono font-bold text-cyan-500">Colis</span>
                        </span>
                        <p className={`text-xs mt-1 ${themeMode === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                          Dernier colis: <strong className="text-cyan-500 font-bold">PO-2026-8942</strong> (En transit)
                        </p>
                      </div>

                      <button
                        onClick={() => setActiveTab('commandes')}
                        className="w-full py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-500 font-bold text-xs flex items-center justify-center gap-1.5 border border-cyan-500/20 transition cursor-pointer"
                      >
                        <span>Suivre la livraison</span>
                        <ChevronRight className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
                      </button>
                    </div>

                    {/* Bento 3: AI Skin Score */}
                    <div className={`p-6 rounded-3xl border shadow-lg relative overflow-hidden flex flex-col justify-between space-y-4 ${
                      themeMode === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/90'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-500">
                          SCORE CUTANÉ IA
                        </span>
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
                          <Sparkles className="w-5 h-5" />
                        </div>
                      </div>

                      <div>
                        <span className={`text-3xl font-black font-heading ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                          88 <span className="text-xs font-mono font-bold text-amber-500">/ 100</span>
                        </span>
                        <p className={`text-xs mt-1 ${themeMode === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                          Profil: <strong className="text-amber-500 font-bold">Peau Mixte & Taches</strong>
                        </p>
                      </div>

                      <button
                        onClick={() => setActiveTab('diagnostic')}
                        className="w-full py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 font-bold text-xs flex items-center justify-center gap-1.5 border border-amber-500/20 transition cursor-pointer"
                      >
                        <span>Voir la routine</span>
                        <ChevronRight className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
                      </button>
                    </div>

                    {/* Bento 4: Available Coupons */}
                    <div className={`p-6 rounded-3xl border shadow-lg relative overflow-hidden flex flex-col justify-between space-y-4 ${
                      themeMode === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/90'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-purple-500">
                          BONS DISPONIBLES
                        </span>
                        <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-500 flex items-center justify-center">
                          <Ticket className="w-5 h-5" />
                        </div>
                      </div>

                      <div>
                        <span className={`text-3xl font-black font-heading ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                          3 <span className="text-xs font-mono font-bold text-purple-500">Coupons</span>
                        </span>
                        <p className={`text-xs mt-1 ${themeMode === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                          Code actif: <strong className="text-purple-500 font-mono font-bold">BEAUTY10 (-10%)</strong>
                        </p>
                      </div>

                      <button
                        onClick={() => copyCouponToClipboard('BEAUTY10')}
                        className="w-full py-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-500 font-bold text-xs flex items-center justify-center gap-1.5 border border-purple-500/20 transition cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copier le code BEAUTY10</span>
                      </button>
                    </div>

                  </div>


                  {/* Recent Order Live Card */}
                  <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl relative overflow-hidden ${
                    themeMode === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/90'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-emerald-500 uppercase tracking-widest">
                            DERNIÈRE EXPÉDITION
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                            En Transit Express
                          </span>
                        </div>
                        <h3 className={`text-xl font-black font-heading ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                          Commande N° PO-2026-8942
                        </h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleReorder(SAMPLE_ORDERS_PRESETS[0])}
                          className="premium-green-cta px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-md cursor-pointer border-0 flex items-center gap-1.5"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Re-commander en 1 clic</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6 items-center">
                      <div className="space-y-3 lg:col-span-2">
                        <p className={`text-xs font-semibold ${themeMode === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                          Articles inclus dans cette expédition:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {SAMPLE_ORDERS_PRESETS[0].items.map((item, idx) => (
                            <div key={idx} className={`p-3 rounded-2xl border flex items-center gap-3 ${
                              themeMode === 'dark' ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200/80'
                            }`}>
                              <div className="w-12 h-12 rounded-xl bg-white p-1 border border-slate-200 shrink-0">
                                <img src={resolveCustomerProductImage(item)} onError={applyCustomerImageFallback} alt={item.title} className="w-full h-full object-contain" />
                              </div>
                              <div className="min-w-0 flex-1 text-left">
                                <h4 className={`text-xs font-bold truncate ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                                  {item.title}
                                </h4>
                                <p className="text-[11px] font-mono text-slate-400">
                                  {item.quantity}x • {item.price} MAD
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className={`p-5 rounded-2xl border space-y-3 text-left ${
                        themeMode === 'dark' ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200/80'
                      }`}>
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Livraison Estimée</span>
                          <p className="text-sm font-bold text-cyan-400">Aujourd'hui avant 19:00</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Transporteur</span>
                          <p className={`text-xs font-bold ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>Yalidine Express (N° YL-CAS-994821)</p>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )}


              {/* ──────────────── TAB 2: MES COMMANDES & SUIVI ──────────────── */}
              {activeTab === 'commandes' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  
                  {/* Filter & Search Bar */}
                  <div className={`p-4 rounded-3xl border shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 ${
                    themeMode === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/90'
                  }`}>
                    <div className="relative flex-1 w-full">
                      <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={orderSearchQuery}
                        onChange={(e) => setOrderSearchQuery(e.target.value)}
                        placeholder="Rechercher par N° de commande ou nom de produit..."
                        className={`w-full pl-11 pr-4 py-2.5 rounded-xl text-xs font-mono transition border ${
                          themeMode === 'dark'
                            ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-emerald-500'
                            : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500'
                        }`}
                      />
                    </div>

                    <div className="flex items-center gap-2 shrink-0 select-none">
                      <button
                        onClick={() => setOrderFilterStatus('all')}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
                          orderFilterStatus === 'all'
                            ? 'bg-emerald-500 text-slate-950 shadow-sm'
                            : themeMode === 'dark' ? 'bg-slate-950 text-slate-400 border border-slate-800' : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        Toutes ({orders.length})
                      </button>
                      <button
                        onClick={() => setOrderFilterStatus('in_transit')}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
                          orderFilterStatus === 'in_transit'
                            ? 'bg-cyan-500 text-slate-950 shadow-sm'
                            : themeMode === 'dark' ? 'bg-slate-950 text-slate-400 border border-slate-800' : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        En Transit
                      </button>
                      <button
                        onClick={() => setOrderFilterStatus('delivered')}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
                          orderFilterStatus === 'delivered'
                            ? 'bg-purple-500 text-slate-950 shadow-sm'
                            : themeMode === 'dark' ? 'bg-slate-950 text-slate-400 border border-slate-800' : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        Livrées
                      </button>
                    </div>
                  </div>

                  {/* Orders Deck */}
                  <div className="space-y-6">
                    {filteredOrders.map((order) => (
                      <div
                        key={order.order_id}
                        className={`p-6 sm:p-8 rounded-3xl border shadow-xl space-y-6 relative overflow-hidden transition ${
                          themeMode === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/90'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <h3 className={`text-xl font-black font-mono tracking-tight ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                                {order.order_id}
                              </h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                                order.status.toLowerCase().includes('deliver')
                                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                  : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400">
                              Commandé le {new Date(order.date || order.created_at || Date.now()).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              onClick={() => handleReorder(order)}
                              className="premium-green-cta px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-md cursor-pointer border-0 flex items-center gap-1.5"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>Re-commander</span>
                            </button>

                            <Link
                              href={`/suivi-commande?order=${order.order_id}`}
                              className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
                                themeMode === 'dark'
                                  ? 'bg-slate-950 border-slate-800 text-cyan-400 hover:bg-slate-850'
                                  : 'bg-slate-50 border-slate-200 text-cyan-700 hover:bg-slate-100'
                              }`}
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>Suivre la livraison</span>
                            </Link>

                            <a
                              href={`https://wa.me/212660808080?text=Bonjour,%20question%20sur%20ma%20commande%20N%C2%B0%20${order.order_id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center ${
                                themeMode === 'dark' ? 'bg-slate-950 border-slate-800 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                              }`}
                              title="Assistance WhatsApp"
                            >
                              <MessageCircle className="w-4 h-4 text-emerald-500" />
                            </a>
                          </div>
                        </div>

                        {/* Order Items Table/Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {order.items.map((item, i) => (
                            <div key={i} className={`p-4 rounded-2xl border flex items-center gap-4 ${
                              themeMode === 'dark' ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200/80'
                            }`}>
                              <div className="w-14 h-14 rounded-xl bg-white p-1 border border-slate-200 shrink-0">
                                <img src={resolveCustomerProductImage(item)} onError={applyCustomerImageFallback} alt={item.title} className="w-full h-full object-contain" />
                              </div>
                              <div className="min-w-0 flex-1 text-left">
                                <h4 className={`text-xs font-bold truncate ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                                  {item.title}
                                </h4>
                                <p className="text-xs font-mono font-bold text-emerald-500 mt-1">
                                  {item.quantity}x • {item.price} MAD
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Order Total & Carrier Specs */}
                        <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs ${
                          themeMode === 'dark' ? 'bg-slate-950/50 border-slate-800/80' : 'bg-slate-100/70 border-slate-200/80'
                        }`}>
                          <div className="flex items-center gap-4">
                            <span>Transporteur: <strong>{order.carrier || 'Yalidine Express'}</strong></span>
                            <span>Destination: <strong>{order.city}</strong></span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-slate-400">Total payé (COD):</span>
                            <span className={`text-base font-black font-mono ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                              {order.total} MAD
                            </span>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>

                </div>
              )}


              {/* ──────────────── TAB 3: DIAGNOSTIC IA & ROUTINE ──────────────── */}
              {activeTab === 'diagnostic' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  
                  {/* Clinical Score Master Card */}
                  <div className={`p-6 sm:p-10 rounded-3xl border shadow-xl relative overflow-hidden ${
                    themeMode === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/90'
                  }`}>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                      
                      <div className="lg:col-span-4 text-center space-y-4">
                        <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
                          <div className="absolute inset-0 rounded-full border-8 border-slate-800 border-t-emerald-500 border-r-teal-500 animate-spin-slow" style={{ animationDuration: '15s' }} />
                          <div className="text-center space-y-0.5">
                            <span className="text-4xl font-black font-heading text-emerald-500">
                              {MOCK_DIAGNOSTIC_RESULT.score}
                            </span>
                            <span className="text-xs font-mono font-bold text-slate-400 block">/ 100 SCORE</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono font-bold text-emerald-500 uppercase tracking-widest">
                            DIAGNOSTIC DU {MOCK_DIAGNOSTIC_RESULT.date}
                          </span>
                          <h3 className={`text-sm font-bold ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                            {language === 'AR' ? MOCK_DIAGNOSTIC_RESULT.skinTypeAr : MOCK_DIAGNOSTIC_RESULT.skinTypeFr}
                          </h3>
                        </div>
                      </div>

                      {/* Detailed Metric Gauges */}
                      <div className="lg:col-span-8 space-y-4">
                        <h4 className={`text-xs font-mono font-bold uppercase tracking-widest ${themeMode === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                          Bilan Dermatologique Détaillé
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {[
                            { label: 'Hydratation Cutanée', val: MOCK_DIAGNOSTIC_RESULT.metrics.hydration, color: 'bg-emerald-500' },
                            { label: 'Élasticité & Fermeté', val: MOCK_DIAGNOSTIC_RESULT.metrics.elasticity, color: 'bg-teal-500' },
                            { label: 'Régulation Sébum Zone T', val: MOCK_DIAGNOSTIC_RESULT.metrics.sebumControl, color: 'bg-amber-500' },
                            { label: 'Résistance Barrière Cutanée', val: MOCK_DIAGNOSTIC_RESULT.metrics.skinBarrier, color: 'bg-cyan-500' }
                          ].map((m, idx) => (
                            <div key={idx} className={`p-4 rounded-2xl border space-y-2 ${
                              themeMode === 'dark' ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200/80'
                            }`}>
                              <div className="flex items-center justify-between text-xs font-bold">
                                <span className={themeMode === 'dark' ? 'text-slate-200' : 'text-slate-800'}>{m.label}</span>
                                <span className="font-mono font-bold text-emerald-500">{m.val}%</span>
                              </div>
                              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                                <div className={`h-full ${m.color} rounded-full transition-all duration-1000`} style={{ width: `${m.val}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>


                  {/* Prescribed AM & PM Routine Products Deck */}
                  <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl space-y-6 ${
                    themeMode === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/90'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-emerald-500" />
                          <span className="text-xs font-mono font-bold text-emerald-500 uppercase tracking-widest">
                            ROUTINE DE SOINS PERSONNALISÉE
                          </span>
                        </div>
                        <h3 className={`text-xl font-black font-heading ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                          Routine recommandée selon vos préférences
                        </h3>
                      </div>

                      <button
                        onClick={handleAddFullRoutineToCart}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg cursor-pointer border-0 flex items-center justify-center gap-2"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>Ajouter toute la routine au panier</span>
                      </button>
                    </div>

                    <div className="space-y-6">
                      {/* AM Routine */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-mono font-bold text-amber-500 uppercase tracking-widest flex items-center gap-2">
                          <Sun className="w-4 h-4 text-amber-400" />
                          <span>RITUEL DU MATIN (AM)</span>
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {MOCK_DIAGNOSTIC_RESULT.routineAm.map((prod, idx) => (
                            <div key={idx} className={`p-4 rounded-2xl border space-y-3 flex flex-col justify-between ${
                              themeMode === 'dark' ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200/80'
                            }`}>
                              <div className="space-y-3">
                                <div className="w-full h-32 rounded-xl bg-white p-2 border border-slate-200 relative overflow-hidden">
                                  <img src={resolveCustomerProductImage(prod)} onError={applyCustomerImageFallback} alt={prod.title} className="w-full h-full object-contain" />
                                </div>
                                <div>
                                  <span className="text-[9px] font-mono font-bold text-emerald-500 uppercase">{prod.brand}</span>
                                  <h5 className={`text-xs font-bold line-clamp-2 ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                                    {prod.title}
                                  </h5>
                                </div>
                              </div>
                              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                                <span className={`text-xs font-bold ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>{prod.price} MAD</span>
                                <button
                                  onClick={() => {
                                    addToCart({ id: Math.floor(Math.random() * 100000), title: prod.title, name: prod.title, price: prod.price, image: prod.image, category: 'Visage', description: prod.title } as Product, 1);
                                    showToast(`${prod.title} ajouté au panier !`);
                                  }}
                                  className="px-3 py-1.5 bg-emerald-500 text-slate-950 rounded-lg text-[10px] font-black uppercase cursor-pointer border-0"
                                >
                                  + Ajouter
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* PM Routine */}
                      <div className="space-y-3 pt-4 border-t border-slate-800/80">
                        <h4 className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                          <Moon className="w-4 h-4 text-indigo-400" />
                          <span>RITUEL DU SOIR (PM)</span>
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {MOCK_DIAGNOSTIC_RESULT.routinePm.map((prod, idx) => (
                            <div key={idx} className={`p-4 rounded-2xl border space-y-3 flex flex-col justify-between ${
                              themeMode === 'dark' ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200/80'
                            }`}>
                              <div className="space-y-3">
                                <div className="w-full h-32 rounded-xl bg-white p-2 border border-slate-200 relative overflow-hidden">
                                  <img src={resolveCustomerProductImage(prod)} onError={applyCustomerImageFallback} alt={prod.title} className="w-full h-full object-contain" />
                                </div>
                                <div>
                                  <span className="text-[9px] font-mono font-bold text-cyan-400 uppercase">{prod.brand}</span>
                                  <h5 className={`text-xs font-bold line-clamp-2 ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                                    {prod.title}
                                  </h5>
                                </div>
                              </div>
                              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                                <span className={`text-xs font-bold ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>{prod.price} MAD</span>
                                <button
                                  onClick={() => {
                                    addToCart({ id: Math.floor(Math.random() * 100000), title: prod.title, name: prod.title, price: prod.price, image: prod.image, category: 'Visage', description: prod.title } as Product, 1);
                                    showToast(`${prod.title} ajouté au panier !`);
                                  }}
                                  className="px-3 py-1.5 bg-emerald-500 text-slate-950 rounded-lg text-[10px] font-black uppercase cursor-pointer border-0"
                                >
                                  + Ajouter
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>

                </div>
              )}


              {/* ──────────────── TAB 4: CAGNOTTE VIP & COUPONS ──────────────── */}
              {activeTab === 'cagnotte' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  
                  {/* VIP Tier Progress Card */}
                  <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl relative overflow-hidden ${
                    themeMode === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/90'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
                      <div className="space-y-1">
                        <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
                          PROGRESSION DU STATUT VIP
                        </span>
                        <h3 className={`text-2xl font-black font-heading ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                          Statut Actuel: <span className="text-amber-400">{tier} VIP</span>
                        </h3>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-xs font-mono font-bold text-slate-400 block">MULTIPLICATEUR DE POINTS</span>
                        <span className="text-xl font-black font-mono text-emerald-400">{tierMultiplier}x Points</span>
                      </div>
                    </div>

                    <div className="pt-6 space-y-4">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-400">Progression vers le statut Gold:</span>
                        <span className="text-amber-400 font-mono font-bold">{points} / 500 PTS</span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden p-0.5 border border-slate-700">
                        <div className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 rounded-full transition-all duration-700" style={{ width: `${Math.min(100, (points / 500) * 100)}%` }} />
                      </div>
                      <p className="text-xs text-slate-400">
                        Encore <strong>{pointsToNextTier || 150} points</strong> pour débloquer la livraison gratuite permanente et −15% sur tous vos rituels.
                      </p>
                    </div>
                  </div>

                  {/* Active Coupons Hub */}
                  <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl space-y-6 ${
                    themeMode === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/90'
                  }`}>
                    <div className="space-y-1 border-b border-slate-800/80 pb-4">
                      <div className="flex items-center gap-2">
                        <Ticket className="w-4 h-4 text-purple-400" />
                        <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest">
                          BONS DE RÉDUCTION & CODES EXCLUSIFS
                        </span>
                      </div>
                      <h3 className={`text-xl font-black font-heading ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                        Bons Privilège Prêts à être Utilisés
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {AVAILABLE_COUPONS.map((coupon, idx) => (
                        <div key={idx} className={`p-5 rounded-2xl border space-y-4 flex flex-col justify-between relative overflow-hidden ${
                          themeMode === 'dark' ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200/80'
                        }`}>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                {coupon.code}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">{coupon.minSpend}</span>
                            </div>
                            <h4 className={`text-sm font-bold ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                              {language === 'AR' ? coupon.discountAr : coupon.discountFr}
                            </h4>
                            <p className="text-[11px] text-slate-400">{coupon.expires}</p>
                          </div>

                          <button
                            onClick={() => copyCouponToClipboard(coupon.code)}
                            className="w-full py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-md cursor-pointer border-0 flex items-center justify-center gap-1.5"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>{copiedCode === coupon.code ? 'Code Copié !' : 'Copier le code'}</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}


              {/* ──────────────── TAB 5: MES FAVORIS ──────────────── */}
              {activeTab === 'favoris' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className={`p-6 rounded-3xl border shadow-xl flex items-center justify-between gap-4 ${
                    themeMode === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/90'
                  }`}>
                    <div>
                      <h3 className={`text-xl font-black font-heading uppercase tracking-wide flex items-center gap-2 ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                        <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                        <span>{language === 'FR' ? 'Mes Produits Coups de Cœur' : 'منتجاتي المفضلة'}</span>
                      </h3>
                      <p className={`text-xs font-medium mt-1 ${themeMode === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                        {wishlist.length} soins sauvegardés dans votre espace personnel.
                      </p>
                    </div>
                  </div>

                  {wishlist.length === 0 ? (
                    <div className={`text-center py-16 border rounded-3xl space-y-4 shadow-sm relative overflow-hidden transition-colors ${
                      themeMode === 'dark' ? 'bg-slate-900/60 border-slate-800/80' : 'bg-white border-slate-200/80'
                    }`}>
                      <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400">
                        <Heart className="w-6 h-6 animate-pulse" />
                      </div>
                      <div className="space-y-1">
                        <h4 className={`text-sm font-black font-heading uppercase tracking-wide ${themeMode === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                          {language === 'FR' ? 'Votre Liste d\'Envies est vide' : 'قائمتكِ المفضلة فارغة حالياً'}
                        </h4>
                        <p className={`text-xs max-w-xs mx-auto leading-relaxed font-semibold ${themeMode === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                          {language === 'FR'
                            ? 'Parcourez notre catalogue et cliquez sur l\'icône de cœur sur n\'importe quel produit pour le sauvegarder ici.'
                            : 'تصفحي منتجاتنا واضغطي على رمز القلب في أي منتج لحفظه هنا.'}
                        </p>
                      </div>
                      <Link
                        href="/products"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl transition shadow-md cursor-pointer border-0"
                      >
                        <span>{language === 'FR' ? 'Découvrir nos soins' : 'استكشاف المنتجات'}</span>
                        <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {wishlist.map((product) => (
                        <div key={product.id} className={`border rounded-2xl p-4 flex flex-col justify-between space-y-4 relative group transition shadow-md ${
                          themeMode === 'dark' ? 'bg-slate-900 border-slate-800 hover:border-slate-700 text-white' : 'bg-white border-slate-200/90 hover:border-slate-300 text-slate-900'
                        }`}>
                          <button
                            onClick={() => removeFromWishlist(product.id)}
                            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-950/80 text-slate-400 hover:text-rose-400 border border-slate-800 flex items-center justify-center transition z-10 cursor-pointer"
                            title={language === 'FR' ? 'Retirer' : 'حذف'}
                          >
                            <Trash2 className="w-4 h-4 text-slate-400 hover:text-rose-400" />
                          </button>

                          <div className="space-y-3">
                            <div className="relative w-full h-44 rounded-xl overflow-hidden bg-white p-2 border border-slate-200">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                            <div className="text-left" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                              <span className="text-[9px] font-mono text-emerald-500 uppercase tracking-widest block font-bold">
                                {product.category}
                              </span>
                              <h4 className={`text-xs font-bold leading-snug line-clamp-2 mt-0.5 ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                                {product.name}
                              </h4>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                            <span className={`text-sm font-black ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                              {product.price} MAD
                            </span>
                            <button
                              onClick={() => {
                                addToCart(product, 1);
                                showToast(`${product.name} ajouté au panier !`);
                              }}
                              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-black uppercase tracking-wider rounded-xl transition flex items-center gap-1.5 cursor-pointer border-0 shadow-sm"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>{language === 'FR' ? 'Ajouter' : 'إضافة'}</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ──────────────── TAB 6: PROFIL & ADRESSES ──────────────── */}
              {activeTab === 'profil' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  
                  {/* Personal Information Form */}
                  <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl space-y-6 ${
                    themeMode === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/90'
                  }`}>
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                      <div className="space-y-1">
                        <span className="text-xs font-mono font-bold text-emerald-500 uppercase tracking-widest">
                          INFORMATIONS PERSONNELLES
                        </span>
                        <h3 className={`text-xl font-black font-heading ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                          Gérer mon Profil Officinal
                        </h3>
                      </div>
                    </div>

                    <form onSubmit={handleSaveProfile} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                            Nom Complet
                          </label>
                          <input
                            type="text"
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value)}
                            required
                            className={`w-full px-4 py-3 rounded-xl text-xs font-sans border transition ${
                              themeMode === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                            }`}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                            Téléphone
                          </label>
                          <input
                            type="tel"
                            value={profilePhone}
                            onChange={(e) => setProfilePhone(e.target.value)}
                            required
                            className={`w-full px-4 py-3 rounded-xl text-xs font-sans border transition ${
                              themeMode === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                            }`}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                          Adresse Email
                        </label>
                        <input
                          type="email"
                          value={profileEmail}
                          onChange={(e) => setProfileEmail(e.target.value)}
                          required
                          className={`w-full px-4 py-3 rounded-xl text-xs font-sans border transition ${
                            themeMode === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isProfileSaving}
                        className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-md cursor-pointer border-0 flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        <span>{isProfileSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}</span>
                      </button>
                    </form>
                  </div>

                  {/* Password & Account Security */}
                  <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl space-y-6 ${
                    themeMode === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/90'
                  }`}>
                    <div className="flex items-start gap-4 border-b border-slate-800/80 pb-5">
                      <div className="w-11 h-11 shrink-0 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
                        <KeyRound className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs font-mono font-bold text-indigo-500 uppercase tracking-widest">
                          SÉCURITÉ DU COMPTE
                        </span>
                        <h3 className={`text-xl font-black font-heading ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                          Mettre à jour mon mot de passe
                        </h3>
                        <p className="text-xs leading-relaxed text-slate-400">Choisissez un mot de passe d'au moins 8 caractères, unique à votre compte.</p>
                      </div>
                    </div>

                    <form onSubmit={handleChangePassword} className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_auto] gap-4 items-end">
                      <div className="space-y-1.5">
                        <label htmlFor="new-password" className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">Nouveau mot de passe</label>
                        <input
                          id="new-password"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          minLength={8}
                          autoComplete="new-password"
                          required
                          className={`w-full px-4 py-3 rounded-xl text-sm border transition focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${
                            themeMode === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="confirm-password" className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">Confirmer le mot de passe</label>
                        <input
                          id="confirm-password"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          minLength={8}
                          autoComplete="new-password"
                          required
                          className={`w-full px-4 py-3 rounded-xl text-sm border transition focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${
                            themeMode === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isPasswordSaving}
                        className="min-h-[46px] px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-black text-xs uppercase tracking-wider transition shadow-[0_8px_18px_rgba(79,70,229,0.2)] cursor-pointer border-0 whitespace-nowrap"
                      >
                        {isPasswordSaving ? 'Mise à jour...' : 'Modifier le mot de passe'}
                      </button>
                    </form>

                    {passwordFeedback && (
                      <p className={`rounded-xl px-4 py-3 text-xs font-semibold border ${
                        passwordFeedback.type === 'success'
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
                          : 'bg-rose-500/10 border-rose-500/20 text-rose-600'
                      }`} role="status">
                        {passwordFeedback.message}
                      </p>
                    )}
                  </div>

                  {/* Saved Delivery Addresses Deck */}
                  <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl space-y-6 ${
                    themeMode === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/90'
                  }`}>
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                      <div className="space-y-1">
                        <span className="text-xs font-mono font-bold text-cyan-500 uppercase tracking-widest">
                          CARNET D'ADRESSES DE LIVRAISON
                        </span>
                        <h3 className={`text-xl font-black font-heading ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                          Adresses Enregistrées
                        </h3>
                      </div>

                      <button
                        onClick={() => setShowAddAddressModal(true)}
                        className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer border-0 shadow-sm"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Nouvelle Adresse</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {savedAddresses.map((addr) => (
                        <div key={addr.id} className={`p-5 rounded-2xl border space-y-3 relative ${
                          themeMode === 'dark' ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200/80'
                        }`}>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-emerald-500">{addr.label}</span>
                            {addr.isDefault && (
                              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                DÉFAULT
                              </span>
                            )}
                          </div>
                          <p className={`text-xs font-bold ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                            {addr.fullName} ({addr.phone})
                          </p>
                          <p className="text-xs text-slate-400">
                            {addr.address}, {addr.city}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

            </>
          )}

        </div>
      </div>

      {/* Add New Address Modal */}
      {showAddAddressModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`w-full max-w-md p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-6 ${
            themeMode === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between border-b pb-4 border-slate-800">
              <h3 className="text-base font-bold font-heading">Ajouter une Adresse de Livraison</h3>
              <button onClick={() => setShowAddAddressModal(false)} className="p-1 hover:text-rose-400 cursor-pointer bg-transparent border-0">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAddress} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Nom de l'adresse (ex: Domicile, Bureau)</label>
                <input
                  type="text"
                  required
                  value={newAddrLabel}
                  onChange={(e) => setNewAddrLabel(e.target.value)}
                  placeholder="ex: Maison Casablanca"
                  className={`w-full px-4 py-3 rounded-xl text-xs font-sans border ${
                    themeMode === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Ville</label>
                <select
                  value={newAddrCity}
                  onChange={(e) => setNewAddrCity(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl text-xs font-sans border ${
                    themeMode === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  {['Casablanca', 'Rabat', 'Marrakech', 'Tanger', 'Fès', 'Agadir', 'Oujda', 'Tétouan', 'Meknès', 'Autre ville'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Adresse Complète</label>
                <textarea
                  required
                  rows={3}
                  value={newAddrStreet}
                  onChange={(e) => setNewAddrStreet(e.target.value)}
                  placeholder="Rue, N° d'appartement, quartier..."
                  className={`w-full px-4 py-3 rounded-xl text-xs font-sans border ${
                    themeMode === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-md cursor-pointer border-0"
              >
                Enregistrer l'adresse
              </button>
            </form>
          </div>
        </div>
      )}

    </ShopShell>
  );
}

function LayoutGridIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}
