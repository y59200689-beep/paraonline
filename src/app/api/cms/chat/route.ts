import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/session';
import { authorizeAdminMutation } from '@/lib/admin-authorization';
import { canManageChat, canManageDiagnostic, canEditContent } from '@/lib/permissions';

export async function GET(req: NextRequest) {
  const session = await verifyAdminSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canEditContent(session.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { data, error } = await supabaseAdmin
    .from('cms_chat_config')
    .select('*')
    .eq('id', 1)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rawFacts = Array.isArray(data?.business_facts) ? data.business_facts : [];
  const brandConfigItem = rawFacts.find((item: any) => item && item.type === 'allowed_brands_config');

  const allowed_brands = brandConfigItem?.allowed_brands ?? [];
  const allowed_brands_enabled = brandConfigItem?.allowed_brands_enabled ?? false;

  const config = {
    ...(data ?? {}),
    allowed_brands,
    allowed_brands_enabled,
  };

  return NextResponse.json({ config });
}

export async function PATCH(req: NextRequest) {
  const authorization = await authorizeAdminMutation({
    allow: (role) => canManageChat(role) || canManageDiagnostic(role),
  });
  if (!authorization.authorized) return authorization.response;
  const session = authorization.operator;

  const body = await req.json();
  const { allowed_brands, allowed_brands_enabled, ...otherFields } = body;

  // 1. Fetch current row
  const { data: existingData } = await supabaseAdmin
    .from('cms_chat_config')
    .select('*')
    .eq('id', 1)
    .maybeSingle();

  let updatedBusinessFacts = Array.isArray(existingData?.business_facts)
    ? [...existingData.business_facts]
    : [];

  if (allowed_brands !== undefined || allowed_brands_enabled !== undefined) {
    const existingBrandItem = updatedBusinessFacts.find((item: any) => item && item.type === 'allowed_brands_config');
    const currentBrands = allowed_brands !== undefined ? allowed_brands : (existingBrandItem?.allowed_brands ?? []);
    const currentEnabled = allowed_brands_enabled !== undefined ? allowed_brands_enabled : (existingBrandItem?.allowed_brands_enabled ?? false);

    updatedBusinessFacts = updatedBusinessFacts.filter((item: any) => !(item && item.type === 'allowed_brands_config'));
    updatedBusinessFacts.push({
      type: 'allowed_brands_config',
      allowed_brands: currentBrands,
      allowed_brands_enabled: currentEnabled,
    });
  }

  // Filter out any schema-invalid top-level keys before upserting into cms_chat_config
  const { allowed_brands: _ab, allowed_brands_enabled: _abe, ...cleanOtherFields } = otherFields;

  const payload: Record<string, any> = {
    id: 1,
    ...(existingData ?? {}),
    ...cleanOtherFields,
    business_facts: updatedBusinessFacts,
    updated_by: session.username,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabaseAdmin
    .from('cms_chat_config')
    .upsert(payload)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabaseAdmin.from('cms_change_log').insert({
    entity_type: 'chat',
    entity_id: '1',
    entity_label: 'Chat Config',
    action: 'update',
    previous: null,
    next_state: data,
    changed_by: session.username,
  }).then(() => {});

  const config = {
    ...(data ?? {}),
    allowed_brands: allowed_brands ?? (existingData?.allowed_brands ?? []),
    allowed_brands_enabled: allowed_brands_enabled ?? (existingData?.allowed_brands_enabled ?? false),
  };

  return NextResponse.json({ config });
}
