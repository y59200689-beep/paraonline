export const PRODUCT_IMAGE_FALLBACK = '/images/product-image-fallback.png';

export function safePublicImage(src: string | null | undefined, fallback = PRODUCT_IMAGE_FALLBACK) {
  return typeof src === 'string' && src.trim() ? src.trim() : fallback;
}

/** The legacy WordPress origin is occasionally too slow for Next's image proxy.
 * Let the browser request it directly so the UI can switch to the local fallback
 * immediately when the remote host is unavailable. */
export function shouldBypassNextImageOptimization(src: string | null | undefined) {
  if (!src) return false;

  try {
    const url = new URL(src);
    return url.hostname === 'paraofficinal.store'
      || (url.hostname.endsWith('.supabase.co') && url.pathname.includes('/storage/v1/object/public/'));
  } catch {
    return false;
  }
}
