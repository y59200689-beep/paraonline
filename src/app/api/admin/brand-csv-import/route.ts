import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { authorizeAdminMutation } from '@/lib/admin-authorization';
import { canManageBrands } from '@/lib/permissions';

const ALLOWED_FIELDS = new Set([
  'logo_url', 'domain', 'card_link',
  'tagline_fr', 'tagline_ar',
  'description_fr', 'description_ar',
]);

export async function POST(req: NextRequest) {
  const authorization = await authorizeAdminMutation({ allow: canManageBrands });
  if (!authorization.authorized) return authorization.response;
  const operator = authorization.operator;

  const body = await req.json().catch(() => ({}));
  const updates: { id: string; fields: Record<string, unknown> }[] = body.updates ?? [];

  if (!Array.isArray(updates) || updates.length === 0) {
    return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
  }

  const updated: string[] = [];
  const errors: { id: string; error: string }[] = [];

  for (const { id, fields } of updates) {
    if (!id) continue;

    // Only allow safe, explicitly listed fields — never let CSV overwrite arbitrary columns
    const safeFields: Record<string, unknown> = { updated_by: operator.username };
    for (const [key, value] of Object.entries(fields)) {
      if (ALLOWED_FIELDS.has(key) && value !== '' && value !== null && value !== undefined) {
        safeFields[key] = value;
      }
    }

    // Nothing to update (all cells were empty)
    if (Object.keys(safeFields).length === 1) continue;

    const { data: current } = await supabaseAdmin.from('cms_brands').select('name').eq('id', id).single();

    const { data, error } = await supabaseAdmin
      .from('cms_brands')
      .update(safeFields)
      .eq('id', id)
      .select('name')
      .single();

    if (error) {
      errors.push({ id, error: error.message });
      continue;
    }

    updated.push(data.name);

    // Audit log
    await supabaseAdmin.from('cms_change_log').insert({
      entity_type: 'brand',
      entity_id: id,
      entity_label: current?.name ?? id,
      action: 'update',
      next_state: safeFields,
      changed_by: operator.username,
    });
  }

  return NextResponse.json({ updated, errors });
}
