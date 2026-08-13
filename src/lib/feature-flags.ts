export type CommerceFeatureFlag = 'productRedesign' | 'cartRedesign' | 'checkoutRedesign';

const TRUE_VALUES = new Set(['1', 'true', 'yes', 'on']);

function envFlag(value: string | undefined) {
  return value ? TRUE_VALUES.has(value.trim().toLowerCase()) : false;
}

/**
 * Commerce redesigns stay opt-in until their smoke tests and visual checks pass.
 * Keeping the defaults false is the rollback path: production can return to the
 * existing experience by changing environment variables, without reverting code.
 */
export const commerceFeatureFlags: Record<CommerceFeatureFlag, boolean> = {
  productRedesign: envFlag(process.env.NEXT_PUBLIC_FEATURE_PRODUCT_REDESIGN),
  cartRedesign: envFlag(process.env.NEXT_PUBLIC_FEATURE_CART_REDESIGN),
  checkoutRedesign: envFlag(process.env.NEXT_PUBLIC_FEATURE_CHECKOUT_REDESIGN),
};

export function isCommerceFeatureEnabled(flag: CommerceFeatureFlag) {
  return commerceFeatureFlags[flag];
}
