export function normalizeGiftItem(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  if (!normalized || ['null', 'undefined'].includes(normalized.toLowerCase())) return null;
  return normalized;
}
