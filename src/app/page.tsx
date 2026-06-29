import React from 'react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

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
import { supabaseAdmin } from '@/lib/supabase';
import { HomepageSectionItem } from '@/context/SettingsContext';

export default async function Home() {
  const { data: dbData } = await supabaseAdmin
    .from('settings')
    .select('*')
    .eq('id', 1)
    .single();

  const settings = dbData?.value || {};
  const hp = settings.homepageSections || {};

  const defaultSections: HomepageSectionItem[] = [
    { id: 'hero-1', type: 'hero', nameFr: 'Carrousel Héro & Diaporama', visible: hp.showHero ?? true },
    { id: 'categoryTrack-1', type: 'categoryTrack', nameFr: 'Barre de Défilement des Catégories', visible: hp.showCategoryTrack ?? true },
    { id: 'productGrid-1', type: 'productGrid', nameFr: 'Grille Principale des Produits', visible: hp.showProductGrid ?? true, settings: { productIds: hp.featuredProductIds || [] } },
    { id: 'brandPartners-1', type: 'brandPartners', nameFr: 'Marques Partenaires', visible: hp.showBrandPartners ?? true },
    { id: 'diagnosticBanner-1', type: 'diagnosticBanner', nameFr: 'Diagnostic de Peau IA', visible: hp.showDiagnosticBanner ?? false },
    { id: 'summerSale-1', type: 'summerSale', nameFr: "Offres d'Été (Summer Sale)", visible: hp.showSummerSale ?? true },
    { id: 'skinConcerns-1', type: 'skinConcerns', nameFr: 'Bento de Préoccupations Cutanées', visible: hp.showSkinConcerns ?? true },
    { id: 'curationClinique-1', type: 'curationClinique', nameFr: 'Curation Clinique par Préoccupation', visible: true },
    { id: 'flashSale-1', type: 'flashSale', nameFr: 'Bannière de Vente Flash', visible: hp.showFlashSale ?? true },
    { id: 'horizontalPromo-1', type: 'horizontalPromo', nameFr: 'Bannière Promotionnelle Horizontale', visible: hp.showHorizontalPromo ?? true },
    { id: 'customerReviews-1', type: 'customerReviews', nameFr: 'Témoignages & Avis Clients', visible: hp.showCustomerReviews ?? true },
    { id: 'triplePromo-1', type: 'triplePromo', nameFr: 'Bannières Triple Promotionnelles', visible: hp.showTriplePromo ?? true },
    { id: 'topRated-1', type: 'topRated', nameFr: 'Produits les Mieux Notés', visible: hp.showTopRated ?? true, settings: { titleFr: hp.topRatedTitleFr, titleAr: hp.topRatedTitleAr, productIds: hp.topRatedProductIds || [] } },
    { id: 'bestSellers-1', type: 'bestSellers', nameFr: 'Produits les Plus Vendus', visible: (hp.showBestSellers ?? true) || (hp.showWeeklySales ?? true), settings: { titleFr: hp.bestSellersTitleFr, titleAr: hp.bestSellersTitleAr, productIds: hp.bestSellersProductIds || [] } },
    { id: 'routineVisualizer-1', type: 'routineVisualizer', nameFr: 'Visualiseur de Routine de Soins', visible: hp.showRoutineVisualizer ?? true },
    { id: 'featuredIngredient-1', type: 'featuredIngredient', nameFr: 'Ingrédient Focus de la Semaine', visible: hp.showFeaturedIngredient ?? true },
    { id: 'ingredientDictionary-1', type: 'ingredientDictionary', nameFr: 'Dictionnaire Clinique des Ingrédients', visible: hp.showIngredientDictionary ?? true },
    { id: 'faq-1', type: 'faq', nameFr: 'Foire Aux Questions (FAQ)', visible: hp.showFaq ?? true },
    { id: 'trustBar-1', type: 'trustBar', nameFr: 'Barre de Confiance Maroc', visible: hp.showTrustBar ?? true }
  ];

  const sectionsList = hp.sectionOrder || defaultSections;

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
