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
  discountPercent: number;
  freeShipping: boolean;
  discountType?: 'percent' | 'fixed';
  discountValue?: number;
  minPurchase?: number;
  isActive?: boolean;
  [key: string]: any;
}

export interface ShippingSettings {
  freeShippingThreshold?: number;
  shippingFee?: number;
  shippingRules?: { city: string; fee: number }[];
}

/**
 * Calculates the subtotal of the cart items.
 */
export function calculateSubtotal(cart: MinimalCartItem[]): number {
  return cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
}

/**
 * Calculates the discount amount based on the coupon type (fixed or percent).
 */
export function calculateDiscount(subtotal: number, coupon: MinimalCoupon | null): number {
  if (!coupon) return 0;
  const type = coupon.discountType || 'percent';
  const value = coupon.discountValue !== undefined ? coupon.discountValue : coupon.discountPercent;
  
  if (type === 'fixed') {
    return Math.min(subtotal, value);
  } else {
    return Math.round(subtotal * (value / 100));
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
  const isFreeShipping = isCouponFreeShipping || subtotal >= threshold || subtotal === 0;
  
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
export function calculateAmountNeededForFreeShipping(subtotal: number, threshold: number = 600): number | boolean {
  return subtotal >= threshold ? false : threshold - subtotal;
}

/**
 * Calculates the final total.
 */
export function calculateTotal(subtotal: number, discountAmount: number, shippingFee: number): number {
  return subtotal - discountAmount + shippingFee;
}
