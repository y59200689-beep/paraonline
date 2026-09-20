// @vitest-environment jsdom
import React from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { RoutineVisualizer } from '@/components/RoutineVisualizer';
vi.mock('@/context/LanguageContext', () => ({ useTranslation: () => ({ language: 'FR' }) }));
afterEach(cleanup);
it('switches all five steps and shows morning only for protection', () => {
  render(<RoutineVisualizer />);
  expect(screen.getAllByRole('tab')).toHaveLength(5);
  fireEvent.click(screen.getByRole('tab', { name: /Protéger/ }));
  expect(screen.getByRole('tabpanel').getAttribute('aria-labelledby')).toBe('routine-tab-5');
  expect(screen.queryByText('Soir')).toBeNull();
  expect(screen.getByText('Matin')).toBeTruthy();
});
it('supports keyboard navigation and persistent ingredient disclosure', () => {
  render(<RoutineVisualizer />);
  const chip = screen.getByRole('button', { name: 'Acide Salicylique' });
  fireEvent.click(chip);
  expect(chip.getAttribute('aria-expanded')).toBe('true');
  expect(screen.getByText('BHA (Beta-Hydroxy Acid)')).toBeTruthy();
  fireEvent.click(chip);
  expect(chip.getAttribute('aria-expanded')).toBe('false');
  fireEvent.keyDown(screen.getByRole('tab', { name: /Nettoyer/ }), { key: 'ArrowRight' });
  expect(screen.getAllByRole('tab')[1].getAttribute('aria-selected')).toBe('true');
  expect(document.activeElement?.id).toBe('routine-tab-2');
});
