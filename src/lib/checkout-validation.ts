import { isValidMoroccanPhone } from '@/lib/moroccan-phone';

export type CheckoutFields = {
  name: string;
  phone: string;
  address: string;
  city: string;
  note?: string;
};

export type CheckoutFieldErrors = Partial<Record<keyof CheckoutFields, string>>;

export function validateCheckoutFields(fields: CheckoutFields, language: string): CheckoutFieldErrors {
  const isFrench = language === 'FR';
  const errors: CheckoutFieldErrors = {};

  if (!fields.name.trim()) {
    errors.name = isFrench ? 'Nom complet requis' : 'الاسم الكامل مطلوب';
  }
  if (!isValidMoroccanPhone(fields.phone)) {
    errors.phone = isFrench
      ? 'Saisissez un numéro marocain de 9 à 10 chiffres.'
      : 'أدخل رقم هاتف مغربي من 9 إلى 10 أرقام.';
  }
  if (!fields.city) {
    errors.city = isFrench ? 'Veuillez choisir votre ville' : 'يرجى اختيار مدينتكِ';
  }
  if (!fields.address.trim()) {
    errors.address = isFrench ? 'Adresse complète requise' : 'العنوان الكامل مطلوب';
  }

  return errors;
}
