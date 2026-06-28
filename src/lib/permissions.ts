export type AdminRole = 'owner' | 'logistician' | 'support';

/**
 * Returns true if the role is allowed to manage operators (create, update, delete them).
 * Allowed: owner
 */
export function canManageOperators(role: AdminRole): boolean {
  return role === 'owner';
}

/**
 * Returns true if the role is allowed to delete orders.
 * Allowed: owner
 */
export function canDeleteOrders(role: AdminRole): boolean {
  return role === 'owner';
}

/**
 * Returns true if the role is allowed to create, update, or delete products in the catalog.
 * Allowed: owner
 */
export function canEditCatalog(role: AdminRole): boolean {
  return role === 'owner';
}

/**
 * Returns true if the role is allowed to modify general application settings.
 * Allowed: owner
 */
export function canManageSettings(role: AdminRole): boolean {
  return role === 'owner';
}

/**
 * Returns true if the role is allowed to moderate and delete reviews.
 * Denied: logistician
 */
export function canManageReviews(role: AdminRole): boolean {
  return role !== 'logistician';
}

/**
 * Returns true if the role is allowed to register, sync, or ship orders via couriers.
 * Denied: support
 */
export function canManageCouriers(role: AdminRole): boolean {
  return role !== 'support';
}

/**
 * Returns true if the role is allowed to edit orders (updating status, address, payment details).
 * Denied: support
 */
export function canEditOrders(role: AdminRole): boolean {
  return role !== 'support';
}

/**
 * Returns true if the role is allowed to create, update, or delete advice articles.
 * Allowed: owner
 */
export function canManageAdvice(role: AdminRole): boolean {
  return role === 'owner';
}

/**
 * Returns true if the role is allowed to create, update, or delete code snippets.
 * Allowed: owner
 */
export function canManageSnippets(role: AdminRole): boolean {
  return role === 'owner';
}
