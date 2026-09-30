import type { Product } from '@/lib/data';
import { isDiagnosticEligibleProduct } from '@/lib/diagnostic-routine';

export function mapDiagnosticProduct(row: Record<string, unknown>): Product {
  return {
    id: Number(row.id),
    title: String(row.title || ''),
    name: String(row.name || ''),
    nameFr: String(row.name_fr || ''),
    vendor: String(row.vendor || ''),
    category: String(row.category || ''),
    categories: Array.isArray(row.categories) ? row.categories as string[] : [],
    image: String(row.image || ''),
    images: Array.isArray(row.images) ? row.images as string[] : [],
    price: Number(row.price || 0),
    comparePrice: Number(row.compare_price || row.price || 0),
    tags: Array.isArray(row.tags) ? row.tags as string[] : [],
    rating: Number(row.rating || 0),
    reviews: Number(row.reviews || 0),
    description: String(row.description || ''),
    ingredients: String(row.ingredients || ''),
    usage: String(row.usage || ''),
    stock: row.stock == null ? 0 : Number(row.stock),
    status: row.status === 'live' ? 'live' : 'draft',
    recommendationStatus: row.recommendation_status === 'rejected' ? 'rejected' : row.recommendation_status === 'draft' ? 'draft' : 'approved',
    routineRoles: Array.isArray(row.routine_roles) ? row.routine_roles as Product['routineRoles'] : [],
    suitableSkinTypes: Array.isArray(row.suitable_skin_types) ? row.suitable_skin_types as Product['suitableSkinTypes'] : [],
    suitableConcerns: Array.isArray(row.suitable_concerns) ? row.suitable_concerns as Product['suitableConcerns'] : [],
    sensitivityLevels: Array.isArray(row.sensitivity_levels) ? row.sensitivity_levels as Product['sensitivityLevels'] : [],
    activeStrength: row.active_strength as Product['activeStrength'],
    timeOfDay: Array.isArray(row.time_of_day) ? row.time_of_day as Product['timeOfDay'] : [],
  };
}

export function isInDiagnosticPool(product: Product, excludedIds: ReadonlySet<number>, options?: { ignoreStock?: boolean }) {
  return !excludedIds.has(product.id) && isDiagnosticEligibleProduct(product, options);
}
