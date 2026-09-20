// @vitest-environment jsdom
import React from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { StorefrontFooter } from '@/components/StorefrontFooter';
vi.mock('@/context/LanguageContext', () => ({ useTranslation: () => ({ language: 'FR' }) }));
vi.mock('@/context/SettingsContext', () => ({ useSettings: () => ({ settings: { storeWhatsApp: '212660808080', socialLinks: [] } }) }));
afterEach(cleanup);
it('preserves footer logo, policy destinations, and the diagnostic action', () => {
  const diagnostic = vi.fn();
  render(<StorefrontFooter onDiagnostic={diagnostic} />);
  expect(screen.getByAltText('Para Divine').getAttribute('src')).toContain('para-divine-footer-logo');
  expect(screen.getByRole('link', { name: 'Conditions de Vente' }).getAttribute('href')).toBe('/politiques/conditions-vente');
  fireEvent.click(screen.getByRole('button', { name: 'Dermo-Diagnostic IA' }));
  expect(diagnostic).toHaveBeenCalledOnce();
  expect(screen.getByRole('link', { name: /WhatsApp/ }).getAttribute('href')).toContain('212660808080');
});
it('does not falsely confirm a newsletter subscription without a backend', () => {
  render(<StorefrontFooter onDiagnostic={() => {}} />);
  fireEvent.change(screen.getByLabelText('Adresse e-mail pour la newsletter'), { target: { value: 'test@example.com' } });
  fireEvent.submit(screen.getByRole('button', { name: 'S’inscrire' }).closest('form')!);
  expect(screen.getByRole('status').textContent).toContain('pas encore disponible');
  expect(screen.queryByText('Merci, votre inscription est enregistrée.')).toBeNull();
});
