// @vitest-environment jsdom
import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CatalogPagination } from '@/components/catalog/CatalogPagination';
import {
  applyCatalogSort,
  buildCatalogPageHref,
  catalogCanonicalHref,
  catalogPageRange,
  catalogSortOrders,
  normalizeCatalogRouteState,
} from '@/lib/catalog-pagination';

vi.mock('next/link', () => ({
  default: ({ href, children, prefetch, ...props }: React.PropsWithChildren<{ href: string; prefetch?: boolean; [key: string]: unknown }>) => {
    void prefetch;
    return <a href={href} {...props}>{children}</a>;
  },
}));

afterEach(cleanup);

describe('catalog pagination URLs and ranges', () => {
  it('normalizes direct page URLs while retaining supported filters and sorting', () => {
    const state = normalizeCatalogRouteState({
      page: '3',
      category: 'visage',
      vendors: 'La Roche-Posay,Vichy',
      concern: 'spots',
      ingredient: 'vitamine c',
      search: 'sérum éclat',
      maxPrice: '750',
      sort: 'price-asc',
    });

    expect(state).toMatchObject({
      page: 3,
      category: 'visage',
      vendors: ['La Roche-Posay', 'Vichy'],
      concern: 'spots',
      ingredient: 'vitamine c',
      search: 'sérum éclat',
      maxPrice: 750,
      sort: 'price-asc',
    });
  });

  it('creates compact page URLs and carries the active filter and sort state', () => {
    const state = normalizeCatalogRouteState({
      category: 'visage',
      vendors: 'Vichy,La Roche-Posay',
      concern: 'spots',
      search: 'sérum éclat',
      maxPrice: '750',
      sort: 'rating',
    });

    expect(buildCatalogPageHref(1, state)).toBe(
      '/products?category=visage&vendors=Vichy%2CLa+Roche-Posay&concern=spots&search=s%C3%A9rum+%C3%A9clat&maxPrice=750&sort=rating',
    );
    expect(buildCatalogPageHref(2, normalizeCatalogRouteState())).toBe('/products?page=2');
  });

  it('uses a distinct canonical for each meaningful page while normalizing page one', () => {
    const pageOne = normalizeCatalogRouteState({ page: '1' });
    const pageTwo = normalizeCatalogRouteState({ page: '2' });
    expect(catalogCanonicalHref(pageOne)).toBe('/products');
    expect(catalogCanonicalHref(pageTwo)).toBe('/products?page=2');
  });

  it('clamps invalid page and sort values to safe defaults', () => {
    expect(normalizeCatalogRouteState({ page: '-5', sort: 'unknown', category: '<script>' })).toMatchObject({
      page: 1,
      sort: 'popular',
      category: 'all',
    });
  });

  it('preserves the former stock-prioritized default order', () => {
    expect(normalizeCatalogRouteState().sort).toBe('popular');
    expect(catalogSortOrders('popular')).toEqual([
      { column: 'stock', ascending: false },
      { column: 'title', ascending: true },
      { column: 'id', ascending: true },
    ]);
    expect(buildCatalogPageHref(2, normalizeCatalogRouteState())).toBe('/products?page=2');
    expect(buildCatalogPageHref(2, normalizeCatalogRouteState({ sort: 'alphabetical' })))
      .toBe('/products?page=2&sort=alphabetical');
  });

  it('creates adjacent, non-overlapping product ranges across consecutive pages', () => {
    const ranges = [1, 2, 3].map(page => catalogPageRange(page, 24));
    expect(ranges).toEqual([
      { from: 0, to: 23 },
      { from: 24, to: 47 },
      { from: 48, to: 71 },
    ]);
    expect(ranges[0].to + 1).toBe(ranges[1].from);
    expect(ranges[1].to + 1).toBe(ranges[2].from);
  });

  it('uses stable tie-breakers for every supported ordering', () => {
    expect(catalogSortOrders('alphabetical')).toEqual([
      { column: 'title', ascending: true },
      { column: 'id', ascending: true },
    ]);
    expect(catalogSortOrders('price-asc').map(order => order.column)).toEqual(['price', 'title', 'id']);
    expect(catalogSortOrders('price-desc').map(order => order.column)).toEqual(['price', 'title', 'id']);
    expect(catalogSortOrders('rating').map(order => order.column)).toEqual(['rating', 'title', 'id']);

    const recorded: Array<{ column: string; ascending: boolean }> = [];
    const query = {
      order(column: string, options: { ascending: boolean }) {
        recorded.push({ column, ascending: options.ascending });
        return this;
      },
    };
    expect(applyCatalogSort(query, 'price-desc')).toBe(query);
    expect(recorded.map(order => order.column)).toEqual(['price', 'title', 'id']);
  });

  it('renders real links for adjacent and nearby pages with filter state preserved', () => {
    const routeState = normalizeCatalogRouteState({
      page: '2',
      category: 'visage',
      vendors: 'Vichy',
      search: 'serum',
      sort: 'price-asc',
    });

    render(
      <CatalogPagination
        pagination={{ total: 120, page: 2, limit: 24, totalPages: 5 }}
        routeState={routeState}
        language="FR"
      />,
    );

    expect(screen.getByRole('navigation', { name: 'Pagination du catalogue' })).toBeTruthy();
    expect(screen.getByText('2').getAttribute('aria-current')).toBe('page');
    expect(screen.getByRole('link', { name: 'Page précédente' }).getAttribute('href')).toContain('category=visage');
    expect(screen.getByRole('link', { name: 'Page suivante' }).getAttribute('href')).toContain('page=3');

    const pageThree = screen.getByRole('link', { name: 'Page 3' });
    const href = new URL(pageThree.getAttribute('href')!, 'https://paradivine.ma');
    expect(href.searchParams.get('category')).toBe('visage');
    expect(href.searchParams.get('vendors')).toBe('Vichy');
    expect(href.searchParams.get('search')).toBe('serum');
    expect(href.searchParams.get('sort')).toBe('price-asc');
  });
});
