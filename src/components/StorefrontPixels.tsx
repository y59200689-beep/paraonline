'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { PIXEL_PURCHASE_EVENT, startPixels, type PurchaseEvent } from '@/lib/browser-pixels';
import type { PixelConfig } from '@/lib/pixels';

let runtime: ReturnType<typeof startPixels> | undefined;
const handled = new Set<string>();

export function StorefrontPixels() {
  const pathname = usePathname();
  const [pixels, setPixels] = useState<PixelConfig>();
  const pending = useRef<PurchaseEvent | undefined>(undefined);
  const lastPath = useRef('');
  const storefront = Boolean(pathname && !/^\/(admin|api)(\/|$)/.test(pathname));
  const publicPage = storefront && !/^\/(checkout|customer|suivi-commande)(\/|$)/.test(pathname);

  useEffect(() => {
    if (!storefront) return;
    const controller = new AbortController();
    void fetch('/api/pixels', { signal: controller.signal })
      .then(async response => { if (response.ok) setPixels((await response.json()).pixels); })
      .catch(() => {});
    return () => controller.abort();
  }, [storefront]);

  useEffect(() => {
    if (!storefront) return;
    const send = (purchase: PurchaseEvent) => {
      if (!pixels || !Object.keys(pixels).length) {
        pending.current = purchase;
        return;
      }
      const key = `para-purchase:${purchase.id}`;
      if (handled.has(key)) return;
      try { if (localStorage.getItem(key)) return; } catch {}
      runtime ??= startPixels(pixels);
      runtime.purchase(purchase);
      handled.add(key);
      try { localStorage.setItem(key, '1'); } catch {}
    };
    function onPurchase(event: Event) { send((event as CustomEvent<PurchaseEvent>).detail); }
    window.addEventListener(PIXEL_PURCHASE_EVENT, onPurchase);
    if (pending.current && pathname === '/checkout/success') send(pending.current);
    if (pathname !== '/checkout/success') pending.current = undefined;
    return () => window.removeEventListener(PIXEL_PURCHASE_EVENT, onPurchase);
  }, [storefront, pathname, pixels]);

  useEffect(() => {
    if (!publicPage || !pixels || !Object.keys(pixels).length || lastPath.current === pathname) return;
    runtime ??= startPixels(pixels);
    runtime.pageView(pathname);
    lastPath.current = pathname;
  }, [publicPage, pathname, pixels]);

  return null;
}
