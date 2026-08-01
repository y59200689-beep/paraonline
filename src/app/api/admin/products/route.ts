import { NextResponse } from 'next/server';
import { Product } from '@/lib/data';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/session';
import { revalidatePath, revalidateTag } from 'next/cache';
import { PUBLIC_CATALOG_CACHE_TAG } from '@/lib/catalog-cache';

function normalizeCategories(categories: unknown, primaryCategory: unknown): string[] {
  const primary = typeof primaryCategory === 'string' && primaryCategory.trim()
    ? primaryCategory.trim().toLowerCase()
    : 'visage';
  const supplied = Array.isArray(categories) ? categories : [];
  const extras = supplied
    .filter((category): category is string => typeof category === 'string')
    .map(category => category.trim().toLowerCase())
    .filter(Boolean);

  return Array.from(new Set([primary, ...extras]));
}

function applyProductFilters(
  query: any,
  {
    category,
    vendor,
    status,
    search,
    specialFilters,
    lowStockThreshold,
  }: {
    category: string;
    vendor: string;
    status: string;
    search: string;
    specialFilters: string[];
    lowStockThreshold: number;
  },
  options: { includeStatus?: boolean } = {}
) {
  if (category && category !== 'all') {
    query = query.or(`category.eq.${category},categories.cs.{"${category}"}`);
  }
  if (vendor && vendor !== 'all') {
    query = query.eq('vendor', vendor);
  }
  if (options.includeStatus !== false && status && status !== 'all') {
    query = query.eq('status', status);
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

  if (specialFilters.length > 0 && !specialFilters.includes('all')) {
    if (specialFilters.includes('no_image')) {
      query = query.or('image.eq.,image.eq./placeholder.png,image.is.null');
    }
    if (specialFilters.includes('negative_stock')) {
      query = query.lt('stock', 0);
    }
    if (specialFilters.includes('out_of_stock')) {
      query = query.eq('stock', 0);
    }
    if (specialFilters.includes('positive_stock')) {
      query = query.gt('stock', 0);
    }
    if (specialFilters.includes('positive_stock_no_vendor')) {
      query = query.gt('stock', 0).or('vendor.eq.,vendor.eq.-,vendor.is.null');
    }
    if (specialFilters.includes('positive_stock_no_desc')) {
      query = query.gt('stock', 0).or('description.eq.,description.is.null');
    }
    if (specialFilters.includes('low_stock')) {
      query = query.lte('stock', lowStockThreshold);
    }
    if (specialFilters.includes('no_desc')) {
      query = query.or('description.eq.,description.is.null');
    }
    if (specialFilters.includes('no_price')) {
      query = query.or('price.eq.0,price.is.null');
    }
    if (specialFilters.includes('no_vendor')) {
      query = query.or('vendor.eq.,vendor.eq.-,vendor.is.null');
    }
    if (specialFilters.includes('no_ingredients')) {
      query = query.or('ingredients.eq.,ingredients.is.null');
    }
  }

  return query;
}

function buildAdminProductsQuery(filters: {
  category: string;
  vendor: string;
  status: string;
  search: string;
  specialFilters: string[];
  lowStockThreshold: number;
  sortField: string;
  sortDirection: string;
}) {
  const query = applyProductFilters(
    supabase.from('products').select('*', { count: 'exact' }),
    filters
  );

  let finalSortField = 'id';
  if (filters.sortField === 'name') {
    finalSortField = 'title';
  } else if (['sku', 'stock', 'price', 'category', 'vendor', 'id'].includes(filters.sortField)) {
    finalSortField = filters.sortField;
  }

  return query.order(finalSortField, { ascending: filters.sortDirection === 'asc' });
}

async function countProductsByStatus(filters: {
  category: string;
  vendor: string;
  search: string;
  specialFilters: string[];
  lowStockThreshold: number;
}) {
  const countFor = async (status: 'live' | 'draft') => {
    const query = applyProductFilters(
      supabase.from('products').select('id', { count: 'exact', head: true }),
      { ...filters, status, },
      { includeStatus: true }
    );

    const { count, data, error } = await query;
    if (error) throw error;
    return count ?? data?.length ?? 0;
  };

  const [live, draft] = await Promise.all([countFor('live'), countFor('draft')]);
  return { all: live + draft, live, draft };
}

// GET: Fetch products for admin catalog management (supporting pagination, sorting, search, and special filters)
export async function GET(request: Request) {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Accès refusé. Veuillez vous connecter.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const pageParam = searchParams.get('page');
    const isPaginated = pageParam !== null;
    const page = Math.max(1, parseInt(pageParam || '1'));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || (isPaginated ? '50' : '20000')));
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const vendor = searchParams.get('vendor') || '';
    const status = searchParams.get('status') || '';
    const special = searchParams.get('special') || '';
    const sortField = searchParams.get('sortField') || 'id';
    const sortDirection = searchParams.get('sortDirection') || 'asc';
    const lowStockThreshold = parseInt(searchParams.get('lowStockThreshold') || '5');
    const summary = searchParams.get('summary') || '';

    // Dashboard KPI: count in the database without transferring the full catalogue.
    if (summary === 'low-stock') {
      const { count, error } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .lte('stock', lowStockThreshold);

      if (error) throw error;

      return NextResponse.json(
        { success: true, lowStockCount: count || 0 },
        { headers: { 'Cache-Control': 'private, no-store' } }
      );
    }

    const specialFilters = special ? special.split(',') : [];

    // We fetch without range limit if the special filter requires in-route array filtering
    const needsInRouteProcessing = specialFilters.some(f => f === 'dead_products' || f === 'low_margin' || f === 'on_sale' || f === 'needs_review');

    const queryFilters = { category, vendor, status, search, specialFilters, lowStockThreshold, sortField, sortDirection };
    let resultProducts: any[] = [];
    let totalCount = 0;

    if (isPaginated && !needsInRouteProcessing) {
      let query = buildAdminProductsQuery(queryFilters);
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);
      const { data, count, error } = await query;
      if (error || !data) {
        throw error || new Error('No products returned');
      }
      resultProducts = data;
      totalCount = count || data.length;
    } else {
      const pageSize = 1000;
      for (let from = 0; ; from += pageSize) {
        const to = from + pageSize - 1;
        const { data, count, error } = await buildAdminProductsQuery(queryFilters).range(from, to);
        if (error || !data) {
          throw error || new Error('No products returned');
        }
        if (from === 0) totalCount = count || 0;
        resultProducts.push(...data);
        if (data.length < pageSize) break;
      }
      if (!totalCount) totalCount = resultProducts.length;
    }

    // Handle in-route manual filtering for complex metrics
    if (needsInRouteProcessing) {
      if (specialFilters.includes('dead_products')) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { data: recentOrders } = await supabase
          .from('orders')
          .select('items, status')
          .gte('created_at', thirtyDaysAgo.toISOString());
          
        const soldProductIds = new Set<number>();
        recentOrders?.forEach((order: any) => {
          const status = (order.status || '').toLowerCase();
          if (status.includes('annul') || status === 'cancelled' || status === 'failed') return;
          (order.items || []).forEach((item: any) => {
            if (item && item.id) soldProductIds.add(Number(item.id));
          });
        });

        resultProducts = resultProducts.filter((p: any) => !soldProductIds.has(Number(p.id)));
      }
      
      if (specialFilters.includes('low_margin')) {
        resultProducts = resultProducts.filter((p: any) => p.buying_cost !== null && p.buying_cost !== undefined && Number(p.buying_cost) >= Number(p.price));
      }
      
      if (specialFilters.includes('on_sale')) {
        resultProducts = resultProducts.filter((p: any) => p.compare_price !== null && p.compare_price !== undefined && Number(p.compare_price) > Number(p.price));
      }

      if (specialFilters.includes('needs_review')) {
        resultProducts = resultProducts.filter((product: any) =>
          !product.image || product.image === '/placeholder.png'
          || !Number(product.price)
          || product.stock === null || product.stock === undefined
          || !product.category
          || !product.vendor || product.vendor === '-'
          || !product.ingredients
        );
      }

      totalCount = resultProducts.length;

      // Manually paginate the sliced array
      if (isPaginated) {
        const from = (page - 1) * limit;
        resultProducts = resultProducts.slice(from, from + limit);
      }
    }

    const products: Product[] = resultProducts.map((item: any) => ({
      id: item.id,
      title: item.title,
      name: item.name || undefined,
      nameFr: item.name_fr || undefined,
      vendor: item.vendor,
      image: item.image,
      images: item.images || [],
      price: Number(item.price),
      comparePrice: Number(item.compare_price || item.price),
      category: item.category,
      categories: Array.isArray(item.categories) && item.categories.length > 0
        ? item.categories
        : [item.category],
      tags: item.tags || [],
      rating: Number(item.rating || 5),
      reviews: Number(item.reviews || 0),
      description: item.description || '',
      ingredients: item.ingredients || '',
      usage: item.usage || '',
      stock: item.stock !== null && item.stock !== undefined ? Number(item.stock) : 100,
      sku: item.sku || undefined,
      buyingCost: item.buying_cost !== null && item.buying_cost !== undefined ? Number(item.buying_cost) : undefined,
      points: item.points !== null && item.points !== undefined ? Number(item.points) : 0,
      status: item.status || 'live'
    }));

    const statusCounts = await countProductsByStatus({
      category,
      vendor,
      search,
      specialFilters: specialFilters.filter(f => !['dead_products', 'low_margin', 'on_sale'].includes(f)),
      lowStockThreshold,
    });

    if (needsInRouteProcessing) {
      statusCounts.all = totalCount;
      statusCounts.live = products.filter(p => p.status !== 'draft').length;
      statusCounts.draft = products.filter(p => p.status === 'draft').length;
    }

    return NextResponse.json({ success: true, products, totalCount, statusCounts });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}

