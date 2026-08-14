import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { authorizeAdminMutation } from '@/lib/admin-authorization';
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

export async function POST(request: Request) {
  try {
    const authorization = await authorizeAdminMutation({
      allow: role => role === 'owner',
    });
    if (!authorization.authorized) return authorization.response;
    const session = authorization.operator;

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
        sku: item.sku,
      };

      // Preserve data from older bulk clients that do not send this field.
      if (item.ingredients !== undefined) {
        updateData.ingredients = item.ingredients || '';
      }

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
    revalidateTag(PUBLIC_CATALOG_CACHE_TAG, { expire: 0 });

    const changedFields = Array.from(new Set(products.flatMap((product: any) => [
      product.category !== undefined || product.categories !== undefined ? 'catégories' : null,
      product.ingredients !== undefined ? 'ingrédients' : null,
      product.status !== undefined ? 'statut' : null,
      product.price !== undefined || product.buyingCost !== undefined ? 'prix / marge' : null,
      product.stock !== undefined ? 'stock' : null,
    ].filter(Boolean))));
    await supabase.from('audit_logs').insert({
      id: `log_catalog_bulk_${Date.now()}`,
      action: 'Modification catalogue (lot)',
      details: `${session.name} a modifié ${products.length} produit(s) : ${changedFields.join(', ') || 'données produit'}.`,
      date: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, count: products.length });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}
