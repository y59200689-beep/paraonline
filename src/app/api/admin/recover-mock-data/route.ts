import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/session';

export const runtime = 'nodejs';

type MockProduct = {
  id: number;
  title: string;
  name?: string | null;
  name_fr?: string | null;
  vendor?: string | null;
  image?: string | null;
  images?: string[];
  price?: number;
  compare_price?: number | null;
  category?: string | null;
  categories?: string[];
  tags?: string[];
  rating?: number;
  reviews?: number;
  description?: string | null;
  ingredients?: string | null;
  usage?: string | null;
  stock?: number | null;
  sku?: string | null;
  buying_cost?: number | null;
  points?: number | null;
  status?: 'draft' | 'live';
  created_at?: string;
};

type MockSnippet = {
  id: string;
  name: string;
  code: string;
  location?: 'head' | 'body_start' | 'body_end';
  active?: boolean;
  trigger_type?: 'client' | 'cron';
  cron_expression?: string | null;
  last_run?: string | null;
  last_run_status?: 'success' | 'error' | null;
  last_run_logs?: string | null;
  created_at?: string;
  updated_at?: string;
};

function readMockDb() {
  const filePath = path.join(process.cwd(), 'supabase-mock-db.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as {
    products?: MockProduct[];
    code_snippets?: MockSnippet[];
  };
}

function normalizeProduct(product: MockProduct) {
  const category = product.category?.trim().toLowerCase() || 'visage';
  const categories = Array.isArray(product.categories) && product.categories.length > 0
    ? Array.from(new Set(product.categories.map(c => String(c).trim().toLowerCase()).filter(Boolean)))
    : [category];

  return {
    id: Number(product.id),
    title: product.title,
    name: product.name || product.title,
    name_fr: product.name_fr || product.name || product.title,
    vendor: product.vendor || '',
    image: product.image || '',
    images: Array.isArray(product.images) ? product.images : (product.image ? [product.image] : []),
    price: Number(product.price) || 0,
    compare_price: Number(product.compare_price || product.price) || 0,
    category: categories[0] || category,
    categories,
    tags: Array.isArray(product.tags) ? product.tags : [],
    rating: Number(product.rating || 5),
    reviews: Number(product.reviews || 0),
    description: product.description || '',
    ingredients: product.ingredients || '',
    usage: product.usage || '',
    stock: product.stock !== null && product.stock !== undefined ? Number(product.stock) : 100,
    sku: product.sku || null,
    buying_cost: product.buying_cost !== undefined ? product.buying_cost : null,
    points: product.points !== null && product.points !== undefined ? Number(product.points) : 0,
    status: product.status === 'draft' ? 'draft' : 'live',
    created_at: product.created_at || new Date().toISOString(),
  };
}

function normalizeSnippet(snippet: MockSnippet) {
  const trigger = snippet.trigger_type === 'cron' ? 'cron' : 'client';
  return {
    id: snippet.id,
    name: snippet.name,
    code: snippet.code,
    location: trigger === 'client' ? (snippet.location || 'head') : 'head',
    active: snippet.active !== false,
    trigger_type: trigger,
    cron_expression: trigger === 'cron' ? (snippet.cron_expression || '*/5 * * * *') : null,
    last_run: snippet.last_run || null,
    last_run_status: snippet.last_run_status || null,
    last_run_logs: snippet.last_run_logs || null,
    created_at: snippet.created_at || new Date().toISOString(),
    updated_at: snippet.updated_at || new Date().toISOString(),
  };
}

async function upsertInBatches<T>(table: string, rows: T[], batchSize = 500) {
  let processed = 0;

  for (let index = 0; index < rows.length; index += batchSize) {
    const batch = rows.slice(index, index + batchSize);
    const { error } = await supabase
      .from(table)
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
      return NextResponse.json({ success: false, error: 'Accès non autorisé.' }, { status: 401 });
    }
    if (session.role !== 'owner') {
      return NextResponse.json({ success: false, error: 'Accès refusé. Propriétaire uniquement.' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const dryRun = body?.dryRun !== false;
    const includeProducts = body?.products !== false;
    const includeSnippets = body?.snippets !== false;

    const mockDb = readMockDb();
    const products = includeProducts ? (mockDb.products || []).map(normalizeProduct) : [];
    const snippets = includeSnippets ? (mockDb.code_snippets || []).map(normalizeSnippet) : [];

    if (dryRun) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        products: products.length,
        snippets: snippets.filter(s => s.trigger_type === 'client').length,
        cronTasks: snippets.filter(s => s.trigger_type === 'cron').length,
      });
    }

    const productCount = includeProducts ? await upsertInBatches('products', products) : 0;
    const snippetCount = includeSnippets ? await upsertInBatches('code_snippets', snippets, 100) : 0;

    await supabase.from('audit_logs').insert({
      id: `log_${Math.random().toString(36).substring(2, 11)}`,
      action: 'Récupération Données Admin',
      details: `${session.name} a restauré ${productCount} produits et ${snippetCount} snippets/tâches depuis supabase-mock-db.json.`,
      date: new Date().toISOString(),
    });

    revalidatePath('/');
    revalidatePath('/products');
    revalidatePath('/admin/catalog');
    revalidatePath('/admin/snippets');
    revalidatePath('/admin/cron');

    return NextResponse.json({
      success: true,
      dryRun: false,
      products: productCount,
      snippets: snippets.filter(s => s.trigger_type === 'client').length,
      cronTasks: snippets.filter(s => s.trigger_type === 'cron').length,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}
