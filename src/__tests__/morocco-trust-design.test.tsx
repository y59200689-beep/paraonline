// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MoroccoTrustBar } from '@/components/MoroccoTrustBar';

const state = vi.hoisted(() => ({ language: 'FR', phone: '212660808080' }));
vi.mock('@/context/LanguageContext', () => ({ useTranslation: () => ({ language: state.language }) }));
vi.mock('@/context/SettingsContext', () => ({ useSettings: () => ({ settings: { storeWhatsApp: state.phone } }) }));
afterEach(() => { cleanup(); state.language = 'FR'; state.phone = '212660808080'; });

describe('Purchase reassurance section', () => {
  it('provides four actionable cards with real policy and configured support destinations', () => {
    render(<MoroccoTrustBar />);
    expect(screen.getAllByRole('link')).toHaveLength(4);
    const shipping = screen.getByRole('link', { name: /Livraison au Maroc/ });
    expect(shipping.getAttribute('href')).toBe('/politiques/conditions-vente');
    const support = screen.getByRole('link', { name: /Conseil & Support/ });
    expect(support.getAttribute('href')).toContain('https://wa.me/212660808080');
    expect(support.getAttribute('rel')).toBe('noopener noreferrer');
    expect(screen.getByRole('heading', { level: 2 }).textContent).toContain('avant votre achat');
  });
  it('falls back to existing contact details for invalid WhatsApp configuration', () => {
    state.phone = 'invalid';
    render(<MoroccoTrustBar />);
    const support = screen.getByRole('link', { name: /Conseil & Support/ });
    expect(support.getAttribute('href')).toBe('#footer');
    expect(support.getAttribute('target')).toBeNull();
  });
  it('preserves Arabic content and reading direction', () => {
    state.language = 'AR';
    render(<MoroccoTrustBar />);
    expect(screen.getByRole('region').getAttribute('dir')).toBe('rtl');
    expect(screen.getByRole('heading', { level: 2 }).textContent).toContain('قبل إتمام الشراء');
    expect(screen.getAllByRole('link')).toHaveLength(4);
  });
});
