// @vitest-environment jsdom
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { SummerSalePromo } from '@/components/SummerSalePromo';

const state = vi.hoisted(() => ({
  add: vi.fn(), select: vi.fn(), show: true,
  products: [
    { id: 1, title: 'Soin solaire', nameFr: 'Soin solaire', image: '/test.webp', price: 80, comparePrice: 100, stock: 5, status: 'live' },
    { id: 2, title: 'Épuisé', image: '/test.webp', price: 80, comparePrice: 100, stock: 0, status: 'live' },
    { id: 3, title: 'Brouillon', image: '/test.webp', price: 80, comparePrice: 100, stock: 5, status: 'draft' },
  ],
}));
vi.mock('@/context/ProductsContext', () => ({ useProducts: () => ({ products: state.products }) }));
vi.mock('@/context/SettingsContext', () => ({ useSettings: () => ({ settings: { homepageSections: { showSummerSale: state.show, summerSaleProductIds: [1, 2, 3] } } }) }));
vi.mock('@/context/LanguageContext', () => ({ useTranslation: () => ({ language: 'FR' }) }));
vi.mock('@/context/CurrencyContext', () => ({ useCurrency: () => ({ convertPrice: (n: number) => `${n.toFixed(2)} DH` }) }));
vi.mock('@/context/UiContext', () => ({ useUi: () => ({ setSelectedProduct: state.select }) }));
vi.mock('@/context/CartContext', () => ({ useCart: () => ({ addToCart: state.add }) }));
vi.mock('@/lib/useGalleryOverrides', () => ({ useGalleryOverrides: () => ({ getDisplayImage: (s: string) => s }) }));
beforeEach(() => { state.show = true; vi.clearAllMocks(); });
afterEach(cleanup);

describe('Summer campaign redesign', () => {
  it('uses real prices and discounts and excludes unavailable or draft products', () => {
    render(<SummerSalePromo />);
    expect(screen.getByText('80.00 DH')).toBeTruthy();
    expect(screen.getByText('100.00 DH')).toBeTruthy();
    expect(screen.getByText('-20%')).toBeTruthy();
    expect(screen.queryByText('Épuisé')).toBeNull();
    expect(screen.queryByText('Brouillon')).toBeNull();
    expect(screen.queryByLabelText('Temps restant pour cette offre')).toBeNull();
  });
  it('keeps quick view and add to cart as separate accessible actions', () => {
    render(<SummerSalePromo />);
    fireEvent.click(screen.getByRole('button', { name: 'Voir Soin solaire' }));
    expect(state.select).toHaveBeenCalledWith(state.products[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Ajouter Soin solaire au panier' }));
    expect(state.add).toHaveBeenCalledWith(state.products[0], 1);
    expect(screen.getByRole('status').textContent).toBe('Produit ajouté au panier');
  });
  it('respects the admin visibility setting', () => {
    state.show = false;
    const { container } = render(<SummerSalePromo />);
    expect(container.innerHTML).toBe('');
  });
});
