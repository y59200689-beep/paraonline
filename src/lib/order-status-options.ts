/** Admin-editable order labels. Payment status stays with verified payment handlers. */
export const ADMIN_ORDER_STATUSES = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled', 'Returned'] as const;

export function canChangeOrderStatus(current: string, target: string): boolean {
  return current !== target && ADMIN_ORDER_STATUSES.some(status => status === target);
}
