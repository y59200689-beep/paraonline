// @vitest-environment jsdom
import React from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { RoutineDiagnosticIntro } from '@/components/RoutineDiagnosticIntro';
afterEach(cleanup);
it('launches the existing questionnaire and changes preview without launching it', () => {
  const onStart = vi.fn();
  render(<RoutineDiagnosticIntro isRTL={false} completed={false} onStart={onStart} onView={vi.fn()} onRestart={vi.fn()} />);
  fireEvent.click(screen.getByRole('button', { name: 'Vos besoins' }));
  expect(screen.getByRole('button', { name: 'Vos besoins' }).getAttribute('aria-pressed')).toBe('true');
  expect(screen.getByText('Précisez vos besoins et vos habitudes de soin.')).toBeTruthy();
  expect(onStart).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: /Lancer le diagnostic/ }));
  expect(onStart).toHaveBeenCalledOnce();
});
it('preserves completed routine actions', () => {
  const onView = vi.fn(); const onRestart = vi.fn();
  render(<RoutineDiagnosticIntro isRTL={false} completed onStart={vi.fn()} onView={onView} onRestart={onRestart} />);
  fireEvent.click(screen.getByRole('button', { name: 'Voir ma routine' }));
  fireEvent.click(screen.getByRole('button', { name: 'Refaire le diagnostic' }));
  expect(onView).toHaveBeenCalledOnce();
  expect(onRestart).toHaveBeenCalledOnce();
});
