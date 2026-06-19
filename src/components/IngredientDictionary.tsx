'use client';

import React, { useState } from 'react';
import { useTranslation } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { INGREDIENTS_GLOSSARY, PRODUCTS_DB, Product } from '../lib/data';
import { ShieldCheck, Heart, AlertCircle, Sparkles, Star, ShoppingBag, Check } from 'lucide-react';

export const IngredientDictionary: React.FC = () => {
  const { language } = useTranslation();
  const { addToCart } = useCart();
  const [selectedKey, setSelectedKey] = useState<string>('niacinamide');
  const [addedProductId, setAddedProductId] = useState<number | null>(null);

  React.useEffect(() => {
    const handleSelect = (e: Event) => {
      const customEvent = e as CustomEvent<{ key: string }>;
      if (customEvent.detail && customEvent.detail.key) {
        setSelectedKey(customEvent.detail.key);
      }
    };
    window.addEventListener('select_glossary_ingredient', handleSelect);
    return () => window.removeEventListener('select_glossary_ingredient', handleSelect);
  }, []);

  const selectedIngredient = INGREDIENTS_GLOSSARY[selectedKey];

  // Map ingredients to PRODUCTS_DB items
  const getIngredientProducts = (key: string): Product[] => {
    switch (key) {
      case 'niacinamide':
        return PRODUCTS_DB.filter(p => p.id === 14 || p.id === 3 || p.id === 16);
      case 'centella asiatica':
        return PRODUCTS_DB.filter(p => p.id === 17 || p.id === 16 || p.id === 14);
      case 'retinol':
        return PRODUCTS_DB.filter(p => p.id === 8);
      case 'vitamine c':
        return PRODUCTS_DB.filter(p => p.id === 3 || p.id === 14);
      case 'acide hyaluronique':
        return PRODUCTS_DB.filter(p => p.id === 7 || p.id === 5 || p.id === 6 || p.id === 17);
      case 'acide tranexamique':
        return PRODUCTS_DB.filter(p => p.id === 14 || p.id === 16);
      case 'squalane':
        return PRODUCTS_DB.filter(p => p.id === 5);
      case 'acide salicylique':
        return PRODUCTS_DB.filter(p => p.id === 3 || p.id === 22);
      default:
        return [];
    }
  };

  const getSafetyLevel = (safetyStr: string) => {
    const s = safetyStr.toLowerCase();
    if (s.includes('très') || s.includes('آمن')) return { pct: 100, color: 'bg-emerald-500', text_fr: 'Excellent', text_ar: 'ممتاز' };
    if (s.includes('sûr') || s.includes('آمن')) return { pct: 85, color: 'bg-teal-500', text_fr: 'Sûr', text_ar: 'آمن' };
    return { pct: 70, color: 'bg-amber-500', text_fr: 'Actif Fort', text_ar: 'مكون نشط قوي' };
  };

  const matchedProducts = getIngredientProducts(selectedKey);
  const safetyInfo = selectedIngredient ? getSafetyLevel(language === 'FR' ? selectedIngredient.safety_fr : selectedIngredient.safety_ar) : { pct: 90, color: 'bg-emerald-500', text_fr: 'Sûr', text_ar: 'آمن' };

  const handleQuickAdd = (product: Product) => {
    addToCart(product, 1);
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 1200);
  };

  const isRTL = language === 'AR';

  return (
    <section id="ingredient-dictionary" className="py-28 bg-background border-t border-border/20">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 md:px-16 lg:px-20 xl:px-24">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{language === 'FR' ? 'Encyclopédie Dermo-Active' : 'قاموس المكونات الجلدية'}</span>
          </div>
          <h2 className="text-2.5xl md:text-3.5xl font-black font-heading text-primary-dark leading-tight">
            {language === 'FR' ? 'Décryptez les Actifs Cliniques' : 'افهمي المكونات النشطة وفوائدها'}
          </h2>
          <p className="text-xs text-foreground/70 max-w-lg leading-relaxed font-medium">
            {language === 'FR'
              ? 'La transparence scientifique absolue. Découvrez l\'indice de sécurité et les bénéfices prouvés de chaque ingrédient actif.'
              : 'الشفافية العلمية المطلقة لجمالكِ. اكتشفي مؤشر الأمان والفوائد المثبتة علمياً لكل مكون نشط.'}
          </p>
        </div>

        {/* Dynamic dictionary split screen */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.8fr] gap-12 items-stretch">
          
          {/* Left panel: Ingredients Scroller & glossary picker */}
          <div className="bg-white border border-border/20 rounded-2xl p-6 shadow-sm flex flex-col justify-between" style={{ maxHeight: '600px' }}>
            <span className="text-[10px] font-black uppercase tracking-wider text-foreground/70 border-b border-border/20 pb-3 block">
              🧪 {language === 'FR' ? 'Glossaire Scientifique' : 'المكونات المتاحة'}
            </span>
            <div className="overflow-y-auto flex-1 mt-4 space-y-2 pr-1 no-scrollbar">
              {Object.keys(INGREDIENTS_GLOSSARY).map((key) => {
                const ing = INGREDIENTS_GLOSSARY[key];
                const isActive = selectedKey === key;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedKey(key)}
                    className={`w-full p-3 rounded-xl text-left transition-all duration-200 flex items-center gap-3.5 cursor-pointer ${
                      isActive
                        ? 'bg-primary/10 text-primary shadow-sm'
                        : 'hover:bg-slate-50 text-foreground/75'
                    }`}
                    style={{ textAlign: isRTL ? 'right' : 'left', direction: isRTL ? 'rtl' : 'ltr' }}
                  >
                    <span className="text-lg w-8 h-8 rounded-lg bg-white border border-slate-100/50 flex items-center justify-center shadow-sm shrink-0">
                      {ing.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-black block text-primary-dark truncate">
                        {language === 'FR' ? ing.name_fr : ing.name_ar}
                      </span>
                      <span className="text-[9px] uppercase tracking-widest text-foreground/50 font-bold mt-0.5 block">
                        {language === 'FR' ? ing.benefit_fr : ing.benefit_ar}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right panel: Ingredient detailed info card and product match */}
          {selectedIngredient && (
            <div className="flex flex-col gap-6 justify-between">
              
              {/* Ingredient Card Details */}
              <div className={`bg-white border border-border/20 rounded-2xl p-7 md:p-10 shadow-sm space-y-6 flex-1 relative ${isRTL ? 'text-right' : ''}`}>
                <div className={`flex items-start justify-between gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-gold tracking-widest block">
                      {language === 'FR' ? 'COMPOSITION & LABS' : 'التحليل المعملي للمكون'}
                    </span>
                    <h3 className="text-xl md:text-2xl font-black font-heading text-primary-dark flex items-center gap-2">
                      <span className="text-2xl">{selectedIngredient.icon}</span>
                      <span>{language === 'FR' ? selectedIngredient.name_fr : selectedIngredient.name_ar}</span>
                    </h3>
                  </div>

                  {/* Safety Indicator Tag */}
                  <div className="text-right shrink-0">
                    <span className="text-[9px] font-black uppercase text-foreground/75 block">{language === 'FR' ? 'Indice de Sécurité' : 'مؤشر الأمان'}</span>
                    <span className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[9px] font-extrabold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{language === 'FR' ? selectedIngredient.safety_fr : selectedIngredient.safety_ar}</span>
                    </span>
                  </div>
                </div>

                {/* Safety Meter Progress Bar */}
                <div className="space-y-2 bg-muted/40 p-4.5 rounded-xl">
                  <div className="flex justify-between text-[10px] font-black uppercase text-primary-dark">
                    <span>{language === 'FR' ? 'Seuil de tolérance cutanée' : 'درجة تحمل البشرة للمكون'}</span>
                    <span>{safetyInfo.pct}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${safetyInfo.color} transition-all duration-1000`}
                      style={{ width: `${safetyInfo.pct}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-accent tracking-widest block">
                    {language === 'FR' ? 'Rapport d\'efficacité' : 'الفعالية والتأثير'}
                  </span>
                  <p className="text-[11.5px] leading-relaxed text-foreground/70 font-medium font-body">
                    {language === 'FR' ? selectedIngredient.desc_fr : selectedIngredient.desc_ar}
                  </p>
                </div>
              </div>

              {/* Matched Products Card List */}
              {matchedProducts.length > 0 && (
                <div className="space-y-3.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-foreground/70 block text-center lg:text-left rtl:lg:text-right px-1">
                    🛍️ {language === 'FR' ? `Produits en Stock avec cet actif (${matchedProducts.length})` : `المنتجات المتوفرة بالسليكون تحتوي على هذا المكون (${matchedProducts.length})`}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {matchedProducts.slice(0, 2).map((product) => {
                      const isAdded = addedProductId === product.id;
                      return (
                        <div
                          key={product.id}
                          className="bg-slate-50/50 border border-slate-100/60 rounded-xl p-4 flex gap-4 items-center shadow-sm hover:shadow-md transition-shadow"
                        >
                          <img
                            src={product.image}
                            alt=""
                            className="w-14 h-14 object-cover rounded-lg bg-white shrink-0"
                          />
                          <div className="flex-1 min-w-0 space-y-1.5 text-left">
                            <div>
                              <span className="text-[8px] font-black uppercase tracking-widest text-gold block">{product.vendor}</span>
                              <h4 className="text-[11px] font-extrabold text-primary-dark leading-tight truncate">{product.title}</h4>
                            </div>
                            <div className="flex items-center justify-between gap-2 pt-0.5">
                              <span className="text-xs font-black text-primary-dark">{product.price} DH</span>
                              <button
                                onClick={() => handleQuickAdd(product)}
                                disabled={isAdded}
                                className={`px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-colors flex items-center gap-1 cursor-pointer ${
                                  isAdded
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-primary hover:bg-accent text-white'
                                }`}
                              >
                                {isAdded ? (
                                  <>
                                    <Check className="w-2.5 h-2.5 shrink-0" />
                                    <span>{language === 'FR' ? 'Ajouté' : 'تم'}</span>
                                  </>
                                ) : (
                                  <>
                                    <ShoppingBag className="w-2.5 h-2.5 shrink-0" />
                                    <span>{language === 'FR' ? 'Prendre' : 'شراء'}</span>
                                  </>
                                )}
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
          )}

        </div>

      </div>
    </section>
  );
};
