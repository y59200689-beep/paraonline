'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useUi } from '@/context/UiContext';
import { useTranslation } from '@/context/LanguageContext';

import dynamic from 'next/dynamic';

// Above-the-fold Core Components (Statically Imported for LCP & Immediate Hydration)
import { Hero } from '@/components/Hero';
import { CategoryTrack } from '@/components/CategoryTrack';
import { ProductGrid } from '@/components/ProductGrid';

import { HomepageSectionItem } from '@/context/SettingsContext';

// Below-the-fold Components (Dynamically Imported to defer non-critical JS)
// These sections sit below the initial storefront viewport. Rendering them on
// the server was creating a 1 MB document and more than 200 image elements
// before the customer could interact with the page.
const BrandPartners = dynamic(() => import('@/components/BrandPartners').then((m) => m.BrandPartners), { ssr: false });
const DiagnosticBanner = dynamic(() => import('@/components/DiagnosticBanner').then((m) => m.DiagnosticBanner), { ssr: false });
const SummerSalePromo = dynamic(() => import('@/components/SummerSalePromo').then((m) => m.SummerSalePromo), { ssr: false });
const SkinConcernsSelector = dynamic(() => import('@/components/SkinConcernsSelector').then((m) => m.SkinConcernsSelector), { ssr: false });
const HorizontalPromoBanner = dynamic(() => import('@/components/HorizontalPromoBanner').then((m) => m.HorizontalPromoBanner), { ssr: false });
const MoroccoTrustBar = dynamic(() => import('@/components/MoroccoTrustBar').then((m) => m.MoroccoTrustBar), { ssr: false });
const CustomerReviews = dynamic(() => import('@/components/CustomerReviews').then((m) => m.CustomerReviews), { ssr: false });
const TriplePromoBanners = dynamic(() => import('@/components/TriplePromoBanners').then((m) => m.TriplePromoBanners), { ssr: false });
const TopRatedAsymmetricGrid = dynamic(() => import('@/components/TopRatedAsymmetricGrid').then((m) => m.TopRatedAsymmetricGrid), { ssr: false });
const BestSellersDualGrid = dynamic(() => import('@/components/BestSellersDualGrid').then((m) => m.BestSellersDualGrid), { ssr: false });
const SkincareRoutineSteps = dynamic(() => import('@/components/SkincareRoutineSteps').then((m) => m.SkincareRoutineSteps), { ssr: false });
const RoutineVisualizer = dynamic(() => import('@/components/RoutineVisualizer').then((m) => m.RoutineVisualizer), { ssr: false });
const IngredientDictionary = dynamic(() => import('@/components/IngredientDictionary').then((m) => m.IngredientDictionary), { ssr: false });
const InteractiveFaqWrapper = dynamic(() => import('@/components/InteractiveFaqWrapper').then((m) => m.InteractiveFaqWrapper), { ssr: false });
const FeaturedIngredientSection = dynamic(() => import('@/components/FeaturedIngredientSection').then((m) => m.FeaturedIngredientSection), { ssr: false });
const LaRochePosaySSection = dynamic(() => import('@/components/LaRochePosaySSection').then((m) => m.LaRochePosaySSection), { ssr: false });
const DermoCorner = dynamic(() => import('@/components/DermoCorner').then((m) => m.DermoCorner), { ssr: false });
const ActiveIngredients = dynamic(() => import('@/components/ActiveIngredients').then((m) => m.ActiveIngredients), { ssr: false });
const OfficialDistributorBadge = dynamic(() => import('@/components/OfficialDistributorBadge').then((m) => m.OfficialDistributorBadge), { ssr: false });

interface DynamicSectionRendererProps {
  sections: HomepageSectionItem[];
}

/**
 * Delays a below-the-fold section until it is comfortably close to view.
 *
 * Rendering every dynamic component at hydration starts all of their network
 * requests together, which competes with the hero and catalogue on a first
 * visit. A small sentinel lets the next section begin loading well before the
 * customer reaches it, without making the initial page compete for bandwidth.
 */
function DeferredHomepageSection({ children }: { children: React.ReactNode }) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    if (!('IntersectionObserver' in window)) {
      setShouldRender(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      { rootMargin: '1800px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return <div ref={sentinelRef}>{shouldRender ? children : null}</div>;
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

  const seenTypes = new Set<string>();

  const deferred = (key: string, content: React.ReactNode) => (
    <DeferredHomepageSection key={key}>{content}</DeferredHomepageSection>
  );

  return (
    <>
      {sections.map((section) => {
        if (section.visible === false) return null;

        // Deduplicate section types so bestSellers/weeklySales or duplicates render only once
        const normalizedType = (section.type === 'weeklySales' || section.type === 'bestSellers') 
          ? 'bestSellers' 
          : section.type;

        if (seenTypes.has(normalizedType)) return null;
        seenTypes.add(normalizedType);

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
            return deferred(section.id, <BrandPartners brands={section.settings?.brands} />);

          case 'diagnosticBanner':
            return deferred(section.id, <DiagnosticBanner />);

          case 'summerSale':
            return deferred(section.id, <SummerSalePromo />);

          case 'skinConcerns':
            return deferred(section.id, <SkinConcernsSelector />);

          case 'horizontalPromo':
            return deferred(section.id, <HorizontalPromoBanner settings={section.settings} />);

          case 'trustBar':
            return deferred(section.id, <MoroccoTrustBar />);

          case 'customerReviews':
            return deferred(section.id, <CustomerReviews />);

          case 'triplePromo':
            return deferred(section.id, <TriplePromoBanners cards={section.settings?.promoCards} />);

          case 'topRated':
            return deferred(section.id, <TopRatedAsymmetricGrid />);

          case 'bestSellers':
          case 'weeklySales':
            return deferred(section.id, <BestSellersDualGrid />);

          case 'routineVisualizer':
            return deferred(section.id, <RoutineVisualizer />);

          case 'skincareRoutineSteps':
            return deferred(section.id, <SkincareRoutineSteps />);

          case 'featuredIngredient':
            return deferred(section.id, <FeaturedIngredientSection />);

          case 'laRochePosay':
            return deferred(section.id, <LaRochePosaySSection />);

          case 'ingredientDictionary':
            return deferred(section.id, <IngredientDictionary />);

          case 'dermoCorner':
            return deferred(section.id, <DermoCorner />);

          case 'activeIngredients':
            return deferred(section.id, <ActiveIngredients />);

          case 'officialDistributor':
            return deferred(section.id, <OfficialDistributorBadge />);

          case 'faq':
            return deferred(section.id, <InteractiveFaqWrapper />);

          case 'customHtml':
            if (!section.settings?.html?.trim()) return null;
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

            if (!title && !desc && !ctaText) return null;

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
