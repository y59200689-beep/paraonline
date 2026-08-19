import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { createOrderTrackingToken, createOrderVerificationToken, verifyOrderToken } from '@/lib/order-security';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { isValidMoroccanPhone, normalizeMoroccanPhoneInput } from '@/lib/moroccan-phone';
import { normalizeGiftItem } from '@/lib/gift-item';
import {
  calculateCommerceSummary,
  calculateSubtotal,
  roundMoney,
  type GiftProductEligibility,
  type ShippingSettings,
} from '@/lib/pricing';

type ProductRecord = {
  id: number;
  title: string;
  price: number;
  stock: number;
  image?: string | null;
  sku?: string | null;
  status?: string | null;
};

type Coupon = {
  code: string;
  discountPercent?: number;
  discountType?: 'percent' | 'fixed';
  discountValue?: number;
  freeShipping?: boolean;
  minPurchase?: number;
  expiryDate?: string;
  startDate?: string;
  usageLimit?: number;
  isActive?: boolean;
};

const MOCK_COUPONS: Record<string, Coupon> = {
  BEAUTY10: { code: 'BEAUTY10', discountPercent: 10 },
  CLINICAL15: { code: 'CLINICAL15', discountPercent: 15 },
  GIFTGLOW: { code: 'GIFTGLOW' },
};

