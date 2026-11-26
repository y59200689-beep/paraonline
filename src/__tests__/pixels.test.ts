// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { readPixelInput, isPurchaseReady } from '@/lib/pixels';
import { startPixels } from '@/lib/browser-pixels';

afterEach(() => vi.restoreAllMocks());

it('extracts supported IDs from vendor snippets without retaining executable code', () => {
  expect(readPixelInput('meta', "<script>fbq('init', '123456789');</script>")).toBe('123456789');
  expect(readPixelInput('tiktok', "ttq.load('ABCDE123456789ABCDE1')")).toBe('ABCDE123456789ABCDE1');
  expect(readPixelInput('snap', "snaptr('init', '6abc82ca-4a3a-4391-98ba-0317a8471234')")).toBe('6abc82ca-4a3a-4391-98ba-0317a8471234');
  expect(readPixelInput('ga4', "gtag('config', 'G-TEST01')")).toBe('G-TEST01');
  expect(readPixelInput('ads', "gtag('config', 'AW-123456'); gtag('event', 'conversion', {send_to:'AW-123456/Test_Label'})"))
    .toBe('AW-123456/Test_Label');
  expect(readPixelInput('meta', '<script>invalid()</script>')).toBeUndefined();
});

it('requires a verified order and a paid status for online payments', () => {
  expect(isPurchaseReady({ payment_method: 'cod', status: 'Pending', total: 120 })).toBe(true);
  expect(isPurchaseReady({ payment_method: 'stripe', payment_status: 'unpaid', total: 120 })).toBe(false);
  expect(isPurchaseReady({ payment_method: 'stripe', payment_status: 'paid', total: 120 })).toBe(true);
  expect(isPurchaseReady({ payment_method: 'cod', status: 'Cancelled', total: 120 })).toBe(false);
});

it('queues a MAD purchase for each configured destination', () => {
  vi.spyOn(document.head, 'append').mockImplementation(() => undefined);
  const pixels = startPixels({
    meta: '123456789', tiktok: 'ABCDE123456789ABCDE1',
    snap: '6abc82ca-4a3a-4391-98ba-0317a8471234', ga4: 'G-TEST01', ads: 'AW-123456/Test_Label',
  });
  pixels.pageView('/products');
  pixels.purchase({ id: 'PO-123456', value: 120 });
  const sdk = window as unknown as {
    fbq: { queue: unknown[] }; snaptr: { queue: unknown[] }; ttq: unknown[]; dataLayer: IArguments[];
  };
  expect(sdk.fbq.queue).toContainEqual(['trackSingle', '123456789', 'Purchase', { currency: 'MAD', value: 120 }, { eventID: 'PO-123456' }]);
  expect(sdk.snaptr.queue).toContainEqual(['track', 'PURCHASE', { currency: 'MAD', price: 120, transaction_id: 'PO-123456' }]);
  expect(sdk.ttq).toContainEqual(['track', 'Purchase', { currency: 'MAD', value: 120 }, { event_id: 'PO-123456' }]);
  const commands = sdk.dataLayer.map(args => Array.from(args));
  expect(commands).toContainEqual(['event', 'purchase', expect.objectContaining({ send_to: 'G-TEST01', transaction_id: 'PO-123456' })]);
  expect(commands).toContainEqual(['event', 'conversion', expect.objectContaining({ send_to: 'AW-123456/Test_Label', transaction_id: 'PO-123456' })]);
});
