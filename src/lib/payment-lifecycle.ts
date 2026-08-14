/**
 * A customer cancellation or courier return is terminal for order fulfilment.
 * Payment callbacks may be replayed or arrive late, but must not reopen either
 * state by overwriting the order with Paid.
 */
export function blocksOnlinePaymentSettlement(status: string | null | undefined) {
  return ['cancelled', 'returned'].includes(String(status || '').trim().toLowerCase());
}
