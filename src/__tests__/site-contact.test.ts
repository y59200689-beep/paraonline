import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS } from '@/lib/default-settings';
import { normalizeStoreContact, resolveStorePhone, resolveStoreWhatsApp, SITE_CONTACT_PHONE, SITE_WHATSAPP_NUMBER } from '@/lib/site-contact';
import { buildWhatsAppUrl } from '@/lib/whatsapp-link';
describe('current store contact', () => {
  it('uses the new number for phone and WhatsApp defaults', () => {
    expect(DEFAULT_SETTINGS.storePhone).toBe('+212 664 099 810');
    expect(buildWhatsAppUrl(DEFAULT_SETTINGS.storeWhatsApp)).toBe('https://wa.me/212664099810');
  });
  it.each(['212660808080', '+212 6 60 80 80 80', '0660808080', '+212 522-202020', '0522202020'])('replaces the previous saved store number %s', value => {
    expect(resolveStorePhone(value)).toBe(SITE_CONTACT_PHONE);
    expect(resolveStoreWhatsApp(value)).toBe(SITE_WHATSAPP_NUMBER);
  });
  it('preserves future operator-configured numbers and other settings', () => {
    const settings = { storePhone: '+212 611 222 333', storeWhatsApp: '212611222333', storeName: 'Para Divine' };
    expect(normalizeStoreContact(settings)).toEqual(settings);
  });
});
