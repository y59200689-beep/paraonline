import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Catalogue Produits — Parapharmacie & K-Beauty',
  description:
    'Découvrez notre catalogue complet de produits dermo-cosmétiques, K-Beauty et soins de peau disponibles en livraison rapide au Maroc.',
  alternates: { canonical: '/products' },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: 'fr_MA',
    title: 'Catalogue Produits | Para Officinal S.A',
    description:
      'Dermo-cosmétique, K-Beauty et soins de peau — livraison rapide au Maroc.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Catalogue Produits | Para Officinal S.A',
    description: 'Dermo-cosmétique, K-Beauty et soins de peau — livraison rapide au Maroc.',
    images: ['/og-image.jpg'],
  },
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
