import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/session';
import { canManageBrands } from '@/lib/permissions';
import { BRANDS_DATA } from '@/lib/brands';

const DEFAULT_SEED_BRANDS = BRANDS_DATA.map((b, idx) => ({
  id: `seed-brand-${idx + 1}`,
  name: b.name,
  slug: b.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
  domain: b.domain,
  logo_url: b.logoUrl || null,
  tagline_fr: b.taglineFr,
  tagline_ar: b.taglineAr,
  description_fr: b.descriptionFr,
  description_ar: b.descriptionAr,
  intro_fr: null,
  intro_ar: null,
  status: 'published',
  display_order: idx + 1,
  is_visible: true,
  card_link: null,
  created_by: 'system',
  updated_by: 'system',
}));

const FULL_BRAND_SELECT = 'id,name,slug,domain,logo_url,tagline_fr,tagline_ar,description_fr,description_ar,intro_fr,intro_ar,status,display_order,is_visible,card_link,updated_at,seo_title_fr,seo_title_ar,seo_description_fr,seo_description_ar';
const LEGACY_BRAND_SELECT = 'id,name,slug,domain,logo_url,tagline_fr,tagline_ar,description_fr,description_ar,intro_fr,intro_ar,status,display_order,updated_at,seo_title_fr,seo_title_ar,seo_description_fr,seo_description_ar';

async function fetchBrandsFromDb() {
  const { data, error } = await supabaseAdmin
    .from('cms_brands')
    .select(FULL_BRAND_SELECT)
    .order('display_order', { ascending: true });

  if (!error && data && data.length > 0) {
    return data.map((b: any) => ({
      ...b,
      is_visible: b.is_visible ?? true,
      card_link: b.card_link ?? null,
    }));
  }

  if (error) {
    const { data: legacyData, error: legacyErr } = await supabaseAdmin
      .from('cms_brands')
      .select(LEGACY_BRAND_SELECT)
      .order('display_order', { ascending: true });

    if (!legacyErr && legacyData && legacyData.length > 0) {
      return legacyData.map((b: any) => ({
        ...b,
        is_visible: true,
        card_link: null,
      }));
    }
  }

  return null;
}

async function getAllProductVendors(): Promise<string[]> {
  const vendorsSet = new Set<string>();
  const pageSize = 1000;
  let page = 0;
  let hasMore = true;

  while (hasMore && page < 50) {
    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await supabaseAdmin
      .from('products')
      .select('vendor')
      .not('vendor', 'is', null)
      .neq('vendor', '')
      .neq('vendor', '-')
      .range(from, to);

    if (error || !data || data.length === 0) {
      hasMore = false;
      break;
    }

    data.forEach((p: any) => {
      const v = (p.vendor as string)?.trim();
      if (v) vendorsSet.add(v);
    });

    if (data.length < pageSize) {
      hasMore = false;
    } else {
      page++;
    }
  }

  return Array.from(vendorsSet);
}

async function syncAndFetchAllBrands(username: string) {
  // 1. Fetch existing brands in cms_brands table
  let dbBrands = await fetchBrandsFromDb() || [];

  // 2. If table is empty, seed DEFAULT_SEED_BRANDS
  if (dbBrands.length === 0) {
    const seedItems = DEFAULT_SEED_BRANDS.map(({ id, ...item }) => item);
    await supabaseAdmin.from('cms_brands').upsert(seedItems, { onConflict: 'slug' });
    dbBrands = await fetchBrandsFromDb() || DEFAULT_SEED_BRANDS;
  }

  // 3. Extract all distinct vendor names across paginated product catalog
  const distinctVendors = await getAllProductVendors();

  // 4. Identify vendors missing from cms_brands
  const existingSlugs = new Set(dbBrands.map((b: any) => b.slug as string));
  const existingNames = new Set(dbBrands.map((b: any) => (b.name as string).toLowerCase()));

  const missingVendors = distinctVendors.filter((v: string) => {
    const slug = v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return !existingSlugs.has(slug) && !existingNames.has(v.toLowerCase());
  });

  // 5. Auto-insert missing vendors into cms_brands
  if (missingVendors.length > 0) {
    const maxOrder = Math.max(0, ...dbBrands.map((b: any) => b.display_order ?? 0));
    const newItems = missingVendors.map((vendorName, i) => {
      const slug = vendorName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      return {
        name: vendorName,
        slug,
        domain: null,
        logo_url: null,
        tagline_fr: null,
        tagline_ar: null,
        description_fr: null,
        description_ar: null,
        status: 'published',
        display_order: maxOrder + i + 1,
        is_visible: true,
        card_link: null,
        created_by: username,
        updated_by: username,
      };
    });

    try {
      await supabaseAdmin.from('cms_brands').upsert(newItems, { onConflict: 'slug' });
      const reFetched = await fetchBrandsFromDb();
      if (reFetched && reFetched.length > dbBrands.length) {
        dbBrands = reFetched;
      }
    } catch (e) {
      console.warn('Auto-insert missing vendors warning:', e);
    }
  }

  // 6. Synthetic merge fallback: guarantee ALL distinct vendors are returned
  const currentSlugs = new Set(dbBrands.map((b: any) => b.slug as string));
  const currentNames = new Set(dbBrands.map((b: any) => (b.name as string).toLowerCase()));

  const syntheticItems: any[] = [];
  distinctVendors.forEach((v, i) => {
    const slug = v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (!currentSlugs.has(slug) && !currentNames.has(v.toLowerCase())) {
      syntheticItems.push({
        id: `vendor-brand-${i + 1}`,
        name: v,
        slug,
        domain: null,
        logo_url: null,
        tagline_fr: null,
        tagline_ar: null,
        description_fr: null,
        description_ar: null,
        status: 'published',
        display_order: 9990 + i,
        is_visible: true,
        card_link: null,
        updated_at: new Date().toISOString(),
      });
    }
  });

  return [...dbBrands, ...syntheticItems];
}

