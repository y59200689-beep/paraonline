// @vitest-environment jsdom
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import ProductsClient from '@/app/products/ProductsClient';
import { normalizeCatalogRouteState, buildCatalogPageHref } from '@/lib/catalog-pagination';
import { getCatalogReturnLocation, rememberCatalogLocation, safeCatalogReturnHref } from '@/lib/catalog-return-location';
import type { Product } from '@/lib/data';
vi.mock('@/context/LanguageContext', () => ({ useTranslation: () => ({ language: 'FR' }) }));
vi.mock('@/context/SettingsContext', () => ({ useSettings: () => ({ settings: {} }) }));
vi.mock('@/context/UiContext', () => ({ useUi: () => ({ diagnostic: null }) }));
vi.mock('@/components/ShopShell', () => ({ ShopShell: ({ children }: { children: React.ReactNode }) => <>{children}</> }));
vi.mock('@/components/ProductCard', () => ({ ProductCard: ({ product }: { product: Product }) => <a href={`/products/${product.id}`}>{product.title}</a> }));
const products: Product[] = [{ id: 1000, title: 'Ecran ACM', price: 100, tags: [], vendor: 'ACM', stock: 10, image: '/fixture.png', images: [], comparePrice: 100, category: 'solaire', rating: 0, reviews: 0, description: 'Synthetic sunscreen', ingredients: '', usage: '' }];
const initialBrands: string[] = [];
const initialConcerns: string[] = [];
const props = {
  initialProducts: products, initialPagination: { total: 1, page: 1, limit: 24, totalPages: 1 },
  catalogFacets: { total: 1, categories: [{ id: 'solaire', count: 1 }], brands: [{ name: 'ACM', count: 1 }] },
  initialCategory: 'all', initialBrands, initialConcerns, routeState: normalizeCatalogRouteState(),
};
beforeEach(() => {
  window.history.replaceState(null, '', '/products'); window.sessionStorage.clear();
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true, products, pagination: props.initialPagination }) }));
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe('catalogue search return navigation', () => {
  it('restores the search after opening a product and going back', async () => {
    const view = render(<ProductsClient {...props} />);
    fireEvent.change(screen.getAllByRole('searchbox')[0], { target: { value: 'ecran' } });
    await waitFor(() => expect(window.location.search).toBe('?search=ecran'));
    const listing = window.location.pathname + window.location.search;
    expect(getCatalogReturnLocation()).toBe(listing);
    expect(screen.getByRole('link', { name: 'Ecran ACM' }).getAttribute('href')).toBe('/products/1000');
    view.unmount(); window.history.pushState(null, '', '/products/1000');
    expect(getCatalogReturnLocation()).toBe('/products?search=ecran');
    window.history.back();
    await waitFor(() => expect(window.location.pathname + window.location.search).toBe(listing));
    const state = normalizeCatalogRouteState(Object.fromEntries(new URLSearchParams(window.location.search)));
    render(<ProductsClient {...props} initialSearch={state.search} routeState={state} />);
    expect(screen.getAllByRole('searchbox')[0].getAttribute('value')).toBe('ecran');
  });
  it('replaces typed queries rather than adding a history step for each letter', () => {
    const replace = vi.spyOn(window.history, 'replaceState'); const push = vi.spyOn(window.history, 'pushState');
    const view = render(<ProductsClient {...props} />);
    for (const value of ['e', 'ec', 'ecran']) fireEvent.change(screen.getAllByRole('searchbox')[0], { target: { value } });
    expect(window.location.search).toBe('?search=ecran'); expect(replace).toHaveBeenCalled(); expect(push).not.toHaveBeenCalled(); view.unmount();
  });
  it('remembers supported filters, sorting, and pagination together', () => {
    const state = normalizeCatalogRouteState({ page: '2', search: 'ecran', category: 'solaire', vendors: 'ACM', sort: 'price-asc', maxPrice: '500', ingredient: 'niacinamide' });
    const href = buildCatalogPageHref(2, state); window.history.replaceState(null, '', href);
    render(<ProductsClient {...props} routeState={state} initialPage={2} initialPagination={{ total: 48, page: 2, limit: 24, totalPages: 2 }} initialSearch={state.search} initialCategory={state.category} initialBrands={state.vendors} initialIngredient={state.ingredient} initialMaxPrice={state.maxPrice} initialSort={state.sort} />);
    expect(getCatalogReturnLocation()).toBe(href); expect(window.location.search).toContain('page=2');
  });
  it('clears the return query when filters are reset', () => {
    const view = render(<ProductsClient {...props} />); fireEvent.change(screen.getAllByRole('searchbox')[0], { target: { value: 'ecran' } });
    fireEvent.click(screen.getByRole('button', { name: 'Réinitialiser les filtres' })); expect(getCatalogReturnLocation()).toBe('/products'); view.unmount();
  });
  it('keeps the browser URL working if session storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    rememberCatalogLocation('/products?search=ecran'); expect(window.location.search).toBe('?search=ecran');
  });
  it.each(['https://evil.example/products', '//evil.example/products', '/products/1000', 'javascript:alert(1)'])('rejects unsafe or non-catalogue return locations: %s', value => {
    expect(safeCatalogReturnHref(value, window.location.origin)).toBeNull();
  });
  it('does not rewrite product URLs when a stale catalogue callback runs', () => {
    window.history.replaceState(null, '', '/products/1000'); rememberCatalogLocation('/products?search=ecran'); expect(window.location.pathname).toBe('/products/1000');
  });
});
