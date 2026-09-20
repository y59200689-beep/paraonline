// @vitest-environment jsdom
import React from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen, act } from '@testing-library/react';
import { CategoryTrack } from '@/components/CategoryTrack';

const settings = vi.hoisted(() => ({ categoryLinks: {} as Record<string, string> }));
vi.mock('@/context/LanguageContext', () => ({ useTranslation: () => ({ language: 'FR', t: (key: string) => key }) }));
vi.mock('@/context/SettingsContext', () => ({ useSettings: () => ({ settings }) }));
vi.mock('@/lib/useGalleryOverrides', () => ({ useGalleryOverrides: () => ({ getDisplayImage: (src: string) => src }) }));
vi.mock('next/image', () => ({ default: ({ fill, sizes, ...props }: any) => <img {...props} /> }));

afterEach(() => { cleanup(); vi.unstubAllGlobals(); settings.categoryLinks = {}; });

it('filters mobile categories and restores unchanged desktop destinations on resize', () => {
  let change = () => {};
  const media = { matches: true, addEventListener: (_: string, fn: () => void) => { change = fn; }, removeEventListener: vi.fn() };
  vi.stubGlobal('matchMedia', () => media);
  render(<CategoryTrack activeCategory="all" onSelectCategory={vi.fn()} />);
  for (const [tag, category] of Object.entries({ maquillage: 'maquillage', sport: 'sport', masques: 'masque' })) {
    expect(screen.getByRole('link', { name: `circle_${tag} circle_${tag}` }).getAttribute('href')).toBe(`/products?category=${category}`);
  }
  act(() => { media.matches = false; change(); });
  expect(screen.getByRole('link', { name: 'circle_sport circle_sport' }).getAttribute('href')).toBe('/products');
});

it('preserves custom mobile category destinations', () => {
  settings.categoryLinks = { sport: '/products?brand=custom', maquillage: '/products' };
  vi.stubGlobal('matchMedia', () => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  render(<CategoryTrack activeCategory="all" onSelectCategory={vi.fn()} />);
  expect(screen.getByRole('link', { name: 'circle_sport circle_sport' }).getAttribute('href')).toBe('/products?brand=custom');
  expect(screen.getByRole('link', { name: 'circle_maquillage circle_maquillage' }).getAttribute('href')).toBe('/products?category=maquillage');
});
