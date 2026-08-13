import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import SuiviCommandeClient from './SuiviCommandeClient';
import { CmsPageRenderer } from '@/components/CmsPageRenderer';
import { getCmsPageBySlug } from '@/lib/cms-pages';

export const metadata: Metadata = {
  title: 'Suivi de Commande | Para Officinal Maroc',
  description: 'Consultez l’état de votre commande à l’aide de sa référence numérique et de son code de suivi sécurisé.',
  alternates: { canonical: '/suivi-commande' },
};

export default async function SuiviCommandePage({ searchParams }: { searchParams?: Promise<{ preview_token?: string }> }) {
  const page = await getCmsPageBySlug('suivi-commande', (await searchParams)?.preview_token);
  if (page?.section_order?.length) return <CmsPageRenderer page={page} />;
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
