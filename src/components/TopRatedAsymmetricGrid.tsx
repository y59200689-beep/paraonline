'use client';

import React from 'react';
import { Product } from '@/lib/data';
import { useProducts } from '@/context/ProductsContext';
import { useWishlist } from '@/context/WishlistContext';
import { useTranslation } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { Star, Heart, ShoppingCart, Sparkles } from 'lucide-react';
import { useUi } from '@/context/UiContext';
import Image from 'next/image';
import { getOptimizedImageUrl } from '@/lib/image-optimizer';
import { useSettings } from '@/context/SettingsContext';

const cleanTitle = (title: string) => {
  return title
    .replace(/=\s*TROUSSE\s*OFFERTE/gi, '')
    .replace(/=\s*Tote\s*Bag\s*Offert/gi, '')
    .replace(/=\s*Coffret\s*Cadeau\s*Offert/gi, '')
    .trim();
};

const getVolume = (title: string) => {
  const match = title.match(/(\d+(?:ml|g|ml\b|g\b))/i);
  return match ? match[1].toLowerCase() : '50ml';
};

export const TopRatedAsymmetricGrid: React.FC = () => {
  const { language } = useTranslation();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { setSelectedProduct, triggerFlyToCart } = useUi();
  const { products } = useProducts();

  const { settings } = useSettings();
  const hp = settings?.homepageSections;

  const showSection = hp?.showTopRated ?? true;

  // Dynamically pick the 7 top-rated products or use curated selection
  const topRatedProducts = React.useMemo(() => {
    if (hp?.topRatedProductIds && hp.topRatedProductIds.length > 0) {
      return hp.topRatedProductIds
        .map(id => products.find(p => p.id === id))
        .filter((p): p is Product => !!p);
    }
    return [...products]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 7);
  }, [products, hp]);

  if (!showSection || topRatedProducts.length === 0) {
    return null;
  }

  const titleFr = hp?.topRatedTitleFr || 'Produits les Mieux Notés';
  const titleAr = hp?.topRatedTitleAr || 'المنتجات الأعلى تقييماً';

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    const clientX = e.clientX || window.innerWidth / 2;
    const clientY = e.clientY || window.innerHeight / 2;

    triggerFlyToCart(product.image, clientX, clientY);

    addToCart(product, 1);
  };

  return (
    <section className="py-10 bg-[#FAFAFA] border-b border-slate-200/40 relative overflow-hidden reveal-on-scroll">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 md:px-12 lg:px-16 xl:px-20 relative z-10">

        {/* Section Dark Title Card Banner — slim compact design matching reference */}
        <div className="relative rounded-[20px] bg-[#111827] overflow-hidden flex flex-row items-center justify-between px-6 md:px-8 border border-slate-800 shadow-lg mb-7 group" style={{ height: '72px' }}>
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#111827] via-[#111827]/90 to-transparent pointer-events-none z-10" />
          
          {/* Botanical fading image on the right */}
          <div className="absolute right-0 top-0 h-full w-[55%] pointer-events-none">
            <Image 
              src="https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=1200&auto=format&fit=crop" 
              alt="Botanical background" 
              fill
              sizes="50vw"
              className="object-cover opacity-40 mix-blend-luminosity"
            />
          </div>

          {/* Left: heading block */}
          <div className="relative z-20 flex flex-row items-center gap-4">
            <h2 className="text-[15px] md:text-[17px] font-black text-white leading-none tracking-tight">
              {language === 'AR' ? titleAr : titleFr}
            </h2>
            <span className="hidden sm:block text-[10px] font-semibold text-slate-400 border-l border-slate-700 pl-4">
            {language === 'AR' ? `${topRatedProducts.length} منتجات مختارة بعناية` : `${topRatedProducts.length} produits sélectionnés`}
            </span>
          </div>

          {/* Right: product count */}
          <div className="relative z-20 flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">
              {language === 'AR' ? 'منتجات' : 'PRODUITS'}
            </span>
            <span className="text-[22px] font-heading font-black text-white leading-none">
              {topRatedProducts.length}
            </span>
          </div>
        </div>

        {/* Asymmetric 3-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          
          {/* LEFT COLUMN: 3 Horizontal Cards */}
          <div className="lg:col-span-4 flex flex-col gap-5 justify-between">
            {topRatedProducts.slice(0, 3).map((product) => {
              const isFav = isInWishlist(product.id);
              const titleStr = cleanTitle(product.nameFr || product.title);
              const volume = getVolume(product.title);
              return (
                <div 
                  key={product.id}
                  className="bg-white rounded-[20px] border border-slate-100/90 p-4 flex flex-row items-stretch gap-4 hover:shadow-[0_12px_30px_rgba(0,0,0,0.035)] hover:border-slate-200/50 transition-all duration-300 relative group min-h-[148px]"
                >
                  {/* Heart wishlist button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
                    className={`absolute top-3 right-3 w-7 h-7 rounded-full bg-white border border-slate-100 flex items-center justify-center transition-all shadow-sm z-10 cursor-pointer ${isFav ? 'text-red-500 scale-105' : 'text-slate-400 hover:text-red-500'}`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
                  </button>

                  {/* Left image container */}
                  <div className="w-[88px] h-[88px] rounded-[14px] bg-[#F8FAF8] border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden relative self-center">
                    <Image 
                      src={getOptimizedImageUrl(product.image)} 
                      alt={titleStr} 
                      fill
                      sizes="88px"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                  </div>

                  {/* Right content */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5">
                    <div>
                      {/* Vendor Row */}
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <span className="text-[9px] font-black uppercase text-primary tracking-widest truncate">
                          {product.vendor}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-[11.5px] font-black text-slate-800 leading-snug line-clamp-2 hover:text-primary transition-colors cursor-pointer" onClick={() => handleSelectProduct(product)}>
                        {titleStr}
                      </h3>

                      {/* Rating (moved below title) */}
                      <span className="flex items-center gap-0.5 text-amber-600 text-[9.5px] font-black shrink-0 mt-1 block select-none">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400 inline mr-0.5" />
                        <span>{product.rating.toFixed(1)}</span>
                      </span>
                    </div>

                    {/* Price & Add to Cart */}
                    <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-50">
                      <div className="flex items-baseline gap-1">
                        <span className="text-[12.5px] font-sans font-black text-slate-800">{product.price} MAD</span>
                        {product.comparePrice > product.price && (
                          <span className="text-[9.5px] font-sans font-medium text-slate-400 line-through">{product.comparePrice} MAD</span>
                        )}
                      </div>

                      {/* Premium custom Add to Cart Button */}
                      <button
                        onClick={(e) => handleQuickAdd(product, e)}
                        className="px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-full flex items-center gap-1 transition-all duration-300 active:scale-95 cursor-pointer leading-none border-0 outline-none btn-gradient"
                      >
                        <span>{language === 'AR' ? 'أضف' : 'Ajouter'}</span>
                        <ShoppingCart className="w-2.5 h-2.5 text-white" />
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          {/* CENTER COLUMN: Large Featured Vertical Card */}
          {topRatedProducts[3] && (() => {
            const product = topRatedProducts[3];
            const isFav = isInWishlist(product.id);
            const titleStr = cleanTitle(product.nameFr || product.title);
            const volume = getVolume(product.title);
            return (
              <div className="lg:col-span-4">
                <div className="bg-white rounded-[24px] border border-slate-100/90 p-5 flex flex-col justify-between h-full hover:shadow-[0_15px_40px_rgba(0,0,0,0.045)] hover:border-slate-200/50 transition-all duration-300 relative group">
                  {/* Heart wishlist button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
                    className={`absolute top-4 right-4 w-9 h-9 rounded-full bg-white border border-slate-100 flex items-center justify-center transition-all shadow-sm z-10 cursor-pointer ${isFav ? 'text-red-500 scale-105' : 'text-slate-400 hover:text-red-500'}`}
                  >
                    <Heart className={`w-4 h-4 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
                  </button>

                  {/* Image container */}
                  <div className="w-full aspect-[4/3] rounded-[18px] bg-[#F8FAF8] border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden relative mb-4">
                    <Image 
                      src={getOptimizedImageUrl(product.image)} 
                      alt={titleStr} 
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                    
                    {/* Diagnostic score match indicator */}
                    <span className="absolute bottom-3 left-3 bg-[#7E57C2]/10 border border-[#7E57C2]/20 text-[#7E57C2] text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 animate-pulse" />
                      <span>{language === 'AR' ? 'شهرة واسعة' : 'POPULAIRE'}</span>
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      {/* Category and Vendor Row */}
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[9.5px] font-black uppercase text-slate-400 tracking-widest">
                          {language === 'AR' ? 'عناية فائقة' : 'SOIN PREMIUM'}
                        </span>
                       <span className="text-[10px] font-black uppercase text-primary tracking-widest">
                          {product.vendor}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 
                        className="text-[13.5px] sm:text-[14.5px] font-black text-slate-800 leading-snug line-clamp-2 hover:text-primary transition-colors cursor-pointer" 
                        onClick={() => handleSelectProduct(product)}
                      >
                        {titleStr}
                      </h3>

                      {/* Rating block */}
                      <div className="flex items-center gap-1.5 mt-2.5">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star 
                              key={s} 
                              className={`w-3.5 h-3.5 ${
                                s <= Math.round(product.rating)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'fill-slate-100 text-slate-200'
                              } stroke-none`} 
                            />
                          ))}
                        </div>
                        <span className="text-[10.5px] font-black text-slate-500 mt-0.5">
                          {product.rating.toFixed(1)} ({product.reviews} {language === 'AR' ? 'تقييم' : 'avis'})
                        </span>
                      </div>
                    </div>

                    {/* Bottom price, volume & button block */}
                    <div>
                      <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4 mt-4">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-[17px] sm:text-[19px] font-sans font-black text-slate-800">{product.price} MAD</span>
                          {product.comparePrice > product.price && (
                            <span className="text-[11px] sm:text-[12px] font-sans font-medium text-slate-400 line-through">{product.comparePrice} MAD</span>
                          )}
                        </div>
                      </div>

                      {/* Full-width Add to Cart Button */}
                      <button
                        onClick={(e) => handleQuickAdd(product, e)}
                        className="mt-4 w-full py-3 text-[11px] font-black uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98] cursor-pointer border-0 outline-none btn-gradient"
                      >
                        <span>{language === 'AR' ? 'إضافة إلى السلة' : 'Ajouter au panier'}</span>
                        <ShoppingCart className="w-3.5 h-3.5 text-white" />
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            );
          })()}

          {/* RIGHT COLUMN: 3 Horizontal Cards */}
          <div className="lg:col-span-4 flex flex-col gap-5 justify-between">
            {topRatedProducts.slice(4, 7).map((product) => {
              const isFav = isInWishlist(product.id);
              const titleStr = cleanTitle(product.nameFr || product.title);
              const volume = getVolume(product.title);
              return (
                <div 
                  key={product.id}
                  className="bg-white rounded-[20px] border border-slate-100/90 p-4 flex flex-row items-stretch gap-4 hover:shadow-[0_12px_30px_rgba(0,0,0,0.035)] hover:border-slate-200/50 transition-all duration-300 relative group min-h-[148px]"
                >
                  {/* Heart wishlist button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
                    className={`absolute top-3 right-3 w-7 h-7 rounded-full bg-white border border-slate-100 flex items-center justify-center transition-all shadow-sm z-10 cursor-pointer ${isFav ? 'text-red-500 scale-105' : 'text-slate-400 hover:text-red-500'}`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
                  </button>

                  {/* Left image container */}
                  <div className="w-[88px] h-[88px] rounded-[14px] bg-[#F8FAF8] border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden relative self-center">
                    <Image 
                      src={getOptimizedImageUrl(product.image)} 
                      alt={titleStr} 
                      fill
                      sizes="88px"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                  </div>

                  {/* Right content */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5">
                    <div>
                      {/* Vendor Row */}
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <span className="text-[9px] font-black uppercase text-primary tracking-widest truncate">
                          {product.vendor}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-[11.5px] font-black text-slate-800 leading-snug line-clamp-2 hover:text-primary transition-colors cursor-pointer" onClick={() => handleSelectProduct(product)}>
                        {titleStr}
                      </h3>

                      {/* Rating (moved below title) */}
                      <span className="flex items-center gap-0.5 text-amber-600 text-[9.5px] font-black shrink-0 mt-1 block select-none">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400 inline mr-0.5" />
                        <span>{product.rating.toFixed(1)}</span>
                      </span>
                    </div>

                    {/* Price & Add to Cart */}
                    <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-50">
                      <div className="flex items-baseline gap-1">
                        <span className="text-[12.5px] font-sans font-black text-slate-800">{product.price} MAD</span>
                        {product.comparePrice > product.price && (
                          <span className="text-[9.5px] font-sans font-medium text-slate-400 line-through">{product.comparePrice} MAD</span>
                        )}
                      </div>

                      <button
                        onClick={(e) => handleQuickAdd(product, e)}
                        className="px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-full flex items-center gap-1 transition-all duration-300 active:scale-95 cursor-pointer leading-none border-0 outline-none btn-gradient"
                      >
                        <span>{language === 'AR' ? 'أضف' : 'Ajouter'}</span>
                        <ShoppingCart className="w-2.5 h-2.5 text-white" />
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
};
