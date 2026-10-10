// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { AnimatedPrice } from '@/components/cart/AnimatedPrice';
import DiagnosticCataloguePage from '@/app/admin/experience/diagnostic/catalogue/page';

vi.mock('@/context/AdminContext', () => ({ useAdmin: () => ({ adminTheme: 'light' }) }));
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.useRealTimers(); });

it('finishes price animations without restarting on every displayed frame', () => {
  const callbacks = new Map<number, FrameRequestCallback>();
  let id = 0;
  vi.spyOn(performance, 'now').mockReturnValue(0);
  const request = vi.fn((callback: FrameRequestCallback) => { callbacks.set(++id, callback); return id; });
  vi.stubGlobal('requestAnimationFrame', request);
  vi.stubGlobal('cancelAnimationFrame', (key: number) => callbacks.delete(key));
  const { rerender } = render(<AnimatedPrice value={100} />);
  rerender(<AnimatedPrice value={200} />);
  act(() => { callbacks.get(1)!(175); });
  expect(screen.getByText('175.00 DH')).toBeDefined();
  expect(request).toHaveBeenCalledTimes(2);
  rerender(<AnimatedPrice value={300} />);
  act(() => { callbacks.get(3)!(350); });
  expect(screen.getByText('300.00 DH')).toBeDefined();
  expect(request).toHaveBeenCalledTimes(3);
});

it('debounces diagnostic catalogue search and cancels pending work on unmount', async () => {
  vi.useFakeTimers();
  const fetch = vi.fn().mockResolvedValue({ json: async () => ({ products: [], total: 0 }) });
  vi.stubGlobal('fetch', fetch);
  const { unmount } = render(<DiagnosticCataloguePage />);
  await act(async () => {});
  fetch.mockClear();
  const input = screen.getByPlaceholderText('Rechercher un produit, marque, catégorie…');
  fireEvent.change(input, { target: { value: 'cream' } });
  await act(async () => { vi.advanceTimersByTime(200); });
  expect(fetch).not.toHaveBeenCalled();
  fireEvent.change(input, { target: { value: 'serum' } });
  await act(async () => { vi.advanceTimersByTime(400); });
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(fetch.mock.calls[0][0]).toContain('search=serum');
  fireEvent.change(input, { target: { value: 'pending' } });
  unmount();
  await act(async () => { vi.advanceTimersByTime(400); });
  expect(fetch).toHaveBeenCalledTimes(1);
});
