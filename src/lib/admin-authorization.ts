import { NextResponse } from 'next/server';
import type { AdminRole } from '@/lib/permissions';
import { isViewerOnly } from '@/lib/permissions';
import { verifyAdminSession } from '@/lib/session';
import { supabaseAdmin as supabase } from '@/lib/supabase';

export type CurrentAdminOperator = {
  id: string;
  name: string;
  username: string;
  role: AdminRole;
};

type MutationAuthorizationOptions = {
  allow?: (role: AdminRole) => boolean;
  forbiddenMessage?: string;
};

export type MutationAuthorizationResult =
  | { authorized: true; operator: CurrentAdminOperator }
  | { authorized: false; response: NextResponse };

/**
 * Resolves the signed session identity to its active, current database record.
 * Self-service account-security routes use this without imposing a business-role
 * permission check; administrative mutations should use authorizeAdminMutation.
 */
export async function getCurrentAdminOperator(): Promise<MutationAuthorizationResult> {
  const session = await verifyAdminSession();
  if (!session?.id) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: 'Accès non autorisé' },
        { status: 401 },
      ),
    };
  }

  const { data: operator, error } = await supabase
    .from('operators')
    .select('id, name, username, role, is_active')
    .eq('id', session.id)
    .maybeSingle();

  if (error || !operator || operator.is_active !== true) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: 'Session invalide ou utilisateur désactivé' },
        { status: 401 },
      ),
    };
  }

  return {
    authorized: true,
    operator: {
      id: String(operator.id),
      name: String(operator.name || ''),
      username: String(operator.username || ''),
      role: operator.role as AdminRole,
    },
  };
}

/**
 * Authorizes an administrative mutation against the operator's current DB state.
 * The signed cookie establishes identity; the database remains authoritative for
 * account activity and role changes made after that cookie was issued.
 */
export async function authorizeAdminMutation(
  options: MutationAuthorizationOptions = {},
): Promise<MutationAuthorizationResult> {
  const current = await getCurrentAdminOperator();
  if (!current.authorized) return current;
  const currentOperator = current.operator;

  if (isViewerOnly(currentOperator.role) || (options.allow && !options.allow(currentOperator.role))) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: options.forbiddenMessage || 'Accès refusé' },
        { status: 403 },
      ),
    };
  }

  return { authorized: true, operator: currentOperator };
}
