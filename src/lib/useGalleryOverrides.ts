'use client';

import { getOptimizedImageUrl } from '@/lib/image-optimizer';
import { useSettings } from '@/context/SettingsContext';

/**
 * Gallery overrides hook — uses ONLY server-provided galleryOverrides
 * from SettingsContext (which are populated by getPublicSettings → Supabase DB).
 *
 * localStorage / IndexedDB / window.__PARA_GALLERY_OVERRIDES__ are NO LONGER
 * used for image resolution. They were causing stale/broken URLs to override
 * the correct static image paths on page refresh.
 *
 * The admin gallery page writes overrides to Supabase DB (row 99 + row 1),
 * which is the single source of truth. getPublicSettings() merges those
 * overrides into settings.galleryOverrides on every server render.
 */
export function useGalleryOverrides() {
  const { settings } = useSettings();

  // Server-provided overrides are the ONLY source of truth
  const activeOverrides: Record<string, string> = settings?.galleryOverrides || {};

  const getDisplayImage = (defaultSrc: string, ...keys: string[]) => {
    // 1. Check explicit key overrides from server
    for (const k of keys) {
      if (k && activeOverrides[k]) return activeOverrides[k];
    }

    // 2. Check path-based matches
    if (defaultSrc) {
      const cleanUrl = defaultSrc.split('?')[0];
      const cleanPath = cleanUrl.replace(/^\//, '');
      if (activeOverrides[cleanPath]) return activeOverrides[cleanPath];
      if (activeOverrides[cleanUrl]) return activeOverrides[cleanUrl];
      if (activeOverrides[defaultSrc]) return activeOverrides[defaultSrc];

      // Extract filename without extension (e.g. /images/categories/solaire.png -> solaire)
      const filename = cleanPath.split('/').pop()?.split('.')[0];
      if (filename && activeOverrides[filename]) return activeOverrides[filename];
      if (filename && activeOverrides[`cat_${filename}`]) return activeOverrides[`cat_${filename}`];
      if (filename && activeOverrides[`concern_${filename}`]) return activeOverrides[`concern_${filename}`];
    }

    // 3. Fall back to the default source path (clean, no query params)
    const normalizedDefault = defaultSrc ? defaultSrc.replace(/\.png(\?.*)?$/i, '.webp$1') : defaultSrc;
    return getOptimizedImageUrl(normalizedDefault);
  };

  return { overrides: activeOverrides, getDisplayImage };
}
