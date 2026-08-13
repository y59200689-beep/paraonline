export class RequestError extends Error {
  status: number;

  constructor(message: string, status = 0) {
    super(message);
    this.name = 'RequestError';
    this.status = status;
  }
}

type RequestJsonOptions = RequestInit & {
  timeoutMs?: number;
};

export async function requestJson<T>(input: RequestInfo | URL, options: RequestJsonOptions = {}): Promise<T> {
  const { timeoutMs = 12_000, signal, ...init } = options;
  const controller = new AbortController();
  const abortFromCaller = () => controller.abort(signal?.reason);
  signal?.addEventListener('abort', abortFromCaller, { once: true });
  const timeout = window.setTimeout(() => controller.abort('timeout'), timeoutMs);

  try {
    const response = await fetch(input, {
      credentials: 'same-origin',
      cache: 'no-store',
      ...init,
      signal: controller.signal,
    });
    const contentType = response.headers.get('content-type') || '';
    const payload = contentType.includes('application/json')
      ? await response.json().catch(() => null)
      : null;

    if (!response.ok) {
      const message = payload && typeof payload === 'object' && 'error' in payload
        ? String(payload.error)
        : response.status === 403
          ? 'Vous n’avez pas l’autorisation d’effectuer cette action.'
          : response.status === 401
            ? 'Votre session a expiré. Reconnectez-vous.'
            : 'Le service a rencontré une erreur. Réessayez.';
      throw new RequestError(message, response.status);
    }
    return payload as T;
  } catch (error) {
    if (error instanceof RequestError) throw error;
    if (controller.signal.aborted) {
      throw new RequestError('La requête a pris trop de temps. Vérifiez votre connexion et réessayez.', 408);
    }
    throw new RequestError('Impossible de joindre le service. Vérifiez votre connexion et réessayez.');
  } finally {
    window.clearTimeout(timeout);
    signal?.removeEventListener('abort', abortFromCaller);
  }
}
