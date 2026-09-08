// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
const navigation = vi.hoisted(() => ({ query: '', push: vi.fn() }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: navigation.push }),
  useSearchParams: () => new URLSearchParams(navigation.query),
}));
vi.mock('@/context/AdminContext', () => ({ useAdmin: () => ({ currentUser: { role: 'owner' }, adminTheme: 'light' }) }));
vi.mock('@/lib/request-json', () => ({ requestJson: async () => ({ brands: [
  { id: '1', name: 'SVR', slug: 'svr', status: 'published', is_visible: true, updated_at: '2026-09-08' },
  { id: '2', name: 'Vichy', slug: 'vichy', status: 'draft', is_visible: false, updated_at: '2026-09-08' },
] }) }));
import Page from '@/app/admin/content/brands/page';
beforeEach(() => { navigation.query = ''; navigation.push.mockClear(); });
afterEach(cleanup);

it('changes the URL when selecting a card and preserves other parameters', async () => {
  navigation.query = 'source=admin';
  render(<Page />);
  fireEvent.click(await screen.findByText('SVR'));
  expect(navigation.push).toHaveBeenCalledWith('/admin/content/brands?source=admin&brand=svr', { scroll: false });
});
it('opens a deep link after loading and follows back/forward query changes', async () => {
  navigation.query = 'brand=svr';
  const { rerender } = render(<Page />);
  expect(await screen.findByText('Carte bannière')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Marques' }));
  expect(navigation.push).toHaveBeenCalledWith('/admin/content/brands', { scroll: false });
  navigation.query = '';
  rerender(<Page />);
  expect(screen.getByPlaceholderText('Rechercher une marque…')).toBeTruthy();
  navigation.query = 'brand=vichy';
  rerender(<Page />);
  expect(screen.getByText('Carte bannière')).toBeTruthy();
  expect(screen.getAllByText('/brand/vichy').length).toBeGreaterThan(0);
});
it('reports an unknown brand instead of silently opening the list', async () => {
  navigation.query = 'brand=missing';
  render(<Page />);
  expect(await screen.findByText('Cette marque est introuvable.')).toBeTruthy();
});
