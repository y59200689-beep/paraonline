import { NextResponse } from 'next/server';
import { Product } from '@/lib/data';
import { supabaseAdmin as supabase } from '@/lib/supabase-server';
import { catalogCategoryForConcern, getCatalogConcerns, matchesCatalogConcern } from '@/lib/catalog-concerns';
import { catalogCategoryFilter, normalizeCatalogCategoryId } from '@/lib/catalog-categories';
import { catalogBrandPrefix, sanitizeCatalogSearch } from '@/lib/catalog-brand-match';
import { getCachedCatalogFacets } from '@/lib/catalog-facets';
import { searchStockResults } from '@/lib/search-stock-results';
import { applyCatalogSort, isValidCatalogPageParam, type CatalogSort } from '@/lib/catalog-pagination';

// Catalogue data is operational data. Never allow a transient empty response
// to become a Vercel edge-cache entry for every storefront visitor.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

// The response is mapped through `mapProduct`, so operational/private columns
// are never returned. Selecting the row also keeps this endpoint compatible
// while optional recommendation governance columns are being migrated.
const PUBLIC_PRODUCT_COLUMNS = '*';

const MAX_CATALOG_PAGE_SIZE = 100;

const boundedPositiveInteger = (value: string | null, fallback: number, maximum: number) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? Math.min(parsed, maximum) : fallback;
};


const normalizeIngredientKey = (value: string) => value
  .trim()
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '_')
  .replace(/^_|_$/g, '');

function mapProduct(item: Record<string, unknown>): Product {
  const category = item.category as string;
  const baseProduct: Partial<Product> = {
    id: item.id as number,
    title: item.title as string,
    name: (item.name as string) || undefined,
    nameFr: (item.name_fr as string) || undefined,
    vendor: item.vendor as string,
    image: item.image as string,
    images: (item.images as string[]) || [],
    price: Number(item.price),
    comparePrice: Number((item.compare_price as number) || item.price),
    category,
    categories: Array.isArray(item.categories) && item.categories.length > 0
      ? item.categories as string[]
      : [category],
    tags: (item.tags as string[]) || [],
    rating: Number(item.rating || 0),
    reviews: Number(item.reviews || 0),
    description: (item.description as string) || '',
    ingredients: (item.ingredients as string) || '',
    usage: (item.usage as string) || '',
    stock: item.stock !== null && item.stock !== undefined ? Number(item.stock) : 100,
    sku: (item.sku as string) || undefined,
    points: item.points !== null && item.points !== undefined ? Number(item.points) : 0,
    status: item.status === 'live' ? 'live' : 'draft',
    // Public products are already limited to live catalogue records. Keep the
    // face-product signal compatible with existing databases that have not
    // added the optional `is_face_product` column yet.
    isFaceProduct: item.is_face_product === true || [item.category, ...(Array.isArray(item.categories) ? item.categories : [])]
      .filter(Boolean)
      .some((category) => /(^|\\s)(visage|face|skincare|soin visage)(\\s|$)/i.test(String(category))),
    recommendationStatus: item.recommendation_status === 'rejected'
      ? 'rejected'
      : item.recommendation_status === 'draft'
        ? 'draft'
        : 'approved',
    routineRoles: Array.isArray(item.routine_roles) ? item.routine_roles as Product['routineRoles'] : [],
    suitableSkinTypes: Array.isArray(item.suitable_skin_types) ? item.suitable_skin_types as Product['suitableSkinTypes'] : [],
    suitableConcerns: Array.isArray(item.suitable_concerns) ? item.suitable_concerns as Product['suitableConcerns'] : [],
    sensitivityLevels: Array.isArray(item.sensitivity_levels) ? item.sensitivity_levels as Product['sensitivityLevels'] : [],
    activeStrength: (item.active_strength as Product['activeStrength']) || undefined,
    timeOfDay: Array.isArray(item.time_of_day) ? item.time_of_day as Product['timeOfDay'] : [],
  };

  return baseProduct as Product;
}

