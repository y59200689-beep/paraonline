import { NextResponse } from 'next/server';
import { Product } from '@/lib/data';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { catalogCategoryForConcern, countCatalogConcerns, getCatalogConcerns, matchesCatalogConcern } from '@/lib/catalog-concerns';
import { catalogCategoryFilter, normalizeCatalogCategoryId } from '@/lib/catalog-categories';

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

const PUBLIC_PRODUCT_COLUMNS = [
  'id', 'title', 'name', 'name_fr', 'vendor', 'image', 'images', 'price',
  'compare_price', 'category', 'categories', 'tags', 'rating', 'reviews',
  'description', 'ingredients', 'usage', 'stock', 'sku', 'points',
  'routine_roles', 'suitable_skin_types', 'suitable_concerns',
  'sensitivity_levels', 'active_strength', 'time_of_day',
].join(',');

const MAX_CATALOG_PAGE = 10_000;
const MAX_CATALOG_PAGE_SIZE = 100;
const MAX_CATALOG_SEARCH_LENGTH = 120;

const boundedPositiveInteger = (value: string | null, fallback: number, maximum: number) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? Math.min(parsed, maximum) : fallback;
};

const sanitizeCatalogSearch = (value: string) => value
  .normalize('NFKC')
  .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
  .replace(/\s+/g, ' ')
  .trim()
  .slice(0, MAX_CATALOG_SEARCH_LENGTH);

const normalizeIngredientKey = (value: string) => value
  .trim()
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '_')
  .replace(/^_|_$/g, '');

function mapProduct(item: Record<string, unknown>): Product {
  const category = item.category as string;
  return {
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
    rating: 4.0 + (((((item.rating ? Number(item.rating) : 5) * 7) + (item.id as number)) % 10) + 1) / 10,
    reviews: Number(item.reviews || 0),
    description: (item.description as string) || '',
    ingredients: (item.ingredients as string) || '',
    usage: (item.usage as string) || '',
    stock: item.stock !== null && item.stock !== undefined ? Number(item.stock) : 100,
    sku: (item.sku as string) || undefined,
    points: item.points !== null && item.points !== undefined ? Number(item.points) : 0,
    status: 'live',
    routineRoles: Array.isArray(item.routine_roles) ? item.routine_roles as Product['routineRoles'] : [],
    suitableSkinTypes: Array.isArray(item.suitable_skin_types) ? item.suitable_skin_types as Product['suitableSkinTypes'] : [],
    suitableConcerns: Array.isArray(item.suitable_concerns) ? item.suitable_concerns as Product['suitableConcerns'] : [],
    sensitivityLevels: Array.isArray(item.sensitivity_levels) ? item.sensitivity_levels as Product['sensitivityLevels'] : [],
    activeStrength: (item.active_strength as Product['activeStrength']) || 'none',
    timeOfDay: Array.isArray(item.time_of_day) ? item.time_of_day as Product['timeOfDay'] : [],
  };
}

async function fetchProductFacetRows() {
  const pageSize = 1000;
  const rows: Array<Record<string, unknown>> = [];

  for (let from = 0; ; from += pageSize) {
    const to = from + pageSize - 1;
    const { data, error } = await supabase
      .from('products')
      .select('id,title,name_fr,category,categories,tags,description,ingredients,vendor,price,compare_price')
      .eq('status', 'live')
      .range(from, to);

    if (error) throw error;
    const batch = (data || []) as Array<Record<string, unknown>>;
    rows.push(...batch);

    if (batch.length < pageSize) break;
  }

  return rows;
}

