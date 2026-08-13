import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import SuiviCommandeClient from '../suivi-commande/SuiviCommandeClient';

export const metadata: Metadata = {
  title: 'Suivi de Commande | Para Officinal Maroc',
  description: 'Consultez le statut de votre commande au Maroc avec votre numéro de commande et votre code de suivi sécurisé.',
  alternates: { canonical: '/suivi-commande' },
};

export default function SuiviAliasPage() {
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
