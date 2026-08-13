export type PublicLocale = 'FR' | 'AR';

export function toIntlLocale(language: PublicLocale) {
  return language === 'AR' ? 'ar-MA' : 'fr-MA';
}

export function formatPublicMoney(amount: number, language: PublicLocale, currency = 'MAD') {
  return new Intl.NumberFormat(toIntlLocale(language), {
    style: 'currency',
    currency,
    currencyDisplay: currency === 'MAD' ? 'code' : 'symbol',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0).replace('MAD', language === 'AR' ? 'د.م.' : 'DH');
}

export function formatPublicNumber(value: number, language: PublicLocale) {
  return new Intl.NumberFormat(toIntlLocale(language)).format(Number.isFinite(value) ? value : 0);
}

export function formatPublicDate(value: string | number | Date, language: PublicLocale) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(toIntlLocale(language), {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}