function customConcernFilter(concern: { keywords?: string[]; ingredientKeywords?: string[]; productIds?: number[] }) {
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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawPage = searchParams.get('page');
  if (!isValidCatalogPageParam(rawPage)) {
    return NextResponse.json({ success: false, error: 'Invalid page number' }, { status: 400 });
  }
  const page = rawPage === null ? 1 : Number(rawPage);
  const limit = boundedPositiveInteger(searchParams.get('limit'), 15, MAX_CATALOG_PAGE_SIZE);
  const category = normalizeCatalogCategoryId(searchParams.get('category') || 'all');
  const search = sanitizeCatalogSearch(searchParams.get('search') || '');
  const vendor = sanitizeCatalogSearch(searchParams.get('vendor') || '');
  const vendors = (searchParams.get('vendors') || '')
    .split(',')
    .map(sanitizeCatalogSearch)
    .filter(Boolean)
    .slice(0, 20);
  const concern = searchParams.get('concern') || 'all';
  const requestedIngredient = (searchParams.get('ingredient') || '').trim().slice(0, 100);
  // Storefront clients send `ingredient=all` for the default view. Treat it as
  // an unfiltered catalogue request rather than searching for an ingredient
  // literally named "all".
  const ingredient = requestedIngredient.toLowerCase() === 'all' ? '' : requestedIngredient;
  const sort = searchParams.get('sort') || 'popular';
  const maxPrice = Number(searchParams.get('maxPrice') || '0');
  const facetsOnly = searchParams.get('facets') === 'true';
  const idStr = searchParams.get('id') || '';
  const idsStr = searchParams.get('ids') || '';
  const inStockOnly = searchParams.get('inStock') === 'true';

  try {
    if (facetsOnly) {
      const facets = await getCachedCatalogFacets();
      return NextResponse.json(
        { success: true, facets },
        { headers: { 'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=3600' } }
      );
    }

    // Batch fetch by comma-separated IDs (used by curated ProductGrid)
    if (idsStr) {
      const ids = idsStr.split(',').map(Number).filter(Boolean).slice(0, 50);
      let batchQuery = supabase
        .from('products')
        .select(PUBLIC_PRODUCT_COLUMNS)
        .in('id', ids)
        .eq('status', 'live');
      if (inStockOnly) batchQuery = batchQuery.gt('stock', 0);
      const { data, error } = await batchQuery;

      if (error || !data) {
        return NextResponse.json({ success: false, message: 'Products not found' }, { status: 404 });
      }

      const products = (data as Array<Record<string, unknown>>).map(mapProduct);

      return NextResponse.json(
        { success: true, products },
        { headers: { 'Cache-Control': inStockOnly ? 'no-store, max-age=0' : 'public, max-age=300, s-maxage=300, stale-while-revalidate=3600' } }
      );
    }

    // Single product fetch by id
    if (idStr) {
      const id = parseInt(idStr);
      const { data, error } = await supabase
        .from('products')
        .select(PUBLIC_PRODUCT_COLUMNS)
        .eq('id', id)
        .single();
        
      if (error || !data) {
        return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
      }
      
      const matchedProduct = mapProduct(data as Record<string, unknown>);
      
      return NextResponse.json(
        { success: true, product: matchedProduct },
        {
          headers: {
            'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
          },
        }
      );
    }

    const buildQuery = (countOnly = false) => {
    let query = countOnly
      ? supabase.from(category === 'offers' ? 'storefront_offer_products' : 'products').select('id', { count: 'exact', head: true })
      : supabase.from(category === 'offers' ? 'storefront_offer_products' : 'products').select(PUBLIC_PRODUCT_COLUMNS, { count: 'exact' });

    // Filter out drafts on public customer storefront
    query = query.eq('status', 'live');
    if (inStockOnly) query = query.gt('stock', 0);

    if (category !== 'all') {
      if (category !== 'offers') {
        query = query.or(catalogCategoryFilter(category));
      }
    }

    if (search) {
      const cleanSearch = search;
      if (cleanSearch) {
        const words = cleanSearch.split(/\s+/).filter(Boolean);
        const fields = ['title', 'name', 'name_fr', 'sku', 'vendor', 'category', 'description'];

        if (!isNaN(Number(cleanSearch)) && words.length === 1) {
          query = query.or(`id.eq.${cleanSearch},title.ilike."%${cleanSearch}%",name.ilike."%${cleanSearch}%",name_fr.ilike."%${cleanSearch}%",sku.ilike."%${cleanSearch}%",vendor.ilike."%${cleanSearch}%"`);
        } else {
          words.forEach(w => {
            const wordConditions = fields.map(f => `${f}.ilike."%${w}%"`).join(',');
            query = query.or(wordConditions);
          });
        }
      }
    }

    // Vendor filter for brand pages — case-insensitive prefix match
    // Also strips hyphens so "La Roche-Posay" matches "LA ROCHE POSAY"
    if (vendor) {
      // Use the first 'word group' to maximize match coverage
      // e.g. "La Roche-Posay" → filter by "la roche%" 
      const firstChunk = catalogBrandPrefix(vendor);
      query = query.filter('vendor', 'ilike', `${firstChunk}%`);
    }

    if (vendors.length > 0) {
      query = query.in('vendor', vendors);
    }

    if (Number.isFinite(maxPrice) && maxPrice > 0) {
      query = query.lte('price', maxPrice);
    }

    // Ingredients are imported into the dedicated products.ingredients column.
    // Keep this query database-side so filtering remains quick for a large catalogue.
    if (ingredient) {
      const aliases = INGREDIENT_ALIASES[normalizeIngredientKey(ingredient)];
      if (aliases) {
        query = query.or(aliases.map(value => `ingredients.ilike.%${value}%`).join(','));
      } else {
        query = query.filter('ingredients', 'ilike', `%${ingredient.replace(/[%_]/g, '\\$&')}%`);
      }
    }

    return query;
    };

    const categoryBackedConcern = catalogCategoryForConcern(concern);
    const customConcerns = concern !== 'all' && !categoryBackedConcern ? await getCatalogConcerns() : [];
    const selectedCustomConcern = customConcerns.find(item => item.id === concern);
    const concernFilter = categoryBackedConcern
      ? catalogCategoryFilter(categoryBackedConcern)
      : selectedCustomConcern
        ? customConcernFilter(selectedCustomConcern)
        : '';

    const filteredQuery = (countOnly = false) => {
      const query = buildQuery(countOnly);
      return category === 'all' && concernFilter ? query.or(concernFilter) : query;
    };

    if (search && sort === 'search-stock') {
      const rows = await searchStockResults(filteredQuery, searchParams.get('search') || '', limit);
      return NextResponse.json({ success: true, products: rows.map(mapProduct) }, {
        headers: { 'Cache-Control': 'no-store, max-age=0' },
      });
    }
    const query = filteredQuery();

    // Concerns are translated to database filters above. This keeps pagination
    // bounded instead of fetching the full catalogue into a serverless worker.
    const needsPostFilter = false;
    const catalogConcerns = customConcerns;
    let products: Product[] = [];
    let total = 0;

    if (needsPostFilter) {
      const pageSize = 1000;
      const allRows: Product[] = [];

      for (let from = 0; ; from += pageSize) {
        const to = from + pageSize - 1;
        const { data, error } = await applyCatalogSort(query, normalizeSort(sort)).range(from, to);
        if (error || !data) throw error || new Error('No products returned');
        const batch = (data as Array<Record<string, unknown>>).map(mapProduct);
        allRows.push(...batch);
        if (batch.length < pageSize) break;
      }

      products = allRows;
    } else {
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      const { data, count, error } = await applyCatalogSort(query, normalizeSort(sort)).range(from, to);

      if (error?.code === 'PGRST103' && page > 1) {
        // PostgREST may reject a range past its configured row window. Check
        // the filtered total separately so an ordinary out-of-range request
        // gets a 404 instead of being surfaced as a server failure.
        const { count: filteredTotal, error: countError } = await filteredQuery(true);
        if (countError) throw countError;
        if (filteredTotal !== null && page > Math.max(1, Math.ceil(filteredTotal / limit))) {
          return NextResponse.json({ success: false, error: 'Catalogue page not found' }, { status: 404 });
        }
      }

      if (error || !data) {
        throw error || new Error('No products returned');
      }
      products = (data as Array<Record<string, unknown>>).map(mapProduct);
      let confirmedTotal = count;
      if (confirmedTotal === null) {
        const { count: filteredTotal, error: countError } = await filteredQuery(true);
        if (countError) throw countError;
        if (filteredTotal === null) throw new Error('Unable to confirm catalogue result count');
        confirmedTotal = filteredTotal;
      }
      total = confirmedTotal;
      if (page > Math.max(1, Math.ceil(total / limit))) {
        return NextResponse.json({ success: false, error: 'Catalogue page not found' }, { status: 404 });
      }
    }

    if (needsPostFilter) {
      products = products.filter(product => matchesCatalogConcern(product, concern, catalogConcerns));
    }
    if (needsPostFilter) {
      total = products.length;
      const from = (page - 1) * limit;
      products = products.slice(from, from + limit);
    }

    return NextResponse.json(
      {
        success: true,
        products,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.max(1, Math.ceil(total / limit))
        }
      },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (error: any) {
    console.error("Products catalog GET error:", error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

function normalizeSort(sort: string): CatalogSort {
  return sort === 'price-asc' || sort === 'price-desc' || sort === 'rating' || sort === 'alphabetical'
    ? sort
    : 'popular';
}
