'use client';

import React from 'react';
import { MapPin, Star } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';

type PublicReview = {
  name: string;
  nameAr: string;
  city: string;
  cityAr: string;
  stars: number;
  review: string;
  reviewAr: string;
};

export const CustomerReviews: React.FC = () => {
  const { settings } = useSettings();
  const section = settings.homepageSections?.sectionOrder?.find((item) => item.type === 'customerReviews');
  const configured = section?.settings?.reviews || [];

  const reviews: PublicReview[] = configured
    .filter((review) => review.author && review.textFr && Number(review.rating) > 0)
    .map((review) => ({
      name: review.author,
      nameAr: review.authorAr || review.author,
      city: review.role || 'Maroc',
      cityAr: review.roleAr || review.role || 'المغرب',
      stars: Math.max(1, Math.min(5, Math.round(Number(review.rating)))),
      review: review.textFr,
      reviewAr: review.textAr || review.textFr,
    }));

  // Never manufacture testimonials. The section appears only when content has
  // been entered in the CMS and can be traced back to a real customer review.
  if (reviews.length === 0) return null;

  const average = (reviews.reduce((sum, review) => sum + review.stars, 0) / reviews.length).toFixed(1);

  return (
    <section className="section-dark border-b border-slate-800/40 py-16 md:py-24" aria-labelledby="customer-reviews-title">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 md:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="eyebrow-tag eyebrow-tag-dark">
              <span className="hidden rtl:inline">آراء العملاء</span>
              <span className="rtl:hidden">Avis clients</span>
            </span>
            <h2 id="customer-reviews-title" className="mt-3 text-[22px] font-black leading-tight text-white md:text-3xl">
              <span className="hidden rtl:inline">تجارب شاركها عملاؤنا</span>
              <span className="rtl:hidden">Des expériences partagées par nos clients</span>
            </h2>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2" aria-label={`${average} sur 5, ${reviews.length} avis`}>
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden="true" />
            <strong className="text-sm text-white">{average}/5</strong>
            <span className="text-xs text-slate-400">{reviews.length} avis</span>
          </div>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.slice(0, 6).map((review, index) => (
            <li key={`${review.name}-${index}`} className="rounded-2xl border border-white/10 bg-white/[0.055] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.12)]">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-white">
                    <span className="hidden rtl:inline">{review.nameAr}</span>
                    <span className="rtl:hidden">{review.name}</span>
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                    <MapPin className="h-3 w-3" aria-hidden="true" />
                    <span className="hidden rtl:inline">{review.cityAr}</span>
                    <span className="rtl:hidden">{review.city}</span>
                  </p>
                </div>
                <div className="flex" aria-label={`${review.stars} sur 5`}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className={`h-3.5 w-3.5 ${star <= review.stars ? 'fill-amber-400 text-amber-400' : 'fill-slate-700 text-slate-700'}`} aria-hidden="true" />
                  ))}
                </div>
              </div>
              <p className="text-sm leading-6 text-slate-200">
                <span className="hidden rtl:inline">“{review.reviewAr}”</span>
                <span className="rtl:hidden">“{review.review}”</span>
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
