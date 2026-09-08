'use client';

import { useEffect, useState } from 'react';

export type BrandImageStatus = 'loaded' | 'missing' | 'unknown';

/** Check off-screen logos too, with bounded concurrency and no database writes. */
export function useBrandImages(sources: string[], enabled: boolean) {
  const [results, setResults] = useState<Record<string, BrandImageStatus>>({});
  const sourceKey = JSON.stringify([...new Set(sources)]);
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const cleanup = new Set<() => void>();
    const queue: string[] = JSON.parse(sourceKey);
    async function worker() {
      while (!cancelled && queue.length) {
        const src = queue.shift()!;
        if (!src) {
          setResults(previous => ({ ...previous, [src]: 'missing' }));
          continue;
        }
        await new Promise<void>(resolve => {
          const image = new window.Image();
          const finish = (status: BrandImageStatus) => {
            clearTimeout(timer);
            image.onload = null;
            image.onerror = null;
            cleanup.delete(stop);
            if (!cancelled) setResults(previous => ({ ...previous, [src]: status }));
            resolve();
          };
          const stop = () => finish('unknown');
          const timer = setTimeout(stop, 8000);
          cleanup.add(stop);
          image.onload = () => finish(image.naturalWidth > 0 ? 'loaded' : 'missing');
          image.onerror = () => finish('missing');
          image.src = src;
        });
      }
    }
    void Promise.all(Array.from({ length: 8 }, worker));
    return () => { cancelled = true; cleanup.forEach(stop => stop()); };
  }, [sourceKey, enabled]);
  return results;
}
