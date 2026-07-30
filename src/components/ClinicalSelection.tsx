'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Check, ShieldCheck, ShoppingBag } from 'lucide-react';
import type { Product } from '@/lib/data';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useTranslation } from '@/context/LanguageContext';
import { getOptimizedImageUrl } from '@/lib/image-optimizer';

const PRODUCT_LIMIT = 3;

export const ClinicalSelection: React.FC = () => {
  const { language } = useTranslation();
  const { addToCart } = useCart();
  const { convertPrice } = useCurrency();
  const isArabic = language === 'AR';
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const loadSelection = async () => {
      try {
        const response = await fetch(`/api/products?category=solaire&limit=${PRODUCT_LIMIT}&sort=alphabetical`, {
          signal: controller.signal,
        });
        const data = await response.json();
        if (data.success) setProducts(data.products || []);
      } catch (error: any) {
        if (error?.name !== 'AbortError') console.error('Unable to load clinical selection:', error);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    loadSelection();
    return () => controller.abort();
  }, []);

  return (
    <section className="border-t border-slate-200/70 bg-[#f4f7f6] py-12 dark:border-slate-800 dark:bg-slate-950 md:py-20">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 md:px-8">
        <div className="grid overflow-hidden border border-slate-200/80 bg-white shadow-[0_18px_52px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)]">
          <div className="relative min-h-[430px] overflow-hidden bg-[#10263d] p-7 text-white sm:p-10 lg:min-h-[590px] lg:p-12">
            <Image
              src="/images/lrp_hero_studio.webp"
              alt={isArabic ? 'عناية واقية بالبشرة' : 'Soin dermatologique protecteur'}
              fill
              priority={false}
              sizes="(max-width: 1024px) 100vw, 44vw"
              className="object-cover object-center opacity-70"
            />
            <div className="absolute inset-0 bg-[#10263d]/65" />
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-primary" />

            <div className={`relative z-10 flex h-full min-h-[370px] flex-col justify-between ${isArabic ? 'items-end text-right' : 'items-start text-left'}`}>
              <div className="inline-flex items-center gap-2 border border-white/25 bg-[#10263d]/70 px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-white">
                <ShieldCheck className="h-4 w-4 text-[#8ee4ca]" />
                {isArabic ? 'اختيار الخبراء' : 'Sélection des experts'}
              </div>

              <div className="max-w-md space-y-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#b9eadc]">
                  {isArabic ? 'الروتين اليومي الواقي' : 'Le rituel protecteur quotidien'}
                </p>
                <h2 className="font-heading text-[clamp(2.2rem,4vw,4.25rem)] font-black leading-[0.96] tracking-tight text-white">
                  {isArabic ? 'حماية دقيقة، كل يوم.' : 'Une protection précise, chaque jour.'}
                </h2>
                <p className="max-w-sm text-sm font-medium leading-relaxed text-slate-200 sm:text-[15px]">
                  {isArabic
                    ? 'تركيبات مختارة للبشرة الحساسة، تجمع بين الحماية واسعة الطيف وراحة الاستعمال اليومية.'
                    : 'Des formules choisies pour les peaux sensibles, associant protection à large spectre et confort au quotidien.'}
                </p>
              </div>

              <Link
                href="/products?category=solaire"
                className="inline-flex min-h-11 items-center gap-2 bg-white px-5 text-xs font-extrabold text-slate-900 transition hover:bg-[#d9f4ec] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                {isArabic ? 'اكتشف الحماية الشمسية' : 'Découvrir la protection solaire'}
                <ArrowRight className={`h-4 w-4 ${isArabic ? 'rotate-180' : ''}`} />
              </Link>
            </div>
          </div>

          <div className="flex min-w-0 flex-col p-5 sm:p-8 lg:p-10">
            <div className={`mb-7 flex items-end justify-between gap-5 ${isArabic ? 'flex-row-reverse text-right' : 'text-left'}`}>
              <div className="max-w-xl">
                <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-primary">
                  {isArabic ? 'اختيارات مختارة' : 'En vitrine'}
                </p>
                <h3 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                  {isArabic ? 'أساسيات الحماية الشمسية' : 'Les essentiels solaires'}
                </h3>
                <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500 dark:text-slate-400">
                  {isArabic
                    ? 'حلول حماية موثوقة، صالحة لكل يوم ومختارة من مختبرات معتمدة.'
                    : 'Une sélection fiable, pensée pour accompagner chaque exposition avec des laboratoires reconnus.'}
                </p>
              </div>
              <div className="hidden shrink-0 border border-slate-200 px-3 py-2 text-right dark:border-slate-700 sm:block">
                <span className="block text-[9px] font-extrabold uppercase tracking-[0.12em] text-slate-400">SPF</span>
                <span className="block text-lg font-black tabular-nums text-slate-800 dark:text-slate-100">50+</span>
              </div>
            </div>

            <div className="grid flex-1 grid-cols-1 divide-y divide-slate-200 border-y border-slate-200 dark:divide-slate-800 dark:border-slate-800 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {isLoading
                ? Array.from({ length: PRODUCT_LIMIT }).map((_, index) => (
                  <div key={index} className="min-h-[305px] animate-pulse p-4 sm:p-5">
                    <div className="aspect-square bg-slate-100 dark:bg-slate-800" />
                    <div className="mt-5 h-3 w-2/3 bg-slate-100 dark:bg-slate-800" />
                    <div className="mt-3 h-3 w-1/2 bg-slate-100 dark:bg-slate-800" />
                  </div>
                ))
                : products.map(product => {
                  const title = product.nameFr || product.title;
                  const hasOffer = product.comparePrice > product.price;
                  return (
                    <article key={product.id} className="group relative flex min-w-0 flex-col p-4 sm:p-5">
                      <Link href={`/products/${product.id}`} className="relative mb-4 block aspect-square overflow-hidden bg-[#f6f8f7]">
                        <Image
                          src={getOptimizedImageUrl(product.image)}
                          alt={title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 19vw"
                          className="object-contain p-4 transition duration-500 ease-out group-hover:scale-105"
                        />
                        {hasOffer && (
                          <span className="absolute left-2 top-2 bg-[#10263d] px-2 py-1 text-[9px] font-extrabold uppercase tracking-[0.1em] text-white">
                            {isArabic ? 'عرض' : 'Offre'}
                          </span>
                        )}
                      </Link>
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-primary">{product.vendor || 'Para Officinal'}</p>
                      <Link href={`/products/${product.id}`} className="mt-1 line-clamp-2 min-h-10 text-sm font-extrabold leading-snug text-slate-800 transition group-hover:text-primary dark:text-slate-100">
                        {title}
                      </Link>
                      <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-base font-black tabular-nums text-slate-900 dark:text-white">{convertPrice(product.price)}</span>
                        {hasOffer && <span className="text-[11px] font-semibold text-slate-400 line-through">{convertPrice(product.comparePrice)}</span>}
                      </div>
                      <button
                        type="button"
                        onClick={() => addToCart(product, 1)}
                        className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 border border-slate-900 px-3 text-[11px] font-extrabold text-slate-900 transition hover:border-primary hover:bg-primary hover:text-white dark:border-white dark:text-white dark:hover:border-primary"
                      >
                        <ShoppingBag className="h-3.5 w-3.5" />
                        {isArabic ? 'أضف للسلة' : 'Ajouter'}
                      </button>
                    </article>
                  );
                })}
            </div>

            {!isLoading && products.length === 0 && (
              <div className="flex min-h-64 flex-col items-center justify-center border-y border-slate-200 text-center dark:border-slate-800">
                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                  {isArabic ? 'تتوفر اختيارات جديدة قريباً.' : 'De nouvelles sélections arrivent bientôt.'}
                </p>
              </div>
            )}

            <div className={`mt-6 flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 ${isArabic ? 'justify-end text-right' : ''}`}>
              <Check className="h-4 w-4 shrink-0 text-primary" />
              {isArabic ? 'منتجات أصلية من موزعين معتمدين.' : 'Produits authentiques, issus de distributeurs agréés.'}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
