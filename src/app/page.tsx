import React from 'react';
import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://paraofficinal.ma';

export const metadata: Metadata = {
  title: 'Parapharmacie et K-Beauty au Maroc',
  description:
    'Découvrez une sélection de soins, maquillage et produits K-Beauty, avec livraison au Maroc et paiement sécurisé.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    title: 'Para Officinal S.A | Parapharmacie & K-Beauty',
    description: 'Soins, maquillage et produits K-Beauty avec livraison au Maroc.',
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
  description: 'Parapharmacie et soins beauté au Maroc.',
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
import { DynamicSectionRenderer } from '@/components/DynamicSectionRenderer';
import { HomepageSectionItem } from '@/context/SettingsContext';
import { getPublicSettings } from '@/lib/get-public-settings';
import { getHomepageSections } from '@/lib/cms-homepage';
import { getCmsPreviewSnapshot } from '@/lib/cms-preview';

// Default sections — used only when no CMS homepage record exists.
// Once the admin publishes the homepage, this array is never consulted.
const DEFAULT_SECTIONS: HomepageSectionItem[] = [
  { id: 'hero-1',                 type: 'hero',                 nameFr: 'Carrousel Héro & Diaporama',             visible: true },
  { id: 'categoryTrack-1',        type: 'categoryTrack',        nameFr: 'Barre de Défilement des Catégories',     visible: true },
  { id: 'productGrid-1',          type: 'productGrid',          nameFr: 'Grille Principale des Produits',         visible: true },
  { id: 'brandPartners-1',        type: 'brandPartners',        nameFr: 'Marques Partenaires',                    visible: true },
  { id: 'diagnosticBanner-1',     type: 'diagnosticBanner',     nameFr: 'Diagnostic de Peau IA',                  visible: false },
  { id: 'summerSale-1',           type: 'summerSale',           nameFr: "Offres d'Été (Summer Sale)",             visible: true },
  { id: 'dermoCorner-1',          type: 'dermoCorner',          nameFr: 'Dermo Corner (Acné vs Taches)',          visible: true },
  { id: 'customerReviews-1',      type: 'customerReviews',      nameFr: 'Témoignages & Avis Clients',             visible: true },
  { id: 'triplePromo-1',          type: 'triplePromo',          nameFr: 'Bannières Triple Promotionnelles',       visible: true },
  { id: 'topRated-1',             type: 'topRated',             nameFr: 'Produits les Mieux Notés',               visible: true },
  { id: 'bestSellers-1',          type: 'bestSellers',          nameFr: 'Produits les Plus Vendus',               visible: true },
  { id: 'routineVisualizer-1',    type: 'routineVisualizer',    nameFr: 'Visualiseur de Routine de Soins',        visible: true },
  { id: 'featuredIngredient-1',   type: 'featuredIngredient',   nameFr: 'Marques Vedettes de la Semaine',         visible: true },
  { id: 'skincareRoutineSteps-1', type: 'skincareRoutineSteps', nameFr: 'Étapes de la Routine Skincare',          visible: true },
  { id: 'activeIngredients-1',    type: 'activeIngredients',    nameFr: 'Molécules & Ingrédients Actifs',         visible: true },
  { id: 'ingredientDictionary-1', type: 'ingredientDictionary', nameFr: 'Dictionnaire Clinique des Ingrédients', visible: true },
  { id: 'faq-1',                  type: 'faq',                  nameFr: 'Foire Aux Questions (FAQ)',              visible: true },
  { id: 'officialDistributor-1',  type: 'officialDistributor',  nameFr: 'Badge Distributeur Officiel',           visible: true },
  { id: 'trustBar-1',             type: 'trustBar',             nameFr: 'Barre de Confiance Maroc',              visible: true },
];

export default async function Home({ searchParams }: { searchParams?: Promise<{ preview_token?: string }> }) {
  // The CMS is the single authority for homepage section order and visibility.
  // getHomepageSections() queries cms_pages where slug='home' and status='published'.
  // If no published record exists it falls back to DEFAULT_SECTIONS — safe for
  // first deploy before any admin interaction.
  const previewToken = (await searchParams)?.preview_token;
  const preview = await getCmsPreviewSnapshot<{ section_order?: HomepageSectionItem[] }>(previewToken, 'page', 'page-home');
  const [settings, publishedSections] = await Promise.all([
    getPublicSettings(),
    getHomepageSections(DEFAULT_SECTIONS),
  ]);
  const sectionsList = preview?.section_order?.length ? preview.section_order : publishedSections;

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
      {/* Render Dynamic Homepage Sections — order and visibility are admin-controlled */}
      <DynamicSectionRenderer sections={sectionsList} />
    </ShopShell>
  );
}
