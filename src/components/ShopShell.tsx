'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useUi } from '@/context/UiContext';
import { useSettings } from '@/context/SettingsContext';
import { usePathname, useRouter } from 'next/navigation';
import { Product } from '@/lib/data';
import { useProducts } from '@/context/ProductsContext';
import Link from 'next/link';
import { ShoppingBag, Home as HomeIcon, Store, Sparkles, Mail, Send, ShieldCheck, Truck, MessageSquare, Lock, CheckCircle2, Award, Package, Crown, FlaskConical, Building2, Coins, CreditCard, Scale } from 'lucide-react';
import Image from 'next/image';
import { getOptimizedImageUrl } from '@/lib/image-optimizer';

// Component Imports
import dynamic from 'next/dynamic';

// Component Imports
import { Header } from './Header';
import { CartBubbleCoordinator } from './CartBubbleCoordinator';
import { OrderSuccessModal } from './OrderSuccessModal';

const CartDrawer = dynamic(() => import('./CartDrawer').then(m => m.CartDrawer), { ssr: false });
const WishlistDrawer = dynamic(() => import('./WishlistDrawer').then(m => m.WishlistDrawer), { ssr: false });
const SkinDiagnostic = dynamic(() => import('./SkinDiagnostic').then(m => m.SkinDiagnostic), { ssr: false });
const ScratchCard = dynamic(() => import('./ScratchCard').then(m => m.ScratchCard), { ssr: false });
const QuickViewModal = dynamic(() => import('./QuickViewModal').then(m => m.QuickViewModal), { ssr: false });
const RoutineBundleDrawer = dynamic(() => import('./RoutineBundleDrawer').then(m => m.RoutineBundleDrawer), { ssr: false });

interface ShopShellProps {
  children: React.ReactNode;
  hideHeader?: boolean;
  hideFooter?: boolean;
}

