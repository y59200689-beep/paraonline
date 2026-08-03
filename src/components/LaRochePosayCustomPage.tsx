'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShopShell } from '@/components/ShopShell';
import { ProductCard } from '@/components/ProductCard';
import { Product, PRODUCTS_DB } from '@/lib/data';
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
    /* Real product photo served via API — used as card bg, fallback to gradient */
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
export default function LaRochePosayCustomPage({ brand = 'la-roche-posay' }: { brand?: 'la-roche-posay' | 'vichy' }) {
  const { setDiagnosticOpen } = useUi();
  const brandConfig = brand === 'vichy' ? VICHY_CONFIG : LRP_CONFIG;
  const ranges = brandConfig.ranges;

  const seedProducts = useMemo(() => PRODUCTS_DB.filter((product) => {
    const vendor = product.vendor.toLocaleLowerCase().replace(/[^a-z0-9]/g, '');
    return vendor.includes(brandConfig.vendorToken);
  }), [brandConfig.vendorToken]);
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
          setProducts(d.products);
          setLoadError(false);
        } else {
          setLoadError(true);
        }
      })
      .catch(() => { if (!dead) setLoadError(true); })
      .finally(() => { if (!dead) setLoading(false); });
    return () => { dead = true; };
  }, [brandConfig.apiVendor]);

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
                  <span className="flex h-16 w-16 items-center justify-center border border-slate-200 bg-white shadow-[0_12px_34px_rgba(15,39,68,0.09)]">
                    <Image src={brandConfig.logo} alt={brandConfig.logoAlt} width={52} height={52} className="h-12 w-12 object-contain" preload />
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
                <Image src={brandConfig.heroImage} alt={brandConfig.heroAlt} fill preload sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" />
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
                    <Image src={item.image || rangeImages[item.id] || brandConfig.fallbackImage} alt={`Produit ${item.range}`} fill sizes="76px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
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
            §2. RANGES — NOS GAMMES PAR PRÉOCCUPATION (main upgrade)
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
                          src={img}
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

            {/* Range detail panel — slides in when a range is selected */}
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
              <Image src={brandConfig.methodImage} alt={brandConfig.methodImageAlt} fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-contain p-10" />
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
                  {activeRangeObj && <span className="ml-2 font-medium" style={{ color: activeRangeObj.accent }}>— {activeRangeObj.label.replace('\n',' ')}</span>}
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
                    {catalogProducts.map(p => <ProductCard key={p.id} product={p} />)}
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
