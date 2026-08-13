import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/session';
import { canManageOperators } from '@/lib/permissions';

const ALLOWED_ROLES = new Set([
  'owner',
  'manager',
  'content_editor',
  'catalogue_editor',
  'fulfilment',
  'logistician',
  'support',
  'viewer',
]);

function isValidEmail(value: unknown): value is string {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export async function GET(req: NextRequest) {
  const session = await verifyAdminSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canManageOperators(session.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { data, error } = await supabaseAdmin
    .from('operators')
    .select('id, name, email, role, active, created_at')
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ operators: data });
}

export async function POST(req: NextRequest) {
  const session = await verifyAdminSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canManageOperators(session.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const { name, email, role = 'content_editor' } = body;

  if (typeof name !== 'string' || !name.trim() || !isValidEmail(email) || !ALLOWED_ROLES.has(role)) {
    return NextResponse.json({ error: 'name and email are required' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('operators')
    .insert({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      active: true,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ operator: data }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await verifyAdminSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canManageOperators(session.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const { id } = body;

  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const fields: Record<string, string | boolean> = {};
  if ('name' in body) {
    if (typeof body.name !== 'string' || !body.name.trim()) {
      return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
    }
    fields.name = body.name.trim();
  }
  if ('email' in body) {
    if (!isValidEmail(body.email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }
    fields.email = body.email.trim().toLowerCase();
  }
  if ('role' in body) {
    if (!ALLOWED_ROLES.has(body.role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }
    fields.role = body.role;
  }
  if ('active' in body) {
    if (typeof body.active !== 'boolean') {
      return NextResponse.json({ error: 'Invalid active state' }, { status: 400 });
    }
    fields.active = body.active;
  }

  if (Object.keys(fields).length === 0) {
    return NextResponse.json({ error: 'No supported fields supplied' }, { status: 400 });
  }

  const { data: target } = await supabaseAdmin
    .from('operators')
    .select('id, role')
    .eq('id', id)
    .maybeSingle();

  if (target?.role === 'owner' && (fields.role !== undefined || fields.active === false)) {
    return NextResponse.json({ error: 'The owner role cannot be removed or disabled here' }, { status: 409 });
  }

  const { data, error } = await supabaseAdmin
    .from('operators')
    .update(fields)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ operator: data });
}
