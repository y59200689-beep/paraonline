import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { authorizeAdminMutation, getCurrentAdminOperator } from '@/lib/admin-authorization';
import { canManageSettings } from '@/lib/permissions';
import { FREE_SHIPPING_SUBTOTAL_DH } from '@/lib/pricing';
import { supabaseAdmin as supabase } from '@/lib/supabase';

const PUBLIC_SETTINGS_CACHE_TAG = 'public-settings';

type Coupon = {
  code: string;
  discountPercent: number;
  freeShipping: false;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  minPurchase: number;
  startDate?: string;
  expiryDate?: string;
  usageLimit: number;
  isActive: boolean;
};

const CODE_PATTERN = /^[A-Z0-9][A-Z0-9_-]{2,39}$/;
const MAX_MONEY_VALUE = 1_000_000;

function error(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

function normalizeCode(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const code = value.trim().toUpperCase();
  return CODE_PATTERN.test(code) ? code : null;
}

function isDateOnly(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function asNonNegativeMoney(value: unknown): number | null {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue >= 0 && numberValue <= MAX_MONEY_VALUE
    ? Math.round((numberValue + Number.EPSILON) * 100) / 100
    : null;
}

function asPositiveMoney(value: unknown): number | null {
  const numberValue = asNonNegativeMoney(value);
  return numberValue !== null && numberValue > 0 ? numberValue : null;
}

function asUsageLimit(value: unknown): number | null {
  const numberValue = Number(value);
  return Number.isInteger(numberValue) && numberValue >= 0 && numberValue <= MAX_MONEY_VALUE
    ? numberValue
    : null;
}

function validateCoupon(payload: unknown): Coupon | { message: string } {
  if (!payload || typeof payload !== 'object') return { message: 'Coupon invalide.' };
  const body = payload as Record<string, unknown>;

  // Delivery remains an outcome of discounted merchandise subtotal only.
  if (body.freeShipping === true || body.deliveryOnly === true || body.shippingDiscount === true || body.giftItem) {
    return { message: 'Les coupons de livraison ou cadeau ne sont pas pris en charge.' };
  }

  const code = normalizeCode(body.code);
  if (!code) return { message: 'Le code promo doit contenir 3 à 40 caractères alphanumériques, tirets ou underscores.' };

  const discountType = body.discountType;
  if (discountType !== 'percent' && discountType !== 'fixed') {
    return { message: 'Type de réduction non pris en charge.' };
  }

  const discountValue = asPositiveMoney(body.discountValue);
  if (discountValue === null || (discountType === 'percent' && discountValue > 100)) {
    return { message: 'Valeur de réduction invalide.' };
  }

  const minPurchase = asNonNegativeMoney(body.minPurchase ?? 0);
  if (minPurchase === null) return { message: 'Montant minimum invalide.' };

  const usageLimit = asUsageLimit(body.usageLimit ?? 0);
  if (usageLimit === null) return { message: 'Limite d’utilisation invalide.' };

  const startDate = body.startDate === '' || body.startDate === undefined ? undefined : body.startDate;
  if (startDate !== undefined && !isDateOnly(startDate)) return { message: 'Date de début invalide.' };
  if (!isDateOnly(body.expiryDate)) return { message: 'Date d’expiration invalide.' };
  if (startDate && startDate > body.expiryDate) return { message: 'La date de début doit précéder la date d’expiration.' };
  if (body.expiryDate < new Date().toISOString().slice(0, 10)) return { message: 'La date d’expiration doit être aujourd’hui ou ultérieure.' };
  if (body.isActive !== undefined && typeof body.isActive !== 'boolean') return { message: 'État du coupon invalide.' };

  return {
    code,
    discountType,
    discountValue,
    discountPercent: discountType === 'percent' ? discountValue : 0,
    minPurchase,
    ...(startDate ? { startDate } : {}),
    expiryDate: body.expiryDate,
    usageLimit,
    isActive: body.isActive !== false,
    freeShipping: false,
  };
}

async function getSettings() {
  const { data, error: settingsError } = await supabase
    .from('settings')
    .select('value')
    .eq('id', 1)
    .single();
  if (settingsError || !data?.value || typeof data.value !== 'object') throw settingsError || new Error('Settings not found');
  return data.value as Record<string, unknown>;
}

function getCoupons(settings: Record<string, unknown>): Coupon[] {
  if (!Array.isArray(settings.coupons)) return [];

  return settings.coupons.flatMap((candidate): Coupon[] => {
    if (!candidate || typeof candidate !== 'object') return [];
    const stored = candidate as Record<string, unknown>;
    if (stored.freeShipping === true || stored.deliveryOnly === true || stored.shippingDiscount === true || stored.giftItem) return [];

    const code = normalizeCode(stored.code);
    const discountType = stored.discountType === 'fixed' ? 'fixed' : 'percent';
    const discountValue = asNonNegativeMoney(stored.discountValue ?? stored.discountPercent);
    const minPurchase = asNonNegativeMoney(stored.minPurchase ?? 0);
    const usageLimit = asUsageLimit(stored.usageLimit ?? 0);
    if (!code || discountValue === null || minPurchase === null || usageLimit === null) return [];

    const startDate = isDateOnly(stored.startDate) ? stored.startDate : undefined;
    const expiryDate = isDateOnly(stored.expiryDate) ? stored.expiryDate : undefined;
    return [{
      code,
      discountType,
      discountValue,
      discountPercent: discountType === 'percent' ? discountValue : 0,
      minPurchase,
      ...(startDate ? { startDate } : {}),
      ...(expiryDate ? { expiryDate } : {}),
      usageLimit,
      isActive: stored.isActive !== false,
      freeShipping: false,
    }];
  });
}

async function saveCoupons(settings: Record<string, unknown>, coupons: Coupon[]) {
  const value = {
    ...settings,
    coupons: coupons.map((coupon) => ({ ...coupon, freeShipping: false })),
    freeShippingThreshold: FREE_SHIPPING_SUBTOTAL_DH,
  };
  const { error: updateError } = await supabase
    .from('settings')
    .update({ value })
    .eq('id', 1);
  if (updateError) throw updateError;

  revalidateTag(PUBLIC_SETTINGS_CACHE_TAG, { expire: 0 });
  revalidatePath('/');
}

export async function GET() {
  const authorization = await getCurrentAdminOperator();
  if (!authorization.authorized) return authorization.response;

  try {
    const settings = await getSettings();
    return NextResponse.json({ success: true, coupons: getCoupons(settings) });
  } catch (caught) {
    console.error('List coupons error:', caught);
    return error('Impossible de charger les coupons.', 500);
  }
}

export async function POST(request: Request) {
  const authorization = await authorizeAdminMutation({ allow: canManageSettings });
  if (!authorization.authorized) return authorization.response;

  try {
    const coupon = validateCoupon(await request.json());
    if ('message' in coupon) return error(coupon.message);

    const settings = await getSettings();
    const coupons = getCoupons(settings);
    if (coupons.some((candidate) => candidate.code.toUpperCase() === coupon.code)) {
      return error('Ce code promo existe déjà.', 409);
    }

    await saveCoupons(settings, [...coupons, coupon]);
    return NextResponse.json({ success: true, coupon }, { status: 201 });
  } catch (caught) {
    console.error('Create coupon error:', caught);
    return error('Impossible d’enregistrer le coupon.', 500);
  }
}

export async function PATCH(request: Request) {
  const authorization = await authorizeAdminMutation({ allow: canManageSettings });
  if (!authorization.authorized) return authorization.response;

  try {
    const body = await request.json();
    const code = normalizeCode(body?.code);
    if (!code) return error('Code promo invalide.');
    if (body?.isActive !== undefined && typeof body.isActive !== 'boolean') return error('État du coupon invalide.');

    const settings = await getSettings();
    const coupons = getCoupons(settings);
    const current = coupons.find((coupon) => coupon.code.toUpperCase() === code);
    if (!current) return error('Code promo introuvable.', 404);

    const isActive: boolean = typeof body?.isActive === 'boolean' ? body.isActive : !current.isActive;
    const coupon: Coupon = { ...current, isActive, freeShipping: false };
    await saveCoupons(settings, coupons.map((candidate) => candidate.code.toUpperCase() === code ? coupon : candidate));
    return NextResponse.json({ success: true, coupon });
  } catch (caught) {
    console.error('Update coupon error:', caught);
    return error('Impossible de mettre à jour le coupon.', 500);
  }
}

export async function DELETE(request: Request) {
  const authorization = await authorizeAdminMutation({ allow: canManageSettings });
  if (!authorization.authorized) return authorization.response;

  try {
    const code = normalizeCode(new URL(request.url).searchParams.get('code'));
    if (!code) return error('Code promo invalide.');

    const settings = await getSettings();
    const coupons = getCoupons(settings);
    if (!coupons.some((coupon) => coupon.code.toUpperCase() === code)) {
      return error('Code promo introuvable.', 404);
    }

    await saveCoupons(settings, coupons.filter((coupon) => coupon.code.toUpperCase() !== code));
    return NextResponse.json({ success: true });
  } catch (caught) {
    console.error('Delete coupon error:', caught);
    return error('Impossible de supprimer le coupon.', 500);
  }
}
