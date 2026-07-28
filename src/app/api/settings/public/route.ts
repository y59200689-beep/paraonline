import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';

// Banner key map: galleryOverrides key -> banners[index]
const BANNER_KEYS = ['hero_bestsellers', 'hero_summersale', 'hero_weeklypromo', 'hero_newarrivals'];

export async function GET() {
  try {
    // Fetch main settings row
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) throw error;

    const settings = data.value || {};

    // Also fetch dedicated gallery overrides row (id=99) which is the authoritative source
    let dbGalleryOverrides: Record<string, string> = {};
    try {
      const { data: data99 } = await supabase
        .from('settings')
        .select('value')
        .eq('id', 99)
        .single();
      if (data99?.value && typeof data99.value === 'object') {
        dbGalleryOverrides = data99.value as Record<string, string>;
      }
    } catch {}

    // Merge: row 99 overrides take priority over row 1's galleryOverrides
    const mergedGalleryOverrides: Record<string, string> = {
      ...(settings.galleryOverrides || {}),
      ...dbGalleryOverrides,
    };

    // Apply galleryOverrides into banners array server-side
    // This ensures even fresh visits (no localStorage) get the correct images
    let banners = settings.banners || [];
    if (banners.length > 0) {
      banners = banners.map((b: any, idx: number) => {
        const key = BANNER_KEYS[idx];
        // Normalize legacy .png paths to .webp
        const cleanBg = b.bgImage ? b.bgImage.replace(/\.png(\?.*)?$/i, '.webp$1') : b.bgImage;
        const override = key && mergedGalleryOverrides[key];
        return { ...b, bgImage: override || cleanBg };
      });
    }

    // Apply galleryOverrides into homepageSections server-side
    let homepageSections = settings.homepageSections || {};
    if (mergedGalleryOverrides['cicaplast_bundle']) {
      homepageSections = { ...homepageSections, summerSaleLeftImage: mergedGalleryOverrides['cicaplast_bundle'] };
    }
    if (mergedGalleryOverrides['vichy_sunscreen_bundle']) {
      homepageSections = { ...homepageSections, summerSaleRightImage: mergedGalleryOverrides['vichy_sunscreen_bundle'] };
    }

    // Construct safe public settings object by stripping all private credentials
    const publicSettings = {
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
      } : undefined
    };

    return NextResponse.json({ success: true, settings: publicSettings });
  } catch (error: any) {
    console.error("Public settings fetch error:", error);
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}
