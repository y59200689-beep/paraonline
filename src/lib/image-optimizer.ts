/**
 * Image Format & Performance Optimization Utility
 * 
 * Automatically intercepts image source paths and converts them to highly optimized,
 * modern WebP format requests at runtime. Handles local files, Unsplash assets,
 * and Shopify CDN files dynamically.
 */

export function getOptimizedImageUrl(src: string | undefined): string {
  if (!src) return '';

  // 1. Local Image Assets
  if (src.startsWith('/images/')) {
    // Convert local PNG/JPG references to WebP
    return src.replace(/\.(png|jpg|jpeg)$/i, '.webp');
  }

  // 2. Shopify CDN Assets (e.g. beautymarket.ma/cdn/...)
  if (src.includes('cdn.shopify.com') || src.includes('beautymarket.ma/cdn/')) {
    // If it doesn't have query params, start them, else append format=webp
    const separator = src.includes('?') ? '&' : '?';
    if (!src.includes('format=')) {
      return `${src}${separator}format=webp`;
    }
  }

  // 3. Unsplash Assets
  if (src.includes('images.unsplash.com')) {
    // Ensure format is set to webp and fetch compressed version
    let optimizedSrc = src;
    if (!src.includes('auto=format')) {
      const separator = src.includes('?') ? '&' : '?';
      optimizedSrc = `${optimizedSrc}${separator}auto=format`;
    }
    if (!optimizedSrc.includes('fm=')) {
      optimizedSrc = `${optimizedSrc}&fm=webp`;
    }
    // Set a reasonable default quality if not defined
    if (!optimizedSrc.includes('q=')) {
      optimizedSrc = `${optimizedSrc}&q=75`;
    }
    return optimizedSrc;
  }

  return src;
}
