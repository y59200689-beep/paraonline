'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { useSettings, HomepageSectionItem } from '@/context/SettingsContext';
import { useUi } from '@/context/UiContext';
import { canEditContent } from '@/lib/permissions';
import { Layers, Search, Eye, EyeOff, Edit3, X, Save, Sparkles } from 'lucide-react';
import { BilingualField } from '@/components/admin/ui/BilingualField';
import { EmptyState } from '@/components/admin/ui/EmptyState';

const SECTION_TYPE_MAP: Record<string, { label: string; desc: string; category: string }> = {
  hero: { label: 'Héro Carrousel', desc: 'Bannière principale avec diaporama d\'images et boutons d\'action.', category: 'En-tête' },
  categoryTrack: { label: 'Barre Catégories', desc: 'Barre de défilement horizontale des catégories avec icônes.', category: 'Navigation' },
  productGrid: { label: 'Grille Produits', desc: 'Sélection dynamique de produits par catégorie ou mot-clé.', category: 'Catalogue' },
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
  const { currentUser, adminTheme } = useAdmin();
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

  const sectionOrders = settings?.homepageSections?.sectionOrder || [];

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
        },
      };

      if (existingIdx >= 0) {
        currentOrders[existingIdx] = updatedSection;
      } else {
        currentOrders.push(updatedSection);
      }

      await saveSettings({
        ...settings,
        homepageSections: {
          ...(settings.homepageSections || {}),
          sectionOrder: currentOrders,
        },
      });

      showToast(`Section "${titleFr || selectedSection.type}" sauvegardée !`, 'success');
      setSelectedSection(null);
    } catch (e: any) {
      console.error(e);
      showToast("Erreur lors de la sauvegarde.", 'error');
    } finally {
      setIsSaving(false);
    }
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
                className="group relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between hover:shadow-lg hover:-translate-y-0.5"
                style={{
                  borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
                  background: isDark ? 'rgba(15, 23, 42, 0.6)' : '#ffffff',
                }}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border" style={{
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
                    <h3 className="text-sm font-bold group-hover:text-emerald-600 transition-colors" style={{ color: isDark ? '#f8fafc' : '#0f172a' }}>
                      {displayTitle}
                    </h3>
                    <p className="text-xs line-clamp-2 mt-1 leading-relaxed" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                      {displayDesc}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t flex items-center justify-between" style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9' }}>
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

      {/* EDIT SECTION MODAL */}
      {selectedSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div 
            className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden"
            style={{
              backgroundColor: isDark ? '#0f172a' : '#ffffff',
              borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
              color: isDark ? '#f8fafc' : '#0f172a',
            }}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b flex items-center justify-between shrink-0" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black">Éditer la section: {selectedSection.type}</h2>
                  <p className="text-xs" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                    Modifiez le titre, le texte et la visibilité de ce bloc.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSection(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center transition hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">

              {/* Visibility Toggle */}
              <div className="p-4 rounded-2xl border flex items-center justify-between" style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc',
                borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0',
              }}>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider block">Visibilité sur le site</span>
                  <span className="text-xs" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Afficher cette section sur la page d'accueil</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isVisible}
                    onChange={e => setIsVisible(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

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
