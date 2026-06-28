import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { verifyAdminSession, verifySessionToken, verifyTOTP, createSessionToken, generateRecoveryCodes } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { secret, code, tempToken } = body;

    if (!secret || !code) {
      return NextResponse.json({ success: false, error: 'Secret et code requis' }, { status: 400 });
    }

    // ----- MODE A: Setup-during-login -----
    // A tempToken with isMfaSetupRequired claim was issued at login time.
    // The operator has no session cookie yet; we verify the temp token instead.
    if (tempToken) {
      const tempPayload = verifySessionToken(tempToken);
      if (!tempPayload || !tempPayload.isMfaSetupRequired) {
        return NextResponse.json({ success: false, error: 'Token temporaire invalide ou expiré' }, { status: 401 });
      }

      // Verify TOTP code
      const isValid = verifyTOTP(secret, code);
      if (!isValid) {
        return NextResponse.json({ success: false, error: 'Code de vérification incorrect' }, { status: 400 });
      }

      // Generate recovery codes
      const recoveryCodes = generateRecoveryCodes(8);

      // Enable MFA in database
      const { error } = await supabase
        .from('operators')
        .update({ 
          mfa_secret: secret, 
          mfa_enabled: true,
          mfa_recovery_codes: recoveryCodes.join(',')
        })
        .eq('id', tempPayload.id);
      if (error) throw error;

      // Log
      const logId = 'log_' + Math.random().toString(36).substring(2, 11);
      await supabase.from('audit_logs').insert({
        id: logId,
        action: 'MFA Activé (Obligatoire)',
        details: `MFA configuré et activé obligatoirement pour l'opérateur "${tempPayload.name}" (${tempPayload.role}).`,
        date: new Date().toISOString()
      });

      // Create a full session for the operator
      const sessionPayload = {
        id: tempPayload.id,
        username: tempPayload.username,
        role: tempPayload.role,
        name: tempPayload.name
      };
      const sessionToken = createSessionToken(sessionPayload);
      const response = NextResponse.json({ success: true, user: sessionPayload, recoveryCodes });
      response.cookies.set('admin_session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60,
        path: '/'
      });
      return response;
    }

    // ----- MODE B: Standard in-settings MFA enable -----
    // Operator is already logged in via cookie session.
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Accès non autorisé' }, { status: 401 });
    }

    // Verify TOTP code
    const isValid = verifyTOTP(secret, code);
    if (!isValid) {
      return NextResponse.json({ success: false, error: 'Code de vérification incorrect' }, { status: 400 });
    }

    // Generate recovery codes
    const recoveryCodes = generateRecoveryCodes(8);

    // Enable in database
    const { error } = await supabase
      .from('operators')
      .update({ 
        mfa_secret: secret, 
        mfa_enabled: true,
        mfa_recovery_codes: recoveryCodes.join(',')
      })
      .eq('id', session.id);
    if (error) throw error;

    // Log the event
    const logId = 'log_' + Math.random().toString(36).substring(2, 11);
    await supabase.from('audit_logs').insert({
      id: logId,
      action: 'MFA Activé',
      details: `Double authentification (MFA) activée par l'utilisateur "${session.name}".`,
      date: new Date().toISOString()
    });

    return NextResponse.json({ success: true, recoveryCodes });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}

