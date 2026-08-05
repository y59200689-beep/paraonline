import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { verifyAdminSession } from '@/lib/session';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { PUBLIC_SETTINGS_CACHE_TAG } from '@/lib/get-public-settings';
import { PUBLIC_CATALOG_CACHE_TAG } from '@/lib/catalog-cache';
import { normalizeRecommendationMetadata } from '@/lib/product-recommendation-metadata';

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

async function fetchExistingProductsForImport(importedProducts: any[]) {
  const ids = Array.from(new Set(
    importedProducts
      .map(product => Number(product.id))
      .filter(id => Number.isInteger(id) && id > 0),
  ));
  const skus = Array.from(new Set(
    importedProducts
      .map(product => typeof product.sku === 'string' ? product.sku.trim() : '')
      .filter(Boolean),
  ));
  const existingProducts: any[] = [];
  const chunkSize = 500;

  for (let index = 0; index < ids.length; index += chunkSize) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .in('id', ids.slice(index, index + chunkSize));
    if (error) throw error;
    existingProducts.push(...(data || []));
  }

  for (let index = 0; index < skus.length; index += chunkSize) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .in('sku', skus.slice(index, index + chunkSize));
    if (error) throw error;
    existingProducts.push(...(data || []));
  }

  return Array.from(new Map(existingProducts.map(product => [product.id, product])).values());
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

  const hasRecommendationMetadata = [
    'routineRoles', 'routine_roles', 'suitableSkinTypes', 'suitable_skin_types',
    'suitableConcerns', 'suitable_concerns', 'sensitivityLevels', 'sensitivity_levels',
    'activeStrength', 'active_strength', 'timeOfDay', 'time_of_day',
  ].some(field => imported[field] !== undefined);
  if (hasRecommendationMetadata) {
    const { metadata, errors } = normalizeRecommendationMetadata(imported);
    if (Object.keys(errors).length > 0) throw new Error(Object.values(errors).join(' '));
    if (imported.routineRoles !== undefined || imported.routine_roles !== undefined) updateData.routine_roles = metadata.routineRoles;
    if (imported.suitableSkinTypes !== undefined || imported.suitable_skin_types !== undefined) updateData.suitable_skin_types = metadata.suitableSkinTypes;
    if (imported.suitableConcerns !== undefined || imported.suitable_concerns !== undefined) updateData.suitable_concerns = metadata.suitableConcerns;
    if (imported.sensitivityLevels !== undefined || imported.sensitivity_levels !== undefined) updateData.sensitivity_levels = metadata.sensitivityLevels;
    if (imported.activeStrength !== undefined || imported.active_strength !== undefined) updateData.active_strength = metadata.activeStrength;
    if (imported.timeOfDay !== undefined || imported.time_of_day !== undefined) updateData.time_of_day = metadata.timeOfDay;
  }

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
  const { metadata, errors } = normalizeRecommendationMetadata(imported);
  if (Object.keys(errors).length > 0) throw new Error(Object.values(errors).join(' '));

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
    status: imported.status || 'live',
    routine_roles: metadata.routineRoles,
    suitable_skin_types: metadata.suitableSkinTypes,
    suitable_concerns: metadata.suitableConcerns,
    sensitivity_levels: metadata.sensitivityLevels,
    active_strength: metadata.activeStrength,
    time_of_day: metadata.timeOfDay,
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

    const { products, updateExisting, fileName, validationErrorCount = 0, validationErrors = [] } = await request.json();
    if (!products || !Array.isArray(products)) {
      return NextResponse.json({ success: false, error: 'Invalid products array' }, { status: 400 });
    }

    // Only read products referenced by this file. Loading the full catalogue for
    // each small spreadsheet makes imports unnecessarily slow and can time out.
    const existingList = await fetchExistingProductsForImport(products);
    const existingById = new Map(existingList.map(product => [Number(product.id), product]));
    const existingBySku = new Map(existingList
      .filter(product => typeof product.sku === 'string' && product.sku.trim())
      .map(product => [product.sku.trim(), product]));
    const productsToUpsert: any[] = [];
    const importedCategories = new Set<string>();
    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    for (const p of products) {
      // Find match in existing products
      const match = (p.id ? existingById.get(Number(p.id)) : undefined)
        || (typeof p.sku === 'string' && p.sku.trim() ? existingBySku.get(p.sku.trim()) : undefined);

      if (hasValue(p.category) || hasValue(p.categories) || (Array.isArray(p.categories) && p.categories.length > 0)) {
        normalizeImportedCategories(p.categories, p.category).forEach(category => importedCategories.add(category));
      }

      if (updateExisting) {
        // If updating existing, only process if a match is found
        if (match) {
          productsToUpsert.push(buildExistingProductUpdate(p, match));
          updatedCount++;
        } else {
          skippedCount++;
        }
      } else {
        // New product import — if a match exists by ID/SKU, include the id
        // so Supabase upsert can resolve it; otherwise let Supabase auto-assign the id.
        if (match) {
          // Skip silently — don't overwrite existing products when updateExisting is false
          // (user chose "import new only")
          skippedCount++;
        } else {
          const newProduct = buildNewProduct(p);
          normalizeImportedCategories(newProduct.categories, newProduct.category).forEach(category => importedCategories.add(category));
          productsToUpsert.push(newProduct);
          createdCount++;
        }
      }
    }

    if (productsToUpsert.length === 0) {
      if (importedCategories.size > 0) {
        await syncImportedCategories(importedCategories);
      }
      const message = updateExisting
        ? 'Aucun produit correspondant trouvé pour la mise à jour.'
        : 'Tous les produits existent déjà. Activez "Mettre à jour les existants" pour les modifier.';
      await Promise.all([
        supabase.from('audit_logs').insert({
        id: `log_import_${Date.now()}`,
        action: 'Import catalogue',
        details: `${session.name} a importé ${fileName || 'un fichier'} : 0 créé, 0 mis à jour, ${skippedCount} ignoré, ${Number(validationErrorCount) || 0} erreur(s) de validation. ${message}`,
        date: new Date().toISOString(),
        }),
        supabase.from('admin_import_runs').insert({
          id: `import_${Date.now()}`,
          file_name: fileName || null,
          created_count: 0,
          updated_count: 0,
          skipped_count: skippedCount,
          validation_error_count: Number(validationErrorCount) || 0,
          validation_errors: Array.isArray(validationErrors) ? validationErrors.slice(0, 500) : [],
          created_by: session.name || session.username || 'Administrateur',
        }),
      ]);
      return NextResponse.json({ 
        success: true, 
        count: 0, 
        createdCount,
        updatedCount,
        skippedCount,
        validationErrorCount: Number(validationErrorCount) || 0,
        categories: Array.from(importedCategories).sort(),
        message,
      });
    }

    const processedCount = await upsertInBatches(productsToUpsert);

    revalidatePath('/products');
    revalidatePath('/');
    revalidateTag(PUBLIC_CATALOG_CACHE_TAG, { expire: 0 });

    // Keep the catalog's category source in sync with the imported products so
    // new sheet categories are immediately available in the editor.
    if (importedCategories.size > 0) await syncImportedCategories(importedCategories);

    await Promise.all([
      supabase.from('audit_logs').insert({
      id: `log_import_${Date.now()}`,
      action: 'Import catalogue',
      details: `${session.name} a importé ${fileName || 'un fichier'} : ${createdCount} créé(s), ${updatedCount} mis à jour, ${skippedCount} ignoré(s), ${Number(validationErrorCount) || 0} erreur(s) de validation.`,
      date: new Date().toISOString(),
      }),
      supabase.from('admin_import_runs').insert({
        id: `import_${Date.now()}`,
        file_name: fileName || null,
        created_count: createdCount,
        updated_count: updatedCount,
        skipped_count: skippedCount,
        validation_error_count: Number(validationErrorCount) || 0,
        validation_errors: Array.isArray(validationErrors) ? validationErrors.slice(0, 500) : [],
        created_by: session.name || session.username || 'Administrateur',
      }),
    ]);

    return NextResponse.json({
      success: true,
      count: processedCount,
      createdCount,
      updatedCount,
      skippedCount,
      validationErrorCount: Number(validationErrorCount) || 0,
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
  revalidateTag(PUBLIC_SETTINGS_CACHE_TAG, { expire: 0 });
}
