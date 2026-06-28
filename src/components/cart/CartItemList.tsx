'use client';

import React from 'react';
import Image from 'next/image';
import { Trash2, Plus, Minus } from 'lucide-react';
import { Product } from '@/lib/data';
import { getOptimizedImageUrl } from '@/lib/image-optimizer';

const placeholderSvg =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300' width='100%' height='100%'><rect width='100%' height='100%' fill='#f1f5f9'/><path d='M150 100a40 40 0 1 0 40 40 40 40 0 0 0-40-40zm0 60a20 20 0 1 1 20-20 20 20 0 0 1-20 20z' fill='#94a3b8'/><path d='M180 180h-60a10 10 0 0 0-10 10v10h80v-10a10 10 0 0 0-10-10z' fill='#94a3b8'/><text x='150' y='230' font-family='sans-serif' font-size='12' font-weight='bold' fill='#64748b' text-anchor='middle'>Image Indisponible</text></svg>"
  );

const toTitleCase = (str: string) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartItemListProps {
  cart: CartItem[];
  language: string;
  onSelectProduct: (product: Product) => void;
  updateQuantity: (id: number, qty: number) => void;
  removeFromCart: (id: number) => void;
  lowStockThreshold?: number;
  isOpen?: boolean;
}

export const CartItemList: React.FC<CartItemListProps> = ({
  cart,
  language,
  onSelectProduct,
  updateQuantity,
  removeFromCart,
  lowStockThreshold = 5,
  isOpen = false,
}) => {
  const isFR = language === 'FR';

  return (
    <div className="flex flex-col gap-2">
      {cart.map((item, index) => {
        const stock = item.product.stock;
        const isLowStock = stock !== undefined && stock > 0 && stock <= lowStockThreshold;
        const isLastOne = stock === 1;
        const isVeryLow = stock !== undefined && stock > 0 && stock <= 3;

        const urgencyColor = isLastOne
          ? 'text-rose-600 bg-rose-50 border-rose-200/60'
          : isVeryLow
          ? 'text-orange-600 bg-orange-50 border-orange-200/60'
          : 'text-amber-600 bg-amber-50 border-amber-200/60';
        const dotColor = isLastOne ? 'bg-rose-500' : isVeryLow ? 'bg-orange-500' : 'bg-amber-500';
        const pingColor = isLastOne ? 'bg-rose-400' : isVeryLow ? 'bg-orange-400' : 'bg-amber-400';

        const urgencyText = isLastOne
          ? isFR ? 'Dernière pièce !' : 'آخر قطعة !'
          : isFR ? `Seulement ${stock} restants` : `متبقي ${stock} فقط`;

        const stockFillPct = stock !== undefined ? Math.min((stock / lowStockThreshold) * 100, 100) : 100;

        return (
          <div
            key={item.product.id}
            style={isOpen ? { animationDelay: `${index * 55}ms` } : undefined}
            className={`group flex gap-4 items-start p-3 bg-white rounded-2xl border shadow-[0_4px_16px_rgba(26,37,93,0.015)] hover:shadow-[0_8px_24px_rgba(26,37,93,0.03)] transition-all duration-300 ease-out ${
              isOpen ? 'animate-slide-up' : 'opacity-0'
            } ${
              isLowStock
                ? isLastOne
                  ? 'border-rose-200/60 hover:border-rose-300/70'
                  : isVeryLow
                  ? 'border-orange-200/50 hover:border-orange-300/60'
                  : 'border-amber-200/40 hover:border-amber-300/50'
                : 'border-slate-100 hover:border-slate-200'
            }`}
          >
            {/* Thumbnail */}
            <div className="w-16 h-16 shrink-0 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center p-1 relative transition-transform duration-300 group-hover:scale-[1.02]">
              <Image
                src={getOptimizedImageUrl(item.product.image) || placeholderSvg}
                alt={item.product.nameFr || item.product.name || item.product.title}
                fill
                sizes="64px"
                className="object-contain p-1"
              />
              {isLowStock && (
                <span className={`absolute top-1 right-1 w-2 h-2 rounded-full ${dotColor} ring-2 ring-white`} />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 flex flex-col gap-2">
              <div>
                <span className="text-[9px] font-bold text-primary uppercase tracking-widest block mb-0.5">
                  {item.product.vendor}
                </span>
                <h4
                  onClick={() => onSelectProduct(item.product)}
                  className="text-[11.5px] font-semibold text-slate-800 cursor-pointer hover:text-primary transition-colors duration-200 leading-tight line-clamp-2"
                >
                  {toTitleCase(item.product.nameFr || item.product.name || item.product.title)}
                </h4>
              </div>

              {/* Stock urgency badge */}
              {isLowStock && (
                <div className={`inline-flex items-center gap-1.5 self-start px-2 py-0.5 rounded-lg border text-[9.5px] font-bold ${urgencyColor}`}>
                  <span className="relative flex h-1.5 w-1.5 shrink-0">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${pingColor} opacity-75`} />
                    <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${dotColor}`} />
                  </span>
                  {urgencyText}
                </div>
              )}

              {/* Controls */}
              <div className="flex items-center justify-between">
                {/* Quantity */}
                <div className="flex items-center border border-slate-100 rounded-lg overflow-hidden bg-slate-50/50 shadow-inner">
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    aria-label={isFR ? 'Diminuer la quantité' : 'تقليل الكمية'}
                    className="w-6.5 h-6.5 flex items-center justify-center text-slate-400 hover:text-primary-dark hover:bg-slate-100 transition-colors duration-200"
                  >
                    <Minus className="w-2.5 h-2.5" />
                  </button>
                  <span className="text-center text-[11px] font-bold text-slate-800 w-6">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    disabled={item.quantity >= (stock !== undefined ? stock : 100)}
                    aria-label={isFR ? 'Augmenter la quantité' : 'زيادة الكمية'}
                    className="w-6.5 h-6.5 flex items-center justify-center text-slate-400 hover:text-primary-dark hover:bg-slate-100 transition-colors duration-200 disabled:opacity-30 disabled:hover:bg-transparent"
                    title={
                      item.quantity >= (stock !== undefined ? stock : 100)
                        ? isFR ? 'Stock maximum atteint' : 'تم الوصول للحد الأقصى للمخزون'
                        : ''
                    }
                  >
                    <Plus className="w-2.5 h-2.5" />
                  </button>
                </div>

                {/* Price + Remove */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-primary-dark">
                    {(item.product.price * item.quantity).toFixed(2)} DH
                  </span>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    aria-label={isFR ? 'Supprimer le produit' : 'حذف المنتج'}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50/50 transition-all duration-300 active:scale-90"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Mini stock urgency bar */}
              {isLowStock && stock !== undefined && (
                <div className="w-full h-0.5 bg-slate-100 rounded-full overflow-hidden -mt-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isLastOne ? 'bg-rose-400' : isVeryLow ? 'bg-orange-400' : 'bg-amber-400'
                    }`}
                    style={{ width: `${stockFillPct}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
