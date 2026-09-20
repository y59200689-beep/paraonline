// @vitest-environment jsdom
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { BestSellersDualGrid } from '@/components/BestSellersDualGrid';
const state = vi.hoisted(() => ({
  visible: true, add: vi.fn(), select: vi.fn(), favorite: vi.fn(),
  products: Array.from({ length: 16 }, (_, i) => ({ id: i + 1, title: `Produit ${i + 1}`, vendor: 'Marque', image: `/original-${i + 1}.webp`, price: 80, comparePrice: 100, stock: i === 8 ? 0 : 5, status: i === 9 ? 'draft' : 'live', rating: 5, reviews: 16 - i })),
}));
vi.mock('@/context/ProductsContext', () => ({ useProducts: () => ({ products: state.products }) }));
vi.mock('@/context/SettingsContext', () => ({ useSettings: () => ({ settings: { homepageSections: { showBestSellers: state.visible, showWeeklySales: state.visible, bestSellersProductIds: [1, 2, 3, 4], weeklySalesProductIds: [4, 5, 6, 7, 8], bestSellersTitleFr: 'Produits les Plus Vendus' } } }) }));
vi.mock('@/context/LanguageContext', () => ({ useTranslation: () => ({ language: 'FR' }) }));
vi.mock('@/context/UiContext', () => ({ useUi: () => ({ setSelectedProduct: state.select, triggerFlyToCart: vi.fn() }) }));
vi.mock('@/context/CartContext', () => ({ useCart: () => ({ addToCart: state.add }) }));
vi.mock('@/context/WishlistContext', () => ({ useWishlist: () => ({ toggleWishlist: state.favorite, isInWishlist: () => false }) }));
beforeEach(() => { state.visible = true; vi.clearAllMocks(); });
afterEach(cleanup);
describe('Best sellers layout', () => {
  it('keeps curated order and fills 12 unique cards with live in-stock products', () => {
    render(<BestSellersDualGrid />);
    expect(screen.getAllByRole('article')).toHaveLength(12);
    const names = screen.getAllByRole('button', { name: /^Voir Produit/ }).map(b => b.getAttribute('aria-label'));
    expect(names).toEqual([1,2,3,4,5,6,7,8,11,12,13,14].map(id => `Voir Produit ${id}`));
    expect(screen.getByRole('heading', { name: 'Produits les Plus Vendus' })).toBeTruthy();
    expect(screen.getByText('12 Produits')).toBeTruthy();
    const first = screen.getAllByRole('article')[0];
    const brand = first.querySelector('[data-product-brand]')!;
    const title = screen.getByRole('button', { name: 'Produit 1' });
    expect(brand.compareDocumentPosition(title) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
  it('preserves product, wishlist, and cart actions', () => {
    render(<BestSellersDualGrid />);
    fireEvent.click(screen.getByRole('button', { name: 'Voir Produit 1' }));
    fireEvent.click(screen.getByRole('button', { name: 'Favoris : Produit 1' }));
    fireEvent.click(screen.getAllByRole('button', { name: 'Ajouter au panier' })[0]);
    expect(state.select).toHaveBeenCalledWith(state.products[0]);
    expect(state.favorite).toHaveBeenCalledWith(state.products[0]);
    expect(state.add).toHaveBeenCalledWith(state.products[0], 1);
  });
  it('does not fill a disabled section', () => {
    state.visible = false;
    const { container } = render(<BestSellersDualGrid />);
    expect(container.innerHTML).toBe('');
  });
});
