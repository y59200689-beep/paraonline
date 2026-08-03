export const MOROCCAN_PHONE_MIN_DIGITS = 9;
export const MOROCCAN_PHONE_MAX_DIGITS = 10;

/**
 * The checkout UI already displays the +212 prefix, so store the local number
 * only. Spaces, punctuation, and an accidentally pasted +212 prefix are
 * removed before applying the 9–10 digit Morocco rule.
 */
export function normalizeMoroccanPhoneInput(value: string): string {
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('212') && digits.length > MOROCCAN_PHONE_MAX_DIGITS) {
    digits = digits.slice(3);
  }
  return digits.slice(0, MOROCCAN_PHONE_MAX_DIGITS);
}

export function isValidMoroccanPhone(value: string): boolean {
  const digits = normalizeMoroccanPhoneInput(value);
  return digits.length >= MOROCCAN_PHONE_MIN_DIGITS && digits.length <= MOROCCAN_PHONE_MAX_DIGITS;
}
