'use client';

import { useState, useEffect } from 'react';
import { getOptimizedImageUrl } from '@/lib/image-optimizer';

export function useGalleryOverrides() {
  const [overrides, setOverrides] = useState<Record<string, string>>({});

  useEffect(() => {
    // 1. Fetch server-side overrides from gallery-overrides.json via public API.
    //    This is the persistent source of truth — works after page refresh and on any browser.
    const fetchServerOverrides = async () => {
      try {
        const res = await fetch('/api/gallery-overrides', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.overrides && Object.keys(data.overrides).length > 0) {
            // Server overrides take top priority over local storage!
            setOverrides(prev => ({ ...prev, ...data.overrides }));
          }
        }
      } catch {}
    };

    // 2. Load any client-side localStorage overrides first for instant preview
    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('custom_gallery_overrides') || '{}');
        setOverrides(stored);
      } catch {}

      const loadLocalOverrides = () => {
        try {
          const stored = JSON.parse(localStorage.getItem('custom_gallery_overrides') || '{}');
          setOverrides(prev => ({ ...prev, ...stored }));
        } catch {}
      };
      window.addEventListener('gallery_overrides_updated', loadLocalOverrides);
      fetchServerOverrides();
      return () => window.removeEventListener('gallery_overrides_updated', loadLocalOverrides);
    } else {
      fetchServerOverrides();
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

