'use client';

import React from 'react';
import { useUi } from '@/context/UiContext';
import { useTranslation } from '@/context/LanguageContext';

// Dynamic Components Imports
import { Hero } from '@/components/Hero';
import { CategoryTrack } from '@/components/CategoryTrack';
import { ProductGrid } from '@/components/ProductGrid';
import { BrandPartners } from '@/components/BrandPartners';
import { DiagnosticBanner } from '@/components/DiagnosticBanner';
import { SummerSalePromo } from '@/components/SummerSalePromo';
import { SkinConcernsSelector } from '@/components/SkinConcernsSelector';
import { FlashSaleBanner } from '@/components/FlashSaleBanner';
import { HorizontalPromoBanner } from '@/components/HorizontalPromoBanner';
import { MoroccoTrustBar } from '@/components/MoroccoTrustBar';
import { CustomerReviews } from '@/components/CustomerReviews';
import { TriplePromoBanners } from '@/components/TriplePromoBanners';
import { TopRatedAsymmetricGrid } from '@/components/TopRatedAsymmetricGrid';
import { BestSellersDualGrid } from '@/components/BestSellersDualGrid';
import { SkincareRoutineSteps } from '@/components/SkincareRoutineSteps';
import { RoutineVisualizer } from '@/components/RoutineVisualizer';
import { IngredientDictionary } from '@/components/IngredientDictionary';
import { InteractiveFaqWrapper } from '@/components/InteractiveFaqWrapper';
import { FeaturedIngredientSection } from '@/components/FeaturedIngredientSection';
import { HomepageSectionItem } from '@/context/SettingsContext';

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
                />
              </main>
            );

          case 'brandPartners':
            return <BrandPartners key={section.id} />;

          case 'diagnosticBanner':
            return <DiagnosticBanner key={section.id} />;

          case 'summerSale':
            return <SummerSalePromo key={section.id} />;

          case 'skinConcerns':
            return <SkinConcernsSelector key={section.id} />;

          case 'flashSale':
            return <FlashSaleBanner key={section.id} />;

          case 'horizontalPromo':
            return <HorizontalPromoBanner key={section.id} />;

          case 'trustBar':
            return <MoroccoTrustBar key={section.id} />;

          case 'customerReviews':
            return <CustomerReviews key={section.id} />;

          case 'triplePromo':
            return <TriplePromoBanners key={section.id} />;

          case 'topRated':
            return <TopRatedAsymmetricGrid key={section.id} />;

          case 'bestSellers':
            return <BestSellersDualGrid key={section.id} />;

          case 'routineVisualizer':
            return (
              <React.Fragment key={section.id}>
                <RoutineVisualizer />
                <SkincareRoutineSteps />
              </React.Fragment>
            );

          case 'featuredIngredient':
            return <FeaturedIngredientSection key={section.id} />;

          case 'ingredientDictionary':
            return <IngredientDictionary key={section.id} />;

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
