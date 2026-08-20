import { FREE_SHIPPING_SUBTOTAL_DH, isLegacyFreeShippingGiftRange } from '@/lib/pricing';

export type SettingsRecord = Record<string, any>;

export function normalizeSettingsForPersistence(settings: SettingsRecord, existing: SettingsRecord = {}): SettingsRecord {
  const galleryOverrides = { ...(existing.galleryOverrides || {}), ...(settings.galleryOverrides || {}) };
  const requestedGiftRanges = Array.isArray(settings.giftRanges) ? settings.giftRanges : (existing.giftRanges || []);
  const requestedShippingRules = Array.isArray(settings.shippingRules) ? settings.shippingRules : (existing.shippingRules || []);
  const requestedCoupons = Array.isArray(settings.coupons) ? settings.coupons : (existing.coupons || []);

  return {
    ...settings,
    galleryOverrides,
    freeShippingThreshold: FREE_SHIPPING_SUBTOTAL_DH,
    giftRanges: requestedGiftRanges.filter((range: any) => !isLegacyFreeShippingGiftRange(range)),
    shippingRules: requestedShippingRules
      .filter((rule: any) => typeof rule?.city === 'string' && Number.isFinite(Number(rule?.fee)) && Number(rule.fee) > 0)
      .map((rule: any) => ({ city: rule.city.trim(), fee: Number(rule.fee) })),
    coupons: requestedCoupons
      .filter((coupon: any) => coupon?.freeShipping !== true)
      .map((coupon: any) => ({ ...coupon, freeShipping: false })),
  };
}

const SECRET_SETTING_KEYS = ['adminPasscode', 'yalidineApiKey', 'yalidineApiId', 'cathedisApiKey', 'courierApiKey'];
const SECRET_KEY_PATTERN = /(secret|api.?key|passcode|password|private)/i;

export function mergeAdminSettingsSection(existing: SettingsRecord, partial: SettingsRecord): SettingsRecord {
  const merged = { ...existing, ...partial };
  for (const key of SECRET_SETTING_KEYS) {
    if (partial[key] === '' || partial[key] === undefined) merged[key] = existing[key];
  }
  return normalizeSettingsForPersistence(merged, existing);
}

export function sanitizeAdminSettings(settings: SettingsRecord): SettingsRecord {
  const safe = { ...settings };
  for (const key of Object.keys(safe)) {
    if (SECRET_KEY_PATTERN.test(key)) delete safe[key];
  }
  if (safe.paymentSettings && typeof safe.paymentSettings === 'object') {
    safe.paymentSettings = Object.fromEntries(
      Object.entries(safe.paymentSettings).filter(([key]) => !SECRET_KEY_PATTERN.test(key)),
    );
  }
  return safe;
}
