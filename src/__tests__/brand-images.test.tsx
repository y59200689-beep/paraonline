// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { useBrandImages } from '@/hooks/useBrandImages';
import { brandLogoSrc } from '@/lib/brand-logo';

class MockImage {
  static instances: MockImage[] = [];
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  naturalWidth = 100;
  src = '';
  constructor() { MockImage.instances.push(this); }
}
beforeEach(() => {
  MockImage.instances = [];
  vi.stubGlobal('Image', MockImage);
  vi.useFakeTimers();
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.useRealTimers(); });

it('uses the same explicit or automatic image URL as the cards', () => {
  expect(brandLogoSrc('QA', 'qa.com', '/logo.png')).toBe('/logo.png');
  expect(brandLogoSrc('QA', 'qa.com')).toBe('https://logos.hunter.io/qa.com');
  expect(brandLogoSrc('QA Brand')).toBe('https://logos.hunter.io/qabrand.com');
});
it('does no probing until an image filter is selected', () => {
  renderHook(() => useBrandImages(['/a.png'], false));
  expect(MockImage.instances).toHaveLength(0);
});
it('distinguishes loaded images, failures and unresolved timeouts', async () => {
  const { result } = renderHook(() => useBrandImages(['/a', '/b', '/c'], true));
  await act(async () => {
    MockImage.instances[0].onload?.();
    MockImage.instances[1].onerror?.();
    await vi.advanceTimersByTimeAsync(8000);
  });
  expect(result.current).toEqual({ '/a': 'loaded', '/b': 'missing', '/c': 'unknown' });
});
it('deduplicates sources and limits parallel checks to eight', async () => {
  renderHook(() => useBrandImages([...Array.from({ length: 12 }, (_, i) => `/${i}`), '/0'], true));
  expect(MockImage.instances).toHaveLength(8);
  await act(async () => { MockImage.instances[0].onload?.(); });
  expect(MockImage.instances).toHaveLength(9);
});
it('cleans up callbacks and timers on unmount', () => {
  const { unmount } = renderHook(() => useBrandImages(['/a'], true));
  unmount();
  expect(MockImage.instances[0].onload).toBeNull();
  expect(MockImage.instances[0].onerror).toBeNull();
  expect(vi.getTimerCount()).toBe(0);
});
it('checks a replacement logo rather than retaining the old result', async () => {
  const { result, rerender } = renderHook(({ src }) => useBrandImages([src], true), { initialProps: { src: '/old' } });
  await act(async () => { MockImage.instances[0].onerror?.(); });
  rerender({ src: '/new' });
  expect(result.current['/new']).toBeUndefined();
  await act(async () => { MockImage.instances[1].onload?.(); });
  expect(result.current['/new']).toBe('loaded');
});
