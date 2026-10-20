const CATALOG_RETURN_KEY = 'paradivine:catalog-return';

/** Only same-origin catalogue destinations can be used for the return link. */
export function safeCatalogReturnHref(value: string | null, origin: string): string | null {
  if (!value) return null;
  try {
    const url = new URL(value, origin);
    if (url.origin !== origin || url.pathname !== '/products') return null;
    return url.pathname + url.search;
  } catch { return null; }
}

export function rememberCatalogLocation(href: string) {
  if (typeof window === 'undefined' || window.location.pathname !== '/products') return;
  const safeHref = safeCatalogReturnHref(href, window.location.origin);
  if (!safeHref) return;
  if (window.location.pathname + window.location.search !== safeHref) {
    // Next.js supports native replaceState for client-side filter updates.
    // Replacing avoids creating a history entry for every typed character.
    window.history.replaceState(null, '', safeHref);
  }
  try { window.sessionStorage.setItem(CATALOG_RETURN_KEY, safeHref); } catch { /* Browsing must still work when storage is blocked. */ }
}

export function getCatalogReturnLocation(): string {
  if (typeof window === 'undefined') return '/products';
  try {
    const saved = safeCatalogReturnHref(window.sessionStorage.getItem(CATALOG_RETURN_KEY), window.location.origin);
    if (saved) return saved;
  } catch { /* Fall back to the referrer when session storage is unavailable. */ }
  return safeCatalogReturnHref(document.referrer, window.location.origin) || '/products';
}
