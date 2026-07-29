import { NextResponse } from 'next/server';
import { Product } from '@/lib/data';
import { supabaseAdmin as supabase } from '@/lib/supabase';

function matchesConcern(product: Product, concernId: string, customConcerns: any[] = []) {
  const text = `${product.title} ${product.nameFr || ''} ${product.description || ''} ${(product.tags || []).join(' ')}`.toLowerCase();
  const ingredients = (product.ingredients || '').toLowerCase();
  const hasCategory = (category: string) => {
    const normalize = (value: string) => value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();
    const categories = product.categories?.length ? product.categories : [product.category];
    return categories.some(item => normalize(String(item || '')) === normalize(category));
  };
  
  // Find concern config in dynamic list
  const concern = customConcerns.find((c: any) => c.id === concernId);
  if (concern) {
    const keywords = concern.keywords || [];
    const ingredientKeywords = concern.ingredientKeywords || [];
    const productIds = concern.productIds || [];
    
    if (productIds.includes(product.id)) return true;
    
    const kwMatch = keywords.some((kw: string) => text.includes(kw.toLowerCase()));
    const ingMatch = ingredientKeywords.some((kw: string) => ingredients.includes(kw.toLowerCase()) || text.includes(kw.toLowerCase()));
    return kwMatch || ingMatch;
  }

  // Fallbacks for hardcoded defaults
  if (concernId === 'acne') {
    return hasCategory('acné') || text.includes('acné') || text.includes('imperfection') || text.includes('bouton') || ingredients.includes('salicylic acid') || product.id === 3 || product.id === 22 || product.id === 15 || product.id === 16 || product.id === 17;
  }
  if (concernId === 'spots') {
    return hasCategory('anti tache') || text.includes('tache') || text.includes('éclat') || text.includes('bright') || text.includes('pigment') || ingredients.includes('tranexamic') || ingredients.includes('ascorbic') || product.id === 3 || product.id === 14;
  }
  if (concernId === 'dryness') {
    return text.includes('déshydrat') || text.includes('sec') || text.includes('hydrat') || ingredients.includes('hyaluronic') || product.id === 5 || product.id === 6 || product.id === 7 || product.id === 17;
  }
  if (concernId === 'wrinkles') {
    return hasCategory('anti rides') || text.includes('ridule') || text.includes('âge') || text.includes('anti-aging') || text.includes('vieill') || ingredients.includes('retinol') || product.id === 8 || product.id === 5 || product.id === 6;
  }
  if (concernId === 'redness') {
    return hasCategory('anti rougeur') || text.includes('rougeur') || text.includes('apais') || text.includes('sensible') || text.includes('sooth') || ingredients.includes('centella') || ingredients.includes('heartleaf') || product.id === 17 || product.id === 16 || product.id === 15;
  }
  return true;
}

function matchesIngredient(product: Product, ingredient: string) {
  const ingStr = (product.ingredients || '').toLowerCase();
  const nameStr = `${product.title} ${product.nameFr || ''} ${product.description || ''}`.toLowerCase();
  
  if (ingredient === 'niacinamide') {
    return ingStr.includes('niacinamide') || nameStr.includes('niacinamide') || product.id === 14 || product.id === 3 || product.id === 16;
  }
  if (ingredient === 'centella') {
    return ingStr.includes('centella') || ingStr.includes('madécassoside') || nameStr.includes('centella') || product.id === 17 || product.id === 16 || product.id === 14;
  }
  if (ingredient === 'retinol') {
    return ingStr.includes('retinol') || ingStr.includes('retinal') || nameStr.includes('retinol') || product.id === 8;
  }
  if (ingredient === 'vitamine_c') {
    return ingStr.includes('ascorbic') || ingStr.includes('ascorbyl') || nameStr.includes('vitamine c') || nameStr.includes('vitamin c') || product.id === 3 || product.id === 14;
  }
  if (ingredient === 'hyaluronic') {
    return ingStr.includes('hyaluronate') || ingStr.includes('hyaluronic') || nameStr.includes('hyaluronique') || product.id === 7 || product.id === 5 || product.id === 6 || product.id === 17;
  }
  if (ingredient === 'tranexamic') {
    return ingStr.includes('tranexamic') || nameStr.includes('tranexamique') || product.id === 14 || product.id === 16;
  }
  if (ingredient === 'squalane') {
    return ingStr.includes('squalane') || nameStr.includes('squalane') || product.id === 5;
  }
  if (ingredient === 'salicylic') {
    return ingStr.includes('salicylic') || nameStr.includes('salicylique') || product.id === 3 || product.id === 22;
  }
  return true;
}

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
    buyingCost: item.buying_cost !== null && item.buying_cost !== undefined ? Number(item.buying_cost) : undefined,
    points: item.points !== null && item.points !== undefined ? Number(item.points) : 0,
    status: ((item.status as string) || 'live') as 'live' | 'draft',
  };
}

