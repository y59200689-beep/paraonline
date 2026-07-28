import { supabaseAdmin as supabase } from '@/lib/supabase';
import { DEFAULT_SETTINGS } from '@/context/SettingsContext';
import path from 'path';
import fs from 'fs';

const BANNER_KEYS = ['hero_bestsellers', 'hero_summersale', 'hero_weeklypromo', 'hero_newarrivals'];

export async function getPublicSettings(): Promise<Record<string, any>> {
  try {
    const { data, error } = await supabase
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

    // Read local gallery-overrides.json if present
    let fileOverrides: Record<string, string> = {};
    try {
      const overridesPath = path.join(process.cwd(), 'gallery-overrides.json');
      if (fs.existsSync(overridesPath)) {
        fileOverrides = JSON.parse(fs.readFileSync(overridesPath, 'utf-8'));
      }
    } catch {}

    // Merge: row 99 overrides + fileOverrides take priority over row 1's galleryOverrides
    const mergedGalleryOverrides: Record<string, string> = {
      ...(settings.galleryOverrides || {}),
      ...fileOverrides,
      ...dbGalleryOverrides,
    };

    // Inject galleryOverrides directly into banners[i].bgImage
    let banners = settings.banners || [];
    if (banners.length > 0) {
      banners = banners.map((b: any, idx: number) => {
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
      coupons: settings.coupons,
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

