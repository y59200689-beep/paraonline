// @vitest-environment jsdom
import React from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Hero } from '@/components/Hero';
const push = vi.hoisted(() => vi.fn());
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
vi.mock('@/context/LanguageContext', () => ({ useTranslation: () => ({ language: 'FR' }) }));
vi.mock('@/context/SettingsContext', () => ({ useSettings: () => ({ settings: { banners: [{ titleFr: 'Nos meilleures ventes', linkType: 'category', linkValue: 'offers' }] } }) }));
vi.mock('@/lib/useGalleryOverrides', () => ({ useGalleryOverrides: () => ({ getDisplayImage: (src: string) => src }) }));
afterEach(() => { cleanup(); push.mockClear(); });
it('keeps one fixed main image without carousel controls and preserves category actions', () => {
  render(<Hero onOpenDiagnostic={vi.fn()} />);
  expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Découvrez nos Meilleures Ventes');
  fireEvent.click(screen.getByRole('button', { name: 'Je découvre' }));
  expect(push).toHaveBeenCalledWith('/products?category=offers');
  expect(screen.queryByRole('button', { name: 'Sélection suivante' })).toBeNull();
  expect(screen.queryByRole('button', { name: 'Sélection précédente' })).toBeNull();
  expect(screen.queryByRole('group', { name: 'Choisir une sélection' })).toBeNull();
  const main = screen.getByRole('article', { name: 'Découvrez nos sélections' });
  expect(main.querySelectorAll('img')).toHaveLength(1);
  fireEvent.touchStart(main, { touches: [{ clientX: 300, clientY: 100 }] });
  fireEvent.touchEnd(main, { changedTouches: [{ clientX: 100, clientY: 100 }] });
  expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('Meilleures Ventes');
});
