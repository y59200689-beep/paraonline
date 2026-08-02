export function customerAuthErrorMessage(message: string): string {
  const normalized = String(message || '').toLowerCase();

  if (
    normalized.includes('security purposes') ||
    normalized.includes('rate limit') ||
    normalized.includes('over_email_send_rate_limit')
  ) {
    const seconds = message.match(/after\s+(\d+)\s+seconds?/i)?.[1];
    return `Un email de confirmation a déjà été demandé. Vérifiez votre boîte de réception et vos spams${
      seconds ? `, ou réessayez dans ${seconds} secondes` : ', ou patientez une minute avant de réessayer'
    }.`;
  }

  if (normalized.includes('already registered') || normalized.includes('already exists')) {
    return 'Cette adresse email possède déjà un compte. Utilisez plutôt « Se connecter ».';
  }

  if (normalized.includes('email not confirmed')) {
    return 'Votre compte existe, mais votre adresse email doit encore être confirmée. Consultez votre boîte de réception et vos spams.';
  }

  if (normalized.includes('invalid login credentials')) {
    return 'Adresse email ou mot de passe incorrect.';
  }

  return message || 'Une erreur est survenue. Veuillez réessayer.';
}

type CustomerIdentitySource = {
  id: string;
  email?: string | null;
  name?: string | null;
  phone?: string | null;
  user_metadata?: Record<string, unknown> | null;
};

export type ResolvedCustomerIdentity = {
  id: string;
  email: string;
  name?: string;
  phone?: string;
};

function cleanIdentityValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

export function resolveCustomerIdentity(
  user: CustomerIdentitySource,
  profile?: Partial<CustomerIdentitySource> | null,
  cached?: Partial<CustomerIdentitySource> | null,
): ResolvedCustomerIdentity {
  const metadata = user.user_metadata || {};
  const cachedMatchesUser = !cached?.id || cached.id === user.id;

  return {
    id: user.id,
    email:
      cleanIdentityValue(profile?.email) ||
      cleanIdentityValue(user.email) ||
      (cachedMatchesUser ? cleanIdentityValue(cached?.email) : undefined) ||
      '',
    name:
      cleanIdentityValue(profile?.name) ||
      cleanIdentityValue(metadata.name) ||
      cleanIdentityValue(metadata.full_name) ||
      cleanIdentityValue(metadata.display_name) ||
      (cachedMatchesUser ? cleanIdentityValue(cached?.name) : undefined),
    phone:
      cleanIdentityValue(profile?.phone) ||
      cleanIdentityValue(metadata.phone) ||
      (cachedMatchesUser ? cleanIdentityValue(cached?.phone) : undefined),
  };
}
