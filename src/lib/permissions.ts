/**
 * Admin role hierarchy (most → least privileged):
 *   owner           – full access; publishing, permissions, integrations
 *   manager         – content, catalogue, promotions, publishing
 *   content_editor  – pages, brands, FAQ, advice, translations; cannot publish without approval
 *   catalogue_editor– products, stock, categories, brands, diagnostic product metadata
 *   logistician     – orders, shipping, fulfilment (legacy name, kept for compatibility)
 *   fulfilment      – orders only (new canonical name for logistician)
 *   support         – customer communications, reviews
 *   viewer          – read-only reports and catalogue
 */
export type AdminRole =
  | 'owner'
  | 'manager'
  | 'content_editor'
  | 'catalogue_editor'
  | 'logistician'
  | 'fulfilment'
  | 'support'
  | 'viewer';

// ─── Convenience sets ─────────────────────────────────────────

const SENIOR_ROLES: (AdminRole | string)[] = ['owner', 'manager', 'admin', 'administrator', 'superadmin'];
const CONTENT_ROLES: (AdminRole | string)[] = ['owner', 'manager', 'content_editor', 'admin', 'administrator', 'superadmin'];
const CATALOGUE_ROLES: (AdminRole | string)[] = ['owner', 'manager', 'catalogue_editor', 'admin', 'administrator', 'superadmin'];
const FULFILMENT_ROLES: (AdminRole | string)[] = ['owner', 'manager', 'logistician', 'fulfilment', 'admin', 'administrator', 'superadmin'];

// ─── Operators & team ─────────────────────────────────────────

/**
 * Returns true if the role is allowed to manage operators (create, update, delete them).
 * Allowed: owner
 */
export function canManageOperators(role: AdminRole): boolean {
  return role === 'owner';
}

// ─── Orders ───────────────────────────────────────────────────

/**
 * Returns true if the role is allowed to delete orders.
 * Allowed: owner
 */
export function canDeleteOrders(role: AdminRole): boolean {
  return role === 'owner';
}

/**
 * Returns true if the role is allowed to edit orders (status, address, payment).
 * Denied: support, viewer, content_editor, catalogue_editor
 */
export function canEditOrders(role: AdminRole): boolean {
  return FULFILMENT_ROLES.includes(role);
}

/**
 * Returns true if the role is allowed to register, sync, or ship orders via couriers.
 * Denied: support, viewer, content_editor, catalogue_editor
 */
export function canManageCouriers(role: AdminRole): boolean {
  return FULFILMENT_ROLES.includes(role);
}

// ─── Catalogue ────────────────────────────────────────────────

/**
 * Returns true if the role is allowed to create, update, or delete products.
 * Allowed: owner, manager, catalogue_editor
 */
export function canEditCatalog(role: AdminRole): boolean {
  return CATALOGUE_ROLES.includes(role);
}

// ─── Settings ─────────────────────────────────────────────────

/**
 * Returns true if the role is allowed to modify general application settings.
 * Allowed: owner
 */
export function canManageSettings(role: AdminRole): boolean {
  return role === 'owner';
}

// ─── Content (CMS) ────────────────────────────────────────────

/**
 * Returns true if the role is allowed to create or edit CMS pages and sections.
 * Allowed: owner, manager, content_editor
 */
export function canEditContent(role: AdminRole): boolean {
  return CONTENT_ROLES.includes(role);
}

/**
 * Returns true if the role is allowed to publish (set status → published).
 * content_editor must submit for approval; only owner/manager can self-publish.
 */
export function canPublishContent(role: AdminRole): boolean {
  return SENIOR_ROLES.includes(role);
}

/**
 * Returns true if the role is allowed to schedule a future publish.
 * Allowed: owner, manager
 */
export function canScheduleContent(role: AdminRole): boolean {
  return SENIOR_ROLES.includes(role);
}

/**
 * Returns true if the role is allowed to manage brand CMS records.
 * Allowed: owner, manager, content_editor
 */
export function canManageBrands(role: AdminRole): boolean {
  return CONTENT_ROLES.includes(role) || role === 'catalogue_editor';
}

/**
 * Returns true if the role is allowed to manage the global store content
 * (header, footer, announcement bar, trust badges, SEO defaults).
 * Allowed: owner, manager
 */
export function canManageGlobalContent(role: AdminRole): boolean {
  return SENIOR_ROLES.includes(role);
}

/**
 * Returns true if the role is allowed to manage translations.
 * Allowed: owner, manager, content_editor
 */
export function canManageTranslations(role: AdminRole): boolean {
  return CONTENT_ROLES.includes(role);
}

// ─── Experience (Diagnostic & Chat) ───────────────────────────

/**
 * Returns true if the role is allowed to edit diagnostic IA questions and mappings.
 * Allowed: owner, manager
 * (content_editor can view but not change mappings that affect the algorithm)
 */
export function canManageDiagnostic(role: AdminRole): boolean {
  return SENIOR_ROLES.includes(role);
}

/**
 * Returns true if the role is allowed to edit chat assistant content.
 * Allowed: owner, manager, content_editor
 */
export function canManageChat(role: AdminRole): boolean {
  return CONTENT_ROLES.includes(role);
}

// ─── Reviews & Advice ─────────────────────────────────────────

/**
 * Returns true if the role is allowed to moderate and delete reviews.
 * Denied: logistician, fulfilment, catalogue_editor, viewer
 */
export function canManageReviews(role: AdminRole): boolean {
  return CONTENT_ROLES.includes(role) || role === 'support';
}

/**
 * Returns true if the role is allowed to create, update, or delete advice articles.
 * Allowed: owner, manager, content_editor
 */
export function canManageAdvice(role: AdminRole): boolean {
  return CONTENT_ROLES.includes(role);
}

// ─── Developer tools ──────────────────────────────────────────

/**
 * Returns true if the role is allowed to create, update, or delete code snippets.
 * Allowed: owner
 */
export function canManageSnippets(role: AdminRole): boolean {
  return role === 'owner';
}

/**
 * Returns true if the role can view audit logs and change history.
 * Allowed: owner, manager
 */
export function canViewAuditLog(role: AdminRole): boolean {
  return SENIOR_ROLES.includes(role);
}

/**
 * Returns true if the role can view analytics and reporting dashboards.
 * Denied: viewer has read-only access to catalogue only, not revenue data.
 */
export function canViewAnalytics(role: AdminRole): boolean {
  return SENIOR_ROLES.includes(role) || role === 'support';
}

/**
 * Returns true for read-only roles that should not see any mutation controls.
 */
export function isViewerOnly(role: AdminRole): boolean {
  return role === 'viewer';
}
