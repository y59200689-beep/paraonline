import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Product } from '@/lib/data';
import { supabaseAdmin as supabase } from '@/lib/supabase-server';
import ProductsClient from './ProductsClient';
import { unstable_cache } from 'next/cache';
import { PUBLIC_CATALOG_CACHE_TAG } from '@/lib/catalog-cache';
import { catalogCategoryForConcern, countCatalogConcerns, getCatalogConcerns, type CatalogConcern } from '@/lib/catalog-concerns';
import { catalogCategoryFilter, normalizeCatalogCategoryId } from '@/lib/catalog-categories';
import { catalogBrandPrefix } from '@/lib/catalog-brand-match';
import {
  applyCatalogSort,
  buildCatalogPageHref,
  catalogPageRange,
  catalogCanonicalHref,
  CATALOG_PAGE_SIZE,
  isValidCatalogPageParam,
  normalizeCatalogRouteState,
  type CatalogRouteState,
} from '@/lib/catalog-pagination';

// A full product card carries images, controls, and rich product metadata.
// Keep the first catalogue view compact; pagination provides the rest without
// blocking navigation or hydration with 50 cards at once.
const PAGE_SIZE = CATALOG_PAGE_SIZE;

const INGREDIENT_ALIASES: Record<string, string[]> = {
  niacinamide: ['niacinamide'],
  acide_hyaluronique: ['hyaluron'],
  retinol: ['retinol', 'rétinol'],
  vitamine_c: ['vitamine c', 'vitamin c', 'ascorb', 'ascorbyl'],
  acide_salicylique: ['salicyl'],
  centella_asiatica: ['centella', 'madecassoside', 'madécassoside'],
  acide_tranexamique: ['tranexamic', 'tranexamique'],
  squalane: ['squalane'],
};

const normalizeIngredientKey = (value: string) => value
  .trim()
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '_')
  .replace(/^_|_$/g, '');

function customConcernFilter(concern: CatalogConcern) {
  const escapeValue = (value: string) => value.replace(/[,.()]/g, ' ').trim();
  const textKeywords = [...(concern.keywords || []), ...(concern.ingredientKeywords || [])]
    .map(escapeValue)
    .filter(Boolean)
    .slice(0, 20);
  const clauses = textKeywords.flatMap(keyword => [
    `title.ilike.%${keyword}%`,
    `name.ilike.%${keyword}%`,
    `name_fr.ilike.%${keyword}%`,
    `description.ilike.%${keyword}%`,
    `ingredients.ilike.%${keyword}%`,
  ]);
  const productIds = (concern.productIds || []).filter(Number.isInteger).slice(0, 100);
  if (productIds.length > 0) clauses.push(`id.in.(${productIds.join(',')})`);
  return clauses.join(',');
}

function rowToProduct(item: any): Product {
  return {
    id: item.id as number,
    title: item.title as string,
    name: (item.name as string) || undefined,
    nameFr: (item.name_fr as string) || undefined,
    vendor: item.vendor as string,
    image: item.image as string,
    images: (item.images as string[]) || [],
    price: Number(item.price),
    comparePrice: Number(item.compare_price || item.price),
    category: item.category as string,
    categories: Array.isArray(item.categories) && item.categories.length > 0
      ? item.categories as string[]
      : [item.category as string],
    tags: (item.tags as string[]) || [],
    rating: Number(item.rating || 0),
    reviews: Number(item.reviews || 0),
    description: (item.description as string) || '',
    ingredients: (item.ingredients as string) || '',
    usage: (item.usage as string) || '',
    stock: item.stock != null ? Number(item.stock) : 100,
    sku: (item.sku as string) || undefined,
    points: item.points != null ? Number(item.points) : 0,
    status: item.status === 'live' ? 'live' : 'draft',
    isFaceProduct: item.is_face_product === true || [item.category, ...(Array.isArray(item.categories) ? item.categories : [])]
      .filter(Boolean)
      .some((category: unknown) => /(^|\\s)(visage|face|skincare|soin visage)(\\s|$)/i.test(String(category))),
    recommendationStatus: item.recommendation_status === 'rejected'
      ? 'rejected'
      : item.recommendation_status === 'draft'
        ? 'draft'
        : 'approved',
    routineRoles: Array.isArray(item.routine_roles) ? item.routine_roles : [],
    suitableSkinTypes: Array.isArray(item.suitable_skin_types) ? item.suitable_skin_types : [],
    suitableConcerns: Array.isArray(item.suitable_concerns) ? item.suitable_concerns : [],
    sensitivityLevels: Array.isArray(item.sensitivity_levels) ? item.sensitivity_levels : [],
    activeStrength: item.active_strength || undefined,
    timeOfDay: Array.isArray(item.time_of_day) ? item.time_of_day : [],
  };
}

