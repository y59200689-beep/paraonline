import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { hashPasswordAsync, verifyAdminSession } from '@/lib/session';
import { authorizeAdminMutation } from '@/lib/admin-authorization';
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

export async function GET(req: NextRequest) {
  const session = await verifyAdminSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canManageOperators(session.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { data, error } = await supabaseAdmin
    .from('operators')
    .select('id, username, name, role, is_active, created_at')
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ operators: data });
}

export async function POST(req: NextRequest) {
  const authorization = await authorizeAdminMutation({ allow: canManageOperators });
  if (!authorization.authorized) return authorization.response;

  const body = await req.json();
  const { username, password, name, role = 'content_editor' } = body;
  const cleanUsername = typeof username === 'string' ? username.trim().toLowerCase() : '';

  if (typeof name !== 'string' || !name.trim() || cleanUsername.length < 3 || typeof password !== 'string' || password.length < 6 || !ALLOWED_ROLES.has(role)) {
    return NextResponse.json({ error: 'name, username, password, and role are required' }, { status: 400 });
  }

  const { data: existingOperator } = await supabaseAdmin
    .from('operators')
    .select('id')
    .eq('username', cleanUsername)
    .maybeSingle();

  if (existingOperator) {
    return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
  }

  const operatorId = `user_${Date.now()}`;
  const createdAt = new Date().toISOString();
  const { error } = await supabaseAdmin
    .from('operators')
    .insert({
      id: operatorId,
      name: name.trim(),
      username: cleanUsername,
      password: await hashPasswordAsync(password),
      role,
      is_active: true,
      created_at: createdAt,
    });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({
    operator: { id: operatorId, name: name.trim(), username: cleanUsername, role, is_active: true, created_at: createdAt },
  }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const authorization = await authorizeAdminMutation({ allow: canManageOperators });
  if (!authorization.authorized) return authorization.response;

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
  if ('username' in body) {
    if (typeof body.username !== 'string' || body.username.trim().length < 3) {
      return NextResponse.json({ error: 'Invalid username' }, { status: 400 });
    }
    fields.username = body.username.trim().toLowerCase();
  }
  if ('role' in body) {
    if (!ALLOWED_ROLES.has(body.role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }
    fields.role = body.role;
  }
  if ('is_active' in body) {
    if (typeof body.is_active !== 'boolean') {
      return NextResponse.json({ error: 'Invalid active state' }, { status: 400 });
    }
    fields.is_active = body.is_active;
  }

  if (Object.keys(fields).length === 0) {
    return NextResponse.json({ error: 'No supported fields supplied' }, { status: 400 });
  }

  const { data: target } = await supabaseAdmin
    .from('operators')
    .select('id, role')
    .eq('id', id)
    .maybeSingle();

  if (target?.role === 'owner' && (fields.role !== undefined || fields.is_active === false)) {
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
