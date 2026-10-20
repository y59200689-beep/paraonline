'use client';

import { useCallback } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { normalizeStoreContact } from '@/lib/site-contact';
import { DEFAULT_SETTINGS } from '@/lib/default-settings';
export { DEFAULT_SETTINGS } from '@/lib/default-settings';
import { toThemeColorVariable } from '@/lib/theme-colors';

export interface HeroCardConfig {
  tagFr: string;
  tagAr: string;
  titleFr: string;
  titleAr: string;
  descFr?: string;
  descAr?: string;
  ctaFr: string;
  ctaAr: string;
  bgImage: string;
  linkType: 'diagnostic' | 'category' | 'product';
  linkValue: string;
}

export interface DiagnosticRule {
  id: string;
  concern: 'acne' | 'spots' | 'wrinkles' | 'dryness' | 'any';
  skinType: 'oily' | 'dry' | 'mixed' | 'sensitive' | 'any';
  sunExposure: 'intense' | 'moderate' | 'low' | 'any';
  productIds: number[];
  titleFr: string;
  titleAr?: string;
  descriptionFr?: string;
  descriptionAr?: string;
}

export interface GiftRange {
  minAmount: number;
  maxAmount: number;
  productId: number;
  productName: string;
  /** Disabled tiers remain configured but are excluded from cart and order gift resolution. */
  isActive?: boolean;
}

export interface CityDeliveryRule {
  /** City name or partial match (case-insensitive contains) */
  city: string;
  /** Min days after order cutoff */
  daysMin: number;
  /** Max days after order cutoff */
  daysMax: number;
}

export interface DeliverySettings {
  /** Hour (0-23) after which an order is treated as next-day dispatch */
  cutoffHour: number;
  /** Default min days when no city rule matches (before cutoff) */
  defaultDaysMin: number;
  /** Default max days when no city rule matches (after cutoff) */
  defaultDaysMax: number;
  /** Per-city overrides */
  cityRules: CityDeliveryRule[];
}

export interface Settings {
  storeName: string;
  storePhone: string;
  storeWhatsApp: string;
  freeShippingThreshold: number;
  shippingFee: number;
  announcementFr: string;
  announcementAr: string;
  headerNav?: { id?: string; label_fr?: string; label_ar?: string; href: string }[];
  footerColumns?: { id?: string; heading_fr?: string; heading_ar?: string; links?: { label_fr?: string; label_ar?: string; href: string }[] }[];
  socialLinks?: { platform: string; url: string }[];
  trustBadges?: { icon_key?: string; label_fr?: string; label_ar?: string }[];
  ctaLabels?: Record<string, { label_fr?: string; label_ar?: string }>;
  deliveryCopyFr?: string;
  deliveryCopyAr?: string;
  quizDiscountPercent: number;
  dailyGiftProductId: number;
  dailyGiftName: string;
  giftRanges?: GiftRange[];
  coupons: { 
    code: string; 
    discountPercent: number; 
    freeShipping: boolean;
    discountType?: 'percent' | 'fixed';
    discountValue?: number;
    minPurchase?: number;
    expiryDate?: string;
    isActive?: boolean;
    startDate?: string;
    usageLimit?: number;
  }[];
  faq: { q_fr: string; a_fr: string; q_ar: string; a_ar: string }[];
  adminPasscode: string;
  shippingRules: { city: string; fee: number }[];
  whatsappFollowUpRules?: {
    enabled: boolean;
    trigger: 'abandoned_cart' | 'order_delivered' | 'order_shipped';
    delayHours: number;
  }[];
  categories?: string[];
  featuredProductIds?: number[];
  banners?: HeroCardConfig[];
  loyaltyPointsPerDh?: number;
  loyaltyBronzeMultiplier?: number;
  loyaltySilverMultiplier?: number;
  loyaltyGoldMultiplier?: number;
  loyaltyPlatinumMultiplier?: number;
  courierPartner?: 'yalidine' | 'cathedis';
  courierMode?: 'simulation' | 'production';
  yalidineApiKey?: string;
  yalidineApiId?: string;
  cathedisApiKey?: string;
  lowStockThreshold?: number;
  whatsappProvider?: 'direct_link' | 'twilio' | 'cloud_api';
  whatsappWebhookSecret?: string;
  twilioAccountSid?: string;
  twilioAuthToken?: string;
  twilioFromNumber?: string;
  whatsappCloudAccessToken?: string;
  whatsappCloudPhoneNumberId?: string;
  notificationTemplates?: {
    pendingFr: string;
    pendingAr: string;
    shippedFr: string;
    shippedAr: string;
    deliveredFr: string;
    deliveredAr: string;
    recoveryFr: string;
    recoveryAr: string;
  };
  paymentSettings?: {
    onlinePaymentEnabled: boolean;
    stripeEnabled: boolean;
    stripePublishableKey: string;
    stripeSecretKey: string;
    stripeWebhookSecret: string;
    cmiEnabled: boolean;
    cmiMerchantId: string;
    cmiStoreKey: string;
    cmiApiUrl: string;
    testMode: boolean;
  };
  themeColors?: {
    primary: string;
    primaryDark: string;
    secondary: string;
    bg: string;
    text: string;
    textMuted: string;
    border: string;
    accent: string;
    accentBg: string;
    gold: string;
    goldHover: string;
    whatsapp: string;
  };
  mfaEnforcedRoles?: string[];
  diagnosticRules?: DiagnosticRule[];
  deliverySettings?: DeliverySettings;
  homepageSections?: HomepageSectionConfig;
  customCategories?: { id: string; labelFr: string; labelAr: string }[];
  customConcerns?: {
    id: string;
    labelFr: string;
    labelAr: string;
    taglineFr: string;
    taglineAr: string;
    keywords: string[];
    ingredientKeywords: string[];
    accentColor?: string;
    accentText?: string;
    accentBorder?: string;
    accentDot?: string;
    productIds?: number[];
  }[];
  galleryOverrides?: Record<string, string>;
  /** Per-category link overrides — maps category tag (e.g. "solaire") to a URL */
  categoryLinks?: Record<string, string>;
}

