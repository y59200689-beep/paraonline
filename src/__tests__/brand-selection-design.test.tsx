// @vitest-environment jsdom
import React from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { OfficialDistributorBadge } from '@/components/OfficialDistributorBadge';

const state = vi.hoisted(() => ({ language: 'FR' }));
vi.mock('@/context/LanguageContext', () => ({ useTranslation: () => state }));
afterEach(() => { cleanup(); state.language = 'FR'; });
it('links every selected brand to its catalog filter and preserves order tracking', () => {
  render(<OfficialDistributorBadge />);
  const brands = screen.getByRole('navigation', { name: 'Marques sélectionnées' });
  expect(brands.querySelectorAll('a')).toHaveLength(5);
  expect(screen.getByRole('link', { name: 'LA ROCHE-POSAY' }).getAttribute('href')).toBe('/products?brand=LA%20ROCHE-POSAY');
  expect(screen.getByRole('link', { name: 'Suivi de commande' }).getAttribute('href')).toBe('/suivi-commande');
});
it('supports Arabic content and direction', () => {
  state.language = 'AR';
  render(<OfficialDistributorBadge />);
  expect(screen.getByRole('region').getAttribute('dir')).toBe('rtl');
  expect(screen.getByRole('heading', { level: 2 }).textContent).toContain('مختارة بعناية');
});
