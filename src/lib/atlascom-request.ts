/** Supplier reads can be slow; bound each attempt and retry transient failures once. */
export async function fetchAtlascomXml(
  url: string,
  options: RequestInit,
  runSignal: AbortSignal,
  timeoutMs: number,
): Promise<string> {
  let failure = 'NETWORK_ERROR';
  for (let attempt = 1; attempt <= 2; attempt++) {
    runSignal.throwIfAborted();
    try {
      const response = await fetch(url, {
        ...options,
        cache: 'no-store',
        signal: AbortSignal.any([runSignal, AbortSignal.timeout(timeoutMs)]),
      });
      if (response.ok) return await response.text();
      failure = `HTTP_${response.status}`;
      await response.body?.cancel();
      if (![408, 429, 502, 503, 504].includes(response.status)) break;
    } catch (error) {
      const value = error as { name?: string; cause?: { code?: string } };
      const code = value.cause?.code || value.name || 'NETWORK_ERROR';
      failure = /^[A-Z_a-z0-9]{1,64}$/.test(code) ? code : 'NETWORK_ERROR';
    }
    console.warn(JSON.stringify({ integration: 'atlascom', attempt, failure }));
  }
  throw Object.assign(new Error(`Atlascom request failed (${failure}).`), { code: failure });
}
