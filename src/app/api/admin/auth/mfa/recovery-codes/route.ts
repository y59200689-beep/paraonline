import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { verifyAdminSession, generateRecoveryCodes } from '@/lib/session';

export async function GET() {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Accès non autorisé' }, { status: 401 });
    }

    const { data: operator, error } = await supabase
      .from('operators')
      .select('mfa_recovery_codes')
      .eq('id', session.id)
      .eq('is_active', true)
      .single();

    if (error || !operator) {
      return NextResponse.json({ success: false, error: 'Opérateur introuvable' }, { status: 404 });
    }

    const codesStr = operator.mfa_recovery_codes || '';
    const recoveryCodes = codesStr.split(',').map((c: string) => c.trim()).filter(Boolean);

    return NextResponse.json({
      success: true,
      recoveryCodes
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST() {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Accès non autorisé' }, { status: 401 });
    }

    const recoveryCodes = generateRecoveryCodes(8);

    const { error } = await supabase
      .from('operators')
      .update({ mfa_recovery_codes: recoveryCodes.join(',') })
      .eq('id', session.id);

    if (error) throw error;

    // Log the event
    const logId = 'log_' + Math.random().toString(36).substring(2, 11);
    await supabase.from('audit_logs').insert({
      id: logId,
      action: 'MFA Codes Régénérés',
      details: `Codes de secours MFA régénérés par l'utilisateur "${session.name}".`,
      date: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      recoveryCodes
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}
