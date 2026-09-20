// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { DesktopActions } from '../components/Header/DesktopActions';
import { SearchPill } from '../components/Header/SearchPill';

vi.mock('../components/Header/SearchDropdown', () => ({ SearchDropdown: () => null }));
afterEach(cleanup);

describe('Redesigned desktop header', () => {
  it('preserves account, cart and wishlist actions while removing the desktop wallet button', () => {
    const onCartOpen = vi.fn(), onWalletOpen = vi.fn(), onWishlistOpen = vi.fn();
    render(<DesktopActions language="FR" isRTL={false} cartCount={2} subtotal={26.4}
      isBumping={false} isJiggling={false} wishlistCount={3} points={120}
      ratesLoading={false} convertPrice={value => `${value.toFixed(2)} DH`}
      onCartOpen={onCartOpen} onWalletOpen={onWalletOpen} onWishlistOpen={onWishlistOpen} />);
    expect(screen.getByRole('link', {name: 'Mon compte'}).getAttribute('href')).toBe('/customer');
    expect(screen.getByText('26.40 DH')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', {name: 'Voir mon panier'}));
    expect(screen.queryByRole('button', {name: 'Mon Portefeuille Beauté'})).toBeNull();
    fireEvent.click(screen.getByRole('button', {name: "Ma Liste d'Envies"}));
    expect(onCartOpen).toHaveBeenCalledOnce();
    expect(onWalletOpen).not.toHaveBeenCalled();
    expect(onWishlistOpen).toHaveBeenCalledOnce();
  });

  it('preserves search editing, clearing and category selection', () => {
    const setSearchQuery = vi.fn(), setShowSearch = vi.fn(), setSelectedCategoryId = vi.fn(), setShowCategoryDropdown = vi.fn();
    render(<SearchPill searchRef={React.createRef()} categoryRef={React.createRef()}
      language="FR" isRTL={false} searchQuery="soin" setSearchQuery={setSearchQuery}
      showSearch={false} setShowSearch={setShowSearch} selectedCategoryId="all"
      setSelectedCategoryId={setSelectedCategoryId} showCategoryDropdown={true}
      setShowCategoryDropdown={setShowCategoryDropdown} hoveredCategoryId={null}
      setHoveredCategoryId={vi.fn()} searchResults={[]} matchedIngredients={[]}
      convertPrice={String} onSuggestionClick={vi.fn()} onIngredientClick={vi.fn()}
      onQuickAdd={vi.fn()} onOpenDiagnostic={vi.fn()} />);
    fireEvent.change(screen.getByRole('textbox', {name: 'Rechercher des produits'}), {target: {value: 'crème'}});
    expect(setSearchQuery).toHaveBeenCalledWith('crème');
    expect(setShowSearch).toHaveBeenCalledWith(true);
    fireEvent.click(screen.getByRole('button', {name: 'Effacer la recherche'}));
    expect(setSearchQuery).toHaveBeenCalledWith('');
    fireEvent.click(screen.getByRole('button', {name: 'Soins du Visage'}));
    expect(setSelectedCategoryId).toHaveBeenCalledWith('visage');
    expect(setShowCategoryDropdown).toHaveBeenCalledWith(false);
  });
});
