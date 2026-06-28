'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useTranslation } from '@/context/LanguageContext';
import { Product } from '@/lib/data';
import { useProducts } from '@/context/ProductsContext';
import { X, Sparkles, Check, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';
import { getOptimizedImageUrl } from '@/lib/image-optimizer';

interface RoutineBuilderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

type StepKey = 'cleanse' | 'treat' | 'hydrate' | 'protect';

interface StepConfig {
  key: StepKey;
  labelFr: string;
  labelAr: string;
  descFr: string;
  descAr: string;
  icon: string;
}

export const RoutineBuilderDrawer: React.FC<RoutineBuilderDrawerProps> = ({ isOpen, onClose }) => {
  const { language } = useTranslation();
  const { products } = useProducts();
  const { addToCart } = useCart();
  const isRTL = language === 'AR';

  // Builder States
  const [activeStep, setActiveStep] = useState<StepKey>('cleanse');
  const [selections, setSelections] = useState<Record<StepKey, Product | null>>({
    cleanse: null,
    treat: null,
    hydrate: null,
    protect: null,
  });

  // Mobile Swipe to Dismiss
  const touchStartX = useRef(0);
  const touchCurrentX = useRef(0);
  const [swipeOffset, setSwipeOffset] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setSwipeOffset(0);
      // Reset selections when drawer closes
      setSelections({
        cleanse: null,
        treat: null,
        hydrate: null,
        protect: null,
      });
      setActiveStep('cleanse');
    }
  }, [isOpen]);

  // Step configs
  const steps: StepConfig[] = [
    {
      key: 'cleanse',
      labelFr: '1. Nettoyer 🧼',
      labelAr: '1. تنظيف 🧼',
      descFr: 'Élimine impuretés, maquillage et excès de sébum.',
      descAr: 'يزيل الشوائب، المكياج والدهون الزائدة.',
      icon: '🧼'
    },
    {
      key: 'treat',
      labelFr: '2. Traiter 🧪',
      labelAr: '2. علاج 🧪',
      descFr: 'Cible l’acné, les rides, le teint terne ou les taches.',
      descAr: 'يعالج حب الشباب، التجاعيد أو البقع الداكنة.',
      icon: '🧪'
    },
    {
      key: 'hydrate',
      labelFr: '3. Hydrater 🧴',
      labelAr: '3. ترطيب 🧴',
      descFr: 'Nourrit et renforce la barrière cutanée.',
      descAr: 'يغذي ويقوي حاجز رطوبة البشرة.',
      icon: '🧴'
    },
    {
      key: 'protect',
      labelFr: '4. Protéger ☀️',
      labelAr: '4. حماية ☀️',
      descFr: 'Très haute protection UV quotidienne indispensable.',
      descAr: 'حماية عالية جداً من الأشعة فوق البنفسجية.',
      icon: '☀️'
    }
  ];

  // Dynamic products filtering based on skincare steps
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const title = product.title.toLowerCase();
      const desc = product.description.toLowerCase();
      const tags = product.tags || [];

      // Avoid bundle products in selection list
      if (product.id >= 100 && product.id <= 112) return false;

      switch (activeStep) {
        case 'cleanse':
          return (
            tags.includes('nettoyant') ||
            title.includes('nettoyant') ||
            title.includes('cleanse') ||
            title.includes('gel nettoyant') ||
            title.includes('mousse') ||
            title.includes('micellaire') ||
            title.includes('cleansing')
          );
        case 'treat':
          // Must be serum/active and NOT a cleanser/soap
          const isActive = (
            title.includes('serum') ||
            title.includes('sérum') ||
            title.includes('ampoule') ||
            title.includes('essence') ||
            title.includes('retinol') ||
            title.includes('niacinamide') ||
            title.includes('acide')
          );
          const isCleanser = title.includes('nettoyant') || title.includes('foam') || title.includes('cleansing');
          return isActive && !isCleanser;
        case 'hydrate':
          // Must be cream/lotion/balm and NOT spf/cleanser
          const isHydrating = (
            title.includes('cream') ||
            title.includes('crème') ||
            title.includes('creme') ||
            title.includes('baume') ||
            title.includes('lait') ||
            title.includes('moisturizer')
          );
          const isSunscreen = title.includes('solaire') || title.includes('spf') || title.includes('sun');
          const isCleansing = title.includes('nettoyant') || title.includes('foam');
          return isHydrating && !isSunscreen && !isCleansing;
        case 'protect':
          return (
            product.category === 'solaire' ||
            tags.includes('solaire') ||
            title.includes('solaire') ||
            title.includes('spf') ||
            title.includes('sun') ||
            title.includes('uv') ||
            title.includes('brume')
          );
        default:
          return false;
      }
    });
  }, [activeStep, products]);

  // Statistics
  const selectedList = Object.values(selections).filter(Boolean) as Product[];
  const selectedCount = selectedList.length;

  const discountPercent = useMemo(() => {
    if (selectedCount === 2) return 5;
    if (selectedCount === 3) return 10;
    if (selectedCount === 4) return 15;
    return 0;
  }, [selectedCount]);

  const originalTotal = useMemo(() => {
    return selectedList.reduce((acc, p) => acc + p.price, 0);
  }, [selectedList]);

  const finalTotal = useMemo(() => {
    if (discountPercent === 0) return originalTotal;
    return Math.round(originalTotal * (1 - discountPercent / 100));
  }, [originalTotal, discountPercent]);

  // Handle select/deselect product
  const handleSelectProduct = (product: Product) => {
    setSelections((prev) => {
      const isSelected = prev[activeStep]?.id === product.id;
      const nextSelections = { ...prev, [activeStep]: isSelected ? null : product };
      
      // Auto-advance to next empty step if we selected a product
      if (!isSelected) {
        setTimeout(() => {
          const stepOrder: StepKey[] = ['cleanse', 'treat', 'hydrate', 'protect'];
          const currentIdx = stepOrder.indexOf(activeStep);
          if (currentIdx < 3) {
            const nextStep = stepOrder[currentIdx + 1];
            if (!nextSelections[nextStep]) {
              setActiveStep(nextStep);
            }
          }
        }, 300);
      }
      return nextSelections;
    });
  };

  // Add bundle items to cart
  const handleAddBundleToCart = () => {
    if (selectedCount < 2) return;

    selectedList.forEach((product) => {
      // Create copy with adjusted bundle discount price
      const discountedPrice = Math.round(product.price * (1 - discountPercent / 100));
      const bundleProduct: Product = {
        ...product,
        price: discountedPrice,
        title: `${product.title} [Routine Bundle -${discountPercent}%]`
      };
      
      addToCart(bundleProduct, 1);
    });

    // If 4 items selected, add the Free Gift
    if (selectedCount === 4) {
      const giftProduct: Product = {
        id: 9999,
        vendor: 'Para Officinal',
        title: language === 'AR' ? 'حقيبة مخملية فاخرة (هدية مجانية)' : 'Trousse Velours Premium (Cadeau Offert)',
        price: 0,
        comparePrice: 90,
        category: 'gift',
        tags: ['gift'],
        image: '/images/categories/bebe.png',
        images: [],
        rating: 5,
        reviews: 1,
        description: 'Trousse offerte exclusive pour achat routine 4 étapes.',
        ingredients: '',
        usage: ''
      };
      addToCart(giftProduct, 1);
    }

    onClose();
  };

  // Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchCurrentX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchCurrentX.current = e.touches[0].clientX;
    const diff = touchCurrentX.current - touchStartX.current;
    const offset = isRTL ? Math.min(0, diff) : Math.max(0, diff);
    setSwipeOffset(offset);
  };

  const handleTouchEnd = () => {
    const totalSwipe = Math.abs(touchCurrentX.current - touchStartX.current);
    const isValidSwipe = isRTL 
      ? (touchCurrentX.current - touchStartX.current < -100) 
      : (touchCurrentX.current - touchStartX.current > 100);

    if (isValidSwipe && totalSwipe > 100) {
      onClose();
    }
    setSwipeOffset(0);
  };

  const getDrawerTransformStyle = () => {
    if (!isOpen) {
      return isRTL ? 'translateX(-100%)' : 'translateX(100%)';
    }
    return `translateX(${swipeOffset}px)`;
  };

  return (
    <div
      className={`fixed inset-0 bg-black/60 z-50 flex justify-end ${
        isOpen ? 'opacity-100 pointer-events-auto backdrop-blur-sm' : 'opacity-0 pointer-events-none'
      }`}
      style={{ transitionProperty: 'opacity', transitionDuration: isOpen ? '300ms' : '220ms', transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)' }}
    >
      <div className="absolute inset-0 bg-transparent" onClick={onClose} />

      {/* Drawer Body */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative w-full max-w-[500px] h-full bg-[#FAF9F6] border-l border-slate-200/50 shadow-2xl flex flex-col z-10 overflow-hidden"
        style={{
          direction: isRTL ? 'rtl' : 'ltr',
          transform: getDrawerTransformStyle(),
          transition: `transform ${isOpen ? '420ms' : '320ms'} cubic-bezier(0.22, 1, 0.36, 1)`,
          willChange: 'transform',
        }}
      >
        {/* Header toolbar */}
        <div className="py-5 px-6 border-b border-slate-200/40 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-[14px] font-black text-slate-800 leading-none">
                {language === 'FR' ? 'Routine Builder sur Mesure' : 'مصمم الروتين المخصص'}
              </h3>
              <span className="text-[9.5px] font-semibold text-slate-400 mt-1 block leading-none">
                {language === 'FR' ? 'Construisez votre routine & économisez' : 'صممي روتينكِ الخاص واحصلي على خصم'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label={language === 'FR' ? 'Fermer' : 'إغلاق'}
            className="w-9 h-9 rounded-full hover:bg-slate-100/60 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors duration-200"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Step Navigation Bar */}
        <div className="bg-white border-b border-slate-100 py-3.5 px-4 flex items-center justify-between gap-1.5 shrink-0 select-none overflow-x-auto no-scrollbar">
          {steps.map((st) => {
            const isSelected = selections[st.key] !== null;
            const isActive = activeStep === st.key;
            return (
              <button
                key={st.key}
                onClick={() => setActiveStep(st.key)}
                className={`px-3 py-2 rounded-xl text-[10.5px] font-black uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 border ${
                  isActive
                    ? 'bg-primary border-primary text-white shadow-sm'
                    : isSelected
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
                    : 'bg-slate-50 border-slate-50/40 text-slate-400 hover:text-slate-600'
                }`}
              >
                <span>{language === 'FR' ? st.labelFr.split(' ')[1] : st.labelAr.split(' ')[1]}</span>
                {isSelected && <Check className="w-3 h-3 text-emerald-500" />}
              </button>
            );
          })}
        </div>

        {/* Dynamic Step description */}
        <div className="bg-emerald-500/4 py-3 px-6 border-b border-slate-100 shrink-0 text-left">
          {steps.map((st) => {
            if (activeStep !== st.key) return null;
            return (
              <p key={st.key} className="text-[11px] font-bold text-slate-600 leading-relaxed animate-fade-in">
                {language === 'FR' ? st.descFr : st.descAr}
              </p>
            );
          })}
        </div>

        {/* Product Selection List */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-3 no-scrollbar">
          {filteredProducts.length === 0 ? (
            <div className="py-20 text-center text-xs text-slate-400 font-medium bg-white rounded-2xl border border-slate-200/50">
              {language === 'FR' ? 'Aucun produit disponible pour cette étape.' : 'لا يوجد منتجات متاحة لهذه الخطوة.'}
            </div>
          ) : (
            filteredProducts.map((product) => {
              const isSelected = selections[activeStep]?.id === product.id;
              return (
                <div
                  key={product.id}
                  onClick={() => handleSelectProduct(product)}
                  className={`bg-white border rounded-2xl p-4 flex items-center gap-4 cursor-pointer transition-all duration-300 relative overflow-hidden hover:shadow-md ${
                    isSelected
                      ? 'border-emerald-500 shadow-[0_4px_16px_rgba(16,185,129,0.06)]'
                      : 'border-slate-200/50'
                  }`}
                >
                  {/* Selected check tag */}
                  {isSelected && (
                    <div className="absolute top-0 right-0 bg-emerald-500 text-white p-1 rounded-bl-xl">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}

                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-100 shrink-0 overflow-hidden flex items-center justify-center">
                    {product.image ? (
                      <img
                        src={getOptimizedImageUrl(product.image)}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-slate-300 text-2xl select-none">✦</span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 text-left">
                    <span className="text-[9px] font-black uppercase text-gold leading-none">
                      {product.vendor}
                    </span>
                    <h4 className="text-xs font-bold text-slate-800 mt-1 truncate pr-6 leading-tight">
                      {product.title}
                    </h4>
                    <p className="text-[9.5px] text-slate-400 font-medium truncate mt-0.5 leading-snug">
                      {product.description}
                    </p>
                    <div className="flex items-baseline gap-2 mt-1.5">
                      <span className="text-sm font-black text-primary leading-none">
                        {product.price} DH
                      </span>
                      {product.comparePrice > product.price && (
                        <span className="text-[10px] font-semibold text-slate-400 line-through leading-none">
                          {product.comparePrice} DH
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer pricing Summary Card */}
        <div className="py-5 px-6 border-t border-slate-200/40 bg-white flex flex-col gap-4 shrink-0">
          
          {/* Bundle Tier discounts details */}
          <div className="flex items-center justify-between text-xs select-none">
            <span className="text-slate-500 font-bold">
              {language === 'FR' ? 'Progression du pack :' : 'تقدم الباقة :'}
            </span>
            <span className="text-primary font-black uppercase tracking-wider">
              {selectedCount}/4 {language === 'FR' ? 'sélectionnés' : 'محدد'}
            </span>
          </div>

          {/* Progress mini dots indicators */}
          <div className="flex gap-1.5 w-full">
            {[1, 2, 3, 4].map((i) => {
              const filled = selectedCount >= i;
              return (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                    filled ? 'bg-gradient-to-r from-primary to-accent' : 'bg-slate-100'
                  }`}
                />
              );
            })}
          </div>

          {/* Discount levels notification banner */}
          <div className="bg-primary/5 rounded-xl px-4 py-3 flex items-start gap-2.5 border border-primary/10 select-none">
            <Sparkles className="w-4.5 h-4.5 text-accent shrink-0 mt-0.5" />
            <div className="text-left">
              <span className="text-[10.5px] font-black text-primary-dark uppercase tracking-wider block">
                {language === 'FR' ? 'Niveaux d’Économie :' : 'مستويات التوفير :'}
              </span>
              <p className="text-[9.5px] text-slate-500 font-semibold leading-relaxed mt-0.5">
                {language === 'FR'
                  ? '2 produits = -5% | 3 produits = -10% | 4 produits = -15% + Cadeau'
                  : 'منتجين = خصم 5% | 3 منتجات = خصم 10% | 4 منتجات = خصم 15% + هدية'}
              </p>
            </div>
          </div>

          {/* Summary totals */}
          {selectedCount >= 2 && (
            <div className="flex items-center justify-between py-1 animate-fade-in">
              <div className="text-left leading-none">
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none block">
                  {language === 'FR' ? `PROMO BUNDLE -${discountPercent}%` : `خصم الباقة -${discountPercent}%`}
                </span>
                <span className="text-slate-400 font-medium text-[11px] line-through mt-1 block">
                  {originalTotal} DH
                </span>
              </div>
              <span className="text-xl font-black text-primary">
                {finalTotal} DH
              </span>
            </div>
          )}

          {/* Submit action button */}
          <button
            onClick={handleAddBundleToCart}
            disabled={selectedCount < 2}
            className={`w-full py-3.5 px-6 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer border-0 outline-none ${
              selectedCount >= 2
                ? 'bg-gradient-to-r from-primary to-teal-900 text-white hover:from-primary-dark shadow-md active:scale-98'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>
              {selectedCount < 2
                ? (language === 'FR' ? 'Sélectionnez au moins 2 étapes' : 'حددي خطوتين على الأقل')
                : (language === 'FR' ? 'Ajouter la routine au panier' : 'إضافة الروتين للسلة')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
