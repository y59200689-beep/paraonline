'use client';

import React, { useEffect, useState } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { ProductCard } from './ProductCard';
import { FlaskConical, ChevronLeft, ChevronRight, Leaf } from 'lucide-react';
import styles from './ActiveIngredients.module.css';
import { Product } from '@/lib/data';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

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
    query: 'salicylic acid',
    nameFr: 'Acide Salicylique (BHA)',
    nameAr: 'حمض الساليسيليك (BHA)',
    descFr: 'Exfolie en profondeur, élimine les points noirs et prévient l’acné.',
    descAr: 'يقشر بعمق، يزيل الرؤوس السوداء ويمنع حب الشباب.',
  },
  {
    key: 'hyaluronic',
    query: 'hyaluronic',
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
// Separates the live rail from a previously cached six-card API response.
const INGREDIENT_RAIL_CACHE_VERSION = '2';

type IngredientPage = {
  products: Product[];
  pagination: IngredientPagination;
};

const ingredientPageCache = new Map<string, IngredientPage>();
const ingredientPageRequests = new Map<string, Promise<IngredientPage>>();

const ingredientPageKey = (ingredient: string, page: number) => `${ingredient}:${page}`;

async function loadIngredientPage(ingredient: string, page: number): Promise<IngredientPage> {
  const key = ingredientPageKey(ingredient, page);
  const cached = ingredientPageCache.get(key);
  if (cached) return cached;

  const pending = ingredientPageRequests.get(key);
  if (pending) return pending;

  const request = (async () => {
    const params = new URLSearchParams({
      ingredient,
      page: String(page),
      limit: String(BATCH_SIZE),
      sort: 'alphabetical',
      railVersion: INGREDIENT_RAIL_CACHE_VERSION,
    });
    const response = await fetch(`/api/products?${params.toString()}`, { cache: 'no-store' });
    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'Unable to load ingredient products');

    const result = {
      products: data.products || [],
      pagination: data.pagination || { total: 0, page, limit: BATCH_SIZE, totalPages: 1 },
    };
    ingredientPageCache.set(key, result);
    return result;
  })();

  ingredientPageRequests.set(key, request);
  try {
    return await request;
  } finally {
    ingredientPageRequests.delete(key);
  }
}

