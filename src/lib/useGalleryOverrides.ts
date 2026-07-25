'use client';

import { useState, useEffect } from 'react';
import { getOptimizedImageUrl } from '@/lib/image-optimizer';

export function useGalleryOverrides() {
  const [overrides, setOverrides] = useState<Record<string, string>>({});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loadOverrides = () => {
        try {
          const stored = JSON.parse(localStorage.getItem('custom_gallery_overrides') || '{}');
          setOverrides(stored);
        } catch (e) {}
      };
      loadOverrides();
      window.addEventListener('gallery_overrides_updated', loadOverrides);
      return () => window.removeEventListener('gallery_overrides_updated', loadOverrides);
    }
  }, []);

  const getDisplayImage = (defaultSrc: string, ...keys: string[]) => {
    for (const k of keys) {
      if (overrides[k]) return overrides[k];
    }
    if (defaultSrc) {
      const cleanPath = defaultSrc.replace(/^\//, '');
      if (overrides[cleanPath]) return overrides[cleanPath];
      if (overrides[defaultSrc]) return overrides[defaultSrc];
    }
    return getOptimizedImageUrl(defaultSrc);
  };

  return { overrides, getDisplayImage };
}
