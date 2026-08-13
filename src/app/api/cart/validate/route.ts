import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { getClientIp, rateLimit } from '@/lib/rateLimit';

type AvailableProduct = {
  id: number;
  title: string;
  stock: number;
  status?: string | null;
};

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const { allowed } = await rateLimit(`cart-validate:${ip}`, 30, 60_000);
    if (!allowed) {
      return NextResponse.json({ success: false, error: 'Trop de requêtes.' }, { status: 429 });
    }

    const body = await request.json();
    const requestedItems = Array.isArray(body?.items) ? body.items : [];
    const quantities = new Map<number, number>();
    for (const item of requestedItems) {
      const id = Number(item?.id);
      const quantity = Number(item?.quantity);
      if (!Number.isInteger(id) || !Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
        return NextResponse.json({ success: false, error: 'Panier invalide.' }, { status: 400 });
      }
      quantities.set(id, (quantities.get(id) || 0) + quantity);
    }
    if (quantities.size === 0) {
      return NextResponse.json({ success: false, error: 'Votre panier est vide.' }, { status: 400 });
    }

    const ids = [...quantities.keys()];
    const { data, error } = await supabase
      .from('products')
      .select('id, title, stock, status')
      .in('id', ids);
    if (error) throw error;

    const products = (data || []) as AvailableProduct[];
    const byId = new Map(products.map((product) => [Number(product.id), product]));
    const unavailable = ids.flatMap((id) => {
      const product = byId.get(id);
      const required = quantities.get(id) || 0;
      if (!product || (product.status && product.status !== 'live') || Number(product.stock) < required) {
        return [{ id, title: product?.title || `Produit ${id}`, availableStock: Number(product?.stock || 0) }];
      }
      return [];
    });

    if (unavailable.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Un ou plusieurs produits ne sont plus disponibles.', unavailable },
        { status: 409 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cart availability validation error:', error);
    return NextResponse.json({ success: false, error: 'Impossible de vérifier le stock.' }, { status: 500 });
  }
}
