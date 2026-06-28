import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Accès non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { userId } = body;

    let targetId = session.id;
    let targetName = session.name;

    // If Owner is trying to disable MFA for another operator
    if (userId && userId !== session.id) {
      if (session.role !== 'owner') {
        return NextResponse.json({ success: false, error: 'Seul le propriétaire peut désactiver le MFA des autres utilisateurs' }, { status: 403 });
      }
      
      const { data: operator, error: fetchErr } = await supabase
        .from('operators')
        .select('name')
        .eq('id', userId)
        .single();
      
      if (fetchErr || !operator) {
        return NextResponse.json({ success: false, error: 'Utilisateur introuvable' }, { status: 404 });
      }

      targetId = userId;
      targetName = operator.name;
    }

    // Disable in database
    const { error } = await supabase
      .from('operators')
      .update({
        mfa_secret: null,
        mfa_enabled: false
      })
      .eq('id', targetId);

    if (error) throw error;

    // Log the event
    const logId = 'log_' + Math.random().toString(36).substring(2, 11);
    await supabase.from('audit_logs').insert({
      id: logId,
      action: 'MFA Désactivé',
      details: `Double authentification (MFA) désactivée pour "${targetName}" par "${session.name}".`,
      date: new Date().toISOString()
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}
