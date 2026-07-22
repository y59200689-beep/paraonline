'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { 
  Search, PackageCheck, Sparkles, Truck, MapPin, ShieldCheck, 
  Copy, Check, PhoneCall, ExternalLink, RefreshCw, FileText, 
  Clock, AlertCircle, ArrowLeft, ChevronRight, Share2, MessageCircle,
  QrCode, SlidersHorizontal, Printer, Thermometer, Navigation, User,
  Calendar, CheckCircle2, AlertTriangle, X, Radio, ArrowUpRight,
  Shield, Activity, Compass, Headphones, Box
} from 'lucide-react';
import { ShopShell } from '@/components/ShopShell';

interface OrderItem {
  id?: number;
  title: string;
  quantity: number;
  price: number;
  image?: string;
  sku?: string;
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
  rating: number;
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
  temperature_log?: string;
  package_weight?: string;
  driver?: DriverInfo;
  logs?: AuditLog[];
}

const SAMPLE_ORDERS: Order[] = [
  {
    order_id: 'PO-2026-8942',
    customer_name: 'Dr. Salma Alami',
    phone_number: '0661884210',
    address: 'Boulevard Anfa, Résidence Les Fleurs, Appt 14',
    city: 'Casablanca',
    subtotal: 780,
    discount_amount: 78,
    applied_coupon: 'BEAUTY10',
    gift_item: 'Masque Hydra-Glow Offert (50ml)',
    total: 702,
    status: 'In Transit',
    date: '2026-07-22T14:30:00Z',
    created_at: '2026-07-22T14:30:00Z',
    carrier: 'Yalidine Express',
    tracking_number: 'YL-CAS-994821',
    estimated_delivery: 'Aujourd\'hui avant 18:30',
    temperature_log: '19.2°C (Thermo-Scellé OK)',
    package_weight: '1.45 kg',
    driver: {
      name: 'Karim Tazi',
      phone: '+212 6 61 99 88 77',
      vehicle: 'Fourgon Isotherme Renault Express',
      vehiclePlate: '8942-A-6',
      rating: 4.9,
    },
    items: [
      { title: 'Sérum Concentré Niacinamide 10% Pure Pureté', quantity: 1, price: 340, image: '/images/hero-1.webp', sku: 'SKU-NIA-100' },
      { title: 'Crème Hydratante Réparatrice Cicaplast B5+', quantity: 2, price: 220, image: '/images/hero-2.webp', sku: 'SKU-CIC-050' }
    ],
    logs: [
      {
        time: '15:10',
        date: '22 Juillet 2026',
        location: 'Hub Anfa · Casablanca',
        titleFr: 'Colis en cours de livraison par le chauffeur',
        titleAr: 'الشحنة مع السائق في طريقها إليكِ',
        descFr: 'Le livreur Karim Tazi a pris en charge le colis pour la tournée de l\'après-midi.',
        descAr: 'قام السائق كريم التازي بتحميل الشحنة لبدء جولة التسليم.',
        status: 'current',
      },
      {
        time: '11:45',
        date: '22 Juillet 2026',
        location: 'Centre Logistique Regional · Casablanca',
        titleFr: 'Arrivée au Hub de Tri Régional',
        titleAr: 'وصول الشحنة إلى مركز التوزيع الإقليمي',
        descFr: 'Scanné et vérifié conforme aux exigences thermo-contrôlées.',
        descAr: 'تم فحص وتأكيد سلامة الغلاف الحراري للشحنة.',
        status: 'completed',
      },
      {
        time: '08:30',
        date: '22 Juillet 2026',
        location: 'Laboratoire Central Para Officinal',
        titleFr: 'Inspection Clinique & Emballage Isotherme',
        titleAr: 'الفحص السريري والتغليف العازل للحرارة',
        descFr: 'Produits scellés hermétiquement avec protection antichoc.',
        descAr: 'غلق المنتجات بإحكام لحمايتها من الصدمات والحرارة.',
        status: 'completed',
      },
      {
        time: '14:30',
        date: '21 Juillet 2026',
        location: 'Plateforme E-Commerce',
        titleFr: 'Commande Validée & Paiement COD Confirmé',
        titleAr: 'تم تأكيد الطلب والدفع عند الاستلام',
        descFr: 'Dossier logistique créé et attribué au transporteur Yalidine.',
        descAr: 'تم إنشاء ملف الشحنة وتعيين شركة الشحن ياليدين.',
        status: 'completed',
      }
    ]
  },
  {
    order_id: 'PO-2026-4102',
    customer_name: 'Youssef Benjelloun',
    phone_number: '0662441020',
    address: 'Avenue Mohammed V, Agdal, N° 45',
    city: 'Rabat',
    subtotal: 540,
    discount_amount: 0,
    applied_coupon: null,
    gift_item: null,
    total: 540,
    status: 'Shipped',
    date: '2026-07-21T09:15:00Z',
    created_at: '2026-07-21T09:15:00Z',
    carrier: 'Cathedis Logistics',
    tracking_number: 'CT-RBT-881240',
    estimated_delivery: 'Demain avant 13:00',
    temperature_log: '18.8°C (Conforme)',
    package_weight: '0.98 kg',
    driver: {
      name: 'Othmane Berrada',
      phone: '+212 6 62 11 22 33',
      vehicle: 'Fourgon Express Mercedes Citan',
      vehiclePlate: '4102-B-1',
      rating: 4.8,
    },
    items: [
      { title: 'Gel Nettoyant Purifiant Effaclar Duo+ M', quantity: 1, price: 290, image: '/images/hero-1.webp', sku: 'SKU-EFF-200' },
      { title: 'Fluide Solaire Anti-Taches SPF50+ Ultra-Léger', quantity: 1, price: 250, image: '/images/hero-2.webp', sku: 'SKU-SOL-050' }
    ],
    logs: [
      {
        time: '09:15',
        date: '21 Juillet 2026',
        location: 'Hub Cathedis Rabat Agdal',
        titleFr: 'Prise en charge par le réseau Cathedis Express',
        titleAr: 'تم التسليم لشبكة كاثيديس إكسبريس',
        descFr: 'Colis en cours d\'acheminement vers le centre de distribution local.',
        descAr: 'الشحنة في طريقها إلى مركز التوزيع المحلي.',
        status: 'current',
      },
      {
        time: '18:00',
        date: '20 Juillet 2026',
        location: 'Laboratoire Central',
        titleFr: 'Emballage Isotherme Certifié',
        titleAr: 'تغليف عازل حراري معتمد',
        descFr: 'Scellé de sécurité apposé sur le paquet.',
        descAr: 'تم وضع ختم الأمان على الطرد.',
        status: 'completed',
      }
    ]
  },
  {
    order_id: 'PO-2026-1089',
    customer_name: 'Khadija Mansouri',
    phone_number: '0663108900',
    address: 'Gueliz, Rue de la Liberté, Résidence Atlas',
    city: 'Marrakech',
    subtotal: 920,
    discount_amount: 138,
    applied_coupon: 'CLINICAL15',
    gift_item: 'Pochette Dermo-Cosmétique Offerte',
    total: 782,
    status: 'Processing',
    date: '2026-07-22T17:45:00Z',
    created_at: '2026-07-22T17:45:00Z',
    carrier: 'Chrono Express Maroc',
    tracking_number: 'CR-RAK-339102',
    estimated_delivery: '24-48 Heures',
    temperature_log: '20.1°C (Préparation)',
    package_weight: '1.80 kg',
    driver: {
      name: 'Amine El Fassi',
      phone: '+212 6 63 44 55 66',
      vehicle: 'Camionnette Thermo Chrono',
      vehiclePlate: '1089-H-44',
      rating: 5.0,
    },
    items: [
      { title: 'Coffret Anti-Âge Global Rétinol + Vitamine C', quantity: 1, price: 920, image: '/images/hero-1.webp', sku: 'SKU-RET-900' }
    ],
    logs: [
      {
        time: '17:45',
        date: '22 Juillet 2026',
        location: 'Pharmacie Centrale Para Officinal',
        titleFr: 'Préparation et assemblage des formules',
        titleAr: 'تحضير وتجميع التركيبات العلاجية',
        descFr: 'Les soins sont en cours d\'inspection avant l\'emballage final.',
        descAr: 'جاري فحص المستحضرات قبل التغليف النهائي.',
        status: 'current',
      }
    ]
  }
];

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
      setOrder(SAMPLE_ORDERS[0]);
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

    // Check matching sample preset first
    const sampleMatch = SAMPLE_ORDERS.find(
      (o) => o.order_id.toLowerCase() === searchTerm.toLowerCase() || 
             o.phone_number.includes(searchTerm) ||
             (o.tracking_number && o.tracking_number.toLowerCase() === searchTerm.toLowerCase())
    );

    if (sampleMatch) {
      setTimeout(() => {
        setOrder(sampleMatch);
        setLoading(false);
      }, 350);
      return;
    }

    // Fetch live order from backend API endpoint
    try {
      const res = await fetch(`/api/orders?search=${encodeURIComponent(searchTerm)}`);
      const data = await res.json();

      if (data.success && data.orders && data.orders.length > 0) {
        const liveOrder = data.orders[0];
        // Enforce fallback fields if empty in live order
        if (!liveOrder.logs) {
          liveOrder.logs = [
            {
              time: 'En direct',
              date: new Date().toLocaleDateString('fr-FR'),
              location: `Hub ${liveOrder.city || 'Maroc'}`,
              titleFr: `Statut actuel: ${liveOrder.status}`,
              titleAr: `الحالة الحالية: ${liveOrder.status}`,
              descFr: 'Mise à jour en temps réel par le système de gestion des stocks.',
              descAr: 'تحديث مباشر من نظام إدارة المخزون.',
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
            : `Aucune commande trouvée pour "${searchTerm}". Vérifiez votre numéro de commande.`
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
    triggerToast(language === 'AR' ? 'تمت تحديث تفضيلات التسليم!' : 'Toutes vos instructions ont été transmises au chauffeur.');
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
    return 0; // Order Placed
  };

  const currentStep = order ? getStatusIndex(order.status) : 0;

  const STEPS = [
    {
      id: 0,
      titleFr: 'Commande Confirmée',
      titleAr: 'تم تأكيد الطلب',
      descFr: 'Paiement COD enregistré & Référence générée',
      descAr: 'تم تسجيل الطلب وحجز المنتجات',
      icon: PackageCheck,
    },
    {
      id: 1,
      titleFr: 'Inspection & Isotherme',
      titleAr: 'الفحص والتغليف الحراري',
      descFr: 'Contrôle qualité dermo & Emballage scellé',
      descAr: 'فحص جودة المنتجات والتغليف العازل',
      icon: Sparkles,
    },
    {
      id: 2,
      titleFr: 'Prise en Charge Express',
      titleAr: 'الشحن السريع للموزع',
      descFr: 'Bordereau créé & Remis au transporteur',
      descAr: 'تم تسليم الشحنة لشركة الشحن',
      icon: Truck,
    },
    {
      id: 3,
      titleFr: 'En Transit Local',
      titleAr: 'الشحنة مع السائق',
      descFr: 'Tournée en cours vers votre domicile',
      descAr: 'السائق في الطريق لإيصال طلبِك',
      icon: MapPin,
    },
    {
      id: 4,
      titleFr: 'Livré & Signé',
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

        {/* Ambient Top Ticker Bar */}
        <div className="bg-slate-900/90 border-b border-slate-800 text-[11px] font-mono py-2 px-4 overflow-hidden relative z-20 backdrop-blur-md">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 text-slate-400">
            <div className="flex items-center gap-6 overflow-x-auto no-scrollbar whitespace-nowrap">
              <span className="flex items-center gap-2 text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                {isRTL ? 'مركز توزيع الدار البيضاء: نشط 100%' : 'HUB CASABLANCA: ACTIVE 100%'}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 text-slate-400">
                <Shield className="w-3 h-3 text-cyan-400" />
                {isRTL ? 'معدل الالتزام بالمواعيد: 99.8%' : 'ON-TIME PERFORMANCE: 99.8%'}
              </span>
              <span className="hidden md:inline-flex items-center gap-1.5 text-slate-400">
                <Thermometer className="w-3 h-3 text-amber-400" />
                {isRTL ? 'التخزين الحراري المحمي: 18°C - 22°C' : 'THERMAL CONTROL STORAGE: 18°C - 22°C OK'}
              </span>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="hidden lg:inline text-slate-500">Global Logistics Protocol v2.6</span>
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

        {/* Ambient Glowing Hero Area */}
        <div className="relative overflow-hidden border-b border-slate-800/80 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 pt-10 pb-16">
          {/* Subtle Glowing Radial Mesh Background Orbs */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-emerald-500/10 blur-[150px] pointer-events-none rounded-full" />
          <div className="absolute top-20 right-10 w-96 h-96 bg-cyan-500/10 blur-[140px] pointer-events-none rounded-full" />
          <div className="absolute bottom-0 left-10 w-80 h-80 bg-purple-500/5 blur-[120px] pointer-events-none rounded-full" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Header Navigation & Back button */}
            <div className="flex items-center justify-between gap-4 mb-8">
              <Link
                href="/"
                className="group inline-flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-emerald-400 transition-all bg-slate-900/60 hover:bg-slate-900 border border-slate-800 px-4 py-2 rounded-full backdrop-blur-md"
              >
                <ArrowLeft className={`w-4 h-4 transition-transform group-hover:-translate-x-1 ${isRTL ? 'rotate-180 group-hover:translate-x-1' : ''}`} />
                <span>{isRTL ? 'العودة للمتجر الرئيسي' : 'Retour à la boutique'}</span>
              </Link>

              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400/90 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full backdrop-blur-md">
                <Activity className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
                <span>{isRTL ? 'نظام التتبع المباشر متصل' : 'LIVE TRACKING RADAR ONLINE'}</span>
              </div>
            </div>

            {/* Title & Headline */}
            <div className="text-center max-w-4xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-emerald-400 text-xs font-bold uppercase tracking-widest shadow-xl backdrop-blur-md">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{isRTL ? 'بوابة الشحن واللوجستيات الدولية' : 'Portail Logistique International & COD'}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white font-heading leading-none">
                {isRTL ? 'تتبّعي مسار شحنتكِ فائقة الدقة' : 'Suivi de Commande Haute-Précision'}
              </h1>
              <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
                {isRTL
                  ? 'أدخلي رقم الطلب أو رقم الهاتف أو رقم التتبع لمتابعة الشحنة خطوة بخطوة من المختبر السريري حتى التسليم السريع.'
                  : 'Saisissez votre référence de commande ou numéro de téléphone pour suivre en direct l\'acheminement express de vos soins.'}
              </p>
            </div>

            {/* Master Doppelrand Double-Bezel Search Component */}
            <div className="mt-10 max-w-3xl mx-auto">
              <div className="bg-slate-900/80 p-2 sm:p-3 rounded-[2.5rem] border border-slate-800/90 shadow-2xl shadow-slate-950/90 backdrop-blur-2xl">
                
                {/* Search Type Filter Tabs */}
                <div className="flex items-center gap-2 mb-3 px-2 pt-1 border-b border-slate-800/60 pb-3 text-xs">
                  <span className="text-slate-500 font-medium mr-1 text-[11px]">
                    {isRTL ? 'طريقة البحث:' : 'Rechercher par:'}
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

                {/* Inner Search Box Core */}
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
                        ? (isRTL ? 'أدخلي رقم الطلب مثل: PO-2026-8942' : 'Exemple: PO-2026-8942')
                        : searchTab === 'phone'
                        ? (isRTL ? 'أدخلي رقم الهاتف مثل: 0661884210' : 'Exemple: 0661884210')
                        : (isRTL ? 'رقم الطلب أو الهاتف أو كود الشحن...' : 'N° de commande, téléphone ou suivi transporteur...')
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

                  {/* Island Button with Nested Trailing Icon */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="group bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-black text-xs sm:text-sm tracking-wide uppercase px-6 py-3.5 rounded-2xl transition-all duration-300 shadow-lg shadow-emerald-500/25 shrink-0 flex items-center gap-3 active:scale-98"
                  >
                    {loading ? (
                      <RefreshCw className="w-5 h-5 animate-spin text-slate-950" />
                    ) : (
                      <>
                        <span>{isRTL ? 'تتبع الشحنة' : 'Suivre Colis'}</span>
                        <div className="w-7 h-7 rounded-full bg-slate-950/15 flex items-center justify-center transition-transform group-hover:translate-x-1">
                          <ChevronRight className={`w-4 h-4 text-slate-950 ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                        </div>
                      </>
                    )}
                  </button>
                </form>

                {/* Preset Chips */}
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs px-2 pb-1">
                  <span className="text-slate-500 font-medium text-[11px]">
                    {isRTL ? 'أمثلة سريعة للتجربة:' : 'Exemples de démo:'}
                  </span>
                  {SAMPLE_ORDERS.map((sample) => (
                    <button
                      key={sample.order_id}
                      onClick={() => {
                        setQuery(sample.order_id);
                        handleSearch(sample.order_id);
                      }}
                      className="px-3 py-1 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-400 font-mono text-[11px] transition-all flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>{sample.order_id}</span>
                      <span className="text-slate-500">({sample.city})</span>
                    </button>
                  ))}
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* Content Body Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {error && (
            <div className="max-w-2xl mx-auto bg-rose-500/10 border border-rose-500/30 text-rose-300 p-6 rounded-3xl flex items-start gap-4 text-sm shadow-xl backdrop-blur-xl animate-in fade-in">
              <AlertCircle className="w-6 h-6 shrink-0 text-rose-400 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-bold text-rose-200">{isRTL ? 'تعذر العثور على الطلب' : 'Recherche non aboutie'}</h4>
                <p className="text-xs text-rose-300/90 leading-relaxed">{error}</p>
                <div className="pt-2 text-xs">
                  <span className="text-slate-400">{isRTL ? 'هل تحتاج مساعدة؟' : 'Besoin d\'aide ?'} </span>
                  <a
                    href="https://wa.me/212660808080"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 font-bold underline hover:text-emerald-300"
                  >
                    {isRTL ? 'تحدثي مع خدمة العملاء عبر واتساب' : 'Contactez notre concierge WhatsApp 24/7'}
                  </a>
                </div>
              </div>
            </div>
          )}

          {order && (
            <div className="space-y-10 animate-in fade-in duration-500">
              
              {/* SECTION 1: MASTER ORDER SUMMARY CARD (Double Bezel) */}
              <div className="bg-slate-900/90 p-2 sm:p-2.5 rounded-[2.5rem] border border-slate-800/90 shadow-2xl backdrop-blur-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 blur-[120px] pointer-events-none rounded-full" />
                
                <div className="bg-slate-950/90 p-6 sm:p-8 rounded-[calc(2.5rem-0.625rem)] border border-slate-800/80 space-y-6">
                  
                  {/* Top Bar Header */}
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

                    {/* Quick Action Buttons Hub */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        onClick={copyTrackingLink}
                        className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold flex items-center gap-2 border border-slate-800 transition-colors shadow-md"
                      >
                        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                        <span>{copied ? (isRTL ? 'تم النسخ!' : 'Lien copié !') : (isRTL ? 'نسخ الرابط' : 'Partager')}</span>
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
                        <span>{isRTL ? 'طباعة البوليسة' : 'Bordereau PDF'}</span>
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
                        <span>{isRTL ? 'واتساب VIP' : 'Support WhatsApp'}</span>
                      </a>
                    </div>
                  </div>

                  {/* Logistics Specs Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80 space-y-1">
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">
                        {isRTL ? 'شركة الشحن' : 'Transporteur Official'}
                      </span>
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm font-bold text-slate-100">{order.carrier || 'Yalidine Express'}</span>
                      </div>
                    </div>

                    <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80 space-y-1">
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">
                        {isRTL ? 'رقم البوليسة' : 'N° Suivi Courier'}
                      </span>
                      <div className="flex items-center gap-2">
                        <Box className="w-4 h-4 text-cyan-400" />
                        <span className="text-sm font-mono font-bold text-emerald-400">{order.tracking_number || 'YL-MA-884920'}</span>
                      </div>
                    </div>

                    <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80 space-y-1">
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">
                        {isRTL ? 'الوجهة' : 'Destination'}
                      </span>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-amber-400" />
                        <span className="text-sm font-bold text-slate-100">{order.city}, Maroc</span>
                      </div>
                    </div>

                    <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80 space-y-1">
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">
                        {isRTL ? 'التسليم المتوقع' : 'Livraison Estimée'}
                      </span>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-purple-400" />
                        <span className="text-sm font-bold text-cyan-300">{order.estimated_delivery || '24-48h Express'}</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* SECTION 2: 5-STAGE VISUAL PROGRESS RADAR TIMELINE */}
              <div className="bg-slate-900/90 p-2 sm:p-2.5 rounded-[2.5rem] border border-slate-800/90 shadow-2xl backdrop-blur-2xl">
                <div className="bg-slate-950/90 p-6 sm:p-10 rounded-[calc(2.5rem-0.625rem)] border border-slate-800/80 space-y-8">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
                    <div>
                      <h3 className="text-xl font-bold text-white flex items-center gap-2.5">
                        <Compass className="w-6 h-6 text-emerald-400 animate-spin-slow" />
                        <span>{isRTL ? 'مسار الشحنة المباشر' : 'Progression de la Livraison en Temps Réel'}</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        {isRTL ? 'متابعة لحظية لمراحل الشحن بالتعاون مع الناقل الرسمي' : 'Mises à jour automatisées transmises par le réseau logistique.'}
                      </p>
                    </div>

                    <button
                      onClick={() => setShowPreferencesModal(true)}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-emerald-400 border border-slate-800 hover:border-emerald-500/40 flex items-center gap-2 self-start sm:self-auto transition-colors"
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                      <span>{isRTL ? 'تعديل تفضيلات التسليم' : 'Modifier créneau / consignes'}</span>
                    </button>
                  </div>

                  {/* Desktop Horizontal Stepper Grid */}
                  <div className="hidden lg:grid grid-cols-5 gap-4 relative pt-4">
                    {/* Background Connecting Line */}
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

              {/* SECTION 3: SIMULATED LOGISTICS RADAR ROUTE & DRIVER DOSSIER GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Visual Route Vector Radar */}
                <div className="lg:col-span-2 bg-slate-900/90 p-2 rounded-[2.5rem] border border-slate-800/90 shadow-2xl backdrop-blur-2xl">
                  <div className="bg-slate-950/90 p-6 sm:p-8 rounded-[calc(2.5rem-0.5rem)] border border-slate-800/80 space-y-6 h-full flex flex-col justify-between">
                    
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                      <div className="flex items-center gap-2.5">
                        <Navigation className="w-5 h-5 text-cyan-400" />
                        <h3 className="text-base font-bold text-white">
                          {isRTL ? 'رادار المسار اللوجستي المباشر' : 'Carte Radar d\'Acheminement Vectoriel'}
                        </h3>
                      </div>
                      <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                        GPS Active Ping
                      </span>
                    </div>

                    {/* Animated SVG Route Illustration */}
                    <div className="relative w-full h-48 sm:h-56 bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center p-4">
                      {/* Grid Lines Pattern Background */}
                      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
                      
                      <svg className="w-full h-full relative z-10" viewBox="0 0 600 200" fill="none">
                        {/* Route Path Line */}
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

                        {/* Gradient Definition */}
                        <defs>
                          <linearGradient id="route-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="50%" stopColor="#06b6d4" />
                            <stop offset="100%" stopColor="#a855f7" />
                          </linearGradient>
                        </defs>

                        {/* Point A: Lab Hub */}
                        <circle cx="60" cy="100" r="12" fill="#0f172a" stroke="#10b981" strokeWidth="3" />
                        <circle cx="60" cy="100" r="4" fill="#10b981" />
                        <text x="60" y="140" fill="#94a3b8" fontSize="11" fontWeight="bold" textAnchor="middle">
                          Hub Labo (Casa)
                        </text>

                        {/* Point B: Transit Center */}
                        <circle cx="340" cy="100" r="14" fill="#0f172a" stroke="#06b6d4" strokeWidth="3" />
                        <circle cx="340" cy="100" r="6" fill="#06b6d4" className="animate-ping" />
                        <circle cx="340" cy="100" r="6" fill="#06b6d4" />
                        <text x="340" y="145" fill="#38bdf8" fontSize="12" fontWeight="bold" textAnchor="middle">
                          En Transit ({order.city})
                        </text>

                        {/* Point C: Destination */}
                        <circle cx="540" cy="100" r="12" fill="#0f172a" stroke="#64748b" strokeWidth="3" />
                        <circle cx="540" cy="100" r="4" fill="#64748b" />
                        <text x="540" y="140" fill="#94a3b8" fontSize="11" fontWeight="bold" textAnchor="middle">
                          {order.city} Client
                        </text>
                      </svg>
                    </div>

                    {/* Condition Telemetry Strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
                      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
                        <Thermometer className="w-5 h-5 text-amber-400 shrink-0" />
                        <div>
                          <span className="text-[10px] text-slate-500 font-mono block">TEMPÉRATURE</span>
                          <span className="font-bold text-slate-200">{order.temperature_log || '19.2°C Stable'}</span>
                        </div>
                      </div>

                      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
                        <Box className="w-5 h-5 text-cyan-400 shrink-0" />
                        <div>
                          <span className="text-[10px] text-slate-500 font-mono block">POIDS COLIS</span>
                          <span className="font-bold text-slate-200">{order.package_weight || '1.20 kg'}</span>
                        </div>
                      </div>

                      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center gap-3 col-span-2 sm:col-span-1">
                        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                        <div>
                          <span className="text-[10px] text-slate-500 font-mono block">SCELLÉ SÉCURITÉ</span>
                          <span className="font-bold text-emerald-400">Verrouillé OK</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Driver Dossier Card */}
                <div className="bg-slate-900/90 p-2 rounded-[2.5rem] border border-slate-800/90 shadow-2xl backdrop-blur-2xl">
                  <div className="bg-slate-950/90 p-6 sm:p-8 rounded-[calc(2.5rem-0.5rem)] border border-slate-800/80 space-y-6 h-full flex flex-col justify-between">
                    
                    <div className="border-b border-slate-800/80 pb-4">
                      <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest block mb-1">
                        {isRTL ? 'ملف السائق المعتمد' : 'DOSSIER CHAUFFEUR DÉDIÉ'}
                      </span>
                      <h3 className="text-lg font-bold text-white">
                        {order.driver?.name || 'Karim Tazi'}
                      </h3>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-950 font-black text-xl shrink-0 shadow-lg shadow-emerald-500/20">
                          <User className="w-7 h-7 text-slate-950" />
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{order.driver?.name || 'Karim Tazi'}</span>
                            <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-md border border-amber-500/30">
                              ★ {order.driver?.rating || '4.9'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">{order.driver?.vehicle || 'Fourgon Isotherme Express'}</p>
                          <p className="text-[11px] font-mono text-slate-500">Matricule: {order.driver?.vehiclePlate || '8942-A-6'}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <a
                          href={`tel:${order.driver?.phone || '+212661884210'}`}
                          className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold flex items-center justify-center gap-2.5 transition-colors"
                        >
                          <PhoneCall className="w-4 h-4 text-emerald-400" />
                          <span>{isRTL ? 'الاتصال بالسائق المباشر' : 'Appeler le Chauffeur'}</span>
                        </a>

                        <a
                          href={`https://wa.me/212660808080?text=${encodeURIComponent(
                            `Bonjour, concernant la livraison de ma commande ${order.order_id}`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-3 px-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-center gap-2.5 transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>{isRTL ? 'إرسال رسالة واتساب' : 'Envoyer SMS WhatsApp'}</span>
                        </a>
                      </div>
                    </div>

                    <div className="pt-2 text-[11px] text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{isRTL ? 'سائق معتمد ومفحوص من طرف شبكة الشحن' : 'Chauffeur certifié et contrôlé par le réseau transporteur.'}</span>
                    </div>

                  </div>
                </div>

              </div>

              {/* SECTION 4: DETAILED AUDIT EVENT LOGS */}
              {order.logs && order.logs.length > 0 && (
                <div className="bg-slate-900/90 p-2 sm:p-2.5 rounded-[2.5rem] border border-slate-800/90 shadow-2xl backdrop-blur-2xl">
                  <div className="bg-slate-950/90 p-6 sm:p-8 rounded-[calc(2.5rem-0.625rem)] border border-slate-800/80 space-y-6">
                    
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2.5">
                        <FileText className="w-5 h-5 text-emerald-400" />
                        <span>{isRTL ? 'سجل تتبع الأحداث التفصيلي' : 'Journal Détaillé d\'Acheminement'}</span>
                      </h3>
                      <span className="text-xs font-mono text-slate-400">
                        {order.logs.length} {isRTL ? 'أحداث مسجلة' : 'événements horodatés'}
                      </span>
                    </div>

                    <div className="space-y-6 relative pl-6 border-l border-slate-800 ml-2">
                      {order.logs.map((log, idx) => (
                        <div key={idx} className="relative group">
                          {/* Circle node */}
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

              {/* SECTION 5: PACKAGE ANATOMY & FINANCIAL SUMMARY GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Product Articles List */}
                <div className="lg:col-span-2 bg-slate-900/90 p-2 sm:p-2.5 rounded-[2.5rem] border border-slate-800/90 shadow-2xl backdrop-blur-2xl">
                  <div className="bg-slate-950/90 p-6 sm:p-8 rounded-[calc(2.5rem-0.625rem)] border border-slate-800/80 space-y-6">
                    
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <PackageCheck className="w-5 h-5 text-emerald-400" />
                        <span>{isRTL ? 'محتويات الشحنة والمنتجات' : 'Contenu de la Commande'}</span>
                      </h3>
                      <span className="text-xs font-mono text-slate-400">
                        {order.items.length} {isRTL ? 'منتج' : 'article(s)'}
                      </span>
                    </div>

                    <div className="divide-y divide-slate-800/60">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden relative shrink-0 flex items-center justify-center">
                              {item.image ? (
                                <Image src={item.image} alt={item.title} fill className="object-cover" />
                              ) : (
                                <PackageCheck className="w-7 h-7 text-slate-600" />
                              )}
                            </div>

                            <div className="space-y-1">
                              <h4 className="text-xs sm:text-sm font-bold text-slate-200 leading-snug">{item.title}</h4>
                              <p className="text-[11px] font-mono text-slate-500">REF: {item.sku || `SKU-00${idx + 1}`}</p>
                              <p className="text-xs text-slate-400">
                                {isRTL ? 'الكمية:' : 'Quantité:'} <span className="font-bold text-emerald-400">{item.quantity}</span> × {item.price} MAD
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-base font-black text-slate-100 font-mono">
                              {item.quantity * item.price} MAD
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {order.gift_item && (
                      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-3 text-xs font-bold">
                        <Sparkles className="w-5 h-5 shrink-0 text-emerald-400" />
                        <span>
                          {isRTL ? 'هدية مجانية مدرجة بالشحنة:' : 'Cadeau dermo-cosmétique offert inclus:'} {order.gift_item}
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
                        {isRTL ? 'ملخص الدفع والرسوم' : 'Récapitulatif Financier COD'}
                      </h3>

                      <div className="space-y-2.5 text-xs text-slate-400 font-sans">
                        <div className="flex justify-between">
                          <span>{isRTL ? 'المجموع الفرعي:' : 'Sous-total:'}</span>
                          <span className="font-mono font-medium text-slate-200">{order.subtotal} MAD</span>
                        </div>

                        {order.discount_amount && order.discount_amount > 0 ? (
                          <div className="flex justify-between text-emerald-400 font-bold">
                            <span>
                              {isRTL ? 'الخصم المطبق' : 'Remise promo'} ({order.applied_coupon}):
                            </span>
                            <span className="font-mono">-{order.discount_amount} MAD</span>
                          </div>
                        ) : null}

                        <div className="flex justify-between">
                          <span>{isRTL ? 'الشحن Express Thermique:' : 'Frais de livraison express:'}</span>
                          <span className="text-emerald-400 font-bold uppercase">{isRTL ? 'مجاناً' : 'GRATUIT'}</span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline">
                        <span className="text-sm font-bold text-white">{isRTL ? 'المبلغ الإجمالي عند الاستلام:' : 'Total à Payer à la Livraison:'}</span>
                        <span className="text-2xl font-black text-emerald-400 font-mono">{order.total} MAD</span>
                      </div>

                      <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-2.5 bg-slate-900 p-3 rounded-xl border border-slate-800">
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{isRTL ? 'الدفع عند الاستلام نقداً أو بالبطاقة البنكية TPE' : 'Paiement sécurisé à la livraison (Espèces / TPE Portable)'}</span>
                      </div>

                    </div>
                  </div>

                  {/* Shipping Address Details */}
                  <div className="bg-slate-900/90 p-2 rounded-[2.5rem] border border-slate-800/90 shadow-2xl backdrop-blur-2xl">
                    <div className="bg-slate-950/90 p-6 rounded-[calc(2.5rem-0.5rem)] border border-slate-800/80 space-y-3">
                      
                      <h3 className="text-base font-bold text-white border-b border-slate-800/80 pb-3 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-emerald-400" />
                        <span>{isRTL ? 'عنوان ودليل التسليم' : 'Adresse de Livraison'}</span>
                      </h3>

                      <div className="text-xs space-y-1.5 text-slate-300">
                        <p className="font-bold text-white text-sm">{order.customer_name}</p>
                        <p className="text-slate-400">{order.address}</p>
                        <p className="font-semibold text-emerald-400">{order.city}, Maroc</p>
                        <p className="text-slate-400 font-mono">{order.phone_number}</p>
                        {order.notes && (
                          <div className="mt-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-amber-300">
                            <strong>Note client:</strong> {order.notes}
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

              {/* Simulated Visual QR code block */}
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
                  {isRTL ? 'سيتم إرسال التفضيلات مباشرة إلى سائق الشحنة' : 'Vos consignes seront transmises en direct au chauffeur.'}
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
                  <label className="font-bold text-slate-300 block">{isRTL ? 'تعليمات خاصة للسائق:' : 'Instructions particulières:'}</label>
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
                  {prefSubmitted ? (isRTL ? 'جاري الحفظ...' : 'Enregistré !') : (isRTL ? 'حفظ وإرسال للسائق' : 'Transmettre au Chauffeur')}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 3: PRINTABLE AIR WAYBILL BORDEREAU */}
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
                <h3 className="text-lg font-bold text-white">{isRTL ? 'بوليسة الشحن الرسمية' : 'Bordereau Logistique Officiel'}</h3>
                <p className="text-xs text-slate-400">Air-Waybill Reference · Para Officinal Maroc</p>
              </div>

              <div className="bg-white text-slate-950 p-6 rounded-2xl font-mono text-xs space-y-4 shadow-xl">
                <div className="flex justify-between border-b pb-3">
                  <div>
                    <p className="font-bold text-sm">PARA OFFICINAL LOGISTICS</p>
                    <p className="text-[10px] text-slate-600">Hub Anfa, Casablanca</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">{order.order_id}</p>
                    <p className="text-[10px] text-emerald-700 font-bold">{order.carrier}</p>
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
                    <span className="text-slate-500 block">SUIVI COURIER:</span>
                    <p className="font-bold">{order.tracking_number || 'YL-MA-884920'}</p>
                    <p>TOTAL COD: <strong className="text-emerald-700">{order.total} MAD</strong></p>
                  </div>
                </div>

                <div className="border-t pt-3 flex items-center justify-between text-[10px] text-slate-500">
                  <span>CONTROLE THERMO ISOTHERME OK</span>
                  <span>SCELLÉ N° 994821</span>
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
