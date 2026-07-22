'use client';

import React from 'react';
import { useUi } from '@/context/UiContext';
import { useTranslation } from '@/context/LanguageContext';

import dynamic from 'next/dynamic';

// Above-the-fold Core Components (Statically Imported for LCP & Immediate Hydration)
import { Hero } from '@/components/Hero';
import { CategoryTrack } from '@/components/CategoryTrack';
import { ProductGrid } from '@/components/ProductGrid';

import { HomepageSectionItem } from '@/context/SettingsContext';

// Below-the-fold Components (Dynamically Imported to defer non-critical JS)
const BrandPartners = dynamic(() => import('@/components/BrandPartners').then((m) => m.BrandPartners));
const DiagnosticBanner = dynamic(() => import('@/components/DiagnosticBanner').then((m) => m.DiagnosticBanner));
const SummerSalePromo = dynamic(() => import('@/components/SummerSalePromo').then((m) => m.SummerSalePromo));
const SkinConcernsSelector = dynamic(() => import('@/components/SkinConcernsSelector').then((m) => m.SkinConcernsSelector));
const HorizontalPromoBanner = dynamic(() => import('@/components/HorizontalPromoBanner').then((m) => m.HorizontalPromoBanner));
const MoroccoTrustBar = dynamic(() => import('@/components/MoroccoTrustBar').then((m) => m.MoroccoTrustBar));
const CustomerReviews = dynamic(() => import('@/components/CustomerReviews').then((m) => m.CustomerReviews));
const TriplePromoBanners = dynamic(() => import('@/components/TriplePromoBanners').then((m) => m.TriplePromoBanners));
const TopRatedAsymmetricGrid = dynamic(() => import('@/components/TopRatedAsymmetricGrid').then((m) => m.TopRatedAsymmetricGrid));
const BestSellersDualGrid = dynamic(() => import('@/components/BestSellersDualGrid').then((m) => m.BestSellersDualGrid));
const SkincareRoutineSteps = dynamic(() => import('@/components/SkincareRoutineSteps').then((m) => m.SkincareRoutineSteps));
const RoutineVisualizer = dynamic(() => import('@/components/RoutineVisualizer').then((m) => m.RoutineVisualizer));
const IngredientDictionary = dynamic(() => import('@/components/IngredientDictionary').then((m) => m.IngredientDictionary));
const InteractiveFaqWrapper = dynamic(() => import('@/components/InteractiveFaqWrapper').then((m) => m.InteractiveFaqWrapper));
const FeaturedIngredientSection = dynamic(() => import('@/components/FeaturedIngredientSection').then((m) => m.FeaturedIngredientSection));
const LaRochePosaySSection = dynamic(() => import('@/components/LaRochePosaySSection').then((m) => m.LaRochePosaySSection));
const DermoCorner = dynamic(() => import('@/components/DermoCorner').then((m) => m.DermoCorner));
const ActiveIngredients = dynamic(() => import('@/components/ActiveIngredients').then((m) => m.ActiveIngredients));
const OfficialDistributorBadge = dynamic(() => import('@/components/OfficialDistributorBadge').then((m) => m.OfficialDistributorBadge));

interface DynamicSectionRendererProps {
  sections: HomepageSectionItem[];
}

