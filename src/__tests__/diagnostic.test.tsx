// @vitest-environment jsdom
import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SkinDiagnostic } from '../components/SkinDiagnostic';
import { SettingsProvider } from '../context/SettingsContext';
import { UiProvider } from '../context/UiContext';
import { LanguageProvider } from '../context/LanguageContext';
import { LoyaltyProvider } from '../context/LoyaltyContext';
import { ThemeProvider } from '../context/ThemeContext';
import { CartProvider } from '../context/CartContext';
import { ProductsProvider } from '../context/ProductsContext';
import { CurrencyProvider } from '../context/CurrencyContext';
import { AmPmProvider } from '../context/AmPmContext';
import { CompareProvider } from '../context/CompareContext';
import { WishlistProvider } from '../context/WishlistContext';

const AllProvidersWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SettingsProvider>
    <UiProvider>
      <LanguageProvider>
        <LoyaltyProvider>
          <ThemeProvider>
            <ProductsProvider>
              <CartProvider>
                <CurrencyProvider>
                  <AmPmProvider>
                    <CompareProvider>
                      <WishlistProvider>{children}</WishlistProvider>
                    </CompareProvider>
                  </AmPmProvider>
                </CurrencyProvider>
              </CartProvider>
            </ProductsProvider>
          </ThemeProvider>
        </LoyaltyProvider>
      </LanguageProvider>
    </UiProvider>
  </SettingsProvider>
);

const mockProducts = [
  {
    id: 15,
    title: 'Anua Cleansing Oil',
    nameFr: 'Huile Nettoyante Anua',
    vendor: 'Anua',
    image: '/images/anua.webp',
    images: ['/images/anua.webp'],
    price: 180,
    comparePrice: 200,
    category: 'visage',
    tags: ['visage'],
    rating: 5,
    reviews: 12,
    description: 'Nettoyant doux pour les pores et les imperfections',
    ingredients: 'Centella',
    usage: 'Nettoyer',
  },
  {
    id: 22,
    title: 'Anua Cleansing Foam',
    nameFr: 'Mousse Nettoyante Anua',
    vendor: 'Anua',
    image: '/images/anua-foam.webp',
    images: ['/images/anua-foam.webp'],
    price: 140,
    comparePrice: 160,
    category: 'visage',
    tags: ['visage'],
    rating: 5,
    reviews: 9,
    description: 'Mousse pour peau grasse et imperfections',
    ingredients: 'Salicylic Acid',
    usage: 'Nettoyer',
  },
  {
    id: 3,
    title: 'Garnier Vitamin C Serum',
    nameFr: 'Sérum Vitamine C Garnier',
    vendor: 'Garnier',
    image: '/images/vitamin-c.webp',
    images: ['/images/vitamin-c.webp'],
    price: 90,
    comparePrice: 100,
    category: 'visage',
    tags: ['visage'],
    rating: 4.8,
    reviews: 45,
    description: 'Sérum éclat',
    ingredients: 'Vitamin C',
    usage: 'Matin',
  },
  {
    id: 30,
    title: 'Sérum Niacinamide Anti-Imperfections',
    nameFr: 'Sérum Niacinamide Anti-Imperfections',
    vendor: 'Dermolab',
    image: '/images/niacinamide.webp',
    images: ['/images/niacinamide.webp'],
    price: 150,
    comparePrice: 170,
    category: 'acné',
    tags: ['imperfections', 'peau grasse'],
    rating: 4.9,
    reviews: 31,
    description: 'Sérum ciblé contre les imperfections et les pores',
    ingredients: 'Niacinamide, Zinc, Centella',
    usage: 'Après le nettoyage',
  },
  {
    id: 31,
    title: 'Anthelios Fluide Invisible SPF50+',
    nameFr: 'Anthelios Fluide Invisible SPF50+',
    vendor: 'La Roche-Posay',
    image: '/images/anthelios.webp',
    images: ['/images/anthelios.webp'],
    price: 190,
    comparePrice: 210,
    category: 'solaire',
    tags: ['spf50', 'visage'],
    rating: 4.9,
    reviews: 80,
    description: 'Protection solaire visage non comédogène',
    ingredients: '',
    usage: 'Chaque matin',
  },
];

