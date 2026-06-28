'use client';

import React from 'react';
import { ShoppingBag, Store, Coins } from 'lucide-react';

interface MobileBottomNavProps {
  language: string;
  cartCount: number;
  isBumping: boolean;
  isJiggling: boolean;
  points: number;
  storeWhatsApp: string;
  onCartOpen: () => void;
  onWalletOpen: () => void;
  onDiagnosticOpen: () => void;
  t: (key: string) => string;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  language,
  cartCount,
  isBumping,
  isJiggling,
  points,
  storeWhatsApp,
  onCartOpen,
  onWalletOpen,
  onDiagnosticOpen,
  t,
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border shadow-2xl z-40 flex items-center justify-around py-2.5">
      <a href="#" className="flex flex-col items-center gap-1 text-[10px] font-bold text-primary-dark">
        <Store className="w-4.5 h-4.5" />
        <span>{t('mob_boutique')}</span>
      </a>

      <button
        onClick={onDiagnosticOpen}
        aria-label={language === 'FR' ? 'Faire le Diagnostic Dermo-IA' : 'تشخيص البشرة'}
        className="flex flex-col items-center gap-1 text-[10px] font-bold text-accent"
      >
        <span className="w-4.5 h-4.5">✨</span>
        <span>{t('diagnostic_nav')}</span>
      </button>

      <button
        id="mobile-cart-btn"
        onClick={onCartOpen}
        aria-label={language === 'FR' ? 'Voir mon panier' : 'عرض السلة'}
        className={`relative flex flex-col items-center gap-1 text-[10px] font-bold text-primary-dark ${
          isJiggling ? 'animate-cart-jiggle' : ''
        }`}
      >
        <ShoppingBag className="w-4.5 h-4.5" />
        {cartCount > 0 && (
          <span
            className={`absolute -top-1 right-1 w-3.5 h-3.5 bg-accent text-white text-[8px] font-black rounded-full flex items-center justify-center ${
              isBumping ? 'cart-badge-bump' : ''
            }`}
          >
            {cartCount}
          </span>
        )}
        <span>{t('mob_cart')}</span>
      </button>

      <button
        onClick={onWalletOpen}
        aria-label={language === 'FR' ? 'Mon Portefeuille Beauté' : 'محفظتي'}
        className="flex flex-col items-center gap-1 text-[10px] font-bold text-primary-dark relative cursor-pointer active:scale-95"
      >
        <Coins className="w-4.5 h-4.5 text-slate-500" />
        {points > 0 && (
          <span className="absolute -top-1 right-2 w-3.5 h-3.5 bg-accent text-white text-[7px] font-black rounded-full flex items-center justify-center">
            {points}
          </span>
        )}
        <span>{language === 'FR' ? 'Wallet' : 'محفظة'}</span>
      </button>

      <a
        href={`https://wa.me/${storeWhatsApp || '212660808080'}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center gap-1 text-[10px] font-bold text-whatsapp"
      >
        <span className="w-4.5 h-4.5 bg-whatsapp text-white rounded-full flex items-center justify-center text-[9px] font-black">
          WA
        </span>
        <span>{t('mob_whatsapp')}</span>
      </a>
    </nav>
  );
};
