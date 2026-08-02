import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/session';
import { supabaseAdmin as supabase } from '@/lib/supabase';

type Resource = 'customer-tags' | 'customer-notes' | 'customer-samples' | 'points-adjustments' | 'saved-views' | 'import-runs' | 'sync-runs';

const tableByResource: Record<Resource, string> = {
  'customer-tags': 'admin_customer_tags',
  'customer-notes': 'admin_customer_notes',
  'customer-samples': 'admin_customer_samples',
  'points-adjustments': 'admin_points_adjustments',
  'saved-views': 'admin_saved_views',
  'import-runs': 'admin_import_runs',
  'sync-runs': 'admin_sync_runs',
};

function getResource(value: string | null): Resource | null {
  return value && value in tableByResource ? value as Resource : null;
}

function canWrite(resource: Resource, role?: string) {
  if (resource === 'import-runs' || resource === 'sync-runs') return role === 'owner';
  return role !== 'support';
}

export async function GET(request: Request) {
  const session = await verifyAdminSession();
  if (!session) return NextResponse.json({ success: false, error: 'Acces non autorise.' }, { status: 401 });

  const url = new URL(request.url);
  const resource = getResource(url.searchParams.get('resource'));
  if (!resource) return NextResponse.json({ success: false, error: 'Ressource inconnue.' }, { status: 400 });

  let query = supabase.from(tableByResource[resource]).select('*').order('created_at', { ascending: false });
  const phone = url.searchParams.get('phone');
  const scope = url.searchParams.get('scope');
  if (phone && ['customer-tags', 'customer-notes', 'customer-samples', 'points-adjustments'].includes(resource)) query = query.eq('phone', phone);
  if (scope && resource === 'saved-views') query = query.eq('scope', scope);

  const { data, error } = await query.limit(200);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, records: data || [] });
}

export async function POST(request: Request) {
  const session = await verifyAdminSession();
  if (!session) return NextResponse.json({ success: false, error: 'Acces non autorise.' }, { status: 401 });

  const { resource: resourceValue, record } = await request.json();
  const resource = getResource(resourceValue);
  if (!resource || !record || typeof record !== 'object') {
    return NextResponse.json({ success: false, error: 'Donnees invalides.' }, { status: 400 });
  }
  if (!canWrite(resource, session.role)) return NextResponse.json({ success: false, error: 'Permission insuffisante.' }, { status: 403 });

  const createdBy = session.name || session.username || 'Administrateur';
  const id = typeof record.id === 'string' && record.id ? record.id : randomUUID();
  const common = { id, created_by: createdBy };
  let payload: Record<string, unknown>;

  switch (resource) {
    case 'customer-tags':
      if (!record.phone || !record.tag) return NextResponse.json({ success: false, error: 'Telephone et etiquette requis.' }, { status: 400 });
      payload = { ...common, phone: String(record.phone), tag: String(record.tag).trim() };
      break;
    case 'customer-notes':
      if (!record.phone || !record.text) return NextResponse.json({ success: false, error: 'Telephone et note requis.' }, { status: 400 });
      payload = { ...common, phone: String(record.phone), text: String(record.text).trim() };
      break;
    case 'customer-samples':
      if (!record.phone || !record.sample_name) return NextResponse.json({ success: false, error: 'Telephone et echantillon requis.' }, { status: 400 });
      payload = { ...common, phone: String(record.phone), sample_name: String(record.sample_name).trim(), category: String(record.category || 'Echantillon') };
      break;
    case 'points-adjustments':
      if (!record.phone || !Number.isFinite(Number(record.points))) return NextResponse.json({ success: false, error: 'Ajustement de points invalide.' }, { status: 400 });
      payload = { ...common, phone: String(record.phone), points: Number(record.points), reason: String(record.reason || 'Ajustement administrateur') };
      break;
    case 'saved-views':
      if (!record.scope || !record.name) return NextResponse.json({ success: false, error: 'Portee et nom requis.' }, { status: 400 });
      payload = { ...common, scope: String(record.scope), name: String(record.name).trim(), configuration: record.configuration || {}, visibility: record.visibility === 'personal' ? 'personal' : 'team' };
      break;
    case 'import-runs':
      payload = { ...common, file_name: record.file_name || null, created_count: Number(record.created_count) || 0, updated_count: Number(record.updated_count) || 0, skipped_count: Number(record.skipped_count) || 0, validation_error_count: Number(record.validation_error_count) || 0, validation_errors: Array.isArray(record.validation_errors) ? record.validation_errors.slice(0, 500) : [] };
      break;
    case 'sync-runs':
      if (!record.source || !['running', 'success', 'failed'].includes(record.status)) return NextResponse.json({ success: false, error: 'Synchronisation invalide.' }, { status: 400 });
      payload = { ...common, source: String(record.source), status: record.status, duration_ms: Number.isFinite(Number(record.duration_ms)) ? Number(record.duration_ms) : null, inserted_count: Number(record.inserted_count) || 0, updated_count: Number(record.updated_count) || 0, skipped_count: Number(record.skipped_count) || 0, error: record.error || null, triggered_by: createdBy, completed_at: record.completed_at || null };
      delete payload.created_by;
      break;
  }

  const { data, error } = await supabase.from(tableByResource[resource]).insert(payload).select().single();
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  await supabase.from('audit_logs').insert({
    id: `log_operational_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    action: `Admin ${resource}`,
    details: `${createdBy} a ajoute un enregistrement ${resource}.`,
    date: new Date().toISOString(),
  });

  return NextResponse.json({ success: true, record: data });
}

export async function DELETE(request: Request) {
  const session = await verifyAdminSession();
  if (!session) return NextResponse.json({ success: false, error: 'Acces non autorise.' }, { status: 401 });

  const url = new URL(request.url);
  const resource = getResource(url.searchParams.get('resource'));
  const id = url.searchParams.get('id');
  if (!resource || !id) return NextResponse.json({ success: false, error: 'Ressource ou identifiant manquant.' }, { status: 400 });
  if (!canWrite(resource, session.role)) return NextResponse.json({ success: false, error: 'Permission insuffisante.' }, { status: 403 });

  const { error } = await supabase.from(tableByResource[resource]).delete().eq('id', id);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  await supabase.from('audit_logs').insert({
    id: `log_operational_delete_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    action: `Suppression ${resource}`,
    details: `${session.name || session.username || 'Administrateur'} a supprime un enregistrement ${resource}.`,
    date: new Date().toISOString(),
  });

  return NextResponse.json({ success: true });
}
