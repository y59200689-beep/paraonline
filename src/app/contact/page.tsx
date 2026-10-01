import type { Metadata } from 'next';
import { ContactClient } from './ContactClient';

export const metadata: Metadata = {
  title: 'Contactez-nous — Para Divine',
  description: 'Contactez l’équipe Para Divine pour vos questions sur les produits, les commandes et le suivi après-vente.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return <ContactClient />;
}
