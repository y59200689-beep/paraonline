'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useUi } from '@/context/UiContext';
import { useLoyalty } from '@/context/LoyaltyContext';
import { usePathname, useRouter } from 'next/navigation';
import { Product } from '@/lib/data';
import { ShoppingBag, Home as HomeIcon, Store, Sparkles } from 'lucide-react';

// Component Imports
import dynamic from 'next/dynamic';

// Component Imports
import { Header } from './Header';
import { StorefrontFooter } from './StorefrontFooter';
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
  hideMobileNav?: boolean;
}

export const ShopShell: React.FC<ShopShellProps> = ({ children, hideHeader, hideFooter, hideMobileNav = false }) => {
  const { t, language } = useTranslation();
  const { clientUser } = useLoyalty();
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

  const openCart = () => {
    setWishlistOpen(false);
    setDiagnosticOpen(false);
    setScratchCardOpen(false);
    setSelectedProduct(null);
    setIsCartOpen(true);
  };

  useEffect(() => {
    setMounted(true);
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

  const isRTL = language === 'AR';

  return (
    <div
      className={`public-page page-entry-animate min-h-screen bg-background text-foreground flex flex-col ${pathname === '/' ? 'home-storefront [&_[data-product-rating]]:hidden' : ''} ${hideMobileNav ? 'pb-0' : 'pb-[calc(5rem+env(safe-area-inset-bottom,0px))] lg:pb-0'}`}
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ direction: isRTL ? 'rtl' : 'ltr' }}
    >
      <a href="#main-content" className="public-skip-link">
        {language === 'AR' ? 'انتقل إلى المحتوى الرئيسي' : 'Aller au contenu principal'}
      </a>
      {/* Editorial Noise Overlay */}
      <div className="editorial-noise" />

      {/* Header */}
      {!hideHeader && <Header />}

      {/* Main page content */}
      <div id="main-content" tabIndex={-1} className="flex-grow scroll-mt-32">
        {children}
      </div>

      {/* ── FLAGSHIP LUXURY FOOTER ─────────────────────────────────────── */}
      {!hideFooter && (
        <StorefrontFooter onDiagnostic={() => setDiagnosticOpen(true)} />
      )}

      {/* ── Mobile Bottom Navigation ─────────────────────────────────── */}
      {mounted && !hideMobileNav && (
        <nav
          style={{ paddingBottom: 'calc(8px + env(safe-area-inset-bottom, 0px))' }}
          className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] z-40 flex items-center justify-around pt-2.5 px-3"
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
            <span className={`text-[10px] tracking-wider uppercase font-heading ${activeMobileTab === 'home' ? 'font-black text-primary-dark' : 'font-semibold text-slate-600'}`}>
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
            <span className={`text-[10px] tracking-wider uppercase font-heading ${activeMobileTab === 'boutique' ? 'font-black text-primary-dark' : 'font-semibold text-slate-600'}`}>
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
            <span className={`text-[10px] tracking-wider uppercase font-heading ${activeMobileTab === 'diagnostic' ? 'font-black text-primary-dark' : 'font-semibold text-slate-600'}`}>
              {language === 'AR' ? 'تشخيص' : 'Diagnostic'}
            </span>
          </button>

          {/* Cart Link */}
          <button
            onClick={() => {
              openCart();
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
            <span className={`text-[10px] tracking-wider uppercase font-heading ${activeMobileTab === 'cart' ? 'font-black text-primary-dark' : 'font-semibold text-slate-600'}`}>
              {language === 'AR' ? 'السلة' : 'Panier'}
            </span>
          </button>
        </nav>
      )}

      {/* Drawers & Modals */}
      {isCartOpen && (
        <CartDrawer
          isOpen
          onClose={() => setIsCartOpen(false)}
          onSelectProduct={(p) => { setSelectedProduct(p); setIsCartOpen(false); }}
          onOpenScratchCard={() => { setScratchCardOpen(true); setIsCartOpen(false); }}
        />
      )}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setWishlistOpen(false)}
        onSelectProduct={(p) => setSelectedProduct(p)}
      />
      <SkinDiagnostic
        isOpen={isDiagnosticOpen}
        onClose={() => setDiagnosticOpen(false)}
        onOpenCart={openCart}
        experience="client"
      />
      <ScratchCard isOpen={isScratchCardOpen} onClose={() => setScratchCardOpen(false)} />
      <QuickViewModal product={selectedProduct} isOpen={selectedProduct !== null} onClose={() => setSelectedProduct(null)} />
      
      <RoutineBundleDrawer isOpen={isBundleDrawerOpen} onClose={() => setIsBundleDrawerOpen(false)} />

      <CartBubbleCoordinator />
      <OrderSuccessModal />

    </div>
  );
};
