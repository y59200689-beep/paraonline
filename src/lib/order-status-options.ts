/** Admin-selectable transitions, matching transition_order_lifecycle.
 * Payment confirmation remains exclusive to verified payment handlers.
 */
const NEXT_STATUSES: Record<string, readonly string[]> = {
  Pending: ['Confirmed', 'Cancelled'],
  Confirmed: ['Shipped'],
  Paid: ['Shipped'],
  Shipped: ['Delivered', 'Returned'],
  Delivered: ['Returned'],
  'Pending Payment': ['Cancelled'],
};

export function canChangeOrderStatus(current: string, target: string): boolean {
  return NEXT_STATUSES[current]?.includes(target) ?? false;
}
