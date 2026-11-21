export function isPromotionPercent(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 99;
}

export function promotionalPrice(price: number, percent: number): number {
  if (!percent) return price;
  const cents = Math.round((price + Number.EPSILON) * 100);
  return Math.round(cents * (100 - percent) / 100) / 100;
}

/** Exclusive base-price limit corresponding to an inclusive storefront price limit. */
export function promotionalPriceLimit(maxPrice: number, percent: number): number {
  const maxCents = Math.floor(maxPrice * 100 + 1e-9);
  return (Math.ceil((maxCents * 100 + 50) / (100 - percent)) - 0.5) / 100;
}

export function applyStorewidePromotion<T extends { price: number; comparePrice: number }>(
  product: T,
  percent: number,
): T & { storewidePromotionPercent?: number } {
  if (!percent) return product;
  return {
    ...product,
    price: promotionalPrice(product.price, percent),
    comparePrice: Math.max(product.price, product.comparePrice),
    storewidePromotionPercent: percent,
  };
}