export async function GET(req: NextRequest) {
  const session = await verifyAdminSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canManageBrands(session.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const brands = await syncAndFetchAllBrands(session.username || 'admin');
    return NextResponse.json({ brands });
  } catch (err: any) {
    console.error('GET /api/cms/brands error:', err);
    return NextResponse.json({ brands: DEFAULT_SEED_BRANDS });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await verifyAdminSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canManageBrands(session.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const { id, ...fields } = body;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  // If this is a synthetic or fallback item (not in DB yet), upsert it first
  if (id.startsWith('seed-brand-') || id.startsWith('vendor-brand-')) {
    const brandName = fields.name || body.name;
    const slug = fields.slug || body.slug || (brandName ? brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : id);
    const { data: inserted, error: insErr } = await supabaseAdmin
      .from('cms_brands')
      .upsert({
        name: brandName || slug,
        slug,
        status: 'published',
        is_visible: true,
        ...fields,
        created_by: session.username,
        updated_by: session.username,
      }, { onConflict: 'slug' })
      .select()
      .single();

    if (!insErr && inserted) {
      return NextResponse.json({ brand: inserted });
    }
  }

  let { data, error } = await supabaseAdmin
    .from('cms_brands')
    .update({ ...fields, updated_by: session.username })
    .eq('id', id)
    .select()
    .single();

  if (error && (fields.is_visible !== undefined || fields.card_link !== undefined)) {
    const { is_visible, card_link, ...legacyFields } = fields;
    const res = await supabaseAdmin
      .from('cms_brands')
      .update({ ...legacyFields, updated_by: session.username })
      .eq('id', id)
      .select()
      .single();

    if (!res.error) {
      data = { ...res.data, is_visible: is_visible ?? true, card_link: card_link ?? null };
      error = null;
    }
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabaseAdmin.from('cms_change_log').insert({
    entity_type: 'brand',
    entity_id: id,
    entity_label: data?.name ?? data?.slug,
    action: 'update',
    previous: null,
    next_state: data,
    changed_by: session.username,
  }).then(() => {});

  return NextResponse.json({ brand: data });
}

export async function POST(req: NextRequest) {
  const session = await verifyAdminSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canManageBrands(session.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const { name, slug } = body;
  if (!name || !slug) return NextResponse.json({ error: 'name and slug are required' }, { status: 400 });

  const { data, error } = await supabaseAdmin.from('cms_brands').insert({
    ...body,
    status: body.status || 'published',
    is_visible: body.is_visible ?? true,
    created_by: session.username,
    updated_by: session.username,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabaseAdmin.from('cms_change_log').insert({
    entity_type: 'brand',
    entity_id: data.id,
    entity_label: name,
    action: 'create',
    previous: null,
    next_state: data,
    changed_by: session.username,
  }).then(() => {});

  return NextResponse.json({ brand: data }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await verifyAdminSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canManageBrands(session.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const brands = await syncAndFetchAllBrands(session.username || 'admin');
    return NextResponse.json({ imported: brands.length, total: brands.length, brands });
  } catch (e: any) {
    console.error('PUT /api/cms/brands error:', e);
    return NextResponse.json({ error: e?.message ?? 'Unknown error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await verifyAdminSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canManageBrands(session.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const url = new URL(req.url);
    let id = url.searchParams.get('id');
    let name = url.searchParams.get('name');

    if (!id && !name) {
      try {
        const body = await req.json();
        id = body.id || null;
        name = body.name || null;
      } catch {}
    }

    if (!id && !name) {
      return NextResponse.json({ error: 'Missing brand id or name' }, { status: 400 });
    }

    // 1. Delete from cms_brands table
    if (id) {
      await supabaseAdmin.from('cms_brands').delete().eq('id', id);
    }
    if (name) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      await supabaseAdmin.from('cms_brands').delete().or(`name.ilike."${name}",slug.eq."${slug}"`);
      
      // 2. Clear vendor field on matching products in catalog
      await supabaseAdmin.from('products').update({ vendor: '' }).ilike('vendor', name);
    }

    await supabaseAdmin.from('cms_change_log').insert({
      entity_type: 'brand',
      entity_id: id || name || 'unknown',
      entity_label: name || id || 'deleted brand',
      action: 'delete',
      previous: null,
      next_state: null,
      changed_by: session.username,
    }).then(() => {});

    return NextResponse.json({ success: true, message: 'Brand deleted successfully' });
  } catch (e: any) {
    console.error('DELETE /api/cms/brands error:', e);
    return NextResponse.json({ error: e?.message ?? 'Failed to delete brand' }, { status: 500 });
  }
}

