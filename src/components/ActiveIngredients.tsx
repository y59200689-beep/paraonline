'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { ProductCard } from './ProductCard';
import { PRODUCTS_DB, Product } from '@/lib/data';
import { FlaskConical } from 'lucide-react';

const ACTIVE_INGREDIENTS = [
  {
    key: 'niacinamide',
    nameFr: 'Niacinamide',
    nameAr: 'نياسيناميد',
    descFr: 'Lutte contre les taches, régule le sébum et resserre les pores.',
    descAr: 'يحارب البقع الداكنة، ينظم إفراز الدهون ويصغر المسام.',
    productIds: [14, 3, 16, 7]
  },
  {
    key: 'salicylic',
    nameFr: 'Acide Salicylique (BHA)',
    nameAr: 'حمض الساليسيليك (BHA)',
    descFr: 'Exfolie en profondeur, élimine les points noirs et prévient l\'acné.',
    descAr: 'يقشر بعمق، يزيل الرؤوس السوداء ويمنع حب الشباب.',
    productIds: [115, 3]
  },
  {
    key: 'hyaluronic',
    nameFr: 'Acide Hyaluronique',
    nameAr: 'حمض الهيالورونيك',
    descFr: 'Hydrate intensément en surface et en profondeur pour repulper la peau.',
    descAr: 'يرطب البشرة بشكل مكثف على السطح والعمق للحصول على مظهر ممتلئ.',
    productIds: [7, 5, 17]
  },
  {
    key: 'vitaminC',
    nameFr: 'Vitamine C',
    nameAr: 'فيتامين سي',
    descFr: 'Illumine le teint, estompe la fatigue et stimule le collagène.',
    descAr: 'يفتح البشرة، يزيل علامات التعب ويحفز إنتاج الكولاجين.',
    productIds: [3, 14, 16]
  },
  {
    key: 'retinol',
    nameFr: 'Rétinol',
    nameAr: 'ريتينول',
    descFr: 'Accélère le renouvellement cellulaire et lisse les rides et ridules.',
    descAr: 'يسرع تجديد الخلايا وينعم التجاعيد والخطوط الدقيقة.',
    productIds: [8, 14]
  }
];

export const ActiveIngredients: React.FC = () => {
  const { language } = useTranslation();
  const isAR = language === 'AR';
  const [activeTab, setActiveTab] = useState(ACTIVE_INGREDIENTS[0].key);

  const currentActive = ACTIVE_INGREDIENTS.find(i => i.key === activeTab) || ACTIVE_INGREDIENTS[0];
  
  // Filter products in PRODUCTS_DB matching the current active ingredient
  const matchedProducts = PRODUCTS_DB.filter(p => currentActive.productIds.includes(p.id));

  return (
    <section className="relative py-16 md:py-24 overflow-hidden bg-white dark:bg-slate-950/10 border-b border-slate-100 dark:border-white/5">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/30 to-transparent pointer-events-none" />
      
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/30">
            <FlaskConical className="w-3 h-3 text-indigo-500" />
            {isAR ? 'المكونات النشطة' : 'ACTIVES INGRÉDIENTS'}
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white leading-tight">
            {isAR ? (
              <>
                تصفح منتجاتنا <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">حسب المكون النشط</span>
              </>
            ) : (
              <>
                Filtrer par <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">Molécule & Ingrédient Actif</span>
              </>
            )}
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium">
            {isAR
              ? 'حددي المكون الذي تبحثين عنه واكتشفي الحلول العلاجية المناسبة لكِ.'
              : 'Choisissez un ingrédient clé pour découvrir les soins cliniques formulés spécifiquement pour son efficacité.'}
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex flex-wrap justify-center gap-2 mb-8 select-none">
          {ACTIVE_INGREDIENTS.map(item => {
            const isActive = item.key === activeTab;
            const name = isAR ? item.nameAr : item.nameFr;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer border ${
                  isActive
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-slate-900 dark:border-white shadow-md'
                    : 'bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-300 border-slate-200/60 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10'
                }`}
              >
                {name}
              </button>
            );
          })}
        </div>

        {/* Active Ingredient Description */}
        <div className="max-w-2xl mx-auto text-center mb-10">
          <p className="text-xs md:text-sm font-semibold italic text-indigo-600 dark:text-indigo-400">
            &ldquo;{isAR ? currentActive.descAr : currentActive.descFr}&rdquo;
          </p>
        </div>

        {/* Products Carousel/Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 justify-center">
          {matchedProducts.map(product => (
            <div key={product.id} className="reveal-on-scroll">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
