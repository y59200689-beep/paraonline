'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { INGREDIENTS_GLOSSARY, Product } from '@/lib/data';
import { useProducts } from '@/context/ProductsContext';
import { ShieldCheck, ShoppingBag, Check, Sparkles, FlaskConical, Zap } from 'lucide-react';
import { useUi } from '@/context/UiContext';

export const IngredientDictionary: React.FC = () => {
  const { language } = useTranslation();
  const { products } = useProducts();
  const { addToCart } = useCart();
  const { activeGlossaryKey: selectedKey, setActiveGlossaryKey: setSelectedKey } = useUi();
  const [addedProductId, setAddedProductId] = useState<number | null>(null);

  const selectedIngredient = INGREDIENTS_GLOSSARY[selectedKey];

  const INGREDIENT_PRODUCTS: Record<string, Array<{ id: number; pct: number }>> = {
    'niacinamide':         [{ id: 14, pct: 10 }, { id: 3, pct: 5 }, { id: 16, pct: 4 }, { id: 7, pct: 2 }],
    'centella asiatica':   [{ id: 17, pct: 15 }, { id: 16, pct: 8 }, { id: 14, pct: 5 }, { id: 5, pct: 3 }],
    'retinol':             [{ id: 8, pct: 0.3 }, { id: 16, pct: 0.1 }, { id: 14, pct: 0.05 }, { id: 3, pct: 0.02 }],
    'vitamine c':          [{ id: 3, pct: 20 }, { id: 14, pct: 10 }, { id: 7, pct: 5 }, { id: 17, pct: 3 }],
    'acide hyaluronique':  [{ id: 7, pct: 2 }, { id: 5, pct: 1.5 }, { id: 6, pct: 1 }, { id: 17, pct: 0.5 }],
    'acide tranexamique':  [{ id: 14, pct: 5 }, { id: 16, pct: 3 }, { id: 3, pct: 2 }, { id: 17, pct: 1 }],
    'squalane':            [{ id: 5, pct: 100 }, { id: 6, pct: 30 }, { id: 7, pct: 15 }, { id: 17, pct: 5 }],
    'acide salicylique':   [{ id: 3, pct: 2 }, { id: 22, pct: 1 }, { id: 14, pct: 0.5 }, { id: 16, pct: 0.2 }],
  };

  const getIngredientProducts = (key: string): Array<{ product: Product; pct: number }> => {
    const entries = INGREDIENT_PRODUCTS[key] ?? [];
    return entries
      .map(({ id, pct }) => {
        const product = products.find(p => p.id === id);
        return product ? { product, pct } : null;
      })
      .filter((x): x is { product: Product; pct: number } => x !== null)
      .sort((a, b) => b.pct - a.pct);
  };

  const getSafetyLevel = (safetyStr: string) => {
    const s = safetyStr.toLowerCase();
    if (s.includes('très') || s.includes('آمن')) return { pct: 100, color: '#10b981', bg: 'bg-emerald-50', border: 'border-emerald-200', text_fr: 'Excellent', text_ar: 'ممتاز' };
    if (s.includes('sûr') || s.includes('آمن')) return { pct: 85, color: '#14b8a6', bg: 'bg-teal-50', border: 'border-teal-200', text_fr: 'Sûr', text_ar: 'آمن' };
    return { pct: 70, color: '#f59e0b', bg: 'bg-amber-50', border: 'border-amber-200', text_fr: 'Actif Fort', text_ar: 'مكون نشط قوي' };
  };

  const matchedProducts = getIngredientProducts(selectedKey);
  const safetyInfo = selectedIngredient
    ? getSafetyLevel(language === 'FR' ? selectedIngredient.safety_fr : selectedIngredient.safety_ar)
    : { pct: 90, color: '#10b981', bg: 'bg-emerald-50', border: 'border-emerald-200', text_fr: 'Sûr', text_ar: 'آمن' };

  const safetyRadius = 22;
  const safetyCircumference = 2 * Math.PI * safetyRadius;
  const safetyDashoffset = safetyCircumference - (safetyInfo.pct / 100) * safetyCircumference;

  const handleQuickAdd = (product: Product) => {
    addToCart(product, 1);
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 1200);
  };

  const isRTL = language === 'AR';

  // Ingredient type color theming
  const ingredientTheme: Record<string, { accent: string; accentBg: string; accentBorder: string; dot: string }> = {
    'niacinamide':        { accent: '#2563eb', accentBg: 'bg-blue-50', accentBorder: 'border-blue-200/60', dot: 'bg-blue-500' },
    'centella asiatica':  { accent: '#10b981', accentBg: 'bg-emerald-50', accentBorder: 'border-emerald-200/60', dot: 'bg-emerald-500' },
    'retinol':            { accent: '#f59e0b', accentBg: 'bg-amber-50', accentBorder: 'border-amber-200/60', dot: 'bg-amber-500' },
    'vitamine c':         { accent: '#ea580c', accentBg: 'bg-orange-50', accentBorder: 'border-orange-200/60', dot: 'bg-orange-500' },
    'acide hyaluronique': { accent: '#0891b2', accentBg: 'bg-cyan-50', accentBorder: 'border-cyan-200/60', dot: 'bg-cyan-500' },
    'acide tranexamique': { accent: '#7c3aed', accentBg: 'bg-violet-50', accentBorder: 'border-violet-200/60', dot: 'bg-violet-500' },
    'squalane':           { accent: '#059669', accentBg: 'bg-emerald-50', accentBorder: 'border-emerald-200/60', dot: 'bg-emerald-600' },
    'acide salicylique':  { accent: '#dc2626', accentBg: 'bg-rose-50', accentBorder: 'border-rose-200/60', dot: 'bg-rose-500' },
  };
  const theme = ingredientTheme[selectedKey] ?? ingredientTheme['niacinamide'];

  return (
    <section
      id="ingredient-dictionary"
      className="bg-[#FAFAFA] border-b border-slate-200/40 relative overflow-hidden reveal-on-scroll"
      style={{ paddingTop: '96px', paddingBottom: '96px' }}
    >
      {/* Subtle background orbs */}
      <div className="absolute top-[5%] left-[3%] w-[500px] h-[500px] rounded-full bg-primary/4 blur-3xl pointer-events-none opacity-50" />
      <div className="absolute bottom-[5%] right-[3%] w-[500px] h-[500px] rounded-full bg-[#EC4899]/3 blur-3xl pointer-events-none opacity-50" />

      <div className="max-w-7xl mx-auto relative z-10 px-6 sm:px-10 md:px-16 lg:px-20 xl:px-24">

        {/* ── Section Header ── */}
        <div className="flex flex-col items-center text-center mb-14 gap-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-primary/15 rounded-[5px] text-[9px] font-black text-primary uppercase tracking-[0.2em] shadow-sm">
            <FlaskConical className="w-3 h-3" />
            <span>{language === 'FR' ? 'Encyclopédie Dermo-Active' : 'قاموس المكونات الجلدية'}</span>
          </div>
          <h2 className="font-black font-heading text-slate-800 tracking-tight leading-tight text-[clamp(28px,3.5vw,38px)]">
            {language === 'FR' ? 'Décryptez les Actifs Cliniques' : 'افهمي المكونات النشطة وفوائدها'}
          </h2>
          <p className="text-slate-500 font-medium leading-relaxed max-w-lg text-[13.5px]">
            {language === 'FR'
              ? "La transparence scientifique absolue. Découvrez l'indice de sécurité et les bénéfices prouvés de chaque ingrédient actif."
              : 'الشفافية العلمية المطلقة لجمالكِ. اكتشفي مؤشر الأمان والفوائد المثبتة علمياً لكل مكون نشط.'}
          </p>
        </div>

        {/* ── Split layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.9fr] items-stretch gap-8 lg:gap-10">

          {/* ── LEFT PANEL: Glossary Sidebar ── */}
          <div className="bg-white border border-slate-200/60 rounded-[20px] shadow-[0_4px_20px_rgba(26,37,93,0.04)] flex flex-col w-full lg:sticky lg:top-[120px] overflow-hidden">

            {/* Sidebar header */}
            <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
              <Sparkles className="w-3.5 h-3.5 text-primary fill-primary/20" />
              <span className="text-[9.5px] font-black uppercase tracking-[0.22em] text-primary">
                {language === 'FR' ? 'Glossaire Scientifique' : 'المكونات المتاحة'}
              </span>
              <span className="ml-auto text-[9px] font-black text-slate-400 bg-slate-50 border border-slate-200 rounded-full px-2 py-0.5">
                {Object.keys(INGREDIENTS_GLOSSARY).length}
              </span>
            </div>

            {/* Ingredient list */}
            <div
              className="flex-1 p-3"
              style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}
            >
              {Object.keys(INGREDIENTS_GLOSSARY).map((key) => {
                const ing = INGREDIENTS_GLOSSARY[key];
                const isActive = selectedKey === key;
                const t = ingredientTheme[key] ?? ingredientTheme['niacinamide'];
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedKey(key)}
                    className={`w-full rounded-[12px] flex items-center cursor-pointer relative transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.98] ${
                      isActive
                        ? `${t.accentBg} ${t.accentBorder} border shadow-sm`
                        : 'hover:bg-slate-50 border border-transparent'
                    }`}
                    style={{
                      padding: '10px 12px',
                      gap: '12px',
                      textAlign: isRTL ? 'right' : 'left',
                      direction: isRTL ? 'rtl' : 'ltr',
                    }}
                  >
                    {/* Active dot indicator */}
                    {isActive && (
                      <div
                        className={`absolute ${t.dot} rounded-full`}
                        style={{
                          top: '10px', bottom: '10px', width: '3px',
                          left: isRTL ? 'auto' : '0px',
                          right: isRTL ? '0px' : 'auto',
                          borderRadius: '0 3px 3px 0',
                        }}
                      />
                    )}
                    {/* Icon bubble */}
                    <div
                      className={`rounded-[10px] flex items-center justify-center shrink-0 transition-all duration-300 ${
                        isActive
                          ? `bg-white border shadow-sm scale-105 ${t.accentBorder}`
                          : 'bg-slate-50 border border-slate-100'
                      }`}
                      style={{ width: '36px', height: '36px', fontSize: '18px' }}
                    >
                      {ing.icon}
                    </div>
                    {/* Labels */}
                    <div className="flex-1 min-w-0" style={{ paddingLeft: isRTL ? '0px' : '4px', paddingRight: isRTL ? '4px' : '0px' }}>
                      <span
                        className={`block font-black truncate leading-tight transition-colors duration-300 ${isActive ? 'text-slate-800' : 'text-slate-700'}`}
                        style={{ fontSize: '12px', color: isActive ? t.accent : undefined }}
                      >
                        {language === 'FR' ? ing.name_fr : ing.name_ar}
                      </span>
                      <span
                        className="block text-slate-400 font-extrabold uppercase truncate"
                        style={{ fontSize: '9px', letterSpacing: '0.15em', marginTop: '2px' }}
                      >
                        {language === 'FR' ? ing.benefit_fr : ing.benefit_ar}
                      </span>
                    </div>
                    {/* Active chevron */}
                    {isActive && (
                      <div className="shrink-0 w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.accent + '18' }}>
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                          <path d="M2.5 1.5L5.5 4L2.5 6.5" stroke={theme.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── RIGHT PANEL: Detail (Ingredient Hero Card + Products) ── */}
          {selectedIngredient && (
            <div
              className={`bg-white border border-slate-200/60 rounded-[20px] shadow-[0_4px_20px_rgba(26,37,93,0.04)] overflow-hidden flex flex-col justify-between ${isRTL ? 'text-right' : 'text-left'}`}
            >
              {/* Card top half wrapping banner & description */}
              <div className="flex flex-col flex-1">
                {/* Colored hero banner */}
                <div
                  className={`${theme.accentBg} border-b ${theme.accentBorder} px-8 py-6 flex items-start justify-between gap-6 ${isRTL ? 'flex-row-reverse' : ''}`}
                >
                  <div className="flex flex-col gap-2">
                    <div className="inline-flex items-center gap-1.5">
                      <span
                        className="text-[8.5px] font-black uppercase tracking-[0.22em]"
                        style={{ color: theme.accent }}
                      >
                        {language === 'FR' ? 'COMPOSITION & LABS' : 'التحليل المعملي للمكون'}
                      </span>
                    </div>
                    <h3 className="font-black font-heading text-slate-800 flex items-center gap-3" style={{ fontSize: '22px' }}>
                      <span
                        className="w-12 h-12 rounded-[14px] bg-white border border-slate-200 shadow-sm flex items-center justify-center text-2xl shrink-0"
                      >
                        {selectedIngredient.icon}
                      </span>
                      <span>{language === 'FR' ? selectedIngredient.name_fr : selectedIngredient.name_ar}</span>
                    </h3>
                  </div>

                  {/* Safety gauge */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="relative w-12 h-12">
                      <svg className="w-12 h-12 -rotate-90">
                        <circle cx="24" cy="24" r={safetyRadius} fill="transparent" stroke="#e2e8f0" strokeWidth="3.5" />
                        <circle
                          cx="24" cy="24" r={safetyRadius}
                          fill="transparent"
                          stroke={safetyInfo.color}
                          strokeWidth="3.5"
                          strokeDasharray={safetyCircumference}
                          strokeDashoffset={safetyDashoffset}
                          strokeLinecap="round"
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-slate-700 select-none">
                        {safetyInfo.pct}%
                      </span>
                    </div>
                    <div className={`flex flex-col gap-1 ${isRTL ? 'items-end' : 'items-start'}`}>
                      <span className="text-[8.5px] font-black uppercase text-slate-400 tracking-wider block">
                        {language === 'FR' ? 'Indice de Sécurité' : 'مؤشر الأمان'}
                      </span>
                      <span className="text-[10px] font-black uppercase" style={{ color: safetyInfo.color }}>
                        {language === 'FR' ? safetyInfo.text_fr : safetyInfo.text_ar}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Efficacy description */}
                <div className="px-8 py-6 flex-1 flex flex-col justify-start">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-3.5 h-3.5" style={{ color: theme.accent }} />
                    <span className="text-[9.5px] font-black uppercase tracking-[0.2em]" style={{ color: theme.accent }}>
                      {language === 'FR' ? "Rapport d'efficacité clinique" : 'الفعالية والتأثير'}
                    </span>
                  </div>
                  <p className="text-slate-600 font-medium leading-relaxed text-[13.5px]">
                    {language === 'FR' ? selectedIngredient.desc_fr : selectedIngredient.desc_ar}
                  </p>
                </div>
              </div>

              {/* Matched Products inside the same card */}
              {matchedProducts.length > 0 && (
                <div className="border-t border-slate-100/80 bg-slate-50/20">

                  {/* Products header */}
                  <div className="flex items-center justify-between px-8 py-4 border-b border-slate-100/80">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-3.5 h-3.5 text-primary" />
                      <span className="text-[9.5px] font-black uppercase tracking-[0.2em] text-primary">
                        {language === 'FR'
                          ? `Produits disponibles (${matchedProducts.length})`
                          : `المنتجات المتوفرة (${matchedProducts.length})`}
                      </span>
                    </div>
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
                      {language === 'FR' ? 'Trié par concentration ↓' : 'مرتب حسب التركيز ↓'}
                    </span>
                  </div>

                  {/* Product grid */}
                  <div className="grid grid-cols-2 gap-3 p-6">
                    {matchedProducts.slice(0, 4).map(({ product, pct }) => {
                      const isAdded = addedProductId === product.id;
                      const pctLabel = `${pct}%`;
                      // Concentration bar fill (relative to max pct in group)
                      const maxPct = matchedProducts[0]?.pct ?? 1;
                      const barWidth = Math.max(8, Math.round((pct / maxPct) * 100));
                      return (
                        <div
                          key={product.id}
                          className="bg-slate-50/70 border border-slate-200/50 rounded-[14px] hover:border-slate-300/70 hover:shadow-[0_4px_12px_rgba(26,37,93,0.06)] hover:-translate-y-0.5 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] flex flex-col"
                          style={{ padding: '14px', gap: '10px' }}
                        >
                          {/* Top row: image + concentration */}
                          <div className="flex items-start gap-2.5">
                            <div className="bg-white border border-slate-200 rounded-[10px] shrink-0 shadow-sm overflow-hidden">
                              <img
                                src={product.image}
                                alt={product.title}
                                className="object-cover"
                                style={{ width: '46px', height: '46px' }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span
                                className="block font-black uppercase text-[8px] tracking-[0.15em] mb-1"
                                style={{ color: theme.accent }}
                              >
                                {product.vendor}
                              </span>
                              <h4
                                className="font-extrabold text-slate-800 leading-snug"
                                style={{ fontSize: '11px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                              >
                                {product.title}
                              </h4>
                            </div>
                          </div>

                          {/* Concentration bar */}
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">
                                {language === 'FR' ? 'Concentration' : 'التركيز'}
                              </span>
                              <span
                                className="text-[9px] font-black rounded-full px-2 py-0.5"
                                style={{ backgroundColor: theme.accent + '15', color: theme.accent }}
                              >
                                {pctLabel}
                              </span>
                            </div>
                            <div className="h-1 rounded-full bg-slate-200 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-700 ease-out"
                                style={{ width: `${barWidth}%`, backgroundColor: theme.accent }}
                              />
                            </div>
                          </div>

                          {/* Price + CTA */}
                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/50 mt-auto">
                            <span className="font-black text-slate-800" style={{ fontSize: '13px' }}>
                              {product.price} DH
                            </span>
                            <button
                              onClick={() => handleQuickAdd(product)}
                              disabled={isAdded}
                              className="cursor-pointer active:scale-95 transition-all duration-300 text-white flex items-center shrink-0 rounded-[8px] gap-1"
                              style={{
                                padding: '5px 10px',
                                fontSize: '9px',
                                fontWeight: 900,
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                                backgroundColor: isAdded ? '#10b981' : theme.accent,
                              }}
                            >
                              {isAdded ? (
                                <>
                                  <Check className="w-2.5 h-2.5" />
                                  <span>{language === 'FR' ? 'Ajouté' : 'تم'}</span>
                                </>
                              ) : (
                                <>
                                  <ShoppingBag className="w-2.5 h-2.5" />
                                  <span>{language === 'FR' ? 'Prendre' : 'شراء'}</span>
                                </>
                              )}
                            </button>
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
