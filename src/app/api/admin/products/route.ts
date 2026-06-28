import { NextResponse } from 'next/server';
import { Product } from '@/lib/data';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';

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

    const specialFilters = special ? special.split(',') : [];

    let query = supabase
      .from('products')
      .select('*', { count: 'exact' });

    // Apply base filters
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    if (vendor && vendor !== 'all') {
      query = query.eq('vendor', vendor);
    }
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Apply text search
    if (search) {
      if (!isNaN(Number(search))) {
        query = query.or(`id.eq.${search},title.ilike.%${search}%,sku.ilike.%${search}%,vendor.ilike.%${search}%`);
      } else {
        query = query.or(`title.ilike.%${search}%,sku.ilike.%${search}%,vendor.ilike.%${search}%`);
      }
    }

    // Apply special filters (except dead_products, low_margin, on_sale which require manual processing)
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
      if (specialFilters.includes('low_stock')) {
        query = query.lte('stock', lowStockThreshold);
      }
      if (specialFilters.includes('no_desc')) {
        query = query.or('description.eq.,description.is.null');
      }
    }

    // Apply sorting
    let finalSortField = 'id';
    if (sortField === 'name') {
      finalSortField = 'title';
    } else if (['sku', 'stock', 'price', 'category', 'vendor', 'id'].includes(sortField)) {
      finalSortField = sortField;
    }
    query = query.order(finalSortField, { ascending: sortDirection === 'asc' });

    // We fetch without range limit if the special filter requires in-route array filtering
    const needsInRouteProcessing = specialFilters.some(f => f === 'dead_products' || f === 'low_margin' || f === 'on_sale');

    if (!needsInRouteProcessing) {
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);
    }

    const { data, count, error } = await query;

    if (error || !data) {
      throw error || new Error('No products returned');
    }

    let resultProducts = data;
    let totalCount = count || data.length;

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

    return NextResponse.json({ success: true, products, totalCount });
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
      category: productData.category || 'visage',
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

    const updatedProduct = {
      title: productData.title,
      name: productData.name || productData.title,
      name_fr: productData.nameFr || productData.title,
      vendor: productData.vendor,
      image: productData.image,
      images: Array.isArray(productData.images) ? productData.images : [productData.image],
      price: Number(productData.price) || 0,
      compare_price: Number(productData.comparePrice || productData.price) || 0,
      category: productData.category,
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

    return NextResponse.json({ success: true, product: { id: productId, ...updatedProduct } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}

// DELETE: Delete a product
export async function DELETE(request: Request) {
  try {
    const session = await verifyAdminSession();
    if (!session || session.role !== 'owner') {
      return NextResponse.json({ success: false, error: 'Accès refusé. Propriétaire uniquement.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const idStr = searchParams.get('id');
    if (!idStr) {
      return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
    }

    const productId = Number(idStr);

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) throw error;

    revalidatePath('/products');
    revalidatePath(`/products/${productId}`);
    revalidatePath('/');

    return NextResponse.json({ success: true, deletedId: productId });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}
