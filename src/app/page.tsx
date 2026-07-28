import React from 'react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://paraofficinal.ma';

export const metadata: Metadata = {
  title: 'Parapharmacie & K-Beauty Officiel au Maroc',
  description:
    'Leader de la K-Beauty et de la Dermo-Cosmétique au Maroc. Diagnostic de peau IA, livraison gratuite le jour même, paiement à la livraison sécurisé.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    title: 'Para Officinal S.A | Parapharmacie & K-Beauty',
    description: 'Leader de la K-Beauty au Maroc. Diagnostic IA, livraison gratuite.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
};

// JSON-LD structured data — Organization + WebSite (rendered server-side, no JS needed)
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Para Officinal S.A',
  url: SITE_URL,
  logo: `${SITE_URL}/images/logo.png`,
  description: 'Leader de la K-Beauty et de la Dermo-Cosmétique au Maroc.',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'MA',
  },
  sameAs: [],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    availableLanguage: ['French', 'Arabic'],
  },
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Para Officinal S.A',
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/products?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

// Component Imports
import { ShopShell } from '@/components/ShopShell';
import { ScrollRevealInit } from '@/components/ScrollRevealInit';
import { DynamicSectionRenderer } from '@/components/DynamicSectionRenderer';
import { HomepageSectionItem } from '@/context/SettingsContext';
import { getPublicSettings } from '@/lib/get-public-settings';

