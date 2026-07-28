import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';

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

export async function POST(request: Request) {
  try {
    const session = await verifyAdminSession();
    if (!session || session.role !== 'owner') {
      return NextResponse.json({ success: false, error: 'Accès refusé. Propriétaire uniquement.' }, { status: 403 });
    }

    const { products } = await request.json();
    if (!products || !Array.isArray(products)) {
      return NextResponse.json({ success: false, error: 'Products array is required' }, { status: 400 });
    }

    for (const item of products) {
      const categories = normalizeCategories(item.categories, item.category);
      const updateData: any = {
        title: item.title,
        price: Number(item.price) || 0,
        compare_price: Number(item.comparePrice) || 0,
        stock: Number(item.stock) || 0,
        category: categories[0],
        categories,
        buying_cost: Number(item.buyingCost) || 0,
        sku: item.sku
      };

      if (item.points !== undefined) {
        updateData.points = Number(item.points);
      }

      if (item.status !== undefined) {
        updateData.status = item.status;
      }

      const { error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', Number(item.id));
      
      if (error) throw error;
    }

    revalidatePath('/products');
    revalidatePath('/');

    return NextResponse.json({ success: true, count: products.length });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}