async function fetchProductFacetRows() {
  const pageSize = 1000;
  const rows: Array<Record<string, unknown>> = [];

  for (let from = 0; ; from += pageSize) {
    const to = from + pageSize - 1;
    const { data, error } = await supabase
      .from('products')
      .select('category,categories,vendor,price,compare_price')
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
  const rows = await fetchProductFacetRows();
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
        .map(category => String(category || '').trim().toLowerCase())
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

  const { count: acneCount, error: acneCountError } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'live')
    .or('category.eq.acné,categories.cs.{"acné"},category.eq.acne,categories.cs.{"acne"}');
  if (acneCountError) throw acneCountError;
  const { count: spotsCount, error: spotsCountError } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'live')
    .or('category.eq."anti tache",categories.cs.{"anti tache"}');
  if (spotsCountError) throw spotsCountError;
  const { count: wrinklesCount, error: wrinklesCountError } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'live')
    .or('category.eq."anti rides",categories.cs.{"anti rides"}');
  if (wrinklesCountError) throw wrinklesCountError;
  const { count: rednessCount, error: rednessCountError } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'live')
    .or('category.eq."anti rougeur",categories.cs.{"anti rougeur"}');
  if (rednessCountError) throw rednessCountError;

  return {
    total: rows.length,
    categories: Array.from(categoryCounts.entries())
      .map(([id, count]) => ({ id, count }))
      .concat(offerCount > 0 ? [{ id: 'offers', count: offerCount }] : [])
      .sort((a, b) => a.id.localeCompare(b.id)),
    brands: Array.from(brandCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    concerns: { acne: acneCount || 0, spots: spotsCount || 0, wrinkles: wrinklesCount || 0, redness: rednessCount || 0 },
  };
}

function applySort(query: any, sort: string) {
  // Availability is the first public catalogue rule: products with stock are
  // shown before sold-out items. Product name is the stable A-Z tie-breaker.
  const availableFirst = query.order('stock', { ascending: false });

  if (sort === 'price-asc') {
    return availableFirst.order('price', { ascending: true }).order('title', { ascending: true });
  }
  if (sort === 'price-desc') {
    return availableFirst.order('price', { ascending: false }).order('title', { ascending: true });
  }
  if (sort === 'rating') {
    return availableFirst.order('rating', { ascending: false }).order('title', { ascending: true });
  }
  return availableFirst.order('title', { ascending: true }).order('id', { ascending: true });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.max(1, parseInt(searchParams.get('limit') || '15'));
  const category = searchParams.get('category') || 'all';
  const search = searchParams.get('search') || '';
  const vendor = searchParams.get('vendor') || '';
  const vendors = (searchParams.get('vendors') || '').split(',').map(v => v.trim()).filter(Boolean);
  const concern = searchParams.get('concern') || 'all';
  const ingredient = searchParams.get('ingredient') || 'all';
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
      const ids = idsStr.split(',').map(Number).filter(Boolean).slice(0, 15);
      const { data, error } = await supabase
        .from('products')
        .select('*')
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
        .select('*')
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

    let query = supabase.from('products').select('*', { count: 'exact' });

    // Filter out drafts on public customer storefront
    query = query.eq('status', 'live');

    if (category !== 'all') {
      if (category === 'offers') {
        query = query.gt('compare_price', 'price');
      } else {
        query = query.or(`category.eq.${category},categories.cs.{"${category}"}`);
      }
    }

    if (search) {
      const cleanSearch = search.replace(/"/g, '').trim();
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

    // Fetch custom concerns from settings
    let customConcerns: any[] = [];
    try {
      const { data: settingsData } = await supabase
        .from('settings')
        .select('value')
        .eq('id', 1)
        .single();
      if (settingsData && settingsData.value) {
        customConcerns = settingsData.value.customConcerns || [];
      }
    } catch (e) {
      console.error("Failed to load settings in products API route:", e);
    }

    const needsPostFilter = concern !== 'all' || ingredient !== 'all';
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
      const { data, count, error } = await applySort(query, sort).range(from, to);
      if (error || !data) {
        throw error || new Error('No products returned');
      }
      products = (data as Array<Record<string, unknown>>).map(mapProduct);
      total = count || products.length;
    }

    if (concern !== 'all') {
      products = products.filter(p => matchesConcern(p, concern, customConcerns));
    }
    if (ingredient !== 'all') {
      products = products.filter(p => matchesIngredient(p, ingredient));
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
          'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error: any) {
    console.error("Products catalog GET error:", error);
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}
