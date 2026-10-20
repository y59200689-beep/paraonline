export const SITE_CONTACT_EMAIL = 'contact@paradivine.ma';

export const SITE_CONTACT_PHONE = '+212 664 099 810';
export const SITE_WHATSAPP_NUMBER = '212664099810';

// Retire only the previous store numbers, including saved CMS overrides.
// Preserve deliberate future contact changes made through the admin settings.
const PREVIOUS_STORE_NUMBERS = new Set(['212660808080', '212522202020', '212522345678']);
function isPreviousStoreNumber(value: string) {
  const digits = value.replace(/\D/g, '');
  return PREVIOUS_STORE_NUMBERS.has(digits.startsWith('0') ? `212${digits.slice(1)}` : digits);
}
export function resolveStorePhone(value?: string | null) {
  return !value || isPreviousStoreNumber(value) ? SITE_CONTACT_PHONE : value;
}
export function resolveStoreWhatsApp(value?: string | null) {
  return !value || isPreviousStoreNumber(value) ? SITE_WHATSAPP_NUMBER : value;
}
export function normalizeStoreContact<T extends { storePhone?: string; storeWhatsApp?: string }>(settings: T): T {
  return { ...settings, storePhone: resolveStorePhone(settings.storePhone), storeWhatsApp: resolveStoreWhatsApp(settings.storeWhatsApp) };
}
