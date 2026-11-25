// @vitest-environment jsdom
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import ContentSectionsClient from '@/app/admin/content/sections/ContentSectionsClient';
import { BestSellersDualGrid } from '@/components/BestSellersDualGrid';
const state = vi.hoisted(() => ({
  pins: [1, 2, 3, 4] as number[], weeklyPins: [4, 5, 6, 7, 8] as number[],
  visible: true, add: vi.fn(), select: vi.fn(), favorite: vi.fn(),
  products: Array.from({ length: 16 }, (_, i) => ({ id: i + 1, title: `Produit ${i + 1}`, vendor: 'Marque', image: `/original-${i + 1}.webp`, price: 80, comparePrice: 100, stock: i === 8 ? 0 : 5, status: i === 9 ? 'draft' : 'live', rating: 5, reviews: 16 - i })),
}));
vi.mock('@/context/ProductsContext', () => ({ useProducts: () => ({ products: state.products }) }));
vi.mock('@/context/SettingsContext', () => ({ useSettings: () => ({ settings: { homepageSections: { showBestSellers: state.visible, showWeeklySales: state.visible, bestSellersProductIds: state.pins, weeklySalesProductIds: state.weeklyPins, bestSellersTitleFr: 'Produits les Plus Vendus' } } }) }));
vi.mock('@/context/AdminContext', () => ({ useAdmin: () => ({
  currentUser: { role: 'owner' }, adminTheme: 'light', products: state.products,
}) }));
vi.mock('@/context/LanguageContext', () => ({ useTranslation: () => ({ language: 'FR' }) }));
vi.mock('@/context/UiContext', () => ({ useUi: () => ({ setSelectedProduct: state.select, triggerFlyToCart: vi.fn() }) }));
vi.mock('@/context/CartContext', () => ({ useCart: () => ({ addToCart: state.add }) }));
vi.mock('@/context/WishlistContext', () => ({ useWishlist: () => ({ toggleWishlist: state.favorite, isInWishlist: () => false }) }));
beforeEach(() => {
  state.visible = true;
  state.pins = [1, 2, 3, 4];
  state.weeklyPins = [4, 5, 6, 7, 8];
  vi.clearAllMocks();
});
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
  it('previews the same 12 automatic products in the editor when no products are pinned', () => {
    state.pins = [];
    state.weeklyPins = [];
    const sections = [{ id: 'bestSellers-1', type: 'bestSellers', nameFr: 'Meilleures Ventes', visible: true }];
    const storefront = render(<BestSellersDualGrid sections={sections} />);
    const titles = screen.getAllByRole('button', { name: /^Voir Produit/ }).map(button =>
      button.getAttribute('aria-label')!.replace('Voir ', ''));
    storefront.unmount();

    render(<ContentSectionsClient initialSections={sections} />);
    fireEvent.click(screen.getByRole('heading', { name: 'Produits les Plus Vendus' }));
    expect(screen.getByText('12 / 12 dans la grille')).toBeTruthy();
    expect(screen.getAllByText('Automatique')).toHaveLength(12);
    expect(screen.getAllByRole('heading', { level: 5 }).map(heading => heading.textContent)).toEqual(titles);
  });

  it('lets admins remove and replace automatically selected products', () => {
    state.pins = [];
    state.weeklyPins = [];
    const section = { id: 'bestSellers-1', type: 'bestSellers', nameFr: 'Meilleures Ventes', visible: true };
    render(<ContentSectionsClient initialSections={[section]} />);
    fireEvent.click(screen.getByRole('heading', { name: 'Produits les Plus Vendus' }));
    fireEvent.click(screen.getAllByRole('button', { name: 'Retirer' })[0]);
    expect(screen.queryByRole('heading', { name: 'Produit 1' })).toBeNull();

    fireEvent.click(screen.getAllByRole('button', { name: 'Remplacer' })[0]);
    expect(screen.getByRole('heading', { name: 'Choisir un produit de remplacement' })).toBeTruthy();
    fireEvent.click(screen.getByRole('heading', { name: 'Produit 16' }));
    expect(screen.getAllByRole('heading', { level: 5 })[0].textContent).toBe('Produit 16');
    expect(screen.queryByRole('heading', { name: 'Produit 2' })).toBeNull();
  });

  it('uses the published selection ahead of the legacy settings', () => {
    render(<BestSellersDualGrid sections={[{
      id: 'bestSellers-1', type: 'bestSellers', nameFr: 'Meilleures Ventes', visible: true,
      settings: { productIds: [16, 15], excludedProductIds: [3, 5] },
    }]} />);
    const titles = screen.getAllByRole('button', { name: /^Voir Produit/ }).map(button => button.getAttribute('aria-label'));
    expect(titles.slice(0, 2)).toEqual(['Voir Produit 16', 'Voir Produit 15']);
    expect(titles).not.toContain('Voir Produit 3');
    expect(titles).not.toContain('Voir Produit 5');
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
