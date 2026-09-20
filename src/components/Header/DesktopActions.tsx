'use client';

import React from 'react';
import { ShoppingCart, User, Heart, ChevronRight } from 'lucide-react';
import styles from './Header.module.css';
import Link from 'next/link';

interface DesktopActionsProps {
  language: string;
  isRTL: boolean;
  cartCount: number;
  subtotal: number;
  isBumping: boolean;
  isJiggling: boolean;
  wishlistCount: number;
  points: number;
  accountName?: string;
  ratesLoading: boolean;
  convertPrice: (price: number) => string;
  onCartOpen: () => void;
  onWalletOpen: () => void;
  onWishlistOpen: () => void;
}

export const DesktopActions: React.FC<DesktopActionsProps> = ({
  language,
  isRTL,
  cartCount,
  subtotal,
  isBumping,
  isJiggling,
  wishlistCount,
  accountName,
  ratesLoading,
  convertPrice,
  onCartOpen,
  onWishlistOpen,
}) => {
  return (
    <div className={styles.actions}>
      {/* Account */}
      <Link
        href="/customer"
        className={styles.action}
        title={accountName || (language === 'FR' ? 'Mon compte' : 'حسابي')}
      >
        <User className={styles.icon} aria-hidden="true" />
        <span className={styles.actionLabel}>{accountName || (language === 'FR' ? 'Mon compte' : 'حسابي')}</span>
      </Link>

      {/* Wishlist */}
      <button
        onClick={onWishlistOpen}
        aria-label={language === 'FR' ? "Ma Liste d'Envies" : 'المفضلة'}
        className={styles.action}
      >
        <div className="relative">
          <Heart className={styles.icon} aria-hidden="true" />
          <span className={styles.badge}>
            {wishlistCount > 9999 ? '9999+' : (wishlistCount > 0 ? wishlistCount : 0)}
          </span>
        </div>
        <span>
          {language === 'FR' ? 'Favoris' : 'المفضلة'}
        </span>
      </button>

      <div className="w-px h-12 bg-slate-200" aria-hidden="true" />

      {/* Cart */}
      <button
        id="desktop-cart-btn"
        onClick={onCartOpen}
        aria-label={language === 'FR' ? 'Voir mon panier' : 'عرض السلة'}
        className={`${styles.cart} ${
          isJiggling ? 'animate-cart-jiggle' : ''
        }`}
      >
        <div className="relative">
          <ShoppingCart className={styles.cartIcon} aria-hidden="true" />
          <span className="t-badge" data-open={cartCount > 0 ? 'true' : 'false'}>
            <span
              className={`t-badge-dot w-5 h-5 bg-white text-primary text-[9px] font-black rounded-full border border-primary/10 shadow-sm ${
                isBumping ? 'cart-badge-bump' : ''
              }`}
            >
              {cartCount}
            </span>
          </span>
        </div>
        <div className={styles.cartText}>
          <span>
            {language === 'FR' ? 'Mon panier' : 'سلتي'}
          </span>
          <strong>
            {ratesLoading ? (
              <span className="inline-block w-16 h-3.5 bg-slate-100 animate-pulse rounded-full" />
            ) : (
              convertPrice(subtotal)
            )}
          </strong>
        </div>
        <ChevronRight className={`${styles.cartChevron} w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
    </div>
  );
};
