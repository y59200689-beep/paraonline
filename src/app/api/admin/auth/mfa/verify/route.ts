import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { verifySessionToken, verifyTOTP, createSessionToken } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const { tempToken, code } = await request.json();

    if (!tempToken || !code) {
      return NextResponse.json({ success: false, error: 'Token temporaire et code requis' }, { status: 400 });
    }

    // Decode and verify the temp token
    const payload = verifySessionToken(tempToken);
    if (!payload || !payload.isMfaPending) {
      return NextResponse.json({ success: false, error: 'Session MFA expirée ou invalide. Veuillez vous reconnecter.' }, { status: 401 });
    }

    // Retrieve the operator's secret from the database
    const { data: operator, error } = await supabase
      .from('operators')
      .select('*')
      .eq('id', payload.id)
      .eq('is_active', true)
      .single();

    if (error || !operator) {
      return NextResponse.json({ success: false, error: 'Utilisateur introuvable ou inactif' }, { status: 404 });
    }

    // Verify code: either a 6-digit TOTP code or a recovery code (format XXXX-XXXX or XXXXXXXX)
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
    const codeStr = String(code).trim().toUpperCase();
    const isRecoveryCode = codeStr.length > 6 || codeStr.includes('-');

    let isCodeValid = false;
    let isUsedRecoveryCode = false;

    if (isRecoveryCode) {
      const recoveryCodesStr = operator.mfa_recovery_codes || '';
      const recoveryCodesList = recoveryCodesStr.split(',').map((c: string) => c.trim().toUpperCase()).filter(Boolean);
      const normalizedInput = codeStr.replace(/[^A-Z0-9]/g, '');

      const matchedIndex = recoveryCodesList.findIndex((c: string) => {
        const normalizedCode = c.replace(/[^A-Z0-9]/g, '');
        return normalizedCode === normalizedInput;
      });

      if (matchedIndex !== -1) {
        isCodeValid = true;
        isUsedRecoveryCode = true;

        // Consume recovery code
        recoveryCodesList.splice(matchedIndex, 1);
        const { error: updateErr } = await supabase
          .from('operators')
          .update({ mfa_recovery_codes: recoveryCodesList.join(',') })
          .eq('id', operator.id);
        if (updateErr) throw updateErr;
      }
    } else {
      isCodeValid = verifyTOTP(operator.mfa_secret, codeStr);
    }

    if (!isCodeValid) {
      // Log failed MFA attempt
      const logId = 'log_' + Math.random().toString(36).substring(2, 11);
      await supabase.from('audit_logs').insert({
        id: logId,
        action: 'Connexion échouée',
        details: `Code MFA ${isRecoveryCode ? 'de secours ' : ''}incorrect pour l'utilisateur "${operator.username}" depuis l'IP ${ip}.`,
        date: new Date().toISOString()
      });

      return NextResponse.json({ success: false, error: 'Code de vérification incorrect' }, { status: 401 });
    }

    // Success: Create full session token (without isMfaPending)
    const sessionPayload = {
      id: operator.id,
      username: operator.username,
      role: operator.role,
      name: operator.name
    };

    const token = createSessionToken(sessionPayload);
    const response = NextResponse.json({ success: true, user: sessionPayload });
    response.cookies.set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/'
    });

    // Log successful login
    const logId = 'log_' + Math.random().toString(36).substring(2, 11);
    await supabase.from('audit_logs').insert({
      id: logId,
      action: 'Connexion',
      details: isUsedRecoveryCode 
        ? `Utilisateur "${operator.name}" (${operator.role}) connecté avec succès via un code de secours.`
        : `Utilisateur "${operator.name}" (${operator.role}) connecté avec succès (MFA validé).`,
      date: new Date().toISOString()
    });

    return response;
  } catch (error: any) {
    console.error('MFA verify error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}

