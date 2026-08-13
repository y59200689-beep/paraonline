export interface MinimalProduct {
  price: number;
  [key: string]: any;
}

export interface MinimalCartItem {
  product: MinimalProduct;
  quantity: number;
}

export interface MinimalCoupon {
  code: string;
  discountPercent?: number;
  freeShipping?: boolean;
  discountType?: 'percent' | 'fixed';
  discountValue?: number;
  minPurchase?: number;
  isActive?: boolean;
  [key: string]: any;
}

export interface GiftRange {
  minAmount: number;
  maxAmount: number;
  productId: number;
  productName: string;
  isActive?: boolean;
}

export interface ShippingSettings {
  freeShippingThreshold?: number;
  shippingFee?: number;
  shippingRules?: { city: string; fee: number }[];
  giftRanges?: GiftRange[];
  loyaltyPointsPerDh?: number;
}

export interface GiftProductEligibility {
  id: number;
  stock: number;
  status?: string | null;
  title?: string | null;
}

export interface CommerceSummary {
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  total: number;
  totalSavings: number;
  loyaltyPoints: number;
  isFreeShipping: boolean;
  amountNeededForFreeShipping: number | false;
  activeGiftRange: GiftRange | null;
  giftItem: string | null;
}

export const roundMoney = (value: number): number =>
  Math.round((Number(value) + Number.EPSILON) * 100) / 100;

/**
 * Calculates the subtotal of the cart items.
 */
export function calculateSubtotal(cart: MinimalCartItem[]): number {
  return roundMoney(cart.reduce((acc, item) => acc + Number(item.product.price) * Number(item.quantity), 0));
}

/**
 * Calculates the discount amount based on the coupon type (fixed or percent).
 */
export function calculateDiscount(subtotal: number, coupon: MinimalCoupon | null): number {
  if (!coupon) return 0;
  const type = coupon.discountType || 'percent';
  const value = Number(coupon.discountValue !== undefined ? coupon.discountValue : coupon.discountPercent || 0);
  
  if (type === 'fixed') {
    return roundMoney(Math.min(subtotal, value));
  } else {
    return roundMoney(subtotal * (value / 100));
  }
}

/**
 * Calculates shipping fee depending on city shipping overrides and free shipping threshold settings.
 */
export function calculateShippingFee(
  subtotal: number,
  shippingCity: string,
  settings: ShippingSettings,
  isCouponFreeShipping: boolean
): number {
  const threshold = settings.freeShippingThreshold || 600;
  const activeGiftRange = settings.giftRanges?.find(
    (r) => r.isActive !== false && subtotal >= r.minAmount && subtotal <= r.maxAmount
  );
  const isGiftFreeShipping = !!(
    activeGiftRange &&
    (activeGiftRange.productId === -1 || activeGiftRange.productName === 'Livraison Gratuite')
  );
  const isFreeShipping = isCouponFreeShipping || isGiftFreeShipping || subtotal >= threshold || subtotal === 0;

  if (isFreeShipping) return 0;
  
  if (shippingCity) {
    const cityRule = settings.shippingRules?.find(
      (r) => r.city.toLowerCase() === shippingCity.toLowerCase()
    );
    if (cityRule) return cityRule.fee;
  }
  
  return settings.shippingFee !== undefined ? settings.shippingFee : 35;
}

/**
 * Calculates the amount remaining to qualify for free shipping.
 */
export function calculateAmountNeededForFreeShipping(subtotal: number, threshold: number = 600): number | false {
  return subtotal >= threshold ? false : threshold - subtotal;
}

/**
 * Calculates the final total.
 */
export function calculateTotal(subtotal: number, discountAmount: number, shippingFee: number): number {
  return roundMoney(Math.max(0, subtotal - discountAmount + shippingFee));
}

/**
 * The single deterministic commerce calculation used by the cart, checkout,
 * order API and admin previews. Server callers should provide giftProducts so
 * an unavailable gift can never be advertised or attached to an order.
 */
export function calculateCommerceSummary({
  cart,
  coupon,
  settings,
  shippingCity = '',
  giftProducts,
}: {
  cart: MinimalCartItem[];
  coupon: MinimalCoupon | null;
  settings: ShippingSettings;
  shippingCity?: string;
  giftProducts?: GiftProductEligibility[];
}): CommerceSummary {
  const subtotal = calculateSubtotal(cart);
  const discountAmount = calculateDiscount(subtotal, coupon);
  const giftProductsById = giftProducts
    ? new Map(giftProducts.map((product) => [Number(product.id), product]))
    : null;
  const activeGiftRange = [...(settings.giftRanges || [])]
    .filter((range) => range.isActive !== false)
    .filter((range) => subtotal >= Number(range.minAmount) && subtotal <= Number(range.maxAmount))
    .sort((left, right) => Number(right.minAmount) - Number(left.minAmount))
    .find((range) => {
      if (Number(range.productId) === -1 || range.productName === 'Livraison Gratuite') return true;
      if (!giftProductsById) return true;
      const product = giftProductsById.get(Number(range.productId));
      return Boolean(product && Number(product.stock) > 0 && (!product.status || product.status === 'live'));
    }) || null;
  const giftGrantsFreeShipping = Boolean(
    activeGiftRange &&
      (Number(activeGiftRange.productId) === -1 || activeGiftRange.productName === 'Livraison Gratuite')
  );
  const shippingFee = roundMoney(
    calculateShippingFee(
      subtotal,
      shippingCity,
      { ...settings, giftRanges: activeGiftRange ? [activeGiftRange] : [] },
      Boolean(coupon?.freeShipping || giftGrantsFreeShipping)
    )
  );
  const threshold = Number(settings.freeShippingThreshold || 600);
  const amountNeededForFreeShipping = calculateAmountNeededForFreeShipping(subtotal, threshold);
  const isFreeShipping = shippingFee === 0;
  const total = calculateTotal(subtotal, discountAmount, shippingFee);

  return {
    subtotal,
    discountAmount,
    shippingFee,
    total,
    totalSavings: discountAmount,
    loyaltyPoints: Math.max(0, Math.round(subtotal * Number(settings.loyaltyPointsPerDh ?? 1))),
    isFreeShipping,
    amountNeededForFreeShipping,
    activeGiftRange,
    giftItem: activeGiftRange && Number(activeGiftRange.productId) !== -1
      ? activeGiftRange.productName
      : null,
  };
}