async function loadCatalogFacets() {
  const categoryCounts = new Map<string, number>();
  const brandCounts = new Map<string, number>();
  let offerCount = 0;
  let total = 0;
  const pageSize = 1000;
  const products: Product[] = [];

  for (let from = 0; ; from += pageSize) {
    const to = from + pageSize - 1;
    const { data, error } = await supabase
      .from('products')
      .select('id,title,name_fr,category,categories,tags,description,ingredients,vendor,price,compare_price')
      .eq('status', 'live')
      .range(from, to);

    if (error) throw error;
    const batch = data || [];
    total += batch.length;
    products.push(...batch.map(rowToProduct));

    batch.forEach((item: any) => {
      if (Number(item.compare_price) > Number(item.price)) offerCount += 1;
      const categories = Array.isArray(item.categories) && item.categories.length > 0
        ? item.categories
        : [item.category];

      Array.from(new Set<string>(
        categories
          .map((category: unknown) => normalizeCatalogCategoryId(String(category || '')))
          .filter(Boolean)
      )).forEach(category => {
        categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
      });

      const vendor = typeof item.vendor === 'string' ? item.vendor.trim() : '';
      if (vendor && vendor !== '-') {
        brandCounts.set(vendor, (brandCounts.get(vendor) || 0) + 1);
      }
    });

    if (batch.length < pageSize) break;
  }

  const concerns = await getCatalogConcerns();

  return {
    total,
    categories: Array.from(categoryCounts.entries())
      .map(([id, count]) => ({ id, count }))
      .concat(offerCount > 0 ? [{ id: 'offers', count: offerCount }] : [])
      .sort((a, b) => a.id.localeCompare(b.id)),
    brands: Array.from(brandCounts.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => a.name.localeCompare(b.name)),
    concerns: countCatalogConcerns(products, concerns),
  };
}

const getCachedCatalogFacets = unstable_cache(
  loadCatalogFacets,
  ['catalog-facets'],
  { tags: [PUBLIC_CATALOG_CACHE_TAG], revalidate: 3600 }
);

