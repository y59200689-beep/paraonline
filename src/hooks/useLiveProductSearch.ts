'use client';

import { useEffect, useState } from 'react';
import type { Product } from '@/lib/data';

const normalize = (value: string) => value.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export function useLiveProductSearch(query: string, category: string, enabled: boolean) {
  const term = query.trim();
  const key = JSON.stringify([term, category]);
  const [state, setState] = useState({ key: '', category: '', products: [] as Product[], pending: false, error: false });

  useEffect(() => {
    if (!enabled || !term) return;
    const controller = new AbortController();
    let active = true;
    setState(previous => ({ key, category, products: previous.category === category ? previous.products : [], pending: true, error: false }));
    const params = new URLSearchParams({ search: term, limit: '24', category, sort: 'search-stock' });
    void (async () => {
      try {
        const response = await fetch(`/api/products?${params}`, { signal: controller.signal });
        const data = await response.json();
        if (!response.ok || !data.success || !Array.isArray(data.products)) throw new Error('Search unavailable');
        if (active) setState({ key, category, products: data.products, pending: false, error: false });
      } catch {
        if (active) setState({ key, category, products: [], pending: false, error: true });
      }
    })();
    return () => { active = false; controller.abort(); };
  }, [term, category, enabled, key]);

  const searching = enabled && Boolean(term) && (state.key !== key || state.pending);
  const words = normalize(term).split(/\s+/);
  // Keep matching previous suggestions visible while the full-catalogue query
  // runs. Never reuse results from another category or show an old response.
  const products = !enabled || !term || state.category !== category ? []
    : !searching ? state.products
    : state.products.filter(product => {
      const text = normalize([product.id, product.title, product.name, product.nameFr, product.vendor, product.sku, product.category, product.description].filter(Boolean).join(' '));
      return words.every(word => text.includes(word));
    });
  return { products, searching, error: enabled && Boolean(term) && state.key === key && state.error };
}
