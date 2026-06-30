/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { Product } from '@/lib/data';
import { useSettings } from '@/context/SettingsContext';
import { useCompare } from '@/context/CompareContext';
import { useWishlist } from '@/context/WishlistContext';
import { useLoyalty } from '@/context/LoyaltyContext';
import { BeautyWalletDrawer } from './BeautyWalletDrawer';
import { useUi } from '@/context/UiContext';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Sub-components
import { AnnouncementBar } from './Header/AnnouncementBar';
import { TopBar } from './Header/TopBar';
import { SearchPill } from './Header/SearchPill';
import { DesktopActions } from './Header/DesktopActions';
import { MobileHeader } from './Header/MobileHeader';
import { MobileBottomNav } from './Header/MobileBottomNav';

const LANGUAGES = [
  { id: 'FR', label: 'Français', flag: '🇫🇷' },
  { id: 'AR', label: 'عربي',     flag: '🇲🇦' },
];

export const Header: React.FC = () => {
  const router = useRouter();
  const { t, language, toggleLanguage } = useTranslation();
  const { compareProducts, setIsOpenModal } = useCompare();
  const { cart, addToCart, subtotal, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const { settings } = useSettings();
  const { points } = useLoyalty();
  const {
    setWishlistOpen,
    setDiagnosticOpen,
    setSelectedProduct,
    setRoutineBuilderOpen,
    setActiveGlossaryKey,
    cartJiggleTrigger,
    triggerFlyToCart,
  } = useUi();

  const isRTL = language === 'AR';

  // ── Local UI state ─────────────────────────────────────────────────────────
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [matchedIngredients, setMatchedIngredients] = useState<string[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
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
  const searchRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);
  const currencyRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(0);

  const currentLang = LANGUAGES.find((l) => l.id === language) || LANGUAGES[0];
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

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

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setMatchedIngredients([]);
      let active = true;
      const timer = setTimeout(async () => {
        try {
          const params = new URLSearchParams({ search: '', limit: '24', category: selectedCategoryId });
          const res = await fetch(`/api/products?${params}`);
          const data = await res.json();
          if (active && data.success) setSearchResults(data.products || []);
        } catch (err) {
          console.error('Default products fetch failed:', err);
        }
      }, 50);
      return () => { active = false; clearTimeout(timer); };
    }
    const q = searchQuery.toLowerCase();

    import('@/lib/data').then(({ INGREDIENTS_GLOSSARY }) => {
      const matched = Object.keys(INGREDIENTS_GLOSSARY).filter((key) => {
        const ing = INGREDIENTS_GLOSSARY[key];
        return (
          key.toLowerCase().includes(q) ||
          ing.name_fr.toLowerCase().includes(q) ||
          ing.name_ar.toLowerCase().includes(q)
        );
      });
      setMatchedIngredients(matched);
    });

    let active = true;
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ search: searchQuery, limit: '24', category: selectedCategoryId });
        const res = await fetch(`/api/products?${params}`);
        const data = await res.json();
        if (active && data.success) setSearchResults(data.products || []);
      } catch (err) {
        console.error('Search fetch failed:', err);
      }
    }, 250);

    return () => { active = false; clearTimeout(timer); };
  }, [searchQuery, selectedCategoryId]);

  // Click-outside handler
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSearch(false);
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) setShowCategoryDropdown(false);
      if (currencyRef.current && !currencyRef.current.contains(e.target as Node)) closeCurrency();
      if (langRef.current && !langRef.current.contains(e.target as Node)) closeLang();
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
  };

  // Shared search props used by both desktop and mobile search
  const sharedSearchProps = {
    searchQuery,
    setSearchQuery,
    showSearch,
    setShowSearch,
    searchResults,
    matchedIngredients,
    convertPrice,
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
        onOpenRoutineBuilder={() => setRoutineBuilderOpen(true)}
      />

      {/* Main sticky nav */}
      <header
        className={`sticky top-0 z-40 transition-[padding] duration-300 ease-in-out border-b mb-0 bg-white/75 backdrop-blur-md border-slate-200/40 shadow-glass ${
          isScrolled ? 'scrolled' : ''
        }`}
        style={{
          paddingTop: isScrolled ? '12px' : '18px',
          paddingBottom: isScrolled ? '12px' : '18px',
        }}
      >
        <div
          className="max-w-[1400px] mx-auto px-6 md:px-[30px]"
        >
          {/* Desktop grid */}
          <div className="hidden md:grid md:grid-cols-[auto_1fr_auto] items-center gap-10">
            {/* Logo */}
            <div className="flex items-center shrink-0">
              <Link href="/" className="flex items-center group active:scale-98 transition-transform duration-300">
                <Image
                  src="/images/logo.png"
                  alt="Para Officinal S.A"
                  width={180}
                  height={48}
                  loading="eager"
                  className="object-contain"
                />
              </Link>
            </div>

            {/* Search pill */}
            <SearchPill
              searchRef={searchRef}
              categoryRef={categoryRef}
              selectedCategoryId={selectedCategoryId}
              setSelectedCategoryId={setSelectedCategoryId}
              showCategoryDropdown={showCategoryDropdown}
              setShowCategoryDropdown={setShowCategoryDropdown}
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
              compareCount={compareProducts.length}
              points={points}
              ratesLoading={ratesLoading}
              convertPrice={convertPrice}
              onCartOpen={() => setIsCartOpen(true)}
              onWalletOpen={() => setIsWalletOpen(true)}
              onWishlistOpen={() => setWishlistOpen(true)}
              onCompareOpen={() => setIsOpenModal(true)}
            />
          </div>

          {/* Mobile layout */}
          <MobileHeader
            cartCount={cartCount}
            isBumping={isBumping}
            searchRef={searchRef}
            onCartOpen={() => setIsCartOpen(true)}
            onToggleLanguage={toggleLanguage}
            t={t}
            {...sharedSearchProps}
          />
        </div>
      </header>

      {/* Mobile bottom nav */}
      <MobileBottomNav
        language={language}
        cartCount={cartCount}
        isBumping={isBumping}
        isJiggling={isJiggling}
        points={points}
        storeWhatsApp={settings.storeWhatsApp || '212660808080'}
        onCartOpen={() => setIsCartOpen(true)}
        onWalletOpen={() => setIsWalletOpen(true)}
        onDiagnosticOpen={() => setDiagnosticOpen(true)}
        t={t}
      />

      {/* Beauty Wallet Drawer */}
      <BeautyWalletDrawer isOpen={isWalletOpen} onClose={() => setIsWalletOpen(false)} />
    </>
  );
};
