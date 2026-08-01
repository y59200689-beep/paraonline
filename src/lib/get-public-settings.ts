import { supabaseAdmin as supabase } from '@/lib/supabase';
import { DEFAULT_SETTINGS, type Settings } from '@/context/SettingsContext';
import { unstable_cache } from 'next/cache';

const BANNER_KEYS = ['hero_bestsellers', 'hero_summersale', 'hero_weeklypromo', 'hero_newarrivals'];
export const PUBLIC_SETTINGS_CACHE_TAG = 'public-settings';

interface PublicBanner {
  bgImage?: string;
  [key: string]: unknown;
}

type PublicSettings = Omit<Partial<Settings>, 'paymentSettings'> & {
  paymentSettings?: Partial<NonNullable<Settings['paymentSettings']>>;
} & Record<string, unknown>;

async function fetchPublicSettings(): Promise<PublicSettings> {
  try {
    const { data } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 1)
      .single();

    const dbSettings = data?.value || {};
    const settings = {
      ...DEFAULT_SETTINGS,
      ...dbSettings,
      homepageSections: {
        ...DEFAULT_SETTINGS.homepageSections,
        ...(dbSettings.homepageSections || {}),
      },
    };

    // Fetch dedicated gallery overrides row (id=99) — authoritative source
    let dbGalleryOverrides: Record<string, string> = {};
    try {
      const { data: data99 } = await supabase
        .from('settings')
        .select('value')
        .eq('id', 99)
        .maybeSingle();
      if (data99?.value && typeof data99.value === 'object') {
        dbGalleryOverrides = data99.value as Record<string, string>;
      }
    } catch {}

    // Gallery row 99 is the sole mutable image source. The settings row provides
    // only the built-in defaults when a gallery key has never been replaced.
    const mergedGalleryOverrides = dbGalleryOverrides;

    // Inject galleryOverrides directly into banners[i].bgImage
    let banners = settings.banners || [];
    if (banners.length > 0) {
      banners = banners.map((b: PublicBanner, idx: number) => {
        const key = BANNER_KEYS[idx];
        const cleanBg = b.bgImage ? b.bgImage.replace(/\.png(\?.*)?$/i, '.webp$1') : b.bgImage;
        const override = key && mergedGalleryOverrides[key];
        return { ...b, bgImage: override || cleanBg };
      });
    }

    // Inject galleryOverrides into homepageSections
    let homepageSections = settings.homepageSections || {};
    if (mergedGalleryOverrides['cicaplast_bundle']) {
      homepageSections = { ...homepageSections, summerSaleLeftImage: mergedGalleryOverrides['cicaplast_bundle'] };
    }
    if (mergedGalleryOverrides['vichy_sunscreen_bundle']) {
      homepageSections = { ...homepageSections, summerSaleRightImage: mergedGalleryOverrides['vichy_sunscreen_bundle'] };
    }

    return {
      storeName: settings.storeName,
      storePhone: settings.storePhone,
      storeWhatsApp: settings.storeWhatsApp,
      freeShippingThreshold: settings.freeShippingThreshold,
      shippingFee: settings.shippingFee,
      announcementFr: settings.announcementFr,
      announcementAr: settings.announcementAr,
      quizDiscountPercent: settings.quizDiscountPercent,
      dailyGiftProductId: settings.dailyGiftProductId,
      dailyGiftName: settings.dailyGiftName,
      giftRanges: settings.giftRanges || [],
      categories: settings.categories,
      customCategories: settings.customCategories || [],
      customConcerns: settings.customConcerns || [],
      banners,
      faq: settings.faq,
      shippingRules: settings.shippingRules,
      loyaltyPointsPerDh: settings.loyaltyPointsPerDh,
      loyaltyBronzeMultiplier: settings.loyaltyBronzeMultiplier,
      loyaltySilverMultiplier: settings.loyaltySilverMultiplier,
      loyaltyGoldMultiplier: settings.loyaltyGoldMultiplier,
      loyaltyPlatinumMultiplier: settings.loyaltyPlatinumMultiplier,
      lowStockThreshold: settings.lowStockThreshold,
      themeColors: settings.themeColors,
      diagnosticRules: settings.diagnosticRules || [],
      deliverySettings: settings.deliverySettings || null,
      homepageSections,
      galleryOverrides: mergedGalleryOverrides,
      paymentSettings: settings.paymentSettings ? {
        onlinePaymentEnabled: settings.paymentSettings.onlinePaymentEnabled,
        stripeEnabled: settings.paymentSettings.stripeEnabled,
        stripePublishableKey: settings.paymentSettings.stripePublishableKey,
        cmiEnabled: settings.paymentSettings.cmiEnabled,
        testMode: settings.paymentSettings.testMode,
      } : undefined,
    };
  } catch (e) {
    console.error('[getPublicSettings] failed:', e);
    return {};
  }
}

// Settings are shared by every storefront visitor. Cache them until an admin
// mutation explicitly invalidates this tag, rather than querying Supabase for
// each page render.
const getCachedPublicSettings = unstable_cache(
  fetchPublicSettings,
  ['public-settings'],
  { tags: [PUBLIC_SETTINGS_CACHE_TAG], revalidate: false }
);

export async function getPublicSettings(): Promise<PublicSettings> {
  return getCachedPublicSettings();
}
