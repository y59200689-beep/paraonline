'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { 
  Search, PackageCheck, Sparkles, Truck, MapPin, ShieldCheck, 
  Copy, Check, PhoneCall, RefreshCw, FileText, 
  Clock, AlertCircle, ArrowLeft, ChevronRight, MessageCircle,
  QrCode, SlidersHorizontal, Printer, User,
  Calendar, CheckCircle2, X, Navigation, Shield, Activity, Compass, Box
} from 'lucide-react';
import { ShopShell } from '@/components/ShopShell';
import { PRODUCTS_DB } from '@/lib/data';

interface OrderItem {
  id?: number;
  title: string;
  quantity: number;
  price: number;
  image?: string;
  sku?: string;
}

function resolveProductImage(item: OrderItem): string {
  if (item.image && typeof item.image === 'string' && item.image.trim().length > 0) {
    return item.image;
  }

  const idNum = item.id ? Number(item.id) : null;
  if (idNum) {
    const found = PRODUCTS_DB.find((p) => p.id === idNum);
    if (found && found.image) return found.image;
  }

  if (item.sku) {
    const found = PRODUCTS_DB.find((p) => p.sku === item.sku);
    if (found && found.image) return found.image;
  }

  if (item.title) {
    const titleLower = item.title.toLowerCase();
    const found = PRODUCTS_DB.find(
      (p) => p.title.toLowerCase().includes(titleLower) || titleLower.includes(p.title.toLowerCase())
    );
    if (found && found.image) return found.image;
  }

  const t = (item.title || '').toLowerCase();
  if (t.includes('nuk') || t.includes('sucette') || t.includes('biberon') || t.includes('bebe') || t.includes('bébé')) {
    return '/images/categories/bebe_transparent_v3.png';
  }
  if (t.includes('solaire') || t.includes('spf') || t.includes('sun') || t.includes('anthelios')) {
    return '/images/anthelios_hero_packshot.png';
  }
  if (t.includes('cicaplast') || t.includes('réparatrice') || t.includes('creme') || t.includes('crème')) {
    return '/images/cicaplast_hero_packshot.png';
  }
  if (t.includes('effaclar') || t.includes('nettoyant') || t.includes('gel')) {
    return '/images/effaclar_hero_packshot.png';
  }
  if (t.includes('serum') || t.includes('sérum') || t.includes('dropper')) {
    return '/images/hero_serum_dropper.png';
  }
  if (t.includes('shampoo') || t.includes('cheveux') || t.includes('dercos')) {
    return '/images/dercos_shampoo_bundle.png';
  }
  if (t.includes('vichy')) {
    return '/images/vichy_sunscreen_bundle.png';
  }

  return '/images/categories/visage.png';
}

interface AuditLog {
  time: string;
  date: string;
  location: string;
  titleFr: string;
  titleAr: string;
  descFr: string;
  descAr: string;
  status: 'completed' | 'current' | 'pending';
}

interface DriverInfo {
  name: string;
  phone: string;
  vehicle: string;
  vehiclePlate: string;
  rating?: number;
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
  discount_amount?: number;
  applied_coupon?: string | null;
  gift_item?: string | null;
  total: number;
  status: string;
  date?: string;
  created_at?: string;
  carrier?: string;
  tracking_number?: string;
  estimated_delivery?: string;
  package_weight?: string;
  driver?: DriverInfo;
  logs?: AuditLog[];
}

