'use client';

import React, { useEffect, useState } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { ProductCard } from './ProductCard';
import { FlaskConical, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Product } from '@/lib/data';

const ACTIVE_INGREDIENTS = [
  {
    key: 'niacinamide',
    query: 'niacinamide',
    nameFr: 'Niacinamide',
    nameAr: 'نياسيناميد',
    descFr: 'Lutte contre les taches, régule le sébum et resserre les pores.',
    descAr: 'يحارب البقع الداكنة، ينظم إفراز الدهون ويصغر المسام.',
  },
  {
    key: 'salicylic',
    query: 'acide salicylique',
    nameFr: 'Acide Salicylique (BHA)',
    nameAr: 'حمض الساليسيليك (BHA)',
    descFr: 'Exfolie en profondeur, élimine les points noirs et prévient l’acné.',
    descAr: 'يقشر بعمق، يزيل الرؤوس السوداء ويمنع حب الشباب.',
  },
  {
    key: 'hyaluronic',
    query: 'acide hyaluronique',
    nameFr: 'Acide Hyaluronique',
    nameAr: 'حمض الهيالورونيك',
    descFr: 'Hydrate intensément en surface et en profondeur pour repulper la peau.',
    descAr: 'يرطب البشرة بشكل مكثف على السطح والعمق للحصول على مظهر ممتلئ.',
  },
  {
    key: 'vitaminC',
    query: 'vitamine c',
    nameFr: 'Vitamine C',
    nameAr: 'فيتامين سي',
    descFr: 'Illumine le teint, estompe la fatigue et stimule le collagène.',
    descAr: 'يفتح البشرة، يزيل علامات التعب ويحفز إنتاج الكولاجين.',
  },
  {
    key: 'retinol',
    query: 'retinol',
    nameFr: 'Rétinol',
    nameAr: 'ريتينول',
    descFr: 'Accélère le renouvellement cellulaire et lisse les rides et ridules.',
    descAr: 'يسرع تجديد الخلايا وينعم التجاعيد والخطوط الدقيقة.',
  },
];

type IngredientPagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

const BATCH_SIZE = 6;

