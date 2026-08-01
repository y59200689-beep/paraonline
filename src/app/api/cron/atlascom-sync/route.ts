import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { requireCronSecret } from '@/lib/cron-auth';

export const runtime = 'nodejs';
export const maxDuration = 300;

function extractXmlValue(xml: string, tag: string) {
  const match = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`));
  return match ? match[1].trim() : '';
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
  const batchSize = 500;
  let processed = 0;

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

async function runAtlascomSync() {
  const startedAt = Date.now();
  const wsdlUrl = process.env.ATLASCOM_WSDL_URL
    || 'https://paraoficinal.ruijieddnsa.com/WebServiceAtlasCom/atlascomservice.asmx';
  const codeEmploye = process.env.ATLASCOM_EMPLOYEE_CODE;
  const password = process.env.ATLASCOM_PASSWORD;
  const logs: string[] = [];

  if (!codeEmploye || !password) {
    throw new Error('Atlascom credentials are not configured.');
  }

  logs.push('Starting Atlascom catalog synchronization.');

  const authResponse = await fetch(wsdlUrl, {
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
  });

  if (!authResponse.ok) {
    throw new Error(`Atlascom authentication failed with HTTP ${authResponse.status}.`);
  }

  const authXml = await authResponse.text();
  const token = extractXmlValue(authXml, 'generateTOKENResult');
  if (!token) {
    throw new Error('Atlascom did not return an authentication token.');
  }

  logs.push('Authentication successful. Fetching articles.');

  const articlesResponse = await fetch(wsdlUrl, {
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
  });

  if (!articlesResponse.ok) {
    throw new Error(`Atlascom article fetch failed with HTTP ${articlesResponse.status}.`);
  }

  const articlesXml = await articlesResponse.text();
  const articleMatches = articlesXml.match(/<Article>([\s\S]*?)<\/Article>/g) || [];
  if (articleMatches.length === 0) {
    return { updated: 0, inserted: 0, processed: 0, logs: ['No articles returned from Atlascom.'] };
  }

  logs.push(`Found ${articleMatches.length} Atlascom articles. Fetching full existing catalog.`);

  const existingProducts = await fetchAllProducts();
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
  const rowsToUpsert: any[] = [];

  for (const articleXml of articleMatches) {
    const sku = extractXmlValue(articleXml, 'codeArticle');
    if (!sku) continue;

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
      const nextRow = {
        ...existing,
        title,
        name: title,
        name_fr: title,
        stock: Number.isFinite(stock) ? stock : 0,
        price: nextPrice,
        compare_price: existing.compare_price ?? existing.comparePrice ?? nextPrice,
      };

      if (
        String(existing.title || existing.name || existing.name_fr || '') !== title
        || Number(existing.stock) !== nextRow.stock
        || Number(existing.price) !== nextRow.price
      ) {
        updated++;
      }
      rowsToUpsert.push(nextRow);
    } else {
      inserted++;
      rowsToUpsert.push({
        id: nextId++,
        sku,
        title,
        name: title,
        name_fr: title,
        price: Number.isFinite(price) && price > 0 ? price : 0,
        compare_price: Number.isFinite(price) && price > 0 ? price : 0,
        stock: Number.isFinite(stock) ? stock : 0,
        vendor: 'Atlascom',
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
      });
    }
  }

  const processed = await upsertInBatches(rowsToUpsert);
  logs.push(`Sync complete. Processed ${processed} rows. Updated ${updated}, inserted ${inserted}.`);
  logs.push(`Duration ${Math.max(1, Math.round((Date.now() - startedAt) / 1000))}s.`);

  await supabase
    .from('code_snippets')
    .update({
      last_run: new Date().toISOString(),
      last_run_status: 'success',
      last_run_logs: logs.join('\n'),
      updated_at: new Date().toISOString(),
    })
    .eq('id', 'cron_1782133436889');

  revalidatePath('/');
  revalidatePath('/products');
  revalidatePath('/admin/catalog');

  return { updated, inserted, processed, logs };
}

export async function GET(request: Request) {
  const unauthorized = requireCronSecret(request);
  if (unauthorized) return unauthorized;

  try {
    const result = await runAtlascomSync();
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    const message = error.message || 'Erreur serveur';
    await supabase
      .from('code_snippets')
      .update({
        last_run: new Date().toISOString(),
        last_run_status: 'error',
        last_run_logs: message,
        updated_at: new Date().toISOString(),
      })
      .eq('id', 'cron_1782133436889');

    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