export default function SuiviCommandeClient() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('order') || searchParams.get('id') || '';

  const [query, setQuery] = useState(initialQuery);
  const [searchTab, setSearchTab] = useState<'all' | 'order' | 'phone'>('all');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [language, setLanguage] = useState<'FR' | 'AR'>('FR');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [showQrModal, setShowQrModal] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [showWaybillModal, setShowWaybillModal] = useState(false);

  // Delivery preference inputs
  const [prefTime, setPrefTime] = useState('Matinée (09:00 - 13:00)');
  const [prefInstructions, setPrefInstructions] = useState('');
  const [prefSubmitted, setPrefSubmitted] = useState(false);

  const isRTL = language === 'AR';

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    } else {
      setOrder(null);
    }
  }, [initialQuery]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSearch = async (searchTarget?: string) => {
    const searchTerm = (searchTarget !== undefined ? searchTarget : query).trim();
    if (!searchTerm) {
      setError(language === 'AR' ? 'الرجاء إدخال رقم الطلب أو رقم الهاتف.' : 'Veuillez saisir votre numéro de commande ou téléphone.');
      return;
    }

    setLoading(true);
    setError(null);

    // Fetch real order from backend API endpoint (Supabase Database)
    try {
      const res = await fetch(`/api/orders?search=${encodeURIComponent(searchTerm)}`);
      const data = await res.json();

      if (data.success && data.orders && data.orders.length > 0) {
        const liveOrder = data.orders[0];
        
        // Generate real audit logs based on the order's real status
        if (!liveOrder.logs || liveOrder.logs.length === 0) {
          const orderDateStr = new Date(liveOrder.created_at || liveOrder.date || Date.now()).toLocaleDateString(
            language === 'AR' ? 'ar-MA' : 'fr-FR',
            { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
          );

          liveOrder.logs = [
            {
              time: 'Statut Actuel',
              date: orderDateStr,
              location: `Destination: ${liveOrder.city || 'Maroc'}`,
              titleFr: `Statut de la commande: ${liveOrder.status || 'En cours'}`,
              titleAr: `حالة الطلب: ${liveOrder.status || 'قيد المعالجة'}`,
              descFr: `Dossier N° ${liveOrder.order_id} enregistré dans notre système logistique.`,
              descAr: `الملف رقم ${liveOrder.order_id} مسجل في نظامنا اللوجستي.`,
              status: 'current'
            }
          ];
        }

        setOrder(liveOrder);
      } else {
        setOrder(null);
        setError(
          language === 'AR'
            ? `لم نتمكن من العثور على أي طلب يطابق "${searchTerm}". تحقق من الرقم وحاول مجدداً.`
            : `Aucune commande trouvée pour "${searchTerm}". Vérifiez votre numéro de commande ou numéro de téléphone.`
        );
      }
    } catch (err) {
      console.error('Order tracking lookup error:', err);
      setError(
        language === 'AR'
          ? 'حدث خطأ أثناء الاتصال بالخادم. يرجى المحاولة لاحقاً.'
          : 'Erreur lors de la recherche de commande. Veuillez réessayer.'
      );
    } finally {
      setLoading(false);
    }
  };

  const copyTrackingLink = () => {
    if (!order) return;
    const url = `${window.location.origin}/suivi-commande?order=${order.order_id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    triggerToast(language === 'AR' ? 'تم نسخ رابط التتبع!' : 'Lien de suivi copié !');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setPrefSubmitted(true);
    triggerToast(language === 'AR' ? 'تم تحديث تفضيلات التسليم!' : 'Toutes vos instructions ont été enregistrées pour la livraison.');
    setTimeout(() => {
      setShowPreferencesModal(false);
      setPrefSubmitted(false);
    }, 1200);
  };

  // Status Step Index Mapper
  const getStatusIndex = (statusStr: string) => {
    const s = statusStr?.toLowerCase() || '';
    if (s.includes('delivered') || s.includes('livré') || s.includes('complete')) return 4;
    if (s.includes('transit') || s.includes('cours de livraison')) return 3;
    if (s.includes('shipped') || s.includes('expédié') || s.includes('pris en charge')) return 2;
    if (s.includes('processing') || s.includes('préparation') || s.includes('confirmed')) return 1;
    return 0; // Pending / Placed
  };

  const currentStep = order ? getStatusIndex(order.status) : 0;

  const STEPS = [
    {
      id: 0,
      titleFr: 'Commande Enregistrée',
      titleAr: 'تم تسجيل الطلب',
      descFr: 'Paiement COD enregistré & Référence générée',
      descAr: 'تم تسجيل الطلب وحجز المنتجات',
      icon: PackageCheck,
    },
    {
      id: 1,
      titleFr: 'Préparation & Inspection',
      titleAr: 'التحضير والفحص',
      descFr: 'Contrôle qualité dermo & Emballage scellé',
      descAr: 'فحص جودة المنتجات والتغليف',
      icon: Sparkles,
    },
    {
      id: 2,
      titleFr: 'Expédition Express',
      titleAr: 'الشحن السريع',
      descFr: 'Remis au transporteur officiel',
      descAr: 'تم تسليم الشحنة لشركة الشحن',
      icon: Truck,
    },
    {
      id: 3,
      titleFr: 'En Transit Local',
      titleAr: 'الشحنة في الطريق',
      descFr: 'Livraison en cours vers votre ville',
      descAr: 'الشحنة مع الموزع في مدينتكِ',
      icon: MapPin,
    },
    {
      id: 4,
      titleFr: 'Livré & Confirmé',
      titleAr: 'تم التسليم بنجاح',
      descFr: 'Colis remis & Paiement encaissé',
      descAr: 'تم استلام الشحنة والمبلغ',
      icon: ShieldCheck,
    },
  ];

  return (
    <ShopShell>
      <div className={`min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950 ${isRTL ? 'rtl' : 'ltr'}`}>
        
        {/* Toast Notification Floating Banner */}
        {toastMessage && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-slate-950 px-6 py-3 rounded-full font-bold text-xs shadow-2xl shadow-emerald-500/40 flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Top Service Bar */}
        <div className="bg-slate-900/90 border-b border-slate-800 text-[11px] font-mono py-2 px-4 overflow-hidden relative z-20 backdrop-blur-md">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 text-slate-400">
            <div className="flex items-center gap-6 overflow-x-auto no-scrollbar whitespace-nowrap">
              <span className="flex items-center gap-2 text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                {isRTL ? 'نظام تتبع الشحنات المباشر' : 'SUIVI OFFICIEL DES EXPÉDITIONS'}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 text-slate-400">
                <Truck className="w-3 h-3 text-cyan-400" />
                {isRTL ? 'توصيل سريع لكافة المدن المغربية' : 'LIVRAISON EXPRESS PARTOUT AU MAROC'}
              </span>
              <span className="hidden md:inline-flex items-center gap-1.5 text-slate-400">
                <Shield className="w-3 h-3 text-amber-400" />
                {isRTL ? 'الدفع عند الاستلام مع الفحص' : 'PAIEMENT À LA LIVRAISON (COD) SÉCURISÉ'}
              </span>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-full p-0.5">
                <button
                  onClick={() => setLanguage('FR')}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                    language === 'FR' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  FR
                </button>
                <button
                  onClick={() => setLanguage('AR')}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                    language === 'AR' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  العربية
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Hero & Search Area */}
        <div className="relative overflow-hidden border-b border-slate-800/80 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 pt-10 pb-16">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-emerald-500/10 blur-[150px] pointer-events-none rounded-full" />
          <div className="absolute top-20 right-10 w-96 h-96 bg-cyan-500/10 blur-[140px] pointer-events-none rounded-full" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Header Navigation & Back button */}
            <div className="flex items-center justify-between gap-4 mb-8">
              <Link
                href="/"
                className="group inline-flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-emerald-400 transition-all bg-slate-900/60 hover:bg-slate-900 border border-slate-800 px-4 py-2 rounded-full backdrop-blur-md"
              >
                <ArrowLeft className={`w-4 h-4 transition-transform group-hover:-translate-x-1 ${isRTL ? 'rotate-180 group-hover:translate-x-1' : ''}`} />
                <span>{isRTL ? 'العودة للمتجر' : 'Retour à la boutique'}</span>
              </Link>

              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400/90 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full backdrop-blur-md">
                <Activity className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
                <span>{isRTL ? 'تتبع مباشر متصل بالخادم' : 'SUIVI EN TEMPS RÉEL'}</span>
              </div>
            </div>

            {/* Title & Headline */}
            <div className="text-center max-w-4xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-emerald-400 text-xs font-bold uppercase tracking-widest shadow-xl backdrop-blur-md">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{isRTL ? 'تتبع الطلبات والشحنات الرسمي' : 'Suivi de Commande Officiel'}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white font-heading leading-none">
                {isRTL ? 'تتبّعي مسار طلبِك في الوقت الفعلي' : 'Suivi de Commande en Temps Réel'}
              </h1>
              <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
                {isRTL
                  ? 'أدخلي رقم الطلب أو رقم الهاتف المسجل لمتابعة حالة الشحنة وموعد الوصول إلى باب منزلِك.'
                  : 'Saisissez votre numéro de commande (ex: PO-102948) ou votre numéro de téléphone pour consulter l\'état réel de votre livraison.'}
              </p>
            </div>

            {/* Double-Bezel Search Component */}
            <div className="mt-10 max-w-3xl mx-auto">
              <div className="bg-slate-900/80 p-2 sm:p-3 rounded-[2.5rem] border border-slate-800/90 shadow-2xl shadow-slate-950/90 backdrop-blur-2xl">
                
                {/* Search Type Filter Tabs */}
                <div className="flex items-center gap-2 mb-3 px-2 pt-1 border-b border-slate-800/60 pb-3 text-xs">
                  <span className="text-slate-500 font-medium mr-1 text-[11px]">
                    {isRTL ? 'البحث بواسطة:' : 'Rechercher par:'}
                  </span>
                  <button
                    onClick={() => setSearchTab('all')}
                    className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                      searchTab === 'all'
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {isRTL ? 'الكل' : 'Tout'}
                  </button>
                  <button
                    onClick={() => setSearchTab('order')}
                    className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                      searchTab === 'order'
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {isRTL ? 'رقم الطلب (PO-)' : 'N° Commande (PO-)'}
                  </button>
                  <button
                    onClick={() => setSearchTab('phone')}
                    className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                      searchTab === 'phone'
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {isRTL ? 'رقم الهاتف' : 'N° Téléphone'}
                  </button>
                </div>

                {/* Inner Search Input */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSearch();
                  }}
                  className="relative flex items-center bg-slate-950 border border-slate-800/80 focus-within:border-emerald-500/90 rounded-[calc(2.5rem-0.75rem)] p-2 shadow-inner transition-all group"
                >
                  <div className="pl-4 pr-2 text-slate-400 group-focus-within:text-emerald-400 transition-colors">
                    <Search className="w-6 h-6" />
                  </div>

                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={
                      searchTab === 'order'
                        ? (isRTL ? 'أدخلي رقم الطلب مثل: PO-102948' : 'Exemple: PO-102948')
                        : searchTab === 'phone'
                        ? (isRTL ? 'أدخلي رقم الهاتف مثل: 0661234567' : 'Exemple: 0661234567')
                        : (isRTL ? 'أدخلي رقم الطلب أو رقم الهاتف...' : 'N° de commande ou téléphone...')
                    }
                    className="w-full bg-transparent text-white placeholder-slate-500 text-sm sm:text-base font-mono py-3.5 px-2 focus:outline-none"
                  />

                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery('')}
                      className="p-2 text-slate-500 hover:text-white transition-colors mr-2"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="group bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-black text-xs sm:text-sm tracking-wide uppercase px-6 py-3.5 rounded-2xl transition-all duration-300 shadow-lg shadow-emerald-500/25 shrink-0 flex items-center gap-3 active:scale-98"
                  >
                    {loading ? (
                      <RefreshCw className="w-5 h-5 animate-spin text-slate-950" />
                    ) : (
                      <>
                        <span>{isRTL ? 'بحث' : 'Rechercher'}</span>
                        <div className="w-7 h-7 rounded-full bg-slate-950/15 flex items-center justify-center transition-transform group-hover:translate-x-1">
                          <ChevronRight className={`w-4 h-4 text-slate-950 ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                        </div>
                      </>
                    )}
                  </button>
                </form>

              </div>
            </div>

          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          {/* 1. ERROR STATE */}
          {error && (
            <div className="max-w-2xl mx-auto bg-rose-500/10 border border-rose-500/30 text-rose-300 p-6 rounded-3xl flex items-start gap-4 text-sm shadow-xl backdrop-blur-xl animate-in fade-in">
              <AlertCircle className="w-6 h-6 shrink-0 text-rose-400 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-bold text-rose-200">{isRTL ? 'تعذر العثور على الطلب' : 'Commande non trouvée'}</h4>
                <p className="text-xs text-rose-300/90 leading-relaxed">{error}</p>
                <div className="pt-2 text-xs">
                  <span className="text-slate-400">{isRTL ? 'هل تحتاجين مساعدة؟' : 'Besoin d\'assistance ?'} </span>
                  <a
                    href="https://wa.me/212660808080"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 font-bold underline hover:text-emerald-300"
                  >
                    {isRTL ? 'تحدثي معنا عبر واتساب 24/7' : 'Contactez le support WhatsApp 24/7'}
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* 2. INITIAL EMPTY STATE (No order searched yet) */}
          {!order && !error && !loading && (
            <div className="max-w-3xl mx-auto bg-slate-900/60 border border-slate-800/80 rounded-[2.5rem] p-8 sm:p-12 text-center space-y-6 shadow-2xl backdrop-blur-xl">
              <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                <PackageCheck className="w-10 h-10" />
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  {isRTL ? 'أدخلي رقم طلبِك لمتابعة الحالة' : 'Entrez votre référence de commande'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {isRTL
                    ? 'يرجى إدخال رقم الطلب (مثال: PO-102948) أو رقم الهاتف المستخدم أثناء الشراء لعرض تفاصيل ومسار الشحنة.'
                    : 'Consultez la progression réelle de votre livraison en saisissant votre référence de commande ou numéro de téléphone dans la barre ci-dessus.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                  <Truck className="w-5 h-5 text-emerald-400 mx-auto" />
                  <span className="font-bold text-slate-200 block">{isRTL ? 'توصيل express' : 'Livraison Express'}</span>
                  <span className="text-[11px] text-slate-500">{isRTL ? 'كافة المدن المغربية' : 'Sur tout le Maroc'}</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                  <ShieldCheck className="w-5 h-5 text-cyan-400 mx-auto" />
                  <span className="font-bold text-slate-200 block">{isRTL ? 'دفع عند الاستلام' : 'Paiement à la livraison'}</span>
                  <span className="text-[11px] text-slate-500">{isRTL ? 'نقداً أو بالبطاقة' : 'Espèces ou TPE'}</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                  <MessageCircle className="w-5 h-5 text-purple-400 mx-auto" />
                  <span className="font-bold text-slate-200 block">{isRTL ? 'دعم 24/7' : 'Support 24/7'}</span>
                  <span className="text-[11px] text-slate-500">{isRTL ? 'مساعدة عبر واتساب' : 'Via WhatsApp'}</span>
                </div>
              </div>
            </div>
          )}

          {/* 3. REAL ORDER DETAILS DISPLAY */}
          {order && (
            <div className="space-y-10 animate-in fade-in duration-500">
              
              {/* SECTION 1: MASTER ORDER SUMMARY CARD */}
              <div className="bg-slate-900/90 p-2 sm:p-2.5 rounded-[2.5rem] border border-slate-800/90 shadow-2xl backdrop-blur-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 blur-[120px] pointer-events-none rounded-full" />
                
                <div className="bg-slate-950/90 p-6 sm:p-8 rounded-[calc(2.5rem-0.625rem)] border border-slate-800/80 space-y-6">
                  
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
                          REF COMMANDE
                        </span>
                        <h2 className="text-2xl sm:text-4xl font-black font-mono text-white tracking-tight">
                          {order.order_id}
                        </h2>
                        
                        <span
                          className={`px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md ${
                            currentStep === 4
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-emerald-500/10'
                              : currentStep >= 2
                              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-cyan-500/10'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-amber-500/10'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${
                            currentStep === 4 ? 'bg-emerald-400 animate-pulse' : currentStep >= 2 ? 'bg-cyan-400 animate-pulse' : 'bg-amber-400 animate-pulse'
                          }`} />
                          {order.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 flex items-center gap-2 font-mono">
                        <Clock className="w-4 h-4 text-emerald-400" />
                        <span>
                          {isRTL ? 'تاريخ التسجيل:' : 'Date d\'enregistrement:'}{' '}
                          {new Date(order.date || order.created_at || Date.now()).toLocaleDateString(
                            language === 'AR' ? 'ar-MA' : 'fr-FR',
                            { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
                          )}
                        </span>
                      </p>
                    </div>

                    {/* Actions Bar */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        onClick={copyTrackingLink}
                        className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold flex items-center gap-2 border border-slate-800 transition-colors shadow-md"
                      >
                        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                        <span>{copied ? (isRTL ? 'تم النسخ!' : 'Lien copié !') : (isRTL ? 'مشاركة' : 'Partager')}</span>
                      </button>

                      <button
                        onClick={() => setShowQrModal(true)}
                        className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold flex items-center gap-2 border border-slate-800 transition-colors shadow-md"
                      >
                        <QrCode className="w-4 h-4 text-cyan-400" />
                        <span>{isRTL ? 'رمز QR' : 'Code QR'}</span>
                      </button>

                      <button
                        onClick={() => setShowWaybillModal(true)}
                        className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold flex items-center gap-2 border border-slate-800 transition-colors shadow-md"
                      >
                        <Printer className="w-4 h-4 text-purple-400" />
                        <span>{isRTL ? 'طباعة' : 'Imprimer'}</span>
                      </button>

                      <a
                        href={`https://wa.me/212660808080?text=${encodeURIComponent(
                          `Bonjour, je souhaite des informations sur ma commande N° ${order.order_id}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-2 transition-colors shadow-md"
                      >
                        <MessageCircle className="w-4 h-4 text-emerald-400" />
                        <span>{isRTL ? 'دعم واتساب' : 'Support WhatsApp'}</span>
                      </a>
                    </div>
                  </div>

                  {/* Order Specs Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80 space-y-1">
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">
                        {isRTL ? 'شركة الشحن' : 'Transporteur'}
                      </span>
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm font-bold text-slate-100">{order.carrier || 'Livraison Express'}</span>
                      </div>
                    </div>

                    <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80 space-y-1">
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">
                        {isRTL ? 'رقم التتبع' : 'N° de suivi'}
                      </span>
                      <div className="flex items-center gap-2">
                        <Box className="w-4 h-4 text-cyan-400" />
                        <span className="text-sm font-mono font-bold text-emerald-400">{order.tracking_number || order.order_id}</span>
                      </div>
                    </div>

                    <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80 space-y-1">
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">
                        {isRTL ? 'الوجهة' : 'Destination'}
                      </span>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-amber-400" />
                        <span className="text-sm font-bold text-slate-100">{order.city || 'Maroc'}, Maroc</span>
                      </div>
                    </div>

                    <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80 space-y-1">
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">
                        {isRTL ? 'موعد التسليم' : 'Livraison estimée'}
                      </span>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-purple-400" />
                        <span className="text-sm font-bold text-cyan-300">{order.estimated_delivery || '24h - 48h Express'}</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* SECTION 2: 5-STAGE PROGRESS TIMELINE */}
              <div className="bg-slate-900/90 p-2 sm:p-2.5 rounded-[2.5rem] border border-slate-800/90 shadow-2xl backdrop-blur-2xl">
                <div className="bg-slate-950/90 p-6 sm:p-10 rounded-[calc(2.5rem-0.625rem)] border border-slate-800/80 space-y-8">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
                    <div>
                      <h3 className="text-xl font-bold text-white flex items-center gap-2.5">
                        <Compass className="w-6 h-6 text-emerald-400" />
                        <span>{isRTL ? 'مراحل التوصيل' : 'Progression de la Livraison'}</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        {isRTL ? 'متابعة مراحل المعالجة والشحن حتى وصول طلبِك' : 'Étapes de suivi de votre commande.'}
                      </p>
                    </div>

                    <button
                      onClick={() => setShowPreferencesModal(true)}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-emerald-400 border border-slate-800 hover:border-emerald-500/40 flex items-center gap-2 self-start sm:self-auto transition-colors"
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                      <span>{isRTL ? 'تعليمات التسليم' : 'Consignes de livraison'}</span>
                    </button>
                  </div>

                  {/* Desktop Horizontal Stepper Grid */}
                  <div className="hidden lg:grid grid-cols-5 gap-4 relative pt-4">
                    <div className="absolute top-12 left-12 right-12 h-1 bg-slate-800/90 -z-0 rounded-full">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-purple-400 transition-all duration-700 shadow-[0_0_18px_rgba(16,185,129,0.6)] rounded-full"
                        style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
                      />
                    </div>

                    {STEPS.map((step) => {
                      const isPassed = step.id <= currentStep;
                      const isCurrent = step.id === currentStep;
                      const IconComp = step.icon;

                      return (
                        <div key={step.id} className="relative z-10 flex flex-col items-center text-center">
                          <div
                            className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                              isCurrent
                                ? 'bg-gradient-to-br from-emerald-400 to-emerald-500 text-slate-950 ring-4 ring-emerald-500/30 scale-110 shadow-xl shadow-emerald-500/40 font-bold'
                                : isPassed
                                ? 'bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/50 shadow-md shadow-emerald-500/10'
                                : 'bg-slate-900 text-slate-600 border border-slate-800'
                            }`}
                          >
                            <IconComp className="w-7 h-7" />
                          </div>

                          <div className="mt-5 space-y-1">
                            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">
                              ÉTAPE 0{step.id + 1}
                            </span>
                            <h4 className={`text-xs font-bold leading-tight ${isPassed ? 'text-slate-100' : 'text-slate-500'}`}>
                              {isRTL ? step.titleAr : step.titleFr}
                            </h4>
                            <p className="text-[11px] text-slate-400 leading-snug max-w-[160px] mx-auto">
                              {isRTL ? step.descAr : step.descFr}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Mobile Vertical Stepper */}
                  <div className="lg:hidden space-y-8 relative pl-8 border-l-2 border-slate-800 ml-3">
                    {STEPS.map((step) => {
                      const isPassed = step.id <= currentStep;
                      const isCurrent = step.id === currentStep;
                      const IconComp = step.icon;

                      return (
                        <div key={step.id} className="relative flex items-start gap-4">
                          <div
                            className={`absolute -left-[45px] top-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                              isCurrent
                                ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/30 shadow-lg shadow-emerald-500/40'
                                : isPassed
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : 'bg-slate-900 text-slate-600 border border-slate-800'
                            }`}
                          >
                            <IconComp className="w-5 h-5" />
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">
                              ÉTAPE 0{step.id + 1}
                            </span>
                            <h4 className={`text-sm font-bold ${isPassed ? 'text-slate-100' : 'text-slate-500'}`}>
                              {isRTL ? step.titleAr : step.titleFr}
                            </h4>
                            <p className="text-xs text-slate-400">{isRTL ? step.descAr : step.descFr}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              </div>

              {/* SECTION 3: ROUTE VECTOR MAP & SUPPORT DOSSIER */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Visual Route Vector */}
                <div className="lg:col-span-2 bg-slate-900/90 p-2 rounded-[2.5rem] border border-slate-800/90 shadow-2xl backdrop-blur-2xl">
                  <div className="bg-slate-950/90 p-6 sm:p-8 rounded-[calc(2.5rem-0.5rem)] border border-slate-800/80 space-y-6 h-full flex flex-col justify-between">
                    
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                      <div className="flex items-center gap-2.5">
                        <Navigation className="w-5 h-5 text-cyan-400" />
                        <h3 className="text-base font-bold text-white">
                          {isRTL ? 'خريطة التوصيل' : 'Itinéraire d\'Acheminement'}
                        </h3>
                      </div>
                      <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                        {order.city || 'Maroc'}
                      </span>
                    </div>

                    {/* Animated SVG Route Illustration */}
                    <div className="relative w-full h-48 sm:h-56 bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center p-4">
                      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
                      
                      <svg className="w-full h-full relative z-10" viewBox="0 0 600 200" fill="none">
                        <path
                          d="M 60 100 Q 200 40, 340 100 T 540 100"
                          stroke="#1e293b"
                          strokeWidth="6"
                          strokeLinecap="round"
                        />
                        <path
                          d="M 60 100 Q 200 40, 340 100 T 540 100"
                          stroke="url(#route-gradient)"
                          strokeWidth="4"
                          strokeDasharray="8 8"
                          className="animate-pulse"
                        />

                        <defs>
                          <linearGradient id="route-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="50%" stopColor="#06b6d4" />
                            <stop offset="100%" stopColor="#a855f7" />
                          </linearGradient>
                        </defs>

                        {/* Point A */}
                        <circle cx="60" cy="100" r="12" fill="#0f172a" stroke="#10b981" strokeWidth="3" />
                        <circle cx="60" cy="100" r="4" fill="#10b981" />
                        <text x="60" y="140" fill="#94a3b8" fontSize="11" fontWeight="bold" textAnchor="middle">
                          Centre Logistique
                        </text>

                        {/* Point B */}
                        <circle cx="340" cy="100" r="14" fill="#0f172a" stroke="#06b6d4" strokeWidth="3" />
                        <circle cx="340" cy="100" r="6" fill="#06b6d4" className="animate-ping" />
                        <circle cx="340" cy="100" r="6" fill="#06b6d4" />
                        <text x="340" y="145" fill="#38bdf8" fontSize="12" fontWeight="bold" textAnchor="middle">
                          {order.status || 'En Transit'}
                        </text>

                        {/* Point C */}
                        <circle cx="540" cy="100" r="12" fill="#0f172a" stroke="#64748b" strokeWidth="3" />
                        <circle cx="540" cy="100" r="4" fill="#64748b" />
                        <text x="540" y="140" fill="#94a3b8" fontSize="11" fontWeight="bold" textAnchor="middle">
                          {order.city || 'Destination'}
                        </text>
                      </svg>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
                        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                        <div>
                          <span className="text-[10px] text-slate-500 font-mono block">MODE DE PAIEMENT</span>
                          <span className="font-bold text-slate-200">COD (Paiement à la livraison)</span>
                        </div>
                      </div>

                      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
                        <Box className="w-5 h-5 text-cyan-400 shrink-0" />
                        <div>
                          <span className="text-[10px] text-slate-500 font-mono block">N° COLIS</span>
                          <span className="font-bold text-slate-200">{order.order_id}</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Carrier Support Dossier */}
                <div className="bg-slate-900/90 p-2 rounded-[2.5rem] border border-slate-800/90 shadow-2xl backdrop-blur-2xl">
                  <div className="bg-slate-950/90 p-6 sm:p-8 rounded-[calc(2.5rem-0.5rem)] border border-slate-800/80 space-y-6 h-full flex flex-col justify-between">
                    
                    <div className="border-b border-slate-800/80 pb-4">
                      <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest block mb-1">
                        {isRTL ? 'المساعدة والمتابعة' : 'SUPPORT & ASSISTANCE'}
                      </span>
                      <h3 className="text-lg font-bold text-white">
                        {order.carrier || 'Réseau Transporteur Officiel'}
                      </h3>
                    </div>

                    <div className="space-y-4">
                      {order.driver ? (
                        <div className="flex items-center gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-950 font-black text-xl shrink-0 shadow-lg shadow-emerald-500/20">
                            <User className="w-7 h-7 text-slate-950" />
                          </div>

                          <div className="space-y-1">
                            <span className="text-xs font-bold text-white">{order.driver.name}</span>
                            <p className="text-xs text-slate-400">{order.driver.phone}</p>
                            {order.driver.vehicle && <p className="text-[11px] font-mono text-emerald-400">{order.driver.vehicle}</p>}
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-center space-y-1">
                          <span className="text-xs font-bold text-slate-300 block">
                            {isRTL ? 'معلومات السائق' : 'Informations du Livreur'}
                          </span>
                          <p className="text-[11px] text-slate-500">
                            {isRTL ? 'جاري تعيين السائق المكلف من طرف شركة الشحن' : 'Attribution du livreur en cours par la société de transport.'}
                          </p>
                        </div>
                      )}

                      <div className="space-y-2">
                        <a
                          href={`https://wa.me/212660808080?text=${encodeURIComponent(
                            `Bonjour, concernant la livraison de ma commande ${order.order_id}`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-2.5 transition-colors shadow-lg shadow-emerald-500/20"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>{isRTL ? 'التواصل عبر واتساب' : 'Contacter la conciergerie WhatsApp'}</span>
                        </a>
                      </div>
                    </div>

                    <div className="pt-2 text-[11px] text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{isRTL ? 'فريق خدمة العملاء متواجد للمساعدة على مدار الساعة' : 'Support dédié disponible 7j/7 pour toute assistance.'}</span>
                    </div>

                  </div>
                </div>

              </div>

              {/* SECTION 4: AUDIT LOGS */}
              {order.logs && order.logs.length > 0 && (
                <div className="bg-slate-900/90 p-2 sm:p-2.5 rounded-[2.5rem] border border-slate-800/90 shadow-2xl backdrop-blur-2xl">
                  <div className="bg-slate-950/90 p-6 sm:p-8 rounded-[calc(2.5rem-0.625rem)] border border-slate-800/80 space-y-6">
                    
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2.5">
                        <FileText className="w-5 h-5 text-emerald-400" />
                        <span>{isRTL ? 'سجل الأحداث' : 'Journal des Événements'}</span>
                      </h3>
                    </div>

                    <div className="space-y-6 relative pl-6 border-l border-slate-800 ml-2">
                      {order.logs.map((log, idx) => (
                        <div key={idx} className="relative group">
                          <div className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 ${
                            log.status === 'current'
                              ? 'bg-emerald-500 border-emerald-400 ring-4 ring-emerald-500/20'
                              : 'bg-slate-950 border-slate-700'
                          }`} />

                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
                              <span className="font-bold text-emerald-400">{log.time}</span>
                              <span className="text-slate-500">•</span>
                              <span className="text-slate-400">{log.date}</span>
                              <span className="text-slate-500">•</span>
                              <span className="text-cyan-400 font-semibold">{log.location}</span>
                            </div>

                            <h4 className="text-sm font-bold text-slate-100">
                              {isRTL ? log.titleAr : log.titleFr}
                            </h4>
                            <p className="text-xs text-slate-400 leading-relaxed">
                              {isRTL ? log.descAr : log.descFr}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                </div>
              )}

              {/* SECTION 5: PACKAGE ITEMS & FINANCIAL SUMMARY */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Product Articles List */}
                <div className="lg:col-span-2 bg-slate-900/90 p-2 sm:p-2.5 rounded-[2.5rem] border border-slate-800/90 shadow-2xl backdrop-blur-2xl">
                  <div className="bg-slate-950/90 p-6 sm:p-8 rounded-[calc(2.5rem-0.625rem)] border border-slate-800/80 space-y-6">
                    
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <PackageCheck className="w-5 h-5 text-emerald-400" />
                        <span>{isRTL ? 'محتويات الشحنة' : 'Contenu de la Commande'}</span>
                      </h3>
                      <span className="text-xs font-mono text-slate-400">
                        {order.items?.length || 0} {isRTL ? 'منتج' : 'article(s)'}
                      </span>
                    </div>

                    <div className="divide-y divide-slate-800/60">
                      {order.items && order.items.map((item, idx) => {
                        const imgUrl = resolveProductImage(item);
                        return (
                          <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden relative shrink-0 flex items-center justify-center p-1 shadow-inner">
                                <img
                                  src={imgUrl}
                                  alt={item.title}
                                  className="w-full h-full object-contain rounded-xl"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/images/categories/visage.png';
                                  }}
                                />
                              </div>

                              <div className="space-y-1">
                                <h4 className="text-xs sm:text-sm font-bold text-slate-200 leading-snug">{item.title}</h4>
                                {item.sku && <p className="text-[11px] font-mono text-slate-500">REF: {item.sku}</p>}
                                <p className="text-xs text-slate-400">
                                  {isRTL ? 'الكمية:' : 'Quantité:'} <span className="font-bold text-emerald-400">{item.quantity}</span> × {item.price} MAD
                                </p>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="text-base font-black text-slate-100 font-mono">
                                {(item.quantity * item.price).toFixed(2)} MAD
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {order.gift_item && (
                      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-3 text-xs font-bold">
                        <Sparkles className="w-5 h-5 shrink-0 text-emerald-400" />
                        <span>
                          {isRTL ? 'هدية مجانية مدرجة بالشحنة:' : 'Cadeau offert inclus:'} {order.gift_item}
                        </span>
                      </div>
                    )}

                  </div>
                </div>

                {/* Financial Breakdown & Destination Info */}
                <div className="space-y-6">
                  
                  {/* Financial Summary */}
                  <div className="bg-slate-900/90 p-2 rounded-[2.5rem] border border-slate-800/90 shadow-2xl backdrop-blur-2xl">
                    <div className="bg-slate-950/90 p-6 rounded-[calc(2.5rem-0.5rem)] border border-slate-800/80 space-y-4">
                      
                      <h3 className="text-base font-bold text-white border-b border-slate-800/80 pb-3">
                        {isRTL ? 'ملخص الدفع' : 'Récapitulatif Financier'}
                      </h3>

                      <div className="space-y-2.5 text-xs text-slate-400 font-sans">
                        <div className="flex justify-between">
                          <span>{isRTL ? 'المجموع الفرعي:' : 'Sous-total:'}</span>
                          <span className="font-mono font-medium text-slate-200">{order.subtotal} MAD</span>
                        </div>

                        {order.discount_amount && order.discount_amount > 0 ? (
                          <div className="flex justify-between text-emerald-400 font-bold">
                            <span>
                              {isRTL ? 'الخصم المطبق' : 'Remise promo'} {order.applied_coupon ? `(${order.applied_coupon})` : ''}:
                            </span>
                            <span className="font-mono">-{order.discount_amount} MAD</span>
                          </div>
                        ) : null}

                        <div className="flex justify-between">
                          <span>{isRTL ? 'رسوم الشحن:' : 'Frais de livraison:'}</span>
                          <span className="text-emerald-400 font-bold uppercase">{isRTL ? 'مجاناً' : 'GRATUIT'}</span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline">
                        <span className="text-sm font-bold text-white">{isRTL ? 'المبلغ الإجمالي (COD):' : 'Total à Payer:'}</span>
                        <span className="text-2xl font-black text-emerald-400 font-mono">{order.total} MAD</span>
                      </div>

                      <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-2.5 bg-slate-900 p-3 rounded-xl border border-slate-800">
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{isRTL ? 'الدفع عند الاستلام نقداً أو بالبطاقة البنكية TPE' : 'Paiement à la livraison par Espèces / TPE'}</span>
                      </div>

                    </div>
                  </div>

                  {/* Shipping Address Details */}
                  <div className="bg-slate-900/90 p-2 rounded-[2.5rem] border border-slate-800/90 shadow-2xl backdrop-blur-2xl">
                    <div className="bg-slate-950/90 p-6 rounded-[calc(2.5rem-0.5rem)] border border-slate-800/80 space-y-3">
                      
                      <h3 className="text-base font-bold text-white border-b border-slate-800/80 pb-3 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-emerald-400" />
                        <span>{isRTL ? 'عنوان التسليم' : 'Adresse de Livraison'}</span>
                      </h3>

                      <div className="text-xs space-y-1.5 text-slate-300">
                        <p className="font-bold text-white text-sm">{order.customer_name}</p>
                        <p className="text-slate-400">{order.address}</p>
                        <p className="font-semibold text-emerald-400">{order.city}, Maroc</p>
                        <p className="text-slate-400 font-mono">{order.phone_number}</p>
                        {order.notes && (
                          <div className="mt-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-amber-300">
                            <strong>Note:</strong> {order.notes}
                          </div>
                        )}
                      </div>

                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}
        </div>

        {/* MODAL 1: SCAN QR CODE */}
        {showQrModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-sm w-full space-y-6 text-center relative animate-in fade-in zoom-in-95">
              <button
                onClick={() => setShowQrModal(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">{isRTL ? 'رمز QR للتتبع السريع' : 'Code QR de Suivi Direct'}</h3>
                <p className="text-xs text-slate-400">{isRTL ? 'امسحي الرمز بالهاتف لمتابعة الشحنة' : 'Scannez avec votre smartphone pour ouvrir le suivi'}</p>
              </div>

              <div className="p-4 bg-white rounded-2xl inline-block shadow-2xl">
                <div className="w-48 h-48 bg-slate-950 p-2 rounded-lg flex flex-col items-center justify-center text-emerald-400 space-y-2">
                  <QrCode className="w-32 h-32 text-emerald-400" />
                  <span className="font-mono text-[9px] text-slate-300">{order?.order_id}</span>
                </div>
              </div>

              <button
                onClick={() => setShowQrModal(false)}
                className="w-full py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
              >
                {isRTL ? 'إغلاق' : 'Fermer'}
              </button>
            </div>
          </div>
        )}

        {/* MODAL 2: DELIVERY PREFERENCES */}
        {showPreferencesModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 relative animate-in fade-in zoom-in-95">
              <button
                onClick={() => setShowPreferencesModal(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-emerald-400" />
                  <span>{isRTL ? 'تحديد تعليمات التسليم' : 'Consignes de Livraison'}</span>
                </h3>
                <p className="text-xs text-slate-400">
                  {isRTL ? 'سيتم حفظ التفضيلات والتعليمات الخاصة للتوصيل' : 'Vos consignes seront transmises pour la livraison.'}
                </p>
              </div>

              <form onSubmit={handleSavePreferences} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 block">{isRTL ? 'التوقيت المفصل:' : 'Créneau horaire préféré:'}</label>
                  <select
                    value={prefTime}
                    onChange={(e) => setPrefTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Matinée (09:00 - 13:00)">Matinée (09:00 - 13:00)</option>
                    <option value="Après-midi (14:00 - 18:00)">Après-midi (14:00 - 18:00)</option>
                    <option value="Soirée (18:00 - 21:00)">Soirée (18:00 - 21:00)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 block">{isRTL ? 'تعليمات خاصة:' : 'Instructions particulières:'}</label>
                  <textarea
                    rows={3}
                    value={prefInstructions}
                    onChange={(e) => setPrefInstructions(e.target.value)}
                    placeholder={isRTL ? 'مثال: ترك الشحنة لدى الحارس، أو الاتصال قبل 15 دقيقة...' : 'Ex: Déposer au concierge, appeler 10 min avant...'}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs tracking-wide uppercase transition-colors"
                >
                  {prefSubmitted ? (isRTL ? 'جاري الحفظ...' : 'Enregistré !') : (isRTL ? 'حفظ التعليمات' : 'Enregistrer les consignes')}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 3: PRINTABLE BORDEREAU */}
        {showWaybillModal && order && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 relative animate-in fade-in">
              <button
                onClick={() => setShowWaybillModal(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-1">
                <h3 className="text-lg font-bold text-white">{isRTL ? 'وثيقة الشحن' : 'Bordereau de Commande'}</h3>
                <p className="text-xs text-slate-400">Para Officinal Maroc</p>
              </div>

              <div className="bg-white text-slate-950 p-6 rounded-2xl font-mono text-xs space-y-4 shadow-xl">
                <div className="flex justify-between border-b pb-3">
                  <div>
                    <p className="font-bold text-sm">PARA OFFICINAL</p>
                    <p className="text-[10px] text-slate-600">Maroc</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">{order.order_id}</p>
                    <p className="text-[10px] text-emerald-700 font-bold">{order.carrier || 'Express'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">DESTINATAIRE:</span>
                    <p className="font-bold">{order.customer_name}</p>
                    <p>{order.city}, Maroc</p>
                    <p>{order.phone_number}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 block">NUMÉRO SUIVI:</span>
                    <p className="font-bold">{order.tracking_number || order.order_id}</p>
                    <p>TOTAL COD: <strong className="text-emerald-700">{order.total} MAD</strong></p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => window.print()}
                  className="w-full py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>{isRTL ? 'طباعة' : 'Imprimer le Document'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </ShopShell>
  );
}
