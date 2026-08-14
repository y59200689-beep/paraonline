export function customerIdentityKey(customerId: string | null | undefined, phone: string | null | undefined) {
  return customerId ? `account:${customerId}` : `guest:${String(phone || '').trim()}`;
}

export function isRegisteredCustomer(customerId: string | null | undefined) {
  return Boolean(customerId);
}
