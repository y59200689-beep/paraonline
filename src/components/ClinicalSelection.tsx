'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, ShoppingBag, Sparkles } from 'lucide-react';
import type { Product } from '@/lib/data';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useTranslation } from '@/context/LanguageContext';
import { getOptimizedImageUrl } from '@/lib/image-optimizer';

const PRODUCT_LIMIT = 3;

async function fetchMaybellineSelection(signal: AbortSignal) {
  const vendorParams = new URLSearchParams({ vendor: 'Maybelline', limit: String(PRODUCT_LIMIT), sort: 'alphabetical' });
  const vendorResponse = await fetch(`/api/products?${vendorParams}`, { signal });
  const vendorData = await vendorResponse.json();
  if (vendorData.success && vendorData.products?.length) return vendorData.products as Product[];

  const categoryParams = new URLSearchParams({ category: 'maquillage', limit: String(PRODUCT_LIMIT), sort: 'alphabetical' });
  const categoryResponse = await fetch(`/api/products?${categoryParams}`, { signal });
  const categoryData = await categoryResponse.json();
  return categoryData.success ? (categoryData.products || []) as Product[] : [];
}

export const ClinicalSelection: React.FC = () => {
  const { language } = useTranslation();
  const { addToCart } = useCart();
  const { convertPrice } = useCurrency();
  const isArabic = language === 'AR';
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    fetchMaybellineSelection(controller.signal)
      .then(setProducts)
      .catch(error => {
        if (error?.name !== 'AbortError') console.error('Unable to load Maybelline selection:', error);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, []);

  return (
    <section className="border-t border-slate-200/70 bg-[#f7f8f8] py-12 dark:border-slate-800 dark:bg-slate-950 md:py-20">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 md:px-8">
        <div className="grid overflow-hidden border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.09)] dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
          <div className="flex min-w-0 flex-col p-5 sm:p-8 lg:p-10">
            <div className={`mb-7 flex items-start justify-between gap-5 ${isArabic ? 'flex-row-reverse text-right' : 'text-left'}`}>
              <div>
                <div className="inline-flex items-center gap-2 bg-[#121212] px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.15em] text-white">
                  <Sparkles className="h-3.5 w-3.5 text-[#ff8dbb]" />
                  Maybelline New York
                </div>
                <h2 className="mt-5 text-[clamp(1.9rem,3vw,3.25rem)] font-black leading-[0.98] tracking-tight text-slate-950 dark:text-white">
                  {isArabic ? 'لمسة لامعة، بأسلوبك.' : 'La touche glossy, à votre façon.'}
                </h2>
              </div>
              <Link
                href="/products?category=maquillage"
                aria-label={isArabic ? 'عرض كل منتجات المكياج' : 'Voir tous les produits maquillage'}
                className="flex h-10 w-10 shrink-0 items-center justify-center border border-slate-300 text-slate-800 transition hover:border-[#ed6d9d] hover:bg-[#fff0f5] hover:text-[#d94f84] dark:border-slate-700 dark:text-white"
              >
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mb-7 flex items-center justify-between border-y border-slate-200 py-3 dark:border-slate-800">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#d94f84]">
                {isArabic ? 'الاختيارات المفضلة' : 'Les favoris du moment'}
              </p>
              <span className="text-[10px] font-bold text-slate-400">{PRODUCT_LIMIT} {isArabic ? 'اختيارات' : 'sélections'}</span>
            </div>

            <div className="grid flex-1 grid-cols-1 divide-y divide-slate-200 border-b border-slate-200 dark:divide-slate-800 dark:border-slate-800 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {isLoading
                ? Array.from({ length: PRODUCT_LIMIT }).map((_, index) => (
                  <div key={index} className="min-h-[315px] animate-pulse p-4 sm:p-5">
                    <div className="aspect-square bg-slate-100 dark:bg-slate-800" />
                    <div className="mt-5 h-3 w-2/3 bg-slate-100 dark:bg-slate-800" />
                    <div className="mt-3 h-3 w-1/2 bg-slate-100 dark:bg-slate-800" />
                  </div>
                ))
                : products.map(product => {
                  const title = product.nameFr || product.title;
                  const hasOffer = product.comparePrice > product.price;
                  return (
                    <article key={product.id} className="group flex min-w-0 flex-col p-4 sm:p-5">
                      <Link href={`/products/${product.id}`} className="relative mb-4 block aspect-square overflow-hidden bg-[#f7f7f6]">
                        <Image
                          src={getOptimizedImageUrl(product.image)}
                          alt={title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 22vw"
                          className="object-contain p-4 transition duration-500 ease-out group-hover:scale-105"
                        />
                        {hasOffer && <span className="absolute left-2 top-2 bg-[#f273a8] px-2 py-1 text-[9px] font-extrabold uppercase tracking-[0.1em] text-white">-{Math.round((1 - product.price / product.comparePrice) * 100)}%</span>}
                      </Link>
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#d94f84]">{product.vendor || 'Maybelline New York'}</p>
                      <Link href={`/products/${product.id}`} className="mt-1 line-clamp-2 min-h-10 text-sm font-extrabold leading-snug text-slate-900 transition group-hover:text-[#d94f84] dark:text-white">
                        {title}
                      </Link>
                      <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                        <span className="text-base font-black tabular-nums text-slate-950 dark:text-white">{convertPrice(product.price)}</span>
                        {hasOffer && <span className="text-[11px] font-semibold text-slate-400 line-through">{convertPrice(product.comparePrice)}</span>}
                      </div>
                      <button
                        type="button"
                        onClick={() => addToCart(product, 1)}
                        className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 border border-slate-900 px-3 text-[11px] font-extrabold text-slate-900 transition hover:border-[#ed6d9d] hover:bg-[#ed6d9d] hover:text-white dark:border-white dark:text-white"
                      >
                        <ShoppingBag className="h-3.5 w-3.5" />
                        {isArabic ? 'أضف' : 'Ajouter'}
                      </button>
                    </article>
                  );
                })}
            </div>

            {!isLoading && products.length === 0 && (
              <div className="flex min-h-64 flex-col items-center justify-center border-b border-slate-200 text-center dark:border-slate-800">
                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                  {isArabic ? 'اختيارات التجميل تصل قريباً.' : 'Les nouvelles sélections beauté arrivent bientôt.'}
                </p>
              </div>
            )}
          </div>

          <div className="relative min-h-[460px] overflow-hidden bg-[#f6d7d9] lg:min-h-full">
            <Image
              src="/images/maybelline-lip-edit.png"
              alt={isArabic ? 'حملة مكياج شفاه وردية' : 'Campagne beauté lèvres rosées'}
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-y-0 left-0 w-[52%] bg-[#f6d7d9]/75" />
            <div className={`absolute inset-x-0 bottom-0 p-7 sm:p-10 ${isArabic ? 'text-right' : 'text-left'}`}>
              <p className="max-w-[15rem] text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#9f355e]">
                {isArabic ? 'لون. لمعان. راحة.' : 'Couleur. Brillance. Confort.'}
              </p>
              <h3 className="mt-3 max-w-sm text-[clamp(2rem,3.5vw,3.5rem)] font-black leading-[0.93] tracking-tight text-[#39212b]">
                {isArabic ? 'تألقي بطريقتك.' : 'Un éclat qui vous ressemble.'}
              </h3>
              <p className="mt-4 max-w-xs text-sm font-semibold leading-relaxed text-[#68434e]">
                {isArabic ? 'اكتشفي مجموعات الشفاه التي تمنحك لمسة نهائية مشرقة ومريحة.' : 'Découvrez des essentiels lèvres conçus pour une tenue lumineuse et agréable.'}
              </p>
              <Link href="/products?category=maquillage" className="mt-6 inline-flex min-h-11 items-center gap-2 bg-[#39212b] px-5 text-xs font-extrabold text-white transition hover:bg-[#d94f84]">
                {isArabic ? 'اكتشف المجموعة' : 'Découvrir la collection'}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
