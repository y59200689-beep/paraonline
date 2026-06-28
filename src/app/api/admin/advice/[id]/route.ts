import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/session';
import { canManageAdvice } from '@/lib/permissions';
import { revalidatePath } from 'next/cache';

interface Props {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: Props) {
  try {
    const { id } = await params;
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Accès non autorisé.' }, { status: 401 });
    }

    if (!canManageAdvice(session.role)) {
      return NextResponse.json({ success: false, error: 'Accès refusé. Droits insuffisants.' }, { status: 403 });
    }

    const body = await request.json();
    const { 
      slug, title_fr, title_ar, content_fr, content_ar, 
      summary_fr, summary_ar, image, category, read_time, 
      recommended_products, status 
    } = body;

    // Check if article exists
    const { data: existing, error: findError } = await supabase
      .from('advice_articles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (findError || !existing) {
      return NextResponse.json({ success: false, error: 'Article introuvable.' }, { status: 404 });
    }

    const updatedArticle = {
      slug: slug ? slug.toLowerCase().replace(/[^a-z0-9-_]/g, '-') : existing.slug,
      title_fr: title_fr || existing.title_fr,
      title_ar: title_ar || existing.title_ar,
      content_fr: content_fr || existing.content_fr,
      content_ar: content_ar || existing.content_ar,
      summary_fr: summary_fr || existing.summary_fr,
      summary_ar: summary_ar || existing.summary_ar,
      image: image || existing.image,
      category: category || existing.category,
      read_time: read_time !== undefined ? Number(read_time) : existing.read_time,
      recommended_products: recommended_products || existing.recommended_products,
      status: status || existing.status
    };

    const { error: updateError } = await supabase
      .from('advice_articles')
      .update(updatedArticle)
      .eq('id', id);

    if (updateError) throw updateError;

    // Log administrative action
    const logId = 'log_' + Math.random().toString(36).substring(2, 11);
    await supabase.from('audit_logs').insert({
      id: logId,
      action: "Modification d'Article",
      details: `L'article "${updatedArticle.title_fr}" (#${id}) a été modifié par l'administrateur "${session.name}".`,
      date: new Date().toISOString()
    });

    revalidatePath('/advice');
    revalidatePath(`/advice/${updatedArticle.slug}`);
    revalidatePath('/');

    return NextResponse.json({ success: true, article: { id, ...updatedArticle } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Props) {
  try {
    const { id } = await params;
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Accès non autorisé.' }, { status: 401 });
    }

    if (!canManageAdvice(session.role)) {
      return NextResponse.json({ success: false, error: 'Accès refusé. Droits insuffisants.' }, { status: 403 });
    }

    // Check if article exists
    const { data: existing, error: findError } = await supabase
      .from('advice_articles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (findError || !existing) {
      return NextResponse.json({ success: false, error: 'Article introuvable.' }, { status: 404 });
    }

    const { error: deleteError } = await supabase
      .from('advice_articles')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    // Log administrative action
    const logId = 'log_' + Math.random().toString(36).substring(2, 11);
    await supabase.from('audit_logs').insert({
      id: logId,
      action: "Suppression d'Article",
      details: `L'article "${existing.title_fr}" (#${id}) a été supprimé par l'administrateur "${session.name}".`,
      date: new Date().toISOString()
    });

    revalidatePath('/advice');
    revalidatePath(`/advice/${existing.slug}`);
    revalidatePath('/');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}
