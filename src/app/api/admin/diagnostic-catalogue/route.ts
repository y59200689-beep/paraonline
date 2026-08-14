import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isDiagnosticEligibleProduct } from '@/lib/diagnostic-routine';
import type { Product } from '@/lib/data';
import { verifyAdminSession } from '@/lib/session';
import { authorizeAdminMutation } from '@/lib/admin-authorization';
import { canEditCatalog } from '@/lib/permissions';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// Map raw Supabase row to Product-like object for eligibility check
function rowToProduct(row: Record<string, unknown>): Product {
  return {
    id: row.id as number,
    title: (row.title as string) || '',
    name: (row.name as string) || '',
    nameFr: (row.name_fr as string) || '',
    vendor: (row.vendor as string) || '',
    category: (row.category as string) || '',
    categories: (row.categories as string[]) || [],
    price: (row.price as number) || 0,
    image: (row.image as string) || '',
    tags: (row.tags as string[]) || [],
    description: (row.description as string) || '',
    ingredients: (row.ingredients as string) || '',
    usage: (row.usage as string) || '',
    stock: row.stock as number | undefined,
    status: (row.status as string) || 'live',
    rating: (row.rating as number) || 0,
    reviews: (row.reviews as number) || 0,
    routineRoles: (row.routine_roles as string[]) || [],
    suitableSkinTypes: (row.suitable_skin_types as string[]) || [],
    suitableConcerns: (row.suitable_concerns as string[]) || [],
    sensitivityLevels: (row.sensitivity_levels as string[]) || [],
    activeStrength: (row.active_strength as string) || undefined,
    timeOfDay: (row.time_of_day as string[]) || [],
  } as unknown as Product;
}

export async function GET(req: NextRequest) {
  const session = await verifyAdminSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canEditCatalog(session.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Math.min(10_000, Number.parseInt(searchParams.get('page') || '1', 10) || 1));
  const limit = Math.max(1, Math.min(100, Number.parseInt(searchParams.get('limit') || '50', 10) || 50));
  const search = searchParams.get('search') || '';
  const filter = searchParams.get('filter') || 'all'; // all | eligible | excluded | manual_excluded

  const offset = (page - 1) * limit;

  // Fetch all live products
  let query = supabase
    .from('products')
    .select('id,title,vendor,category,price,image,tags,description,ingredients,usage,stock,status,rating,reviews,routine_roles,suitable_skin_types,suitable_concerns,sensitivity_levels,active_strength,time_of_day,name,name_fr', { count: 'exact' })
    .eq('status', 'live')
    .order('title', { ascending: true });

  if (search) {
    // Keep user input inside the PostgREST filter grammar. Wildcards are not
    // needed here and can otherwise change the meaning of the filter.
    const safeSearch = search.replace(/[%,()]/g, ' ').trim().slice(0, 100);
    if (safeSearch) query = query.or(`title.ilike.%${safeSearch}%,vendor.ilike.%${safeSearch}%,category.ilike.%${safeSearch}%`);
  }

  const { data: allProducts, error, count } = await query.range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fetch manually excluded product IDs
  const { data: excludedRows } = await supabase
    .from('diagnostic_excluded_products')
    .select('product_id,excluded_by,reason,excluded_at');

  const manualExcludedIds = new Set((excludedRows || []).map((r: { product_id: number }) => r.product_id));
  const excludedMap = new Map((excludedRows || []).map((r: { product_id: number; excluded_by: string; reason: string; excluded_at: string }) => [r.product_id, r]));

  const products = (allProducts || []).map((row: Record<string, unknown>) => {
    const product = rowToProduct(row);
    const manuallyExcluded = manualExcludedIds.has(product.id);
    const algorithmEligible = isDiagnosticEligibleProduct(product, { ignoreStock: true });
    const inDiagnosticPool = algorithmEligible && !manuallyExcluded;
    const hasExplicitData = (Array.isArray(product.routineRoles) && product.routineRoles.length > 0)
      || (Array.isArray(product.suitableConcerns) && product.suitableConcerns.length > 0)
      || (Array.isArray(product.suitableSkinTypes) && product.suitableSkinTypes.length > 0);

    return {
      id: product.id,
      title: product.title,
      vendor: product.vendor,
      category: product.category,
      price: product.price,
      image: product.image,
      inDiagnosticPool,
      algorithmEligible,
      manuallyExcluded,
      hasExplicitData,
      exclusionInfo: manuallyExcluded ? excludedMap.get(product.id) : null,
    };
  });

  // Apply filter
  const filtered = filter === 'eligible'
    ? products.filter(p => p.inDiagnosticPool)
    : filter === 'excluded'
    ? products.filter(p => !p.inDiagnosticPool)
    : filter === 'manual_excluded'
    ? products.filter(p => p.manuallyExcluded)
    : filter === 'with_data'
    ? products.filter(p => p.hasExplicitData)
    : products;

  return NextResponse.json({
    products: filtered,
    total: count || 0,
    totalEligible: products.filter(p => p.inDiagnosticPool).length,
    totalManuallyExcluded: products.filter(p => p.manuallyExcluded).length,
    totalWithExplicitData: products.filter(p => p.hasExplicitData).length,
  });
}

export async function POST(req: NextRequest) {
  const authorization = await authorizeAdminMutation({ allow: canEditCatalog });
  if (!authorization.authorized) return authorization.response;
  const session = authorization.operator;

  const body = await req.json();
  const { productId, action, reason, excludedBy } = body;

  const normalizedProductId = Number(productId);
  if (!Number.isInteger(normalizedProductId) || normalizedProductId <= 0 || !action) {
    return NextResponse.json({ error: 'productId and action required' }, { status: 400 });
  }

  if (action !== 'exclude' && action !== 'include') {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  if (action === 'exclude') {
    const { error } = await supabase
      .from('diagnostic_excluded_products')
      .upsert({ product_id: normalizedProductId, excluded_by: session.id || excludedBy || 'admin', reason: typeof reason === 'string' ? reason.trim().slice(0, 500) || null : null, excluded_at: new Date().toISOString() });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, action: 'excluded' });
  }

  if (action === 'include') {
    const { error } = await supabase
      .from('diagnostic_excluded_products')
      .delete()
      .eq('product_id', normalizedProductId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, action: 'included' });
  }

}
