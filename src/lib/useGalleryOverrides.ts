'use client';

import { getOptimizedImageUrl } from '@/lib/image-optimizer';
import { useSettings } from '@/context/SettingsContext';

export function useGalleryOverrides() {
  const { settings } = useSettings();
  const activeOverrides = settings?.galleryOverrides || {};

  const getDisplayImage = (defaultSrc: string, ...keys: string[]) => {
    for (const k of keys) {
      if (k && activeOverrides[k]) return activeOverrides[k];
    }
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
    const normalizedDefault = defaultSrc ? defaultSrc.replace(/\.png(\?.*)?$/i, '.webp$1') : defaultSrc;
    return getOptimizedImageUrl(normalizedDefault);
  };

  return { overrides: activeOverrides, getDisplayImage };
}
