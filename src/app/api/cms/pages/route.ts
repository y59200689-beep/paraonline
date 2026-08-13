import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/session';
import { canEditContent, canPublishContent } from '@/lib/permissions';
import { canScheduleContent } from '@/lib/permissions';
import { revalidateTag } from 'next/cache';
import { CMS_HOMEPAGE_CACHE_TAG } from '@/lib/cms-homepage';
import { PUBLIC_SETTINGS_CACHE_TAG } from '@/lib/get-public-settings';

const NOW = new Date().toISOString();

const DEFAULT_SEED_PAGES = [
  {
    id: 'page-home',
    slug: 'home',
    page_type: 'home',
    title_fr: 'Accueil',
    title_ar: 'الصفحة الرئيسية',
    status: 'published',
    created_by: 'system',
    updated_by: 'system',
    updated_at: NOW,
    section_order: [
      { id: 'hero-1', type: 'hero', nameFr: 'Carrousel Héro', visible: true },
      { id: 'categoryTrack-1', type: 'categoryTrack', nameFr: 'Barre Catégories', visible: true },
      { id: 'productGrid-1', type: 'productGrid', nameFr: 'Grille Produits', visible: true },
      { id: 'brandPartners-1', type: 'brandPartners', nameFr: 'Marques Partenaires', visible: true },
      { id: 'diagnosticBanner-1', type: 'diagnosticBanner', nameFr: 'Diagnostic Peau IA', visible: false },
      { id: 'summerSale-1', type: 'summerSale', nameFr: 'Offres Été', visible: true },
      { id: 'dermoCorner-1', type: 'dermoCorner', nameFr: 'Dermo Corner', visible: true },
      { id: 'customerReviews-1', type: 'customerReviews', nameFr: 'Avis Clients', visible: true },
      { id: 'triplePromo-1', type: 'triplePromo', nameFr: 'Bannières Triple', visible: true },
      { id: 'topRated-1', type: 'topRated', nameFr: 'Produits les Mieux Notés', visible: true },
      { id: 'bestSellers-1', type: 'bestSellers', nameFr: 'Produits les Plus Vendus', visible: true },
      { id: 'routineVisualizer-1', type: 'routineVisualizer', nameFr: 'Visualiseur Routine', visible: true },
      { id: 'featuredIngredient-1', type: 'featuredIngredient', nameFr: 'Marques Vedettes', visible: true },
      { id: 'skincareRoutineSteps-1', type: 'skincareRoutineSteps', nameFr: 'Étapes Routine', visible: true },
      { id: 'activeIngredients-1', type: 'activeIngredients', nameFr: 'Ingrédients Actifs', visible: true },
      { id: 'ingredientDictionary-1', type: 'ingredientDictionary', nameFr: 'Dictionnaire Ingrédients', visible: true },
      { id: 'faq-1', type: 'faq', nameFr: 'FAQ', visible: true },
      { id: 'officialDistributor-1', type: 'officialDistributor', nameFr: 'Badge Distributeur', visible: true },
      { id: 'trustBar-1', type: 'trustBar', nameFr: 'Barre Confiance', visible: true }
    ]
  },
  { id: 'page-about', slug: 'about', page_type: 'about', title_fr: 'À Propos', title_ar: 'من نحن', status: 'draft', created_by: 'system', updated_by: 'system', updated_at: NOW, section_order: [] },
  { id: 'page-delivery', slug: 'suivi-commande', page_type: 'delivery', title_fr: 'Suivi de Commande', title_ar: 'تتبع الطلب', status: 'draft', created_by: 'system', updated_by: 'system', updated_at: NOW, section_order: [] },
  { id: 'page-checkout-success', slug: 'checkout-success', page_type: 'checkout_success', title_fr: 'Commande Confirmée', title_ar: 'تم تأكيد الطلب', status: 'draft', created_by: 'system', updated_by: 'system', updated_at: NOW, section_order: [] },
  { id: 'page-checkout-failure', slug: 'checkout-failure', page_type: 'checkout_failure', title_fr: 'Paiement Échoué', title_ar: 'فشل الدفع', status: 'draft', created_by: 'system', updated_by: 'system', updated_at: NOW, section_order: [] },
  { id: 'page-policies', slug: 'politiques', page_type: 'policies', title_fr: 'Politiques', title_ar: 'السياسات', status: 'draft', created_by: 'system', updated_by: 'system', updated_at: NOW, section_order: [] },
  { id: 'page-portal', slug: 'customer-portal', page_type: 'customer_portal', title_fr: 'Espace Client', title_ar: 'حساب العميل', status: 'draft', created_by: 'system', updated_by: 'system', updated_at: NOW, section_order: [] }
];

// ── GET — list all CMS pages ──────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const session = await verifyAdminSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canEditContent(session.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const { data: fetchedPages, error } = await supabaseAdmin
      .from('cms_pages')
      .select('id,slug,page_type,title_fr,title_ar,status,approval_status,submitted_at,submitted_by,reviewed_at,reviewed_by,review_note,scheduled_at,updated_at,updated_by,section_order,seo_title_fr,seo_title_ar,seo_description_fr,seo_description_ar')
      .order('page_type', { ascending: true });
    let data = fetchedPages;

    // If table exists but is empty, seed initial pages
    if (!error && (!data || data.length === 0)) {
      await supabaseAdmin.from('cms_pages').upsert(DEFAULT_SEED_PAGES, { onConflict: 'slug' });
      const { data: seeded } = await supabaseAdmin
        .from('cms_pages')
        .select('id,slug,page_type,title_fr,title_ar,status,approval_status,submitted_at,submitted_by,reviewed_at,reviewed_by,review_note,scheduled_at,updated_at,updated_by,section_order,seo_title_fr,seo_title_ar,seo_description_fr,seo_description_ar')
        .order('page_type', { ascending: true });
      data = seeded || DEFAULT_SEED_PAGES as any;
    }

    // If query errored (e.g. table not created yet), return DEFAULT_SEED_PAGES gracefully
    if (error || !data || data.length === 0) {
      return NextResponse.json({ pages: DEFAULT_SEED_PAGES });
    }

    return NextResponse.json({ pages: data });
  } catch {
    return NextResponse.json({ pages: DEFAULT_SEED_PAGES });
  }
}

