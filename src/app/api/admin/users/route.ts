import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { verifyAdminSession, hashPassword } from '@/lib/session';

export async function GET(request: Request) {
  try {
    const session = await verifyAdminSession();

    if (!session || session.role !== 'owner') {
      return NextResponse.json({ success: false, error: 'Accès refusé. Propriétaire uniquement.' }, { status: 403 });
    }

    const { data: operators, error } = await supabase
      .from('operators')
      .select('id, username, name, role, created_at, is_active')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formatted = operators.map((op: any) => ({
      id: op.id,
      username: op.username,
      name: op.name,
      role: op.role,
      createdAt: op.created_at,
      isActive: op.is_active
    }));

    return NextResponse.json({ success: true, users: formatted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await verifyAdminSession();

    if (!session || session.role !== 'owner') {
      return NextResponse.json({ success: false, error: 'Accès refusé. Propriétaire uniquement.' }, { status: 403 });
    }

    const body = await request.json();
    const { username, password, name, role, action, userId, isActive } = body;

    // Check if toggle active status action
    if (action === 'toggle-active') {
      if (username === 'admin') {
        return NextResponse.json({ success: false, error: "Impossible de désactiver l'administrateur principal" }, { status: 400 });
      }
      
      const { data: op, error } = await supabase
        .from('operators')
        .update({ is_active: isActive })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ 
        success: true, 
        user: {
          id: op.id,
          username: op.username,
          name: op.name,
          role: op.role,
          createdAt: op.created_at,
          isActive: op.is_active
        } 
      });
    }

    // Check if reset password action
    if (action === 'reset-password') {
      if (!userId || !password) {
        return NextResponse.json({ success: false, error: 'User ID et mot de passe requis' }, { status: 400 });
      }

      const { data: op, error } = await supabase
        .from('operators')
        .update({ password: hashPassword(password) })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      // Log the event
      const logId = 'log_' + Math.random().toString(36).substring(2, 11);
      await supabase.from('audit_logs').insert({
        id: logId,
        action: 'Mot de passe réinitialisé',
        details: `Mot de passe de l'opérateur "${op.name}" réinitialisé par le propriétaire "${session.name}".`,
        date: new Date().toISOString()
      });

      return NextResponse.json({ success: true });
    }

    // Normal creation
    if (!username || !password || !name || !role) {
      return NextResponse.json({ success: false, error: 'Tous les champs sont requis' }, { status: 400 });
    }

    const { data: existingUser } = await supabase
      .from('operators')
      .select('id')
      .eq('username', username.toLowerCase())
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json({ success: false, error: "Ce nom d'utilisateur est déjà pris" }, { status: 400 });
    }

    const opId = `user_${Date.now()}`;
    const newOperator = {
      id: opId,
      username: username.toLowerCase(),
      password: hashPassword(password),
      name,
      role,
      created_at: new Date().toISOString(),
      is_active: true
    };

    const { error: insertError } = await supabase
      .from('operators')
      .insert(newOperator);

    if (insertError) throw insertError;

    return NextResponse.json({ 
      success: true, 
      user: {
        id: newOperator.id,
        username: newOperator.username,
        name: newOperator.name,
        role: newOperator.role,
        createdAt: newOperator.created_at,
        isActive: newOperator.is_active
      } 
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}