async function loadCatalogPage(state: CatalogRouteState) {
  const categoryBackedConcern = state.category === 'all' ? catalogCategoryForConcern(state.concern) : undefined;
  let concernFilter = categoryBackedConcern ? catalogCategoryFilter(categoryBackedConcern) : '';
  if (!categoryBackedConcern && state.concern !== 'all') {
    const configuredConcerns = await getCatalogConcerns();
    const selectedConcern = configuredConcerns.find(item => item.id === state.concern);
    if (selectedConcern) concernFilter = customConcernFilter(selectedConcern);
  }

  const buildQuery = (countOnly = false) => {
    let query = supabase
      .from('products')
      .select(countOnly ? 'id' : '*', countOnly ? { count: 'exact', head: true } : { count: 'exact' })
      .eq('status', 'live');

    if (state.brand) {
      const brandPrefix = catalogBrandPrefix(state.brand);
      query = query.filter('vendor', 'ilike', `${brandPrefix}%`);
    }

    if (state.category === 'offers') {
      query = query.gt('compare_price', 'price');
    } else if (state.category !== 'all') {
      query = query.or(catalogCategoryFilter(state.category));
    }

    if (state.search) {
      if (!Number.isNaN(Number(state.search)) && state.search.split(/\s+/).length === 1) {
        query = query.or(`id.eq.${state.search},title.ilike."%${state.search}%",name.ilike."%${state.search}%",name_fr.ilike."%${state.search}%",sku.ilike."%${state.search}%",vendor.ilike."%${state.search}%"`);
      } else {
        const fields = ['title', 'name', 'name_fr', 'sku', 'vendor', 'category', 'description'];
        state.search.split(/\s+/).filter(Boolean).forEach(word => {
          query = query.or(fields.map(field => `${field}.ilike."%${word}%"`).join(','));
        });
      }
    }

    if (state.vendors.length > 0) query = query.in('vendor', state.vendors);
    if (state.maxPrice !== null) query = query.lte('price', state.maxPrice);

    if (state.ingredient) {
      const ingredientKey = normalizeIngredientKey(state.ingredient);
      const aliases = INGREDIENT_ALIASES[ingredientKey];
      if (aliases) {
        query = query.or(aliases.map(value => `ingredients.ilike.%${value}%`).join(','));
      } else {
        const escapedIngredient = state.ingredient.replace(/[%_]/g, '\\$&');
        query = query.filter('ingredients', 'ilike', `%${escapedIngredient}%`);
      }
    }

    if (state.category === 'all' && concernFilter) query = query.or(concernFilter);
    return query;
  };

  const { from, to } = catalogPageRange(state.page, PAGE_SIZE);
  const { data, count, error } = await applyCatalogSort(buildQuery(), state.sort).range(from, to);

  if (error?.code === 'PGRST103' && state.page > 1) {
    // Only the successful filtered count can establish that this range is
    // genuinely past the end. A count failure is allowed to propagate.
    const { count: filteredTotal, error: countError } = await buildQuery(true);
    if (countError) throw countError;
    if (filteredTotal === null) throw error;
    const total = filteredTotal;
    const pagination = {
      total,
      page: state.page,
      limit: PAGE_SIZE,
      totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    };
    if (state.page > pagination.totalPages) return { products: [], pagination };
  }

  if (error) throw error;

  let confirmedTotal = count;
  if (confirmedTotal === null) {
    const { count: filteredTotal, error: countError } = await buildQuery(true);
    if (countError) throw countError;
    if (filteredTotal === null) throw new Error('Unable to confirm catalogue result count');
    confirmedTotal = filteredTotal;
  }

  const products = (data || []).map(rowToProduct);
  const total = confirmedTotal;
  const pagination = {
    total,
    page: state.page,
    limit: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };

  return { products, pagination };
}

const getCachedCatalogPage = unstable_cache(
  loadCatalogPage,
  ['catalog-page'],
  { tags: [PUBLIC_CATALOG_CACHE_TAG], revalidate: 3600 }
);

export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }): Promise<Metadata> {
  const state = normalizeCatalogRouteState(await searchParams);
  return { alternates: { canonical: catalogCanonicalHref(state) } };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const rawPage = Array.isArray(params.page) ? params.page[0] : params.page;
  if (!isValidCatalogPageParam(rawPage)) notFound();
  const state = normalizeCatalogRouteState(params);
  const [{ products, pagination }, catalogFacets] = await Promise.all([
    getCachedCatalogPage(state),
    getCachedCatalogFacets(),
  ]);
  if (state.page > pagination.totalPages) notFound();

  return (
    <ProductsClient
      key={buildCatalogPageHref(state.page, state)}
      initialProducts={products}
      initialPagination={pagination}
      catalogFacets={catalogFacets}
      initialCategory={state.category}
      initialBrands={state.vendors.length > 0 ? state.vendors : state.brand ? [state.brand] : []}
      initialConcerns={state.concern === 'all' ? [] : [state.concern]}
      initialIngredient={state.ingredient}
      initialSearch={state.search}
      initialMaxPrice={state.maxPrice}
      initialSort={state.sort}
      initialPage={pagination.page}
      routeState={state}
    />
  );
}