export interface HomepageSectionItem {
  id: string;
  type: string;
  nameFr: string;
  visible: boolean;
  settings?: {
    titleFr?: string;
    titleAr?: string;
    descFr?: string;
    descAr?: string;
    ctaTextFr?: string;
    ctaTextAr?: string;
    ctaLink?: string;
    bgColor?: string;
    textColor?: string;
    html?: string;
    productIds?: number[];
    brands?: { name: string; domain: string; logoUrl?: string }[];
    discountPercent?: number;
    bgImage?: string;
    overlayImage?: string;
    leftImage?: string;
    rightImage?: string;
    promoCards?: {
      tagFr: string;
      tagAr: string;
      titleFr: string;
      titleAr: string;
      price: string;
      bgImage: string;
      overlayImage: string;
      category: string;
    }[];
    concerns?: {
      key: string;
      titleFr: string;
      titleAr: string;
      subtitleFr: string;
      subtitleAr: string;
      image: string;
    }[];
    reviews?: {
      author: string;
      authorAr?: string;
      role?: string;
      roleAr?: string;
      rating: number;
      textFr: string;
      textAr: string;
      date?: string;
      avatar?: string;
    }[];
  };
}

export interface HomepageSectionConfig {
  showHero?: boolean;
  showCategoryTrack?: boolean;
  showProductGrid?: boolean;
  showBrandPartners?: boolean;
  showDiagnosticBanner?: boolean;
  showSummerSale?: boolean;
  showSkinConcerns?: boolean;
  showHorizontalPromo?: boolean;
  showTrustBar?: boolean;
  showCustomerReviews?: boolean;
  showTriplePromo?: boolean;
  showTopRated?: boolean;
  showBestSellers?: boolean;
  showWeeklySales?: boolean;
  showRoutineVisualizer?: boolean;
  showFeaturedIngredient?: boolean;
  showIngredientDictionary?: boolean;
  showFaq?: boolean;
  showDermoCorner?: boolean;
  showActiveIngredients?: boolean;
  showOfficialDistributor?: boolean;

  topRatedTitleFr?: string;
  topRatedTitleAr?: string;
  topRatedProductIds?: number[];
  
  bestSellersTitleFr?: string;
  bestSellersTitleAr?: string;
  bestSellersProductIds?: number[];
  
