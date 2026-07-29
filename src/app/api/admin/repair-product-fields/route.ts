import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/session';

export const runtime = 'nodejs';
export const maxDuration = 300;

type SnapshotProduct = {
  id: number;
  sku?: string | null;
  price?: number | null;
  compare_price?: number | null;
  stock?: number | null;
  vendor?: string | null;
  category?: string | null;
  categories?: string[] | null;
  status?: 'draft' | 'live';
};

function readSnapshotProducts() {
  const filePath = path.join(process.cwd(), 'supabase-mock-db.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  const db = JSON.parse(raw) as { products?: SnapshotProduct[] };
  return Array.isArray(db.products) ? db.products : [];
}

async function assertOwnerSession() {
  const session = await verifyAdminSession();
  if (!session) {
    return {
      session: null,
      response: NextResponse.json({ success: false, error: 'Accès non autorisé.' }, { status: 401 }),
    };
  }
  if (session.role !== 'owner') {
    return {
      session: null,
      response: NextResponse.json({ success: false, error: 'Accès refusé. Propriétaire uniquement.' }, { status: 403 }),
    };
  }
  return { session, response: null };
}

async function fetchAllProducts() {
  const pageSize = 1000;
  const products: any[] = [];

  for (let from = 0; ; from += pageSize) {
    const to = from + pageSize - 1;
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .range(from, to);

    if (error) throw error;
    const batch = data || [];
    products.push(...batch);

    if (batch.length < pageSize) break;
  }

  return products;
}

async function upsertInBatches(rows: any[]) {
  let processed = 0;
  const batchSize = 500;

  for (let index = 0; index < rows.length; index += batchSize) {
    const batch = rows.slice(index, index + batchSize);
    const { error } = await supabase
      .from('products')
      .upsert(batch, { onConflict: 'id' });

    if (error) throw error;
    processed += batch.length;
  }

  return processed;
}

function hasText(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0 && value.trim() !== '-';
}

function buildSnapshotMap(products: SnapshotProduct[]) {
  const bySku = new Map<string, SnapshotProduct>();
  const byId = new Map<number, SnapshotProduct>();

  for (const product of products) {
    if (product.sku) bySku.set(String(product.sku).trim().toLowerCase(), product);
    if (Number.isFinite(Number(product.id))) byId.set(Number(product.id), product);
  }

  return { bySku, byId };
}

function repairProduct(current: any, snapshot: SnapshotProduct, repairAll: boolean) {
  const next = { ...current };
  const changedFields: string[] = [];

  const snapshotPrice = Number(snapshot.price);
  const currentPrice = Number(current.price);
  if (
    Number.isFinite(snapshotPrice)
    && snapshotPrice > 0
    && (repairAll || !Number.isFinite(currentPrice) || currentPrice <= 0)
  ) {
    next.price = snapshotPrice;
    changedFields.push('price');
  }

  const snapshotComparePrice = Number(snapshot.compare_price);
  if (Number.isFinite(snapshotComparePrice) && snapshotComparePrice > 0) {
    if (repairAll || !Number.isFinite(Number(current.compare_price)) || Number(current.compare_price) <= 0) {
      next.compare_price = snapshotComparePrice;
      changedFields.push('compare_price');
    }
  } else if (changedFields.includes('price') && (!Number.isFinite(Number(current.compare_price)) || Number(current.compare_price) <= 0)) {
    next.compare_price = snapshotPrice;
    changedFields.push('compare_price');
  }

  const snapshotStock = Number(snapshot.stock);
  const currentStock = Number(current.stock);
  if (
    Number.isFinite(snapshotStock)
    && (repairAll || currentStock === 100 || !Number.isFinite(currentStock))
    && currentStock !== snapshotStock
  ) {
    next.stock = snapshotStock;
    changedFields.push('stock');
  }

  if (hasText(snapshot.vendor) && (repairAll || !hasText(current.vendor))) {
    next.vendor = String(snapshot.vendor).trim();
    changedFields.push('vendor');
  }

  if (hasText(snapshot.category) && (repairAll || !hasText(current.category))) {
    next.category = String(snapshot.category).trim().toLowerCase();
    changedFields.push('category');
  }

  if (Array.isArray(snapshot.categories) && snapshot.categories.length > 0 && (repairAll || !Array.isArray(current.categories) || current.categories.length === 0)) {
    next.categories = Array.from(new Set(snapshot.categories.map(category => String(category).trim().toLowerCase()).filter(Boolean)));
    changedFields.push('categories');
  }

  if (snapshot.status && (repairAll || current.status !== 'live')) {
    next.status = snapshot.status;
    changedFields.push('status');
  }

  return changedFields.length > 0 ? { product: next, changedFields } : null;
}

async function repairProductFields(options: { dryRun: boolean; repairAll: boolean; actorName: string }) {
  const snapshot = readSnapshotProducts();
  const { bySku, byId } = buildSnapshotMap(snapshot);
  const currentProducts = await fetchAllProducts();
  const rowsToUpsert: any[] = [];
  const sample: Array<{ id: number; sku: string | null; fields: string[] }> = [];
  let missingSnapshot = 0;

  for (const product of currentProducts) {
    const skuKey = product.sku ? String(product.sku).trim().toLowerCase() : '';
    const snapshotProduct = (skuKey ? bySku.get(skuKey) : null) || byId.get(Number(product.id));

    if (!snapshotProduct) {
      missingSnapshot++;
      continue;
    }

    const repair = repairProduct(product, snapshotProduct, options.repairAll);
    if (!repair) continue;

    rowsToUpsert.push(repair.product);
    if (sample.length < 12) {
      sample.push({
        id: Number(product.id),
        sku: product.sku || null,
        fields: repair.changedFields,
      });
    }
  }

  const repaired = options.dryRun ? 0 : await upsertInBatches(rowsToUpsert);

  if (!options.dryRun) {
    await supabase.from('audit_logs').insert({
      id: `log_${Math.random().toString(36).substring(2, 11)}`,
      action: 'Réparation Champs Produits',
      details: `${options.actorName} a réparé ${repaired} produits depuis supabase-mock-db.json.`,
      date: new Date().toISOString(),
    });

    revalidatePath('/');
    revalidatePath('/products');
    revalidatePath('/admin/catalog');
  }

  return {
    success: true,
    dryRun: options.dryRun,
    mode: options.repairAll ? 'all' : 'suspicious',
    scanned: currentProducts.length,
    snapshotProducts: snapshot.length,
    missingSnapshot,
    wouldRepair: rowsToUpsert.length,
    repaired,
    sample,
  };
}

export async function GET(request: Request) {
  try {
    const { session, response } = await assertOwnerSession();
    if (response) return response;

    const { searchParams } = new URL(request.url);
    const confirmed = searchParams.get('confirm') === 'repair';
    const repairAll = searchParams.get('mode') === 'all';
    const result = await repairProductFields({
      dryRun: !confirmed,
      repairAll,
      actorName: session.name,
    });

    return NextResponse.json({
      ...result,
      message: confirmed
        ? 'Réparation terminée. Rafraîchissez le catalogue.'
        : 'Simulation seulement. Ajoutez ?confirm=repair à cette URL pour réparer les champs endommagés.',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}
