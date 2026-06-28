import { NextResponse } from 'next/server';
import { Product } from '@/lib/data';
import { supabaseAdmin as supabase } from '@/lib/supabase';

function matchesConcern(product: Product, concern: string) {
  const text = `${product.title} ${product.nameFr || ''} ${product.description || ''} ${(product.tags || []).join(' ')}`.toLowerCase();
  const ingredients = (product.ingredients || '').toLowerCase();
  
  if (concern === 'acne') {
    return text.includes('acné') || text.includes('imperfection') || text.includes('bouton') || ingredients.includes('salicylic acid') || product.id === 3 || product.id === 22 || product.id === 15 || product.id === 16 || product.id === 17;
  }
  if (concern === 'spots') {
    return text.includes('tache') || text.includes('éclat') || text.includes('bright') || text.includes('pigment') || ingredients.includes('tranexamic') || ingredients.includes('ascorbic') || product.id === 3 || product.id === 14;
  }
  if (concern === 'dryness') {
    return text.includes('déshydrat') || text.includes('sec') || text.includes('hydrat') || ingredients.includes('hyaluronic') || product.id === 5 || product.id === 6 || product.id === 7 || product.id === 17;
  }
  if (concern === 'wrinkles') {
    return text.includes('ridule') || text.includes('âge') || text.includes('anti-aging') || text.includes('vieill') || ingredients.includes('retinol') || product.id === 8 || product.id === 5 || product.id === 6;
  }
  if (concern === 'redness') {
    return text.includes('rougeur') || text.includes('apais') || text.includes('sensible') || text.includes('sooth') || ingredients.includes('centella') || ingredients.includes('heartleaf') || product.id === 17 || product.id === 16 || product.id === 15;
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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.max(1, parseInt(searchParams.get('limit') || '15'));
  const category = searchParams.get('category') || 'all';
  const search = searchParams.get('search') || '';
  const concern = searchParams.get('concern') || 'all';
  const ingredient = searchParams.get('ingredient') || 'all';
  const idStr = searchParams.get('id') || '';
  const idsStr = searchParams.get('ids') || '';

  try {
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

      const products: Product[] = (data as Array<Record<string, unknown>>).map(row => ({
        id: row.id as number,
        title: row.title as string,
        name: (row.name as string) || undefined,
        nameFr: (row.name_fr as string) || undefined,
        vendor: row.vendor as string,
        image: row.image as string,
        images: (row.images as string[]) || [],
        price: Number(row.price),
        comparePrice: Number((row.compare_price as number) || row.price),
        category: row.category as string,
        tags: (row.tags as string[]) || [],
        rating: 4.0 + (((((row.rating ? Number(row.rating) : 5) * 7) + (row.id as number)) % 10) + 1) / 10,
        reviews: Number(row.reviews || 0),
        description: (row.description as string) || '',
        ingredients: (row.ingredients as string) || '',
        usage: (row.usage as string) || '',
        stock: row.stock !== null && row.stock !== undefined ? Number(row.stock) : 100,
        sku: (row.sku as string) || undefined,
        buyingCost: row.buying_cost !== null && row.buying_cost !== undefined ? Number(row.buying_cost) : undefined,
        points: row.points !== null && row.points !== undefined ? Number(row.points) : 0,
        status: ((row.status as string) || 'live') as 'live' | 'draft',
      }));

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
      
      const matchedProduct: Product = {
        id: data.id,
        title: data.title,
        name: data.name || undefined,
        nameFr: data.name_fr || undefined,
        vendor: data.vendor,
        image: data.image,
        images: data.images || [],
        price: Number(data.price),
        comparePrice: Number(data.compare_price || data.price),
        category: data.category,
        tags: data.tags || [],
        rating: 4.0 + ((((data.rating ? Number(data.rating) : 5) * 7 + data.id) % 10) + 1) / 10,
        reviews: Number(data.reviews || 0),
        description: data.description || '',
        ingredients: data.ingredients || '',
        usage: data.usage || '',
        stock: data.stock !== null && data.stock !== undefined ? Number(data.stock) : 100,
        sku: data.sku || undefined,
        buyingCost: data.buying_cost !== null && data.buying_cost !== undefined ? Number(data.buying_cost) : undefined,
        points: data.points !== null && data.points !== undefined ? Number(data.points) : 0,
        status: data.status || 'live'
      };
      
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
      } else if (category === 'kbeauty') {
        query = query.eq('category', 'kbeauty');
      } else if (category === 'solaire') {
        query = query.or('category.eq.garnier,tags.cs.{"solaire"}');
      } else {
        query = query.or(`category.eq.${category},tags.cs.{"${category}"}`);
      }
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,name.ilike.%${search}%,name_fr.ilike.%${search}%,vendor.ilike.%${search}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to).order('id', { ascending: true });

    const { data, count, error } = await query;
    if (error || !data) {
      throw error || new Error('No products returned');
    }

    let products: Product[] = data.map((item: any) => ({
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
      rating: 4.0 + ((((item.rating ? Number(item.rating) : 5) * 7 + item.id) % 10) + 1) / 10,
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

    let total = count || products.length;

    if (concern !== 'all') {
      products = products.filter(p => matchesConcern(p, concern));
      total = products.length;
    }
    if (ingredient !== 'all') {
      products = products.filter(p => matchesIngredient(p, ingredient));
      total = products.length;
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
