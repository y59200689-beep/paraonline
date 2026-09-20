// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { InteractiveFaq } from '@/components/InteractiveFaq';
const state = vi.hoisted(() => ({ language: 'FR' }));
vi.mock('@/context/LanguageContext', () => ({ useTranslation: () => ({ language: state.language }) }));
vi.mock('@/context/SettingsContext', () => ({ useSettings: () => ({ settings: { storeWhatsApp: '212660808080', shippingFee: 35, deliverySettings: { defaultDaysMin: 1, defaultDaysMax: 3, cityRules: [] } } }) }));
afterEach(() => { cleanup(); state.language = 'FR'; });
describe('Interactive FAQ redesign', () => {
  it('shows configured estimates in DH and handles an unlisted city', () => {
    render(<InteractiveFaq />);
    expect(screen.getByText('35.00 DH')).toBeTruthy();
    expect(screen.getByText('1–3 jours')).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Ville de destination'), { target: { value: '' } });
    expect(screen.queryByText('35.00 DH')).toBeNull();
    expect(screen.getByText('Vérifions votre adresse ensemble')).toBeTruthy();
  });
  it('switches all help topics and preserves delivery selection', () => {
    render(<InteractiveFaq />);
    const rabat = (screen.getByRole('option', { name: 'Rabat' }) as HTMLOptionElement).value;
    fireEvent.change(screen.getByLabelText('Ville de destination'), { target: { value: rabat } });
    fireEvent.click(screen.getByRole('button', { name: /Commande.*Suivi/ }));
    expect(screen.getByRole('link', { name: 'Suivre ma commande' }).getAttribute('href')).toBe('/suivi-commande');
    fireEvent.click(screen.getByRole('button', { name: /Produits.*Disponibilité/ }));
    expect(screen.getByRole('link', { name: 'Demander un conseil' }).getAttribute('href')).toContain('wa.me/212660808080');
    fireEvent.click(screen.getByRole('button', { name: /Livraison à domicile.*Délais/ }));
    expect((screen.getByLabelText('Ville de destination') as HTMLSelectElement).value).toBe(rabat);
  });
  it('expands and collapses popular answers with accessible state', () => {
    render(<InteractiveFaq />);
    const button = screen.getByRole('button', { name: 'Quels sont les délais de livraison ?' });
    expect(button.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(button);
    expect(button.getAttribute('aria-expanded')).toBe('true');
    fireEvent.click(button);
    expect(button.getAttribute('aria-expanded')).toBe('false');
  });
  it('renders Arabic help and right-to-left layout', () => {
    state.language = 'AR';
    const { container } = render(<InteractiveFaq />);
    expect(container.querySelector('section')?.getAttribute('dir')).toBe('rtl');
    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe('الأسئلة الشائعة');
  });
});