describe('SkinDiagnostic question-only assessment', () => {
  const getUserMedia = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    Object.defineProperty(global.navigator, 'mediaDevices', {
      value: { getUserMedia },
      writable: true,
      configurable: true,
    });

    vi.spyOn(global, 'fetch').mockImplementation((input) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      if (url.includes('/api/products')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true, products: mockProducts }) } as Response);
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true }) } as Response);
    });
  });

  it('opens with the new privacy promise and never requests camera access', async () => {
    await act(async () => {
      render(<SkinDiagnostic isOpen onClose={vi.fn()} experience="client" />, { wrapper: AllProvidersWrapper });
    });

    expect(screen.getByText(/Gratuit • Sans photo • Environ 3 minutes/)).toBeDefined();
    expect(screen.getByText('Questionnaire rapide')).toBeDefined();
    expect(screen.queryByText(/scan|analyser mon visage/i)).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /COMMENCER MON DIAGNOSTIC/i }));
    expect(screen.getByText('Question 1 sur 8')).toBeDefined();
    expect(getUserMedia).not.toHaveBeenCalled();
  });

  it('shows progress through eight answers and produces a relevant routine', async () => {
    await act(async () => {
      render(<SkinDiagnostic isOpen onClose={vi.fn()} experience="client" />, { wrapper: AllProvidersWrapper });
    });

    await waitFor(() => {
      expect(vi.mocked(global.fetch).mock.calls.some(([input]) => String(input).includes('/api/products'))).toBe(true);
    });

    fireEvent.click(screen.getByRole('button', { name: /COMMENCER MON DIAGNOSTIC/i }));

    const answerAndContinue = (answer: string) => {
      fireEvent.click(screen.getByRole('radio', { name: new RegExp(answer, 'i') }));
      fireEvent.click(screen.getByRole('button', { name: /Continuer|Voir ma routine/i }));
    };

    answerAndContinue('Grasse');
    answerAndContinue('Imperfections');
    answerAndContinue('Très facilement');
    answerAndContinue('Souvent');
    answerAndContinue('Exposition modérée');
    answerAndContinue('Rarement ou jamais');
    answerAndContinue('Je débute');

    expect(screen.getByText('Question 8 sur 8')).toBeDefined();
    answerAndContinue('L’essentiel');

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 420));
    });

    expect(screen.getByText('Votre profil est prêt')).toBeDefined();
    expect(screen.getAllByText('Nettoyer')).toHaveLength(1);
    expect(screen.getByText(/ne constitue pas un diagnostic médical/i)).toBeDefined();
    expect(getUserMedia).not.toHaveBeenCalled();
  });

  it('keeps the premium entry isolated from the storefront experience', async () => {
    await act(async () => {
      render(<SkinDiagnostic isOpen onClose={vi.fn()} experience="storefront" />, { wrapper: AllProvidersWrapper });
    });

    expect(screen.getByText('Une routine plus juste, construite autour de votre peau.')).toBeDefined();
    expect(screen.queryByText('DERMO•IA')).toBeNull();
  });

  it('closes with Escape and restores focus to the launcher', async () => {
    const DiagnosticHarness = () => {
      const [open, setOpen] = React.useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>Ouvrir le diagnostic</button>
          <SkinDiagnostic isOpen={open} onClose={() => setOpen(false)} experience="client" />
        </>
      );
    };

    await act(async () => {
      render(<DiagnosticHarness />, { wrapper: AllProvidersWrapper });
    });

    const launcher = screen.getByRole('button', { name: 'Ouvrir le diagnostic' });
    launcher.focus();
    fireEvent.click(launcher);

    await act(async () => {
      await new Promise((resolve) => requestAnimationFrame(resolve));
    });
    expect(document.activeElement).toBe(screen.getByRole('dialog'));

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(document.activeElement).toBe(launcher);
  });
});
