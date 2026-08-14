import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { authorizeAdminMutation } from '@/lib/admin-authorization';
import { canEditCatalog } from '@/lib/permissions';
import { revalidatePath, revalidateTag } from 'next/cache';
import { PUBLIC_CATALOG_CACHE_TAG } from '@/lib/catalog-cache';

export async function DELETE(req: NextRequest) {
  const authorization = await authorizeAdminMutation({ allow: canEditCatalog });
  if (!authorization.authorized) return authorization.response;

  try {
    const url = new URL(req.url);
    let categoryId = url.searchParams.get('id') || url.searchParams.get('category');
    
    if (!categoryId) {
      try {
        const body = await req.json();
        categoryId = body.id || body.category;
      } catch {}
    }

    if (!categoryId) {
      return NextResponse.json({ error: 'Missing category id' }, { status: 400 });
    }

    const targetId = categoryId.trim().toLowerCase();

    // 1. Fetch products matching category or categories array
    const { data: matchingProducts, error: fetchErr } = await supabase
      .from('products')
      .select('id, category, categories')
      .or(`category.ilike.${targetId},categories.cs.{"${targetId}"}`);

    if (fetchErr) {
      console.error('Error fetching matching products for category deletion:', fetchErr);
    }

    let updatedCount = 0;
    if (matchingProducts && matchingProducts.length > 0) {
      for (const prod of matchingProducts) {
        const currCategories: string[] = Array.isArray(prod.categories) && prod.categories.length > 0
          ? prod.categories
          : [prod.category];

        const newCategories = currCategories.filter(
          c => c && String(c).trim().toLowerCase() !== targetId
        );

        const newPrimaryCategory = newCategories.length > 0
          ? newCategories[0]
          : 'visage';

        const { error: updateErr } = await supabase
          .from('products')
          .update({
            category: newPrimaryCategory,
            categories: newCategories.length > 0 ? newCategories : ['visage'],
          })
          .eq('id', prod.id);

        if (!updateErr) updatedCount++;
      }
    }

    // 2. Remove category from site_settings (customCategories & categories)
    const { data: settingsRow } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'main_settings')
      .single();

    if (settingsRow?.value) {
      const settings = settingsRow.value;
      let changed = false;

      if (Array.isArray(settings.customCategories)) {
        const initialLen = settings.customCategories.length;
        settings.customCategories = settings.customCategories.filter(
          (c: any) => c && String(c.id || c).trim().toLowerCase() !== targetId
        );
        if (settings.customCategories.length !== initialLen) changed = true;
      }

      if (Array.isArray(settings.categories)) {
        const initialLen = settings.categories.length;
        settings.categories = settings.categories.filter(
          (c: any) => c && String(c).trim().toLowerCase() !== targetId
        );
        if (settings.categories.length !== initialLen) changed = true;
      }

      if (changed) {
        await supabase
          .from('site_settings')
          .update({ value: settings, updated_at: new Date().toISOString() })
          .eq('key', 'main_settings');
      }
    }

    revalidatePath('/products');
    revalidatePath('/');
    revalidateTag(PUBLIC_CATALOG_CACHE_TAG, { expire: 0 });

    return NextResponse.json({
      success: true,
      categoryId: targetId,
      updatedProducts: updatedCount,
      message: `Catégorie "${targetId}" supprimée du catalogue et des paramètres.`
    });
  } catch (e: any) {
    console.error('DELETE /api/admin/categories error:', e);
    return NextResponse.json({ error: e?.message ?? 'Failed to delete category' }, { status: 500 });
  }
}