function safeTrackingOrder(order: Record<string, unknown>) {
  return {
    order_id: order.order_id,
    customer_name: order.customer_name,
    city: order.city,
    items: Array.isArray(order.items) ? order.items : [],
    subtotal: order.subtotal,
    discount_amount: order.discount_amount,
    applied_coupon: order.applied_coupon,
    gift_item: order.gift_item,
    total: order.total,
    status: order.status,
    payment_status: order.payment_status,
    payment_method: order.payment_method,
    created_at: order.created_at,
    carrier: order.carrier,
    tracking_number: order.tracking_number,
    estimated_delivery: order.estimated_delivery,
    package_weight: order.package_weight,
    logs: order.logs,
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId')?.trim() || '';
    const token = searchParams.get('token')?.trim() || '';

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Une référence de commande est requise.' }, { status: 400 });
    }

    const ip = getClientIp(request);
    const { allowed } = await rateLimit(`order-track:${ip}`, 20, 60_000);
    if (!allowed) {
      return NextResponse.json({ success: false, error: 'Trop de requêtes. Veuillez réessayer dans une minute.' }, { status: 429 });
    }

    let authenticatedCustomerId: string | null = null;
    if (token) {
      const [tokenOrderId, signature] = token.split('.');
      if (tokenOrderId !== orderId || !signature || !verifyOrderToken(orderId, signature, 'track')) {
        return NextResponse.json({ success: false, error: 'Code de suivi invalide.' }, { status: 403 });
      }
    } else {
      const bearerToken = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim();
      if (!bearerToken) {
        return NextResponse.json({ success: false, error: 'Un code de suivi ou une session client est requis.' }, { status: 401 });
      }
      const { data: authData, error: authError } = await supabase.auth.getUser(bearerToken);
      if (authError || !authData.user) {
        return NextResponse.json({ success: false, error: 'Session client invalide ou expirée.' }, { status: 401 });
      }
      authenticatedCustomerId = authData.user.id;
    }

    let orderQuery = supabase
      .from('orders')
      .select('order_id, customer_id, customer_name, city, items, subtotal, discount_amount, applied_coupon, gift_item, total, status, payment_status, payment_method, created_at, carrier, tracking_number, estimated_delivery, package_weight, logs')
      .eq('order_id', orderId);
    if (authenticatedCustomerId) {
      orderQuery = orderQuery.eq('customer_id', authenticatedCustomerId);
    }
    const { data: order, error } = await orderQuery.maybeSingle();

    if (error) throw error;
    if (!order) {
      return NextResponse.json({ success: true, orders: [] });
    }

    return NextResponse.json({ success: true, orders: [safeTrackingOrder(order)] });
  } catch (error: any) {
    console.error('Order tracking error:', error);
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const { allowed } = await rateLimit(`orders:${ip}`, 10, 60_000);
    if (!allowed) {
      return NextResponse.json({ success: false, error: 'Trop de requêtes. Veuillez réessayer dans une minute.' }, { status: 429 });
    }

    const body = await request.json();
    const bearerToken = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim();
    let customerId: string | null = null;
    if (bearerToken) {
      const { data: authData } = await supabase.auth.getUser(bearerToken);
      customerId = authData.user?.id || null;
    }
    const orderData = body.orderData;
    const requestedItems = Array.isArray(body.items) ? body.items : [];
    const paymentMethod = ['cod', 'stripe', 'cmi'].includes(body.paymentMethod) ? body.paymentMethod : 'cod';

    if (!orderData?.name || !orderData?.phone || !orderData?.address || !orderData?.city || requestedItems.length === 0) {
      return NextResponse.json({ success: false, error: 'Informations de commande invalides' }, { status: 400 });
    }

    if (!isValidMoroccanPhone(String(orderData.phone))) {
      return NextResponse.json({ success: false, error: 'Le numéro de téléphone marocain doit contenir entre 9 et 10 chiffres.' }, { status: 400 });
    }

    const quantities = new Map<number, number>();
    for (const item of requestedItems) {
      const id = Number(item?.id);
      const quantity = Number(item?.quantity);
      if (!Number.isInteger(id) || !Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
        return NextResponse.json({ success: false, error: 'Panier invalide.' }, { status: 400 });
      }
      quantities.set(id, (quantities.get(id) || 0) + quantity);
    }

    const productIds = [...quantities.keys()];
    const [{ data: products, error: productError }, { data: settingsData }] = await Promise.all([
      supabase.from('products').select('id, title, price, stock, image, sku, status').in('id', productIds),
      supabase.from('settings').select('value').eq('id', 1).maybeSingle(),
    ]);
    if (productError) throw productError;
    if (!products || products.length !== productIds.length) {
      return NextResponse.json({ success: false, error: 'Un ou plusieurs produits ne sont plus disponibles.' }, { status: 409 });
    }

    const productById = new Map((products as ProductRecord[]).map((product) => [Number(product.id), product]));
    const items = productIds.map((id) => {
      const product = productById.get(id)!;
      const quantity = quantities.get(id)!;
      if (product.status && product.status !== 'live') {
        throw new Error('PRODUCT_UNAVAILABLE');
      }
      if (!Number.isFinite(Number(product.price)) || Number(product.stock) < quantity) {
        throw new Error('INSUFFICIENT_STOCK');
      }
      return {
        id: Number(product.id),
        title: product.title,
        price: roundMoney(Number(product.price)),
        quantity,
        image: product.image || undefined,
        sku: product.sku || undefined,
      };
    });

    const settings = (settingsData?.value || {}) as ShippingSettings & Record<string, any>;
    const subtotalForCoupon = calculateSubtotal(items.map((item) => ({ product: item, quantity: item.quantity })));
    const coupon = await resolveCoupon(body.appliedCoupon, subtotalForCoupon, settings);
    const giftProductIds = Array.isArray(settings.giftRanges)
      ? [...new Set(settings.giftRanges.map((range) => Number(range.productId)).filter((id) => id > 0))]
      : [];
    let giftProducts: GiftProductEligibility[] = [];
    if (giftProductIds.length > 0) {
      const { data, error } = await supabase
        .from('products')
        .select('id, title, stock, status')
        .in('id', giftProductIds);
      if (error) throw error;
      giftProducts = (data || []) as GiftProductEligibility[];
    }
    const pricing = calculateCommerceSummary({
      cart: items.map((item) => ({ product: item, quantity: item.quantity })),
      coupon,
      settings,
      shippingCity: String(orderData.city),
      giftProducts,
    });
    const { subtotal, discountAmount, shippingFee, total } = pricing;
    const isCod = paymentMethod === 'cod';
    const fallbackOrderId = `PO-${crypto.randomInt(100000, 1000000)}`;

    // Validate the signing secrets before reserving stock. Existing production
    // databases still allocate the supplied reference themselves, while the
    // newer migration may return a generated reference from the RPC.
    createOrderTrackingToken(fallbackOrderId);
    if (isCod) createOrderVerificationToken(fallbackOrderId);

    const order = {
      order_id: fallbackOrderId,
      customer_name: String(orderData.name).trim().slice(0, 120),
      phone_number: normalizeMoroccanPhoneInput(String(orderData.phone)),
      address: String(orderData.address).trim().slice(0, 500),
      city: String(orderData.city).trim().slice(0, 120),
      notes: String(orderData.note || '').trim().slice(0, 1000),
      items,
      subtotal,
      discount_amount: discountAmount,
      applied_coupon: coupon?.code || '',
      gift_item: normalizeGiftItem(pricing.giftItem),
      total,
      status: isCod ? 'Pending' : 'Pending Payment',
      skin_diagnostic: body.skinDiagnostic || null,
      loyalty_points: pricing.loyaltyPoints,
      loyalty_tier: null,
      payment_method: paymentMethod,
      payment_status: 'unpaid',
      customer_id: customerId || '',
    };

    const { data: createdOrderId, error: createError } = await supabase.rpc('create_order_with_stock', { p_order: order });
    if (createError) {
      if (String(createError.message).includes('INSUFFICIENT_STOCK')) {
        return NextResponse.json({ success: false, error: 'Stock insuffisant pour un ou plusieurs produits.' }, { status: 409 });
      }
      throw createError;
    }

    const orderId = typeof createdOrderId === 'string' && createdOrderId ? createdOrderId : fallbackOrderId;
    const trackingToken = createOrderTrackingToken(orderId);
    const verificationToken = isCod ? createOrderVerificationToken(orderId) : '';

    return NextResponse.json({
      success: true,
      orderId,
      verificationToken,
      trackingToken,
      subtotal,
      discountAmount,
      shippingFee,
      total,
      giftItem: normalizeGiftItem(pricing.giftItem),
      loyaltyPoints: pricing.loyaltyPoints,
      items,
    });
  } catch (error: any) {
    if (error?.message === 'PRODUCT_UNAVAILABLE') {
      return NextResponse.json({ success: false, error: 'Un produit du panier est indisponible.' }, { status: 409 });
    }
    if (error?.message === 'INSUFFICIENT_STOCK') {
      return NextResponse.json({ success: false, error: 'Stock insuffisant pour un ou plusieurs produits.' }, { status: 409 });
    }
    if (error?.message === 'INVALID_COUPON') {
      return NextResponse.json({ success: false, error: 'Code promo invalide ou non applicable.' }, { status: 400 });
    }
    console.error('Checkout error:', error);
    return NextResponse.json({ success: false, error: 'Impossible de créer la commande.' }, { status: 500 });
  }
}

