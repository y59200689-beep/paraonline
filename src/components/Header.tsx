
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { Product } from '@/lib/data';
import { useSettings } from '@/context/SettingsContext';
import { useWishlist } from '@/context/WishlistContext';
import { useLoyalty } from '@/context/LoyaltyContext';
import { BeautyWalletDrawer } from './BeautyWalletDrawer';
import { useUi } from '@/context/UiContext';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

// Sub-components
import { AnnouncementBar } from './Header/AnnouncementBar';
import { TopBar } from './Header/TopBar';
import { SearchPill } from './Header/SearchPill';
import { DesktopActions } from './Header/DesktopActions';
import { MobileHeader } from './Header/MobileHeader';
import headerStyles from './Header/Header.module.css';
import { buildCatalogPageHref, normalizeCatalogRouteState } from '@/lib/catalog-pagination';
import { useLiveProductSearch } from '@/hooks/useLiveProductSearch';

const LANGUAGES = [
  { id: 'FR', label: 'Français', flag: '🇫🇷' },
  { id: 'AR', label: 'العربية',  flag: '🇲🇦' },
];

export const Header: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { t, language, toggleLanguage } = useTranslation();
  const { cart, addToCart, subtotal, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const { settings } = useSettings();
  const { points, clientUser } = useLoyalty();
  const {
    setWishlistOpen,
    setDiagnosticOpen,
    setScratchCardOpen,
    setSelectedProduct,
    setActiveGlossaryKey,
    cartJiggleTrigger,
    triggerFlyToCart,
  } = useUi();

  const isRTL = language === 'AR';

  // ── Local UI state ─────────────────────────────────────────────────────────
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [matchedIngredients, setMatchedIngredients] = useState<string[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const { products: searchResults, searching: searchLoading, error: searchError } = useLiveProductSearch(searchQuery, selectedCategoryId, showSearch);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [hoveredCategoryId, setHoveredCategoryId] = useState<string | null>(null);
  const [isJiggling, setIsJiggling] = useState(false);
  const [isBumping, setIsBumping] = useState(false);

  // Dropdown animated close delay
  const dropdownCloseMs = 150;
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [currencyClosing, setCurrencyClosing] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [langClosing, setLangClosing] = useState(false);

  const openLang = () => { setLangClosing(false); setShowLangDropdown(true); };
  const closeLang = () => {
    setLangClosing(true);
    setTimeout(() => { setShowLangDropdown(false); setLangClosing(false); }, dropdownCloseMs);
  };
  const openCurrency = () => { setCurrencyClosing(false); setShowCurrencyDropdown(true); };
  const closeCurrency = () => {
    setCurrencyClosing(true);
    setTimeout(() => { setShowCurrencyDropdown(false); setCurrencyClosing(false); }, dropdownCloseMs);
  };

  const { selectedCurrency, setSelectedCurrency, currentCurrency, convertPrice, isLoading: ratesLoading } = useCurrency();

  // ── Refs ───────────────────────────────────────────────────────────────────
  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);
  const currencyRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(0);

  useEffect(() => {
    if (pathname !== '/products') return;
    setSelectedCategoryId(new URLSearchParams(window.location.search).get('category') || 'all');
  }, [pathname]);

  const currentLang = LANGUAGES.find((l) => l.id === language) || LANGUAGES[0];
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const openCart = () => {
    setWishlistOpen(false);
    setDiagnosticOpen(false);
    setScratchCardOpen(false);
    setSelectedProduct(null);
    setIsWalletOpen(false);
    setIsCartOpen(true);
  };

  const openWallet = () => {
    setWishlistOpen(false);
    setDiagnosticOpen(false);
    setScratchCardOpen(false);
    setSelectedProduct(null);
    setIsCartOpen(false);
    setIsWalletOpen(true);
  };

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (cartJiggleTrigger > 0) setIsJiggling(true);
  }, [cartJiggleTrigger]);

  useEffect(() => {
    if (!isJiggling) return;
    const timer = setTimeout(() => setIsJiggling(false), 450);
    return () => clearTimeout(timer);
  }, [isJiggling]);

  useEffect(() => {
    if (cartCount > prevCountRef.current) {
      setIsBumping(true);
      const timer = setTimeout(() => setIsBumping(false), 300);
      return () => clearTimeout(timer);
    }
    prevCountRef.current = cartCount;
  }, [cartCount]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Ingredient suggestions are local; product results update on every keystroke.
  useEffect(() => {
    if (!showSearch || !searchQuery.trim()) { setMatchedIngredients([]); return; }
    let active = true;
    const q = searchQuery.toLowerCase();
    void import('@/lib/data').then(({ INGREDIENTS_GLOSSARY }) => {
      if (!active) return;
      setMatchedIngredients(Object.keys(INGREDIENTS_GLOSSARY).filter(key => {
        const ingredient = INGREDIENTS_GLOSSARY[key];
        return key.toLowerCase().includes(q) || ingredient.name_fr.toLowerCase().includes(q) || ingredient.name_ar.toLowerCase().includes(q);
      }));
    });
    return () => { active = false; };
  }, [searchQuery, showSearch]);

  // Click-outside handler
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      const clickedOutsideDesktop = !desktopSearchRef.current || !desktopSearchRef.current.contains(e.target as Node);
      const clickedOutsideMobile = !mobileSearchRef.current || !mobileSearchRef.current.contains(e.target as Node);
      if (clickedOutsideDesktop && clickedOutsideMobile) setShowSearch(false);
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) setShowCategoryDropdown(false);
      if (currencyRef.current && !currencyRef.current.contains(e.target as Node)) closeCurrency();
      if (langRef.current && !langRef.current.contains(e.target as Node)) closeLang();
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);

  }, []);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSuggestionClick = (product: Product) => {
    setSearchQuery('');
    setShowSearch(false);
    router.push(`/products/${product.id}`);
  };

  const handleIngredientClick = (key: string) => {
    setSearchQuery('');
    setShowSearch(false);
    setActiveGlossaryKey(key);
    setTimeout(() => {
      document.getElementById('ingredient-dictionary')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
  };

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    triggerFlyToCart(product.image, rect.left + rect.width / 2, rect.top + rect.height / 2);
    addToCart(product, 1);
    setSearchQuery('');
    setShowSearch(false);
  };

  const handleSearchSubmit = () => {
    const state = normalizeCatalogRouteState({ search: searchQuery, category: selectedCategoryId });
    setShowSearch(false);
    setShowCategoryDropdown(false);
    router.push(buildCatalogPageHref(1, state));
  };

  // Shared search props used by both desktop and mobile search
  const sharedSearchProps = {
    searchQuery,
    setSearchQuery,
    showSearch,
    setShowSearch: (open: boolean) => {
      if (open) setShowCategoryDropdown(false);
      setShowSearch(open);
    },
    searchResults,
    searchLoading,
    searchError,
    matchedIngredients,
    convertPrice,
    onSearchSubmit: handleSearchSubmit,
    onSuggestionClick: handleSuggestionClick,
    onIngredientClick: handleIngredientClick,
    onQuickAdd: handleQuickAdd,
    onOpenDiagnostic: () => { setDiagnosticOpen(true); setShowSearch(false); },
    language,
    isRTL,
  };

  return (
    <>
      {/* Announcement Bar */}
      <AnnouncementBar
        message={language === 'FR' ? settings.announcementFr : settings.announcementAr}
      />

      {/* Utility Top Bar */}
      <TopBar
        language={language}
        currentLang={currentLang}
        languages={LANGUAGES}
        showLangDropdown={showLangDropdown}
        langClosing={langClosing}
        onOpenLang={openLang}
        onCloseLang={closeLang}
        onToggleLanguage={toggleLanguage}
        langRef={langRef as React.RefObject<HTMLDivElement>}
        selectedCurrency={selectedCurrency}
        currentCurrency={currentCurrency}
        showCurrencyDropdown={showCurrencyDropdown}
        currencyClosing={currencyClosing}
        onOpenCurrency={openCurrency}
        onCloseCurrency={closeCurrency}
        onSetCurrency={setSelectedCurrency}
        currencyRef={currencyRef as React.RefObject<HTMLDivElement>}
        isRTL={isRTL}
      />

      {/* Main sticky nav */}
      <header
        className={`sticky top-0 z-40 transition-[padding] duration-300 ease-in-out border-b mb-0 bg-white border-slate-200/40 shadow-glass ${
          isScrolled ? 'scrolled' : ''
        }`}
        style={{
          paddingTop: isScrolled ? '12px' : 'clamp(18px, 1.95vw, 28px)',
          paddingBottom: isScrolled ? '12px' : 'clamp(18px, 1.95vw, 28px)',
        }}
      >
        <div
          className={headerStyles.main}
        >
          {/* Desktop grid */}
          <div className={headerStyles.desktop}>
            {/* Logo */}
            <div className="flex items-center shrink-0">
              <Link href="/" className="flex items-center group active:scale-98 transition-transform duration-300">
                <Image
                  src="/para-divine-logo.png"
                  alt="Para Divine"
                  width={1920}
                  height={522}
                  loading="eager"
                  className={headerStyles.logo}
                />
              </Link>
            </div>

            {/* Search pill */}
            <SearchPill
              searchRef={desktopSearchRef}
              categoryRef={categoryRef}
              selectedCategoryId={selectedCategoryId}
              setSelectedCategoryId={(id) => {
                setSelectedCategoryId(id);
                setSearchQuery('');
                setShowSearch(false);
                router.push(id === 'all' ? '/products' : `/products?category=${encodeURIComponent(id)}`);
              }}
              showCategoryDropdown={showCategoryDropdown}
              setShowCategoryDropdown={(open) => {
                if (open) setShowSearch(false);
                setShowCategoryDropdown(open);
              }}
              hoveredCategoryId={hoveredCategoryId}
              setHoveredCategoryId={setHoveredCategoryId}
              {...sharedSearchProps}
            />

            {/* Desktop action icons */}
            <DesktopActions
              language={language}
              isRTL={isRTL}
              cartCount={cartCount}
              subtotal={subtotal}
              isBumping={isBumping}
              isJiggling={isJiggling}
              wishlistCount={wishlistCount}
              points={clientUser ? points : 0}
              accountName={clientUser?.name?.trim() || undefined}
              ratesLoading={ratesLoading}
              convertPrice={convertPrice}
              onCartOpen={openCart}
              onWalletOpen={openWallet}
              onWishlistOpen={() => {
                // The portal tab is initialized from the URL. A document
                // navigation keeps this reliable even when the header is
                // clicked while the customer portal is already mounted.
                router.push('/customer?tab=favoris');
              }}
            />
          </div>

          {/* Mobile layout */}
          <MobileHeader
            cartCount={cartCount}
            isBumping={isBumping}
            searchRef={mobileSearchRef}
            onCartOpen={openCart}
            onToggleLanguage={toggleLanguage}
            t={t}
            pathname={pathname}
            {...sharedSearchProps}
          />

          {settings.headerNav?.length ? (
            <nav aria-label={language === 'AR' ? 'التنقل الرئيسي' : 'Navigation principale'} className="hidden lg:flex items-center gap-2 mt-4 pt-3 border-t border-slate-200/60">
              {settings.headerNav.map((item, index) => (
                <Link key={item.id ?? `${item.href}-${index}`} href={item.href} className="px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors">
                  {language === 'AR' ? (item.label_ar || item.label_fr) : item.label_fr}
                </Link>
              ))}
            </nav>
          ) : null}
        </div>
      </header>



      {/* Beauty Wallet Drawer */}
      <BeautyWalletDrawer isOpen={isWalletOpen} onClose={() => setIsWalletOpen(false)} />
    </>
  );
};
