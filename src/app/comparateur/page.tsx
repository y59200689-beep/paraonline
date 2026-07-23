import { Metadata } from 'next';
import CompareClient from './CompareClient';

export const metadata: Metadata = {
  title: 'Comparateur Clinique & Dermo-Scientifique | Para Officinal',
  description: 'Comparez scientifiquement deux soins parapharmaceutiques : ingrédients actifs, tolérance cutanée, prix au ml et recommandation clinique.',
};

export default function ComparePage() {
  return <CompareClient />;
}