async function resolveCoupon(code: unknown, subtotal: number, settings: Record<string, any>) {
  if (typeof code !== 'string' || !code.trim()) return null;
  const normalizedCode = code.trim().toUpperCase();
  const settingsCoupons = Array.isArray(settings.coupons) ? settings.coupons : [];
  const coupon: Coupon | undefined = settingsCoupons.find((candidate: Coupon) => candidate.code?.toUpperCase() === normalizedCode)
    || MOCK_COUPONS[normalizedCode];

  // Delivery is governed exclusively by the discounted merchandise subtotal.
  // Legacy delivery-only coupons must never create a second shipping rule.
  if (!coupon || coupon.isActive === false || coupon.freeShipping === true) throw new Error('INVALID_COUPON');
  const today = new Date().toISOString().slice(0, 10);
  if ((coupon.startDate && coupon.startDate > today) || (coupon.expiryDate && coupon.expiryDate < today)) {
    throw new Error('INVALID_COUPON');
  }
  if (coupon.minPurchase && subtotal < coupon.minPurchase) throw new Error('INVALID_COUPON');

  if (coupon.usageLimit && coupon.usageLimit > 0) {
    const { count, error } = await supabase
      .from('orders')
      .select('order_id', { count: 'exact', head: true })
      .eq('applied_coupon', normalizedCode)
      .not('status', 'eq', 'Cancelled');
    if (error) throw error;
    if ((count || 0) >= coupon.usageLimit) throw new Error('INVALID_COUPON');
  }
  return { ...coupon, code: normalizedCode };
}
