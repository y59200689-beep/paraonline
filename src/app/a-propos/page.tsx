import type { Metadata } from 'next';
import { AboutClient } from './AboutClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://paraofficinal.ma';

export const metadata: Metadata = {
  title: 'À propos — Para Officinal S.A | Parapharmacie et soins au Maroc',
  description:
    'Découvrez l\'histoire, la vision et l\'engagement de Para Officinal S.A, votre boutique de parapharmacie et de soins beauté au Maroc.',
  alternates: { canonical: '/a-propos' },
  openGraph: {
    title: 'À Propos de Nous — Para Officinal S.A',
    description:
      'Une sélection de soins et produits beauté pour accompagner vos routines au Maroc.',
    url: `${SITE_URL}/a-propos`,
    type: 'website',
    locale: 'fr_MA',
    siteName: 'Para Officinal S.A',
  },
};

export default function AboutPage() {
  return <AboutClient />;
}
