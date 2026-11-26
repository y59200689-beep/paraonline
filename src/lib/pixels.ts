export const PIXEL_PROVIDERS = {
  meta: 'Meta (Facebook / Instagram)',
  tiktok: 'TikTok',
  snap: 'Snapchat',
  ga4: 'Google Analytics 4',
  ads: 'Google Ads',
} as const;
export type PixelProvider = keyof typeof PIXEL_PROVIDERS;
export type PixelConfig = Partial<Record<PixelProvider, string>>;
export const DEFAULT_PIXELS: PixelConfig = { ga4: 'G-2ZEW5MT4T4' };

const patterns: Record<PixelProvider, RegExp> = {
  meta: /^\d{5,25}$/,
  tiktok: /^[A-Z0-9]{15,30}$/,
  snap: /^[a-f\d]{8}(?:-[a-f\d]{4}){3}-[a-f\d]{12}$/i,
  ga4: /^G-[A-Z0-9]+$/,
  ads: /^AW-\d+(?:\/[A-Za-z0-9_-]+)?$/,
};

const snippetPatterns: Record<PixelProvider, RegExp> = {
  meta: /fbq\(\s*['"]init['"]\s*,\s*['"](\d+)['"]/,
  tiktok: /ttq\.load\(\s*['"]([A-Z0-9]+)['"]/,
  snap: /snaptr\(\s*['"]init['"]\s*,\s*['"]([\da-f-]+)['"]/i,
  ga4: /\b(G-[A-Z0-9]+)\b/,
  ads: /\b(AW-\d+\/[A-Za-z0-9_-]+)\b|\b(AW-\d+)\b/,
};

export function readPixelInput(provider: PixelProvider, value: string): string | undefined {
  const text = value.trim();
  if (!text) return '';
  const match = snippetPatterns[provider].exec(text);
  const conversion = provider === 'ads' ? /['"](AW-\d+\/[A-Za-z0-9_-]+)['"]/.exec(text)?.[1] : undefined;
  const id = patterns[provider].test(text) ? text : conversion ?? match?.[1] ?? match?.[2];
  return id && patterns[provider].test(id) ? id : undefined;
}

export function isPurchaseReady(order: { payment_method?: string | null; payment_status?: string | null; status?: string | null; total?: number | null }) {
  return typeof order.total === 'number' && Number.isFinite(order.total) && order.total >= 0
    && !/cancel|refund|fail|annul/i.test(order.status ?? '')
    && (order.payment_method === 'cod' || order.payment_status === 'paid');
}
