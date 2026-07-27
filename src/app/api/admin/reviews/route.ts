import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/session';
import { supabaseAdmin as supabase } from '@/lib/supabase';

// Helper: sync product reviews stats (rating & count)
async function syncProductReviewsStats(productId: number) {
  const { data: approvedReviews, error } = await supabase
    .from('reviews')
    .select('rating')
    .eq('product_id', productId)
    .eq('status', 'Approved');

  if (error) {
    console.error('Error fetching approved reviews for sync:', error);
    return;
  }

  const count = approvedReviews ? approvedReviews.length : 0;
  let avgRating = 5;
  if (count > 0) {
    const sum = approvedReviews.reduce((s: number, r: any) => s + Number(r.rating || 0), 0);
    avgRating = Math.round((sum / count) * 10) / 10;
  }

  const { error: updateError } = await supabase
    .from('products')
    .update({ reviews: count, rating: avgRating })
    .eq('id', productId);

  if (updateError) console.error('Error updating product reviews stats:', updateError);
}

// GET — all reviews (admin)
export async function GET() {
  try {
    const session = await verifyAdminSession();
    if (!session) return NextResponse.json({ success: false, error: 'Accès non autorisé' }, { status: 401 });

    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;

    const formatted = data.map((item: any) => ({
      id: item.id,
      productId: item.product_id,
      author: item.author,
      rating: item.rating,
      comment: item.comment,
      date: item.date || item.created_at,
      status: item.status,
      reply: item.reply,
    }));
    return NextResponse.json({ success: true, reviews: formatted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}

// POST — admin creates a review manually
export async function POST(request: Request) {
  try {
    const session = await verifyAdminSession();
    if (!session) return NextResponse.json({ success: false, error: 'Accès non autorisé' }, { status: 401 });
    if (session.role === 'logistician') return NextResponse.json({ success: false, error: 'Accès refusé' }, { status: 403 });

    const { productId, author, rating, comment, status, reply } = await request.json();

    if (!productId || !author || !rating || !comment) {
      return NextResponse.json(
        { success: false, error: 'Champs requis : productId, author, rating, comment' },
        { status: 400 }
      );
    }

    const normalizedStatus = (() => {
      const s = (status || 'Approved').toLowerCase();
      if (s === 'pending') return 'Pending';
      if (s === 'hidden') return 'Hidden';
      return 'Approved';
    })();

    const newReview = {
      id: 'rev_' + Math.random().toString(36).substring(2, 11),
      product_id: Number(productId),
      author: String(author).trim(),
      rating: Number(rating),
      comment: String(comment).trim(),
      date: new Date().toISOString(),
      status: normalizedStatus,
      reply: reply ? String(reply).trim() : '',
    };

    const { error } = await supabase.from('reviews').insert(newReview);
    if (error) throw error;

    await syncProductReviewsStats(newReview.product_id);

    return NextResponse.json({ success: true, review: newReview });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}

// PUT — update an existing review (status, text, reply, or product reassignment)
export async function PUT(request: Request) {
  try {
    const session = await verifyAdminSession();
    if (!session) return NextResponse.json({ success: false, error: 'Accès non autorisé' }, { status: 401 });
    if (session.role === 'logistician') return NextResponse.json({ success: false, error: 'Accès refusé' }, { status: 403 });

    const { id, status, reply, author, comment, rating, productId } = await request.json();
    if (!id) return NextResponse.json({ success: false, error: 'Review ID is required' }, { status: 400 });

    // Fetch original review to know old product_id for stats sync
    const { data: currentReview, error: fetchError } = await supabase
      .from('reviews')
      .select('product_id')
      .eq('id', id)
      .maybeSingle();

    if (fetchError || !currentReview) {
      return NextResponse.json({ success: false, error: 'Avis introuvable' }, { status: 404 });
    }

    const updateObj: any = {};
    if (status !== undefined) {
      const s = status.toLowerCase();
      updateObj.status = s === 'approved' ? 'Approved' : s === 'pending' ? 'Pending' : 'Hidden';
    }
    if (reply !== undefined) updateObj.reply = reply;
    if (author !== undefined) updateObj.author = author;
    if (comment !== undefined) updateObj.comment = comment;
    if (rating !== undefined) updateObj.rating = Number(rating);
    // Product reassignment
    if (productId !== undefined) updateObj.product_id = Number(productId);

    const { error } = await supabase.from('reviews').update(updateObj).eq('id', id);
    if (error) throw error;

    // Always sync the original product
    await syncProductReviewsStats(currentReview.product_id);

    // If product changed, sync the new product too
    if (productId !== undefined && Number(productId) !== currentReview.product_id) {
      await syncProductReviewsStats(Number(productId));
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}

// DELETE — remove a review
export async function DELETE(request: Request) {
  try {
    const session = await verifyAdminSession();
    if (!session) return NextResponse.json({ success: false, error: 'Accès non autorisé' }, { status: 401 });
    if (session.role === 'logistician') return NextResponse.json({ success: false, error: 'Accès refusé' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'Review ID is required' }, { status: 400 });

    const { data: currentReview } = await supabase
      .from('reviews')
      .select('product_id')
      .eq('id', id)
      .maybeSingle();

    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (error) throw error;

    if (currentReview) await syncProductReviewsStats(currentReview.product_id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}
