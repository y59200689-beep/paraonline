import type { Metadata } from 'next';
import { AboutClient } from './AboutClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://paraofficinal.ma';

export const metadata: Metadata = {
  title: 'À Propos de Nous — Para Officinal S.A | Parapharmacie Clinique & Soins au Maroc',
  description:
    'Découvrez l\'histoire, la vision et l\'engagement de Para Officinal S.A : la première parapharmacie clinique et digitale au Maroc alliant rigueur médicale, produits 100% authentiques et dermo-diagnostic par IA.',
  alternates: { canonical: '/a-propos' },
  openGraph: {
    title: 'À Propos de Nous — Para Officinal S.A',
    description:
      'Pionnier de la parapharmacie clinique au Maroc. Produits 100% authentiques, dermo-diagnostic par IA et livraison express dans les 12 régions du Royaume.',
    url: `${SITE_URL}/a-propos`,
    type: 'website',
    locale: 'fr_MA',
    siteName: 'Para Officinal S.A',
  },
};

export default function AboutPage() {
  return <AboutClient />;
}
