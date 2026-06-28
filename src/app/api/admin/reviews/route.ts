import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/session';
import { supabaseAdmin as supabase } from '@/lib/supabase';

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

    const { id, status, reply } = await request.json();
    if (!id) {
      return NextResponse.json({ success: false, error: 'Review ID is required' }, { status: 400 });
    }

    const updateObj: any = {};
    if (status !== undefined) updateObj.status = status;
    if (reply !== undefined) updateObj.reply = reply;

    const { error } = await supabase
      .from('reviews')
      .update(updateObj)
      .eq('id', id);
    
    if (error) throw error;

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

    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);
    
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}
