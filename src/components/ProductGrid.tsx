'use client';

import React, { useState, useEffect } from 'react';
import { PRODUCTS_DB, Product } from '../lib/data';
import { ProductCard } from './ProductCard';
import { useTranslation } from '../context/LanguageContext';
import { useAmPm } from '../context/AmPmContext';
import { Flame, Grid } from 'lucide-react';

const matchesConcern = (product: Product, concern: string) => {
  const text = `${product.title} ${product.nameFr || ''} ${product.description} ${product.tags.join(' ')}`.toLowerCase();
  const ingredients = product.ingredients.toLowerCase();
  
  if (concern === 'acne') {
    return text.includes('acné') || text.includes('imperfection') || text.includes('bouton') || ingredients.includes('salicylic acid') || product.id === 3 || product.id === 22 || product.id === 15 || product.id === 16 || product.id === 17;
  }
  if (concern === 'spots') {
    return text.includes('tache') || text.includes('éclat') || text.includes('bright') || text.includes('pigment') || ingredients.includes('tranexamic') || ingredients.includes('ascorbic') || product.id === 3 || product.id === 14;
  }
  if (concern === 'dryness') {
    return text.includes('déshydrat') || text.includes('sec') || text.includes('hydrat') || ingredients.includes('hyaluronic') || product.id === 5 || product.id === 6 || product.id === 7 || product.id === 17;
  }
  if (concern === 'wrinkles') {
    return text.includes('ridule') || text.includes('âge') || text.includes('anti-aging') || text.includes('vieill') || ingredients.includes('retinol') || product.id === 8 || product.id === 5 || product.id === 6;
  }
  if (concern === 'redness') {
    return text.includes('rougeur') || text.includes('apais') || text.includes('sensible') || text.includes('sooth') || ingredients.includes('centella') || ingredients.includes('heartleaf') || product.id === 17 || product.id === 16 || product.id === 15;
  }
  return true;
};

const matchesIngredient = (product: Product, ingredient: string) => {
  const ingStr = product.ingredients.toLowerCase();
  const nameStr = `${product.title} ${product.nameFr || ''} ${product.description}`.toLowerCase();
  
  if (ingredient === 'niacinamide') {
    return ingStr.includes('niacinamide') || nameStr.includes('niacinamide') || product.id === 14 || product.id === 3 || product.id === 16;
  }
  if (ingredient === 'centella') {
    return ingStr.includes('centella') || ingStr.includes('madécassoside') || nameStr.includes('centella') || product.id === 17 || product.id === 16 || product.id === 14;
  }
  if (ingredient === 'retinol') {
    return ingStr.includes('retinol') || ingStr.includes('retinal') || nameStr.includes('retinol') || product.id === 8;
  }
  if (ingredient === 'vitamine_c') {
    return ingStr.includes('ascorbic') || ingStr.includes('ascorbyl') || nameStr.includes('vitamine c') || nameStr.includes('vitamin c') || product.id === 3 || product.id === 14;
  }
  if (ingredient === 'hyaluronic') {
    return ingStr.includes('hyaluronate') || ingStr.includes('hyaluronic') || nameStr.includes('hyaluronique') || product.id === 7 || product.id === 5 || product.id === 6 || product.id === 17;
  }
  if (ingredient === 'tranexamic') {
    return ingStr.includes('tranexamic') || nameStr.includes('tranexamique') || product.id === 14 || product.id === 16;
  }
  if (ingredient === 'squalane') {
    return ingStr.includes('squalane') || nameStr.includes('squalane') || product.id === 5;
  }
  if (ingredient === 'salicylic') {
    return ingStr.includes('salicylic') || nameStr.includes('salicylique') || product.id === 3 || product.id === 22;
  }
  return true;
};

interface ProductGridProps {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  onOpenQuickView: (product: Product) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ activeCategory, onSelectCategory, onOpenQuickView }) => {
  const { language } = useTranslation();
  const { amPmState } = useAmPm();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(PRODUCTS_DB);
  const [isLoading, setIsLoading] = useState(false);

