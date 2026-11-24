import type { HomepageSectionItem, Settings } from '@/context/SettingsContext';
import type { Product } from '@/lib/data';

export const BEST_SELLERS_LIMIT = 12;

export function getBestSellerPins(
  homepage: Settings['homepageSections'],
  section?: HomepageSectionItem,
): number[] {
  return section?.settings?.productIds ?? homepage?.bestSellersProductIds ?? [];
}

export function resolveHomepageBestSellers(
  products: Product[],
  homepage: Settings['homepageSections'],
  sections?: HomepageSectionItem[],
): Product[] {
  const bestSellers = sections?.find(section => section.type === 'bestSellers');
  const weeklySales = sections?.find(section => section.type === 'weeklySales');
  const showBestSellers = bestSellers?.visible ?? homepage?.showBestSellers ?? true;
  // Legacy weekly selections are part of the combined grid when no separate
  // weekly section exists.
  const showWeeklySales = weeklySales?.visible ?? homepage?.showWeeklySales ?? true;
  if (!showBestSellers && !showWeeklySales) return [];

  const ranked = products.filter(product => product.status !== 'draft')
    .sort((a, b) => (b.reviews ?? 0) - (a.reviews ?? 0));
  const available = ranked.filter(product => (product.stock ?? 0) > 0);
  const byId = new Map(ranked.map(product => [product.id, product]));
  const pins = [
    ...(showBestSellers ? getBestSellerPins(homepage, bestSellers) : []),
    ...(showWeeklySales ? weeklySales?.settings?.productIds ?? homepage?.weeklySalesProductIds ?? [] : []),
  ];
  const candidates = [...pins.map(id => byId.get(id)), ...available];
  const unique = new Map<number, Product>();
  for (const product of candidates) {
    if (product && !unique.has(product.id)) unique.set(product.id, product);
    if (unique.size === BEST_SELLERS_LIMIT) break;
  }
  return [...unique.values()];
}
