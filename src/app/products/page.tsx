import { Product } from '@/lib/data';
import { supabase } from '@/lib/supabase';
import ProductsClient from './ProductsClient';

export const revalidate = 3600; // 1 hour
const PAGE_SIZE = 50;

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
  let total = 0;
  const pageSize = 1000;

  for (let from = 0; ; from += pageSize) {
    const to = from + pageSize - 1;
    const { data, error } = await supabase
      .from('products')
      .select('category,categories,vendor')
      .eq('status', 'live')
      .range(from, to);

    if (error) throw error;
    const batch = data || [];
    total += batch.length;

    batch.forEach((item: any) => {
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
    categories: Array.from(categoryCounts.entries()).map(([id, count]) => ({ id, count })).sort((a, b) => a.id.localeCompare(b.id)),
    brands: Array.from(brandCounts.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => a.name.localeCompare(b.name)),
  };
}

export default async function ProductsPage() {
  let products: Product[] = [];
  let pagination = { total: 0, page: 1, limit: PAGE_SIZE, totalPages: 1 };
  let facets = { total: 0, categories: [] as Array<{ id: string; count: number }>, brands: [] as Array<{ name: string; count: number }> };

  try {
    const [{ data, count, error }, catalogFacets] = await Promise.all([
      supabase
        .from('products')
        .select('*', { count: 'exact' })
        .eq('status', 'live')
        .order('id', { ascending: true })
        .range(0, PAGE_SIZE - 1),
      loadCatalogFacets(),
    ]);

    if (error) throw error;
    products = (data || []).map(rowToProduct);
    pagination = {
      total: count || products.length,
      page: 1,
      limit: PAGE_SIZE,
      totalPages: Math.max(1, Math.ceil((count || products.length) / PAGE_SIZE)),
    };
    facets = catalogFacets;
  } catch (err) {
    console.error("Error loading products on server:", err);
  }

  return <ProductsClient initialProducts={products} initialPagination={pagination} catalogFacets={facets} />;
}
