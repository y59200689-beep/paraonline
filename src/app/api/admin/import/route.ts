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

function hasValue(value: unknown): boolean {
  return value !== undefined && value !== null && String(value).trim() !== '';
}

async function fetchAllExistingProducts() {
  const pageSize = 1000;
  const allProducts: any[] = [];

  for (let from = 0; ; from += pageSize) {
    const to = from + pageSize - 1;
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .range(from, to);

    if (error) throw error;
    const batch = data || [];
    allProducts.push(...batch);

    if (batch.length < pageSize) break;
  }

  return allProducts;
}

function buildExistingProductUpdate(imported: any, existing: any) {
  const updateData: any = {};

  if (hasValue(imported.title)) {
    updateData.title = imported.title;
    updateData.name = hasValue(imported.name) ? imported.name : imported.title;
    updateData.name_fr = hasValue(imported.nameFr) ? imported.nameFr : imported.title;
  } else {
    if (hasValue(imported.name)) updateData.name = imported.name;
    if (hasValue(imported.nameFr)) updateData.name_fr = imported.nameFr;
  }

  if (hasValue(imported.vendor)) updateData.vendor = imported.vendor;
  if (hasValue(imported.image)) {
    updateData.image = imported.image;
    updateData.images = Array.isArray(imported.images) ? imported.images : [imported.image];
  } else if (Array.isArray(imported.images) && imported.images.length > 0) {
    updateData.images = imported.images;
  }
  if (hasValue(imported.price)) updateData.price = Number(imported.price);
  if (hasValue(imported.comparePrice)) updateData.compare_price = Number(imported.comparePrice);
  if (imported.tags !== undefined) updateData.tags = Array.isArray(imported.tags) ? imported.tags : [];
  if (hasValue(imported.rating)) updateData.rating = Number(imported.rating);
  if (hasValue(imported.reviews)) updateData.reviews = Number(imported.reviews);
  if (hasValue(imported.description)) updateData.description = imported.description;
  if (hasValue(imported.ingredients)) updateData.ingredients = imported.ingredients;
  if (hasValue(imported.usage)) updateData.usage = imported.usage;
  if (hasValue(imported.stock)) updateData.stock = Number(imported.stock);
  if (hasValue(imported.sku)) updateData.sku = imported.sku;
  if (hasValue(imported.buyingCost)) updateData.buying_cost = Number(imported.buyingCost);
  if (hasValue(imported.status)) updateData.status = imported.status;

  const hasCategoryValue = hasValue(imported.category)
    || (Array.isArray(imported.categories) && imported.categories.some(hasValue))
    || (typeof imported.categories === 'string' && hasValue(imported.categories));
  if (hasCategoryValue) {
    const categories = normalizeImportedCategories(imported.categories, imported.category);
    updateData.category = categories[0];
    updateData.categories = categories;
  }

  return {
    ...existing,
    ...updateData,
    id: existing.id,
  };
}

function buildNewProduct(imported: any) {
  const categories = normalizeImportedCategories(imported.categories, imported.category);

  return {
    ...(imported.id ? { id: Number(imported.id) } : {}),
    title: hasValue(imported.title) ? imported.title : imported.name || imported.nameFr || imported.sku || 'Produit importé',
    name: imported.name || imported.title || imported.nameFr || imported.sku || 'Produit importé',
    name_fr: imported.nameFr || imported.title || imported.name || imported.sku || 'Produit importé',
    vendor: imported.vendor || '',
    image: imported.image || '',
    images: Array.isArray(imported.images) ? imported.images : (imported.image ? [imported.image] : []),
    price: Number(imported.price) || 0,
    compare_price: Number(imported.comparePrice || imported.price) || 0,
    category: categories[0],
    categories,
    tags: Array.isArray(imported.tags) ? imported.tags : [],
    rating: Number(imported.rating || 5),
    reviews: Number(imported.reviews || 0),
    description: imported.description || '',
    ingredients: imported.ingredients || '',
    usage: imported.usage || '',
    stock: imported.stock !== undefined ? Number(imported.stock) : 100,
    sku: imported.sku || null,
    buying_cost: imported.buyingCost !== undefined && imported.buyingCost !== null ? Number(imported.buyingCost) : null,
    status: imported.status || 'live'
  };
}

async function upsertInBatches(products: any[]) {
  const batchSize = 500;
  let processed = 0;

  for (let index = 0; index < products.length; index += batchSize) {
    const batch = products.slice(index, index + batchSize);
    const { error } = await supabase
      .from('products')
      .upsert(batch, { onConflict: 'id' });

    if (error) throw error;
    processed += batch.length;
  }

  return processed;
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

    // Fetch all existing rows in pages. Supabase REST responses are capped at
    // 1000 rows, so a single select would miss most of a large catalogue.
    const existingList = await fetchAllExistingProducts();
    const productsToUpsert: any[] = [];
    const importedCategories = new Set<string>();

    for (const p of products) {
      // Find match in existing products
      const match = existingList.find((ep: { id: number; sku: string | null }) => 
        (p.id && ep.id === Number(p.id)) || 
        (p.sku && ep.sku === p.sku)
      );

      if (hasValue(p.category) || hasValue(p.categories) || (Array.isArray(p.categories) && p.categories.length > 0)) {
        normalizeImportedCategories(p.categories, p.category).forEach(category => importedCategories.add(category));
      }

      if (updateExisting) {
        // If updating existing, only process if a match is found
        if (match) {
          productsToUpsert.push(buildExistingProductUpdate(p, match));
        }
      } else {
        // New product import — if a match exists by ID/SKU, include the id
        // so Supabase upsert can resolve it; otherwise let Supabase auto-assign the id.
        if (match) {
          // Skip silently — don't overwrite existing products when updateExisting is false
          // (user chose "import new only")
        } else {
          const newProduct = buildNewProduct(p);
          normalizeImportedCategories(newProduct.categories, newProduct.category).forEach(category => importedCategories.add(category));
          productsToUpsert.push(newProduct);
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

    const processedCount = await upsertInBatches(productsToUpsert);

    revalidatePath('/products');
    revalidatePath('/');

    // Keep the catalog's category source in sync with the imported products so
    // new sheet categories are immediately available in the editor.
    if (importedCategories.size > 0) await syncImportedCategories(importedCategories);

    return NextResponse.json({
      success: true,
      count: processedCount,
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
