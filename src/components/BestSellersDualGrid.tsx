'use client';

import React from 'react';
import { Product } from '@/lib/data';
import { useProducts } from '@/context/ProductsContext';
import { useWishlist } from '@/context/WishlistContext';
import { useTranslation } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { Star, Heart, ShoppingCart } from 'lucide-react';
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

export const BestSellersDualGrid: React.FC = () => {
  const { language } = useTranslation();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { products } = useProducts();

  const { settings } = useSettings();
  const hp = settings?.homepageSections;

  const showBestSellers = hp?.showBestSellers ?? true;
  const showWeeklySales = hp?.showWeeklySales ?? true;

  // Dynamically pick products from real catalog sorted by reviews or use curated selection
  const bestSellingProducts = React.useMemo(() => {
    if (hp?.bestSellersProductIds && hp.bestSellersProductIds.length > 0) {
      return hp.bestSellersProductIds
        .map(id => products.find(p => p.id === id))
        .filter((p): p is Product => !!p);
    }
    const sorted = [...products].sort((a, b) => (b.reviews ?? 0) - (a.reviews ?? 0));
    return sorted.slice(0, 4);
  }, [products, hp]);

  const topSellingProducts = React.useMemo(() => {
    if (hp?.weeklySalesProductIds && hp.weeklySalesProductIds.length > 0) {
      return hp.weeklySalesProductIds
        .map(id => products.find(p => p.id === id))
        .filter((p): p is Product => !!p);
    }
    const sorted = [...products].sort((a, b) => (b.reviews ?? 0) - (a.reviews ?? 0));
    return sorted.slice(4, 8);
  }, [products, hp]);

  if ((!showBestSellers || bestSellingProducts.length === 0) && (!showWeeklySales || topSellingProducts.length === 0)) {
    return null;
  }

  const bestTitleFr = hp?.bestSellersTitleFr || 'Produits les Plus Vendus';
  const bestTitleAr = hp?.bestSellersTitleAr || 'المنتجات الأكثر مبيعاً';

  const weeklyTitleFr = hp?.weeklySalesTitleFr || 'Meilleures Ventes de la Semaine';
  const weeklyTitleAr = hp?.weeklySalesTitleAr || 'أفضل المنتجات مبيعاً';

  const isRTL = language === 'AR';

  const { setSelectedProduct, triggerFlyToCart } = useUi();

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
        <div className={`grid grid-cols-1 ${
          showBestSellers && bestSellingProducts.length > 0 && showWeeklySales && topSellingProducts.length > 0
            ? 'lg:grid-cols-2 gap-8 lg:gap-12' 
            : 'max-w-2xl mx-auto'
        }`}>
          
          {/* Column 1: Best Selling Products */}
          {showBestSellers && bestSellingProducts.length > 0 && (
            <div className="flex flex-col gap-6">
            {/* Banner */}
            <div className="relative rounded-[20px] bg-[#111827] overflow-hidden flex flex-row items-center justify-between px-6 border border-slate-800 shadow-md group h-[96px]">
              <div className="absolute inset-0 bg-gradient-to-r from-[#111827] via-[#111827]/90 to-transparent pointer-events-none z-10" />
              <div className="absolute right-0 top-0 h-full w-[50%] pointer-events-none">
                <Image 
                  src="https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=600&auto=format&fit=crop" 
                  alt="Botanical background" 
                  fill
                  sizes="50vw"
                  className="object-cover opacity-35 mix-blend-luminosity"
                />
              </div>
              <div className="relative z-20 flex flex-col justify-center">
                <h2 className="text-[16px] md:text-[18px] font-black text-white tracking-tight leading-snug">
                  {isRTL ? bestTitleAr : bestTitleFr}
                </h2>
                <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                  {isRTL ? `${bestSellingProducts.length} منتجات` : `${bestSellingProducts.length} Produits`}
                </span>
              </div>
            </div>

            {/* Product Cards List */}
            <div className="flex flex-col gap-4">
              {bestSellingProducts.map((product) => {
                const isFav = isInWishlist(product.id);
                const titleStr = cleanTitle(product.nameFr || product.title);
                const volume = getVolume(product.title);
                return (
                  <div 
                    key={product.id}
                    className="bg-white rounded-[20px] border border-slate-100/90 p-4 flex flex-row items-stretch gap-4 hover:shadow-[0_12px_30px_rgba(0,0,0,0.035)] hover:border-slate-200/50 transition-all duration-300 relative group min-h-[128px]"
                  >
                    {/* Heart wishlist button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
                      className={`absolute top-3 right-3 w-7 h-7 rounded-full bg-white border border-slate-100 flex items-center justify-center transition-all shadow-sm z-10 cursor-pointer ${isFav ? 'text-red-500 scale-105' : 'text-slate-400 hover:text-red-500'}`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
                    </button>

                    {/* Left image container */}
                    <div className="w-[80px] h-[80px] rounded-[14px] bg-[#F8FAF8] flex items-center justify-center shrink-0 overflow-hidden relative self-center">
                      <Image 
                        src={getOptimizedImageUrl(product.image)} 
                        alt={titleStr} 
                        fill
                        sizes="80px"
                        className="object-cover scale-[1.04] transition-transform duration-500 ease-out group-hover:scale-[1.09]"
                      />
                    </div>

                    {/* Right content */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        {/* Title */}
                        <h3 
                          className="text-[12px] font-black text-slate-800 leading-snug line-clamp-1 hover:text-primary transition-colors cursor-pointer pr-8"
                          onClick={() => handleSelectProduct(product)}
                        >
                          {titleStr}
                        </h3>

                        {/* Attributes: Rating & Brand inline */}
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="flex items-center gap-0.5 text-amber-600 text-[9.5px] font-black shrink-0">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{product.rating.toFixed(1)}</span>
                          </span>
                          <span className="text-slate-200 text-[9px]">•</span>
                          <span className="text-[9.5px] font-black uppercase text-primary tracking-widest truncate">
                            {product.vendor}
                          </span>
                        </div>
                      </div>

                      {/* Price & Add to Cart */}
                      <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-slate-50">
                        <div className="flex items-baseline gap-1.5 flex-wrap">
                          <span className="text-[14px] font-sans font-black text-accent">{product.price} MAD</span>
                          {product.comparePrice > product.price && (
                            <span className="text-[10px] font-sans font-medium text-slate-400 line-through">{product.comparePrice} MAD</span>
                          )}
                        </div>

                        {/* Custom Add to Cart Button matching screenshot */}
                        <button
                          onClick={(e) => handleQuickAdd(product, e)}
                          className="px-3 py-1.5 text-[9.5px] font-black uppercase tracking-wider rounded-full flex items-center gap-1.5 transition-all duration-300 active:scale-95 cursor-pointer leading-none border-0 outline-none btn-gradient"
                        >
                          <span>{isRTL ? 'أضف' : 'Ajouter'}</span>
                          <div className="w-4 h-4 bg-white/10 rounded-full flex items-center justify-center">
                            <ShoppingCart className="w-2.5 h-2.5 text-white" />
                          </div>
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          )}

          {/* Column 2: Top Selling Products */}
          {showWeeklySales && topSellingProducts.length > 0 && (
            <div className="flex flex-col gap-6">
            {/* Banner */}
            <div className="relative rounded-[20px] bg-[#111827] overflow-hidden flex flex-row items-center justify-between px-6 border border-slate-800 shadow-md group h-[96px]">
              <div className="absolute inset-0 bg-gradient-to-r from-[#111827] via-[#111827]/90 to-transparent pointer-events-none z-10" />
              <div className="absolute right-0 top-0 h-full w-[50%] pointer-events-none">
                <Image 
                  src="https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=600&auto=format&fit=crop" 
                  alt="Botanical background" 
                  fill
                  sizes="50vw"
                  className="object-cover opacity-35 mix-blend-luminosity"
                />
              </div>
              <div className="relative z-20 flex flex-col justify-center">
                <h2 className="text-[16px] md:text-[18px] font-black text-white tracking-tight leading-snug">
                  {isRTL ? weeklyTitleAr : weeklyTitleFr}
                </h2>
                <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                  {isRTL ? `${topSellingProducts.length} منتجات` : `${topSellingProducts.length} Produits`}
                </span>
              </div>
            </div>

            {/* Product Cards List */}
            <div className="flex flex-col gap-4">
              {topSellingProducts.map((product) => {
                const isFav = isInWishlist(product.id);
                const titleStr = cleanTitle(product.nameFr || product.title);
                const volume = getVolume(product.title);
                return (
                  <div 
                    key={product.id}
                    className="bg-white rounded-[20px] border border-slate-100/90 p-4 flex flex-row items-stretch gap-4 hover:shadow-[0_12px_30px_rgba(0,0,0,0.035)] hover:border-slate-200/50 transition-all duration-300 relative group min-h-[128px]"
                  >
                    {/* Heart wishlist button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
                      className={`absolute top-3 right-3 w-7 h-7 rounded-full bg-white border border-slate-100 flex items-center justify-center transition-all shadow-sm z-10 cursor-pointer ${isFav ? 'text-red-500 scale-105' : 'text-slate-400 hover:text-red-500'}`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
                    </button>

                    {/* Left image container */}
                    <div className="w-[80px] h-[80px] rounded-[14px] bg-[#F8FAF8] flex items-center justify-center shrink-0 overflow-hidden relative self-center">
                      <Image 
                        src={getOptimizedImageUrl(product.image)} 
                        alt={titleStr} 
                        fill
                        sizes="80px"
                        className="object-cover scale-[1.04] transition-transform duration-500 ease-out group-hover:scale-[1.09]"
                      />
                    </div>

                    {/* Right content */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        {/* Title */}
                        <h3 
                          className="text-[12px] font-black text-slate-800 leading-snug line-clamp-1 hover:text-primary transition-colors cursor-pointer pr-8"
                          onClick={() => handleSelectProduct(product)}
                        >
                          {titleStr}
                        </h3>

                        {/* Attributes: Rating & Brand inline */}
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="flex items-center gap-0.5 text-amber-600 text-[9.5px] font-black shrink-0">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{product.rating.toFixed(1)}</span>
                          </span>
                          <span className="text-slate-200 text-[9px]">•</span>
                          <span className="text-[9.5px] font-black uppercase text-primary tracking-widest truncate">
                            {product.vendor}
                          </span>
                        </div>
                      </div>

                      {/* Price & Add to Cart */}
                      <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-slate-50">
                        <div className="flex items-baseline gap-1.5 flex-wrap">
                          <span className="text-[14px] font-sans font-black text-accent">{product.price} MAD</span>
                          {product.comparePrice > product.price && (
                            <span className="text-[10px] font-sans font-medium text-slate-400 line-through">{product.comparePrice} MAD</span>
                          )}
                        </div>

                        {/* Custom Add to Cart Button matching screenshot */}
                        <button
                          onClick={(e) => handleQuickAdd(product, e)}
                          className="px-3 py-1.5 text-[9.5px] font-black uppercase tracking-wider rounded-full flex items-center gap-1.5 transition-all duration-300 active:scale-95 cursor-pointer leading-none border-0 outline-none btn-gradient"
                        >
                          <span>{isRTL ? 'أضف' : 'Ajouter'}</span>
                          <div className="w-4 h-4 bg-white/10 rounded-full flex items-center justify-center">
                            <ShoppingCart className="w-2.5 h-2.5 text-white" />
                          </div>
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          )}

        </div>
      </div>
    </section>
  );
};
