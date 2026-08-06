import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/session';
import { canEditContent } from '@/lib/permissions';

/**
 * POST /api/cms/preview
 *
 * Issues a short-lived (4 hour) preview token for a CMS entity.
 * The token is stored in cms_preview_tokens and validated by the
 * storefront middleware before rendering the draft content.
 *
 * Body: { entity_type: string, entity_id: string, snapshot: object }
 * Response: { token: string, preview_url: string }
 */
export async function POST(req: NextRequest) {
  const session = await verifyAdminSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canEditContent(session.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const { entity_type, entity_id, snapshot } = body;

  if (!entity_type || !entity_id || !snapshot) {
    return NextResponse.json({ error: 'entity_type, entity_id, and snapshot are required' }, { status: 400 });
  }

  // Purge expired tokens first (best-effort, non-blocking)
  supabaseAdmin.rpc('cms_purge_expired_preview_tokens').then(() => {});

  // Insert new token (DB generates the token value via DEFAULT)
  const { data, error } = await supabaseAdmin
    .from('cms_preview_tokens')
    .insert({
      entity_type,
      entity_id,
      snapshot,
      created_by: session.username,
    })
    .select('token')
    .single();

  if (error || !data?.token) {
    return NextResponse.json({ error: error?.message ?? 'Failed to create token' }, { status: 500 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const preview_url = `${siteUrl}?preview_token=${data.token}`;

  return NextResponse.json({ token: data.token, preview_url });
}

/**
 * GET /api/cms/preview?token=xxx
 *
 * Validates a preview token and returns the associated snapshot.
 * Used by the storefront to render the draft content.
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from('cms_preview_tokens')
    .select('entity_type,entity_id,snapshot,expires_at')
    .eq('token', token)
    .single();

  if (error || !data) return NextResponse.json({ error: 'Invalid or expired token' }, { status: 404 });

  if (new Date(data.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Preview token has expired' }, { status: 410 });
  }

  return NextResponse.json({ entity_type: data.entity_type, entity_id: data.entity_id, snapshot: data.snapshot });
}
