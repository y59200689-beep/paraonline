import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';

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
      const updateData: any = {
        title: item.title,
        price: Number(item.price) || 0,
        compare_price: Number(item.comparePrice) || 0,
        stock: Number(item.stock) || 0,
        category: item.category,
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
