import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    
    let query = supabase
      .from('reviews')
      .select('*')
      .eq('status', 'Approved')
      .order('date', { ascending: false });
    
    if (productId) {
      query = query.eq('product_id', Number(productId));
    }

    const { data, error } = await query;
    if (error) throw error;

    const formatted = data.map((item: any) => ({
      id: item.id,
      productId: item.product_id,
      author: item.author,
      rating: item.rating,
      comment: item.comment,
      date: item.date || item.created_at,
      status: item.status,
      reply: item.reply
    }));
    return NextResponse.json({ success: true, reviews: formatted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Rate limit: 20 reviews per IP per minute
    const ip = getClientIp(request);
    const { allowed } = await rateLimit(`reviews:${ip}`, 20, 60_000);
    if (!allowed) {
      return NextResponse.json({ success: false, error: 'Trop de requêtes. Veuillez réessayer dans une minute.' }, { status: 429 });
    }

    const { productId, author, rating, comment } = await request.json();
    if (!productId || !author || !rating || !comment) {
      return NextResponse.json({ success: false, error: 'All fields (productId, author, rating, comment) are required' }, { status: 400 });
    }

    const newReview = {
      id: 'rev_' + Math.random().toString(36).substring(2, 11),
      product_id: Number(productId),
      author,
      rating: Number(rating),
      comment,
      date: new Date().toISOString(),
      status: 'Pending',
      reply: ''
    };

    const { error } = await supabase
      .from('reviews')
      .insert(newReview);
    if (error) throw error;

    return NextResponse.json({
      success: true,
      review: {
        id: newReview.id,
        productId: newReview.product_id,
        author: newReview.author,
        rating: newReview.rating,
        comment: newReview.comment,
        date: newReview.date,
        status: newReview.status,
        reply: newReview.reply
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}