  // Collapsible Filters accordion states
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedConcern, setSelectedConcern] = useState('all');
  const [selectedIngredient, setSelectedIngredient] = useState('all');

  useEffect(() => {
    setIsLoading(true);
    const t = setTimeout(() => {
      let result = [...PRODUCTS_DB];
      
      // 1. Category check
      if (activeCategory !== 'all') {
        if (activeCategory === 'offers') {
          result = PRODUCTS_DB.filter(p => p.comparePrice > p.price);
        } else if (activeCategory === 'kbeauty') {
          result = PRODUCTS_DB.filter(p => p.category === 'kbeauty');
        } else if (activeCategory === 'solaire') {
          result = PRODUCTS_DB.filter(p => p.tags.includes('solaire') || p.category === 'garnier');
        } else {
          result = PRODUCTS_DB.filter(p => p.tags.includes(activeCategory) || p.category === activeCategory);
        }
      }

      // 2. Concern filter check
      if (selectedConcern !== 'all') {
        result = result.filter(p => matchesConcern(p, selectedConcern));
      }

      // 3. Ingredient filter check
      if (selectedIngredient !== 'all') {
        result = result.filter(p => matchesIngredient(p, selectedIngredient));
      }

      // Re-order result so products matching the selected routine context appear first!
      const isAM = amPmState === 'am';
      result.sort((a, b) => {
        const isDayA = a.tags.includes('solaire') || a.tags.includes('jour') || a.nameFr?.toLowerCase().includes('solaire') || a.nameFr?.toLowerCase().includes('vitamine c') || a.id === 3 || a.id === 7 || a.id === 14 || a.id === 17 || a.id === 13 || a.id === 1;
        const isNightA = a.tags.includes('nuit') || a.nameFr?.toLowerCase().includes('nuit') || a.nameFr?.toLowerCase().includes('night') || a.id === 8 || a.id === 5 || a.id === 22 || a.id === 15 || a.id === 16 || a.id === 6;

        const isDayB = b.tags.includes('solaire') || b.tags.includes('jour') || b.nameFr?.toLowerCase().includes('solaire') || b.nameFr?.toLowerCase().includes('vitamine c') || b.id === 3 || b.id === 7 || b.id === 14 || b.id === 17 || b.id === 13 || b.id === 1;
        const isNightB = b.tags.includes('nuit') || b.nameFr?.toLowerCase().includes('nuit') || b.nameFr?.toLowerCase().includes('night') || b.id === 8 || b.id === 5 || b.id === 22 || b.id === 15 || b.id === 16 || b.id === 6;

        const matchA = isAM ? isDayA && !isNightA : isNightA && !isDayA;
        const matchB = isAM ? isDayB && !isNightB : isNightB && !isDayB;

        if (matchA && !matchB) return -1;
        if (!matchA && matchB) return 1;
        return 0;
      });

      setFilteredProducts(result);
      setIsLoading(false);
    }, 350);
    return () => clearTimeout(t);
  }, [activeCategory, amPmState, selectedConcern, selectedIngredient]);

  return (
    <section 
      className="py-20 md:py-28 bg-background border-t border-border/30"
      style={{ paddingTop: '60px', paddingBottom: '96px' }}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-10 md:px-16 lg:px-20 xl:px-24">

        {/* Section header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 md:mb-16 gap-6">
          <div className="space-y-1.5 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5" />
              <span>{language === 'FR' ? 'Tendances du moment' : 'الأكثر طلباً الآن'}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black font-heading text-primary-dark">
              {language === 'FR' ? 'Notre Boutique Officielle' : 'متجرنا الرسمي'}
            </h2>
            <p className="text-xs text-foreground/70">
              {language === 'FR'
                ? 'Produits 100% originaux, garantis par des laboratoires certifiés.'
                : 'منتجات أصلية 100٪ مضمونة من مختبرات مرخصة.'}
            </p>
          </div>

          {/* Collapsible Tabs and Filter trigger wrapper */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Quick tabs */}
            <div className="flex gap-2 bg-white border border-border/40 p-1.5 rounded-xl shadow-sm">
              {[
                { key: 'all', fr: 'Tous', ar: 'الكل' },
                { key: 'offers', fr: 'Offres', ar: 'العروض' },
                { key: 'kbeauty', fr: 'K-Beauty', ar: 'جمال كوري' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => onSelectCategory(tab.key)}
                  className={`px-4 py-2 rounded-lg text-[11px] font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    activeCategory === tab.key
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-foreground/70 hover:text-primary-dark hover:bg-muted'
                  }`}
                >
                  {language === 'FR' ? tab.fr : tab.ar}
                </button>
              ))}
            </div>

            {/* Collapsible Advanced Filters Trigger */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`px-4 py-3 border rounded-xl text-[11px] font-extrabold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-sm ${
                showAdvancedFilters || selectedConcern !== 'all' || selectedIngredient !== 'all'
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border/40 bg-white hover:bg-slate-50 text-foreground/70'
              }`}
            >
              <span>🧪 {language === 'FR' ? 'Filtres Avancés' : 'فلاتر متقدمة'}</span>
              {(selectedConcern !== 'all' || selectedIngredient !== 'all') && (
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              )}
            </button>
          </div>
        </div>

        {/* Collapsible advanced filter panel */}
        <div
          className={`transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden ${
            showAdvancedFilters ? 'max-h-[380px] opacity-100 mb-10' : 'max-h-0 opacity-0 mb-0'
          }`}
        >
          <div className="bg-white/60 backdrop-blur-md border border-border/40 p-5 md:p-6 rounded-3xl shadow-sm space-y-6">
            
            {/* 1. Skin Concerns Section */}
            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block text-left">
                🎯 {language === 'FR' ? 'Préoccupations Ciblées' : 'مشاكل البشرة المستهدفة'}
              </span>
              <div className="flex flex-wrap gap-2 justify-start">
                {[
                  { key: 'all', fr: 'Toutes les préoccupations', ar: 'كل المشاكل' },
                  { key: 'acne', fr: 'Acné & Imperfections 🌿', ar: 'حب الشباب والشوائب 🌿' },
                  { key: 'spots', fr: 'Taches Brunes & Éclat ✨', ar: 'البقع الداكنة والنضارة ✨' },
                  { key: 'dryness', fr: 'Déshydratation & Peau Sèche 💧', ar: 'الجفاف والبشرة الجافة 💧' },
                  { key: 'wrinkles', fr: 'Ridules & Anti-Âge ⏳', ar: 'التجاعيد وعلامات تقدم السن ⏳' },
                  { key: 'redness', fr: 'Rougeurs & Peau Sensible 🛡️', ar: 'الاحمرار والبشرة الحساسة 🛡️' },
                ].map((item) => {
                  const isActive = selectedConcern === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => setSelectedConcern(item.key)}
                      className={`px-3.5 py-2.5 rounded-xl border text-[10.5px] font-bold transition-all duration-200 cursor-pointer ${
                        isActive
                          ? 'border-primary bg-primary/10 text-primary shadow-sm'
                          : 'border-border/30 hover:bg-slate-50 text-foreground/75'
                      }`}
                    >
                      {language === 'FR' ? item.fr : item.ar}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Active Molecules Section */}
            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block text-left">
                🧬 {language === 'FR' ? 'Molécules Actives Cliniques' : 'المكونات العلاجية النشطة'}
              </span>
              <div className="flex flex-wrap gap-2 justify-start">
                {[
                  { key: 'all', fr: 'Tous les actifs', ar: 'كل المكونات' },
                  { key: 'niacinamide', fr: 'Niacinamide 🧪', ar: 'نياسيناميد 🧪' },
                  { key: 'centella', fr: 'Centella Asiatica 🌿', ar: 'سنتيلا أسياتيكا 🌿' },
                  { key: 'retinol', fr: 'Rétinol ⏳', ar: 'ريتينول ⏳' },
                  { key: 'vitamine_c', fr: 'Vitamine C 🍊', ar: 'فيتامين سي 🍊' },
                  { key: 'hyaluronic', fr: 'Acide Hyaluronique 💧', ar: 'حمض الهيالورونيك 💧' },
                  { key: 'tranexamic', fr: 'Acide Tranexamique ✨', ar: 'حمض الترانيكساميك ✨' },
                  { key: 'squalane', fr: 'Squalane 🧴', ar: 'سكوالان 🧴' },
                  { key: 'salicylic', fr: 'Acide Salicylique 🔬', ar: 'حمض الساليسيليك 🔬' },
                ].map((item) => {
                  const isActive = selectedIngredient === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => setSelectedIngredient(item.key)}
                      className={`px-3.5 py-2.5 rounded-xl border text-[10.5px] font-bold transition-all duration-200 cursor-pointer ${
                        isActive
                          ? 'border-primary bg-primary/10 text-primary shadow-sm'
                          : 'border-border/30 hover:bg-slate-50 text-foreground/75'
                      }`}
                    >
                      {language === 'FR' ? item.fr : item.ar}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Filters Clear Summary Bar */}
            {(selectedConcern !== 'all' || selectedIngredient !== 'all') && (
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-[10px] font-black uppercase text-slate-400">
                    {language === 'FR' ? 'Filtres Actifs :' : 'الفلاتر النشطة :'}
                  </span>
                  {selectedConcern !== 'all' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/5 text-primary text-[9px] font-black uppercase tracking-wider rounded-lg border border-primary/10">
                      <span>{selectedConcern === 'acne' ? 'Acné 🌿' : selectedConcern === 'spots' ? 'Taches ✨' : selectedConcern === 'dryness' ? 'Déshydratation 💧' : selectedConcern === 'wrinkles' ? 'Ridules ⏳' : 'Rougeurs 🛡️'}</span>
                      <button onClick={() => setSelectedConcern('all')} className="w-3.5 h-3.5 hover:text-accent font-black cursor-pointer leading-none flex items-center justify-center border border-primary/20 rounded-full text-[8px] bg-white">x</button>
                    </span>
                  )}
                  {selectedIngredient !== 'all' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/5 text-primary text-[9px] font-black uppercase tracking-wider rounded-lg border border-primary/10">
                      <span>{selectedIngredient.charAt(0).toUpperCase() + selectedIngredient.slice(1)}</span>
                      <button onClick={() => setSelectedIngredient('all')} className="w-3.5 h-3.5 hover:text-accent font-black cursor-pointer leading-none flex items-center justify-center border border-primary/20 rounded-full text-[8px] bg-white">x</button>
                    </span>
                  )}
                </div>
                <button
                  onClick={() => { setSelectedConcern('all'); setSelectedIngredient('all'); }}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-primary hover:text-white border border-border/30 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer"
                >
                  {language === 'FR' ? 'Réinitialiser Tout' : 'مسح كل الفلاتر'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Skeleton loaders */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6" style={{ marginTop: '24px' }}>
            {[1, 2, 3, 4].map(id => (
              <div key={id} className="bg-white border border-border/40 rounded-2xl overflow-hidden animate-pulse shadow-sm">
                <div className="aspect-square bg-slate-100" />
                <div className="p-4 space-y-3">
                  <div className="h-2.5 bg-slate-100 rounded w-1/3" />
                  <div className="h-4 bg-slate-100 rounded w-full" />
                  <div className="h-3 bg-slate-100 rounded w-3/4" />
                  <div className="flex justify-between pt-2">
                    <div className="h-5 bg-slate-100 rounded w-1/3" />
                    <div className="h-8 bg-slate-100 rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-border/60">
            <Grid className="w-10 h-10 text-slate-300 mx-auto mb-4" />
            <h3 className="text-base font-black text-primary-dark">
              {language === 'FR' ? 'Aucun produit trouvé' : 'لم يتم العثور على أي منتج'}
            </h3>
            <button
              onClick={() => {
                onSelectCategory('all');
                setSelectedConcern('all');
                setSelectedIngredient('all');
              }}
              className="mt-4 px-6 py-2.5 bg-primary hover:bg-accent text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
            >
              {language === 'FR' ? 'Réinitialiser' : 'إعادة تعيين'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6" style={{ marginTop: '24px' }}>
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} onOpenQuickView={onOpenQuickView} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
