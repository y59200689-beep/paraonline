import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { isInDiagnosticPool, mapDiagnosticProduct } from '@/lib/diagnostic-catalogue';
import type { Product } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const excludedRows = await supabaseAdmin.from('diagnostic_excluded_products').select('product_id');
    if (excludedRows.error) throw excludedRows.error;
    const excludedIds = new Set<number>((excludedRows.data || []).map((row: { product_id: number }) => row.product_id));
    const products: Product[] = [];
    const pageSize = 1000;

    for (let from = 0; ; from += pageSize) {
      const { data, error } = await supabaseAdmin
        .from('products')
        .select('*')
        .eq('status', 'live')
        .order('id', { ascending: true })
        .range(from, from + pageSize - 1);
      if (error) throw error;
      const batch = data || [];
      products.push(...batch.map((row: Record<string, unknown>) => mapDiagnosticProduct(row)).filter((product: Product) => isInDiagnosticPool(product, excludedIds)));
      if (batch.length < pageSize) break;
    }

    return NextResponse.json({ products }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Failed to load diagnostic catalogue:', error);
    return NextResponse.json({ error: 'Diagnostic catalogue unavailable' }, { status: 503 });
  }
}
