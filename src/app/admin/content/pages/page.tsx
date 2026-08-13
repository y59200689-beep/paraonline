'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/context/AdminContext';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { StickyPublishBar } from '@/components/admin/ui/StickyPublishBar';
import { SectionOutline, SectionOutlineItem } from '@/components/admin/ui/SectionOutline';
import { BilingualField } from '@/components/admin/ui/BilingualField';
import { EmptyState } from '@/components/admin/ui/EmptyState';
import { AsyncState } from '@/components/admin/ui/AsyncState';
import { requestJson } from '@/lib/request-json';
import { canEditContent, canPublishContent } from '@/lib/permissions';
import {
  Layout,
  Plus,
  Eye,
  Globe,
  Search,
  FileText,
  ChevronRight,
  ArrowLeft,
  Settings,
  List,
  Smartphone,
  Monitor,
  Clock,
  RotateCcw,
} from 'lucide-react';

type CmsStatus = 'draft' | 'scheduled' | 'published' | 'archived';

interface CmsPage {
  id: string;
  slug: string;
  page_type: string;
  title_fr: string | null;
  title_ar: string | null;
  status: CmsStatus;
  approval_status?: 'draft' | 'pending_review' | 'approved' | 'rejected';
  scheduled_at?: string | null;
  updated_at: string;
  updated_by: string;
  section_order: SectionOutlineItem[];
  seo_title_fr?: string;
  seo_title_ar?: string;
  seo_description_fr?: string;
  seo_description_ar?: string;
}

const PAGE_TYPE_LABELS: Record<string, string> = {
  home: 'Accueil',
  about: 'À propos',
  delivery: 'Suivi commande',
  checkout_success: 'Confirmation commande',
  checkout_failure: 'Paiement échoué',
  policies: 'Politiques',
  customer_portal: 'Espace client',
  custom: 'Page personnalisée',
};

const SECTION_TYPE_OPTIONS = [
  { type: 'hero',                label: 'Héro Carrousel' },
  { type: 'categoryTrack',       label: 'Barre Catégories' },
  { type: 'productGrid',         label: 'Grille Produits' },
  { type: 'brandPartners',       label: 'Marques Partenaires' },
  { type: 'diagnosticBanner',    label: 'Diagnostic IA Banner' },
  { type: 'summerSale',          label: 'Vente Été' },
  { type: 'dermoCorner',         label: 'Dermo Corner' },
  { type: 'customerReviews',     label: 'Avis Clients' },
  { type: 'triplePromo',         label: 'Triple Promo' },
  { type: 'topRated',            label: 'Produits Mieux Notés' },
  { type: 'bestSellers',         label: 'Meilleures Ventes' },
  { type: 'routineVisualizer',   label: 'Routine Visualiseur' },
  { type: 'skincareRoutineSteps','label': 'Étapes Routine' },
  { type: 'featuredIngredient',  label: 'Ingrédients Vedettes' },
  { type: 'activeIngredients',   label: 'Ingrédients Actifs' },
  { type: 'ingredientDictionary',label: 'Dictionnaire' },
  { type: 'faq',                 label: 'FAQ' },
  { type: 'officialDistributor', label: 'Distributeur Officiel' },
  { type: 'trustBar',            label: 'Barre Confiance' },
  { type: 'richText',            label: 'Texte Enrichi' },
  { type: 'horizontalPromo',     label: 'Promo Horizontale' },
];

// ──────────────────────────────────────────────────────────────────────────────
// List view
// ──────────────────────────────────────────────────────────────────────────────