async function buildCatalogFacets() {
  const [rows, concerns] = await Promise.all([fetchProductFacetRows(), getCatalogConcerns()]);
  const categoryCounts = new Map<string, number>();
  const brandCounts = new Map<string, number>();
  let offerCount = 0;

  for (const row of rows) {
    if (Number(row.compare_price) > Number(row.price)) offerCount += 1;
    const categories = Array.isArray(row.categories) && row.categories.length > 0
      ? row.categories as string[]
      : [row.category as string];

    const uniqueCategories = Array.from(new Set(
      categories
        .map(category => normalizeCatalogCategoryId(String(category || '')))
        .filter(Boolean)
    ));

    for (const category of uniqueCategories) {
      categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
    }

    const vendor = typeof row.vendor === 'string' ? row.vendor.trim() : '';
    if (vendor && vendor !== '-') {
      brandCounts.set(vendor, (brandCounts.get(vendor) || 0) + 1);
    }
  }

  return {
    total: rows.length,
    categories: Array.from(categoryCounts.entries())
      .map(([id, count]) => ({ id, count }))
      .concat(offerCount > 0 ? [{ id: 'offers', count: offerCount }] : [])
      .sort((a, b) => a.id.localeCompare(b.id)),
    brands: Array.from(brandCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    concerns: countCatalogConcerns(rows.map(mapProduct), concerns),
  };
}

function applySort(query: any, sort: string) {
  if (sort === 'price-asc') {
    return query.order('price', { ascending: true }).order('title', { ascending: true });
  }
  if (sort === 'price-desc') {
    return query.order('price', { ascending: false }).order('title', { ascending: true });
  }
  if (sort === 'rating') {
    return query.order('rating', { ascending: false }).order('title', { ascending: true });
  }
  return query.order('title', { ascending: true }).order('id', { ascending: true });
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
  const page = boundedPositiveInteger(searchParams.get('page'), 1, MAX_CATALOG_PAGE);
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

  try {
    if (facetsOnly) {
      const facets = await buildCatalogFacets();
      return NextResponse.json(
        { success: true, facets },
        { headers: { 'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=3600' } }
      );
    }

    // Batch fetch by comma-separated IDs (used by curated ProductGrid)
    if (idsStr) {
      const ids = idsStr.split(',').map(Number).filter(Boolean).slice(0, 50);
      const { data, error } = await supabase
        .from('products')
        .select(PUBLIC_PRODUCT_COLUMNS)
        .in('id', ids);

      if (error || !data) {
        return NextResponse.json({ success: false, message: 'Products not found' }, { status: 404 });
      }

      const products = (data as Array<Record<string, unknown>>).map(mapProduct);

      return NextResponse.json(
        { success: true, products },
        { headers: { 'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=3600' } }
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

    let query = supabase.from('products').select(PUBLIC_PRODUCT_COLUMNS, { count: 'exact' });

    // Filter out drafts on public customer storefront
    query = query.eq('status', 'live');

    if (category !== 'all') {
      if (category === 'offers') {
        query = query.gt('compare_price', 'price');
      } else {
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
      const normalizedVendor = vendor.replace(/-/g, ' ').trim();
      const firstChunk = normalizedVendor.split(' ').slice(0, 2).join(' ');
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

    const categoryBackedConcern = catalogCategoryForConcern(concern);
    const customConcerns = concern !== 'all' && !categoryBackedConcern ? await getCatalogConcerns() : [];
    const selectedCustomConcern = customConcerns.find(item => item.id === concern);
    const concernFilter = categoryBackedConcern
      ? catalogCategoryFilter(categoryBackedConcern)
      : selectedCustomConcern
        ? customConcernFilter(selectedCustomConcern)
        : '';

    if (category === 'all' && concernFilter) {
      query = query.or(concernFilter);
    }

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
        const { data, error } = await applySort(query, sort).range(from, to);
        if (error || !data) throw error || new Error('No products returned');
        const batch = (data as Array<Record<string, unknown>>).map(mapProduct);
        allRows.push(...batch);
        if (batch.length < pageSize) break;
      }

      products = allRows;
    } else {
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      let { data, count, error } = await applySort(query, sort).range(from, to);

      // The storefront must remain usable even if a database ordering index is
      // temporarily unavailable. This is deliberately limited to the default
      // catalogue view so intentional empty search/filter results stay intact.
      const isDefaultCatalogRequest = category === 'all'
        && !search
        && !vendor
        && vendors.length === 0
        && !ingredient
        && maxPrice === 0;
      if (!error && isDefaultCatalogRequest && (!data || data.length === 0)) {
        const fallback = await supabase
          .from('products')
          .select(PUBLIC_PRODUCT_COLUMNS, { count: 'exact' })
          .eq('status', 'live')
          .order('title', { ascending: true })
          .range(from, to);
        data = fallback.data;
        count = fallback.count;
        error = fallback.error;
      }
      if (error || !data) {
        throw error || new Error('No products returned');
      }
      products = (data as Array<Record<string, unknown>>).map(mapProduct);
      total = count || products.length;
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
          totalPages: Math.ceil(total / limit)
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
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}
