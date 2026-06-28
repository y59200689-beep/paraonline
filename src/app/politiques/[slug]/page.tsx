import { PolicyClient } from './PolicyClient';
import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://paraofficinal.ma';
const SITE_NAME = 'Para Officinal S.A';

interface Props {
  params: Promise<{ slug: string }>;
}

const POLICY_META: Record<string, { title: string; description: string }> = {
  'conditions-vente': {
    title: 'Conditions Générales de Vente',
    description:
      'Prenez connaissance des conditions régissant les ventes, livraisons et modes de paiement sur Para Officinal S.A.',
  },
  confidentialite: {
    title: 'Politique de Confidentialité',
    description:
      'Nous prenons la protection de vos données personnelles au sérieux. Consultez notre charte de confidentialité.',
  },
  'retours-reclamations': {
    title: 'Retours & Réclamations',
    description:
      'Consultez nos procédures et délais de retours, remboursements et réclamations pour vos achats.',
  },
};

export function generateStaticParams() {
  return Object.keys(POLICY_META).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const meta = POLICY_META[slug] ?? {
    title: 'Politiques de Vente',
    description: 'Consultez nos politiques légales et conditions de vente.',
  };
  const pageUrl = `${SITE_URL}/politiques/${slug}`;

  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: `/politiques/${slug}` },
    // Legal pages: index but nofollow to avoid wasting crawl budget on outbound links
    robots: { index: true, follow: false },
    openGraph: {
      type: 'article',
      locale: 'fr_MA',
      url: pageUrl,
      siteName: SITE_NAME,
      title: `${meta.title} | ${SITE_NAME}`,
      description: meta.description,
      images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary',
      title: `${meta.title} | ${SITE_NAME}`,
      description: meta.description,
      images: ['/og-image.jpg'],
    },
  };
}

function buildArticleJsonLd(slug: string) {
  const meta = POLICY_META[slug] ?? POLICY_META['conditions-vente'];
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: meta.title,
    description: meta.description,
    url: `${SITE_URL}/politiques/${slug}`,
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/images/logo.png`,
      },
    },
    inLanguage: 'fr-MA',
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const jsonLd = buildArticleJsonLd(slug);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PolicyClient slug={slug} />
    </>
  );
}