function PagesList({ pages, onSelect, isDark, role }: {
  pages: CmsPage[];
  onSelect: (p: CmsPage) => void;
  isDark: boolean;
  role: string;
}) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CmsStatus | 'all'>('all');

  const filtered = pages.filter(p => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    const q = query.toLowerCase();
    return !q || (p.title_fr ?? '').toLowerCase().includes(q) || p.slug.includes(q);
  });

  const FILTERS: { label: string; value: CmsStatus | 'all' }[] = [
    { label: 'Toutes', value: 'all' },
    { label: 'Brouillon', value: 'draft' },
    { label: 'Planifiées', value: 'scheduled' },
    { label: 'Publiées', value: 'published' },
    { label: 'Archivées', value: 'archived' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '200px', maxWidth: '320px' }}>
          <Search className="w-3.5 h-3.5" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: isDark ? '#475569' : '#94a3b8' }} />
          <input
            type="text"
            placeholder="Rechercher une page…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '7px 10px 7px 30px',
              fontSize: '12px',
              borderRadius: 'var(--admin-radius)',
              border: isDark ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(0,0,0,0.1)',
              background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
              color: isDark ? '#e2e8f0' : '#0f172a',
              outline: 'none',
            }}
          />
        </div>

        {/* Status filters */}
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              style={{
                padding: '5px 12px',
                fontSize: '11px',
                fontWeight: 600,
                borderRadius: '999px',
                border: statusFilter === f.value ? (isDark ? '1px solid rgba(16,185,129,0.35)' : '1px solid rgba(16,185,129,0.4)') : (isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)'),
                background: statusFilter === f.value ? (isDark ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.08)') : 'transparent',
                color: statusFilter === f.value ? (isDark ? '#34d399' : '#047857') : (isDark ? '#64748b' : '#64748b'),
                cursor: 'pointer',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ borderRadius: 'var(--admin-radius-lg)', overflow: 'hidden', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.07)', background: isDark ? 'rgba(255,255,255,0.01)' : '#ffffff' }}>
        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 120px 120px', gap: '0', padding: '8px 16px', background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.06)' }}>
          {['Page', 'Type', 'Statut', 'Modifié le'].map(h => (
            <span key={h} style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: isDark ? '#334155' : '#64748b' }}>{h}</span>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center' }}>
            <EmptyState title="Aucune page trouvée" description="Ajustez vos filtres ou créez une nouvelle page." icon={FileText} />
          </div>
        ) : (
          filtered.map((page, idx) => (
            <div
              key={page.id}
              onClick={() => onSelect(page)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && onSelect(page)}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 140px 120px 120px',
                gap: '0',
                padding: '12px 16px',
                cursor: 'pointer',
                borderBottom: idx < filtered.length - 1 ? (isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(0,0,0,0.05)') : 'none',
                transition: 'background 0.12s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: isDark ? '#e2e8f0' : '#0f172a', margin: 0 }}>{page.title_fr ?? page.slug}</p>
                <p style={{ fontSize: '10px', color: isDark ? '#475569' : '#94a3b8', margin: '2px 0 0', fontFamily: 'monospace' }}>/{page.slug}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: isDark ? '#64748b' : '#94a3b8' }}>{PAGE_TYPE_LABELS[page.page_type] ?? page.page_type}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <StatusBadge status={page.status} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: isDark ? '#475569' : '#64748b' }}>
                  {page.updated_at && !isNaN(new Date(page.updated_at).getTime())
                    ? new Date(page.updated_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
                    : 'Aujourd\'hui'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Detail editor
// ──────────────────────────────────────────────────────────────────────────────

function PageEditor({ page, onBack, isDark, role }: {
  page: CmsPage;
  onBack: () => void;
  isDark: boolean;
  role: string;
}) {
  const [titleFr, setTitleFr] = useState(page.title_fr ?? '');
  const [titleAr, setTitleAr] = useState(page.title_ar ?? '');
  const [seoTitleFr, setSeoTitleFr] = useState(page.seo_title_fr ?? '');
  const [seoTitleAr, setSeoTitleAr] = useState(page.seo_title_ar ?? '');
  const [seoDescFr, setSeoDescFr] = useState(page.seo_description_fr ?? '');
  const [seoDescAr, setSeoDescAr] = useState(page.seo_description_ar ?? '');
  const [sections, setSections] = useState<SectionOutlineItem[]>(page.section_order ?? []);
  const [activeSection, setActiveSection] = useState<string | null>(sections[0]?.id ?? null);
  const [status, setStatus] = useState<CmsStatus>(page.status);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [activePanel, setActivePanel] = useState<'sections' | 'seo'>('sections');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [addSectionOpen, setAddSectionOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [revisions, setRevisions] = useState<Array<{ id: string; saved_by: string; created_at: string; changed_fields?: string[] }>>([]);

  const markDirty = useCallback(() => setIsDirty(true), []);

  const handleSave = useCallback(async (newStatus?: CmsStatus, approvalAction?: 'submit_for_approval', scheduledAt?: string) => {
    setIsSaving(true);
    try {
      const body = {
        id: page.id,
        title_fr: titleFr,
        title_ar: titleAr,
        seo_title_fr: seoTitleFr,
        seo_title_ar: seoTitleAr,
        seo_description_fr: seoDescFr,
        seo_description_ar: seoDescAr,
        section_order: sections,
        status: newStatus ?? status,
        ...(approvalAction ? { approval_action: approvalAction } : {}),
        ...(scheduledAt ? { scheduled_at: new Date(scheduledAt).toISOString() } : {}),
      };
      const res = await fetch('/api/cms/pages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        if (newStatus) setStatus(newStatus);
        setIsDirty(false);
        setLastSavedAt(new Date());
      }
    } finally {
      setIsSaving(false);
    }
  }, [page.id, titleFr, titleAr, seoTitleFr, seoTitleAr, seoDescFr, seoDescAr, sections, status]);

  const handleSchedule = useCallback((datetime: string) => {
    void handleSave('scheduled', undefined, datetime).then(() => undefined);
  }, [handleSave]);

  const loadHistory = useCallback(async () => {
    const res = await fetch(`/api/cms/pages/${page.id}/revisions`);
    if (res.ok) {
      const body = await res.json();
      setRevisions(body.revisions ?? []);
      setHistoryOpen(true);
    }
  }, [page.id]);

  const handlePreview = useCallback(async () => {
    const res = await fetch('/api/cms/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entity_type: 'page', entity_id: page.id, snapshot: { section_order: sections } }),
    });
    if (res.ok) {
      const { token } = await res.json();
      window.open(`/${page.slug}?preview_token=${token}`, '_blank');
    }
  }, [page.id, page.slug, sections]);

  const addSection = (type: string) => {
    const label = SECTION_TYPE_OPTIONS.find(s => s.type === type)?.label ?? type;
    const newSection: SectionOutlineItem = {
      id: `${type}-${Date.now()}`,
      type,
      nameFr: label,
      visible: true,
    };
    setSections(prev => [...prev, newSection]);
    setActiveSection(newSection.id);
    setAddSectionOpen(false);
    markDirty();
  };

  const panelBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: '6px 14px',
    fontSize: '11px',
    fontWeight: 600,
    borderRadius: 'var(--admin-radius)',
    border: 'none',
    cursor: 'pointer',
    background: active ? (isDark ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.08)') : 'transparent',
    color: active ? (isDark ? '#34d399' : '#047857') : (isDark ? '#64748b' : '#94a3b8'),
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0', height: '100%', minHeight: 0 }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: isDark ? '#475569' : '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <ArrowLeft className="w-3.5 h-3.5" /> Pages
        </button>
        <ChevronRight className="w-3 h-3" style={{ color: isDark ? '#334155' : '#cbd5e1' }} />
        <span style={{ fontSize: '12px', fontWeight: 700, color: isDark ? '#e2e8f0' : '#0f172a' }}>{page.title_fr ?? page.slug}</span>
        <StatusBadge status={status} />
      </div>

      {/* Sticky save bar */}
      <StickyPublishBar
        status={status}
        isDirty={isDirty}
        isSaving={isSaving}
        lastSavedAt={lastSavedAt}
        onSaveDraft={() => handleSave('draft')}
        onPreview={handlePreview}
        onPublish={() => handleSave(canPublishContent(role as any) ? 'published' : 'draft', canPublishContent(role as any) ? undefined : 'submit_for_approval')}
        onSchedule={handleSchedule}
        requiresApproval={!canPublishContent(role as any)}
      />

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
        <button type="button" onClick={loadHistory} style={{ border: '1px solid rgba(100,116,139,.25)', borderRadius: 10, padding: '7px 12px', background: 'transparent', color: isDark ? '#cbd5e1' : '#475569', fontSize: 12, fontWeight: 700 }}>
          <RotateCcw className="w-3.5 h-3.5 inline mr-1" /> Historique des versions
        </button>
      </div>

      {historyOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(15,23,42,.4)', display: 'grid', placeItems: 'center', padding: 20 }} onClick={() => setHistoryOpen(false)}>
          <div onClick={e => e.stopPropagation()} style={{ width: 'min(620px, 100%)', maxHeight: '80vh', overflow: 'auto', borderRadius: 18, background: isDark ? '#111827' : '#fff', padding: 22, boxShadow: '0 24px 80px rgba(15,23,42,.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div><h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Historique des versions</h3><p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>Auteur, date et champs modifiés</p></div>
              <button type="button" onClick={() => setHistoryOpen(false)} style={{ border: 0, background: 'transparent', color: '#64748b', fontSize: 20 }}>×</button>
            </div>
            {revisions.length === 0 ? <p style={{ color: '#64748b', fontSize: 13 }}>Aucune version enregistrée.</p> : revisions.map(revision => (
              <div key={revision.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderTop: '1px solid rgba(148,163,184,.18)', padding: '13px 0' }}>
                <div><div style={{ fontSize: 13, fontWeight: 700 }}>{new Date(revision.created_at).toLocaleString('fr-FR')}</div><div style={{ fontSize: 11, color: '#64748b' }}>par {revision.saved_by} · {(revision.changed_fields ?? []).join(', ') || 'contenu'}</div></div>
                <button type="button" onClick={async () => { if (!window.confirm('Restaurer cette version ? Elle sera restaurée comme brouillon.')) return; const res = await fetch(`/api/cms/pages/${page.id}/revisions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ revision_id: revision.id }) }); if (res.ok) window.location.reload(); }} style={{ border: '1px solid rgba(16,185,129,.35)', borderRadius: 9, padding: '6px 10px', background: 'rgba(16,185,129,.08)', color: '#047857', fontSize: 11, fontWeight: 700 }}>Restaurer</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3-column editor layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 320px', gap: '16px', flex: 1, minHeight: 0, overflow: 'hidden' }}>

        {/* Left panel — section outline */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 'var(--admin-radius-lg)',
          border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.07)',
          background: isDark ? 'rgba(255,255,255,0.01)' : '#fafafa',
          overflow: 'hidden',
        }}>
          {/* Panel tabs */}
          <div style={{ display: 'flex', gap: '4px', padding: '8px', borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.06)' }}>
            <button style={panelBtnStyle(activePanel === 'sections')} onClick={() => setActivePanel('sections')}><List className="w-3 h-3 inline mr-1" />Sections</button>
            <button style={panelBtnStyle(activePanel === 'seo')} onClick={() => setActivePanel('seo')}><Globe className="w-3 h-3 inline mr-1" />SEO</button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
            {activePanel === 'sections' ? (
              <>
                <SectionOutline
                  sections={sections}
                  activeId={activeSection}
                  onSelect={setActiveSection}
                  onReorder={s => { setSections(s); markDirty(); }}
                  onToggleVisible={id => { setSections(prev => prev.map(s => s.id === id ? { ...s, visible: !s.visible } : s)); markDirty(); }}
                  onDuplicate={id => {
                    const src = sections.find(s => s.id === id);
                    if (!src) return;
                    const dup = { ...src, id: `${src.type}-${Date.now()}`, nameFr: `${src.nameFr} (copie)` };
                    setSections(prev => [...prev, dup]);
                    markDirty();
                  }}
                  onDelete={id => { setSections(prev => prev.filter(s => s.id !== id)); markDirty(); }}
                />

                {/* Add section */}
                <div style={{ marginTop: '8px', position: 'relative' }}>
                  <button
                    onClick={() => setAddSectionOpen(o => !o)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '7px', borderRadius: 'var(--admin-radius)', border: isDark ? '1px dashed rgba(255,255,255,0.1)' : '1px dashed rgba(0,0,0,0.12)', background: 'transparent', cursor: 'pointer', fontSize: '11px', fontWeight: 600, color: isDark ? '#475569' : '#94a3b8' }}
                  >
                    <Plus className="w-3.5 h-3.5" /> Ajouter une section
                  </button>
                  {addSectionOpen && (
                    <>
                      <div onClick={() => setAddSectionOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
                      <div style={{
                        position: 'absolute',
                        left: 0,
                        bottom: '100%',
                        marginBottom: '4px',
                        width: '220px',
                        maxHeight: '260px',
                        overflowY: 'auto',
                        borderRadius: 'var(--admin-radius-lg)',
                        background: isDark ? 'hsl(224,28%,9%)' : '#fff',
                        border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.09)',
                        boxShadow: '0 16px 48px rgba(0,0,0,0.2)',
                        zIndex: 50,
                        padding: '4px',
                      }}>
                        {SECTION_TYPE_OPTIONS.map(opt => (
                          <button
                            key={opt.type}
                            onClick={() => addSection(opt.type)}
                            style={{ display: 'block', width: '100%', textAlign: 'left', padding: '7px 10px', fontSize: '12px', fontWeight: 500, borderRadius: 'var(--admin-radius)', border: 'none', background: 'transparent', cursor: 'pointer', color: isDark ? '#94a3b8' : '#334155' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              /* SEO panel */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <BilingualField
                  label="Titre SEO"
                  valueFr={seoTitleFr} valueAr={seoTitleAr}
                  onChangeFr={v => { setSeoTitleFr(v); markDirty(); }}
                  onChangeAr={v => { setSeoTitleAr(v); markDirty(); }}
                  placeholder={{ fr: 'Titre de la page…', ar: 'عنوان الصفحة…' }}
                />
                <BilingualField
                  label="Méta-description"
                  valueFr={seoDescFr} valueAr={seoDescAr}
                  onChangeFr={v => { setSeoDescFr(v); markDirty(); }}
                  onChangeAr={v => { setSeoDescAr(v); markDirty(); }}
                  multiline rows={3}
                  placeholder={{ fr: 'Description pour les moteurs de recherche…', ar: 'وصف لمحركات البحث…' }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Center — section config form */}
        <div style={{
          borderRadius: 'var(--admin-radius-lg)',
          border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.07)',
          background: isDark ? 'rgba(255,255,255,0.01)' : '#fafafa',
          overflowY: 'auto',
          padding: '20px',
        }}>
          <BilingualField
            label="Titre de la page"
            valueFr={titleFr} valueAr={titleAr}
            onChangeFr={v => { setTitleFr(v); markDirty(); }}
            onChangeAr={v => { setTitleAr(v); markDirty(); }}
            placeholder={{ fr: 'Nom de la page…', ar: 'اسم الصفحة…' }}
          />

          {activeSection && (
            <div style={{ marginTop: '24px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: isDark ? '#334155' : '#94a3b8', marginBottom: '12px' }}>
                Configuration de la section
              </p>
              <div style={{ padding: '16px', borderRadius: 'var(--admin-radius-lg)', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.07)', background: isDark ? 'rgba(255,255,255,0.02)' : '#fff' }}>
                {(() => {
                  const sec = sections.find(s => s.id === activeSection);
                  if (!sec) return <p style={{ fontSize: '12px', color: isDark ? '#475569' : '#94a3b8' }}>Sélectionnez une section dans le panneau gauche.</p>;
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: isDark ? '#e2e8f0' : '#0f172a' }}>{sec.nameFr}</span>
                        <span style={{ fontSize: '10px', fontFamily: 'monospace', color: isDark ? '#334155' : '#94a3b8' }}>{sec.type}</span>
                      </div>
                      <p style={{ fontSize: '12px', color: isDark ? '#475569' : '#94a3b8', margin: 0 }}>
                        La configuration avancée pour ce type de section sera disponible dans la prochaine mise à jour. Les paramètres de visibilité et l&apos;ordre sont gérés dans le panneau gauche.
                      </p>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>

        {/* Right — preview pane */}
        <div style={{
          borderRadius: 'var(--admin-radius-lg)',
          border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.07)',
          background: isDark ? 'rgba(255,255,255,0.01)' : '#fafafa',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Preview toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.06)' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: isDark ? '#334155' : '#94a3b8' }}>Aperçu</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button onClick={() => setPreviewDevice('desktop')} style={{ padding: '4px', border: 'none', background: previewDevice === 'desktop' ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)') : 'transparent', borderRadius: '6px', cursor: 'pointer', color: isDark ? '#64748b' : '#94a3b8' }}>
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setPreviewDevice('mobile')} style={{ padding: '4px', border: 'none', background: previewDevice === 'mobile' ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)') : 'transparent', borderRadius: '6px', cursor: 'pointer', color: isDark ? '#64748b' : '#94a3b8' }}>
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Sections list summary */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: isDark ? '#334155' : '#94a3b8', marginBottom: '8px' }}>
              Sections visibles ({sections.filter(s => s.visible).length}/{sections.length})
            </p>
            {sections.filter(s => s.visible).map((s, i) => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', borderRadius: 'var(--admin-radius)', marginBottom: '3px', background: s.id === activeSection ? (isDark ? 'rgba(16,185,129,0.07)' : 'rgba(16,185,129,0.05)') : 'transparent', cursor: 'pointer' }} onClick={() => setActiveSection(s.id)}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: isDark ? '#334155' : '#cbd5e1', minWidth: '18px' }}>{i + 1}</span>
                <span style={{ fontSize: '12px', fontWeight: 500, color: isDark ? '#94a3b8' : '#475569', flex: 1 }}>{s.nameFr}</span>
              </div>
            ))}
            {sections.filter(s => s.visible).length === 0 && (
              <p style={{ fontSize: '12px', color: isDark ? '#334155' : '#94a3b8', textAlign: 'center', padding: '20px 0' }}>Aucune section visible.</p>
            )}

            <button
              onClick={handlePreview}
              style={{ marginTop: '12px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', fontSize: '12px', fontWeight: 600, borderRadius: 'var(--admin-radius)', border: isDark ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(99,102,241,0.25)', background: isDark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.06)', color: isDark ? '#a5b4fc' : '#4338ca', cursor: 'pointer' }}
            >
              <Eye className="w-3.5 h-3.5" /> Ouvrir l&apos;aperçu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Main page component
// ──────────────────────────────────────────────────────────────────────────────

export default function ContentPagesPage() {
  const { currentUser, adminTheme } = useAdmin();
  const isDark = adminTheme === 'dark';
  const role = currentUser?.role ?? 'viewer';

  const [pages, setPages] = useState<CmsPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [selectedPage, setSelectedPage] = useState<CmsPage | null>(null);

  const loadPages = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const data = await requestJson<{ pages?: CmsPage[] }>('/api/cms/pages');
      setPages(data.pages ?? []);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Impossible de charger les pages.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadPages(); }, [loadPages]);

  if (!canEditContent(role as any)) {
    return (
      <AsyncState kind="forbidden" description="Votre rôle ne permet pas de gérer les pages et leurs sections." />
    );
  }

  if (loading) {
    return <AsyncState kind="loading" />;
  }

  if (loadError) return <AsyncState kind="error" description={loadError} onRetry={loadPages} />;

  if (selectedPage) {
    return (
      <PageEditor
        page={selectedPage}
        onBack={() => setSelectedPage(null)}
        isDark={isDark}
        role={role}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 'var(--admin-text-xl)', fontWeight: 900, color: isDark ? '#f1f5f9' : '#0f172a', margin: 0 }}>Pages</h1>
          <p style={{ fontSize: '13px', color: isDark ? '#475569' : '#94a3b8', margin: '4px 0 0' }}>
            Gérez le contenu de chaque page du site. Le contenu publié est immédiatement actif sur la vitrine.
          </p>
        </div>
      </div>

      <PagesList pages={pages} onSelect={setSelectedPage} isDark={isDark} role={role} />
    </div>
  );
}
