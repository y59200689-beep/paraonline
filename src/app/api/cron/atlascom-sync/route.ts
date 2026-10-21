import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { requireCronSecret } from '@/lib/cron-auth';
import { atlascomProductLog } from '@/lib/atlascom-sync-log';
import { fetchAtlascomXml } from '@/lib/atlascom-request';

export const runtime = 'nodejs';
export const maxDuration = 300;

let syncRunning = false;
type SyncProgress = { stage: string; logs: string[] };
function progressStage(progress: SyncProgress, stage: string) {
  progress.stage = stage;
  console.log(JSON.stringify({ integration: 'atlascom', stage }));
}

function extractXmlValue(xml: string, tag: string) {
  const match = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`));
  return match ? match[1].trim() : '';
}

async function fetchAllProducts(signal: AbortSignal) {
  const pageSize = 1000;
  const readPage = async (from: number, withCount = false) => {
    const result = await supabase
      .from('products')
      .select('*', withCount ? { count: 'exact' } : undefined)
      .order('id', { ascending: true })
      .range(from, from + pageSize - 1).abortSignal(signal);
    if (result.error) throw result.error;
    return result;
  };
  const first = await readPage(0, true);
  const products: any[] = [...(first.data || [])];
  if (first.count !== null && first.count !== undefined) {
    const offsets = Array.from({ length: Math.max(0, Math.ceil(first.count / pageSize) - 1) }, (_, i) => (i + 1) * pageSize);
    for (let i = 0; i < offsets.length; i += 4) {
      const batches = await Promise.all(offsets.slice(i, i + 4).map(from => readPage(from)));
      batches.forEach(batch => products.push(...(batch.data || [])));
    }
    // Do not infer new SKUs from a partial or shifted catalog snapshot.
    if (products.length !== first.count || new Set(products.map(product => product.id)).size !== products.length) {
      throw new Error('Catalog changed during pagination; retry a complete scan.');
    }
  } else if (products.length === pageSize) {
    for (let from = pageSize; ; from += pageSize) {
      const batch = await readPage(from);
      products.push(...(batch.data || []));
      if ((batch.data || []).length < pageSize) break;
    }
  }

  return products;
}

async function upsertInBatches(rows: any[], signal: AbortSignal) {
  const batchSize = 500;
  let processed = 0;

  for (let index = 0; index < rows.length; index += batchSize) {
    const batch = rows.slice(index, index + batchSize);
    const { error } = await supabase
      .from('products')
      .upsert(batch, { onConflict: 'id' }).abortSignal(signal);

    if (error) throw error;
    processed += batch.length;
  }

  return processed;
}

async function runAtlascomSync(progress: SyncProgress, signal: AbortSignal) {
  const startedAt = Date.now();
  const wsdlUrl = process.env.ATLASCOM_WSDL_URL
    || 'https://paraoficinal.ruijieddnsa.com/WebServiceAtlasCom/atlascomservice.asmx';
  const codeEmploye = process.env.ATLASCOM_EMPLOYEE_CODE;
  const password = process.env.ATLASCOM_PASSWORD;
  const logs = progress.logs;

  if (!codeEmploye || !password) {
    throw new Error('Atlascom credentials are not configured.');
  }

  logs.push('Starting Atlascom catalog synchronization.');

  progressStage(progress, 'authentification fournisseur');
  const authXml = await fetchAtlascomXml(wsdlUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'SOAPAction': 'http://tempuri.org/generateTOKEN',
    },
    body: `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <generateTOKEN xmlns="http://tempuri.org/">
      <utilisateur>${codeEmploye}</utilisateur>
      <motDePasse>${password}</motDePasse>
    </generateTOKEN>
  </soap:Body>
</soap:Envelope>`,
  }, signal, 30_000);
  const token = extractXmlValue(authXml, 'generateTOKENResult');
  if (!token) {
    throw new Error('Atlascom did not return an authentication token.');
  }

  logs.push('Authentication successful. Fetching articles.');

  progressStage(progress, 'lecture du catalogue fournisseur');
  const articlesXml = await fetchAtlascomXml(wsdlUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'SOAPAction': 'http://tempuri.org/getListeArticles',
    },
    body: `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <getListeArticles xmlns="http://tempuri.org/">
      <PDateSynch>2024-01-01</PDateSynch>
      <codeAgence>${codeEmploye}</codeAgence>
      <nbrPartition>1</nbrPartition>
      <partition>1</partition>
      <ImageOrArticle>1</ImageOrArticle>
      <token>${token}</token>
    </getListeArticles>
  </soap:Body>
</soap:Envelope>`,
  }, signal, 180_000);
  const articleMatches = articlesXml.match(/<Article>([\s\S]*?)<\/Article>/g) || [];
  if (articleMatches.length === 0) {
    return { updated: 0, inserted: 0, processed: 0, logs: ['No articles returned from Atlascom.'] };
  }

  logs.push(`Found ${articleMatches.length} Atlascom articles. Fetching full existing catalog.`);

  progressStage(progress, 'lecture du catalogue Paradivine');
  const existingProducts = await fetchAllProducts(signal);
  const productMap = new Map<string, any>();
  let maxId = 0;

  for (const product of existingProducts) {
    if (product.sku) {
      productMap.set(String(product.sku).trim().toLowerCase(), product);
    }
    const id = Number(product.id);
    if (!Number.isNaN(id) && id > maxId) maxId = id;
  }

  let nextId = maxId + 1;
  let updated = 0;
  let inserted = 0;
  let processed = 0;
  let skipped = 0;
  const rowsToUpsert: any[] = [];
  const productLogs: string[] = [];

  for (const articleXml of articleMatches) {
    const sku = extractXmlValue(articleXml, 'codeArticle');
    if (!sku) continue;
    processed++;

    const rawStock = extractXmlValue(articleXml, 'qteStock');
    const rawPrice = extractXmlValue(articleXml, 'prix');
    const title = extractXmlValue(articleXml, 'libelle')
      || extractXmlValue(articleXml, 'designation')
      || extractXmlValue(articleXml, 'nom')
      || `Produit ${sku}`;

    const stock = rawStock ? parseInt(rawStock, 10) : 0;
    const price = rawPrice ? parseFloat(rawPrice) : NaN;
    const existing = productMap.get(sku.trim().toLowerCase());

    if (existing) {
      const nextPrice = Number.isFinite(price) && price > 0
        ? price
        : Number(existing.price || existing.compare_price || existing.comparePrice || 0);
      const nextVendor = existing.vendor === 'Atlascom' ? '' : (existing.vendor ?? '');
      const nextRow = {
        ...existing,
        title,
        name: title,
        name_fr: title,
        stock: Number.isFinite(stock) ? stock : 0,
        price: nextPrice,
        compare_price: existing.compare_price ?? existing.comparePrice ?? nextPrice,
        vendor: nextVendor,
      };

      const productLog = atlascomProductLog(existing, nextRow);
      if (productLog) {
        updated++;
        productLogs.push(productLog);
        rowsToUpsert.push(nextRow);
      } else {
        skipped++;
      }
    } else {
      inserted++;
      const nextRow = {
        id: nextId++,
        sku,
        title,
        name: title,
        name_fr: title,
        price: Number.isFinite(price) && price > 0 ? price : 0,
        compare_price: Number.isFinite(price) && price > 0 ? price : 0,
        stock: Number.isFinite(stock) ? stock : 0,
        vendor: '',
        category: 'visage',
        categories: ['visage'],
        image: '',
        images: [],
        tags: [],
        rating: 5,
        reviews: 0,
        description: '',
        ingredients: '',
        usage: '',
        buying_cost: null,
        points: 0,
        status: 'draft',
      };
      rowsToUpsert.push(nextRow);
      productLogs.push(atlascomProductLog(null, nextRow)!);
    }
  }

  progressStage(progress, 'enregistrement des produits');
  const written = await upsertInBatches(rowsToUpsert, signal);
  logs.push(`Sync complete. Processed ${processed} rows. Updated ${updated}, inserted ${inserted}.`);
  logs.push(`Écriture : ${written} produits. Inchangés vérifiés : ${skipped}.`);
  logs.push(`Duration ${Math.max(1, Math.round((Date.now() - startedAt) / 1000))}s.`);
  logs.push(productLogs.length ? 'Produits modifiés ou ajoutés :' : 'Aucun produit modifié ou ajouté.');
  logs.push(...productLogs);

  progressStage(progress, 'enregistrement des journaux');
  const { error: logError } = await supabase
    .from('code_snippets')
    .update({
      last_run: new Date().toISOString(),
      last_run_status: 'success',
      last_run_logs: logs.join('\n'),
      updated_at: new Date().toISOString(),
    })
    .eq('id', 'cron_1782133436889').abortSignal(signal);
  if (logError) throw new Error('Catalog sync completed, but its product logs could not be saved.');

  revalidatePath('/');
  revalidatePath('/products');
  revalidatePath('/admin/catalog');

  return { updated, inserted, processed, skipped, written, logs };
}

export async function GET(request: Request) {
  const unauthorized = requireCronSecret(request);
  if (unauthorized) return unauthorized;
  if (syncRunning) {
    return NextResponse.json({ success: false, error: 'Une synchronisation Atlascom est déjà en cours.' }, { status: 409 });
  }
  syncRunning = true;
  const progress: SyncProgress = { stage: 'initialisation', logs: [] };
  // A VPS run must finish or abort before the next 15-minute timer fires.
  const signal = AbortSignal.timeout(600_000);

  try {
    const result = await runAtlascomSync(progress, signal);
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    const rawCode = error?.code || error?.cause?.code || error?.name || 'ERROR';
    const code = /^[A-Za-z0-9_]{1,64}$/.test(String(rawCode)) ? String(rawCode) : 'ERROR';
    const message = `Synchronisation Atlascom échouée — ${progress.stage} (${code}).`;
    console.error(JSON.stringify({ integration: 'atlascom', stage: progress.stage, code }));
    await supabase
      .from('code_snippets')
      .update({
        last_run: new Date().toISOString(),
        last_run_status: 'error',
        last_run_logs: [...progress.logs, message].join('\n'),
        updated_at: new Date().toISOString(),
      })
      .eq('id', 'cron_1782133436889').abortSignal(AbortSignal.timeout(15_000));

    return NextResponse.json({ success: false, error: message }, { status: 500 });
  } finally {
    syncRunning = false;
  }
}
