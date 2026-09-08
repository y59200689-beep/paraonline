// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
const navigation = vi.hoisted(() => ({ query: '', push: vi.fn(), logo: undefined as string | undefined }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: navigation.push }),
  useSearchParams: () => new URLSearchParams(navigation.query),
}));
vi.mock('@/context/AdminContext', () => ({ useAdmin: () => ({ currentUser: { role: 'owner' }, adminTheme: 'light' }) }));
vi.mock('@/lib/request-json', () => ({ requestJson: async () => ({ brands: [
  { id: '1', name: 'SVR', slug: 'svr', logo_url: navigation.logo, tagline_fr: 'La peau avant tout', status: 'published', is_visible: true, updated_at: '2026-09-08' },
  { id: '2', name: 'Vichy', slug: 'vichy', status: 'draft', is_visible: false, updated_at: '2026-09-08' },
] }) }));
import Page from '@/app/admin/content/brands/page';
beforeEach(() => { navigation.query = ''; navigation.logo = undefined; navigation.push.mockClear(); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it.each([undefined, '/old-logo.png'])('removes an automatic or uploaded logo (%s), saves it and keeps it removed on reload', async (logo) => {
  navigation.query = 'brand=svr';
  navigation.logo = logo;
  const fetchMock = vi.fn().mockImplementation(async (_url, options) => {
    const payload = JSON.parse(options.body);
    navigation.logo = payload.logo_url;
    return { ok: true, json: async () => ({ brand: { ...payload, slug: 'svr' } }) };
  });
  vi.stubGlobal('fetch', fetchMock);
  const { unmount } = render(<Page />);
  fireEvent.click(await screen.findByRole('button', { name: 'Supprimer le logo' }));
  expect(screen.queryByAltText('Logo')).toBeNull();
  expect(screen.queryByAltText('SVR')).toBeNull();
  expect(fetchMock).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Mettre à jour' }));
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
  expect(JSON.parse(fetchMock.mock.calls[0][1].body).logo_url).toBe('');
  unmount();
  render(<Page />);
  await screen.findByText('Carte bannière');
  expect(screen.queryByAltText('SVR')).toBeNull();
  expect(screen.queryByRole('button', { name: 'Supprimer le logo' })).toBeNull();
});

it('allows uploading a replacement after removing a logo', async () => {
  navigation.query = 'brand=svr';
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ url: '/new-logo.png' }) }));
  render(<Page />);
  fireEvent.click(await screen.findByRole('button', { name: 'Supprimer le logo' }));
  fireEvent.change(screen.getByLabelText('Importer un logo'), { target: { files: [new File(['image'], 'logo.png', { type: 'image/png' })] } });
  await waitFor(() => expect(screen.getByAltText('Logo').getAttribute('src')).toBe('/new-logo.png'));
  expect(screen.getByAltText('SVR').getAttribute('src')).toBe('/new-logo.png');
  expect(screen.getByRole('button', { name: 'Supprimer le logo' })).toBeTruthy();
});

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
