'use client';

import { useState, useEffect } from 'react';
import { getOptimizedImageUrl } from '@/lib/image-optimizer';
import { getGalleryOverrides } from '@/lib/gallery-storage';
import { useSettings } from '@/context/SettingsContext';

// Read the gallery overrides stamped onto window by ThemeScript BEFORE React hydrates.
// Falls back to direct localStorage read if the inline script hasn't run yet.
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
    // 1. Fetch server-side overrides via public API and merge into localStorage cache
    const fetchServerOverrides = async () => {
      try {
        const res = await fetch('/api/gallery-overrides', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.overrides) {
            setLocalOverrides(prev => {
              const merged = { ...prev, ...data.overrides };
              try {
                localStorage.setItem('custom_gallery_overrides', JSON.stringify(merged));
              } catch {}
              return merged;
            });
          }
        }
      } catch {}
    };
    fetchServerOverrides();

    // 2. Also apply persistent client-side IndexedDB overrides (async, higher fidelity)
    if (typeof window !== 'undefined') {
      const loadLocalOverrides = async () => {
        try {
          const stored = await getGalleryOverrides();
          setLocalOverrides(prev => {
            const merged = { ...prev, ...stored };
            try {
              localStorage.setItem('custom_gallery_overrides', JSON.stringify(merged));
            } catch {}
            return merged;
          });
        } catch {}
      };
      loadLocalOverrides();
      window.addEventListener('gallery_overrides_updated', loadLocalOverrides);
      return () => window.removeEventListener('gallery_overrides_updated', loadLocalOverrides);
    }
  }, []);

  const activeOverrides: Record<string, string> = {
    ...(settings?.galleryOverrides || {}),
    ...localOverrides,
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

