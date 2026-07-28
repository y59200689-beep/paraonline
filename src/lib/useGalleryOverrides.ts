'use client';

import { useState, useEffect } from 'react';
import { getOptimizedImageUrl } from '@/lib/image-optimizer';
import { getGalleryOverrides } from '@/lib/gallery-storage';

// Read the gallery overrides stamped onto window by ThemeScript BEFORE React hydrates.
// Falls back to direct localStorage read if the inline script hasn't run yet.
function getInitialOverrides(): Record<string, string> {
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
  const [overrides, setOverrides] = useState<Record<string, string>>(getInitialOverrides);

  useEffect(() => {
    // 1. Fetch server-side overrides via public API and merge into localStorage cache
    const fetchServerOverrides = async () => {
      try {
        const res = await fetch('/api/gallery-overrides', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.overrides) {
            setOverrides(prev => {
              const merged = { ...prev, ...data.overrides };
              // Persist the merged server overrides to localStorage for next render
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
          setOverrides(prev => {
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

  const getDisplayImage = (defaultSrc: string, ...keys: string[]) => {
    for (const k of keys) {
      if (k && overrides[k]) return overrides[k];
    }
    if (defaultSrc) {
      const cleanUrl = defaultSrc.split('?')[0];
      const cleanPath = cleanUrl.replace(/^\//, '');
      if (overrides[cleanPath]) return overrides[cleanPath];
      if (overrides[cleanUrl]) return overrides[cleanUrl];
      if (overrides[defaultSrc]) return overrides[defaultSrc];

      // Extract filename without extension (e.g. /images/categories/solaire.png -> solaire)
      const filename = cleanPath.split('/').pop()?.split('.')[0];
      if (filename && overrides[filename]) return overrides[filename];
      if (filename && overrides[`cat_${filename}`]) return overrides[`cat_${filename}`];
      if (filename && overrides[`concern_${filename}`]) return overrides[`concern_${filename}`];
    }
    return getOptimizedImageUrl(defaultSrc);
  };

  return { overrides, getDisplayImage };
}
