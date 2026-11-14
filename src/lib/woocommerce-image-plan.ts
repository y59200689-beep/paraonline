import { createHash } from 'node:crypto';

export const WOO_STORE = 'https://paraofficinal.store';
export type ImageProduct = { id: number; sku: string | null; image: string | null; images: string[] | null };
export type WooProduct = { id: number; sku: string; images: { src: string }[] };
export const normalizeSku = (sku: string) => sku.trim().toLowerCase();
export const hasImage = (url: string | null | undefined): url is string => Boolean(url?.trim() && url.trim() !== '/placeholder.png');

export function imageKey(source: string) {
  return `woocommerce/${createHash('sha256').update(source).digest('hex')}.webp`;
}

// Only download media from the configured store. No arbitrary remote fetches.
export function validWooImage(source: string) {
  try {
    const url = new URL(source);
    return url.origin === WOO_STORE && url.pathname.startsWith('/wp-content/uploads/') && !url.username && !url.password;
  } catch { return false; }
}

export function missingImages(product: ImageProduct, sources: string[]) {
  if ([product.image, ...(product.images || [])].some(hasImage)) return [];
  return [...new Set(sources)].filter(validWooImage);
}

export function planImages(products: ImageProduct[], woo: WooProduct[]) {
  const local = new Map<string, ImageProduct[]>();
  const remoteCounts = new Map<string, number>();
  for (const product of products) {
    if (!product.sku?.trim()) continue;
    const sku = normalizeSku(product.sku);
    local.set(sku, [...(local.get(sku) || []), product]);
  }
  for (const product of woo) {
    const sku = normalizeSku(product.sku || '');
    if (sku) remoteCounts.set(sku, (remoteCounts.get(sku) || 0) + 1);
  }
  const entries: { id: number; sku: string; sources: string[] }[] = [];
  let unmatched = 0, ambiguous = 0, unchanged = 0, rejectedImages = 0;
  for (const remote of woo) {
    const sku = normalizeSku(remote.sku || '');
    const matches = local.get(sku);
    if (!sku || !matches) { unmatched++; continue; }
    if (matches.length !== 1 || remoteCounts.get(sku) !== 1) { ambiguous++; continue; }
    const supplied = (remote.images || []).map(image => image.src);
    rejectedImages += supplied.filter(source => !validWooImage(source)).length;
    const sources = missingImages(matches[0], supplied);
    if (sources.length) entries.push({ id: matches[0].id, sku: matches[0].sku!, sources });
    else unchanged++;
  }
  return { entries, unmatched, ambiguous, unchanged, rejectedImages, scanned: woo.length };
}
