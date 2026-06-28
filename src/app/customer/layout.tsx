import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mon Compte — Espace Client',
  description: 'Gérez vos commandes, points de fidélité et informations personnelles.',
  // Customer portal must not be indexed — it's auth-gated private content
  robots: { index: false, follow: false },
};

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
