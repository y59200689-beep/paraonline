'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useTranslation } from '@/context/LanguageContext';
import { Product } from '@/lib/data';
import { useProducts } from '@/context/ProductsContext';
import { X, Check, ShoppingBag } from 'lucide-react';
import { getOptimizedImageUrl } from '@/lib/image-optimizer';

interface RoutineBundleDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoutineBundleDrawer: React.FC<RoutineBundleDrawerProps> = ({ isOpen, onClose }) => {
  const { addToCart, applyDailyGift } = useCart();
  const { language } = useTranslation();
  const { products } = useProducts();

  // t-panel-slide / drawer animation states
  const [isVisible, setIsVisible] = useState(false);
  const [drawerState, setDrawerState] = useState<'closed' | 'opening' | 'open' | 'closing'>('closed');
  const closeMs = 320; // Matches panel close duration

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setDrawerState('open'));
      });
    } else if (drawerState === 'open') {
      setDrawerState('closing');
      const t = setTimeout(() => {
        setDrawerState('closed');
        setIsVisible(false);
      }, closeMs);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [selectedCleanse, setSelectedCleanse] = useState<Product | null>(null);
  const [selectedTreat, setSelectedTreat] = useState<Product | null>(null);
  const [selectedProtect, setSelectedProtect] = useState<Product | null>(null);

  // Group products specifically for steps
  const STEP_1_PRODUCTS = products.filter(p => [15, 22].includes(p.id));
  const STEP_2_PRODUCTS = products.filter(p => [14, 7, 3, 8].includes(p.id));
  const STEP_3_PRODUCTS = products.filter(p => [13, 17, 1].includes(p.id));

  const isRTL = language === 'AR';

  // Calculations
  const getSubtotal = () => {
    let sum = 0;
    if (selectedCleanse) sum += selectedCleanse.price;
    if (selectedTreat) sum += selectedTreat.price;
    if (selectedProtect) sum += selectedProtect.price;
    return sum;
  };

  const getDiscountedTotal = () => {
    let sum = 0;
    if (selectedCleanse) sum += Math.round(selectedCleanse.price * 0.85);
    if (selectedTreat) sum += Math.round(selectedTreat.price * 0.85);
    if (selectedProtect) sum += Math.round(selectedProtect.price * 0.85);
    return sum;
  };

  const subtotal = getSubtotal();
  const discountedTotal = getDiscountedTotal();
  const discountAmount = subtotal - discountedTotal;
  const isRoutineComplete = selectedCleanse && selectedTreat && selectedProtect;

  const handleSelectProduct = (product: Product) => {
    if (activeStep === 1) {
      setSelectedCleanse(product);
      setTimeout(() => setActiveStep(2), 250);
    } else if (activeStep === 2) {
      setSelectedTreat(product);
      setTimeout(() => setActiveStep(3), 250);
    } else if (activeStep === 3) {
      setSelectedProtect(product);
    }
  };

  const handleAddRoutineToCart = () => {
    if (!isRoutineComplete) return;

    // Add all 3 items with specialDiscount applied
    if (selectedCleanse) addToCart(selectedCleanse, 1, true);
    if (selectedTreat) addToCart(selectedTreat, 1, true);
    if (selectedProtect) addToCart(selectedProtect, 1, true);

    // Apply the Free clinical Spa Headband gift!
    const giftName = language === 'FR' ? 'Bandeau Spa Clinique Offert' : 'رباط شعر للسبا هدية مجانية';
    applyDailyGift('ROUTINE_BUNDLE_GIFT', giftName);

    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-[300ms] ${
          drawerState === 'open' ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Drawer Body */}
      <div 
        className="relative w-full max-w-[500px] bg-white h-full shadow-2xl flex flex-col z-10 overflow-hidden border-l border-border/20"
        style={{ 
          direction: isRTL ? 'rtl' : 'ltr',
          transform: drawerState === 'open' ? 'translateX(0)' : (isRTL ? 'translateX(-100%)' : 'translateX(100%)'),
          transition: `transform ${drawerState === 'open' ? '420ms' : '320ms'} cubic-bezier(0.22, 1, 0.36, 1)`,
          willChange: 'transform'
        }}
      >
        {/* Ambient decorative glowing spots */}
        <div className="absolute top-0 right-0 w-44 h-44 rounded-full bg-primary/8 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-44 h-44 rounded-full bg-accent/6 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="p-6 border-b border-border/30 flex items-center justify-between shrink-0 bg-white/90 backdrop-blur-md relative z-10">
          <div className="space-y-1">
            <h3 className="text-md md:text-lg font-black uppercase text-primary-dark tracking-tight flex items-center gap-1.5">
              <span>{language === 'FR' ? 'Routine Sur-Mesure' : 'روتينكِ المخصص'}</span>
            </h3>
            <span className="text-[10px] font-bold text-foreground/50 block">
              {language === 'FR' ? 'Un rituels en 3 étapes avec -15% et Cadeau Offert !' : 'روتين من 3 خطوات بخصم 15% وهدية مجانية!'}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Trail Selector */}
        <div className="bg-slate-50 border-b border-solid border-slate-100 px-6 py-4 grid grid-cols-3 gap-2 shrink-0 relative z-10">
          {[
            { step: 1, labelFr: '01 Nettoyer', labelAr: '01 تنظيف', active: selectedCleanse },
            { step: 2, labelFr: '02 Traiter', labelAr: '02 معالجة', active: selectedTreat },
            { step: 3, labelFr: '03 Protéger', labelAr: '03 حماية', active: selectedProtect },
          ].map(item => {
            const isStepActive = activeStep === item.step;
            return (
              <button
                key={item.step}
                onClick={() => setActiveStep(item.step as 1 | 2 | 3)}
                className={`px-3 py-2.5 rounded-[8px] border text-[10px] font-black uppercase tracking-wider transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
                  isStepActive
                    ? 'bg-primary border-primary text-white shadow-sm shadow-primary/10'
                    : item.active
                      ? 'bg-emerald-50 border-emerald-100 text-emerald-700 font-black'
                      : 'bg-white border-border/40 text-foreground/50 hover:bg-slate-100'
                }`}
              >
                {item.active && <Check className="w-3.5 h-3.5" />}
                <span>{language === 'FR' ? item.labelFr : item.labelAr}</span>
              </button>
            );
          })}
        </div>

        {/* Products Scroll Track */}
        <div 
          className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar relative z-10"
          style={{ maxHeight: 'calc(100vh - 360px)' }}
        >
          {/* Active Product Choice Loop */}
          <div className="space-y-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-accent block">
              {activeStep === 1 
                ? (language === 'FR' ? 'Étape 1 : Choisissez un Nettoyeur' : 'الخطوة 1 : اختاري منظفاً للبشرة')
                : activeStep === 2
                  ? (language === 'FR' ? 'Étape 2 : Choisissez un Sérum / Hydratant' : 'الخطوة 2 : اختاري سيروم معالج')
                  : (language === 'FR' ? 'Étape 3 : Choisissez un Écran Solaire️' : 'الخطوة 3 : اختاري واقياً شمسياً️')
              }
            </span>

            <div className="grid grid-cols-1 gap-4">
              {(activeStep === 1 
                ? STEP_1_PRODUCTS 
                : activeStep === 2 
                  ? STEP_2_PRODUCTS 
                  : STEP_3_PRODUCTS
              ).map(product => {
                const isSelected = 
                  (activeStep === 1 && selectedCleanse?.id === product.id) ||
                  (activeStep === 2 && selectedTreat?.id === product.id) ||
                  (activeStep === 3 && selectedProtect?.id === product.id);

                return (
                  <div
                    key={product.id}
                    onClick={() => handleSelectProduct(product)}
                    className={`p-4 border rounded-[10px] flex gap-4 items-center transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] cursor-pointer hover:border-primary/40 select-none ${
                      isSelected 
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/20 shadow-sm'
                        : 'border-border/50 bg-white/70 hover:bg-slate-50'
                    }`}
                  >
                    {/* Thumbnail */}
                    <img
                      src={getOptimizedImageUrl(product.image)}
                      alt={product.title}
                      className="w-16 h-16 object-cover rounded-[8px] bg-slate-50 border border-border/30 shrink-0"
                    />

                    {/* Meta Info */}
                    <div className="flex-grow min-w-0">
                      <span className="text-[9px] font-black uppercase text-teal-700 tracking-widest block">{product.vendor}</span>
                      <h4 className="text-xs font-black truncate text-primary-dark leading-tight mt-0.5">{product.title}</h4>
                      <p className="text-[10px] text-foreground/60 leading-normal line-clamp-2 mt-1">{product.description}</p>
                    </div>

                    {/* Price and Check Box */}
                    <div className="text-right shrink-0 flex flex-col items-end gap-2">
                      <div className="text-xs font-black text-primary-dark">
                        {product.price} DH
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-300 ${
                        isSelected 
                          ? 'bg-primary border-primary text-white scale-110' 
                          : 'border-border/60 bg-white'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer & Dynamic Pricing Calculation Drawer */}
        <div className="p-6 border-t border-solid border-slate-100 bg-slate-50/90 backdrop-blur-md shrink-0 space-y-4 relative z-10">
          
          {/* Unlocked accessory indicator */}
          <div className="bg-white border border-border/30 rounded-[10px] p-3 flex gap-3 items-center shadow-sm">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border transition-all duration-500 ${
              isRoutineComplete
                ? 'bg-emerald-100 border-emerald-200 text-emerald-600 animate-pulse'
                : 'bg-slate-100 border-slate-200 text-slate-400'
            }`}> </div>
            <div className="text-[10px] leading-relaxed">
              <span className="font-extrabold uppercase tracking-wider block text-primary-dark">
                {isRoutineComplete 
                  ? (language === 'FR' ? 'Cadeau Débloqué !' : 'تم فتح الهدية المجانية !')
                  : (language === 'FR' ? 'Cadeau de Routine' : 'هدية الروتين المجانية')
                }
              </span>
              <p className="text-foreground/70 font-medium">
                {isRoutineComplete
                  ? (language === 'FR' ? 'Bandeau Spa Clinique Offert ajouté au panier !' : 'تمت إضافة رباط شعر للسبا هدية مجانية!')
                  : (language === 'FR' ? 'Complétez les 3 étapes pour débloquer votre cadeau.' : 'أكملي الخطوات الثلاث لفتح الهدية المجانية.')}
              </p>
            </div>
          </div>

          {/* Pricing calculations */}
          <div className="space-y-1.5 px-0.5">
            <div className="flex justify-between text-[11px] font-bold text-foreground/60">
              <span>{language === 'FR' ? 'Sous-total régulier' : 'المجموع العادي'}</span>
              <span>{subtotal.toFixed(2)} DH</span>
            </div>
            {isRoutineComplete && (
              <div className="flex justify-between text-[11px] font-black text-emerald-600">
                <span>{language === 'FR' ? 'Économies de Pack (-15%)' : 'خصم الباك المخصص (-15%)'}</span>
                <span>-{discountAmount.toFixed(2)} DH</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-black text-primary-dark pt-1.5 border-t border-dashed border-slate-200">
              <span>{language === 'FR' ? 'Total du Pack' : 'مجموع الباك'}</span>
              <span className="text-lg text-primary font-black">{discountedTotal.toFixed(2)} DH</span>
            </div>
          </div>

          {/* Core submit button */}
          <button
            onClick={handleAddRoutineToCart}
            disabled={!isRoutineComplete}
            className={`w-full py-4 text-xs font-black uppercase tracking-widest rounded-[8px] transition-all duration-300 flex items-center justify-center gap-2 shadow-md cursor-pointer ${
              isRoutineComplete
                ? 'bg-primary hover:bg-accent text-white active:scale-[0.98]'
                : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed'
            }`}
          >
            <ShoppingBag className="w-4.5 h-4.5" />
            <span>{language === 'FR' ? 'Ajouter mon Pack au Panier' : 'إضافة روتيني المخصص للسلة'}</span>
          </button>

        </div>

      </div>
    </div>
  );
};
