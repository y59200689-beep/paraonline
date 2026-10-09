import { normalizeCatalogCategoryId } from './catalog-categories';
import { sanitizeCatalogSearch } from './catalog-brand-match';

export const CATALOG_PAGE_SIZE = 24;
export const MAX_CATALOG_PAGE = 10_000;
export const DEFAULT_CATALOG_MAX_PRICE = 1_500;

export type CatalogSort = 'popular' | 'alphabetical' | 'price-asc' | 'price-desc' | 'rating';

export type CatalogRouteState = {
  page: number;
  category: string;
  brand: string;
  vendors: string[];
  concern: string;
  ingredient: string;
  search: string;
  maxPrice: number | null;
  sort: CatalogSort;
};

export type CatalogSearchParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;

const boundedInteger = (value: string | undefined, fallback: number, maximum: number) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? Math.min(parsed, maximum) : fallback;
};

export function isValidCatalogPageParam(value: string | undefined | null) {
  if (value == null) return true;
  if (!/^\d+$/.test(value)) return false;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 && parsed <= MAX_CATALOG_PAGE;
}

export function normalizeCatalogRouteState(params: CatalogSearchParams = {}): CatalogRouteState {
  const rawSort = first(params.sort);
  const sort: CatalogSort = rawSort === 'price-asc' || rawSort === 'price-desc' || rawSort === 'rating' || rawSort === 'alphabetical'
    ? rawSort
    : 'popular';
  const rawMaxPrice = first(params.maxPrice);
  const parsedMaxPrice = rawMaxPrice === undefined ? Number.NaN : Number(rawMaxPrice);
  const maxPrice = Number.isFinite(parsedMaxPrice) && parsedMaxPrice >= 30
    ? Math.min(parsedMaxPrice, DEFAULT_CATALOG_MAX_PRICE)
    : null;
  const vendors = [...new Set(
    (Array.isArray(params.vendors) ? params.vendors.join(',') : params.vendors || '')
      .split(',')
      .map(value => sanitizeCatalogSearch(value).slice(0, 100))
      .filter(Boolean)
  )].slice(0, 20);
  const concernValue = first(params.concern) || 'all';
  const concern = /^[a-z0-9_-]{1,80}$/i.test(concernValue) ? concernValue : 'all';
  const rawCategory = first(params.category) || 'all';
  const category = /^[a-z0-9_\- &]+$/i.test(rawCategory)
    ? normalizeCatalogCategoryId(rawCategory.trim().toLowerCase())
    : 'all';

  return {
    page: boundedInteger(first(params.page), 1, MAX_CATALOG_PAGE),
    category: category || 'all',
    brand: sanitizeCatalogSearch(first(params.brand) || '').slice(0, 100),
    vendors,
    concern,
    ingredient: sanitizeCatalogSearch(first(params.ingredient) || '').slice(0, 100),
    search: sanitizeCatalogSearch(first(params.search) || ''),
    maxPrice,
    sort,
  };
}

export function catalogPageRange(page: number, pageSize = CATALOG_PAGE_SIZE) {
  const safePage = boundedInteger(String(page), 1, MAX_CATALOG_PAGE);
  const safePageSize = boundedInteger(String(pageSize), CATALOG_PAGE_SIZE, 100);
  const from = (safePage - 1) * safePageSize;
  return { from, to: from + safePageSize - 1 };
}

export function catalogSortOrders(sort: CatalogSort) {
  if (sort === 'popular') {
    return [
      { column: 'stock', ascending: false },
      { column: 'title', ascending: true },
      { column: 'id', ascending: true },
    ];
  }
  if (sort === 'price-asc') {
    return [
      { column: 'price', ascending: true },
      { column: 'title', ascending: true },
      { column: 'id', ascending: true },
    ];
  }
  if (sort === 'price-desc') {
    return [
      { column: 'price', ascending: false },
      { column: 'title', ascending: true },
      { column: 'id', ascending: true },
    ];
  }
  if (sort === 'rating') {
    return [
      { column: 'rating', ascending: false },
      { column: 'title', ascending: true },
      { column: 'id', ascending: true },
    ];
  }
  return [
    { column: 'title', ascending: true },
    { column: 'id', ascending: true },
  ];
}

export function applyCatalogSort<T extends { order: (column: string, options: { ascending: boolean }) => T }>(
  query: T,
  sort: CatalogSort,
) {
  return catalogSortOrders(sort).reduce(
    (sortedQuery, order) => sortedQuery.order(order.column, { ascending: order.ascending }),
    query,
  );
}

export function buildCatalogPageHref(page: number, state: CatalogRouteState) {
  const params = new URLSearchParams();
  if (page > 1) params.set('page', String(Math.min(page, MAX_CATALOG_PAGE)));
  if (state.category !== 'all') params.set('category', state.category);
  if (state.brand && state.vendors.length === 0) params.set('brand', state.brand);
  if (state.vendors.length > 0) params.set('vendors', state.vendors.join(','));
  if (state.concern !== 'all') params.set('concern', state.concern);
  if (state.ingredient) params.set('ingredient', state.ingredient);
  if (state.search) params.set('search', state.search);
  if (state.maxPrice !== null) params.set('maxPrice', String(state.maxPrice));
  if (state.sort !== 'popular') params.set('sort', state.sort);

  const query = params.toString();
  return query ? `/products?${query}` : '/products';
}

export function catalogCanonicalHref(state: CatalogRouteState) {
  return buildCatalogPageHref(state.page, state);
}