export const ActiveIngredients: React.FC = () => {
  const { language } = useTranslation();
  const isAR = language === 'AR';
  const [activeTab, setActiveTab] = useState(ACTIVE_INGREDIENTS[0].key);
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<IngredientPagination>({ total: 0, page: 1, limit: BATCH_SIZE, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);

  const currentActive = ACTIVE_INGREDIENTS.find(item => item.key === activeTab) || ACTIVE_INGREDIENTS[0];

  useEffect(() => {
    const controller = new AbortController();

    const loadIngredientProducts = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          ingredient: currentActive.query,
          page: String(page),
          limit: String(BATCH_SIZE),
          sort: 'alphabetical',
        });
        const response = await fetch(`/api/products?${params.toString()}`, {
          cache: 'no-store',
          signal: controller.signal,
        });
        const data = await response.json();
        if (!data.success) throw new Error(data.error || 'Unable to load ingredient products');

        setProducts(data.products || []);
        setPagination(data.pagination || { total: 0, page, limit: BATCH_SIZE, totalPages: 1 });
      } catch (error: any) {
        if (error?.name !== 'AbortError') {
          console.error('Failed to load active ingredient products:', error);
          setProducts([]);
          setPagination({ total: 0, page: 1, limit: BATCH_SIZE, totalPages: 1 });
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    loadIngredientProducts();
    return () => controller.abort();
  }, [currentActive.query, page]);

  const selectIngredient = (key: string) => {
    setActiveTab(key);
    setPage(1);
  };

  const canGoPrevious = page > 1 && !isLoading;
  const canGoNext = page < pagination.totalPages && !isLoading;

  return (
    <section className="relative overflow-hidden border-b border-slate-100 bg-white py-16 dark:border-white/5 dark:bg-slate-950/10 md:py-24">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/30 to-transparent" />

      <div className="relative z-10 mx-auto max-w-[1400px] px-4 sm:px-6 md:px-8">
        <div className="mx-auto mb-9 max-w-2xl space-y-3 text-center md:mb-11">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100/50 bg-indigo-50 px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-indigo-700 dark:border-indigo-900/30 dark:bg-indigo-950/30 dark:text-indigo-400">
            <FlaskConical className="h-3 w-3 text-indigo-500" />
            {isAR ? 'المكونات النشطة' : 'Actifs ingrédients'}
          </div>
          <h2 className="text-2xl font-extrabold leading-tight tracking-tight text-slate-800 dark:text-white md:text-3xl">
            {isAR ? (
              <>تصفح منتجاتنا <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">حسب المكون النشط</span></>
            ) : (
              <>Filtrer par <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">Molécule & Ingrédient Actif</span></>
            )}
          </h2>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 md:text-sm">
            {isAR ? 'حددي المكون الذي تبحثين عنه واكتشفي الحلول العلاجية المناسبة لكِ.' : 'Choisissez un ingrédient clé pour découvrir les soins cliniques formulés spécifiquement pour son efficacité.'}
          </p>
        </div>

        <div className="mb-8 flex flex-wrap justify-center gap-2 select-none">
          {ACTIVE_INGREDIENTS.map(item => {
            const isActive = item.key === activeTab;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => selectIngredient(item.key)}
                className={`rounded-full border px-5 py-2.5 text-xs font-bold transition-all duration-200 ${
                  isActive
                    ? 'border-slate-900 bg-slate-900 text-white shadow-md dark:border-white dark:bg-white dark:text-slate-950'
                    : 'border-slate-200/60 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10'
                }`}
              >
                {isAR ? item.nameAr : item.nameFr}
              </button>
            );
          })}
        </div>

        <div className="mb-8 flex items-center justify-center gap-3 md:mb-10">
          <p className="max-w-2xl text-center text-xs font-semibold italic text-indigo-600 dark:text-indigo-400 md:text-sm">
            &ldquo;{isAR ? currentActive.descAr : currentActive.descFr}&rdquo;
          </p>
          <span className="hidden h-1 w-1 rounded-full bg-indigo-300 sm:block" />
          <span className="hidden whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 sm:block">
            {pagination.total} {isAR ? 'منتج' : 'produits'}
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-[0_12px_30px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-950 sm:p-4">
          <div className="mb-3 flex items-center justify-between gap-3 px-1 sm:px-2">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              {isLoading ? (isAR ? 'تحميل المنتجات...' : 'Chargement des produits...') : `${isAR ? 'دفعة' : 'Lot'} ${pagination.page} / ${Math.max(1, pagination.totalPages)}`}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage(current => Math.max(1, current - 1))}
                disabled={!canGoPrevious}
                aria-label={isAR ? 'الدفعة السابقة' : 'Lot précédent'}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-35 dark:border-slate-800 dark:text-slate-300 dark:hover:border-indigo-900 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-300"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setPage(current => Math.min(pagination.totalPages, current + 1))}
                disabled={!canGoNext}
                aria-label={isAR ? 'الدفعة التالية' : 'Lot suivant'}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-35 dark:border-slate-800 dark:text-slate-300 dark:hover:border-indigo-900 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-300"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="relative min-h-[345px]" aria-live="polite">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/75 backdrop-blur-sm dark:bg-slate-950/75">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:gap-4">
                {products.map(product => (
                  <div key={product.id} className="min-w-0 animate-in fade-in slide-in-from-right-2 duration-300">
                    <ProductCard product={product} compact />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex min-h-[345px] items-center justify-center rounded-xl border border-dashed border-slate-200 px-6 text-center text-sm font-medium text-slate-500 dark:border-slate-800 dark:text-slate-400">
                {isAR ? 'لا توجد منتجات تحتوي على هذا المكون في صيغة المنتج.' : 'Aucun produit ne contient encore cet ingrédient dans sa formule.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
