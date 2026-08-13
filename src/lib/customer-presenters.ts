export type CustomerPanelLanguage = 'FR' | 'AR';

const CUSTOMER_STATUS_LABELS: Record<string, { fr: string; ar: string }> = {
  pending: { fr: 'En attente', ar: 'قيد الانتظار' },
  confirmed: { fr: 'Confirmée', ar: 'تم التأكيد' },
  processing: { fr: 'En préparation', ar: 'قيد التحضير' },
  shipped: { fr: 'Expédiée', ar: 'تم الشحن' },
  in_transit: { fr: 'En transit', ar: 'في الطريق' },
  delivered: { fr: 'Livrée', ar: 'تم التسليم' },
  cancelled: { fr: 'Annulée', ar: 'ملغاة' },
  returned: { fr: 'Retournée', ar: 'مرتجعة' },
};

const SKIN_TYPE_LABELS: Record<string, { fr: string; ar: string }> = {
  oily: { fr: 'Peau grasse', ar: 'بشرة دهنية' },
  dry: { fr: 'Peau sèche', ar: 'بشرة جافة' },
  combination: { fr: 'Peau mixte', ar: 'بشرة مختلطة' },
  mixed: { fr: 'Peau mixte', ar: 'بشرة مختلطة' },
  normal: { fr: 'Peau normale', ar: 'بشرة عادية' },
  sensitive: { fr: 'Peau sensible', ar: 'بشرة حساسة' },
};

function normalizeCustomerKey(value: string) {
  return value.toLowerCase().trim().replace(/[\s-]+/g, '_');
}

export function customerStatusLabel(status: string, language: CustomerPanelLanguage) {
  const labels = CUSTOMER_STATUS_LABELS[normalizeCustomerKey(status)];
  return labels?.[language === 'AR' ? 'ar' : 'fr'] || status;
}

export function skinTypeLabel(skinType: string, language: CustomerPanelLanguage) {
  const labels = SKIN_TYPE_LABELS[normalizeCustomerKey(skinType)];
  return labels?.[language === 'AR' ? 'ar' : 'fr'] || skinType;
}