export default async function Home() {
  const settings = await getPublicSettings();
  const hp = settings.homepageSections || {};

  const defaultSections: HomepageSectionItem[] = [
    { id: 'hero-1', type: 'hero', nameFr: 'Carrousel Héro & Diaporama', visible: hp.showHero ?? true },
    { id: 'categoryTrack-1', type: 'categoryTrack', nameFr: 'Barre de Défilement des Catégories', visible: hp.showCategoryTrack ?? true },
    { id: 'productGrid-1', type: 'productGrid', nameFr: 'Grille Principale des Produits', visible: hp.showProductGrid ?? true, settings: { productIds: hp.featuredProductIds || [] } },
    { id: 'brandPartners-1', type: 'brandPartners', nameFr: 'Marques Partenaires', visible: hp.showBrandPartners ?? true },
    { id: 'diagnosticBanner-1', type: 'diagnosticBanner', nameFr: 'Diagnostic de Peau IA', visible: hp.showDiagnosticBanner ?? false },
    { id: 'summerSale-1', type: 'summerSale', nameFr: "Offres d'Été (Summer Sale)", visible: hp.showSummerSale ?? true },
    { id: 'dermoCorner-1', type: 'dermoCorner', nameFr: 'Dermo Corner (Acné vs Taches)', visible: hp.showDermoCorner ?? true },
    { id: 'skinConcerns-1', type: 'skinConcerns', nameFr: 'Bento de Préoccupations Cutanées', visible: hp.showSkinConcerns ?? true },
    { id: 'horizontalPromo-1', type: 'horizontalPromo', nameFr: 'Bannière Promotionnelle Horizontale', visible: false },
    { id: 'customerReviews-1', type: 'customerReviews', nameFr: 'Témoignages & Avis Clients', visible: hp.showCustomerReviews ?? true },
    { id: 'triplePromo-1', type: 'triplePromo', nameFr: 'Bannières Triple Promotionnelles', visible: hp.showTriplePromo ?? true },
    { id: 'topRated-1', type: 'topRated', nameFr: 'Produits les Mieux Notés', visible: hp.showTopRated ?? true, settings: { titleFr: hp.topRatedTitleFr, titleAr: hp.topRatedTitleAr, productIds: hp.topRatedProductIds || [] } },
    { id: 'bestSellers-1', type: 'bestSellers', nameFr: 'Produits les Plus Vendus', visible: (hp.showBestSellers ?? true) || (hp.showWeeklySales ?? true), settings: { titleFr: hp.bestSellersTitleFr, titleAr: hp.bestSellersTitleAr, productIds: hp.bestSellersProductIds || [] } },
    { id: 'routineVisualizer-1', type: 'routineVisualizer', nameFr: 'Visualiseur de Routine de Soins', visible: hp.showRoutineVisualizer ?? true },
    { id: 'featuredIngredient-1', type: 'featuredIngredient', nameFr: 'Marques Vedettes de la Semaine', visible: hp.showFeaturedIngredient ?? true },
    { id: 'skincareRoutineSteps-1', type: 'skincareRoutineSteps', nameFr: 'Étapes de la Routine Skincare', visible: hp.showRoutineVisualizer ?? true },
    { id: 'activeIngredients-1', type: 'activeIngredients', nameFr: 'Molécules & Ingrédients Actifs', visible: true },
    { id: 'ingredientDictionary-1', type: 'ingredientDictionary', nameFr: 'Dictionnaire Clinique des Ingrédients', visible: hp.showIngredientDictionary ?? true },
    { id: 'faq-1', type: 'faq', nameFr: 'Foire Aux Questions (FAQ)', visible: hp.showFaq ?? true },
    { id: 'officialDistributor-1', type: 'officialDistributor', nameFr: 'Badge Distributeur Officiel', visible: true },
    { id: 'trustBar-1', type: 'trustBar', nameFr: 'Barre de Confiance Maroc', visible: hp.showTrustBar ?? true }
  ];

  const rawSectionsList = hp.sectionOrder 
    ? hp.sectionOrder.filter((s: any) => s.type !== 'flashSale' && s.type !== 'curationClinique' && s.type !== 'horizontalPromo' && s.type !== 'weeklySales')
    : defaultSections.filter(s => s.type !== 'horizontalPromo' && s.type !== 'weeklySales');
  let sectionsList = [...rawSectionsList];
  
  // 1. Ensure 'skincareRoutineSteps-1' is in the list
  if (!sectionsList.some(s => s.id === 'skincareRoutineSteps-1')) {
    const ingredientIdx = sectionsList.findIndex(s => s.id === 'featuredIngredient-1');
    if (ingredientIdx !== -1) {
      sectionsList.splice(ingredientIdx + 1, 0, {
        id: 'skincareRoutineSteps-1',
        type: 'skincareRoutineSteps',
        nameFr: 'Étapes de la Routine Skincare',
        visible: hp.showRoutineVisualizer ?? true
      });
    } else {
      sectionsList.push({
        id: 'skincareRoutineSteps-1',
        type: 'skincareRoutineSteps',
        nameFr: 'Étapes de la Routine Skincare',
        visible: hp.showRoutineVisualizer ?? true
      });
    }
  }

  // 1b. Ensure 'dermoCorner-1' is in the list and set to visible
  const existingDermoIdx = sectionsList.findIndex(s => s.id === 'dermoCorner-1' || s.type === 'dermoCorner');
  if (existingDermoIdx === -1) {
    sectionsList.push({ id: 'dermoCorner-1', type: 'dermoCorner', nameFr: 'Dermo Corner (Acné vs Taches)', visible: true });
  } else {
    sectionsList[existingDermoIdx].visible = true;
  }

  // 1c. Ensure 'activeIngredients-1' is in the list
  if (!sectionsList.some(s => s.id === 'activeIngredients-1')) {
    const dictIdx = sectionsList.findIndex(s => s.id === 'ingredientDictionary-1');
    if (dictIdx !== -1) {
      sectionsList.splice(dictIdx, 0, { id: 'activeIngredients-1', type: 'activeIngredients', nameFr: 'Molécules & Ingrédients Actifs', visible: true });
    } else {
      sectionsList.push({ id: 'activeIngredients-1', type: 'activeIngredients', nameFr: 'Molécules & Ingrédients Actifs', visible: true });
    }
  }

  // 1d. Ensure 'officialDistributor-1' is in the list
  if (!sectionsList.some(s => s.id === 'officialDistributor-1')) {
    const trustIdx = sectionsList.findIndex(s => s.id === 'trustBar-1');
    if (trustIdx !== -1) {
      sectionsList.splice(trustIdx, 0, { id: 'officialDistributor-1', type: 'officialDistributor', nameFr: 'Badge Distributeur Officiel', visible: true });
    } else {
      sectionsList.push({ id: 'officialDistributor-1', type: 'officialDistributor', nameFr: 'Badge Distributeur Officiel', visible: true });
    }
  }

  // 2. Programmatically place 'featuredIngredient-1' directly under 'routineVisualizer-1'
  const visualizerIdx = sectionsList.findIndex(s => s.id === 'routineVisualizer-1');
  const ingredientIdx = sectionsList.findIndex(s => s.id === 'featuredIngredient-1');
  if (visualizerIdx !== -1 && ingredientIdx !== -1 && ingredientIdx !== visualizerIdx + 1) {
    const [ingredientItem] = sectionsList.splice(ingredientIdx, 1);
    const newVisualizerIdx = sectionsList.findIndex(s => s.id === 'routineVisualizer-1');
    sectionsList.splice(newVisualizerIdx + 1, 0, ingredientItem);
  }

  // 3. Programmatically place 'skincareRoutineSteps-1' directly under 'featuredIngredient-1'
  const newIngredientIdx = sectionsList.findIndex(s => s.id === 'featuredIngredient-1');
  const stepsIdx = sectionsList.findIndex(s => s.id === 'skincareRoutineSteps-1');
  if (newIngredientIdx !== -1 && stepsIdx !== -1 && stepsIdx !== newIngredientIdx + 1) {
    const [stepsItem] = sectionsList.splice(stepsIdx, 1);
    const updatedIngredientIdx = sectionsList.findIndex(s => s.id === 'featuredIngredient-1');
    sectionsList.splice(updatedIngredientIdx + 1, 0, stepsItem);
  }

  // 4. Programmatically place 'dermoCorner-1' directly under 'summerSale-1'
  const summerSaleIdx = sectionsList.findIndex(s => s.id === 'summerSale-1');
  const dermoCornerIdx = sectionsList.findIndex(s => s.id === 'dermoCorner-1');
  if (summerSaleIdx !== -1 && dermoCornerIdx !== -1 && dermoCornerIdx !== summerSaleIdx + 1) {
    const [dermoCornerItem] = sectionsList.splice(dermoCornerIdx, 1);
    const newSummerSaleIdx = sectionsList.findIndex(s => s.id === 'summerSale-1');
    sectionsList.splice(newSummerSaleIdx + 1, 0, dermoCornerItem);
  }

  return (
    <ShopShell>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      {/* Scroll Reveal Animation Observer */}
      <ScrollRevealInit />

      {/* Render Dynamic Homepage Sections */}
      <DynamicSectionRenderer sections={sectionsList} />
    </ShopShell>
  );
}
