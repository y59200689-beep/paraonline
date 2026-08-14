export type CustomerOrderAction = 'confirm' | 'cancel';
export type OrderStatus = 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Returned' | 'Cancelled' | 'Pending Payment' | 'Paid' | 'Payment Failed';

const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  Pending: ['Confirmed', 'Cancelled'],
  Confirmed: ['Shipped'],
  Shipped: ['Delivered', 'Returned'],
  Delivered: ['Returned'],
  Returned: [],
  Cancelled: [],
  'Pending Payment': ['Paid', 'Payment Failed', 'Cancelled'],
  Paid: ['Shipped'],
  'Payment Failed': [],
};

export function orderLifecycleTransition(currentStatus: string, targetStatus: string) {
  const current = currentStatus as OrderStatus;
  const target = targetStatus as OrderStatus;
  if (!allowedTransitions[current] || !allowedTransitions[target]) {
    return { allowed: false, idempotent: false, target };
  }
  if (current === target) return { allowed: true, idempotent: true, target };
  return { allowed: allowedTransitions[current].includes(target), idempotent: false, target };
}

export function customerOrderTransition(currentStatus: string, action: CustomerOrderAction) {
  const current = String(currentStatus || '').toLowerCase();
  const target = action === 'confirm' ? 'Confirmed' : 'Cancelled';
  return orderLifecycleTransition(currentStatus, target);
}
