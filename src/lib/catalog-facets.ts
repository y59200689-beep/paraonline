import 'server-only';
import { unstable_cache } from 'next/cache';
import { supabaseAdmin as supabase } from './supabase-server';
import { PUBLIC_CATALOG_CACHE_TAG } from './catalog-cache';
import { normalizeCatalogCategoryId } from './catalog-categories';
import { catalogCategoryForConcern, countCatalogConcerns, getCatalogConcerns } from './catalog-concerns';
import type { Product } from './data';

type Row = Record<string, unknown>;
const BATCH_SIZE = 1000;

export async function loadCatalogFacets() {
  const concerns = await getCatalogConcerns();
  // Default concerns depend only on assigned categories. Do not download every
  // description and ingredient list just to render category/brand counts.
  const needsText = concerns.some(concern => !catalogCategoryForConcern(concern.id));
  const columns = 'id,category,categories,vendor,price,compare_price'
    + (needsText ? ',title,name_fr,tags,description,ingredients' : '');
  const read = async (from: number, count = false) => {
    const result = await supabase.from('products')
      .select(columns, count ? { count: 'exact' } : undefined)
      .eq('status', 'live').order('id', { ascending: true })
      .range(from, from + BATCH_SIZE - 1);
    if (result.error) throw result.error;
    return result;
  };
  const first = await read(0, true);
  const rows: Row[] = [...(first.data || [])];
  if (first.count !== null && first.count !== undefined) {
    // Four concurrent reads cap database pressure while avoiding 16 sequential
    // network round trips on the first request after cache invalidation.
    const offsets = Array.from({ length: Math.max(0, Math.ceil(first.count / BATCH_SIZE) - 1) }, (_, i) => (i + 1) * BATCH_SIZE);
    for (let i = 0; i < offsets.length; i += 4) {
      const batches = await Promise.all(offsets.slice(i, i + 4).map(from => read(from)));
      batches.forEach(batch => rows.push(...(batch.data || [])));
    }
  } else if (rows.length === BATCH_SIZE) {
    for (let from = BATCH_SIZE; ; from += BATCH_SIZE) {
      const batch = await read(from);
      rows.push(...(batch.data || []));
      if ((batch.data || []).length < BATCH_SIZE) break;
    }
  }

  const categories = new Map<string, number>();
  const brands = new Map<string, number>();
  let offers = 0;
  for (const row of rows) {
    if (Number(row.compare_price) > Number(row.price)) offers++;
    const assigned = Array.isArray(row.categories) && row.categories.length ? row.categories : [row.category];
    const ids = new Set(assigned.map(value => normalizeCatalogCategoryId(String(value || ''))).filter(Boolean));
    ids.forEach(id => categories.set(id, (categories.get(id) || 0) + 1));
    const vendor = typeof row.vendor === 'string' ? row.vendor.trim() : '';
    if (vendor && vendor !== '-') brands.set(vendor, (brands.get(vendor) || 0) + 1);
  }
  // The offers entry represents discounted rows, not the similarly named
  // category assigned by imports. Keep a single authoritative facet entry.
  categories.delete('offers');
  if (offers) categories.set('offers', offers);
  const products = rows.map(row => ({ ...row, nameFr: row.name_fr, tags: row.tags || [] })) as unknown as Product[];
  return {
    total: rows.length,
    categories: [...categories].map(([id, count]) => ({ id, count })).sort((a, b) => a.id.localeCompare(b.id)),
    brands: [...brands].map(([name, count]) => ({ name, count })).sort((a, b) => a.name.localeCompare(b.name)),
    concerns: countCatalogConcerns(products, concerns),
  };
}

export const getCachedCatalogFacets = unstable_cache(loadCatalogFacets,
  ['catalog-facets-v3', process.env.NEXT_PUBLIC_SUPABASE_URL || 'unconfigured'],
  { tags: [PUBLIC_CATALOG_CACHE_TAG], revalidate: 3600 });
