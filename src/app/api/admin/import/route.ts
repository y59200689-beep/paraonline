import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { verifyAdminSession } from '@/lib/session';
import { supabaseAdmin as supabase } from '@/lib/supabase';

function normalizeImportedCategories(categories: unknown, primaryCategory: unknown): string[] {
  const rawValues = Array.isArray(categories)
    ? categories
    : typeof categories === 'string'
      ? categories.split(/[,;|]/)
      : [];
  const primary = typeof primaryCategory === 'string' ? primaryCategory.trim().toLowerCase() : '';
  const normalized = rawValues
    .filter((category): category is string => typeof category === 'string')
    .map(category => category.trim().toLowerCase())
    .filter(Boolean);

  const result = Array.from(new Set([primary, ...normalized].filter(Boolean)));
  return result.length > 0 ? result : ['visage'];
}

export async function POST(request: Request) {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Accès non autorisé' }, { status: 401 });
    }
    if (session.role !== 'owner') {
      return NextResponse.json({ success: false, error: 'Accès refusé. Propriétaire uniquement.' }, { status: 403 });
    }

    const { products, updateExisting } = await request.json();
    if (!products || !Array.isArray(products)) {
      return NextResponse.json({ success: false, error: 'Invalid products array' }, { status: 400 });
    }

    // 1. Fetch existing products from Supabase to match by ID / SKU
    const { data: existingProducts, error: fetchError } = await supabase
      .from('products')
      .select('id, sku');
    
    if (fetchError) {
      console.warn("Supabase fetch failed during import, throwing error:", fetchError);
      throw fetchError;
    }

    const existingList = existingProducts || [];
    const productsToUpsert: any[] = [];
    const importedCategories = new Set<string>();

    for (const p of products) {
      // Find match in existing products
      const match = existingList.find((ep: { id: number; sku: string | null }) => 
        (p.id && ep.id === Number(p.id)) || 
        (p.sku && ep.sku === p.sku)
      );

      const categories = normalizeImportedCategories(p.categories, p.category);
      categories.forEach(category => importedCategories.add(category));
      const dbProd = {
        title: p.title,
        name: p.name || p.title,
        name_fr: p.nameFr || p.title,
        vendor: p.vendor,
        image: p.image || '',
        images: Array.isArray(p.images) ? p.images : (p.image ? [p.image] : []),
        price: Number(p.price) || 0,
        compare_price: Number(p.comparePrice || p.price) || 0,
        category: categories[0],
        categories,
        tags: Array.isArray(p.tags) ? p.tags : [],
        rating: Number(p.rating || 5),
        reviews: Number(p.reviews || 0),
        description: p.description || '',
        ingredients: p.ingredients || '',
        usage: p.usage || '',
        stock: p.stock !== undefined ? Number(p.stock) : 100,
        sku: p.sku || null,
        buying_cost: p.buyingCost !== undefined && p.buyingCost !== null ? Number(p.buyingCost) : null
      };

      if (updateExisting) {
        // If updating existing, only process if a match is found
        if (match) {
          productsToUpsert.push({
            id: match.id,
            ...dbProd
          });
        }
      } else {
        // New product import — if a match exists by ID/SKU, include the id
        // so Supabase upsert can resolve it; otherwise let Supabase auto-assign the id.
        if (match) {
          // Skip silently — don't overwrite existing products when updateExisting is false
          // (user chose "import new only")
        } else {
          productsToUpsert.push({
            ...(p.id ? { id: Number(p.id) } : {}),
            ...dbProd
          });
        }
      }
    }

    if (productsToUpsert.length === 0) {
      if (importedCategories.size > 0) {
        await syncImportedCategories(importedCategories);
      }
      return NextResponse.json({ 
        success: true, 
        count: 0, 
        categories: Array.from(importedCategories).sort(),
        message: updateExisting 
          ? 'Aucun produit correspondant trouvé pour la mise à jour.'
          : 'Tous les produits existent déjà. Activez "Mettre à jour les existants" pour les modifier.'
      });
    }

    // Upsert into Supabase
    const { error: upsertError } = await supabase
      .from('products')
      .upsert(productsToUpsert, { onConflict: 'id' });

    if (upsertError) throw upsertError;

    revalidatePath('/products');
    revalidatePath('/');

    // Keep the catalog's category source in sync with the imported products so
    // new sheet categories are immediately available in the editor.
    if (importedCategories.size > 0) await syncImportedCategories(importedCategories);

    return NextResponse.json({
      success: true,
      count: productsToUpsert.length,
      categories: Array.from(importedCategories).sort(),
    });
  } catch (error: any) {
    console.error("Import error:", error);
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}

async function syncImportedCategories(importedCategories: Set<string>) {
  const { data: settingsRow, error: settingsReadError } = await supabase
    .from('settings')
    .select('value')
    .eq('id', 1)
    .maybeSingle();

  if (settingsReadError) throw settingsReadError;
  const settingsValue = settingsRow?.value && typeof settingsRow.value === 'object'
    ? settingsRow.value as { categories?: unknown }
    : {};
  const existingCategories = Array.isArray(settingsValue.categories)
    ? settingsValue.categories.filter((category): category is string => typeof category === 'string')
    : [];
  const { error: settingsWriteError } = await supabase
    .from('settings')
    .upsert({
      id: 1,
      value: { ...settingsValue, categories: Array.from(new Set([...existingCategories, ...importedCategories])).sort() },
    }, { onConflict: 'id' });

  if (settingsWriteError) throw settingsWriteError;
}
