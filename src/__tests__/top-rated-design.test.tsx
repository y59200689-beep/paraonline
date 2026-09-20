// @vitest-environment jsdom
import React from 'react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { TopRatedAsymmetricGrid } from '@/components/TopRatedAsymmetricGrid';
const state = vi.hoisted(() => ({
  add: vi.fn(), select: vi.fn(), favorite: vi.fn(), fly: vi.fn(),
  products: Array.from({ length: 7 }, (_, i) => ({ id: i + 1, title: `Produit ${i + 1}`, vendor: 'Marque', image: `/original-${i + 1}.webp`, price: 80, comparePrice: 100, stock: i === 0 ? 0 : 5, rating: 5, reviews: i === 3 ? 0 : 1 })),
}));
vi.mock('@/context/ProductsContext', () => ({ useProducts: () => ({ products: state.products }) }));
vi.mock('@/context/SettingsContext', () => ({ useSettings: () => ({ settings: { homepageSections: { topRatedProductIds: [1, 2, 3, 4, 5, 6, 7] } } }) }));
vi.mock('@/context/LanguageContext', () => ({ useTranslation: () => ({ language: 'FR' }) }));
vi.mock('@/context/UiContext', () => ({ useUi: () => ({ setSelectedProduct: state.select, triggerFlyToCart: state.fly }) }));
vi.mock('@/context/CartContext', () => ({ useCart: () => ({ addToCart: state.add }) }));
vi.mock('@/context/WishlistContext', () => ({ useWishlist: () => ({ toggleWishlist: state.favorite, isInWishlist: () => false }) }));
vi.mock('@/lib/useGalleryOverrides', () => ({ useGalleryOverrides: () => ({ getDisplayImage: (s: string) => s }) }));
beforeEach(() => vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true, reviews: state.products.filter(p => p.reviews > 0).map(p => ({ productId: p.id, rating: p.rating })) }) })));
afterEach(() => { cleanup(); vi.clearAllMocks(); vi.unstubAllGlobals(); });
describe('Top-rated product cards', () => {
  it('preserves the heading and excludes curated products without published reviews', async () => {
    render(<TopRatedAsymmetricGrid />);
    expect(await screen.findByRole('heading', { name: 'Produits les Mieux Notés' })).toBeTruthy();
    expect(screen.getByText('6 produits sélectionnés')).toBeTruthy();
    expect(screen.getAllByRole('article')).toHaveLength(6);
    expect(screen.queryByText('Pas encore d’avis')).toBeNull();
    expect(document.querySelectorAll('[data-product-brand]')).toHaveLength(6);
    expect(screen.getAllByRole('button', { name: 'Ajouter au panier' })).toHaveLength(5);
    expect(screen.getByRole('button', { name: 'Rupture de stock' }).hasAttribute('disabled')).toBe(true);
  });
  it('preserves product selection, cart and wishlist actions', async () => {
    render(<TopRatedAsymmetricGrid />);
    fireEvent.click(await screen.findByRole('button', { name: 'Voir Produit 2' }));
    expect(state.select).toHaveBeenCalledWith(state.products[1]);
    fireEvent.click(screen.getByRole('button', { name: 'Favoris : Produit 2' }));
    expect(state.favorite).toHaveBeenCalledWith(state.products[1]);
    fireEvent.click(screen.getAllByRole('button', { name: 'Ajouter au panier' })[0]);
    expect(state.add).toHaveBeenCalledWith(state.products[1], 1);
  });
});
