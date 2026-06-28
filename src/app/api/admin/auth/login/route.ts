import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { hashPassword, hashPasswordAsync, verifyPassword, createSessionToken } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ success: false, error: 'Identifiants requis' }, { status: 400 });
    }

    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';

    // 1. Brute-force protection: check failed attempts in the last 15 minutes
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const { data: recentAttempts } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('action', 'Connexion échouée')
      .gt('date', fifteenMinutesAgo);

    const failedAttemptsCount = recentAttempts 
      ? recentAttempts.filter((log: any) => 
          log.details.includes(ip) || log.details.includes(username.toLowerCase())
        ).length 
      : 0;

    if (failedAttemptsCount >= 5) {
      return NextResponse.json({ 
        success: false, 
        error: 'Trop de tentatives de connexion. Accès bloqué pendant 15 minutes.' 
      }, { status: 429 });
    }

    // 2. Query operator in Supabase
    const { data: operator, error } = await supabase
      .from('operators')
      .select('*')
      .eq('username', username.toLowerCase())
      .eq('is_active', true)
      .single();

    if (error || !operator) {
      // Log failed attempt
      const logId = 'log_' + Math.random().toString(36).substring(2, 11);
      await supabase.from('audit_logs').insert({
        id: logId,
        action: 'Connexion échouée',
        details: `Identifiants incorrects pour "${username}" depuis l'IP ${ip}.`,
        date: new Date().toISOString()
      });

      return NextResponse.json({ success: false, error: "Nom d'utilisateur ou mot de passe incorrect" }, { status: 401 });
    }

    let isPasswordCorrect = false;
    let needsMigration = false;

    // Check password using the new timing-safe async verifier (supports scrypt + legacy SHA-256)
    isPasswordCorrect = await verifyPassword(password, operator.password);

    // If verified and stored as legacy plain-text (not a hash), also migrate
    const isHashedOrScrypt = /^[a-f0-9]{64}$/.test(operator.password) || operator.password.includes(':');
    if (isPasswordCorrect && !isHashedOrScrypt) {
      needsMigration = true;
    }

    if (!isPasswordCorrect) {
      // Log failed attempt
      const logId = 'log_' + Math.random().toString(36).substring(2, 11);
      await supabase.from('audit_logs').insert({
        id: logId,
        action: 'Connexion échouée',
        details: `Mot de passe incorrect pour "${username}" depuis l'IP ${ip}.`,
        date: new Date().toISOString()
      });

      return NextResponse.json({ success: false, error: "Nom d'utilisateur ou mot de passe incorrect" }, { status: 401 });
    }

    // Auto-migrate operator password to scrypt format
    if (needsMigration) {
      try {
        const newHash = await hashPasswordAsync(password);
        await supabase
          .from('operators')
          .update({ password: newHash })
          .eq('id', operator.id);
      } catch (err) {
        console.error('Failed to auto-migrate operator password in Supabase:', err);
      }
    }

    // 3a. Fetch MFA enforcement policy from settings
    let mfaEnforcedRoles: string[] = [];
    try {
      const { data: settingsRow } = await supabase
        .from('settings')
        .select('value')
        .eq('id', 1)
        .single();
      if (settingsRow?.value?.mfaEnforcedRoles) {
        mfaEnforcedRoles = settingsRow.value.mfaEnforcedRoles;
      }
    } catch (e) {
      // Non-fatal — if settings unavailable, skip enforcement
    }

    const mfaEnabled = operator.mfa_enabled === true && !!operator.mfa_secret;
    const isRoleEnforced = mfaEnforcedRoles.includes(operator.role);

    // 3b. If MFA is enabled → require OTP verification step
    if (mfaEnabled) {
      const tempPayload = {
        id: operator.id,
        username: operator.username,
        role: operator.role,
        name: operator.name,
        isMfaPending: true
      };
      // Short-lived temporary token
      const tempToken = createSessionToken(tempPayload, 5 * 60 * 1000);
      return NextResponse.json({ 
        success: true, 
        requiresMfa: true, 
        tempToken 
      });
    }

    // 3c. If MFA is enforced for this role but not yet configured → require setup
    if (isRoleEnforced && !mfaEnabled) {
      const tempPayload = {
        id: operator.id,
        username: operator.username,
        role: operator.role,
        name: operator.name,
        isMfaSetupRequired: true
      };
      const tempToken = createSessionToken(tempPayload, 15 * 60 * 1000); // 15 min to complete setup
      return NextResponse.json({
        success: true,
        requiresMfaSetup: true,
        tempToken
      });
    }

    // Normal successful login (No MFA)
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

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}
