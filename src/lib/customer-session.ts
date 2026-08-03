import { supabase } from '@/lib/supabase';

export class CustomerSessionTimeoutError extends Error {
  constructor() {
    super('La vérification de votre session a pris trop de temps. Actualisez la page ou reconnectez-vous.');
    this.name = 'CustomerSessionTimeoutError';
  }
}

/**
 * Reads the browser session without allowing Supabase's internal auth lock to
 * leave customer screens waiting forever.
 */
export async function getCustomerAccessToken(timeoutMs = 4_000): Promise<string | null> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  try {
    const sessionResult = await Promise.race([
      supabase.auth.getSession(),
      new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => reject(new CustomerSessionTimeoutError()), timeoutMs);
      }),
    ]);
    if (sessionResult.error) throw sessionResult.error;
    return sessionResult.data.session?.access_token || null;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

export function getLocallyTrackedOrderClaims(...storages: Storage[]): Array<{ orderId: string; token: string }> {
  const claims: Array<{ orderId: string; token: string }> = [];
  const seen = new Set<string>();
  for (const storage of storages) {
    for (let index = 0; index < storage.length && claims.length < 20; index += 1) {
      const key = storage.key(index);
      if (!key?.startsWith('orderTrackingToken:')) continue;
      const orderId = key.slice('orderTrackingToken:'.length).trim();
      const token = storage.getItem(key)?.trim() || '';
      if (orderId && token && !seen.has(orderId)) {
        seen.add(orderId);
        claims.push({ orderId, token });
      }
    }
  }
  return claims;
}
