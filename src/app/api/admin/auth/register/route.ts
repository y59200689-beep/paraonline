import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { hashPasswordAsync } from '@/lib/session';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { authorizeAdminMutation } from '@/lib/admin-authorization';
import { canManageOperators } from '@/lib/permissions';

export async function POST(request: Request) {
  try {
    const authorization = await authorizeAdminMutation({
      allow: canManageOperators,
      forbiddenMessage: 'Accès refusé. Propriétaire uniquement.',
    });
    if (!authorization.authorized) return authorization.response;

    // Rate limit: 5 account registration requests per IP per hour
    const ip = getClientIp(request);
    const { allowed } = await rateLimit(`admin-register:${ip}`, 5, 60 * 60_000);
    if (!allowed) {
      return NextResponse.json({ 
        success: false, 
        error: 'Trop de demandes de création de compte. Veuillez réessayer ultérieurement.' 
      }, { status: 429 });
    }

    const { username, password, name, role } = await request.json();

    if (!username || !password || !name) {
      return NextResponse.json({ 
        success: false, 
        error: 'Le nom complet, le nom d\'utilisateur et le mot de passe sont obligatoires.' 
      }, { status: 400 });
    }

    const cleanUsername = username.trim().toLowerCase();
    if (cleanUsername.length < 3) {
      return NextResponse.json({ 
        success: false, 
        error: 'Le nom d\'utilisateur doit contenir au moins 3 caractères.' 
      }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ 
        success: false, 
        error: 'Le mot de passe doit contenir au moins 6 caractères.' 
      }, { status: 400 });
    }

    // Check if username already exists
    const { data: existingUser } = await supabase
      .from('operators')
      .select('id')
      .eq('username', cleanUsername)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json({ 
        success: false, 
        error: 'Ce nom d\'utilisateur est déjà utilisé. Veuillez en choisir un autre.' 
      }, { status: 400 });
    }

    const newHashedPassword = await hashPasswordAsync(password);
    const opId = `user_${Date.now()}`;
    const selectedRole = ['manager', 'logistician', 'operator'].includes(role) ? role : 'operator';

    // Account created with is_active = false (Requires Owner Approval)
    const newOperator = {
      id: opId,
      username: cleanUsername,
      password: newHashedPassword,
      name: name.trim(),
      role: selectedRole,
      is_active: false,
      created_at: new Date().toISOString()
    };

    const { error: insertError } = await supabase
      .from('operators')
      .insert(newOperator);

    if (insertError) throw insertError;

    // Log administrative request
    const logId = 'log_' + Math.random().toString(36).substring(2, 11);
    await supabase.from('audit_logs').insert({
      id: logId,
      action: 'Demande de Compte Administrateur',
      details: `Nouvelle demande de compte opérateur pour "${name.trim()}" (${cleanUsername}, rôle: ${selectedRole}) depuis l'IP ${ip}. Statut: En attente d'approbation.`,
      date: new Date().toISOString()
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Compte créé avec succès ! Votre compte est actuellement en attente d\'approbation par le propriétaire. Vous pourrez vous connecter dès validation de votre accès.' 
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Erreur serveur lors de la création du compte' 
    }, { status: 500 });
  }
}
