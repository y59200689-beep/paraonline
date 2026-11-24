import { DEFAULT_HOMEPAGE_SECTIONS } from '@/lib/default-homepage-sections';
import { SITE_CONTACT_PHONE } from '@/lib/site-contact';
import React from 'react';
import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://paradivine.ma';

export const metadata: Metadata = {
  title: 'Parapharmacie et K-Beauty au Maroc',
  description:
    'Découvrez une sélection de soins, maquillage et produits K-Beauty, avec livraison au Maroc et paiement sécurisé.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    title: 'Para Divine | Parapharmacie & K-Beauty',
    description: 'Soins, maquillage et produits K-Beauty avec livraison au Maroc.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
};

// JSON-LD structured data — Organization + WebSite (rendered server-side, no JS needed)
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Para Divine',
  url: SITE_URL,
  logo: `${SITE_URL}/para-divine-logo.png`,
  description: 'Parapharmacie et soins beauté au Maroc.',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'MA',
  },
  sameAs: [],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    telephone: SITE_CONTACT_PHONE,
    availableLanguage: ['French', 'Arabic'],
  },
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Para Divine',
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
// Component Imports
import { ShopShell } from '@/components/ShopShell';
import { DynamicSectionRenderer } from '@/components/DynamicSectionRenderer';
import { HomepageSectionItem } from '@/context/SettingsContext';
import { getPublicSettings } from '@/lib/get-public-settings';
import { getHomepageSections } from '@/lib/cms-homepage';
import { getCmsPreviewSnapshot } from '@/lib/cms-preview';
import { orderRoutineSections } from '@/lib/homepage-routine-order';

export default async function Home({ searchParams }: { searchParams?: Promise<{ preview_token?: string }> }) {
  // The CMS is the single authority for homepage section order and visibility.
  // getHomepageSections() queries cms_pages where slug='home' and status='published'.
  // If no published record exists it falls back to DEFAULT_HOMEPAGE_SECTIONS — safe for
  // first deploy before any admin interaction.
  const previewToken = (await searchParams)?.preview_token;
  const preview = await getCmsPreviewSnapshot<{ section_order?: HomepageSectionItem[] }>(previewToken, 'page', 'page-home');
  const [, publishedSections] = await Promise.all([
    getPublicSettings(),
    getHomepageSections(DEFAULT_HOMEPAGE_SECTIONS),
  ]);
  // Preserve preview ordering; apply the requested routine-slot swap to the public homepage.
  const sectionsList = preview?.section_order?.length ? preview.section_order : orderRoutineSections(publishedSections);

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
