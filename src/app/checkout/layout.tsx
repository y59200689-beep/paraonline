import type { Metadata } from 'next';

// All checkout pages (including success/failure) must never be indexed.
// Indexing these would: (a) waste crawl budget, (b) expose order IDs in search results,
// (c) create duplicate content as the pages depend on query parameters.
export const metadata: Metadata = {
  title: 'Paiement Sécurisé',
  description: 'Finalisez votre commande en toute sécurité.',
  robots: { index: false, follow: false },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
