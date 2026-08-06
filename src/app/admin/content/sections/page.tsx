'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useAdmin } from '@/context/AdminContext';
import { useSettings, HomepageSectionItem } from '@/context/SettingsContext';
import { useUi } from '@/context/UiContext';
import { canEditContent } from '@/lib/permissions';
import { 
  Layers, Search, Eye, EyeOff, Edit3, X, Save, Sparkles, Plus, Trash2, 
  ChevronUp, ChevronDown, Check, LayoutGrid, Package, ArrowUpRight, Filter
} from 'lucide-react';
import { BilingualField } from '@/components/admin/ui/BilingualField';
import { EmptyState } from '@/components/admin/ui/EmptyState';

const SECTION_TYPE_MAP: Record<string, { label: string; desc: string; category: string }> = {
  hero: { label: 'Héro Carrousel', desc: 'Bannière principale avec diaporama d\'images et boutons d\'action.', category: 'En-tête' },
  categoryTrack: { label: 'Barre Catégories', desc: 'Barre de défilement horizontale des catégories avec icônes.', category: 'Navigation' },
  productGrid: { label: 'Grille Produits Vedettes', desc: 'Sélection des 16 produits vedettes affichés sur la boutique.', category: 'Catalogue' },
  brandPartners: { label: 'Marques Partenaires', desc: 'Galerie des logos des marques partenaires.', category: 'Marques' },
  diagnosticBanner: { label: 'Diagnostic IA Banner', desc: 'Bannière d\'appel à l\'action pour le diagnostic de peau IA.', category: 'Expérience' },
  summerSale: { label: 'Offres Événementielles', desc: 'Section promotionnelle pour ventes flash ou saisonnières.', category: 'Promotions' },
  dermoCorner: { label: 'Dermo Corner', desc: 'Espace comparatif conseils dermocosmétiques.', category: 'Contenu' },
  customerReviews: { label: 'Témoignages & Avis', desc: 'Carrousel des derniers avis clients vérifiés.', category: 'Avis' },
  triplePromo: { label: 'Triple Bannières', desc: 'Grille de 3 bannières promotionnelles côte à côte.', category: 'Bannières' },
  topRated: { label: 'Produits les Mieux Notés', desc: 'Sélection des produits ayant les meilleures évaluations.', category: 'Catalogue' },
  bestSellers: { label: 'Meilleures Ventes', desc: 'Classement des produits les plus commandés.', category: 'Catalogue' },
  routineVisualizer: { label: 'Visualiseur de Routine', desc: 'Présentation interactive étape par étape de la routine.', category: 'Expérience' },
  skincareRoutineSteps: { label: 'Étapes Routine', desc: 'Guide visuel Nettoyer > Traiter > Hydrater > Protéger.', category: 'Expérience' },
  featuredIngredient: { label: 'Marques Vedettes', desc: 'Focus éditorial sur une marque ou un ingrédient.', category: 'Marques' },
  activeIngredients: { label: 'Ingrédients Actifs', desc: 'Cartes des molécules dermatologiques principales.', category: 'Contenu' },
  ingredientDictionary: { label: 'Dictionnaire Clinique', desc: 'Moteur de recherche des ingrédients cosmétiques.', category: 'Contenu' },
  faq: { label: 'Foire Aux Questions (FAQ)', desc: 'Questions récurrentes pliables/dépliables.', category: 'Support' },
  officialDistributor: { label: 'Badge Distributeur', desc: 'Garantie d\'authenticité et distribution officielle.', category: 'Réassurance' },
  trustBar: { label: 'Barre Confiance', desc: 'Badges livraison 24/48h, paiement à la livraison, support.', category: 'Réassurance' },
  richText: { label: 'Texte Enrichi & Titre', desc: 'Bloc de contenu textuel libre avec formatage.', category: 'Contenu' },
};

