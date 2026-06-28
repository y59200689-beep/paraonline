import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { verifyAdminSession, hashPassword } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Accès non autorisé' }, { status: 401 });
    }

    const { oldPassword, newPassword } = await request.json();
    if (!oldPassword || !newPassword) {
      return NextResponse.json({ success: false, error: 'Ancien et nouveau mot de passe requis' }, { status: 400 });
    }

    // Retrieve operator details
    const { data: operator, error: fetchErr } = await supabase
      .from('operators')
      .select('*')
      .eq('id', session.id)
      .single();

    if (fetchErr || !operator) {
      return NextResponse.json({ success: false, error: 'Utilisateur introuvable' }, { status: 404 });
    }

    // Check old password
    let isOldCorrect = false;
    const isHashed = /^[a-f0-9]{64}$/i.test(operator.password);
    if (isHashed) {
      isOldCorrect = operator.password === hashPassword(oldPassword);
    } else {
      isOldCorrect = operator.password === oldPassword;
    }

    if (!isOldCorrect) {
      return NextResponse.json({ success: false, error: 'Ancien mot de passe incorrect' }, { status: 400 });
    }

    // Update in database
    const { error: updateErr } = await supabase
      .from('operators')
      .update({ password: hashPassword(newPassword) })
      .eq('id', session.id);

    if (updateErr) throw updateErr;

    // Log the event
    const logId = 'log_' + Math.random().toString(36).substring(2, 11);
    await supabase.from('audit_logs').insert({
      id: logId,
      action: 'Mot de passe modifié',
      details: `Mot de passe réinitialisé personnellement par "${session.name}".`,
      date: new Date().toISOString()
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}
