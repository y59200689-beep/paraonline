'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShopShell } from '@/components/ShopShell';
import { ProductCard } from '@/components/ProductCard';
import { Product, PRODUCTS_DB } from '@/lib/data';
import { useGalleryOverrides } from '@/lib/useGalleryOverrides';
import { useUi } from '@/context/UiContext';
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  X,
  ChevronRight,
  ShieldCheck,
  FlaskConical,
  Microscope,
  Package,
  Check,
  ArrowRight,
  Sparkles,
  Droplets,
  Sun,
  Zap,
  Heart,
  Leaf,
} from 'lucide-react';

/* ─── Brand palette ───────────────────────────────────────────────── */
const LRP_BLUE  = '#0ea5e9';
const LRP_DARK  = '#1a2744';

/* ─── Sub-category definitions (the main upgrade) ───────────────── */
const RANGES = [
  {
    id: 'acne',
    name: 'EFFACLAR',
    label: 'Acné &\nImperfections',
    tagline: 'Peaux grasses, acnéiques & à imperfections',
    description: 'La gamme Effaclar est formulée pour les peaux grasses, mixtes et sujettes aux imperfections. Actifs : Acide Salicylique, Niacinamide, LHA.',
    molecules: ['Acide Salicylique', 'Niacinamide', 'LHA'],
    accent: '#2563eb',
    lightBg: '#eff6ff',
    gradient: 'from-[#1e3a8a] to-[#2563eb]',
    overlayColor: 'rgba(30,58,138,0.72)',
    keywords: ['effaclar','acné','acne','imperfection','sébum'],
    Icon: Zap,
    /* Real product photo served via API, used as card bg with a gradient fallback. */
    bgStyle: { background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' },
  },
  {
    id: 'solaire',
    name: 'ANTHELIOS',
    label: 'Protection\nSolaire SPF50+',
    tagline: 'La protection solaire dermatologique N°1',
    description: 'Anthelios propose la technologie UV-Mune 400® pour filtrer les UVA longs, invisibles mais responsables du vieillissement cutané.',
    molecules: ['Mexoryl SX', 'UV-Mune 400', 'SPF 50+'],
    accent: '#ea580c',
    lightBg: '#fff7ed',
    gradient: 'from-[#9a3412] to-[#ea580c]',
    overlayColor: 'rgba(154,52,18,0.65)',
    keywords: ['anthelios','solaire','spf','sun','uv'],
    Icon: Sun,
    bgStyle: { background: 'linear-gradient(135deg,#78350f 0%,#f97316 100%)' },
  },
  {
    id: 'cicatrisation',
    name: 'CICAPLAST',
    label: 'Cicatrisation\n& Réparation',
    tagline: 'Soin réparateur pour les peaux abîmées',
    description: 'Cicaplast Baume B5+ répare intensément les peaux irritées, craquelées ou post-procédure dermatologique. Actif : Panthénol B5.',
    molecules: ['Panthénol B5', 'Bisabolol', 'Manganèse'],
    accent: '#16a34a',
    lightBg: '#f0fdf4',
    gradient: 'from-[#14532d] to-[#16a34a]',
    overlayColor: 'rgba(20,83,45,0.68)',
    keywords: ['cicaplast','cicatri','repair','baume','b5'],
    Icon: Heart,
    bgStyle: { background: 'linear-gradient(135deg,#14532d 0%,#4ade80 100%)' },
  },
  {
    id: 'taches',
    name: 'MELA B3',
    label: 'Taches\n& Éclat',
    tagline: 'Correction des taches pigmentaires et éclat',
    description: 'La gamme Mela B3 cible les taches brunes et les irrégularités de teint grâce au trio Niacinamide + Acide Tranexamique + Rétinol.',
    molecules: ['Niacinamide', 'Ac. Tranexamique', 'Rétinol'],
    accent: '#7c3aed',
    lightBg: '#faf5ff',
    gradient: 'from-[#4c1d95] to-[#7c3aed]',
    overlayColor: 'rgba(76,29,149,0.70)',
    keywords: ['mela','tache','pigment','éclat'],
    Icon: Sparkles,
    bgStyle: { background: 'linear-gradient(135deg,#4c1d95 0%,#a855f7 100%)' },
  },
  {
    id: 'secheresse',
    name: 'LIPIKAR',
    label: 'Sécheresse\n& Eczéma',
    tagline: 'Hydratation intense pour peaux très sèches',
    description: 'Lipikar reconstitue le film lipidique des peaux sèches à très sèches et atopiques. Actif exclusif AP+M pour réduire le prurit.',
    molecules: ['AP+M', 'Niacinamide', 'Huile de Karité'],
    accent: '#d97706',
    lightBg: '#fffbeb',
    gradient: 'from-[#92400e] to-[#d97706]',
    overlayColor: 'rgba(146,64,14,0.65)',
    keywords: ['lipikar','eczéma','sèche','atopique','ap+','lavant','lavante'],
    Icon: Droplets,
    bgStyle: { background: 'linear-gradient(135deg,#78350f 0%,#fbbf24 100%)' },
  },
  {
    id: 'sensibles',
    name: 'TOLERIANE',
    label: 'Peaux\nSensibles',
    tagline: 'Soins doux pour peaux sensibles & réactives',
    description: 'Toleriane est la gamme de référence pour les peaux sensibles, réactives et allergiques. Formule ultra-tolérante sans conservateurs.',
    molecules: ['Neurosensine', 'Prébiologiques', 'Eau Thermale'],
    accent: '#0284c7',
    lightBg: '#f0f9ff',
    gradient: 'from-[#075985] to-[#0284c7]',
    overlayColor: 'rgba(7,89,133,0.68)',
    keywords: ['toleriane','sensible','allergi','réactive'],
    Icon: Leaf,
    bgStyle: { background: 'linear-gradient(135deg,#0c4a6e 0%,#38bdf8 100%)' },
  },
];

const VICHY_RANGES = [
  {
    id: 'normaderm',
    name: 'NORMADERM',
    label: 'Imperfections\n& Brillance',
    tagline: 'Soins ciblés pour peaux grasses et à imperfections',
    description: 'Normaderm réunit des soins nettoyants, hydratants et correcteurs pensés pour les imperfections, les pores visibles et l’excès de sébum.',
    molecules: ['Acide Salicylique', 'BHA', 'Niacinamide'],
    accent: '#2d8f78',
    lightBg: '#edf8f5',
    gradient: 'from-[#155e54] to-[#2d8f78]',
    overlayColor: 'rgba(21,94,84,0.68)',
    keywords: ['normaderm', 'anti acne', 'anti-acne'],
    Icon: Zap,
    bgStyle: { background: 'linear-gradient(135deg,#155e54 0%,#2d8f78 100%)' },
  },
  {
    id: 'dercos',
    name: 'DERCOS',
    label: 'Cheveux\n& Cuir chevelu',
    tagline: 'Protocoles ciblés contre la chute et les pellicules',
    description: 'Dercos propose des protocoles capillaires ciblés pour la chute, les pellicules, le cuir chevelu sensible et la perte de densité.',
    molecules: ['Aminexil', 'Sélénium DS', 'Niacinamide'],
    accent: '#6d55a8',
    lightBg: '#f4f1fb',
    gradient: 'from-[#443475] to-[#7560ad]',
    overlayColor: 'rgba(68,52,117,0.7)',
    keywords: ['dercos', 'aminexil', 'neogenic', 'densi solution', 'densisol', 'kera solution'],
    Icon: Leaf,
    bgStyle: { background: 'linear-gradient(135deg,#443475 0%,#7560ad 100%)' },
  },
  {
    id: 'solaire',
    name: 'CAPITAL SOLEIL',
    label: 'Protection\nSolaire',
    tagline: 'Haute protection quotidienne visage et corps',
    description: 'Capital Soleil rassemble des protections SPF élevées, des textures invisibles et des soins après-soleil pour différents usages.',
    molecules: ['SPF 50+', 'Niacinamide', 'Filtres UV'],
    accent: '#d98537',
    lightBg: '#fff7ed',
    gradient: 'from-[#9a4f16] to-[#d98537]',
    overlayColor: 'rgba(154,79,22,0.66)',
    keywords: ['ecran', 'écran', 'solaire', 'spf', 'capital soleil', 'uv age', 'apres soleil', 'après soleil'],
    Icon: Sun,
    bgStyle: { background: 'linear-gradient(135deg,#9a4f16 0%,#d98537 100%)' },
  },
  {
    id: 'liftactiv',
    name: 'LIFTACTIV',
    label: 'Rides\n& Fermeté',
    tagline: 'Correction des signes de l’âge et de la perte de fermeté',
    description: 'Liftactiv cible les rides, la fermeté et l’éclat avec des actifs dermatologiques intégrés à une routine anti-âge progressive.',
    molecules: ['Rétinol', 'Vitamine C', 'Peptides'],
    accent: '#b64d61',
    lightBg: '#fff1f4',
    gradient: 'from-[#7f3042] to-[#b64d61]',
    overlayColor: 'rgba(127,48,66,0.68)',
    keywords: ['liftactiv', 'retinol', 'rétinol'],
    Icon: Sparkles,
    bgStyle: { background: 'linear-gradient(135deg,#7f3042 0%,#b64d61 100%)' },
  },
  {
    id: 'purete',
    name: 'PURETÉ THERMALE',
    label: 'Nettoyage\n& Fraîcheur',
    tagline: 'Démaquillage et nettoyage doux du visage',
    description: 'Pureté Thermale accompagne le nettoyage quotidien avec des eaux micellaires, démaquillants et gels frais adaptés au visage.',
    molecules: ['Eau volcanique', 'Glycérine', 'Minéraux'],
    accent: '#2e8aa0',
    lightBg: '#edf8fa',
    gradient: 'from-[#145b6c] to-[#2e8aa0]',
    overlayColor: 'rgba(20,91,108,0.68)',
    keywords: ['demaquillant', 'démaquillant', 'micellaire', 'gel nettoyant fresh', 'gel nettoyant frais', 'eau thermale'],
    Icon: Droplets,
    bgStyle: { background: 'linear-gradient(135deg,#145b6c 0%,#2e8aa0 100%)' },
  },
  {
    id: 'homme',
    name: 'VICHY HOMME',
    label: 'Soins\npour Homme',
    tagline: 'Rasage, hydratation et protection au quotidien',
    description: 'Vichy Homme regroupe des soins de rasage, d’hydratation et des déodorants conçus pour les besoins quotidiens de la peau masculine.',
    molecules: ['Magnésium', 'Vitamine C', 'Minéraux'],
    accent: '#315c7d',
    lightBg: '#eef4f8',
    gradient: 'from-[#1d3d56] to-[#315c7d]',
    overlayColor: 'rgba(29,61,86,0.7)',
    keywords: ['vichy homme', 'homme', 'rasage', 'deo ', 'déodorant'],
    Icon: ShieldCheck,
    bgStyle: { background: 'linear-gradient(135deg,#1d3d56 0%,#315c7d 100%)' },
  },
];

const CERAVE_RANGES = [
  {
    id: 'hydratation',
    name: 'HYDRATATION',
    label: 'Hydratation\nvisage & corps',
    tagline: 'Restaurer le confort des peaux normales à très sèches.',
    description: 'Les baumes, laits et crèmes CeraVe hydratent durablement et aident à renforcer la barrière protectrice du visage, du corps et des mains.',
    molecules: ['3 céramides', 'Acide hyaluronique', 'Technologie MVE'],
    accent: '#1677a5',
    lightBg: '#edf8fc',
    gradient: 'from-[#0d5277] to-[#1677a5]',
    overlayColor: 'rgba(13,82,119,0.68)',
    keywords: ['baume hydratant', 'lait hydratant', 'creme hydratante visage', 'crème hydratante visage', 'creme mains', 'crème mains'],
    Icon: Droplets,
    bgStyle: { background: 'linear-gradient(135deg,#0d5277 0%,#39a6c9 100%)' },
  },
  {
    id: 'nettoyage',
    name: 'NETTOYAGE',
    label: 'Nettoyage\ndoux & efficace',
    tagline: 'Nettoyer sans compromettre la barrière cutanée.',
    description: 'Gels, crèmes, huiles et eau micellaire retirent les impuretés avec des textures adaptées aux peaux normales, sèches, mixtes ou grasses.',
    molecules: ['3 céramides', 'Niacinamide', 'Acide hyaluronique'],
    accent: '#188f9d',
    lightBg: '#edfafa',
    gradient: 'from-[#0d626d] to-[#188f9d]',
    overlayColor: 'rgba(13,98,109,0.68)',
    keywords: ['gel moussant', 'creme lavante', 'crème lavante', 'creme moussante', 'crème moussante', 'huile nettoyante', 'eau micellaire'],
    Icon: FlaskConical,
    bgStyle: { background: 'linear-gradient(135deg,#0d626d 0%,#48b9bd 100%)' },
  },
  {
    id: 'imperfections',
    name: 'ANTI-IMPERFECTIONS',
    label: 'Imperfections\n& excès de sébum',
    tagline: 'Purifier, lisser et limiter la brillance au quotidien.',
    description: 'Les soins anti-imperfections CeraVe ciblent les pores, les marques post-imperfections et l’excès de sébum avec une routine progressive.',
    molecules: ['Acide salicylique', 'Niacinamide', 'Rétinol'],
    accent: '#2c76b5',
    lightBg: '#eff6fd',
    gradient: 'from-[#184d7d] to-[#2c76b5]',
    overlayColor: 'rgba(24,77,125,0.68)',
    keywords: ['anti imperfection', 'anti-imperfection', 'oil control', 'anti marque', 'anti-marque', 'soin concentré', 'soin concentre'],
    Icon: Zap,
    bgStyle: { background: 'linear-gradient(135deg,#184d7d 0%,#5a9bd2 100%)' },
  },
  {
    id: 'rugosites',
    name: 'SA ANTI-RUGOSITÉS',
    label: 'Rugosités\n& grain de peau',
    tagline: 'Exfolier en douceur les zones sèches et rugueuses.',
    description: 'La sélection SA associe nettoyage et hydratation pour lisser les rugosités du corps et des pieds sans négliger la barrière cutanée.',
    molecules: ['Acide salicylique', 'Urée', '3 céramides'],
    accent: '#7357a6',
    lightBg: '#f5f2fb',
    gradient: 'from-[#493479] to-[#7357a6]',
    overlayColor: 'rgba(73,52,121,0.68)',
    keywords: ['sa creme', 'sa crème', 'sa gel', 'anti rugosite', 'anti rugosité', 'anti-rugosite', 'anti-rugosité', 'pieds regenerante', 'pieds régénérante'],
    Icon: Sparkles,
    bgStyle: { background: 'linear-gradient(135deg,#493479 0%,#9a82c6 100%)' },
  },
  {
    id: 'solaire',
    name: 'PROTECTION SOLAIRE',
    label: 'Protection\nsolaire SPF50+',
    tagline: 'Hydrater et protéger le visage et le corps des UV.',
    description: 'Fluides et laits solaires CeraVe associent haute protection, textures confortables et céramides pour une utilisation quotidienne.',
    molecules: ['SPF 50+', 'Céramides', 'Filtres UV'],
    accent: '#db8129',
    lightBg: '#fff7ed',
    gradient: 'from-[#975018] to-[#db8129]',
    overlayColor: 'rgba(151,80,24,0.66)',
    keywords: ['solaire', 'spf50', 'spf 50', 'spf30', 'spf 30'],
    Icon: Sun,
    bgStyle: { background: 'linear-gradient(135deg,#975018 0%,#efa95f 100%)' },
  },
  {
    id: 'soins-cibles',
    name: 'SOINS CIBLÉS',
    label: 'Visage\n& zones ciblées',
    tagline: 'Compléter la routine avec un soin précis.',
    description: 'Contour des yeux, soin de nuit et sérum au rétinol complètent la routine selon la zone, le moment d’utilisation et la tolérance de la peau.',
    molecules: ['Rétinol', 'Acide hyaluronique', 'Céramides'],
    accent: '#245f92',
    lightBg: '#f0f6fb',
    gradient: 'from-[#173e64] to-[#245f92]',
    overlayColor: 'rgba(23,62,100,0.7)',
    keywords: ['contour yeux', 'visage nuit', 'serum retinol', 'sérum rétinol'],
    Icon: Heart,
    bgStyle: { background: 'linear-gradient(135deg,#173e64 0%,#4d88b7 100%)' },
  },
];

const AVENE_RANGES = [
  {
    id: 'cleanance', name: 'CLEANANCE', label: 'Imperfections\n& brillance', tagline: 'Nettoyer, corriger et matifier les peaux à imperfections.',
    description: 'Cleanance réunit des nettoyants et des soins ciblés pour les peaux mixtes à grasses, les pores visibles, les marques et l’excès de sébum.',
    molecules: ['Comedoclastin', 'AHA', 'Eau thermale'], accent: '#4f8f78', lightBg: '#eff8f4', gradient: 'from-[#315f50] to-[#4f8f78]', overlayColor: 'rgba(49,95,80,0.68)',
    keywords: ['cleanance', 'cleance', 'triacneal'], Icon: Zap,
    bgStyle: { background: 'linear-gradient(135deg,#315f50 0%,#78b49f 100%)' },
  },
  {
    id: 'hydratation', name: 'HYDRATATION & ÉCLAT', label: 'Hydratation\n& signes de l’âge', tagline: 'Réhydrater, repulper et soutenir l’éclat du visage.',
    description: 'Hydrance, Hyaluron Activ B3 et les soins ciblés accompagnent la déshydratation, les ridules et la perte d’éclat avec des textures quotidiennes.',
    molecules: ['Acide hyaluronique', 'Niacinamide', 'Vitamine C'], accent: '#c36f62', lightBg: '#fff4f1', gradient: 'from-[#85483f] to-[#c36f62]', overlayColor: 'rgba(133,72,63,0.68)',
    keywords: ['hydrance', 'hyaluron', 'aquagel', 'vitamine active', 'physiolift', 'masque apaisant hydratant'], Icon: Sparkles,
    bgStyle: { background: 'linear-gradient(135deg,#85483f 0%,#dd9c91 100%)' },
  },
  {
    id: 'cicalfate', name: 'CICALFATE+', label: 'Réparation\n& peau fragilisée', tagline: 'Apaiser, réparer et protéger les zones fragilisées.',
    description: 'Cicalfate+ propose des soins réparateurs pour les irritations superficielles, les suites d’actes et les zones qui nécessitent une protection renforcée.',
    molecules: ['C+-Restore', 'Cuivre-Zinc', 'Eau thermale'], accent: '#9a7658', lightBg: '#faf5ef', gradient: 'from-[#674b36] to-[#9a7658]', overlayColor: 'rgba(103,75,54,0.68)',
    keywords: ['cicalfate'], Icon: ShieldCheck,
    bgStyle: { background: 'linear-gradient(135deg,#674b36 0%,#bea084 100%)' },
  },
  {
    id: 'secheresse', name: 'XERACALM & TRIXERA', label: 'Sécheresse\n& inconfort', tagline: 'Nettoyer et nourrir les peaux sèches à très sèches.',
    description: 'XeraCalm, Trixera et Cold Cream regroupent des textures nettoyantes et relipidantes pour le corps, les mains et les lèvres.',
    molecules: ['I-modulia', 'Lipides', 'Cold Cream'], accent: '#84679b', lightBg: '#f7f3fa', gradient: 'from-[#554366] to-[#84679b]', overlayColor: 'rgba(85,67,102,0.68)',
    keywords: ['xeracalm', 'trixera', 'cold cream', 'cold creme'], Icon: Droplets,
    bgStyle: { background: 'linear-gradient(135deg,#554366 0%,#aa91bb 100%)' },
  },
  {
    id: 'solaire', name: 'PROTECTION SOLAIRE', label: 'Protection\nsolaire SPF50+', tagline: 'Protéger les peaux sensibles du visage et du corps.',
    description: 'Les crèmes, fluides et sprays Avène couvrent différents usages, types de peau et niveaux d’exposition avec une haute protection quotidienne.',
    molecules: ['SPF 50+', 'TriAsorB', 'Filtres UV'], accent: '#df7b36', lightBg: '#fff6ed', gradient: 'from-[#9a4e1c] to-[#df7b36]', overlayColor: 'rgba(154,78,28,0.66)',
    keywords: ['ecran', 'écran', 'solaire', 'spf', 'sunsimed', 'b-protect'], Icon: Sun,
    bgStyle: { background: 'linear-gradient(135deg,#9a4e1c 0%,#efa15f 100%)' },
  },
  {
    id: 'sensibilite', name: 'TOLÉRANCE', label: 'Sensibilité\n& rougeurs', tagline: 'Apaiser les peaux sensibles, réactives ou sujettes aux rougeurs.',
    description: 'Tolérance, Antirougeurs et l’Eau Thermale d’Avène accompagnent les peaux sensibles avec des textures simples et apaisantes.',
    molecules: ['Eau thermale', 'D-Sensinose', 'Haute tolérance'], accent: '#b95f67', lightBg: '#fff3f4', gradient: 'from-[#7c3e45] to-[#b95f67]', overlayColor: 'rgba(124,62,69,0.68)',
    keywords: ['tolerance', 'tolérance', 'antirougeurs', 'eau thermale', 'eau micellaire'], Icon: Heart,
    bgStyle: { background: 'linear-gradient(135deg,#7c3e45 0%,#d58b91 100%)' },
  },
];

const isAveneCatalogProduct = (product: Product) => {
  const title = (product.title || product.nameFr || product.name || '').trim();
  return /^(?:AV |AVENE |SUPP AV |SUPP AVENE |SUPP PROMO AV |SUPP PROMO AVENE )/i.test(title);
};

const BIODERMA_RANGES = [
  {
    id: 'sensibio', name: 'SENSIBIO', label: 'Peaux sensibles\n& réactives', tagline: 'Nettoyer, apaiser et respecter les peaux sensibles.',
    description: 'Sensibio accompagne les peaux sensibles, réactives ou sujettes aux rougeurs avec des soins de nettoyage et de confort au quotidien.',
    molecules: ['Micellaire', 'Actifs apaisants', 'Haute tolérance'], accent: '#d94f72', lightBg: '#fff3f6', gradient: 'from-[#8f2747] to-[#d94f72]', overlayColor: 'rgba(143,39,71,0.68)',
    keywords: ['sensibio', 'sensible', 'réactive', 'reactive', 'rougeur', 'micellaire'], Icon: Heart,
    bgStyle: { background: 'linear-gradient(135deg,#8f2747 0%,#ef8aa2 100%)' },
  },
  {
    id: 'sebium', name: 'SEBIUM', label: 'Imperfections\n& brillance', tagline: 'Des soins ciblés pour purifier sans décaper.',
    description: 'Sebium rassemble les soins conçus pour les peaux mixtes à grasses, les imperfections, les pores visibles et l’excès de sébum.',
    molecules: ['Acide salicylique', 'Zinc', 'Niacinamide'], accent: '#60a33b', lightBg: '#f2faed', gradient: 'from-[#356a24] to-[#60a33b]', overlayColor: 'rgba(53,106,36,0.68)',
    keywords: ['sebium', 'sébium', 'imperfection', 'acné', 'acne', 'purifiant', 'matifiant'], Icon: Zap,
    bgStyle: { background: 'linear-gradient(135deg,#356a24 0%,#7bc85a 100%)' },
  },
  {
    id: 'atoderm', name: 'ATODERM', label: 'Sécheresse\n& inconfort', tagline: 'Nourrir et protéger les peaux sèches à très sèches.',
    description: 'Atoderm aide à restaurer le confort des peaux sèches, fragilisées ou à tendance atopique avec des textures nettoyantes et nourrissantes.',
    molecules: ['Glycérine', 'Lipides', 'Vitamine PP'], accent: '#2076aa', lightBg: '#eef8ff', gradient: 'from-[#15527e] to-[#2076aa]', overlayColor: 'rgba(21,82,126,0.68)',
    keywords: ['atoderm', 'sèche', 'seche', 'atopique', 'intensive', 'baume', 'huile de douche'], Icon: Droplets,
    bgStyle: { background: 'linear-gradient(135deg,#15527e 0%,#4b9ed0 100%)' },
  },
  {
    id: 'photoderm', name: 'PHOTODERM', label: 'Protection\nsolaire', tagline: 'Des textures adaptées pour protéger chaque type de peau.',
    description: 'Photoderm regroupe les protections solaires BIODERMA pour le visage et le corps, avec des formules adaptées aux usages quotidiens.',
    molecules: ['SPF 50+', 'Filtres UV', 'Cellular Bioprotection'], accent: '#e28a20', lightBg: '#fff8ea', gradient: 'from-[#9b5712] to-[#e28a20]', overlayColor: 'rgba(155,87,18,0.66)',
    keywords: ['photoderm', 'solaire', 'spf', 'uv', 'sun'], Icon: Sun,
    bgStyle: { background: 'linear-gradient(135deg,#9b5712 0%,#f1b14e 100%)' },
  },
  {
    id: 'hydrabio', name: 'HYDRABIO', label: 'Hydratation\n& éclat', tagline: 'Réhydrater durablement les peaux déshydratées.',
    description: 'Hydrabio propose des soins hydratants pensés pour soutenir le confort et l’éclat des peaux déshydratées.',
    molecules: ['Aquagenium', 'Acide hyaluronique', 'Glycérine'], accent: '#1e9fbd', lightBg: '#edfafd', gradient: 'from-[#126b82] to-[#1e9fbd]', overlayColor: 'rgba(18,107,130,0.68)',
    keywords: ['hydrabio', 'hydrat', 'déshydrat', 'deshydrat'], Icon: Sparkles,
    bgStyle: { background: 'linear-gradient(135deg,#126b82 0%,#4ac1dc 100%)' },
  },
  {
    id: 'cicabio', name: 'CICABIO', label: 'Réparation\ncutanée', tagline: 'Accompagner les peaux fragilisées et inconfortables.',
    description: 'Cicabio rassemble les soins réparateurs conçus pour aider à apaiser et protéger les peaux fragilisées.',
    molecules: ['Resvératrol', 'Cuivre', 'Centella asiatica'], accent: '#875da6', lightBg: '#f8f2fc', gradient: 'from-[#563774] to-[#875da6]', overlayColor: 'rgba(86,55,116,0.68)',
    keywords: ['cicabio', 'cicatri', 'répar', 'repar', 'irrit'], Icon: ShieldCheck,
    bgStyle: { background: 'linear-gradient(135deg,#563774 0%,#aa84c8 100%)' },
  },
];

const EUCERIN_RANGES = [
  {
    id: 'aquaphor', name: 'AQUAPHOR', label: 'Réparation\n& confort', tagline: 'Apaiser et protéger les zones très sèches ou fragilisées.',
    description: 'Aquaphor rassemble des soins protecteurs destinés aux zones très sèches, fragilisées ou soumises à des agressions quotidiennes.',
    molecules: ['Panthénol', 'Glycérine', 'Bisabolol'], accent: '#b94a54', lightBg: '#fff3f2', gradient: 'from-[#7b2932] to-[#b94a54]', overlayColor: 'rgba(123,41,50,0.68)',
    keywords: ['aquaphor', 'répar', 'repar', 'baume reparateur', 'baume réparateur', 'crevasse'], Icon: ShieldCheck,
    bgStyle: { background: 'linear-gradient(135deg,#7b2932 0%,#dc7780 100%)' },
  },
  {
    id: 'urearepair', name: 'UREAREPAIR', label: 'Sécheresse\n& rugosités', tagline: 'Réhydrater les peaux sèches à très sèches.',
    description: 'UreaRepair accompagne les peaux sèches, rugueuses ou tiraillées avec des soins corps et pieds riches en urée.',
    molecules: ['Urée', 'Céramides', 'NMF'], accent: '#2d6ba1', lightBg: '#eef7ff', gradient: 'from-[#184a78] to-[#2d6ba1]', overlayColor: 'rgba(24,74,120,0.68)',
    keywords: ['urearepair', 'urea repair', 'urée', 'uree', 'rugos', 'peau sèche', 'peau seche'], Icon: Droplets,
    bgStyle: { background: 'linear-gradient(135deg,#184a78 0%,#5d9ccc 100%)' },
  },
  {
    id: 'dermopure', name: 'DERMOPURE', label: 'Imperfections\n& brillance', tagline: 'Purifier les peaux à imperfections sans les dessécher.',
    description: 'DermoPure cible les imperfections, les marques post-acné, les pores visibles et l’excès de sébum avec des soins dédiés.',
    molecules: ['Acide salicylique', 'Thiamidol', 'Licochalcone A'], accent: '#4f8e6e', lightBg: '#eff9f3', gradient: 'from-[#2f664c] to-[#4f8e6e]', overlayColor: 'rgba(47,102,76,0.68)',
    keywords: ['dermopure', 'dermo pure', 'imperfection', 'acné', 'acne', 'oil control', 'anti marque', 'anti-marque'], Icon: Zap,
    bgStyle: { background: 'linear-gradient(135deg,#2f664c 0%,#7bbe9a 100%)' },
  },
  {
    id: 'sun', name: 'SUN PROTECTION', label: 'Protection\nsolaire', tagline: 'Une haute protection conçue pour les usages quotidiens.',
    description: 'Les soins solaires EUCERIN proposent une protection UV élevée avec des textures adaptées au visage, au corps et aux besoins ciblés.',
    molecules: ['SPF 50+', 'Filtres UVA/UVB', 'Licochalcone A'], accent: '#d47b21', lightBg: '#fff7ec', gradient: 'from-[#975116] to-[#d47b21]', overlayColor: 'rgba(151,81,22,0.66)',
    keywords: ['sun protection', 'sun fluid', 'oil control sun', 'solaire', 'spf', 'uv'], Icon: Sun,
    bgStyle: { background: 'linear-gradient(135deg,#975116 0%,#ecab57 100%)' },
  },
  {
    id: 'anti-pigment', name: 'ANTI-PIGMENT', label: 'Taches\n& éclat', tagline: 'Cibler les taches pigmentaires et l’irrégularité du teint.',
    description: 'Anti-Pigment réunit des soins dédiés aux taches brunes et à l’uniformité du teint, à intégrer à une routine avec protection solaire.',
    molecules: ['Thiamidol', 'Acide hyaluronique', 'SPF 30'], accent: '#8a5e9f', lightBg: '#f8f2fb', gradient: 'from-[#58366e] to-[#8a5e9f]', overlayColor: 'rgba(88,54,110,0.68)',
    keywords: ['anti pigment', 'anti-pigment', 'thiamidol', 'taches', 'tâches', 'pigment'], Icon: Sparkles,
    bgStyle: { background: 'linear-gradient(135deg,#58366e 0%,#b38ac5 100%)' },
  },
  {
    id: 'hyalu-filler', name: 'HYALURON-FILLER', label: 'Rides\n& fermeté', tagline: 'Prévenir et corriger les signes visibles de l’âge.',
    description: 'Hyaluron-Filler accompagne les routines anti-âge avec des soins hydratants et repulpants adaptés aux besoins de fermeté.',
    molecules: ['Acide hyaluronique', 'Arctiine', 'Saponine'], accent: '#ba6270', lightBg: '#fff3f5', gradient: 'from-[#7e3543] to-[#ba6270]', overlayColor: 'rgba(126,53,67,0.68)',
    keywords: ['hyaluron filler', 'hyaluron-filler', 'anti age', 'anti-âge', 'rides', 'fermeté', 'fermete'], Icon: Heart,
    bgStyle: { background: 'linear-gradient(135deg,#7e3543 0%,#de8d99 100%)' },
  },
];

/* ─── Trust claims ───────────────────────────────────────────────── */
const TRUST_CLAIMS = [
  {
    num: '01', Icon: ShieldCheck,
    title: 'Tolérance au centre',
    body: 'La marque développe des soins destinés notamment aux peaux sensibles et réactives. Vérifiez toujours les indications de la fiche produit.',
  },
  {
    num: '02', Icon: Microscope,
    title: 'Évaluation dermatologique',
    body: 'Les formules sont développées dans une démarche dermatologique avec des protocoles adaptés à leur usage et à leur population cible.',
  },
  {
    num: '03', Icon: FlaskConical,
    title: 'Actifs sélectionnés',
    body: 'Chaque gamme associe des actifs à une préoccupation précise : imperfections, taches, sécheresse, sensibilité ou protection solaire.',
  },
  {
    num: '04', Icon: Package,
    title: 'Usage bien expliqué',
    body: 'Les conseils d’application, la fréquence et les précautions restent accessibles sur chaque fiche pour aider à construire une routine cohérente.',
  },
];

const VICHY_TRUST_CLAIMS = [
  {
    num: '01', Icon: Droplets,
    title: 'Eau volcanique minéralisante',
    body: 'L’eau volcanique de Vichy constitue la signature historique de la marque et accompagne plusieurs de ses formules de soin.',
  },
  {
    num: '02', Icon: Microscope,
    title: 'Approche dermatologique',
    body: 'Les catégories sont organisées par besoin : imperfections, photoprotection, cuir chevelu, âge, nettoyage et soins pour homme.',
  },
  {
    num: '03', Icon: FlaskConical,
    title: 'Actifs ciblés',
    body: 'Aminexil, BHA, rétinol, niacinamide ou filtres UV sont associés à des usages et des précautions spécifiques.',
  },
  {
    num: '04', Icon: Package,
    title: 'Routine lisible',
    body: 'Chaque fiche produit permet de vérifier le format, le prix, la disponibilité et les informations utiles avant l’achat.',
  },
];

const CERAVE_TRUST_CLAIMS = [
  {
    num: '01', Icon: ShieldCheck,
    title: '3 céramides essentiels',
    body: 'Les formules CeraVe associent trois céramides essentiels pour aider à maintenir et restaurer la barrière protectrice de la peau.',
  },
  {
    num: '02', Icon: Microscope,
    title: 'Développé avec des dermatologues',
    body: 'La sélection est organisée par besoin et type de texture pour construire une routine quotidienne plus facile à comprendre.',
  },
  {
    num: '03', Icon: Droplets,
    title: 'Hydratation prolongée',
    body: 'La technologie MVE diffuse progressivement les actifs hydratants afin d’accompagner le confort de la peau au fil de la journée.',
  },
  {
    num: '04', Icon: Package,
    title: 'Visage et corps',
    body: 'Nettoyants, hydratants et soins ciblés couvrent les principales étapes d’une routine pour le visage, le corps et les mains.',
  },
];

const AVENE_TRUST_CLAIMS = [
  {
    num: '01', Icon: Droplets,
    title: 'Eau thermale apaisante',
    body: 'L’Eau Thermale d’Avène constitue l’actif signature de la marque et accompagne de nombreux soins destinés aux peaux sensibles.',
  },
  {
    num: '02', Icon: ShieldCheck,
    title: 'Peaux sensibles au centre',
    body: 'Les catégories couvrent la sensibilité, les rougeurs, la sécheresse, les imperfections et la protection solaire quotidienne.',
  },
  {
    num: '03', Icon: FlaskConical,
    title: 'Textures selon le besoin',
    body: 'Crème, fluide, baume, huile, gel ou spray permettent de choisir une texture adaptée à la zone et au confort recherché.',
  },
  {
    num: '04', Icon: Package,
    title: 'Routine lisible',
    body: 'Chaque fiche permet de vérifier le format, le mode d’utilisation, la disponibilité et les informations utiles avant l’achat.',
  },
];

const BIODERMA_TRUST_CLAIMS = [
  { num: '01', Icon: Microscope, title: 'Approche écobiologique', body: 'Bioderma développe des soins qui prennent en compte l’équilibre naturel de la peau et ses besoins spécifiques.' },
  { num: '02', Icon: ShieldCheck, title: 'Tolérance au quotidien', body: 'Les gammes sont organisées par type de peau et par préoccupation pour choisir une formule plus facilement.' },
  { num: '03', Icon: FlaskConical, title: 'Actifs selon le besoin', body: 'Hydratation, imperfections, sensibilité, réparation et protection solaire sont traitées par des gammes dédiées.' },
  { num: '04', Icon: Package, title: 'Routine plus claire', body: 'Chaque fiche produit permet de vérifier le format, l’usage et les informations essentielles avant l’achat.' },
];

const EUCERIN_TRUST_CLAIMS = [
  { num: '01', Icon: Microscope, title: 'Recherche dermatologique', body: 'EUCERIN organise ses soins autour de besoins cutanés précis, des imperfections aux taches pigmentaires.' },
  { num: '02', Icon: ShieldCheck, title: 'Tolérance au quotidien', body: 'Les gammes sont pensées pour intégrer facilement des routines pour le visage, le corps et les zones fragilisées.' },
  { num: '03', Icon: FlaskConical, title: 'Actifs ciblés', body: 'Urée, Thiamidol, acide hyaluronique ou actifs purifiants sont associés à des usages clairement identifiés.' },
  { num: '04', Icon: Package, title: 'Routine lisible', body: 'Chaque fiche permet de vérifier le format, l’usage, le prix et la disponibilité avant de finaliser votre sélection.' },
];

const LRP_CONFIG = {
  name: 'La Roche-Posay',
  vendorToken: 'larocheposay',
  apiVendor: 'La Roche-Posay',
  logo: '/images/brands/laroche.svg',
  logoAlt: 'Logo La Roche-Posay',
  eyebrow: 'Laboratoire dermatologique',
  origin: 'La Roche-Posay · France',
  headline: 'Le soin précis pour chaque peau sensible.',
  introduction: 'Explorez des routines ciblées pour les imperfections, la protection solaire, la réparation et l’hydratation, avec une sélection disponible chez Para Officinal.',
  metrics: [
    ['90 000+', 'dermatologues interrogés*'],
    ['6 gammes', 'classées par besoin'],
    ['Peaux sensibles', 'au cœur de la sélection'],
  ],
  heroImage: '/images/larochposay_brand_showcase.webp',
  heroAlt: 'Sélection de soins La Roche-Posay présentée dans un décor clinique lumineux',
  heroCaption: 'Construisez une routine simple, cohérente et adaptée à votre priorité.',
  heroHighlights: [
    { id: 'acne', range: 'Effaclar', detail: 'Imperfections', image: '/images/effaclar_hero_packshot.webp', accent: '#1688c6' },
    { id: 'solaire', range: 'Anthelios', detail: 'Protection SPF50+', image: '/images/anthelios_hero_packshot.webp', accent: '#e77716' },
    { id: 'cicatrisation', range: 'Cicaplast', detail: 'Réparation cutanée', image: '/images/cicaplast_hero_packshot.webp', accent: '#1889b7' },
  ],
  footnote: '*Étude déclarative internationale de recommandation dermatologique communiquée par la marque.',
  rangeHeading: 'Une gamme claire pour chaque priorité cutanée.',
  rangeIntro: 'Sélectionnez votre préoccupation pour filtrer immédiatement les soins adaptés disponibles en boutique.',
  rangeImageDefaults: {
    acne: '/images/effaclar_hero_packshot.webp',
    solaire: '/images/anthelios_banner_card.webp',
    cicatrisation: '/images/cicaplast_bundle.webp',
  } as Record<string, string>,
  fallbackImage: '/images/larochposay_brand_showcase.webp',
  methodImage: '/images/effaclar_hero_packshot.webp',
  methodImageAlt: 'Effaclar Duo+M La Roche-Posay',
  methodKicker: 'La méthode La Roche-Posay',
  methodHeading: 'Des formules ciblées, une routine lisible.',
  methodCopy: 'Cette page organise la sélection par préoccupation et par gamme. Consultez la fiche de chaque produit pour vérifier la formule, le mode d’emploi et sa compatibilité avec votre peau.',
  methodCards: [
    { icon: FlaskConical, title: 'Actifs ciblés', body: 'Des formules organisées par besoin cutané.' },
    { icon: ShieldCheck, title: 'Haute tolérance', body: 'Une sélection pensée pour les peaux sensibles.' },
    { icon: Droplets, title: 'Eau thermale', body: 'L’actif signature au cœur de la marque.' },
  ],
  principlesCopy: 'Quatre principes pour naviguer plus facilement dans l’offre La Roche-Posay. Pour une affection persistante ou une peau très réactive, demandez conseil à un professionnel de santé.',
  catalogLabel: 'Catalogue La Roche-Posay',
  ranges: RANGES,
  trustClaims: TRUST_CLAIMS,
};

const VICHY_CONFIG = {
  name: 'Vichy',
  vendorToken: 'vichy',
  apiVendor: 'Vichy',
  logo: '/images/brands/vichy.webp',
  logoAlt: 'Logo Vichy Laboratoires',
  eyebrow: 'Laboratoires dermatologiques',
  origin: 'Vichy · France',
  headline: 'La force des minéraux au service de votre peau.',
  introduction: 'Explorez les soins Vichy par besoin : imperfections, cuir chevelu, protection solaire, signes de l’âge, nettoyage et soins pour homme.',
  metrics: [
    ['62 soins', 'dans le catalogue actuel'],
    ['6 catégories', 'organisées par besoin'],
    ['Eau volcanique', 'signature minérale Vichy'],
  ],
  heroImage: '/images/vichy_brand_showcase.webp',
  heroAlt: 'Sélection de soins Vichy dans un univers minéral lumineux',
  heroCaption: 'Choisissez une catégorie claire, puis composez une routine adaptée à votre besoin.',
  heroHighlights: [
    { id: 'normaderm', range: 'Normaderm', detail: 'Imperfections', image: '', accent: '#2d8f78' },
    { id: 'dercos', range: 'Dercos', detail: 'Cheveux & cuir chevelu', image: '', accent: '#6d55a8' },
    { id: 'solaire', range: 'Capital Soleil', detail: 'Protection SPF', image: '/images/vichy_sunscreen_bundle.webp', accent: '#d98537' },
  ],
  footnote: 'Sélection et disponibilité mises à jour depuis le catalogue Para Officinal.',
  rangeHeading: 'Une catégorie Vichy pour chaque besoin essentiel.',
  rangeIntro: 'Choisissez votre priorité pour afficher immédiatement les soins Vichy correspondants disponibles en boutique.',
  rangeImageDefaults: {
    solaire: '/images/vichy_sunscreen_bundle.webp',
  } as Record<string, string>,
  fallbackImage: '/images/vichy_brand_showcase.webp',
  methodImage: '/images/vichy_sunscreen_bundle.webp',
  methodImageAlt: 'Sélection Capital Soleil Vichy',
  methodKicker: 'La méthode Vichy',
  methodHeading: 'Des actifs ciblés, des catégories faciles à comprendre.',
  methodCopy: 'Cette page classe le catalogue Vichy par usage réel. Consultez chaque fiche pour vérifier la formule, la fréquence d’utilisation et les précautions adaptées à votre peau ou à votre cuir chevelu.',
  methodCards: [
    { icon: Droplets, title: 'Source minérale', body: 'L’eau volcanique minéralisante au cœur de l’identité Vichy.' },
    { icon: FlaskConical, title: 'Actifs précis', body: 'Des actifs associés à une préoccupation clairement identifiée.' },
    { icon: ShieldCheck, title: 'Routine guidée', body: 'Une navigation par besoin pour éviter les associations incohérentes.' },
  ],
  principlesCopy: 'Quatre repères pour parcourir l’offre Vichy avec plus de clarté. Pour une affection persistante, une chute importante ou une peau très réactive, demandez conseil à un professionnel de santé.',
  catalogLabel: 'Catalogue Vichy',
  ranges: VICHY_RANGES,
  trustClaims: VICHY_TRUST_CLAIMS,
};

const CERAVE_CONFIG = {
  name: 'CeraVe',
  vendorToken: 'cerave',
  apiVendor: 'CeraVe',
  logo: '/images/brands/cerave.svg',
  logoAlt: 'Logo CeraVe',
  eyebrow: 'Développé avec des dermatologues',
  origin: 'Soins pour le visage et le corps',
  headline: 'Une barrière renforcée, une peau mieux hydratée.',
  introduction: 'Nettoyez, hydratez et protégez votre peau avec des soins CeraVe classés par besoin et disponibles chez Para Officinal.',
  metrics: [
    ['3 céramides', 'essentiels dans les formules'],
    ['6 catégories', 'organisées par besoin'],
    ['Visage & corps', 'une routine complète'],
  ],
  heroImage: '/images/cerave_showcase_banner.webp',
  heroAlt: 'Sélection de soins hydratants CeraVe dans un décor aquatique bleu',
  heroCaption: 'Choisissez votre besoin, puis composez une routine CeraVe claire et cohérente.',
  heroHighlights: [
    { id: 'hydratation', range: 'Hydratation', detail: 'Visage & corps', image: '', accent: '#1677a5' },
    { id: 'nettoyage', range: 'Nettoyage', detail: 'Toutes les peaux', image: '', accent: '#188f9d' },
    { id: 'imperfections', range: 'Anti-imperfections', detail: 'Pores & brillance', image: '', accent: '#2c76b5' },
  ],
  footnote: 'Sélection et disponibilité mises à jour depuis le catalogue Para Officinal.',
  rangeHeading: 'Une catégorie CeraVe pour chaque besoin essentiel.',
  rangeIntro: 'Choisissez votre priorité pour afficher immédiatement les soins CeraVe correspondants disponibles en boutique.',
  rangeImageDefaults: {} as Record<string, string>,
  fallbackImage: '/images/cerave_showcase_banner.webp',
  methodImage: '/images/cerave_showcase_banner.webp',
  methodImageAlt: 'Sélection de soins hydratants CeraVe',
  methodKicker: 'La méthode CeraVe',
  methodHeading: 'Nettoyer, hydrater et protéger la barrière cutanée.',
  methodCopy: 'Cette page classe le catalogue CeraVe par usage réel. Consultez chaque fiche pour vérifier la texture, les actifs, la fréquence d’utilisation et la compatibilité avec votre peau.',
  methodCards: [
    { icon: ShieldCheck, title: 'Barrière cutanée', body: 'Trois céramides essentiels au cœur des formules.' },
    { icon: Droplets, title: 'Hydratation MVE', body: 'Une diffusion progressive pour prolonger le confort.' },
    { icon: FlaskConical, title: 'Routine guidée', body: 'Des catégories claires pour associer les bons gestes.' },
  ],
  principlesCopy: 'Quatre repères pour parcourir l’offre CeraVe avec plus de clarté. Pour une affection persistante ou une peau très réactive, demandez conseil à un professionnel de santé.',
  catalogLabel: 'Catalogue CeraVe',
  ranges: CERAVE_RANGES,
  trustClaims: CERAVE_TRUST_CLAIMS,
};

const AVENE_CONFIG = {
  name: 'Avène',
  vendorToken: 'avene',
  apiVendor: 'Avene',
  logo: '',
  logoAlt: 'Logo Eau Thermale Avène',
  eyebrow: 'Eau thermale, soins dermatologiques',
  origin: 'Avène, France',
  headline: 'Apaiser la peau, renforcer son équilibre.',
  introduction: 'Explorez les soins Avène par besoin : imperfections, hydratation, réparation, sécheresse, sensibilité et protection solaire chez Para Officinal.',
  metrics: [
    ['Eau thermale', 'actif signature Avène'],
    ['6 catégories', 'organisées par besoin'],
    ['Visage & corps', 'une sélection complète'],
  ],
  heroImage: '/images/avene_brand_showcase.webp',
  heroAlt: 'Sélection de soins Eau Thermale Avène dans un décor minéral apaisant',
  heroCaption: 'Identifiez votre priorité, puis composez une routine Avène claire et adaptée.',
  heroHighlights: [
    { id: 'cleanance', range: 'Cleanance', detail: 'Imperfections', image: '', accent: '#4f8f78' },
    { id: 'hydratation', range: 'Hydratation', detail: 'Confort & éclat', image: '', accent: '#c36f62' },
    { id: 'cicalfate', range: 'Cicalfate+', detail: 'Réparation', image: '', accent: '#9a7658' },
  ],
  footnote: 'Sélection et disponibilité mises à jour depuis le catalogue Para Officinal.',
  rangeHeading: 'Une catégorie Avène pour chaque priorité cutanée.',
  rangeIntro: 'Choisissez votre besoin pour afficher immédiatement les soins Avène correspondants disponibles en boutique.',
  rangeImageDefaults: {} as Record<string, string>,
  fallbackImage: '/images/avene_brand_showcase.webp',
  methodImage: '/images/avene_brand_showcase.webp',
  methodImageAlt: 'Sélection de soins Eau Thermale Avène',
  methodKicker: 'La méthode Avène',
  methodHeading: 'Apaiser, protéger et accompagner les peaux sensibles.',
  methodCopy: 'Cette page classe le catalogue Avène par besoin réel. Consultez chaque fiche pour vérifier la texture, la fréquence d’utilisation et les précautions adaptées à votre peau.',
  methodCards: [
    { icon: Droplets, title: 'Eau thermale', body: 'L’actif apaisant qui signe l’identité Avène.' },
    { icon: ShieldCheck, title: 'Tolérance ciblée', body: 'Des textures organisées selon la sensibilité et la zone.' },
    { icon: FlaskConical, title: 'Routine guidée', body: 'Six catégories pour associer les bons gestes.' },
  ],
  principlesCopy: 'Quatre repères pour parcourir l’offre Avène avec plus de clarté. Pour une affection persistante ou une peau très réactive, demandez conseil à un professionnel de santé.',
  catalogLabel: 'Catalogue Avène',
  ranges: AVENE_RANGES,
  trustClaims: AVENE_TRUST_CLAIMS,
  productFilter: isAveneCatalogProduct,
};

const BIODERMA_CONFIG = {
  name: 'Bioderma',
  vendorToken: 'bioderma',
  apiVendor: 'Bioderma',
  logo: '',
  logoAlt: 'Bioderma',
  eyebrow: 'Laboratoire dermatologique',
  origin: 'Bioderma · France',
  headline: 'Respecter la peau, accompagner ses besoins.',
  introduction: 'Explorez la sélection BIODERMA par besoin cutané : peaux sensibles, imperfections, sécheresse, hydratation, réparation et protection solaire.',
  metrics: [
    ['6 gammes', 'classées par besoin'],
    ['Peaux sensibles', 'au cœur de la sélection'],
    ['Soins ciblés', 'visage & corps'],
  ],
  heroImage: '/images/bioderma_brand_showcase.webp',
  heroAlt: 'Sélection de soins Bioderma dans un univers doux et lumineux',
  heroCaption: 'Composez une routine BIODERMA cohérente, selon la priorité de votre peau.',
  heroHighlights: [
    { id: 'sensibio', range: 'Sensibio', detail: 'Peaux sensibles', image: '', accent: '#d94f72' },
    { id: 'sebium', range: 'Sebium', detail: 'Imperfections', image: '', accent: '#60a33b' },
    { id: 'atoderm', range: 'Atoderm', detail: 'Peaux sèches', image: '', accent: '#2076aa' },
  ],
  footnote: 'Sélection et disponibilité mises à jour depuis le catalogue Para Officinal.',
  rangeHeading: 'Une gamme BIODERMA pour chaque priorité cutanée.',
  rangeIntro: 'Choisissez votre besoin pour afficher immédiatement les soins BIODERMA correspondants disponibles en boutique.',
  rangeImageDefaults: {} as Record<string, string>,
  fallbackImage: '/images/bioderma_brand_showcase.webp',
  methodImage: '/images/bioderma_brand_showcase.webp',
  methodImageAlt: 'Sélection de soins Bioderma',
  methodKicker: 'La méthode BIODERMA',
  methodHeading: 'Des soins pensés autour de l’équilibre de la peau.',
  methodCopy: 'Cette page organise le catalogue BIODERMA par besoin concret. Consultez chaque fiche pour vérifier la formule, la fréquence d’utilisation et les précautions adaptées à votre peau.',
  methodCards: [
    { icon: Microscope, title: 'Écobiologie', body: 'Une approche qui respecte l’écosystème cutané.' },
    { icon: FlaskConical, title: 'Actifs ciblés', body: 'Des gammes dédiées à chaque priorité de peau.' },
    { icon: ShieldCheck, title: 'Routine guidée', body: 'Une navigation par besoin pour mieux choisir.' },
  ],
  principlesCopy: 'Quatre repères pour parcourir l’offre BIODERMA avec clarté. Pour une affection persistante ou une peau très réactive, demandez conseil à un professionnel de santé.',
  catalogLabel: 'Catalogue BIODERMA',
  ranges: BIODERMA_RANGES,
  trustClaims: BIODERMA_TRUST_CLAIMS,
};

const EUCERIN_CONFIG = {
  name: 'Eucerin',
  vendorToken: 'eucerin',
  apiVendor: 'Eucerin',
  logo: '',
  logoAlt: 'Eucerin',
  eyebrow: 'Expertise dermatologique',
  origin: 'Eucerin · Allemagne',
  headline: 'Des soins ciblés pour chaque besoin de peau.',
  introduction: 'Explorez la sélection EUCERIN par besoin : sécheresse, imperfections, taches pigmentaires, signes de l’âge, réparation et protection solaire.',
  metrics: [
    ['6 gammes', 'classées par besoin'],
    ['Peaux sensibles', 'au cœur de la sélection'],
    ['Visage & corps', 'des routines ciblées'],
  ],
  heroImage: '/images/eucerin_brand_showcase.webp',
  heroAlt: 'Sélection de soins Eucerin dans un univers dermatologique lumineux',
  heroCaption: 'Choisissez une priorité, puis construisez une routine EUCERIN adaptée à votre peau.',
  heroHighlights: [
    { id: 'urearepair', range: 'UreaRepair', detail: 'Sécheresse intense', image: '', accent: '#2d6ba1' },
    { id: 'dermopure', range: 'DermoPure', detail: 'Imperfections', image: '', accent: '#4f8e6e' },
    { id: 'sun', range: 'Sun Protection', detail: 'Protection SPF', image: '', accent: '#d47b21' },
  ],
  footnote: 'Sélection et disponibilité mises à jour depuis le catalogue Para Officinal.',
  rangeHeading: 'Une gamme EUCERIN pour chaque priorité cutanée.',
  rangeIntro: 'Choisissez votre besoin pour afficher immédiatement les soins EUCERIN correspondants disponibles en boutique.',
  rangeImageDefaults: {} as Record<string, string>,
  fallbackImage: '/images/eucerin_brand_showcase.webp',
  methodImage: '/images/eucerin_brand_showcase.webp',
  methodImageAlt: 'Sélection de soins Eucerin',
  methodKicker: 'La méthode EUCERIN',
  methodHeading: 'Des soins dermatologiques organisés par besoin réel.',
  methodCopy: 'Cette page organise le catalogue EUCERIN selon les principaux besoins de peau. Consultez chaque fiche pour vérifier les actifs, la texture, le mode d’emploi et les précautions adaptées.',
  methodCards: [
    { icon: Microscope, title: 'Recherche clinique', body: 'Des gammes structurées autour de besoins cutanés identifiés.' },
    { icon: FlaskConical, title: 'Actifs précis', body: 'Des actifs ciblés selon la sécheresse, les taches ou les imperfections.' },
    { icon: ShieldCheck, title: 'Routine guidée', body: 'Une navigation par besoin pour faire un choix plus clair.' },
  ],
  principlesCopy: 'Quatre repères pour parcourir l’offre EUCERIN avec clarté. Pour une affection persistante ou une peau très réactive, demandez conseil à un professionnel de santé.',
  catalogLabel: 'Catalogue EUCERIN',
  ranges: EUCERIN_RANGES,
  trustClaims: EUCERIN_TRUST_CLAIMS,
};

const SORT_OPTIONS = [
  { value: 'popular',   label: 'Popularité'      },
  { value: 'price-asc', label: 'Prix croissant'   },
  { value: 'price-desc',label: 'Prix décroissant' },
  { value: 'rating',    label: 'Meilleures notes' },
];

/* ─── Helpers ────────────────────────────────────────────────────── */
const matchByKeywords = (p: Product, kwds: string[]) => {
  const text = `${p.title ?? ''} ${p.description ?? ''} ${p.ingredients ?? ''} ${(p.tags ?? []).join(' ')} ${p.category ?? ''}`.toLowerCase();
  return kwds.some(k => text.includes(k));
};

const sortProducts = (list: Product[], opt: string) => {
  const arr = [...list];
  if (opt === 'price-asc')  return arr.sort((a,b) => a.price - b.price);
  if (opt === 'price-desc') return arr.sort((a,b) => b.price - a.price);
  if (opt === 'rating')     return arr.sort((a,b) => (b.rating||5) - (a.rating||5));
  return arr.sort((a,b) => (b.reviews||0) - (a.reviews||0));
};

const firstImage = (p: Product): string => {
  if (p.images?.length) return p.images[0];
  return p.image || '';
};

/* ─── Component ──────────────────────────────────────────────────── */
export default function LaRochePosayCustomPage({ brand = 'la-roche-posay' }: { brand?: 'la-roche-posay' | 'vichy' | 'cerave' | 'avene' | 'bioderma' | 'eucerin' }) {
  const { setDiagnosticOpen } = useUi();
  const { getDisplayImage } = useGalleryOverrides();
  const galleryPrefix = `brand_page_${brand.replace(/-/g, '_')}`;
  const galleryImage = (src: string, placement: string) => getDisplayImage(src, `${galleryPrefix}_${placement}`);
  const brandConfig = brand === 'eucerin'
    ? EUCERIN_CONFIG
    : brand === 'avene'
      ? AVENE_CONFIG
    : brand === 'bioderma'
      ? BIODERMA_CONFIG
      : brand === 'cerave'
        ? CERAVE_CONFIG
        : brand === 'vichy'
          ? VICHY_CONFIG
          : LRP_CONFIG;
  const ranges = brandConfig.ranges;
  const brandProductFilter: ((product: Product) => boolean) | null = (
    'productFilter' in brandConfig && typeof brandConfig.productFilter === 'function'
      ? brandConfig.productFilter as (product: Product) => boolean
      : null
  );

  const seedProducts = useMemo(() => PRODUCTS_DB.filter((product) => {
    const vendor = product.vendor.toLocaleLowerCase().replace(/[^a-z0-9]/g, '');
    return vendor.includes(brandConfig.vendorToken) && (!brandProductFilter || brandProductFilter(product));
  }), [brandConfig.vendorToken, brandProductFilter]);
  const [products, setProducts]         = useState<Product[]>(seedProducts);
  const [loading, setLoading]           = useState(true);
  const [loadError, setLoadError]       = useState(false);
  const [activeRange, setActiveRange]   = useState<string | null>(null);
  const [maxPrice, setMaxPrice]         = useState(1500);
  const [sortOption, setSortOption]     = useState('popular');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  /* Fetch the complete live catalogue for the selected brand. */
  useEffect(() => {
    let dead = false;
    fetch(`/api/products?vendor=${encodeURIComponent(brandConfig.apiVendor)}&limit=500`)
      .then(r => r.json())
      .then(d => {
        if (dead) return;
        if (d.success && Array.isArray(d.products) && d.products.length > 0) {
          const liveProducts = brandProductFilter
            ? d.products.filter((product: Product) => brandProductFilter(product))
            : d.products;
          if (liveProducts.length > 0) {
            setProducts(liveProducts);
            setLoadError(false);
          } else {
            setLoadError(true);
          }
        } else {
          setLoadError(true);
        }
      })
      .catch(() => { if (!dead) setLoadError(true); })
      .finally(() => { if (!dead) setLoading(false); });
    return () => { dead = true; };
  }, [brandConfig.apiVendor, brandProductFilter]);

  useEffect(() => {
    if (!mobileFilterOpen) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileFilterOpen(false);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [mobileFilterOpen]);

  /* Category visuals use curated assets first, then the first matching live product. */
  const rangeImages = useMemo(() => {
    const map: Record<string, string> = { ...brandConfig.rangeImageDefaults };
    ranges.forEach(rng => {
      if (!map[rng.id]) {
        const p = products.find(pr => matchByKeywords(pr, rng.keywords));
        if (p) map[rng.id] = firstImage(p);
      }
    });
    return map;
  }, [brandConfig.rangeImageDefaults, products, ranges]);

  /* Catalog (range-filtered or all) */
  const catalogProducts = useMemo(() => {
    let list = activeRange
      ? products.filter(p => matchByKeywords(p, ranges.find(r => r.id === activeRange)!.keywords))
      : products;
    list = list.filter(p => p.price <= maxPrice);
    return sortProducts(list, sortOption);
  }, [products, activeRange, maxPrice, sortOption, ranges]);

  const selectRange = (id: string) => {
    const next = activeRange === id ? null : id;
    setActiveRange(next);
    setTimeout(() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
  };

  const activeRangeObj = ranges.find(r => r.id === activeRange);

  /* ── render ─────────────────────────────────────────────────── */
  return (
    <ShopShell>
      <main className="bg-white text-slate-900 [scroll-behavior:smooth]">

        <section className="relative overflow-hidden border-b border-[#d9e7f0] bg-[#f4f9fc]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(14,165,233,0.11),transparent_34%),radial-gradient(circle_at_82%_15%,rgba(255,255,255,0.95),transparent_40%)]" />
          <div className="relative mx-auto max-w-[1360px] px-5 pb-10 pt-6 sm:px-8 lg:px-12 lg:pb-14">
            <nav aria-label="Fil d’Ariane" className="mb-8 flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Link href="/" className="rounded-sm transition-colors hover:text-[#0b75b9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-500">Accueil</Link>
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="text-slate-800">{brandConfig.name}</span>
            </nav>

            <div className="grid items-stretch gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:gap-10">
              <div className="flex flex-col justify-center py-4 lg:py-10">
                <div className="mb-7 flex items-center gap-4">
                  <span className="flex h-16 w-16 items-center justify-center border border-slate-200 bg-white px-1 shadow-[0_12px_34px_rgba(15,39,68,0.09)]">
                    {brandConfig.logo ? (
                      <Image src={galleryImage(brandConfig.logo, 'logo')} alt={brandConfig.logoAlt} width={52} height={52} className="h-12 w-12 object-contain" preload />
                    ) : (
                      <span className="text-center text-[11px] font-black leading-none tracking-[-0.06em] text-[#3f4248]">{brandConfig.name}</span>
                    )}
                  </span>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#0b75b9]">{brandConfig.eyebrow}</p>
                    <p className="mt-1 text-sm font-medium text-slate-500">{brandConfig.origin}</p>
                  </div>
                </div>

                <h1 className="max-w-[720px] text-balance text-[clamp(2.65rem,6vw,5.4rem)] font-black leading-[0.94] tracking-[-0.055em] text-[#0d2442]">
                  {brandConfig.headline}
                </h1>
                <p className="mt-7 max-w-[58ch] text-pretty text-base font-medium leading-7 text-slate-600 sm:text-lg">
                  {brandConfig.introduction}
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Link href="#ranges" className="group inline-flex min-h-14 items-center justify-between gap-6 rounded-[18px] bg-[#0c79b8] px-6 text-sm font-bold text-white shadow-[0_16px_30px_rgba(12,121,184,0.24)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#09689f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0c79b8] active:translate-y-0">
                    Explorer les catégories
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-white/10 transition-transform duration-300 group-hover:translate-x-1">
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </Link>
                  <button type="button" onClick={() => setDiagnosticOpen(true)} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-[18px] border border-[#bed7e7] bg-white px-6 text-sm font-bold text-[#0d4165] transition duration-300 hover:border-[#79b9dd] hover:bg-[#eaf6fc] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0c79b8] active:scale-[0.98]">
                    <Sparkles className="h-4 w-4 text-[#0c79b8]" aria-hidden="true" />
                    Trouver ma routine
                  </button>
                </div>

                <dl className="mt-9 grid max-w-xl grid-cols-3 border-y border-[#cfdfe9] py-5">
                  {brandConfig.metrics.map(([value, label], index) => (
                    <div key={value} className={index === 0 ? 'pr-4' : index === 1 ? 'border-l border-[#cfdfe9] px-4' : 'border-l border-[#cfdfe9] pl-4'}>
                      <dt className="text-xl font-black tabular-nums text-[#0d2442]">{value}</dt>
                      <dd className="mt-1 text-[11px] font-semibold leading-4 text-slate-500">{label}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="relative min-h-[480px] overflow-hidden rounded-[34px] bg-[#e8eef0] shadow-[0_30px_70px_rgba(15,39,68,0.16)] lg:min-h-[650px]">
                <Image src={galleryImage(brandConfig.heroImage, 'hero')} alt={brandConfig.heroAlt} fill preload sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b2742]/70 via-transparent to-white/5" />
                <div className="absolute inset-x-5 bottom-5 rounded-[24px] border border-white/25 bg-[#0b2742]/78 p-5 text-white shadow-2xl backdrop-blur-xl sm:inset-x-7 sm:bottom-7 sm:p-6">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-sky-200">Sélection experte</p>
                      <p className="mt-2 max-w-md text-xl font-bold leading-tight">{brandConfig.heroCaption}</p>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-2 text-xs font-semibold text-slate-200"><ShieldCheck className="h-4 w-4 text-sky-300" /> Produits authentiques</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-7 grid gap-3 sm:grid-cols-3">
              {brandConfig.heroHighlights.map((item) => (
                <button key={item.id} type="button" onClick={() => selectRange(item.id)} className="group grid min-h-28 grid-cols-[76px_1fr_auto] items-center gap-4 rounded-[22px] border border-[#d7e4ec] bg-white p-3 text-left shadow-[0_12px_28px_rgba(15,39,68,0.07)] transition duration-300 hover:-translate-y-1 hover:border-[#94c7e2] hover:shadow-[0_18px_36px_rgba(15,39,68,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0c79b8] active:translate-y-0">
                  <span className="relative h-[76px] overflow-hidden rounded-[16px] bg-slate-50">
                    <Image src={galleryImage(item.image || rangeImages[item.id] || brandConfig.fallbackImage, `highlight_${item.id}`)} alt={`Produit ${item.range}`} fill sizes="76px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  </span>
                  <span>
                    <span className="block text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: item.accent }}>{item.range}</span>
                    <span className="mt-1 block text-sm font-bold text-[#0d2442]">{item.detail}</span>
                  </span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eef7fb] text-[#0c79b8] transition duration-300 group-hover:bg-[#0c79b8] group-hover:text-white"><ArrowRight className="h-4 w-4" /></span>
                </button>
              ))}
            </div>
            <p className="mt-4 text-[10px] leading-4 text-slate-400">{brandConfig.footnote}</p>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            §2. RANGES - NOS GAMMES PAR PRÉOCCUPATION (main upgrade)
        ══════════════════════════════════════════════════════════ */}
        <section id="ranges" className="relative overflow-hidden border-b border-[#dce9f1] bg-[#f4f8fb] py-20 lg:py-24">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(14,165,233,0.09),transparent_28%),radial-gradient(circle_at_88%_34%,rgba(255,255,255,0.95),transparent_30%)]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#9acde7] to-transparent" />
          <div className="relative mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-12">
            <div className="mb-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between lg:mb-14">
              <div className="max-w-2xl">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[#0c79b8]">Choisir selon votre besoin</p>
                <h2 className="text-balance text-3xl font-black leading-tight tracking-[-0.035em] text-[#0d2442] lg:text-5xl">
                  {brandConfig.rangeHeading}
                </h2>
                <p className="mt-4 max-w-[58ch] text-sm font-medium leading-6 text-slate-500 sm:text-base">{brandConfig.rangeIntro}</p>
              </div>
              {activeRange && (
                <button onClick={() => setActiveRange(null)}
                  className="min-h-11 shrink-0 rounded-xl border border-slate-300 bg-white px-4 text-xs font-bold text-slate-600 transition hover:border-slate-400 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0c79b8]">
                  Effacer le filtre
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-12 lg:gap-6">
              {ranges.map((rng, index) => {
                const img = rangeImages[rng.id];
                const isActive = activeRange === rng.id;
                const count = products.filter(p => matchByKeywords(p, rng.keywords)).length;
                const RngIcon = rng.Icon;
                const isFeature = index < 2;
                const spanClass = index === 0
                  ? 'lg:col-span-7'
                  : index === 1
                    ? 'lg:col-span-5'
                    : 'lg:col-span-3';
                return (
                  <button
                    key={rng.id}
                    onClick={() => selectRange(rng.id)}
                    aria-pressed={isActive}
                    aria-label={`${isActive ? 'Retirer le filtre' : 'Filtrer par la catégorie'} ${rng.name}`}
                    className={`group relative isolate flex min-h-[390px] flex-col overflow-hidden rounded-[30px] border p-0 text-left shadow-[0_18px_45px_rgba(21,60,91,0.08)] transition-[transform,box-shadow,border-color] duration-500 ease-out hover:-translate-y-1.5 hover:shadow-[0_30px_70px_rgba(21,60,91,0.17)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0c79b8] active:translate-y-0 sm:min-h-[420px] ${spanClass}`}
                    style={{
                      borderColor: isActive ? rng.accent : 'rgba(187, 208, 220, 0.72)',
                      background: `linear-gradient(145deg, #ffffff 0%, ${rng.lightBg} 100%)`,
                      boxShadow: isActive
                        ? `0 26px 60px ${rng.accent}26, inset 0 0 0 1px ${rng.accent}38`
                        : undefined,
                    }}
                  >
                    <span
                      className="absolute inset-x-0 top-0 z-20 h-1 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
                      style={{ background: rng.accent }}
                    />
                    <span
                      className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-30 blur-3xl transition duration-700 group-hover:scale-125 group-hover:opacity-45"
                      style={{ background: rng.accent }}
                    />
                    <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.68),transparent_42%,rgba(255,255,255,0.18))]" />
                    <span
                      className="pointer-events-none absolute -right-2 top-14 select-none text-[5.2rem] font-black leading-none tracking-[-0.08em] opacity-[0.035] transition-transform duration-700 group-hover:-translate-x-2 sm:text-[6.5rem]"
                      style={{ color: rng.accent }}
                      aria-hidden="true"
                    >
                      {rng.name}
                    </span>

                    <div className="relative z-10 flex w-full items-center justify-between px-5 pb-2 pt-5 sm:px-6 sm:pt-6">
                      <span
                        className="inline-flex items-center gap-2 rounded-full border bg-white/75 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] shadow-[0_8px_24px_rgba(15,39,68,0.06)] backdrop-blur-md"
                        style={{
                          color: rng.accent,
                          borderColor: `${rng.accent}30`,
                        }}
                      >
                        <RngIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        {rng.name}
                      </span>

                      {isActive ? (
                        <span className="flex h-9 items-center gap-2 rounded-full px-3 text-[10px] font-black uppercase tracking-[0.12em] text-white shadow-lg" style={{ background: rng.accent }}>
                          <Check className="h-3.5 w-3.5 stroke-[3]" aria-hidden="true" />
                          Sélectionnée
                        </span>
                      ) : (
                        <span className="font-mono text-[10px] font-bold tabular-nums text-slate-500">
                          {String(count).padStart(2, '0')} soins
                        </span>
                      )}
                    </div>

                    <div className={`relative z-[1] mx-5 mt-2 overflow-hidden rounded-[24px] border border-white/80 bg-white/58 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_18px_45px_rgba(20,66,96,0.08)] backdrop-blur-sm sm:mx-6 ${isFeature ? 'h-[210px] sm:h-[230px]' : 'h-[205px]'}`}>
                      <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(255,255,255,0.98),rgba(255,255,255,0.2)_62%,transparent_80%)]" />
                      <span className="pointer-events-none absolute bottom-4 left-1/2 h-5 w-32 -translate-x-1/2 rounded-full bg-slate-700/10 blur-xl transition duration-500 group-hover:w-40" />
                      {img ? (
                        <Image
                          src={galleryImage(img, `range_${rng.id}`)}
                          alt={rng.label}
                          fill
                          sizes={isFeature ? '(max-width: 1024px) 100vw, 52vw' : '(max-width: 1024px) 50vw, 25vw'}
                          onError={(event) => { event.currentTarget.src = brandConfig.fallbackImage; }}
                          className="h-full w-full object-cover object-center transition duration-700 ease-out group-hover:scale-[1.06]"
                        />
                      ) : (
                        <div className="absolute left-1/2 top-1/2 flex h-32 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl shadow-xl" style={{ background: rng.accent }}>
                          <span className="text-center text-[9px] font-black text-white">{rng.name}</span>
                        </div>
                      )}
                    </div>

                    <div className="relative z-10 flex flex-1 flex-col px-5 pb-5 pt-5 sm:px-6 sm:pb-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Priorité cutanée</p>
                          <h3 className={`whitespace-pre-line font-black leading-[1.02] tracking-[-0.035em] text-[#0d2442] transition-colors duration-300 group-hover:text-[#0c79b8] ${isFeature ? 'text-2xl sm:text-[1.7rem]' : 'text-[1.35rem]'}`}>
                            {rng.label}
                          </h3>
                        </div>
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white bg-white/85 text-[#0d2442] shadow-[0_10px_24px_rgba(15,39,68,0.1)] transition duration-500 group-hover:translate-x-1 group-hover:bg-[#0c79b8] group-hover:text-white">
                          <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-0.5" aria-hidden="true" />
                        </span>
                      </div>

                      <p className="mt-3 line-clamp-2 text-xs font-medium leading-relaxed text-slate-500">{rng.tagline}</p>

                      <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
                        {rng.molecules.slice(0, isFeature ? 3 : 2).map((m, moleculeIndex) => (
                          <span
                            key={m}
                            className="rounded-full border border-white/90 bg-white/70 px-2.5 py-1 text-[9px] font-bold text-slate-600 shadow-[0_4px_14px_rgba(15,39,68,0.05)] backdrop-blur-sm transition duration-300 group-hover:-translate-y-0.5"
                            style={{ transitionDelay: `${moleculeIndex * 45}ms` }}
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Range detail panel, shown when a range is selected. */}
            {activeRangeObj && (
              <div
                className="mt-4 rounded-2xl p-6 lg:p-8 flex flex-col sm:flex-row gap-6 items-start"
                style={{ background: activeRangeObj.lightBg, border: `1.5px solid ${activeRangeObj.accent}30` }}
              >
                <div className="flex-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1" style={{ color: activeRangeObj.accent }}>{activeRangeObj.name}</p>
                  <h3 className="text-xl font-black mb-2" style={{ color: LRP_DARK }}>{activeRangeObj.label.replace('\n', ' ')}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">{activeRangeObj.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {activeRangeObj.molecules.map(m => (
                      <span key={m} className="text-[10px] font-bold px-2.5 py-1 rounded-full border"
                        style={{ borderColor: activeRangeObj.accent + '60', color: activeRangeObj.accent, background: activeRangeObj.accent + '12' }}>
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                  <button
                    onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer transition hover:opacity-90"
                    style={{ background: activeRangeObj.accent }}
                  >
                    Voir les produits <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>





        {/* ══════════════════════════════════════════════════════════
            §6. STATS BANNER (REDESIGNED)
        ══════════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden border-y border-[#173b5d] bg-[#0b223b] py-20 text-white">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(14,165,233,0.18),transparent_30%),radial-gradient(circle_at_85%_80%,rgba(42,106,153,0.2),transparent_32%)]" />
          <div className="relative mx-auto grid max-w-[1360px] gap-8 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:px-12">
            <div className="relative min-h-[420px] overflow-hidden rounded-[30px] bg-white">
              <Image src={galleryImage(brandConfig.methodImage, 'method')} alt={brandConfig.methodImageAlt} fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover object-center" />
              <span className="absolute left-5 top-5 border border-sky-200 bg-sky-50 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#0c79b8]">Soin emblématique</span>
            </div>

            <div className="flex flex-col justify-center">
              <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-sky-300"><Microscope className="h-4 w-4" /> {brandConfig.methodKicker}</p>
              <h2 className="mt-4 max-w-2xl text-balance text-3xl font-black leading-tight tracking-[-0.04em] sm:text-5xl">{brandConfig.methodHeading}</h2>
              <p className="mt-5 max-w-[62ch] text-sm font-medium leading-7 text-slate-300 sm:text-base">{brandConfig.methodCopy}</p>

              <div className="mt-9 grid gap-px overflow-hidden rounded-[24px] border border-white/10 bg-white/10 sm:grid-cols-3">
                {brandConfig.methodCards.map((item) => {
                  const Icon = item.icon;
                  return (
                    <article key={item.title} className="bg-[#0e2946] p-5 transition-colors duration-300 hover:bg-[#123452]">
                      <Icon className="h-5 w-5 text-sky-300" aria-hidden="true" />
                      <h3 className="mt-4 text-sm font-bold">{item.title}</h3>
                      <p className="mt-2 text-xs leading-5 text-slate-400">{item.body}</p>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>



        {/* ══════════════════════════════════════════════════════════
            §9. BRAND TRUST CLAIMS (REDESIGNED)
        ══════════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden border-t border-slate-100 bg-[#f5f8fa] py-20">
          <div className="relative mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-12">
            <div className="mb-12 grid gap-5 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
              <div>
                <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#0c79b8]">
                  <ShieldCheck className="h-4 w-4" /> Repères de formulation
                </span>
                <h2 className="mt-4 text-balance text-3xl font-black tracking-[-0.04em] text-[#0d2442] sm:text-5xl">
                  Comprendre avant de choisir.
                </h2>
              </div>
              <p className="max-w-[68ch] text-sm font-medium leading-7 text-slate-500 lg:justify-self-end">
                {brandConfig.principlesCopy}
              </p>
            </div>

            <div className="grid grid-cols-1 overflow-hidden rounded-[28px] border border-[#dce7ed] bg-[#dce7ed] gap-px sm:grid-cols-2 lg:grid-cols-4">
              {brandConfig.trustClaims.map((c, i) => {
                const Icon = c.Icon;
                return (
                  <article
                    key={i}
                    className="group relative flex min-h-72 flex-col justify-between overflow-hidden bg-white p-7 transition-colors duration-300 hover:bg-[#f0f8fc]"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex h-12 w-12 items-center justify-center rounded-[15px] bg-[#e6f4fb] text-[#0c79b8] transition-colors duration-300 group-hover:bg-[#0c79b8] group-hover:text-white">
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="font-mono text-2xl font-black text-slate-200 transition-colors duration-300 group-hover:text-sky-300">
                          {c.num}
                        </span>
                      </div>

                      <h3 className="mb-3 text-base font-black leading-snug tracking-tight text-[#0d2442] transition-colors duration-300 group-hover:text-[#0c79b8]">
                        {c.title}
                      </h3>
                      <p className="text-xs font-medium leading-6 text-slate-500">
                        {c.body}
                      </p>
                    </div>
                    <span className="mt-8 h-0.5 w-10 bg-[#8cc9e7] transition-all duration-300 group-hover:w-20 group-hover:bg-[#0c79b8]" />
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            §10. FULL CATALOG
        ══════════════════════════════════════════════════════════ */}
        <section id="catalog" className="scroll-mt-24 border-t border-slate-100 bg-white py-20">
          <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-12">
            <div className="mb-9 flex flex-col gap-5 border-b border-slate-200 pb-7 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0c79b8]">{brandConfig.catalogLabel}</p>
                <h2 className="mt-3 text-balance text-3xl font-black tracking-[-0.035em] text-[#0d2442] sm:text-4xl">
                  {activeRangeObj ? activeRangeObj.name : 'Tous les soins'}
                  {activeRangeObj && <span className="ml-2 font-medium" style={{ color: activeRangeObj.accent }}>- {activeRangeObj.label.replace('\n',' ')}</span>}
                </h2>
                <p className="mt-2 text-sm font-medium text-slate-500">{loading ? 'Mise à jour de la sélection…' : `${catalogProducts.length} produits disponibles`}</p>
                {loadError && <p className="mt-2 text-xs font-semibold text-amber-700">Le catalogue en direct est momentanément indisponible. La sélection enregistrée reste consultable.</p>}
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setMobileFilterOpen(true)}
                  className="flex min-h-11 items-center gap-2 rounded-xl border px-4 text-xs font-bold transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0c79b8] lg:hidden"
                  style={{ borderColor: '#e2e8f0', color: '#374151' }}>
                  <SlidersHorizontal className="w-4 h-4" style={{ color: LRP_BLUE }} /> Filtres
                </button>
                <div className="relative">
                  <select value={sortOption} onChange={e => setSortOption(e.target.value)}
                    aria-label="Trier les produits"
                    className="min-h-11 w-48 appearance-none rounded-xl border bg-white px-3.5 pr-8 text-xs font-bold outline-none transition focus:border-[#0c79b8] focus:ring-2 focus:ring-sky-100"
                    style={{ borderColor: '#e2e8f0', color: '#374151' }}>
                    {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="flex items-start gap-8">
              {/* Desktop sidebar */}
              <aside aria-label="Filtres catalogue" className="sticky top-6 hidden w-60 shrink-0 space-y-7 rounded-[22px] border border-slate-200 bg-[#f8fafb] p-5 lg:block">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Prix max</h3>
                    <span className="text-xs font-black text-gray-700 font-mono">{maxPrice} DH</span>
                  </div>
                  <input type="range" min={20} max={1500} step={10} value={maxPrice}
                    onChange={e => setMaxPrice(Number(e.target.value))}
                    className="w-full h-1.5 rounded-lg appearance-none cursor-pointer"
                    style={{ accentColor: LRP_BLUE }} />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Catégories</h3>
                  <button onClick={() => setActiveRange(null)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition"
                    style={activeRange === null ? { background: '#eff6ff', color: LRP_BLUE } : { color: '#64748b' }}>
                    <span>Toutes</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-400">{products.length}</span>
                  </button>
                  {ranges.map(rng => {
                    const cnt = products.filter(p => matchByKeywords(p, rng.keywords)).length;
                    if (!cnt) return null;
                    const isA = activeRange === rng.id;
                    return (
                      <button key={rng.id} onClick={() => setActiveRange(isA ? null : rng.id)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition"
                        style={isA ? { background: '#eff6ff', color: LRP_BLUE } : { color: '#64748b' }}>
                        <span>{rng.name}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-400">{cnt}</span>
                      </button>
                    );
                  })}
                </div>
              </aside>

              {/* Product grid */}
              <div className="flex-1 min-w-0">
                {loading ? (
                  <div className="grid grid-cols-1 gap-5 min-[520px]:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 9 }).map((_,i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-slate-100 rounded-2xl h-60 mb-3" />
                        <div className="bg-slate-100 rounded h-4 mb-2 w-3/4" />
                        <div className="bg-slate-100 rounded h-3 w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : catalogProducts.length > 0 ? (
                  <div className="grid grid-cols-1 gap-5 min-[520px]:grid-cols-2 xl:grid-cols-3">
                    {catalogProducts.map(p => <ProductCard key={p.id} product={p} galleryKeyPrefix={galleryPrefix} />)}
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-20 gap-4 text-slate-400">
                    <Search className="w-8 h-8" />
                    <p className="text-sm font-bold text-slate-600">Aucun produit trouvé</p>
                    <button onClick={() => { setActiveRange(null); setMaxPrice(1500); }}
                      className="px-5 py-2.5 rounded-lg text-xs font-bold text-white cursor-pointer"
                      style={{ background: LRP_BLUE }}>Réinitialiser</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── Mobile Filter Drawer ───────────────────────────────── */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 flex justify-end lg:hidden" role="dialog" aria-modal="true" aria-label="Filtres du catalogue">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileFilterOpen(false)} />
            <div className="relative w-80 max-w-[90vw] h-full bg-white shadow-2xl flex flex-col overflow-y-auto z-50">
              <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100">
                <span className="text-xs font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" style={{ color: LRP_BLUE }} /> Filtres
                </span>
                <button onClick={() => setMobileFilterOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Prix maximum</h3>
                    <span className="text-xs font-black text-gray-700 font-mono">{maxPrice} DH</span>
                  </div>
                  <input type="range" min={20} max={1500} step={10} value={maxPrice}
                    onChange={e => setMaxPrice(Number(e.target.value))}
                    className="w-full h-1.5 rounded-lg appearance-none cursor-pointer"
                    style={{ accentColor: LRP_BLUE }} />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Catégories</h3>
                  {[{ id: null as string | null, name: 'Toutes', count: products.length },
                    ...ranges.map(r => ({ id: r.id, name: r.name, count: products.filter(p => matchByKeywords(p, r.keywords)).length }))
                  ].filter(x => x.count > 0).map(item => (
                    <button key={String(item.id)}
                      onClick={() => { setActiveRange(item.id); setMobileFilterOpen(false); }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition"
                      style={activeRange === item.id ? { background: '#eff6ff', color: LRP_BLUE } : { color: '#64748b' }}>
                      <span>{item.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-400">{item.count}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="px-6 py-5 border-t border-slate-100 flex gap-3">
                <button onClick={() => { setActiveRange(null); setMaxPrice(1500); setMobileFilterOpen(false); }}
                  className="flex-1 py-2.5 border rounded-xl text-xs font-bold text-slate-600 cursor-pointer"
                  style={{ borderColor: '#e2e8f0' }}>Effacer</button>
                <button onClick={() => setMobileFilterOpen(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white cursor-pointer"
                  style={{ background: LRP_BLUE }}>Appliquer</button>
              </div>
            </div>
          </div>
        )}

      </main>
    </ShopShell>
  );
}
