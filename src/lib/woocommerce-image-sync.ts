import sharp from 'sharp';
import { revalidatePath, revalidateTag } from 'next/cache';
import { supabaseAdmin as db } from '@/lib/supabase';
import { PUBLIC_CATALOG_CACHE_TAG } from '@/lib/catalog-cache';
import { imageKey, planImages, WOO_STORE, type ImageProduct, type WooProduct } from './woocommerce-image-plan';

const publicUrl = (source: string) => db.storage.from('products').getPublicUrl(imageKey(source)).data.publicUrl;

async function withinDeadline<T>(pending: PromiseLike<T>, signal: AbortSignal): Promise<T> {
  signal.throwIfAborted();
  return new Promise<T>((resolve, reject) => {
    const abort = () => reject(signal.reason);
    signal.addEventListener('abort', abort, { once: true });
    Promise.resolve(pending).then(resolve, reject).finally(() => signal.removeEventListener('abort', abort));
  });
}

async function readWoo(signal: AbortSignal) {
  const products: WooProduct[] = [];
  let pages = 1;
  for (let page = 1; page <= pages; page++) {
    const response = await fetch(`${WOO_STORE}/wp-json/wc/store/v1/products?per_page=100&page=${page}&orderby=id&order=asc`, {
      cache: 'no-store', redirect: 'error', signal: AbortSignal.any([signal, AbortSignal.timeout(30_000)]),
    });
    if (!response.ok) throw new Error(`WooCommerce HTTP ${response.status}`);
    const data: unknown = await response.json();
    if (!Array.isArray(data) || data.some(row => typeof row.id !== 'number' || typeof row.sku !== 'string'
      || !Array.isArray(row.images) || row.images.some((image: { src?: unknown }) => typeof image?.src !== 'string'))) {
      throw new Error('Réponse WooCommerce invalide.');
    }
    if (page === 1) {
      pages = Number(response.headers.get('x-wp-totalpages'));
      if (!Number.isInteger(pages) || pages < 0 || pages > 2000) throw new Error('Pagination WooCommerce invalide.');
    }
    products.push(...data as WooProduct[]);
  }
  if (new Set(products.map(row => row.id)).size !== products.length) throw new Error('Catalogue WooCommerce instable. Réessayez.');
  return products;
}

async function readProducts(signal: AbortSignal) {
  const products: ImageProduct[] = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await db.from('products').select('id,sku,image,images').order('id').range(offset, offset + 999).abortSignal(signal);
    if (error) throw error;
    products.push(...data || []);
    if (!data || data.length < 1000) break;
  }
  return products;
}

async function makePlan(signal: AbortSignal) {
  const [products, woo] = await Promise.all([readProducts(signal), readWoo(signal)]);
  return planImages(products, woo);
}

export async function previewWooImages() {
  const plan = await makePlan(AbortSignal.timeout(240_000));
  return { ...plan, entries: plan.entries.slice(0, 200), productsToUpdate: plan.entries.length,
    imagesToAdd: plan.entries.reduce((sum, entry) => sum + entry.sources.length, 0), truncated: plan.entries.length > 200 };
}

async function copyImage(source: string, signal: AbortSignal) {
  const response = await fetch(source, { redirect: 'error', signal: AbortSignal.any([signal, AbortSignal.timeout(30_000)]) });
  if (!response.ok || !response.body) throw new Error('Image source indisponible.');
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 10 * 1024 * 1024) throw new Error('Image supérieure à 10 Mo.');
      chunks.push(value);
    }
  } finally { await reader.cancel(); }
  const image = await sharp(Buffer.concat(chunks), { limitInputPixels: 40_000_000 })
    .rotate().webp({ quality: 85 }).toBuffer();
  const { error } = await withinDeadline<{ error: { message: string; statusCode?: string } | null }>(db.storage.from('products').upload(imageKey(source), image, {
    contentType: 'image/webp', upsert: false, cacheControl: '31536000',
  }), AbortSignal.any([signal, AbortSignal.timeout(60_000)]));
  // Stable paths make retries idempotent, including uploads before a failed DB write.
  if (error && !['409', 'Duplicate'].includes(String((error as { statusCode?: string }).statusCode))
    && error.message !== 'The resource already exists') throw error;
  return publicUrl(source);
}

export async function importWooImages() {
  const { data: runId, error: lockError } = await db.rpc('start_woocommerce_image_run').abortSignal(AbortSignal.timeout(15_000));
  if (lockError || !runId) throw new Error('Import indisponible : vérifiez la migration et les imports en cours.');
  // Leave time for lease acquisition and saving partial results within Hobby's 300s limit.
  const signal = AbortSignal.timeout(240_000);
  const result = { updated: 0, imagesAdded: 0, unchanged: 0, unmatched: 0, ambiguous: 0, rejectedImages: 0,
    entries: [] as { sku: string; images: number; error?: string }[], error: '' };
  try {
    const plan = await makePlan(signal);
    Object.assign(result, { unchanged: plan.unchanged, unmatched: plan.unmatched, ambiguous: plan.ambiguous, rejectedImages: plan.rejectedImages });
    for (const entry of plan.entries) {
      signal.throwIfAborted();
      try {
        const urls: string[] = [];
        for (const source of entry.sources) urls.push(await copyImage(source, signal));
        const { data: changed, error } = await db.rpc('merge_woocommerce_images', {
          p_run: runId, p_id: entry.id, p_sku: entry.sku, p_urls: urls,
        }).abortSignal(signal);
        if (error) throw error;
        if (changed) { result.updated++; result.imagesAdded += urls.length; }
        else result.unchanged++;
        result.entries.push({ sku: entry.sku, images: changed ? urls.length : 0 });
      } catch {
        result.entries.push({ sku: entry.sku, images: 0, error: 'Import des images impossible pour ce produit. Réessayez.' });
      }
    }
  } catch {
    result.error = 'Import interrompu. Les produits déjà traités sont conservés ; relancez pour continuer.';
  } finally {
    if (result.updated) {
      revalidateTag(PUBLIC_CATALOG_CACHE_TAG, { expire: 0 });
      revalidatePath('/');
      revalidatePath('/products');
      revalidatePath('/admin/catalog');
    }
    const status = result.error ? 'failed' : result.entries.some(entry => entry.error) ? 'partial' : 'success';
    const { error } = await db.from('woocommerce_image_runs').update({ status, result, completed_at: new Date().toISOString() })
      .eq('id', runId).abortSignal(AbortSignal.timeout(15_000));
    if (error) throw new Error('Import terminé, mais son journal ne peut pas être enregistré.');
  }
  return { ...result, success: !result.error && !result.entries.some(entry => entry.error) };
}
