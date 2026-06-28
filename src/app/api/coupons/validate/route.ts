import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';

const MOCK_COUPONS: Record<string, { code: string; discountPercent: number; freeShipping: boolean; giftItem?: string; discountType?: 'percent' | 'fixed'; discountValue?: number; minPurchase?: number; expiryDate?: string; isActive?: boolean; startDate?: string; usageLimit?: number }> = {
  'BEAUTY10': { code: 'BEAUTY10', discountPercent: 10, freeShipping: false, discountType: 'percent', discountValue: 10, minPurchase: 0, expiryDate: '2026-12-31', isActive: true },
  'CLINICAL15': { code: 'CLINICAL15', discountPercent: 15, freeShipping: false, discountType: 'percent', discountValue: 15, minPurchase: 0, expiryDate: '2026-12-31', isActive: true },
  'FREESHIP': { code: 'FREESHIP', discountPercent: 0, freeShipping: true, discountType: 'percent', discountValue: 0, minPurchase: 300, expiryDate: '2026-12-31', isActive: true },
  'GIFTGLOW': { code: 'GIFTGLOW', discountPercent: 0, freeShipping: false, giftItem: 'Masque Hydra-Glow Offert', discountType: 'percent', discountValue: 0, minPurchase: 0, expiryDate: '2026-12-31', isActive: true }
};

export async function POST(request: Request) {
  try {
    const { code, subtotal, language = 'FR' } = await request.json();
    
    if (!code) {
      return NextResponse.json({ 
        success: false, 
        error: language === 'AR' ? 'كود الخصم مطلوب.' : 'Code promo requis.' 
      }, { status: 400 });
    }

    const normalizedCode = code.trim().toUpperCase();

    // 1. Get settings for dynamic coupons
    let settingsCoupons: any[] = [];
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 1)
        .single();
      
      if (!error && data?.value?.coupons) {
        settingsCoupons = data.value.coupons;
      }
    } catch (dbErr) {
      console.error("Error reading store settings for coupons:", dbErr);
    }

    // 2. Find coupon in settings or mock coupons
    let coupon = settingsCoupons.find((c: any) => c.code === normalizedCode);
    if (!coupon) {
      coupon = MOCK_COUPONS[normalizedCode];
    }

    if (!coupon) {
      return NextResponse.json({
        success: false,
        error: language === 'AR' ? 'كود الخصم غير صحيح.' : 'Code promo invalide.'
      });
    }

    // 3. Validation: isActive
    if (coupon.isActive === false) {
      return NextResponse.json({
        success: false,
        error: language === 'AR' ? 'كود الخصم غير نشط حالياً.' : 'Ce code promo est actuellement inactif.'
      });
    }

    // 4. Validation: startDate
    const todayStr = new Date().toISOString().split('T')[0];
    if (coupon.startDate && coupon.startDate > todayStr) {
      return NextResponse.json({
        success: false,
        error: language === 'AR' ? 'هذا الكود لم يبدأ بعد.' : "Ce code promo n'est pas encore actif."
      });
    }

    // 5. Validation: expiryDate
    if (coupon.expiryDate) {
      const expiryTime = new Date(coupon.expiryDate).getTime();
      const todayTime = new Date().setHours(0, 0, 0, 0);
      if (expiryTime < todayTime) {
        return NextResponse.json({
          success: false,
          error: language === 'AR' ? 'انتهت صلاحية هذا الكود.' : 'Ce code promo a expiré.'
        });
      }
    }

    // 6. Validation: minPurchase
    if (coupon.minPurchase && subtotal < coupon.minPurchase) {
      return NextResponse.json({
        success: false,
        error: language === 'AR' 
          ? `الحد الأدنى للشراء هو ${coupon.minPurchase} DH.` 
          : `Minimum d'achat de ${coupon.minPurchase} DH requis.`
      });
    }

    // 7. Validation: usageLimit
    if (coupon.usageLimit !== undefined && coupon.usageLimit !== null && coupon.usageLimit > 0) {
      const { count, error } = await supabase
        .from('orders')
        .select('order_id', { count: 'exact', head: true })
        .eq('applied_coupon', normalizedCode)
        .not('status', 'eq', 'Cancelled');

      if (error) {
        console.error("Error querying coupon usage limit from orders:", error);
      } else if (count !== null && count >= coupon.usageLimit) {
        return NextResponse.json({
          success: false,
          error: language === 'AR' 
            ? 'تم الوصول إلى الحد الأقصى لاستخدام هذا الكود.' 
            : "Ce code promo a atteint sa limite d'utilisation."
        });
      }
    }

    return NextResponse.json({
      success: true,
      coupon
    });
  } catch (error: any) {
    console.error('Coupon validation error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Server error' 
    }, { status: 500 });
  }
}
