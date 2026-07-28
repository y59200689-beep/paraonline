'use client';

import { useState, useEffect } from 'react';
import { getOptimizedImageUrl } from '@/lib/image-optimizer';
import { useSettings } from '@/context/SettingsContext';

function getWindowOverrides(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    if ((window as any).__PARA_GALLERY_OVERRIDES__) {
      return (window as any).__PARA_GALLERY_OVERRIDES__;
    }
    const stored = localStorage.getItem('custom_gallery_overrides');
    if (stored) return JSON.parse(stored);
  } catch {}
  return {};
}

export function useGalleryOverrides() {
  const { settings } = useSettings();
  const [localOverrides, setLocalOverrides] = useState<Record<string, string>>(getWindowOverrides);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleUpdate = () => {
      try {
        const stored = localStorage.getItem('custom_gallery_overrides');
        const parsed = stored ? JSON.parse(stored) : {};
        const winOverrides = (window as any).__PARA_GALLERY_OVERRIDES__ || {};
        setLocalOverrides({ ...winOverrides, ...parsed });
      } catch {}
    };

    window.addEventListener('gallery_overrides_updated', handleUpdate);
    return () => window.removeEventListener('gallery_overrides_updated', handleUpdate);
  }, []);

  // Server-provided settings.galleryOverrides take top priority over legacy local browser caches,
  // preventing stale local caches from overriding newly updated server images.
  const activeOverrides: Record<string, string> = {
    ...localOverrides,
    ...(settings?.galleryOverrides || {}),
  };

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
