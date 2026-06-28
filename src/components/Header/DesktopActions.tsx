'use client';

import React from 'react';
import { ShoppingBag, Heart, Scale, Coins } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';
import Link from 'next/link';
import { User } from 'lucide-react';

interface DesktopActionsProps {
  language: string;
  isRTL: boolean;
  cartCount: number;
  subtotal: number;
  isBumping: boolean;
  isJiggling: boolean;
  wishlistCount: number;
  compareCount: number;
  points: number;
  ratesLoading: boolean;
  convertPrice: (price: number) => string;
  onCartOpen: () => void;
  onWalletOpen: () => void;
  onWishlistOpen: () => void;
  onCompareOpen: () => void;
}

export const DesktopActions: React.FC<DesktopActionsProps> = ({
  language,
  isRTL,
  cartCount,
  subtotal,
  isBumping,
  isJiggling,
  wishlistCount,
  compareCount,
  points,
  ratesLoading,
  convertPrice,
  onCartOpen,
  onWalletOpen,
  onWishlistOpen,
  onCompareOpen,
}) => {
  return (
    <div className="flex items-center justify-end gap-6">
      {/* Account */}
      <Link
        href="/customer"
        className="flex items-center gap-3 text-slate-600 hover:text-primary transition-colors cursor-pointer group"
      >
        <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:bg-primary/5 group-hover:border-primary/20 transition-all duration-200">
          <User className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
        </div>
        <div className={`flex flex-col ${isRTL ? 'text-right' : 'text-left'} leading-snug shrink-0`}>
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
            {language === 'FR' ? 'Bienvenue' : 'مرحباً'}
          </span>
          <span className="text-[12px] font-bold text-slate-700 group-hover:text-primary transition-colors mt-0.5">
            {language === 'FR' ? 'Mon Compte' : 'حسابي'}
          </span>
        </div>
      </Link>

      <div className="w-px h-8 bg-slate-100" />

      {/* Wallet */}
      <button
        onClick={onWalletOpen}
        aria-label={language === 'FR' ? 'Mon Portefeuille Beauté' : 'محفظتي'}
        className="relative flex flex-col items-center gap-1.5 text-slate-400 hover:text-primary transition-all cursor-pointer group"
      >
        <div className="relative">
          <Coins className="w-5 h-5 group-hover:scale-110 transition-transform duration-200 text-slate-400 group-hover:text-primary" />
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-accent text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white">
            {points}
          </span>
        </div>
        <span className="text-[9px] font-semibold uppercase tracking-wider">
          {language === 'FR' ? 'Wallet' : 'المحفظة'}
        </span>
      </button>

      <div className="w-px h-8 bg-slate-100" />

      {/* Wishlist */}
      <button
        onClick={onWishlistOpen}
        aria-label={language === 'FR' ? "Ma Liste d'Envies" : 'المفضلة'}
        className="relative flex flex-col items-center gap-1.5 text-slate-400 hover:text-primary transition-all cursor-pointer group"
      >
        <div className="relative">
          <Heart className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-accent text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white">
            {wishlistCount > 0 ? wishlistCount : 0}
          </span>
        </div>
        <span className="text-[9px] font-semibold uppercase tracking-wider">
          {language === 'FR' ? 'Favoris' : 'المفضلة'}
        </span>
      </button>

      {/* Compare */}
      <button
        onClick={onCompareOpen}
        aria-label={language === 'FR' ? 'Comparateur Clinique' : 'مقارنة المنتجات'}
        className={`relative flex flex-col items-center gap-1.5 transition-all cursor-pointer group ${
          compareCount > 0 ? 'text-primary' : 'text-slate-400 hover:text-primary'
        }`}
      >
        <div className="relative">
          <Scale className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-accent text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white animate-[pulse_3s_infinite]">
            {compareCount}
          </span>
        </div>
        <span className="text-[9px] font-semibold uppercase tracking-wider">
          {language === 'FR' ? 'Comparer' : 'مقارنة'}
        </span>
      </button>

      <div className="w-px h-8 bg-slate-100" />

      {/* Cart */}
      <button
        id="desktop-cart-btn"
        onClick={onCartOpen}
        aria-label={language === 'FR' ? 'Voir mon panier' : 'عرض السلة'}
        className={`flex items-center gap-3 text-slate-600 hover:text-primary transition-all cursor-pointer group ${
          isJiggling ? 'animate-cart-jiggle' : ''
        }`}
      >
        <div className="relative w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-[0_4px_14px_rgba(227,30,36,0.2)] group-hover:shadow-[0_4px_18px_rgba(227,30,36,0.35)] transition-all duration-200">
          <ShoppingBag className="w-5 h-5 text-white" />
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
        <div className={`flex flex-col ${isRTL ? 'text-right' : 'text-left'} leading-snug shrink-0`}>
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
            {language === 'FR' ? 'Mon Panier' : 'سلتي'}
          </span>
          <span className="text-[13px] font-black text-slate-800 group-hover:text-primary transition-colors mt-0.5">
            {ratesLoading ? (
              <span className="inline-block w-16 h-3.5 bg-slate-100 animate-pulse rounded-full" />
            ) : (
              convertPrice(subtotal)
            )}
          </span>
        </div>
      </button>
    </div>
  );
};
