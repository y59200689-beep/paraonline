// @vitest-environment jsdom
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
const state = vi.hoisted(() => ({ push: vi.fn(), pathname: '/' }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: state.push }), usePathname: () => state.pathname }));
vi.mock('@/context/LanguageContext', () => ({ useTranslation: () => ({ language: 'FR', t: (key: string) => key, toggleLanguage: vi.fn() }) }));
vi.mock('@/context/CartContext', () => ({ useCart: () => ({ cart: [], subtotal: 0, addToCart: vi.fn(), setIsCartOpen: vi.fn() }) }));
vi.mock('@/context/CurrencyContext', () => ({ useCurrency: () => ({ convertPrice: String, currentCurrency: {}, selectedCurrency: 'MAD' }) }));
vi.mock('@/context/SettingsContext', () => ({ useSettings: () => ({ settings: {} }) }));
vi.mock('@/context/WishlistContext', () => ({ useWishlist: () => ({ wishlistCount: 0 }) }));
vi.mock('@/context/LoyaltyContext', () => ({ useLoyalty: () => ({ points: 0, clientUser: null }) }));
vi.mock('@/context/UiContext', () => ({ useUi: () => ({ cartJiggleTrigger: 0 }) }));
vi.mock('@/components/BeautyWalletDrawer', () => ({ BeautyWalletDrawer: () => null }));
vi.mock('@/components/Header/TopBar', () => ({ TopBar: () => null }));
vi.mock('@/components/Header/AnnouncementBar', () => ({ AnnouncementBar: () => null }));
vi.mock('@/components/Header/DesktopActions', () => ({ DesktopActions: () => null }));
import { Header } from '@/components/Header';
beforeEach(() => {
  state.push.mockReset(); state.pathname = '/'; window.history.replaceState(null, '', '/');
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true, products: [] }) }));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
const desktop = () => within(screen.getAllByRole('search')[0]);

describe('header catalogue search submission', () => {
  it('makes the desktop search button open matching catalogue results', () => {
    render(<Header />); fireEvent.change(desktop().getByRole('textbox'), { target: { value: 'sdm' } });
    fireEvent.click(desktop().getByRole('button', { name: /^Rechercher$/ }));
    expect(state.push).toHaveBeenCalledWith('/products?search=sdm');
    expect(screen.queryByText('Recherche en cours…')).toBeNull();
  });
  it('supports native form submission (Enter key)', () => {
    render(<Header />); fireEvent.change(desktop().getByRole('textbox'), { target: { value: 'écran acm' } });
    fireEvent.submit(screen.getAllByRole('search')[0]);
    expect(state.push).toHaveBeenCalledWith('/products?search=%C3%A9cran+acm');
  });
  it('preserves the selected category and starts the search on page one', () => {
    state.pathname = '/products'; window.history.replaceState(null, '', '/products?page=10&category=solaire');
    render(<Header />); fireEvent.change(desktop().getByRole('textbox'), { target: { value: 'acm' } });
    fireEvent.click(desktop().getByRole('button', { name: /^Rechercher$/ }));
    expect(state.push).toHaveBeenCalledWith('/products?category=solaire&search=acm');
  });
  it('makes mobile icon and keyboard submission work', () => {
    render(<Header />); const form = screen.getAllByRole('search')[1];
    fireEvent.change(within(form).getByRole('textbox'), { target: { value: 'cerave' } });
    fireEvent.submit(form); expect(state.push).toHaveBeenLastCalledWith('/products?search=cerave');
    fireEvent.click(within(form).getByRole('button', { name: /^Rechercher$/ }));
    expect(state.push).toHaveBeenCalledTimes(2);
  });
  it('clears mobile text without accidentally submitting the form', () => {
    render(<Header />); const form = within(screen.getAllByRole('search')[1]);
    fireEvent.change(form.getByRole('textbox'), { target: { value: 'sdm' } });
    fireEvent.click(form.getByRole('button', { name: 'Effacer la recherche' }));
    expect(state.push).not.toHaveBeenCalled(); expect((form.getByRole('textbox') as HTMLInputElement).value).toBe('');
  });
  it('handles an empty query and encodes search text safely', () => {
    render(<Header />); fireEvent.submit(screen.getAllByRole('search')[0]); expect(state.push).toHaveBeenCalledWith('/products');
    fireEvent.change(desktop().getByRole('textbox'), { target: { value: 'sdm&category=bad' } });
    fireEvent.submit(screen.getAllByRole('search')[0]); expect(state.push).toHaveBeenLastCalledWith('/products?search=sdm+category+bad');
  });
});

it('keeps category navigation and search suggestions mutually exclusive', () => {
  render(<Header />);
  const input = desktop().getByRole('textbox');
  const category = desktop().getByRole('button', { name: /Tous les produits/ });
  fireEvent.change(input, { target: { value: 'sdm' } });
  expect(screen.getAllByText('Recherche en cours…').length).toBeGreaterThan(0);
  fireEvent.click(category);
  expect(category.getAttribute('aria-expanded')).toBe('true');
  expect(screen.queryByText('Recherche en cours…')).toBeNull();
  fireEvent.focus(input);
  expect(category.getAttribute('aria-expanded')).toBe('false');
  expect(screen.getAllByText('Recherche en cours…').length).toBeGreaterThan(0);
});
