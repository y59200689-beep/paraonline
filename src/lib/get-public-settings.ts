import { supabaseAdmin as supabase } from '@/lib/supabase';
import { DEFAULT_SETTINGS, type HeroCardConfig, type Settings } from '@/context/SettingsContext';
import { unstable_cache } from 'next/cache';

const BANNER_KEYS = ['hero_bestsellers', 'hero_summersale', 'hero_weeklypromo', 'hero_newarrivals'];
export const PUBLIC_SETTINGS_CACHE_TAG = 'public-settings';

type PublicSettings = Omit<Partial<Settings>, 'paymentSettings'> & {
  paymentSettings?: Partial<NonNullable<Settings['paymentSettings']>>;
} & Record<string, unknown>;

const SAFE_DELIVERY_FR = 'Les délais et frais de livraison dépendent de la ville et sont confirmés avant la validation de la commande.';
const SAFE_DELIVERY_AR = 'تختلف مدة وتكلفة التوصيل حسب المدينة، ويتم تأكيدهما قبل إتمام الطلب.';

/** The complete non-sensitive shipping contract consumed by storefront checkout. */
export function serializePublicShippingSettings(settings: Pick<Settings, 'freeShippingThreshold' | 'shippingFee' | 'shippingRules'>) {
  return {
    freeShippingThreshold: settings.freeShippingThreshold,
    shippingFee: settings.shippingFee,
    shippingRules: settings.shippingRules,
  };
}

function normalizeLegacyStorefrontClaims(settings: Settings): Settings {
  const banners = (settings.banners || []).map((banner) => {
    if (!banner.descFr?.includes('Formules certifiées, résultats prouvés')) return banner;
    return {
      ...banner,
      tagFr: 'LES PLUS VENDUS · SÉLECTION',
      tagAr: 'الأكثر مبيعاً · مختارات',
      titleFr: 'Nos meilleures ventes',
      descFr: 'Découvrez une sélection de soins et de produits K-Beauty appréciés par nos clients au Maroc.',
      descAr: 'اكتشفي مجموعة من منتجات العناية والجمال الكوري التي يفضلها عملاؤنا في المغرب.',
      ctaFr: 'Voir les meilleures ventes',
    };
  });

  const faq = (settings.faq || []).map((item) => {
    if (!item.a_fr?.includes('vous êtes livrés le jour même')) return item;
    return { ...item, a_fr: SAFE_DELIVERY_FR, a_ar: SAFE_DELIVERY_AR };
  });

  const legacyAnnouncement = settings.announcementFr?.includes('LIVRAISON GRATUITE LE JOUR MÊME');
  return {
    ...settings,
    banners,
    faq,
    announcementFr: legacyAnnouncement
      ? 'LIVRAISON AU MAROC — Le délai et les frais sont confirmés avant la validation de votre commande.'
      : settings.announcementFr,
    announcementAr: legacyAnnouncement
      ? 'التوصيل داخل المغرب — يتم تأكيد المدة والتكلفة قبل إتمام طلبك.'
      : settings.announcementAr,
  };
}

async function fetchPublicSettings(): Promise<PublicSettings> {
  try {
    const { data } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 1)
      .single();

    const dbSettings = data?.value || {};
    const settings = normalizeLegacyStorefrontClaims({
      ...DEFAULT_SETTINGS,
      ...dbSettings,
      homepageSections: {
        ...DEFAULT_SETTINGS.homepageSections,
        ...(dbSettings.homepageSections || {}),
      },
    } as Settings);

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
      banners = banners.map((b: HeroCardConfig, idx: number) => {
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
      ...serializePublicShippingSettings(settings),
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
      loyaltyPointsPerDh: settings.loyaltyPointsPerDh,
      loyaltyBronzeMultiplier: settings.loyaltyBronzeMultiplier,
      loyaltySilverMultiplier: settings.loyaltySilverMultiplier,
      loyaltyGoldMultiplier: settings.loyaltyGoldMultiplier,
      loyaltyPlatinumMultiplier: settings.loyaltyPlatinumMultiplier,
      lowStockThreshold: settings.lowStockThreshold,
      themeColors: settings.themeColors,
      diagnosticRules: settings.diagnosticRules || [],
      deliverySettings: settings.deliverySettings || undefined,
      homepageSections,
      featuredProductIds: settings.featuredProductIds || [],
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
