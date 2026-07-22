import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import SuiviCommandeClient from './SuiviCommandeClient';

export const metadata: Metadata = {
  title: 'Suivi de Commande | Para Officinal Maroc',
  description: 'Suivez votre commande en temps réel au Maroc. Statut de livraison express, numéro de suivi et assistance WhatsApp 24/7.',
  alternates: { canonical: '/suivi-commande' },
};

export default function SuiviCommandePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-800 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    }>
      <SuiviCommandeClient />
    </Suspense>
  );
}
