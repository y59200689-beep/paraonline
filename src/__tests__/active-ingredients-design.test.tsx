// @vitest-environment jsdom
import React from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ActiveIngredients } from '@/components/ActiveIngredients';
vi.mock('@/context/LanguageContext', () => ({ useTranslation: () => ({ language: 'FR' }) }));
vi.mock('@/components/ProductCard', () => ({
  ProductCard: ({ product, ingredientLayout }: { product: { title: string }; ingredientLayout?: boolean }) =>
    <article data-ingredient-layout={ingredientLayout}>{product.title}</article>,
}));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
it('filters real API results, pages in batches of six, and scopes the card variant', async () => {
  const fetcher = vi.fn(async (url: string) => {
    const params = new URL(url, 'http://localhost').searchParams;
    const page = Number(params.get('page'));
    return { json: async () => ({ success: true, products: [{ id: page, title: params.get('ingredient') + ' page ' + page }], pagination: { total: 12, page, limit: 6, totalPages: 2 } }) };
  });
  vi.stubGlobal('fetch', fetcher);
  render(<ActiveIngredients />);
  expect(await screen.findByText('niacinamide page 1')).toBeTruthy();
  expect(screen.getByRole('link', { name: 'Voir tous les produits — Niacinamide' }).getAttribute('href')).toBe('/products?ingredient=niacinamide');
  expect(screen.getByRole('article').getAttribute('data-ingredient-layout')).toBe('true');
  expect(screen.getByRole('button', { name: 'Lot précédent' }).hasAttribute('disabled')).toBe(true);
  fireEvent.click(screen.getByRole('button', { name: 'Lot suivant' }));
  expect(await screen.findByText('niacinamide page 2')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Vitamine C' }));
  expect(await screen.findByText('vitamine c page 1')).toBeTruthy();
  expect(screen.getByRole('link', { name: 'Voir tous les produits — Vitamine C' }).getAttribute('href')).toBe('/products?ingredient=vitamine%20c');
  expect(screen.getByRole('button', { name: 'Vitamine C' }).getAttribute('aria-pressed')).toBe('true');
  await waitFor(() => expect(screen.getByRole('status').textContent).toBe('Lot 1 / 2'));
  expect(fetcher.mock.calls.every(([url]) => new URL(url, 'http://localhost').searchParams.get('limit') === '6')).toBe(true);
});