// POST: Add a new product
export async function POST(request: Request) {
  try {
    const session = await verifyAdminSession();
    if (!session || session.role !== 'owner') {
      return NextResponse.json({ success: false, error: 'Accès refusé. Propriétaire uniquement.' }, { status: 403 });
    }

    const productData = await request.json();
    if (!productData.title || !productData.vendor || !productData.price) {
      return NextResponse.json({ success: false, error: 'Title, vendor, and price are required' }, { status: 400 });
    }

    // Query max ID from Supabase
    const { data: maxIdData } = await supabase
      .from('products')
      .select('id')
      .order('id', { ascending: false })
      .limit(1)
      .maybeSingle();

    const newId = maxIdData ? maxIdData.id + 1 : 1001;

    const categories = normalizeCategories(productData.categories, productData.category);
    const newProduct = {
      id: newId,
      title: productData.title,
      name: productData.name || productData.title,
      name_fr: productData.nameFr || productData.title,
      vendor: productData.vendor,
      image: productData.image || '',
      images: Array.isArray(productData.images) ? productData.images : (productData.image ? [productData.image] : []),
      price: Number(productData.price) || 0,
      compare_price: Number(productData.comparePrice || productData.price) || 0,
      category: categories[0],
      categories,
      tags: Array.isArray(productData.tags) ? productData.tags : (productData.tags ? productData.tags.split(',').map((t: string) => t.trim()) : []),
      rating: Number(productData.rating) || 5,
      reviews: Number(productData.reviews) || 0,
      description: productData.description || '',
      ingredients: productData.ingredients || '',
      usage: productData.usage || '',
      stock: productData.stock !== undefined ? Number(productData.stock) : 100,
      sku: productData.sku || '',
      buying_cost: Number(productData.buyingCost) || 0,
      points: Number(productData.points) || 0,
      status: productData.status || 'live'
    };

    const { error } = await supabase
      .from('products')
      .insert(newProduct);
    
    if (error) throw error;

    revalidatePath('/products');
    revalidatePath(`/products/${newId}`);
    revalidatePath('/');
    revalidateTag(PUBLIC_CATALOG_CACHE_TAG, { expire: 0 });

    await supabase.from('audit_logs').insert({
      id: `log_product_create_${Date.now()}`,
      action: 'Produit créé',
      details: `${session.name} a créé « ${newProduct.title} » (${newProduct.sku || `#${newProduct.id}`}).`,
      date: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}

// PUT: Edit an existing product
export async function PUT(request: Request) {
  try {
    const session = await verifyAdminSession();
    if (!session || session.role !== 'owner') {
      return NextResponse.json({ success: false, error: 'Accès refusé. Propriétaire uniquement.' }, { status: 403 });
    }

    const productData = await request.json();
    if (!productData.id || !productData.title) {
      return NextResponse.json({ success: false, error: 'Product ID and title are required' }, { status: 400 });
    }

    const productId = Number(productData.id);

    const categories = normalizeCategories(productData.categories, productData.category);
    const updatedProduct = {
      title: productData.title,
      name: productData.name || productData.title,
      name_fr: productData.nameFr || productData.title,
      vendor: productData.vendor,
      image: productData.image,
      images: Array.isArray(productData.images) ? productData.images : [productData.image],
      price: Number(productData.price) || 0,
      compare_price: Number(productData.comparePrice || productData.price) || 0,
      category: categories[0],
      categories,
      tags: Array.isArray(productData.tags) ? productData.tags : [],
      rating: Number(productData.rating) || 5,
      reviews: Number(productData.reviews) || 0,
      description: productData.description || '',
      ingredients: productData.ingredients || '',
      usage: productData.usage || '',
      stock: productData.stock !== undefined ? Number(productData.stock) : 100,
      sku: productData.sku,
      buying_cost: Number(productData.buyingCost) || 0,
      points: Number(productData.points) || 0,
      status: productData.status || 'live'
    };

    const { error } = await supabase
      .from('products')
      .update(updatedProduct)
      .eq('id', productId);

    if (error) throw error;

    revalidatePath('/products');
    revalidatePath(`/products/${productId}`);
    revalidatePath('/');
    revalidateTag(PUBLIC_CATALOG_CACHE_TAG, { expire: 0 });

    await supabase.from('audit_logs').insert({
      id: `log_product_update_${Date.now()}`,
      action: 'Produit modifié',
      details: `${session.name} a modifié « ${updatedProduct.title} » (#${productId}) : prix, stock, catégories, ingrédients et statut enregistrés.`,
      date: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, product: { id: productId, ...updatedProduct } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}

// DELETE: Delete single or multiple products
export async function DELETE(request: Request) {
  try {
    const session = await verifyAdminSession();
    if (!session || session.role !== 'owner') {
      return NextResponse.json({ success: false, error: 'Accès refusé. Propriétaire uniquement.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const singleId = searchParams.get('id');
    const idsStr = searchParams.get('ids');

    let idsToDelete: number[] = [];

    if (idsStr) {
      idsToDelete = idsStr.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
    } else if (singleId) {
      const num = Number(singleId);
      if (!isNaN(num)) idsToDelete.push(num);
    } else {
      try {
        const body = await request.json();
        if (Array.isArray(body.ids)) {
          idsToDelete = body.ids.map(Number).filter((n: number) => !isNaN(n));
        } else if (body.id) {
          idsToDelete = [Number(body.id)];
        }
      } catch {
        // Body reading error fallback
      }
    }

    if (idsToDelete.length === 0) {
      return NextResponse.json({ success: false, error: 'Product ID(s) required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .in('id', idsToDelete);

    if (error) throw error;

    revalidatePath('/products');
    revalidatePath('/');
    revalidateTag(PUBLIC_CATALOG_CACHE_TAG, { expire: 0 });

    return NextResponse.json({ success: true, count: idsToDelete.length, deletedIds: idsToDelete });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}
