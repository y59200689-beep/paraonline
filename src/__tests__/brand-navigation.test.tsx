// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
const navigation = vi.hoisted(() => ({ query: '', push: vi.fn() }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: navigation.push }),
  useSearchParams: () => new URLSearchParams(navigation.query),
}));
vi.mock('@/context/AdminContext', () => ({ useAdmin: () => ({ currentUser: { role: 'owner' }, adminTheme: 'light' }) }));
vi.mock('@/lib/request-json', () => ({ requestJson: async () => ({ brands: [
  { id: '1', name: 'SVR', slug: 'svr', tagline_fr: 'La peau avant tout', status: 'published', is_visible: true, updated_at: '2026-09-08' },
  { id: '2', name: 'Vichy', slug: 'vichy', status: 'draft', is_visible: false, updated_at: '2026-09-08' },
] }) }));
import Page from '@/app/admin/content/brands/page';
beforeEach(() => { navigation.query = ''; navigation.push.mockClear(); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it('opens the brand exactly once from the name, description, footer, or card padding', async () => {
  render(<Page />);
  const open = await screen.findByRole('button', { name: 'Ouvrir SVR' });
  const card = open.parentElement!;
  for (const target of [open, within(card).getByText('La peau avant tout'), within(card).getByText('Publié'), card]) {
    navigation.push.mockClear();
    fireEvent.click(target);
    expect(navigation.push).toHaveBeenCalledTimes(1);
    expect(navigation.push).toHaveBeenCalledWith('/admin/content/brands?brand=svr', { scroll: false });
  }
});

it('keeps visibility and delete actions separate from opening the card', async () => {
  const fetchMock = vi.fn().mockResolvedValue({ ok: true });
  vi.stubGlobal('fetch', fetchMock);
  const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
  render(<Page />);
  const card = (await screen.findByRole('button', { name: 'Ouvrir SVR' })).parentElement!;
  fireEvent.click(within(card).getByTitle('Masquer sur le site'));
  expect(fetchMock).toHaveBeenCalledTimes(1);
  fireEvent.click(within(card).getByTitle('Supprimer la marque'));
  expect(confirm).toHaveBeenCalledTimes(1);
  expect(navigation.push).not.toHaveBeenCalled();
});

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
