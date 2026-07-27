'use client';

import { useState, useEffect } from 'react';
import { getOptimizedImageUrl } from '@/lib/image-optimizer';
import { getGalleryOverrides } from '@/lib/gallery-storage';

export function useGalleryOverrides() {
  const [overrides, setOverrides] = useState<Record<string, string>>({});

  useEffect(() => {
    // 1. Fetch server-side overrides via public API
    const fetchServerOverrides = async () => {
      try {
        const res = await fetch('/api/gallery-overrides', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.overrides) {
            setOverrides(prev => ({ ...data.overrides, ...prev }));
          }
        }
      } catch {}
    };
    fetchServerOverrides();

    // 2. Also apply persistent client-side IndexedDB & localStorage overrides
    if (typeof window !== 'undefined') {
      const loadLocalOverrides = async () => {
        try {
          const stored = await getGalleryOverrides();
          setOverrides(prev => ({ ...prev, ...stored }));
        } catch {}
      };
      loadLocalOverrides();
      window.addEventListener('gallery_overrides_updated', loadLocalOverrides);
      return () => window.removeEventListener('gallery_overrides_updated', loadLocalOverrides);
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

