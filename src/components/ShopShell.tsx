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
import { ShoppingBag, Home as HomeIcon, Store, Sparkles } from 'lucide-react';
import Image from 'next/image';

// Component Imports
import dynamic from 'next/dynamic';

// Component Imports
import { Header } from './Header';
import { CartBubbleCoordinator } from './CartBubbleCoordinator';

const CartDrawer = dynamic(() => import('./CartDrawer').then(m => m.CartDrawer), { ssr: false });
const WishlistDrawer = dynamic(() => import('./WishlistDrawer').then(m => m.WishlistDrawer), { ssr: false });
const SkinDiagnostic = dynamic(() => import('./SkinDiagnostic').then(m => m.SkinDiagnostic), { ssr: false });
const ScratchCard = dynamic(() => import('./ScratchCard').then(m => m.ScratchCard), { ssr: false });
const QuickViewModal = dynamic(() => import('./QuickViewModal').then(m => m.QuickViewModal), { ssr: false });
const RoutineBundleDrawer = dynamic(() => import('./RoutineBundleDrawer').then(m => m.RoutineBundleDrawer), { ssr: false });
const RoutineBuilderDrawer = dynamic(() => import('./RoutineBuilderDrawer').then(m => m.RoutineBuilderDrawer), { ssr: false });
const CompareModal = dynamic(() => import('./CompareModal').then(m => m.CompareModal), { ssr: false });

interface ShopShellProps {
  children: React.ReactNode;
}

export const ShopShell: React.FC<ShopShellProps> = ({ children }) => {
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
    isRoutineBuilderOpen, setRoutineBuilderOpen,
    selectedProduct, setSelectedProduct
  } = useUi();

  const [isBundleDrawerOpen, setIsBundleDrawerOpen] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState('home');

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
      playSubtleChime();
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
      {/* Header */}
      <Header />

      {/* Main page content */}
      <div className="flex-grow">
        {children}
      </div>

      {/* Footer */}
      <footer className="relative overflow-hidden text-white" style={{ background: 'linear-gradient(135deg, #080f1e 0%, #0f1f3d 40%, #111a3a 100%)' }}>
        {/* Subtle background grid + orbs */}
        <div className="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
          <div className="absolute -top-20 left-1/4 w-[520px] h-[520px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(37,115,163,0.09) 0%, transparent 70%)' }} />
          <div className="absolute -bottom-10 right-1/5 w-[400px] h-[400px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(26,37,93,0.15) 0%, transparent 70%)' }} />
          <div className="absolute inset-0"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16 stagger-children reveal-on-scroll">
            {/* Brand column */}
            <div className="md:col-span-4 flex flex-col gap-5">
              <Image src="/images/logo.png" alt="Para Officinal S.A"
                width={140}
                height={40}
                className="object-contain"
                style={{ filter: 'brightness(0) invert(1) opacity(0.88)' }} />
              <p className="text-[13px] text-slate-400 leading-relaxed max-w-xs">
                Leader officiel de la parapharmacie clinique et des soins dermatologiques au Maroc. Formulé pour révéler la vitalité de votre peau.
              </p>
              <div className="flex gap-2 flex-wrap mt-1">
                <span className="text-[10px] font-semibold border border-white/10 bg-white/[0.04] px-3 py-1.5 text-slate-400 rounded-full tracking-widest uppercase">CMI CERTIFIED</span>
                <span className="text-[10px] font-semibold border border-white/10 bg-white/[0.04] px-3 py-1.5 text-slate-400 rounded-full tracking-widest uppercase">COD MOROCCO</span>
              </div>
            </div>

            {/* Politiques */}
            <div className="md:col-span-2 flex flex-col gap-4">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">Politiques</span>
              <ul className="flex flex-col gap-3">
                <li>
                  <Link href="/politiques/conditions-vente" className="text-[13px] text-slate-400 hover:text-white transition-colors duration-300 anim-underline">
                    {language === 'AR' ? 'الشروط العامة للبيع' : 'Conditions de Vente'}
                  </Link>
                </li>
                <li>
                  <Link href="/politiques/confidentialite" className="text-[13px] text-slate-400 hover:text-white transition-colors duration-300 anim-underline">
                    {language === 'AR' ? 'سياسة الخصوصية' : 'Confidentialité'}
                  </Link>
                </li>
                <li>
                  <Link href="/politiques/retours-reclamations" className="text-[13px] text-slate-400 hover:text-white transition-colors duration-300 anim-underline">
                    {language === 'AR' ? 'الإرجاع والشكاوى' : 'Retours & Réclamations'}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Portails */}
            <div className="md:col-span-2 flex flex-col gap-4">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">Portails</span>
              <ul className="flex flex-col gap-3">
                <li>
                  <Link href="/customer" className="text-[13px] text-emerald-400 hover:text-white transition-colors duration-300 anim-underline">
                    Suivi Commande
                  </Link>
                </li>
                <li>
                  <Link href="/" className="text-[13px] text-slate-400 hover:text-white transition-colors duration-300 anim-underline">
                    Notre Boutique
                  </Link>
                </li>
                <li>
                  <Link href="/products" className="text-[13px] text-slate-400 hover:text-white transition-colors duration-300 anim-underline">
                    Tous les Produits
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div className="md:col-span-4 flex flex-col gap-4">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">Contact</span>
              <a
                href={`https://wa.me/${settings.storeWhatsApp || '212660808080'}`}
                className="group flex items-center gap-3 text-[13px] text-slate-400 hover:text-white transition-colors duration-300 w-fit"
              >
                <span className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-emerald-500/10 group-hover:border-emerald-400/30 transition-all duration-300 shrink-0">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-emerald-400">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </span>
                {settings.storePhone}
              </a>
              <p className="text-[12px] text-slate-400 leading-relaxed">
                Du lundi au samedi,<br />09h00 – 18h00 (GMT+1)
              </p>
            </div>
          </div>

          <div className="w-full h-px mb-8" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08) 30%, rgba(255,255,255,0.08) 70%, transparent)' }} />

          <div className="flex flex-col md:flex-row items-center justify-center text-center gap-4">
            <span className="text-[11px] text-slate-400 tracking-wider">
              © {new Date().getFullYear()} PARA OFFICINAL S.A. — Tous droits réservés.
            </span>
          </div>
        </div>
      </footer>

      {/* ── Mobile Bottom Navigation ─────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-100 shadow-lg z-40 flex items-center justify-around py-2 px-3 pb-safe">
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
      <RoutineBuilderDrawer isOpen={isRoutineBuilderOpen} onClose={() => setRoutineBuilderOpen(false)} />

      <CompareModal />
      <CartBubbleCoordinator />

      {/* FOMO Toast */}
      {showToast && (
        <div className="fixed bottom-24 md:bottom-6 left-6 right-6 md:right-auto md:left-8 z-50 bg-white/95 backdrop-blur-md border border-slate-200/50 shadow-[0_15px_35px_rgba(26,37,93,0.08)] py-3.5 px-5 rounded-[12px] flex items-center gap-4 max-w-[340px] animate-slide-in select-none">
          <div className="w-10 h-10 rounded-[10px] bg-primary/5 border border-primary/10 text-primary flex items-center justify-center shrink-0">
            <ShoppingBag className="w-4 h-4 stroke-[2.25]" />
          </div>
          <div className="flex-1 min-w-0 text-[11.5px] leading-relaxed">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <span className="font-black text-[9px] tracking-widest uppercase text-slate-500 leading-none">
                {t('cro_recent_activity_badge')}
              </span>
            </div>
            <p className="text-slate-700 font-medium mt-1 break-words font-sans">
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
