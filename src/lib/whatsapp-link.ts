export function formatWhatsAppNumber(value: string | null | undefined): string | null {
  const digits = String(value || '').replace(/\D/g, '');
  const normalized = digits.startsWith('0') ? `212${digits.slice(1)}` : digits.length === 9 ? `212${digits}` : digits;
  return /^212[5-7]\d{8}$/.test(normalized) ? normalized : null;
}

export function buildWhatsAppUrl(value: string | null | undefined, message?: string): string | null {
  const phone = formatWhatsAppNumber(value);
  if (!phone) return null;
  return `https://wa.me/${phone}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
}