  weeklySalesTitleFr?: string;
  weeklySalesTitleAr?: string;
  weeklySalesProductIds?: number[];

  routineProductIds?: { cleanse: number[]; treat: number[]; protect: number[] };
  summerSaleProductIds?: number[];
  summerSaleLeftImage?: string;
  summerSaleRightImage?: string;

  /** IDs of products to pin in the Produits Vedettes grid (first 15 slots on page 1) */
  featuredProductIds?: number[];
  
  sectionOrder?: HomepageSectionItem[];
  customCategories?: { id: string; labelFr: string; labelAr: string }[];
  customConcerns?: {
    id: string;
    labelFr: string;
    labelAr: string;
    taglineFr: string;
    taglineAr: string;
    keywords: string[];
    ingredientKeywords: string[];
    accentColor?: string;
    accentText?: string;
    accentBorder?: string;
    accentDot?: string;
    productIds?: number[];
  }[];
}


interface SettingsContextProps {
  settings: Settings;
  loadSettings: (force?: boolean) => Promise<void>;
  saveSettings: (newSettings: Settings) => Promise<boolean>;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextProps | undefined>(undefined);

let settingsCache: Settings | null = null;
let lastFetchedTime: number = 0;
const CACHE_EXPIRY = 60000; // 60 seconds cache
// Bump this version whenever DEFAULT_SETTINGS changes to invalidate stale browser caches


export class SettingsErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("SettingsErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-center my-4 max-w-md mx-auto" style={{ fontFamily: 'sans-serif' }}>
          <h3 className="font-bold text-sm">Système de Configuration Indisponible</h3>
          <p className="text-xs mt-1">L'application a rencontré une erreur lors du chargement des préférences. Veuillez rafraîchir la page.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export const SettingsProvider: React.FC<{ children: React.ReactNode; initialSettings?: Record<string, any> }> = ({ children, initialSettings }) => {
  // Track whether we have server-provided initialSettings so loadSettings knows to skip stale cache
  const hasInitialSettings = !!(initialSettings && typeof initialSettings === 'object' && Object.keys(initialSettings).length > 0);

  const [settings, setSettings] = useState<Settings>(() => {
    const baseSettings = hasInitialSettings
      ? normalizeStoreContact({ ...DEFAULT_SETTINGS, ...initialSettings })
      : null;

    if (typeof window !== 'undefined') {
      try {
        // Gallery image URLs are server-owned. Remove stale values left by the
        // retired browser-only gallery cache before hydration can use them.
        try { localStorage.removeItem('custom_gallery_overrides'); } catch {}
        (window as any).__PARA_GALLERY_OVERRIDES__ = {};

        let source = baseSettings;
        if (!source) {
          const fromWindow = (window as any).__PARA_SETTINGS_CACHE__;
          let raw: any = fromWindow && typeof fromWindow === 'object' ? fromWindow : null;
          if (!raw) {
            const cached = localStorage.getItem('para_settings_cache');
            if (cached) raw = JSON.parse(cached);
          }
          if (raw && typeof raw === 'object') {
            source = normalizeStoreContact({ ...DEFAULT_SETTINGS, ...raw });
          }
        }
        if (source) {
          try {
            localStorage.setItem('para_settings_cache', JSON.stringify(source));
            (window as any).__PARA_SETTINGS_CACHE__ = source;
          } catch {}
          return source;
        }
      } catch {}
    }
    if (baseSettings) return baseSettings;
    return DEFAULT_SETTINGS;
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadSettings = useCallback(async (force: boolean = false) => {
    const now = Date.now();
    // If server-provided initialSettings exist, they are already applied as state.
    // Only use the stale module-level cache if we have NO initialSettings (e.g. error fallback).
    // This prevents the 60-second stale cache from overwriting correct server-side images.
    if (!force && settingsCache && (now - lastFetchedTime < CACHE_EXPIRY) && !hasInitialSettings) {
      setSettings(settingsCache);
      setIsLoading(false);
      return;
    }
    // The server-rendered settings are already the authoritative source for
    // the initial page load. Gallery and settings updates explicitly call this
    // function with force=true, so this avoids a duplicate client request.
    if (!force && hasInitialSettings) {
      setIsLoading(false);
      return;
    }

    try {
      const isAdmin = typeof window !== 'undefined' && window.location.pathname.includes('/admin');
      const endpoint = isAdmin ? '/api/settings' : '/api/settings/public';
      const res = await fetch(endpoint);
      const data = await res.json();
      if (data.success && data.settings) {
        const merged = normalizeStoreContact({ ...DEFAULT_SETTINGS, ...data.settings });

        merged.galleryOverrides = merged.galleryOverrides || {};

        if (!merged.banners || merged.banners.length === 0) {
          merged.banners = DEFAULT_SETTINGS.banners;
        } else {
          const keysMap = ['hero_bestsellers', 'hero_summersale', 'hero_weeklypromo', 'hero_newarrivals'];
          merged.banners = merged.banners.map((b: any, idx: number) => {
            const key = keysMap[idx];
            const cleanBg = b.bgImage ? b.bgImage.replace(/\.png(\?.*)?$/i, '.webp$1') : b.bgImage;
            const override = key && merged.galleryOverrides?.[key];
            return {
              ...b,
              bgImage: override || cleanBg || DEFAULT_SETTINGS.banners?.[idx]?.bgImage
            };
          });
        }
        if (!merged.notificationTemplates) {
          merged.notificationTemplates = DEFAULT_SETTINGS.notificationTemplates;
        }
        if (!merged.paymentSettings) {
          merged.paymentSettings = DEFAULT_SETTINGS.paymentSettings;
        } else {
          merged.paymentSettings = { ...DEFAULT_SETTINGS.paymentSettings, ...merged.paymentSettings };
        }
        if (!merged.themeColors) {
          merged.themeColors = DEFAULT_SETTINGS.themeColors;
        } else {
          merged.themeColors = { ...DEFAULT_SETTINGS.themeColors, ...merged.themeColors };
        }
        if (!merged.diagnosticRules || merged.diagnosticRules.length === 0) {
          merged.diagnosticRules = DEFAULT_SETTINGS.diagnosticRules;
        }
        setSettings(merged);
        settingsCache = merged;
        lastFetchedTime = Date.now();
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('para_settings_cache', JSON.stringify(merged));
          } catch {}
        }
      }
    } catch (e) {
      console.error("Failed to load settings:", e);
      if (settingsCache) {
        setSettings(settingsCache);
      } else {
        setSettings(DEFAULT_SETTINGS);
      }
    } finally {
      setIsLoading(false);
    }
  }, [hasInitialSettings]);

  const saveSettings = async (newSettings: Settings) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: newSettings })
      });
      const data = await res.json();
      if (data.success) {
        setSettings(newSettings);
        settingsCache = newSettings;
        lastFetchedTime = Date.now();
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('para_settings_cache', JSON.stringify(newSettings));
          } catch {}
        }
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  // Dynamic CSS custom properties injection
  useEffect(() => {
    if (typeof window !== 'undefined' && settings?.themeColors) {
      const root = document.documentElement;
      Object.entries(settings.themeColors).forEach(([key, val]) => {
        if (val) {
          // Convert camelCase key to kebab-case CSS variable
          const cssKey = toThemeColorVariable(key);
          root.style.setProperty(cssKey, val);
        }
      });
    }
  }, [settings?.themeColors]);

  // Gallery updates always re-fetch the server-owned image registry.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleGalleryUpdate = () => {
      settingsCache = null;
      lastFetchedTime = 0;
      loadSettings(true);
    };
    const handleSettingsUpdate = () => {
      // On a settings update event, force a fresh fetch from server
      settingsCache = null;
      lastFetchedTime = 0;
      loadSettings(true);
    };
    window.addEventListener('gallery_overrides_updated', handleGalleryUpdate);
    window.addEventListener('settings_updated', handleSettingsUpdate);
    return () => {
      window.removeEventListener('gallery_overrides_updated', handleGalleryUpdate);
      window.removeEventListener('settings_updated', handleSettingsUpdate);
    };
  }, [loadSettings]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return (
    <SettingsContext.Provider value={{ settings, loadSettings, saveSettings, isLoading }}>
      <SettingsErrorBoundary>
        {children}
      </SettingsErrorBoundary>
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
