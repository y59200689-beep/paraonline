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