export default function ContentSectionsPage() {
  const { currentUser, adminTheme, products } = useAdmin();
  const { settings, saveSettings } = useSettings();
  const { showToast } = useUi();
  const isDark = adminTheme === 'dark';
  const role = currentUser?.role ?? 'viewer';

  const canEdit = canEditContent(role as any);

  const [query, setQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<HomepageSectionItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state for editing
  const [titleFr, setTitleFr] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [subtitleFr, setSubtitleFr] = useState('');
  const [subtitleAr, setSubtitleAr] = useState('');
  const [ctaTextFr, setCtaTextFr] = useState('');
  const [ctaTextAr, setCtaTextAr] = useState('');
  const [ctaLink, setCtaLink] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [isVisible, setIsVisible] = useState(true);

  // Product Selection State (for productGrid / topRated / bestSellers)
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('ALL');
  const [isAddingProductOpen, setIsAddingProductOpen] = useState(false);
  const [targetSlotIndex, setTargetSlotIndex] = useState<number | null>(null);

  const sectionOrders = settings?.homepageSections?.sectionOrder || [];

  // Extract all unique brands for filter dropdown
  const allBrands = Array.from(new Set(products.map((p: any) => p.vendor).filter(Boolean))).sort() as string[];

  // Prepare full list of all 20 section types
  const fullSectionsList: HomepageSectionItem[] = Object.keys(SECTION_TYPE_MAP).map((type) => {
    const existing = sectionOrders.find(s => s.type === type || s.id === type);
    const meta = SECTION_TYPE_MAP[type];
    return {
      id: existing?.id || type,
      type: type,
      nameFr: existing?.nameFr || meta.label,
      visible: existing?.visible ?? true,
      settings: {
        titleFr: existing?.settings?.titleFr || meta.label,
        titleAr: existing?.settings?.titleAr || meta.label,
        descFr: existing?.settings?.descFr || meta.desc,
        descAr: existing?.settings?.descAr || meta.desc,
        ...(existing?.settings || {}),
      },
    };
  });

  const filtered = fullSectionsList.filter(s => {
    const meta = SECTION_TYPE_MAP[s.type] ?? { label: s.type, desc: '', category: '' };
    const secTitle = s.settings?.titleFr || s.nameFr || meta.label;
    return (
      !query ||
      secTitle.toLowerCase().includes(query.toLowerCase()) ||
      meta.label.toLowerCase().includes(query.toLowerCase()) ||
      s.type.toLowerCase().includes(query.toLowerCase())
    );
  });

  const handleOpenEdit = (sec: HomepageSectionItem) => {
    const meta = SECTION_TYPE_MAP[sec.type] ?? { label: sec.type, desc: '' };
    setSelectedSection(sec);
    setTitleFr(sec.settings?.titleFr || sec.nameFr || meta.label);
    setTitleAr(sec.settings?.titleAr || meta.label);
    setSubtitleFr(sec.settings?.descFr || meta.desc);
    setSubtitleAr(sec.settings?.descAr || meta.desc);
    setCtaTextFr(sec.settings?.ctaTextFr || '');
    setCtaTextAr(sec.settings?.ctaTextAr || '');
    setCtaLink(sec.settings?.ctaLink || '');
    setHtmlContent(sec.settings?.html || '');
    setIsVisible(sec.visible ?? true);

    // Load pinned product IDs for productGrid
    const existingProductIds = sec.settings?.productIds || (sec.type === 'productGrid' ? settings.featuredProductIds : []) || [];
    setSelectedProductIds(existingProductIds);
    setProductSearch('');
    setBrandFilter('ALL');
    setIsAddingProductOpen(false);
    setTargetSlotIndex(null);
  };

  const handleSaveSection = async () => {
    if (!selectedSection) return;
    setIsSaving(true);

    try {
      const currentOrders = [...(settings.homepageSections?.sectionOrder || [])];
      const existingIdx = currentOrders.findIndex(s => s.type === selectedSection.type || s.id === selectedSection.id);

      const updatedSection: HomepageSectionItem = {
        ...selectedSection,
        nameFr: titleFr || selectedSection.nameFr,
        visible: isVisible,
        settings: {
          ...(selectedSection.settings || {}),
          titleFr,
          titleAr,
          descFr: subtitleFr,
          descAr: subtitleAr,
          ctaTextFr,
          ctaTextAr,
          ctaLink,
          html: htmlContent,
          productIds: selectedProductIds,
        },
      };

      if (existingIdx >= 0) {
        currentOrders[existingIdx] = updatedSection;
      } else {
        currentOrders.push(updatedSection);
      }

      // Also sync to featuredProductIds if productGrid
      const updatedSettings = {
        ...settings,
        ...(selectedSection.type === 'productGrid' ? { featuredProductIds: selectedProductIds } : {}),
        homepageSections: {
          ...(settings.homepageSections || {}),
          sectionOrder: currentOrders,
        },
      };

      await saveSettings(updatedSettings);

      showToast(`Section "${titleFr || selectedSection.type}" sauvegardée !`, 'success');
      setSelectedSection(null);
    } catch (e: any) {
      console.error(e);
      showToast("Erreur lors de la sauvegarde.", 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddProductToSlot = (productId: number) => {
    if (selectedProductIds.includes(productId)) return;

    if (targetSlotIndex !== null && targetSlotIndex < 16) {
      const copy = [...selectedProductIds];
      copy[targetSlotIndex] = productId;
      setSelectedProductIds(copy.filter(Boolean));
    } else if (selectedProductIds.length < 16) {
      setSelectedProductIds(prev => [...prev, productId]);
    }
    setIsAddingProductOpen(false);
    setTargetSlotIndex(null);
    setProductSearch('');
  };

  if (!canEdit) {
    return <div style={{ padding: '40px', textAlign: 'center' }}><p style={{ fontSize: '14px', color: isDark ? '#475569' : '#94a3b8' }}>Accès refusé.</p></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black" style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>Bibliothèque de Sections</h1>
          <p className="text-xs mt-1" style={{ color: isDark ? '#64748b' : '#64748b' }}>
            Catalogue et personnalisation du contenu des {fullSectionsList.length} types de blocs réutilisables.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: isDark ? '#475569' : '#94a3b8' }} />
        <input
          type="text"
          placeholder="Rechercher un type de section..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-xl text-xs outline-none border transition focus:ring-2 focus:ring-emerald-500/20"
          style={{
            borderColor: isDark ? 'rgba(255,255,255,0.09)' : '#e2e8f0',
            background: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
            color: isDark ? '#e2e8f0' : '#0f172a',
          }}
        />
      </div>

      {/* Grid of sections */}
      {filtered.length === 0 ? (
        <EmptyState title="Aucune section trouvée" description="Modifiez votre recherche." icon={Layers} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(sec => {
            const meta = SECTION_TYPE_MAP[sec.type] ?? { label: sec.type, desc: '', category: 'Général' };
            const displayTitle = sec.settings?.titleFr || sec.nameFr || meta.label;
            const displayDesc = sec.settings?.descFr || meta.desc;

            return (
              <div
                key={sec.id}
                onClick={() => handleOpenEdit(sec)}
                className="group relative rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col hover:shadow-lg hover:-translate-y-0.5 overflow-hidden"
                style={{
                  borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
                  background: isDark ? 'rgba(15, 23, 42, 0.6)' : '#ffffff',
                  minHeight: '160px',
                }}
              >
                {/* Card body — grows to fill available space */}
                <div className="flex-1 p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border truncate max-w-[55%]" style={{
                      backgroundColor: isDark ? 'rgba(16,185,129,0.12)' : '#ecfdf5',
                      color: isDark ? '#34d399' : '#047857',
                      borderColor: isDark ? 'rgba(16,185,129,0.25)' : '#a7f3d0',
                    }}>
                      {sec.type}
                    </span>
                    <span 
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0"
                      style={{
                        background: sec.visible
                          ? (isDark ? 'rgba(16,185,129,0.15)' : '#ecfdf5')
                          : (isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9'),
                        color: sec.visible
                          ? (isDark ? '#34d399' : '#047857')
                          : (isDark ? '#94a3b8' : '#475569'),
                        border: sec.visible
                          ? (isDark ? '1px solid rgba(16,185,129,0.3)' : '1px solid #a7f3d0')
                          : (isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1'),
                      }}
                    >
                      {sec.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {sec.visible ? 'Visible' : 'Masqué'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold group-hover:text-emerald-600 transition-colors line-clamp-1" style={{ color: isDark ? '#f8fafc' : '#0f172a' }}>
                      {displayTitle}
                    </h3>
                    <p className="text-xs line-clamp-2 mt-1 leading-relaxed" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                      {displayDesc}
                    </p>
                  </div>
                </div>

                {/* Card footer — always at bottom, always inside card */}
                <div className="px-4 py-2.5 border-t flex items-center justify-between shrink-0" style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9', background: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc' }}>
                  <span className="text-[10px] font-mono" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
                    {meta.category}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 group-hover:translate-x-0.5 transition-transform">
                    <Edit3 className="w-3.5 h-3.5" /> Modifier
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SHOPIFY-PLUS LEVEL SECTION EDIT MODAL */}
      {selectedSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-fade-in overflow-hidden">
          <div 
            className="relative w-full max-w-5xl max-h-[94vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden"
            style={{
              backgroundColor: isDark ? '#0b1329' : '#ffffff',
              borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0',
              color: isDark ? '#f8fafc' : '#0f172a',
            }}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b flex items-center justify-between shrink-0" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9' }}>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 shrink-0">
                  <LayoutGrid className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-black tracking-tight">{titleFr || selectedSection.type}</h2>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      {selectedSection.type}
                    </span>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                    Éditeur professionnel de section · Configurez le titre, les 16 produits vedettes et la visibilité en direct.
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setSelectedSection(null)}
                className="w-9 h-9 rounded-full flex items-center justify-center transition hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">

              {/* Visibility Toggle Bar */}
              <div className="p-4 rounded-2xl border flex items-center justify-between shadow-sm" style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc',
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
              }}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isVisible ? 'bg-emerald-500/15 text-emerald-600' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                    {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider block">Statut d&apos;affichage sur la boutique</span>
                    <span className="text-xs" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                      {isVisible ? 'Section publiée et visible par vos visiteurs sur la page d\'accueil' : 'Section masquée du storefront (Brouillon)'}
                    </span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isVisible}
                    onChange={e => setIsVisible(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6.5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5.5 after:w-5.5 after:transition-all peer-checked:bg-emerald-500 shadow-inner"></div>
                </label>
              </div>

              {/* SHOPIFY-PLUS 16 FEATURED PRODUCTS VISUAL SLOT BOARD */}
              {(selectedSection.type === 'productGrid' || selectedSection.type === 'topRated' || selectedSection.type === 'bestSellers' || selectedSection.type === 'summerSale') && (
                <div className="p-5 rounded-3xl border space-y-5" style={{
                  backgroundColor: isDark ? 'rgba(15,23,42,0.6)' : '#ffffff',
                  borderColor: isDark ? 'rgba(16,185,129,0.2)' : '#e2e8f0',
                  boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.3)' : '0 10px 30px rgba(0,0,0,0.03)',
                }}>
                  {/* Panel Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                        <Package className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-black tracking-tight">Grille des 16 Produits Vedettes</h3>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            {selectedProductIds.length} / 16 Remplis
                          </span>
                        </div>
                        <p className="text-xs" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                          Sélectionnez et ordonnez les 16 produits affichés dans cette section sur votre boutique.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => { setIsAddingProductOpen(true); setTargetSlotIndex(null); }}
                      disabled={selectedProductIds.length >= 16}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-emerald-500/20 transition cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                    >
                      <Plus className="w-4 h-4" /> Ajouter un produit
                    </button>
                  </div>

                  {/* 16 Visual Grid Slots */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {Array.from({ length: 16 }).map((_, slotIdx) => {
                      const pid = selectedProductIds[slotIdx];
                      const prod = pid ? products.find((p: any) => p.id === pid) : null;

                      if (prod) {
                        return (
                          <div
                            key={`visual-slot-${slotIdx}-${prod.id}`}
                            className="group relative p-3 rounded-2xl border transition-all duration-200 flex flex-col justify-between hover:shadow-md"
                            style={{
                              backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
                              borderColor: isDark ? 'rgba(16,185,129,0.3)' : '#cbd5e1',
                            }}
                          >
                            {/* Slot header */}
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                Slot #{slotIdx + 1}
                              </span>
                              <div className="flex items-center gap-0.5">
                                <button
                                  type="button"
                                  disabled={slotIdx === 0}
                                  onClick={() => {
                                    const arr = [...selectedProductIds];
                                    const tmp = arr[slotIdx];
                                    arr[slotIdx] = arr[slotIdx - 1];
                                    arr[slotIdx - 1] = tmp;
                                    setSelectedProductIds(arr);
                                  }}
                                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20 text-slate-400 hover:text-slate-600"
                                >
                                  <ChevronUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  disabled={slotIdx === selectedProductIds.length - 1}
                                  onClick={() => {
                                    const arr = [...selectedProductIds];
                                    const tmp = arr[slotIdx];
                                    arr[slotIdx] = arr[slotIdx + 1];
                                    arr[slotIdx + 1] = tmp;
                                    setSelectedProductIds(arr);
                                  }}
                                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20 text-slate-400 hover:text-slate-600"
                                >
                                  <ChevronDown className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setSelectedProductIds(prev => prev.filter((_, i) => i !== slotIdx))}
                                  className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 ml-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Product preview card */}
                            <div className="flex gap-2.5 items-center">
                              <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border relative shrink-0">
                                <Image src={prod.image || '/placeholder.png'} alt="" fill className="object-contain p-0.5" sizes="48px" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-[9px] font-extrabold uppercase text-emerald-600 truncate">{prod.vendor || 'Marque'}</p>
                                <h5 className="text-xs font-bold leading-snug line-clamp-1" style={{ color: isDark ? '#f8fafc' : '#0f172a' }}>
                                  {prod.nameFr || prod.title || prod.name}
                                </h5>
                                <p className="text-[11px] font-mono font-bold mt-0.5 text-slate-500">{prod.price} DH</p>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={`empty-slot-${slotIdx}`}
                          onClick={() => { setIsAddingProductOpen(true); setTargetSlotIndex(slotIdx); }}
                          className="group p-4 rounded-2xl border border-dashed transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-1.5 min-h-[100px] hover:border-emerald-500 hover:bg-emerald-500/5"
                          style={{
                            borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#cbd5e1',
                            backgroundColor: isDark ? 'rgba(255,255,255,0.01)' : '#f8fafc',
                          }}
                        >
                          <span className="text-[10px] font-mono font-bold text-slate-400 group-hover:text-emerald-500">
                            Slot #{slotIdx + 1}
                          </span>
                          <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Plus className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 group-hover:text-emerald-600">
                            Choisir un produit
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* QUICK PRODUCT PICKER DRAWER / MODAL OVERLAY */}
              {isAddingProductOpen && (
                <div className="p-4 rounded-3xl border space-y-4 bg-white dark:bg-slate-900 border-emerald-500/40 shadow-2xl animate-fade-in">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-500" />
                      <h4 className="text-xs font-black uppercase tracking-wider">
                        {targetSlotIndex !== null ? `Choisir le produit pour le Slot #${targetSlotIndex + 1}` : 'Ajouter un produit aux Produits Vedettes'}
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setIsAddingProductOpen(false); setTargetSlotIndex(null); setProductSearch(''); }}
                      className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Filter & Search Bar */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        autoFocus
                        value={productSearch}
                        onChange={e => setProductSearch(e.target.value)}
                        placeholder="Rechercher par nom de produit..."
                        className="w-full pl-9 pr-4 py-2 text-xs font-bold rounded-xl border outline-none bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                      />
                    </div>
                    <select
                      value={brandFilter}
                      onChange={e => setBrandFilter(e.target.value)}
                      className="px-3 py-2 text-xs font-bold rounded-xl border outline-none bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 shrink-0"
                    >
                      <option value="ALL">Toutes les marques ({allBrands.length})</option>
                      {allBrands.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>

                  {/* Product Options List */}
                  <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-100 dark:border-slate-800">
                    {products
                      .filter((p: any) => {
                        const title = (p.nameFr || p.title || p.name || '').toLowerCase();
                        const vendor = (p.vendor || '').toLowerCase();
                        const q = productSearch.toLowerCase();
                        const matchBrand = brandFilter === 'ALL' || p.vendor === brandFilter;
                        return !selectedProductIds.includes(p.id) && matchBrand && (!q || title.includes(q) || vendor.includes(q));
                      })
                      .slice(0, 20)
                      .map((p: any) => (
                        <div
                          key={`select-opt-${p.id}`}
                          onClick={() => handleAddProductToSlot(p.id)}
                          className="flex items-center justify-between p-3 text-left hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition cursor-pointer group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl relative overflow-hidden shrink-0 bg-slate-100 border">
                              <Image src={p.image || '/placeholder.png'} alt="" fill className="object-contain p-0.5" sizes="40px" />
                            </div>
                            <div className="truncate">
                              <p className="text-[10px] font-bold uppercase text-emerald-600">{p.vendor}</p>
                              <h5 className="text-xs font-bold truncate" style={{ color: isDark ? '#f8fafc' : '#0f172a' }}>
                                {p.nameFr || p.title || p.name}
                              </h5>
                              <p className="text-[10px] text-slate-400 font-mono">{p.price} DH · Stock: {p.stock ?? 'Dispo'}</p>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-white px-3 py-1.5 rounded-xl bg-emerald-600 group-hover:bg-emerald-500 shadow-sm transition shrink-0 flex items-center gap-1">
                            <Plus className="w-3.5 h-3.5" /> Sélectionner
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Bilingual Title & Subtitle */}
              <div className="space-y-4">
                <BilingualField
                  label="Titre principal de la section"
                  valueFr={titleFr}
                  valueAr={titleAr}
                  onChangeFr={setTitleFr}
                  onChangeAr={setTitleAr}
                />

                <BilingualField
                  label="Sous-titre / Description"
                  valueFr={subtitleFr}
                  valueAr={subtitleAr}
                  onChangeFr={setSubtitleFr}
                  onChangeAr={setSubtitleAr}
                />
              </div>

              {/* Action Button / CTA Settings */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-extrabold uppercase tracking-wider block" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                  Bouton d'Action (Optionnel)
                </span>
                <BilingualField
                  label="Texte du bouton CTA"
                  valueFr={ctaTextFr}
                  valueAr={ctaTextAr}
                  onChangeFr={setCtaTextFr}
                  onChangeAr={setCtaTextAr}
                />

                <div>
                  <label className="text-[10px] font-extrabold uppercase tracking-wider block mb-1" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                    Lien de destination du bouton (ex: /promotions ou /catalogue)
                  </label>
                  <input
                    type="text"
                    value={ctaLink}
                    onChange={e => setCtaLink(e.target.value)}
                    placeholder="/catalogue"
                    className="w-full px-3 py-2 text-xs rounded-xl border outline-none focus:ring-2 focus:ring-emerald-500/20"
                    style={{
                      borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                      backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
                      color: isDark ? '#f8fafc' : '#0f172a',
                    }}
                  />
                </div>
              </div>

              {/* Custom HTML / Text Content for richText or banner sections */}
              {(selectedSection.type === 'richText' || selectedSection.type === 'dermoCorner') && (
                <div className="space-y-1.5 pt-2">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider block" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                    Contenu Textuel Enrichi / HTML
                  </label>
                  <textarea
                    rows={4}
                    value={htmlContent}
                    onChange={e => setHtmlContent(e.target.value)}
                    placeholder="Saisissez du contenu HTML ou textuel personnalisé..."
                    className="w-full p-3 text-xs rounded-xl border outline-none font-mono focus:ring-2 focus:ring-emerald-500/20"
                    style={{
                      borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                      backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
                      color: isDark ? '#f8fafc' : '#0f172a',
                    }}
                  />
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t flex items-center justify-end gap-3 shrink-0" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9' }}>
              <button
                type="button"
                onClick={() => setSelectedSection(null)}
                className="px-4 py-2 text-xs font-bold rounded-xl transition hover:bg-slate-100 dark:hover:bg-slate-800"
                style={{ color: isDark ? '#94a3b8' : '#64748b' }}
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSaveSection}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-emerald-500/25 hover:shadow-lg hover:shadow-emerald-500/35 transition-all duration-200 cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
