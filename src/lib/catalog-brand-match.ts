export const sanitizeCatalogSearch = (value: string) => value
  .normalize('NFKC')
  .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
  .replace(/\s+/g, ' ')
  .trim()
  .slice(0, 120);

/** Existing storefront brand matching: first two words, hyphens replaced. */
export function catalogBrandPrefix(name: string) {
  return sanitizeCatalogSearch(name).replace(/-/g, ' ').trim().split(' ').slice(0, 2).join(' ');
}
