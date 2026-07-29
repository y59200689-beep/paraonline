import { Product } from '@/lib/data';
import { supabase } from '@/lib/supabase';
import ProductsClient from './ProductsClient';
import { unstable_cache } from 'next/cache';
import { PUBLIC_CATALOG_CACHE_TAG } from '@/lib/catalog-cache';

// A full product card carries images, controls, and rich product metadata.
// Keep the first catalogue view compact; pagination provides the rest without
// blocking navigation or hydration with 50 cards at once.
const PAGE_SIZE = 24;

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
    rating: Number(item.rating || 5),
    reviews: Number(item.reviews || 0),
    description: (item.description as string) || '',
    ingredients: (item.ingredients as string) || '',
    usage: (item.usage as string) || '',
    stock: item.stock != null ? Number(item.stock) : 100,
    sku: (item.sku as string) || undefined,
    buyingCost: item.buying_cost != null ? Number(item.buying_cost) : undefined,
    points: item.points != null ? Number(item.points) : 0,
  };
}

async function loadCatalogFacets() {
  const categoryCounts = new Map<string, number>();
  const brandCounts = new Map<string, number>();
  let offerCount = 0;
  let total = 0;
  const pageSize = 1000;

  for (let from = 0; ; from += pageSize) {
    const to = from + pageSize - 1;
    const { data, error } = await supabase
      .from('products')
      .select('category,categories,vendor,price,compare_price')
      .eq('status', 'live')
      .range(from, to);

    if (error) throw error;
    const batch = data || [];
    total += batch.length;

    batch.forEach((item: any) => {
      if (Number(item.compare_price) > Number(item.price)) offerCount += 1;
      const categories = Array.isArray(item.categories) && item.categories.length > 0
        ? item.categories
        : [item.category];

      Array.from(new Set<string>(
        categories
          .map((category: unknown) => String(category || '').trim().toLowerCase())
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

  return {
    total,
    categories: Array.from(categoryCounts.entries())
      .map(([id, count]) => ({ id, count }))
      .concat(offerCount > 0 ? [{ id: 'offers', count: offerCount }] : [])
      .sort((a, b) => a.id.localeCompare(b.id)),
    brands: Array.from(brandCounts.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => a.name.localeCompare(b.name)),
  };
}

const getCachedCatalogFacets = unstable_cache(
  loadCatalogFacets,
  ['catalog-facets'],
  { tags: [PUBLIC_CATALOG_CACHE_TAG], revalidate: 3600 }
);

async function loadCatalogPage(category: string) {
  let products: Product[] = [];
  let pagination = { total: 0, page: 1, limit: PAGE_SIZE, totalPages: 1 };

  try {
    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('status', 'live');

    if (category === 'offers') {
      query = query.gt('compare_price', 'price');
    } else if (category !== 'all') {
      query = query.or(`category.eq.${category},categories.cs.{"${category}"}`);
    }

    const { data, count, error } = await query
      .order('stock', { ascending: false })
      .order('title', { ascending: true })
      .order('id', { ascending: true })
      .range(0, PAGE_SIZE - 1);

    if (error) throw error;
    products = (data || []).map(rowToProduct);
    pagination = {
      total: count || products.length,
      page: 1,
      limit: PAGE_SIZE,
      totalPages: Math.max(1, Math.ceil((count || products.length) / PAGE_SIZE)),
    };
  } catch (err) {
    console.error("Error loading products on server:", err);
  }

  return { products, pagination };
}

const getCachedCatalogPage = unstable_cache(
  loadCatalogPage,
  ['catalog-page'],
  { tags: [PUBLIC_CATALOG_CACHE_TAG], revalidate: 300 }
);

function normalizeCategory(value: string | string[] | undefined) {
  const category = typeof value === 'string' ? value.trim().toLowerCase() : 'all';
  return /^[a-z0-9_-]+$/.test(category) ? category : 'all';
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string | string[] }>;
}) {
  const initialCategory = normalizeCategory((await searchParams).category);
  const [{ products, pagination }, catalogFacets] = await Promise.all([
    getCachedCatalogPage(initialCategory),
    getCachedCatalogFacets(),
  ]);

  return (
    <ProductsClient
      initialProducts={products}
      initialPagination={pagination}
      catalogFacets={catalogFacets}
      initialCategory={initialCategory}
    />
  );
}