export const ActiveIngredients: React.FC = () => {
  const { language } = useTranslation();
  const isAR = language === 'AR';
  const [activeTab, setActiveTab] = useState(ACTIVE_INGREDIENTS[0].key);
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<IngredientPagination>({ total: 0, page: 1, limit: BATCH_SIZE, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retry, setRetry] = useState(0);

  const currentActive = ACTIVE_INGREDIENTS.find(item => item.key === activeTab) || ACTIVE_INGREDIENTS[0];

  useEffect(() => {
    let cancelled = false;

    const loadIngredientProducts = async () => {
      const cached = ingredientPageCache.get(ingredientPageKey(currentActive.query, page));
      setIsLoading(!cached);
      setLoadError(false);
      try {
        const result = cached || await loadIngredientPage(currentActive.query, page);
        if (cancelled) return;
        setProducts(result.products);
        setPagination(result.pagination);
      } catch (error) {
        if (cancelled) return;
        console.error('Failed to load active ingredient products:', error);
        setLoadError(true);
        setProducts([]);
        setPagination({ total: 0, page: 1, limit: BATCH_SIZE, totalPages: 1 });
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadIngredientProducts();
    return () => { cancelled = true; };
  }, [currentActive.query, page, retry]);

  useEffect(() => {
    if (pagination.page < pagination.totalPages) {
      void loadIngredientPage(currentActive.query, pagination.page + 1).catch(() => {});
    }

    const prefetchOtherIngredients = () => {
      ACTIVE_INGREDIENTS
        .filter(item => item.query !== currentActive.query)
        .forEach(item => { void loadIngredientPage(item.query, 1).catch(() => {}); });
    };

    const timeoutId = window.setTimeout(prefetchOtherIngredients, 500);
    return () => window.clearTimeout(timeoutId);
  }, [currentActive.query, pagination.page, pagination.totalPages]);

  const selectIngredient = (key: string) => {
    setActiveTab(key);
    setPage(1);
  };

  const canGoPrevious = page > 1 && !isLoading;
  const canGoNext = page < pagination.totalPages && !isLoading;

  return (
    <section className={styles.section} id="active-ingredients" aria-labelledby="ingredients-heading" dir={isAR ? 'rtl' : 'ltr'}>
      <div className={styles.decoration} aria-hidden="true"><i /><i /><i /></div>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.badge}><FlaskConical size={17} />{isAR ? 'المكونات النشطة' : 'Actifs & ingrédients'}</div>
          <h2 id="ingredients-heading" className="public-section-title">{isAR ? <>تصفح منتجاتنا <span>حسب المكون النشط</span></> : <>Filtrer par <span>Molécule & Ingrédient Actif</span></>}</h2>
          <p>{isAR ? 'حددي المكون الذي تبحثين عنه واكتشفي المنتجات التي تحتوي عليه.' : 'Choisissez un ingrédient clé pour découvrir les produits qui en contiennent.'}</p>
        </header>
        <nav className={styles.filters} aria-label={isAR ? 'المكونات' : 'Filtrer par ingrédient'}>
          {ACTIVE_INGREDIENTS.map(item => <button key={item.key} type="button" aria-pressed={item.key === activeTab} aria-controls="ingredient-results" onClick={() => selectIngredient(item.key)}>{item.key === activeTab && <Leaf size={19} aria-hidden="true" />}{isAR ? item.nameAr : item.nameFr}</button>)}
        </nav>
        <div className={styles.summary}>
          <p><span aria-hidden="true">“</span>{isAR ? currentActive.descAr : currentActive.descFr}<span aria-hidden="true">”</span></p>
          <div className={styles.count}>{isLoading ? (isAR ? 'تحميل…' : 'Chargement…') : loadError ? '—' : pagination.total + ' ' + (isAR ? 'منتج' : 'produits')}</div>
        </div>
        <div className={styles.rail}>
          <div className={styles.railHeader}>
            <div><strong role="status">{isLoading ? (isAR ? 'تحميل المنتجات…' : 'Chargement des produits…') : loadError ? (isAR ? 'تعذر التحميل' : 'Chargement indisponible') : `${isAR ? 'دفعة' : 'Lot'} ${pagination.page} / ${Math.max(1, pagination.totalPages)}`}</strong>
              <p>{isAR ? 'اكتشفي المنتجات التي تحتوي على ' + currentActive.nameAr : 'Découvrez notre sélection de soins avec ' + currentActive.nameFr.toLowerCase() + '.'}</p></div>
            <div className={styles.controls}>
              <button type="button" onClick={() => setPage(current => Math.max(1, current - 1))} disabled={!canGoPrevious} aria-label={isAR ? 'الدفعة السابقة' : 'Lot précédent'}><ChevronLeft size={19} /></button>
              <button type="button" onClick={() => setPage(current => Math.min(pagination.totalPages, current + 1))} disabled={!canGoNext} aria-label={isAR ? 'الدفعة التالية' : 'Lot suivant'}><ChevronRight size={19} /></button>
            </div>
          </div>
          <div id="ingredient-results" aria-busy={isLoading}>
            {isLoading ? <div className={styles.grid} aria-hidden="true">{Array.from({length: 6}, (_, i) => <div className={styles.skeleton} key={i}><div /><span /><span /><span /></div>)}</div>
              : loadError ? <div className={styles.empty}><p>{isAR ? 'تعذر تحميل المنتجات. حاولي مرة أخرى.' : 'Impossible de charger les produits pour le moment.'}</p><button type="button" onClick={() => setRetry(v => v + 1)}>{isAR ? 'إعادة المحاولة' : 'Réessayer'}</button></div>
              : products.length ? <div className={styles.grid}>{products.map(product => <ProductCard key={product.id} product={product} ingredientLayout />)}</div>
              : <div className={styles.empty}>{isAR ? 'لا توجد منتجات تحتوي على هذا المكون في صيغة المنتج.' : 'Aucun produit ne contient encore cet ingrédient dans sa formule.'}</div>}
          </div>
        </div>
        <div className={styles.browseAll}>
          <Link className="public-cta" href={`/products?ingredient=${encodeURIComponent(currentActive.query)}`} aria-label={isAR ? `عرض جميع المنتجات — ${currentActive.nameAr}` : `Voir tous les produits — ${currentActive.nameFr}`}>
            {isAR ? 'عرض جميع المنتجات' : 'Voir tous les produits'}<ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
};
