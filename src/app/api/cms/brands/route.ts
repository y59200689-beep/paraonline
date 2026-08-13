import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/session';
import { canManageBrands, canPublishContent, canScheduleContent } from '@/lib/permissions';
import { BRANDS_DATA, slugify } from '@/lib/brands';

const BRAND_FIELDS = 'id,name,slug,domain,logo_url,tagline_fr,tagline_ar,description_fr,description_ar,intro_fr,intro_ar,status,approval_status,submitted_at,submitted_by,reviewed_at,reviewed_by,review_note,scheduled_at,published_at,display_order,is_visible,card_link,updated_at,seo_title_fr,seo_title_ar,seo_description_fr,seo_description_ar,gallery_images,concerns,ranges,hero_settings,highlights,method_settings,category_filters,page_sections';

function fallbackBrands() {
  return BRANDS_DATA.map((brand, index) => ({
    id: `fallback-${slugify(brand.name)}`, name: brand.name, slug: slugify(brand.name), domain: brand.domain ?? null,
    logo_url: brand.logoUrl ?? null, tagline_fr: brand.taglineFr ?? null, tagline_ar: brand.taglineAr ?? null,
    description_fr: brand.descriptionFr ?? null, description_ar: brand.descriptionAr ?? null, intro_fr: null, intro_ar: null,
    status: 'published', approval_status: 'approved', display_order: index + 1, is_visible: true, card_link: null,
    updated_at: new Date().toISOString(), scheduled_at: null, published_at: null,
  }));
}

async function requireSession(req: NextRequest) {
  const session = await verifyAdminSession(req);
  if (!session) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  if (!canManageBrands(session.role)) return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  return { session };
}

export async function GET(req: NextRequest) {
  const auth = await requireSession(req);
  if ('error' in auth) return auth.error;
  const { data, error } = await supabaseAdmin.from('cms_brands').select(BRAND_FIELDS).order('display_order', { ascending: true });
  if (error || !data?.length) return NextResponse.json({ brands: fallbackBrands(), fallback: true });
  return NextResponse.json({ brands: data });
}

export async function POST(req: NextRequest) {
  const auth = await requireSession(req);
  if ('error' in auth) return auth.error;
  const body = await req.json().catch(() => ({}));
  const name = String(body.name ?? '').trim();
  const slug = slugify(String(body.slug || name));
  if (!name || !slug) return NextResponse.json({ error: 'name is required' }, { status: 400 });
  const { data, error } = await supabaseAdmin.from('cms_brands').insert({
    name, slug, domain: body.domain || null, status: 'draft', approval_status: 'draft',
    created_by: auth.session.username, updated_by: auth.session.username,
  }).select(BRAND_FIELDS).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await supabaseAdmin.from('cms_change_log').insert({ entity_type: 'brand', entity_id: data.id, entity_label: name, action: 'create', next_state: data, changed_by: auth.session.username });
  return NextResponse.json({ brand: data }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const auth = await requireSession(req);
  if ('error' in auth) return auth.error;
  const body = await req.json().catch(() => ({}));
  const { id, status, approval_action, ...fields } = body;
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });
  if (status === 'published' && !canPublishContent(auth.session.role)) return NextResponse.json({ error: 'Submit this brand for approval first.' }, { status: 403 });
  if (status === 'scheduled' && !canScheduleContent(auth.session.role)) return NextResponse.json({ error: 'Only managers and owners can schedule brands.' }, { status: 403 });
  if (approval_action && approval_action !== 'submit_for_approval' && !canPublishContent(auth.session.role)) return NextResponse.json({ error: 'Only managers and owners can review brands.' }, { status: 403 });
  const { data: current } = await supabaseAdmin.from('cms_brands').select('*').eq('id', id).single();
  if (!current) return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
  const now = new Date().toISOString();
  const payload: Record<string, unknown> = { ...fields, updated_by: auth.session.username };
  if (status) payload.status = status;
  if (status === 'published') Object.assign(payload, { published_at: now, approval_status: 'approved', reviewed_at: now, reviewed_by: auth.session.username });
  if (status === 'scheduled') payload.approval_status = 'approved';
  if (approval_action === 'submit_for_approval') Object.assign(payload, { status: 'draft', approval_status: 'pending_review', submitted_at: now, submitted_by: auth.session.username });
  if (approval_action === 'approve') Object.assign(payload, { approval_status: 'approved', reviewed_at: now, reviewed_by: auth.session.username, review_note: body.review_note ?? null });
  if (approval_action === 'reject') Object.assign(payload, { status: 'draft', approval_status: 'rejected', reviewed_at: now, reviewed_by: auth.session.username, review_note: body.review_note ?? null });
  const { data, error } = await supabaseAdmin.from('cms_brands').update(payload).eq('id', id).select(BRAND_FIELDS).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const changedFields = Object.keys(payload).filter(key => JSON.stringify((current as any)[key]) !== JSON.stringify((data as any)?.[key]));
  await supabaseAdmin.from('cms_brand_revisions').insert({ brand_id: id, snapshot: current, saved_by: auth.session.username, changed_fields: changedFields });
  await supabaseAdmin.from('cms_change_log').insert({ entity_type: 'brand', entity_id: id, entity_label: current.name, action: approval_action === 'submit_for_approval' ? 'submit_for_approval' : status === 'published' ? 'publish' : status === 'scheduled' ? 'schedule' : 'update', previous: current, next_state: data, changed_by: auth.session.username });
  return NextResponse.json({ brand: data });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireSession(req);
  if ('error' in auth) return auth.error;
  if (auth.session.role !== 'owner') return NextResponse.json({ error: 'Only owners can delete brands.' }, { status: 403 });
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });
  const { data: current } = await supabaseAdmin.from('cms_brands').select('*').eq('id', id).single();
  const { error } = await supabaseAdmin.from('cms_brands').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await supabaseAdmin.from('cms_change_log').insert({ entity_type: 'brand', entity_id: id, entity_label: current?.name ?? id, action: 'delete', previous: current, changed_by: auth.session.username });
  return NextResponse.json({ success: true });
}

/** Re-sync missing brand records from the configured hardcoded seed without overwriting edits. */
export async function PUT(req: NextRequest) {
  const auth = await requireSession(req);
  if ('error' in auth) return auth.error;
  const { data: existing } = await supabaseAdmin.from('cms_brands').select('slug').limit(1000);
  const known = new Set((existing ?? []).map((row: { slug: string }) => row.slug));
  const missing = BRANDS_DATA.filter(brand => !known.has(slugify(brand.name))).map((brand, index) => ({
    name: brand.name, slug: slugify(brand.name), domain: brand.domain ?? null, logo_url: brand.logoUrl ?? null,
    tagline_fr: brand.taglineFr ?? null, tagline_ar: brand.taglineAr ?? null, description_fr: brand.descriptionFr ?? null,
    description_ar: brand.descriptionAr ?? null, status: 'draft', approval_status: 'draft', display_order: index + 1,
    created_by: auth.session.username, updated_by: auth.session.username,
  }));
  if (missing.length) await supabaseAdmin.from('cms_brands').insert(missing);
  const { data: brands } = await supabaseAdmin.from('cms_brands').select(BRAND_FIELDS).order('display_order', { ascending: true });
  return NextResponse.json({ brands: brands ?? [], imported: missing.length, total: brands?.length ?? 0 });
}
