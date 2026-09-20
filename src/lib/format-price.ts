/** Customer-facing dirham display. Payment APIs still use the ISO code MAD. */
export function formatPriceDH(amount: number): string {
  return `${amount.toFixed(2)} DH`;
}
