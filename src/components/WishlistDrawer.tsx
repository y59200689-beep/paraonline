'use client';

import React, { useEffect, useContext } from 'react';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { useTranslation } from '@/context/LanguageContext';
import { LoyaltyContext } from '@/context/LoyaltyContext';
import { Product } from '@/lib/data';
import { X, Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { getOptimizedImageUrl } from '@/lib/image-optimizer';
import { useUi } from '@/context/UiContext';
import Image from 'next/image';
import { useModalAccessibility } from '@/hooks/useModalAccessibility';
import { PRODUCT_IMAGE_FALLBACK } from '@/lib/public-images';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
}

const toTitleCase = (str: string) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
}) => {
  const drawerRef = useModalAccessibility<HTMLDivElement>(isOpen, onClose);
  const { language } = useTranslation();
  const loyaltyContext = useContext(LoyaltyContext);
  const clientUser = loyaltyContext?.clientUser ?? null;
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { triggerCartJiggle } = useUi();

  const isRTL = language === 'AR';

  useEffect(() => {
    if (isOpen && !clientUser) {
      onClose();
      if (typeof window !== 'undefined') {
        window.location.href = '/customer';
      }
    }
  }, [isOpen, clientUser, onClose]);

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
    triggerCartJiggle();
  };

  return (
    <div
      className={`fixed inset-0 bg-black/55 z-50 flex justify-end transition-opacity ${
        isOpen ? 'opacity-100 pointer-events-auto backdrop-blur-sm' : 'opacity-0 pointer-events-none'
      }`}
      style={{ transitionDuration: isOpen ? '300ms' : '220ms', transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)' }}
    >
      <div className="absolute inset-0 bg-transparent" onClick={onClose} />

      {/* Drawer Panel */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="wishlist-drawer-title"
        aria-hidden={!isOpen}
        inert={!isOpen}
        tabIndex={-1}
        className={`relative w-full max-w-[460px] h-full bg-white border-l border-slate-100 shadow-2xl flex flex-col z-10 overflow-hidden`}
        style={{
          direction: isRTL ? 'rtl' : 'ltr',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: `transform ${isOpen ? '420ms' : '320ms'} cubic-bezier(0.22, 1, 0.36, 1)`,
          willChange: 'transform',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <h3 id="wishlist-drawer-title" className="text-base font-black text-slate-800">
              {language === 'FR' ? "Ma Liste d'Envies" : "قائمتي المفضلة"}
            </h3>
          </div>
          <button
            onClick={onClose}
            data-autofocus
            aria-label={language === 'FR' ? 'Fermer' : 'إغلاق'}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer border-0 bg-transparent"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6">
          {wishlist.length === 0 ? (
            <div className="text-center py-20 flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-400">
                <Heart className="w-8 h-8" />
              </div>
              <h4 className="text-sm font-black text-slate-800 mt-2">
                {language === 'FR' ? "Votre liste d'envies est vide" : "قائمة مفضلاتكِ فارغة"}
              </h4>
              <p className="text-xs text-slate-400 max-w-[280px] leading-relaxed">
                {language === 'FR'
                  ? "Parcourez notre catalogue et ajoutez vos produits préférés en cliquant sur l'icône de cœur."
                  : "تصفحي متجرنا وأضيفي منتجاتكِ المفضلة بالنقر على أيقونة القلب."}
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-black uppercase tracking-wider rounded-lg transition-colors cursor-pointer border-0"
              >
                {language === 'FR' ? 'Découvrir nos produits' : 'اكتشاف المنتجات'}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {wishlist.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-xl border border-slate-100 p-3.5 flex flex-row items-center gap-4 hover:shadow-sm transition-all"
                >
                  {/* Product Image */}
                  <div
                    onClick={() => {
                      onSelectProduct(product);
                      onClose();
                    }}
                    className="w-16 h-16 flex-shrink-0 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center cursor-pointer relative"
                  >
                    <Image
                      src={getOptimizedImageUrl(product.image) || PRODUCT_IMAGE_FALLBACK}
                      alt={product.nameFr || product.name || product.title}
                      fill
                      sizes="64px"
                      className="object-contain p-2"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h4
                      onClick={() => {
                        onSelectProduct(product);
                        onClose();
                      }}
                      className="text-xs font-bold text-slate-800 hover:text-primary transition-colors cursor-pointer truncate"
                    >
                      {toTitleCase(product.nameFr || product.name || product.title)}
                    </h4>
                    <span className="text-[9px] font-extrabold text-blue-700 uppercase tracking-widest block mt-0.5">
                      {product.vendor}
                    </span>
                    <span className="text-xs font-black text-primary block mt-1">
                      {product.price.toFixed(2)} DH
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="w-8 h-8 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent flex items-center justify-center transition-colors cursor-pointer border-0"
                      title={language === 'FR' ? 'Ajouter au panier' : 'إضافة إلى السلة'}
                      aria-label={language === 'FR' ? 'Ajouter au panier' : 'إضافة إلى السلة'}
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeFromWishlist(product.id)}
                      className="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-500 flex items-center justify-center transition-colors cursor-pointer border-0"
                      title={language === 'FR' ? 'Retirer des favoris' : 'إزالة من المفضلة'}
                      aria-label={language === 'FR' ? 'Retirer des favoris' : 'إزالة من المفضلة'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {wishlist.length > 0 && (
          <div className="p-6 border-t border-slate-100 bg-slate-50 flex-shrink-0">
            <button
              onClick={clearWishlist}
              className="w-full py-3 border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-50 text-[11px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>{language === 'FR' ? 'Vider la liste' : 'مسح القائمة'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
