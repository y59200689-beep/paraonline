import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/session';
import { supabaseAdmin as supabase } from '@/lib/supabase';

// Helper function to sync product reviews stats (rating & reviews count)
async function syncProductReviewsStats(productId: number) {
  // Query all approved reviews for this product
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
    const sum = approvedReviews.reduce((sum: number, r: any) => sum + Number(r.rating || 0), 0);
    avgRating = Math.round((sum / count) * 10) / 10; // round to 1 decimal place
  }

  // Update product in the DB
  const { error: updateError } = await supabase
    .from('products')
    .update({ reviews: count, rating: avgRating })
    .eq('id', productId);

  if (updateError) {
    console.error('Error updating product reviews stats:', updateError);
  }
}

export async function GET() {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Accès non autorisé' }, { status: 401 });
    }

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
      reply: item.reply
    }));
    return NextResponse.json({ success: true, reviews: formatted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Accès non autorisé' }, { status: 401 });
    }
    if (session.role === 'logistician') { return NextResponse.json({ success: false, error: 'Accès refusé' }, { status: 403 }); }

    const { id, status, reply, author, comment, rating } = await request.json();
    if (!id) {
      return NextResponse.json({ success: false, error: 'Review ID is required' }, { status: 400 });
    }

    // Get current review to find product_id
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
      // Normalize status
      const s = status.toLowerCase();
      if (s === 'approved') {
        updateObj.status = 'Approved';
      } else if (s === 'pending') {
        updateObj.status = 'Pending';
      } else {
        updateObj.status = 'Hidden';
      }
    }
    if (reply !== undefined) updateObj.reply = reply;
    if (author !== undefined) updateObj.author = author;
    if (comment !== undefined) updateObj.comment = comment;
    if (rating !== undefined) updateObj.rating = Number(rating);

    const { error } = await supabase
      .from('reviews')
      .update(updateObj)
      .eq('id', id);
    
    if (error) throw error;

    // Sync product stats
    await syncProductReviewsStats(currentReview.product_id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Accès non autorisé' }, { status: 401 });
    }
    if (session.role === 'logistician') { return NextResponse.json({ success: false, error: 'Accès refusé' }, { status: 403 }); }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Review ID is required' }, { status: 400 });
    }

    // Get current review to find product_id before deleting
    const { data: currentReview, error: fetchError } = await supabase
      .from('reviews')
      .select('product_id')
      .eq('id', id)
      .maybeSingle();

    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);
    
    if (error) throw error;

    if (currentReview) {
      // Sync product stats
      await syncProductReviewsStats(currentReview.product_id);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}
