import type { PixelConfig } from '@/lib/pixels';

type Command = (...args: unknown[]) => void;
type Meta = Command & { queue: unknown[][]; callMethod?: Command; push: Command; loaded: boolean; version: string };
type Snap = Command & { queue: unknown[][]; handleRequest?: Command };
type TikTok = unknown[][] & { page: Command; track: Command; _i: Record<string, unknown[][]> };
type VendorWindow = Window & {
  fbq?: Meta; _fbq?: Meta; snaptr?: Snap; ttq?: TikTok; TiktokAnalyticsObject?: string;
  dataLayer?: unknown[]; gtag?: Command;
};

function script(src: string) {
  const element = document.createElement('script');
  element.async = true;
  element.referrerPolicy = 'no-referrer';
  element.src = src;
  document.head.append(element);
}

export function startPixels(config: PixelConfig) {
  const vendor = window as VendorWindow;
  if (config.meta) {
    if (!vendor.fbq) {
      const queue: unknown[][] = [];
      const fbq: Meta = Object.assign(
        (...args: unknown[]) => { if (fbq.callMethod) fbq.callMethod(...args); else queue.push(args); },
        { queue, push: (...args: unknown[]) => fbq(...args), loaded: true, version: '2.0' },
      );
      vendor.fbq = vendor._fbq = fbq;
      script('https://connect.facebook.net/en_US/fbevents.js');
    }
    vendor.fbq('set', 'autoConfig', false, config.meta);
    vendor.fbq('init', config.meta);
  }
  if (config.snap) {
    if (!vendor.snaptr) {
      const queue: unknown[][] = [];
      const snaptr: Snap = Object.assign(
        (...args: unknown[]) => { if (snaptr.handleRequest) snaptr.handleRequest(...args); else queue.push(args); },
        { queue },
      );
      vendor.snaptr = snaptr;
      script('https://sc-static.net/scevent.min.js');
    }
    vendor.snaptr('init', config.snap);
  }
  if (config.tiktok && !vendor.ttq) {
    const id = config.tiktok;
    const ttq = Object.assign([] as unknown[][], {
      page: (...args: unknown[]) => { ttq.push(['page', ...args]); },
      track: (...args: unknown[]) => { ttq.push(['track', ...args]); },
      _i: { [id]: Object.assign([], { _u: 'https://analytics.tiktok.com/i18n/pixel/events.js' }) },
      _t: { [id]: Date.now() },
      _o: { [id]: {} },
    });
    for (const method of ['debug', 'identify', 'instances', 'on', 'off', 'once', 'ready', 'alias', 'group',
      'enableCookie', 'disableCookie', 'holdConsent', 'revokeConsent', 'grantConsent']) {
      Object.assign(ttq, { [method]: (...args: unknown[]) => { ttq.push([method, ...args]); } });
    }
    vendor.TiktokAnalyticsObject = 'ttq';
    vendor.ttq = ttq;
    script(`https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=${id}&lib=ttq`);
  }
  const adsTag = config.ads?.split('/')[0];
  const googleTags = [config.ga4, adsTag].filter(Boolean);
  if (googleTags.length) {
    if (!vendor.gtag) {
      vendor.dataLayer ??= [];
      vendor.gtag = function () { vendor.dataLayer?.push(arguments); };
      vendor.gtag('js', new Date());
      script(`https://www.googletagmanager.com/gtag/js?id=${googleTags[0]}`);
    }
    googleTags.forEach(id => vendor.gtag?.('config', id, { send_page_view: false, allow_enhanced_conversions: false }));
  }

  return {
    pageView(pathname: string) {
      if (config.meta) vendor.fbq?.('trackSingle', config.meta, 'PageView');
      if (config.snap) vendor.snaptr?.('track', 'PAGE_VIEW');
      if (config.tiktok) vendor.ttq?.page();
      if (config.ga4) vendor.gtag?.('event', 'page_view', { send_to: config.ga4, page_location: window.location.origin + pathname });
    },
    purchase({ id, value, items }: PurchaseEvent) {
      const amount = { value, currency: 'MAD' };
      if (config.meta) vendor.fbq?.('trackSingle', config.meta, 'Purchase', amount, { eventID: id });
      if (config.snap) vendor.snaptr?.('track', 'PURCHASE', { price: value, currency: 'MAD', transaction_id: id });
      if (config.tiktok) vendor.ttq?.track('Purchase', amount, { event_id: id });
      const transaction = { ...amount, transaction_id: id, page_location: window.location.origin + '/checkout/success' };
      if (config.ga4) vendor.gtag?.('event', 'purchase', { ...transaction, items, send_to: config.ga4 });
      if (config.ads?.includes('/')) vendor.gtag?.('event', 'conversion', { ...transaction, send_to: config.ads });
    },
  };
}

export type PurchaseEvent = {
  id: string;
  value: number;
  items?: Array<{ item_id: string; price: number; quantity: number }>;
};
export const PIXEL_PURCHASE_EVENT = 'para:pixel-purchase';
