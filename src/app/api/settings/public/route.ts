import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 1)
      .single();
    
    if (error) throw error;
    
    const settings = data.value || {};
    
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
      banners: settings.banners,
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
      homepageSections: settings.homepageSections,
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