export function DynamicSectionRenderer({ sections }: DynamicSectionRendererProps) {
  const {
    activeCategory,
    setActiveCategory,
    setDiagnosticOpen,
    setSelectedProduct
  } = useUi();

  const { language } = useTranslation();
  const isRTL = language === 'AR';

  const handleSelectCategory = (tag: string) => {
    setActiveCategory(tag);
    const el = document.getElementById('boutique-grid');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {sections.map((section) => {
        if (section.visible === false) return null;

        switch (section.type) {
          case 'hero':
            return (
              <Hero
                key={section.id}
                onOpenDiagnostic={() => setDiagnosticOpen(true)}
                onSelectCategory={handleSelectCategory}
              />
            );

          case 'categoryTrack':
            return (
              <CategoryTrack
                key={section.id}
                activeCategory={activeCategory}
                onSelectCategory={handleSelectCategory}
              />
            );

          case 'productGrid':
            return (
              <main id="boutique-grid" key={section.id} className="reveal-on-scroll">
                <ProductGrid
                  activeCategory={activeCategory}
                  onSelectCategory={setActiveCategory}
                  onOpenQuickView={(p) => setSelectedProduct(p)}
                  pinnedProductIds={section.settings?.productIds || []}
                />
              </main>
            );

          case 'brandPartners':
            return <BrandPartners key={section.id} brands={section.settings?.brands} />;

          case 'diagnosticBanner':
            return <DiagnosticBanner key={section.id} />;

          case 'summerSale':
            return <SummerSalePromo key={section.id} />;

          case 'skinConcerns':
            return <SkinConcernsSelector key={section.id} />;

          case 'horizontalPromo':
            return <HorizontalPromoBanner key={section.id} settings={section.settings} />;

          case 'trustBar':
            return <MoroccoTrustBar key={section.id} />;

          case 'customerReviews':
            return <CustomerReviews key={section.id} />;

          case 'triplePromo':
            return <TriplePromoBanners key={section.id} cards={section.settings?.promoCards} />;

          case 'topRated':
            return <TopRatedAsymmetricGrid key={section.id} />;

          case 'bestSellers':
            return <BestSellersDualGrid key={section.id} />;

          case 'routineVisualizer':
            return <RoutineVisualizer key={section.id} />;

          case 'skincareRoutineSteps':
            return <SkincareRoutineSteps key={section.id} />;

          case 'featuredIngredient':
            return <FeaturedIngredientSection key={section.id} />;

          case 'laRochePosay':
            return <LaRochePosaySSection key={section.id} />;

          case 'ingredientDictionary':
            return <IngredientDictionary key={section.id} />;

          case 'dermoCorner':
            return <DermoCorner key={section.id} />;

          case 'activeIngredients':
            return <ActiveIngredients key={section.id} />;

          case 'officialDistributor':
            return <OfficialDistributorBadge key={section.id} />;

          case 'faq':
            return <InteractiveFaqWrapper key={section.id} />;

          case 'customHtml':
            return (
              <section
                key={section.id}
                className="w-full overflow-hidden reveal-on-scroll"
                dangerouslySetInnerHTML={{ __html: section.settings?.html || '' }}
              />
            );

          case 'richText': {
            const title = isRTL ? section.settings?.titleAr : section.settings?.titleFr;
            const desc = isRTL ? section.settings?.descAr : section.settings?.descFr;
            const ctaText = isRTL ? section.settings?.ctaTextAr : section.settings?.ctaTextFr;
            const ctaLink = section.settings?.ctaLink || '#';
            const bgColor = section.settings?.bgColor || 'transparent';
            const textColor = section.settings?.textColor || 'inherit';

            return (
              <section
                key={section.id}
                className="py-16 md:py-24 px-6 md:px-12 w-full border-b border-slate-100/50 reveal-on-scroll"
                style={{ backgroundColor: bgColor, color: textColor }}
              >
                <div className="max-w-3xl mx-auto text-center space-y-6">
                  {title && (
                    <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight font-heading leading-tight">
                      {title}
                    </h2>
                  )}
                  {desc && (
                    <p className="text-base md:text-lg opacity-85 leading-relaxed font-sans">
                      {desc}
                    </p>
                  )}
                  {ctaText && (
                    <div className="pt-2">
                      <a
                        href={ctaLink}
                        className="inline-flex items-center justify-center px-7 py-3.5 rounded-full font-bold text-sm tracking-wide bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        {ctaText}
                      </a>
                    </div>
                  )}
                </div>
              </section>
            );
          }

          default:
            return null;
        }
      })}
    </>
  );
}