// ── PATCH — update a CMS page ─────────────────────────────────────────────────
export async function PATCH(req: NextRequest) {
  const session = await verifyAdminSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canEditContent(session.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const { id, status, approval_action, ...fields } = body;

  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const validStatuses = new Set(['draft', 'scheduled', 'published', 'archived']);
  if (status && !validStatuses.has(status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  if (status === 'scheduled' && !canScheduleContent(session.role)) {
    return NextResponse.json({ error: 'Only managers and owners can schedule content.' }, { status: 403 });
  }
  if (status === 'published' && !canPublishContent(session.role)) {
    return NextResponse.json({ error: 'You do not have permission to publish. Submit this draft for approval.' }, { status: 403 });
  }
  if (approval_action && !['submit_for_approval', 'approve', 'reject'].includes(approval_action)) {
    return NextResponse.json({ error: 'Invalid approval action' }, { status: 400 });
  }
  if (approval_action && approval_action !== 'submit_for_approval' && !canPublishContent(session.role)) {
    return NextResponse.json({ error: 'Only managers and owners can review content.' }, { status: 403 });
  }

  // Read current state for revision snapshot
  const { data: current } = await supabaseAdmin.from('cms_pages').select('*').eq('id', id).single();

  const updatePayload: Record<string, unknown> = {
    ...fields,
    updated_by: session.username,
  };
  const now = new Date().toISOString();
  if (approval_action === 'submit_for_approval') {
    updatePayload.status = 'draft';
    updatePayload.approval_status = 'pending_review';
    updatePayload.submitted_at = now;
    updatePayload.submitted_by = session.username;
  } else if (approval_action === 'approve') {
    updatePayload.approval_status = 'approved';
    updatePayload.reviewed_at = now;
    updatePayload.reviewed_by = session.username;
    updatePayload.review_note = body.review_note ?? null;
  } else if (approval_action === 'reject') {
    updatePayload.status = 'draft';
    updatePayload.approval_status = 'rejected';
    updatePayload.reviewed_at = now;
    updatePayload.reviewed_by = session.username;
    updatePayload.review_note = body.review_note ?? null;
  }
  if (status) {
    updatePayload.status = status;
    if (status === 'published') {
      updatePayload.published_at = now;
      updatePayload.approval_status = 'approved';
      updatePayload.reviewed_at = now;
      updatePayload.reviewed_by = session.username;
    }
    if (status === 'scheduled') {
      // Scheduling is a manager/owner publishing decision; the cron may only
      // publish records that have already crossed the approval gate.
      updatePayload.approval_status = 'approved';
      if (fields.scheduled_at) updatePayload.scheduled_at = fields.scheduled_at;
    }
  }

  const { data, error } = await supabaseAdmin
    .from('cms_pages')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Write revision
  const changedFields = current
    ? Object.keys({ ...fields, ...(status ? { status } : {}), ...(approval_action ? { approval_action } : {}) })
        .filter(key => JSON.stringify((current as any)[key]) !== JSON.stringify((data as any)?.[key]))
    : Object.keys(fields);
  if (current) {
    await supabaseAdmin.from('cms_page_revisions').insert({
      page_id: id,
      snapshot: current,
      saved_by: session.username,
      changed_fields: changedFields,
    }).then(() => {});
  }

  // Write change log
  await supabaseAdmin.from('cms_change_log').insert({
    entity_type: 'page',
    entity_id: id,
    entity_label: current?.title_fr ?? current?.slug,
    action: approval_action === 'submit_for_approval' ? 'submit_for_approval' : approval_action === 'approve' ? 'approve' : approval_action === 'reject' ? 'reject' : status === 'published' ? 'publish' : status === 'scheduled' ? 'schedule' : status === 'archived' ? 'archive' : 'update',
    previous: current ?? null,
    next_state: data,
    changed_by: session.username,
  }).then(() => {});

  // Invalidate caches on publish
  if (status === 'published') {
    const slug = data?.slug;
    if (slug === 'home') revalidateTag(CMS_HOMEPAGE_CACHE_TAG, { expire: 0 });
    revalidateTag(PUBLIC_SETTINGS_CACHE_TAG, { expire: 0 });
  }

  return NextResponse.json({ page: data });
}

// ── POST — create a new CMS page ──────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await verifyAdminSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canEditContent(session.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const { slug, page_type = 'custom', title_fr, title_ar } = body;

  if (!slug) return NextResponse.json({ error: 'slug is required' }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from('cms_pages')
    .insert({ slug, page_type, title_fr, title_ar, status: 'draft', created_by: session.username, updated_by: session.username })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabaseAdmin.from('cms_change_log').insert({
    entity_type: 'page',
    entity_id: data.id,
    entity_label: title_fr ?? slug,
    action: 'create',
    previous: null,
    next_state: data,
    changed_by: session.username,
  });

  return NextResponse.json({ page: data }, { status: 201 });
}