export const ShopShell: React.FC<ShopShellProps> = ({ children, hideHeader, hideFooter }) => {
  const { t, language } = useTranslation();
  const { products } = useProducts();
  const { settings } = useSettings();
  const { cart, isCartOpen, setIsCartOpen } = useCart();
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const pathname = usePathname();
  const router = useRouter();

  const {
    isWishlistOpen, setWishlistOpen,
    isDiagnosticOpen, setDiagnosticOpen,
    isScratchCardOpen, setScratchCardOpen,
    selectedProduct, setSelectedProduct
  } = useUi();

  const [isBundleDrawerOpen, setIsBundleDrawerOpen] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState('home');
  const [mounted, setMounted] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubscribed(true);
      setTimeout(() => {
        setNewsletterSubscribed(false);
        setNewsletterEmail('');
      }, 5000);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const audioContextRef = useRef<AudioContext | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastData, setToastData] = useState({ name: '', city: '', product: '', time: '' });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        const res = await fetch('/api/orders/recent-activity');
        const data = await res.json();
        if (data.success && data.orders && data.orders.length > 0) {
          setRecentOrders(data.orders);
        }
      } catch (err) {
        console.error("Failed to load recent activity:", err);
      }
    };
    fetchRecentActivity();
  }, []);

  // Pre-unlock AudioContext on first user gesture
  useEffect(() => {
    let unlocked = false;
    const unlock = () => {
      if (unlocked) return;
      unlocked = true;
      cleanup();

      try {
        const AudioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AudioContextClass) return;
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioContextClass();
        }
        const ctx = audioContextRef.current;
        if (ctx.state === 'suspended') {
          ctx.resume().then(() => {
            console.log('AudioContext successfully unlocked');
          });
        }
      } catch (e) {
        console.warn('AudioContext unlock failed:', e);
      }
    };

    const cleanup = () => {
      window.removeEventListener('click', unlock);
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('scroll', unlock);
    };

    window.addEventListener('click', unlock, { passive: true });
    window.addEventListener('touchstart', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });
    window.addEventListener('scroll', unlock, { passive: true });

    return cleanup;
  }, []);

  // Dynamic Scroll Listener for Mobile Bottom Navigation
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY;
      const boutiqueEl = document.getElementById('boutique-grid');
      const boutiqueOffset = boutiqueEl ? boutiqueEl.offsetTop - 200 : 800;

      if (scrollPos < 300) {
        setActiveMobileTab('home');
      } else if (scrollPos >= 300 && scrollPos < boutiqueOffset + 400) {
        setActiveMobileTab('boutique');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // FOMO Toast notification trigger
  useEffect(() => {
    const cities = ['Casablanca', 'Rabat', 'Tanger', 'Fès', 'Marrakech', 'Agadir', 'Oujda', 'Meknès', 'Tétouan'];
    const names = ['Khadija', 'Aminata', 'Fatima', 'Salma', 'Meryem', 'Imane', 'Laila', 'Nadia'];

    /*
    const playSubtleChime = () => {
      try {
        const AudioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AudioContextClass) return;
        
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioContextClass();
        }
        const ctx = audioContextRef.current;
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
        
        const now = ctx.currentTime;

        // Elegant high-end chime (C6 then E6 arpeggio)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(1046.50, now);
        gain1.gain.setValueAtTime(0, now);
        gain1.gain.linearRampToValueAtTime(0.12, now + 0.04);
        gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1318.51, now + 0.08);
        gain2.gain.setValueAtTime(0, now + 0.08);
        gain2.gain.linearRampToValueAtTime(0.06, now + 0.12);
        gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);

        osc1.start(now);
        osc1.stop(now + 0.4);
        osc2.start(now + 0.08);
        osc2.stop(now + 0.5);
      } catch (e) {
        console.log('Chime playback failed:', e);
      }
    };
    */

    const triggerToast = () => {
      if (recentOrders.length > 0) {
        const order = recentOrders[Math.floor(Math.random() * recentOrders.length)];
        setToastData({
          name: order.name,
          city: order.city,
          product: order.product,
          time: language === 'FR' ? order.timeFr : order.timeAr
        });
      } else {
        const randomProduct = products[Math.floor(Math.random() * products.length)] || products[0];
        const timesFR = ['il y a 1 min', 'il y a 2 min', 'il y a 5 min'];
        const timesAR = ['منذ دقيقة', 'منذ دقيقتين', 'منذ 5 دقائق'];
        const randomIndex = Math.floor(Math.random() * timesFR.length);
        
        setToastData({
          name: names[Math.floor(Math.random() * names.length)],
          city: cities[Math.floor(Math.random() * cities.length)],
          product: randomProduct.title,
          time: language === 'FR' ? timesFR[randomIndex] : timesAR[randomIndex],
        });
      }
      setShowToast(true);
      // playSubtleChime();
      setTimeout(() => setShowToast(false), 5500);
    };

    const initial = setTimeout(triggerToast, 5000);
    const interval = setInterval(triggerToast, 20000);
    return () => { clearTimeout(initial); clearInterval(interval); };
  }, [language, recentOrders, products]);

  const isRTL = language === 'AR';

  return (
    <div
      className="page-entry-animate min-h-screen bg-background text-foreground flex flex-col pb-20 md:pb-0"
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ direction: isRTL ? 'rtl' : 'ltr' }}
    >
      {/* Editorial Noise Overlay */}
      <div className="editorial-noise" />

      {/* Header */}
      {!hideHeader && <Header />}

      {/* Main page content */}
      <div className="flex-grow">
        {children}
      </div>

      {/* ── FLAGSHIP LUXURY FOOTER ─────────────────────────────────────── */}
      {!hideFooter && (
        <footer id="footer" className="relative overflow-hidden text-slate-100 bg-[#080F1E] border-t border-slate-800/80 font-sans select-none">
          {/* Subtle background grid & ambient light mesh */}
          <div className="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
            <div className="absolute -top-32 left-1/4 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.08)_0%,transparent_70%)]" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(14,165,233,0.06)_0%,transparent_70%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:48px_48px]" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* ── 1. VIP Newsletter & Privilege Banner Card ── */}
            <div className="pt-12 lg:pt-16 pb-12 border-b border-slate-800/80">
              <div className="bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-emerald-950/40 border border-slate-800 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl relative overflow-hidden backdrop-blur-xl flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="space-y-2 text-center lg:text-left max-w-xl" style={{ textAlign: isRTL ? 'right' : undefined }}>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-widest rounded-full">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>{language === 'AR' ? 'نصائح وعروض' : 'CONSEILS ET OFFRES'}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white font-heading tracking-tight">
                    {language === 'AR'
                      ? 'اكتشفي نصائحنا وعروضنا'
                      : 'Recevez nos conseils et nos offres'}
                  </h3>
                  <p className="text-xs text-slate-400 font-normal leading-relaxed">
                    {language === 'AR'
                      ? 'اشتركي لتصلك نصائح العناية، المستجدات والعروض الخاصة.'
                      : 'Recevez nos conseils beauté, nos nouveautés et nos offres.'}
                  </p>
                </div>

                {/* Signup Form */}
                <form onSubmit={handleNewsletterSubmit} className="w-full lg:w-auto min-w-[320px] sm:min-w-[400px]">
                  {newsletterSubscribed ? (
                    <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-2xl text-xs font-bold text-center flex items-center justify-center gap-2 shadow-inner">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{language === 'AR' ? 'تم الاشتراك بنجاح. شكراً لانضمامكِ.' : 'Merci, votre inscription est enregistrée.'}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <div className="relative flex-1">
                        <Mail className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 left-3.5 pointer-events-none" />
                        <input
                          type="email"
                          required
                          value={newsletterEmail}
                          onChange={(e) => setNewsletterEmail(e.target.value)}
                          placeholder={language === 'AR' ? 'أدخلي بريدكِ الإلكتروني...' : 'Votre adresse email...'}
                          className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition shadow-inner"
                        />
                      </div>
                      <button
                        type="submit"
                        className="py-3 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer border-0 shrink-0"
                      >
                        <span>{language === 'AR' ? 'اشتركي الآن' : 'S\'inscrire'}</span>
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  <p className="text-[10px] text-slate-500 mt-2 text-center lg:text-left">
                    🔒 {language === 'AR' ? 'بياناتكِ محمية وسرية 100%. خالية من الرسائل العشوائية.' : 'Données confidentielles protégées. Désinscription en 1 clic.'}
                  </p>
                </form>
              </div>
            </div>

            {/* ── 2. Guarantee micro-pills grid ── */}
            <div className="py-8 border-b border-slate-800/80 grid grid-cols-2 lg:grid-cols-4 gap-4 text-left" style={{ textAlign: isRTL ? 'right' : undefined }}>
              {[
                {
                  titleFr: 'Produits sélectionnés',
                  titleAr: 'منتجات مختارة',
                  descFr: 'Des marques reconnues',
                  descAr: 'من علامات تجارية معروفة',
                  icon: ShieldCheck,
                  color: 'text-emerald-400'
                },
                {
                  titleFr: 'Livraison au Maroc',
                  titleAr: 'التوصيل في المغرب',
                  descFr: 'Selon les délais indiqués à la commande',
                  descAr: 'حسب المواعيد المعروضة عند الطلب',
                  icon: Truck,
                  color: 'text-teal-400'
                },
                {
                  titleFr: 'Conseil WhatsApp',
                  titleAr: 'نصيحة عبر واتساب',
                  descFr: 'Notre équipe vous accompagne',
                  descAr: 'فريقنا يرافقك',
                  icon: MessageSquare,
                  color: 'text-cyan-400'
                },
                {
                  titleFr: 'Paiement sécurisé',
                  titleAr: 'دفع آمن',
                  descFr: 'En ligne ou à la livraison',
                  descAr: 'عبر الإنترنت أو عند التسليم',
                  icon: Lock,
                  color: 'text-amber-400'
                }
              ].map((pill, idx) => {
                const PillIcon = pill.icon;
                return (
                  <div key={idx} className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/40 border border-slate-800/60" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                    <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                      <PillIcon className={`w-4 h-4 ${pill.color}`} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white font-heading leading-tight truncate">
                        {language === 'AR' ? pill.titleAr : pill.titleFr}
                      </h4>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5 font-normal">
                        {language === 'AR' ? pill.descAr : pill.descFr}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── 3. Main 5-Column Navigation Deck ── */}
            <div className="py-14 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-12 gap-10 lg:gap-8 text-left" style={{ textAlign: isRTL ? 'right' : undefined }}>
              
              {/* Column 1: Brand Thesis & Corporate Badges (Col-span 4) */}
              <div className="lg:col-span-4 space-y-5">
                <Link href="/" className="inline-block">
                  <Image
                    src={getOptimizedImageUrl("/images/logo.png")}
                    alt="Para Officinal S.A"
                    width={150}
                    height={42}
                    className="object-contain"
                    style={{ filter: 'brightness(0) invert(1) opacity(0.92)' }}
                  />
                </Link>

                <p className="text-xs text-slate-400 leading-relaxed font-normal max-w-sm">
                  {language === 'AR'
                    ? 'متجركم للعناية بالبشرة والجمال في المغرب.'
                    : 'Votre boutique de parapharmacie et de soins beauté au Maroc.'}
                </p>

                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-slate-900 border border-slate-800 text-slate-300">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    PAIEMENT SÉCURISÉ
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-slate-900 border border-slate-800 text-slate-300">
                    <Truck className="w-3 h-3 text-teal-400" />
                    PAIEMENT À LA LIVRAISON
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-slate-900 border border-slate-800 text-slate-300">
                    <Award className="w-3 h-3 text-amber-400" />
                    BOUTIQUE EN LIGNE
                  </span>
                </div>
              </div>

              {/* Column 2: Univers & Soins (Col-span 2) */}
              <div className="lg:col-span-2 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400 font-mono">
                  {language === 'AR' ? 'عالم العناية' : 'Univers & Soins'}
                </h4>
                <ul className="space-y-2.5 text-xs text-slate-400">
                  <li>
                    <Link href="/products?category=Anti-Âge" className="hover:text-white transition-colors duration-200 block">
                      {language === 'AR' ? 'مقاومة التجاعيد والشباب' : 'Anti-Âge & Sérums'}
                    </Link>
                  </li>
                  <li>
                    <Link href="/products?category=Protection Solaire" className="hover:text-white transition-colors duration-200 block">
                      {language === 'AR' ? 'الحماية من الشمس' : 'Protection Solaire'}
                    </Link>
                  </li>
                  <li>
                    <Link href="/products?category=Anti-Taches" className="hover:text-white transition-colors duration-200 block">
                      {language === 'AR' ? 'علاج التصبغات والبقع' : 'Anti-Taches & Éclat'}
                    </Link>
                  </li>
                  <li>
                    <Link href="/products?category=Hydratation" className="hover:text-white transition-colors duration-200 block">
                      {language === 'AR' ? 'ترطيب البشرة الجافة' : 'Peaux Sensibles & Acné'}
                    </Link>
                  </li>
                  <li>
                    <Link href="/products" className="hover:text-white transition-colors duration-200 block">
                      {language === 'AR' ? 'العناية بالشعر والجسم' : 'Soins Corps & Cheveux'}
                    </Link>
                  </li>
                  <li>
                    <Link href="/products" className="text-emerald-400 hover:text-emerald-300 font-bold block pt-1">
                      {language === 'AR' ? 'جميع الكتالوج →' : 'Tous nos Soins →'}
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 3: Portails & Services (Col-span 2) */}
              <div className="lg:col-span-2 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-teal-400 font-mono">
                  {language === 'AR' ? 'الخدمات والبوابات' : 'Services Client'}
                </h4>
                <ul className="space-y-2.5 text-xs text-slate-400">
                  <li>
                    <Link href="/suivi-commande" className="hover:text-white transition-colors duration-200 flex items-center gap-2 font-semibold text-slate-200">
                      <Package className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{language === 'AR' ? 'تتبع طلبكِ المباشر' : 'Suivi de Commande'}</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/customer" className="hover:text-white transition-colors duration-200 flex items-center gap-2">
                      <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{language === 'AR' ? 'حسابي ونادي المكافآت' : 'Espace VIP & Wallet'}</span>
                    </Link>
                  </li>
                  <li>
                    <button onClick={() => setDiagnosticOpen(true)} className="hover:text-white transition-colors duration-200 text-left cursor-pointer bg-transparent border-0 p-0 text-slate-400 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                      <span>{language === 'AR' ? 'تشخيص البشرة الذكي' : 'Dermo-Diagnostic IA'}</span>
                    </button>
                  </li>
                  <li>
                    <Link href="/a-propos" className="hover:text-white transition-colors duration-200 flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{language === 'AR' ? 'من نحن وعن الصيدلية' : 'À propos de nous'}</span>
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 4: Politiques Légales (Col-span 2) */}
              <div className="lg:col-span-2 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 font-mono">
                  {language === 'AR' ? 'السياسات والقانون' : 'Politiques'}
                </h4>
                <ul className="space-y-2.5 text-xs text-slate-400">
                  <li>
                    <Link href="/politiques/conditions-vente" className="hover:text-white transition-colors duration-200 block">
                      {language === 'AR' ? 'الشروط العامة للبيع' : 'Conditions de Vente'}
                    </Link>
                  </li>
                  <li>
                    <Link href="/politiques/confidentialite" className="hover:text-white transition-colors duration-200 block">
                      {language === 'AR' ? 'سياسة الخصوصية' : 'Confidentialité & SSL'}
                    </Link>
                  </li>
                  <li>
                    <Link href="/politiques/retours-reclamations" className="hover:text-white transition-colors duration-200 block">
                      {language === 'AR' ? 'الإرجاع والشكاوى' : 'Retours & Réclamations'}
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 5: Conciergerie Directe (Col-span 2) */}
              <div className="lg:col-span-2 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400 font-mono">
                  {language === 'AR' ? 'التواصل المباشر' : 'Conciergerie'}
                </h4>
                <div className="space-y-3 text-xs">
                  <a
                    href={`https://wa.me/${settings.storeWhatsApp || '212660808080'}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition flex items-center gap-2.5 group font-mono font-bold"
                  >
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                    </span>
                    <span className="text-[11px] uppercase tracking-wider">{settings.storePhone || '+212 6 60 80 80 80'}</span>
                  </a>

                  <p className="text-[11px] text-slate-400 leading-relaxed font-normal">
                    {language === 'AR' ? 'من الإثنين إلى السبت: 09:00 – 18:00' : 'Du lundi au samedi: 09h00 – 18h00 (GMT+1)'}
                  </p>

                  <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                    <p className="font-bold text-slate-300">Maarif, Casablanca</p>
                    <p className="text-[10px] text-slate-500">Bd Al Massira Al Khadra, Maroc</p>
                  </div>
                </div>
              </div>

            </div>

            {/* ── 4. Bottom Divider & Copyright / Payment Seals ── */}
            <div className="pt-8 pb-12 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
              <p className="text-[11px] text-slate-400 tracking-wide font-normal">
                © {new Date().getFullYear()} <strong className="text-white font-bold">PARA OFFICINAL S.A.</strong> — Tous droits réservés.
              </p>

              {/* Payment Methods Badges */}
              <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400 flex-wrap justify-center">
                <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 font-bold inline-flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-emerald-400" /> Cash sur Livraison (COD)
                </span>
                <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 font-bold inline-flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-teal-400" /> Carte Bancaire CMI
                </span>
                <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 font-bold inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Chiffrement SSL 256-bit
                </span>
              </div>
            </div>

          </div>
        </footer>
      )}

      {/* ── Mobile Bottom Navigation ─────────────────────────────────── */}
      {mounted && (
        <nav
          style={{ paddingBottom: 'calc(8px + env(safe-area-inset-bottom, 0px))' }}
          className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] z-40 flex items-center justify-around pt-2.5 px-3"
        >
          {/* Home Link */}
          <button
            onClick={() => {
              if (pathname === '/') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                router.push('/');
              }
              setActiveMobileTab('home');
            }}
            aria-current={activeMobileTab === 'home' ? 'page' : undefined}
            className={`flex flex-col items-center justify-center gap-1.5 w-full py-1 transition-all duration-300 ${
              activeMobileTab === 'home' 
                ? 'text-primary' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <HomeIcon className={`w-5 h-5 transition-transform duration-300 ${activeMobileTab === 'home' ? 'scale-110' : ''}`} />
            <span className={`text-[10px] tracking-wider uppercase font-heading ${activeMobileTab === 'home' ? 'font-black text-primary-dark' : 'font-semibold text-slate-400'}`}>
              {language === 'AR' ? 'الرئيسية' : 'Accueil'}
            </span>
          </button>

          {/* Boutique Link */}
          <button
            onClick={() => {
              if (pathname === '/') {
                const el = document.getElementById('boutique-grid');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              } else {
                router.push('/products');
              }
              setActiveMobileTab('boutique');
            }}
            aria-current={activeMobileTab === 'boutique' ? 'page' : undefined}
            className={`flex flex-col items-center justify-center gap-1.5 w-full py-1 transition-all duration-300 ${
              activeMobileTab === 'boutique' 
                ? 'text-primary' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Store className={`w-5 h-5 transition-transform duration-300 ${activeMobileTab === 'boutique' ? 'scale-110' : ''}`} />
            <span className={`text-[10px] tracking-wider uppercase font-heading ${activeMobileTab === 'boutique' ? 'font-black text-primary-dark' : 'font-semibold text-slate-400'}`}>
              {language === 'AR' ? 'المتجر' : 'Boutique'}
            </span>
          </button>

          {/* Diagnostic Link */}
          <button
            onClick={() => {
              setDiagnosticOpen(true);
              setActiveMobileTab('diagnostic');
            }}
            aria-current={activeMobileTab === 'diagnostic' ? 'page' : undefined}
            className={`flex flex-col items-center justify-center gap-1.5 w-full py-1 transition-all duration-300 ${
              activeMobileTab === 'diagnostic' 
                ? 'text-primary' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Sparkles className={`w-5 h-5 transition-transform duration-300 ${activeMobileTab === 'diagnostic' ? 'scale-110 text-accent animate-pulse' : ''}`} />
            <span className={`text-[10px] tracking-wider uppercase font-heading ${activeMobileTab === 'diagnostic' ? 'font-black text-primary-dark' : 'font-semibold text-slate-400'}`}>
              {language === 'AR' ? 'تشخيص' : 'Diagnostic'}
            </span>
          </button>

          {/* Cart Link */}
          <button
            onClick={() => {
              setIsCartOpen(true);
              setActiveMobileTab('cart');
            }}
            aria-current={activeMobileTab === 'cart' ? 'page' : undefined}
            className={`flex flex-col items-center justify-center gap-1.5 w-full py-1 transition-all duration-300 relative ${
              activeMobileTab === 'cart' 
                ? 'text-primary' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className="relative">
              <ShoppingBag className={`w-5 h-5 transition-transform duration-300 ${activeMobileTab === 'cart' ? 'scale-110' : ''}`} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-primary text-white text-[8px] font-black rounded-full flex items-center justify-center border border-white">
                  {cartCount}
                </span>
              )}
            </div>
            <span className={`text-[10px] tracking-wider uppercase font-heading ${activeMobileTab === 'cart' ? 'font-black text-primary-dark' : 'font-semibold text-slate-400'}`}>
              {language === 'AR' ? 'السلة' : 'Panier'}
            </span>
          </button>
        </nav>
      )}

      {/* Drawers & Modals */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onSelectProduct={(p) => { setSelectedProduct(p); setIsCartOpen(false); }}
        onOpenScratchCard={() => { setScratchCardOpen(true); setIsCartOpen(false); }}
      />
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setWishlistOpen(false)}
        onSelectProduct={(p) => setSelectedProduct(p)}
      />
      <SkinDiagnostic isOpen={isDiagnosticOpen} onClose={() => setDiagnosticOpen(false)} onOpenCart={() => setIsCartOpen(true)} />
      <ScratchCard isOpen={isScratchCardOpen} onClose={() => setScratchCardOpen(false)} />
      <QuickViewModal product={selectedProduct} isOpen={selectedProduct !== null} onClose={() => setSelectedProduct(null)} />
      
      <RoutineBundleDrawer isOpen={isBundleDrawerOpen} onClose={() => setIsBundleDrawerOpen(false)} />

      <CartBubbleCoordinator />
      <OrderSuccessModal />

      {/* FOMO Toast (hidden when drawers or quiz modals are active to prevent mobile overlaps) */}
      {showToast && !isCartOpen && !isDiagnosticOpen && !isScratchCardOpen && !selectedProduct && (
        <div className="fixed bottom-[72px] md:bottom-6 left-3 md:left-8 right-auto z-50 bg-white/95 backdrop-blur-md border border-slate-200/50 shadow-[0_15px_35px_rgba(26,37,93,0.08)] py-2.5 px-3.5 md:py-3.5 md:px-5 rounded-[12px] flex items-center gap-3 md:gap-4 w-[280px] md:w-auto max-w-[calc(100vw-24px)] md:max-w-[340px] animate-slide-in select-none">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-[8px] md:rounded-[10px] bg-primary/5 border border-primary/10 text-primary flex items-center justify-center shrink-0">
            <ShoppingBag className="w-3.5 h-3.5 md:w-4 md:h-4 stroke-[2.25]" />
          </div>
          <div className="flex-1 min-w-0 text-[10.5px] md:text-[11.5px] leading-relaxed">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <span className="font-black text-[8.5px] md:text-[9px] tracking-widest uppercase text-slate-500 leading-none">
                {t('cro_recent_activity_badge')}
              </span>
            </div>
            <p className="text-slate-700 font-medium mt-1 line-clamp-2 font-sans">
              {t('cro_toast_text_new')
                .replace('{name}', toastData.name)
                .replace('{city}', toastData.city)
                .replace('{time}', toastData.time)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
