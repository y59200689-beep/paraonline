import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchAtlascomXml } from '@/lib/atlascom-request';

afterEach(() => vi.unstubAllGlobals());
describe('Atlascom supplier request deadlines and retries', () => {
  it('retries a transient network failure once and returns the completed XML', async () => {
    const fetch = vi.fn().mockRejectedValueOnce(new TypeError('private provider details'))
      .mockResolvedValueOnce(new Response('<articles/>'));
    vi.stubGlobal('fetch', fetch);
    expect(await fetchAtlascomXml('https://supplier.test', {}, new AbortController().signal, 1000)).toBe('<articles/>');
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch.mock.calls[1][1].signal).toBeInstanceOf(AbortSignal);
  });
  it('does not retry rejected credentials', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response('', { status: 401 }));
    vi.stubGlobal('fetch', fetch);
    await expect(fetchAtlascomXml('https://supplier.test', {}, new AbortController().signal, 1000)).rejects.toMatchObject({ code: 'HTTP_401' });
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it('retries a temporary supplier gateway failure', async () => {
    const fetch = vi.fn().mockResolvedValueOnce(new Response('', { status: 503 }))
      .mockResolvedValueOnce(new Response('<articles/>'));
    vi.stubGlobal('fetch', fetch);
    expect(await fetchAtlascomXml('https://supplier.test', {}, new AbortController().signal, 1000)).toBe('<articles/>');
    expect(fetch).toHaveBeenCalledTimes(2);
  });
  it('does not start a request after the total run budget expires', async () => {
    const controller = new AbortController(); controller.abort();
    const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
    await expect(fetchAtlascomXml('https://supplier.test', {}, controller.signal, 1000)).rejects.toThrow();
    expect(fetch).not.toHaveBeenCalled();
  });
  it('bounds retries and does not leak raw provider errors', async () => {
    const fetch = vi.fn().mockRejectedValue(new Error('secret-password-and-private-url'));
    vi.stubGlobal('fetch', fetch);
    await expect(fetchAtlascomXml('https://supplier.test', {}, new AbortController().signal, 1000)).rejects.toThrow('Atlascom request failed (Error).');
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
