import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/session';
import { canManageAdvice } from '@/lib/permissions';
import { revalidatePath } from 'next/cache';

export async function GET(request: Request) {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Accès non autorisé.' }, { status: 401 });
    }

    const { data: articles, error } = await supabase
      .from('advice_articles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, articles });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
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

    if (!slug || !title_fr || !title_ar || !content_fr || !content_ar || !summary_fr || !summary_ar || !image || !category) {
      return NextResponse.json({ success: false, error: 'Tous les champs requis sont obligatoires.' }, { status: 400 });
    }

    const articleId = `art_${Date.now()}`;
    const newArticle = {
      id: articleId,
      slug: slug.toLowerCase().replace(/[^a-z0-9-_]/g, '-'),
      title_fr,
      title_ar,
      content_fr,
      content_ar,
      summary_fr,
      summary_ar,
      image,
      category,
      read_time: Number(read_time || 5),
      recommended_products: recommended_products || [],
      status: status || 'draft',
      created_at: new Date().toISOString()
    };

    const { error: insertError } = await supabase
      .from('advice_articles')
      .insert(newArticle);

    if (insertError) throw insertError;

    // Log administrative action
    const logId = 'log_' + Math.random().toString(36).substring(2, 11);
    await supabase.from('audit_logs').insert({
      id: logId,
      action: "Création d'Article",
      details: `L'article "${title_fr}" (${category}) a été créé par l'administrateur "${session.name}".`,
      date: new Date().toISOString()
    });

    revalidatePath('/advice');
    revalidatePath(`/advice/${newArticle.slug}`);
    revalidatePath('/');

    return NextResponse.json({ success: true, article: newArticle });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}
