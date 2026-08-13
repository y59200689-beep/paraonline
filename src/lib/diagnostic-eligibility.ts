import type { Product } from '@/lib/data';

/**
 * Controls only storefront visibility for the diagnostic compatibility UI.
 * The recommendation engine remains server-side; this prevents unrelated or
 * incompletely described catalogue items from receiving a cosmetic score.
 */
export function isDiagnosticProductEligible(product: Product): boolean {
  const categories = [product.category, ...(product.categories || [])]
    .map((value) => String(value || '').trim().toLocaleLowerCase('fr-FR'));
  const isFaceCare = product.isFaceProduct === true || categories.some((category) =>
    ['visage', 'face', 'skincare', 'soin visage'].some((eligible) => category.includes(eligible))
  );
  const hasCompleteMetadata = Boolean(
    product.routineRoles?.length
    && product.suitableSkinTypes?.length
    && product.suitableConcerns?.length
    && product.sensitivityLevels?.length
    && product.activeStrength
    && product.timeOfDay?.length
  );

  return Boolean(
    isFaceCare
    && product.status === 'live'
    && Number(product.stock || 0) > 0
    && product.recommendationStatus === 'approved'
    && hasCompleteMetadata
  );
}
