'use client';

import React from 'react';
import { Hero } from './Hero';
import { CategoryTrack } from './CategoryTrack';
import { ProductGrid } from './ProductGrid';
import { useUi } from '@/context/UiContext';
import { useSettings } from '@/context/SettingsContext';

export const HomeBoutiqueSection: React.FC = () => {
  const {
    activeCategory,
    setActiveCategory,
    setDiagnosticOpen,
    setSelectedProduct
  } = useUi();

  const { settings } = useSettings();
  const hp = settings?.homepageSections || {};
  const showHero = hp.showHero ?? true;
  const showCategoryTrack = hp.showCategoryTrack ?? true;
  const showProductGrid = hp.showProductGrid ?? true;

  const handleSelectCategory = (tag: string) => {
    setActiveCategory(tag);
    const el = document.getElementById('boutique-grid');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* Hero Carousel */}
      {showHero && (
        <Hero
          onOpenDiagnostic={() => setDiagnosticOpen(true)}
          onSelectCategory={handleSelectCategory}
        />
      )}

      {/* Category Scroller */}
      {showCategoryTrack && (
        <CategoryTrack
          activeCategory={activeCategory}
          onSelectCategory={handleSelectCategory}
        />
      )}

      {/* Product Grid */}
      {showProductGrid && (
        <main id="boutique-grid">
          <ProductGrid
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
            onOpenQuickView={(p) => setSelectedProduct(p)}
          />
        </main>
      )}
    </>
  );
};
