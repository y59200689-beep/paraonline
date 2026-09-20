// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { useBrandImages } from '@/hooks/useBrandImages';
import { brandLogoSrc } from '@/lib/brand-logo';
import { BrandLogoCard } from '@/components/BrandLogoCard';
import logoBounds from '@/lib/brand-logo-bounds.json';

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
  expect(brandLogoSrc('QA', 'qa.com', '')).toBe('');
  expect(brandLogoSrc('QA', 'qa.com', null)).toBe('https://logos.hunter.io/qa.com');
});
it('shows the brand name instead of falling back after explicit removal', () => {
  render(<BrandLogoCard brand={{ name: 'QA', domain: 'qa.com', logo_url: '', logoUrl: '/old.png' }} />);
  expect(screen.queryByRole('img')).toBeNull();
  expect(screen.getByText('QA')).toBeTruthy();
});
it('uses a bundled official logo for known brands and a readable fallback on failure', () => {
  render(<BrandLogoCard brand={{ name: 'CeraVe', domain: 'cerave.com', logo_url: '' }} />);
  expect(screen.getByRole('img').getAttribute('src')).toBe('/images/brands/cerave-official.svg');
  fireEvent.error(screen.getByRole('img'));
  expect(screen.queryByRole('img')).toBeNull();
  expect(screen.getByText('CeraVe')).toBeTruthy();
});
it('fits visible artwork inside the same frame without stretching the source', () => {
  render(<BrandLogoCard brand={{ name: 'La Roche-Posay', domain: 'laroche-posay.com' }} />);
  const img = screen.getByRole('img');
  const frame = img.parentElement!;
  expect(parseFloat(frame.style.width)).toBeLessThanOrEqual(128);
  expect(parseFloat(frame.style.height)).toBeLessThanOrEqual(44);
  expect(img.style.width).toBe(img.style.height); // Original canvas remains square.
  expect(parseFloat(img.style.top)).toBeLessThan(0); // Blank top margin is compensated.
});
it('has valid nonempty artwork bounds within every measured source', () => {
  for (const [width, height, left, top, artworkWidth, artworkHeight] of Object.values(logoBounds)) {
    expect(artworkWidth).toBeGreaterThan(0);
    expect(artworkHeight).toBeGreaterThan(0);
    expect(left).toBeGreaterThanOrEqual(0);
    expect(top).toBeGreaterThanOrEqual(0);
    expect(left + artworkWidth).toBeLessThanOrEqual(width);
    expect(top + artworkHeight).toBeLessThanOrEqual(height);
  }
});
it('classifies removed logos as missing without requesting an empty URL', () => {
  const { result } = renderHook(() => useBrandImages([''], true));
  expect(result.current['']).toBe('missing');
  expect(MockImage.instances).toHaveLength(0);
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
