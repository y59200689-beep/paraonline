'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { StickyPublishBar } from '@/components/admin/ui/StickyPublishBar';
import { BilingualField } from '@/components/admin/ui/BilingualField';
import { EmptyState } from '@/components/admin/ui/EmptyState';
import { canManageBrands, canPublishContent } from '@/lib/permissions';
import {
  Tag, Search, ArrowLeft, ChevronRight, Globe, Image, Package, AlertCircle,
  Plus, Eye, EyeOff, Upload, Link2, Trash2, Check, RefreshCw,
} from 'lucide-react';

type CmsStatus = 'draft' | 'scheduled' | 'published' | 'archived';

interface CmsBrand {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  logo_url: string | null;
  tagline_fr: string | null;
  tagline_ar: string | null;
  description_fr: string | null;
  description_ar: string | null;
  intro_fr: string | null;
  intro_ar: string | null;
  status: CmsStatus;
  display_order: number;
  is_visible: boolean;
  card_link: string | null;
  updated_at: string;
  seo_title_fr: string | null;
  seo_title_ar: string | null;
  seo_description_fr: string | null;
  seo_description_ar: string | null;
}

// ──────────────────────────────────────────────────────────────────────────────
// Add brand modal
// ──────────────────────────────────────────────────────────────────────────────

function AddBrandModal({ isDark, onClose, onCreated }: { isDark: boolean; onClose: () => void; onCreated: (b: CmsBrand) => void }) {
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleCreate = async () => {
    if (!name.trim()) { setError('Le nom est requis.'); return; }
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/cms/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), slug, domain: domain.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Erreur lors de la création.'); return; }
      onCreated(data.brand);
    } catch {
      setError('Erreur réseau.');
    } finally {
      setSaving(false);
    }
  };

  const overlay: React.CSSProperties = {
    position: 'fixed', inset: 0, zIndex: 100,
    background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  };
  const modal: React.CSSProperties = {
    width: '440px', maxWidth: '95vw',
    borderRadius: '16px',
    background: isDark ? '#0f172a' : '#fff',
    border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.09)',
    padding: '28px',
    display: 'flex', flexDirection: 'column', gap: '20px',
  };
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', fontSize: '13px',
    borderRadius: '10px',
    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.12)',
    background: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc',
    color: isDark ? '#e2e8f0' : '#0f172a', outline: 'none',
    boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = {
    fontSize: '10px', fontWeight: 800, textTransform: 'uppercase',
    letterSpacing: '0.1em', color: isDark ? '#475569' : '#94a3b8',
    display: 'block', marginBottom: '5px',
  };

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={e => e.stopPropagation()}>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 800, color: isDark ? '#f1f5f9' : '#0f172a', margin: 0 }}>Nouvelle marque</h2>
          <p style={{ fontSize: '12px', color: isDark ? '#475569' : '#94a3b8', marginTop: '4px' }}>
            La marque sera créée en brouillon. Vous pourrez ensuite ajouter le logo et la publier.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={labelStyle}>Nom de la marque *</label>
            <input
              autoFocus
              type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="ex: La Roche-Posay"
              style={inputStyle}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
            />
            {slug && <p style={{ fontSize: '10px', color: isDark ? '#334155' : '#94a3b8', marginTop: '4px' }}>Slug: <code>/brand/{slug}</code></p>}
          </div>
          <div>
            <label style={labelStyle}>Domaine (optionnel)</label>
            <input
              type="text" value={domain} onChange={e => setDomain(e.target.value)}
              placeholder="example.com"
              style={inputStyle}
            />
          </div>
          {error && (
            <p style={{ fontSize: '12px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={14} /> {error}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '8px 16px', fontSize: '12px', fontWeight: 600, borderRadius: '10px', border: isDark ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(0,0,0,0.1)', background: 'transparent', color: isDark ? '#64748b' : '#94a3b8', cursor: 'pointer' }}>
            Annuler
          </button>
          <button onClick={handleCreate} disabled={saving} style={{ padding: '8px 18px', fontSize: '12px', fontWeight: 700, borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #10b981, #0d9488)', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Création…' : 'Créer la marque'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// List
// ──────────────────────────────────────────────────────────────────────────────

function BrandsList({
  brands, onSelect, onToggleVisible, onDelete, isDark, canManage,
}: {
  brands: CmsBrand[];
  onSelect: (b: CmsBrand) => void;
  onToggleVisible: (id: string, visible: boolean) => void;
  onDelete?: (b: CmsBrand) => void;
  isDark: boolean;
  canManage: boolean;
}) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CmsStatus | 'all'>('all');

  const filtered = brands.filter(b => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    return !query || b.name.toLowerCase().includes(query.toLowerCase());
  });

  const cardStyle = (brand: CmsBrand): React.CSSProperties => ({
    padding: '16px', borderRadius: '14px',
    border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.07)',
    background: isDark ? 'rgba(255,255,255,0.01)' : '#fff',
    cursor: 'pointer', transition: 'all 0.12s',
    display: 'flex', flexDirection: 'column', gap: '10px',
    opacity: brand.is_visible ? 1 : 0.55,
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px', maxWidth: '300px' }}>
          <Search className="w-3.5 h-3.5" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: isDark ? '#475569' : '#94a3b8' }} />
          <input
            type="text"
            placeholder="Rechercher une marque…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ width: '100%', padding: '7px 10px 7px 30px', fontSize: '12px', borderRadius: '10px', border: isDark ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(0,0,0,0.1)', background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', color: isDark ? '#e2e8f0' : '#0f172a', outline: 'none' }}
          />
        </div>
        {(['all', 'draft', 'published', 'archived'] as const).map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            style={{ padding: '5px 12px', fontSize: '11px', fontWeight: 600, borderRadius: '999px', border: statusFilter === s ? '1px solid rgba(16,185,129,0.35)' : (isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)'), background: statusFilter === s ? (isDark ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.08)') : 'transparent', color: statusFilter === s ? (isDark ? '#34d399' : '#047857') : (isDark ? '#64748b' : '#94a3b8'), cursor: 'pointer' }}
          >
            {s === 'all' ? 'Toutes' : s === 'draft' ? 'Brouillon' : s === 'published' ? 'Publiées' : 'Archivées'}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState title="Aucune marque" description="Créez une nouvelle marque pour commencer." icon={Tag} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
          {filtered.map(brand => (
            <div
              key={brand.id}
              style={cardStyle(brand)}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = isDark ? 'rgba(16,185,129,0.25)' : 'rgba(16,185,129,0.3)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)'; }}
            >
              {/* Logo + Visibility toggle header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div
                  style={{ width: '48px', height: '48px', borderRadius: '10px', overflow: 'hidden', background: isDark ? 'rgba(255,255,255,0.04)' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}
                  onClick={() => onSelect(brand)}
                >
                  {brand.logo_url ? (
                    <img src={brand.logo_url} alt={brand.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '6px' }} />
                  ) : (
                    <Tag className="w-5 h-5" style={{ color: isDark ? '#334155' : '#cbd5e1' }} />
                  )}
                </div>

                {/* Visibility & Delete pill */}
                {canManage && (
                  <div style={{ display: 'flex', items: 'center', gap: '6px' }}>
                    <button
                      onClick={e => { e.stopPropagation(); onToggleVisible(brand.id, !brand.is_visible); }}
                      title={brand.is_visible ? 'Masquer sur le site' : 'Afficher sur le site'}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '5px',
                        padding: '4px 10px', fontSize: '10px', fontWeight: 700, borderRadius: '999px',
                        border: brand.is_visible
                          ? (isDark ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(16,185,129,0.35)')
                          : (isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)'),
                        background: brand.is_visible
                          ? (isDark ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.06)')
                          : 'transparent',
                        color: brand.is_visible ? (isDark ? '#34d399' : '#059669') : (isDark ? '#475569' : '#94a3b8'),
                        cursor: 'pointer',
                      }}
                    >
                      {brand.is_visible ? <Eye size={11} /> : <EyeOff size={11} />}
                      {brand.is_visible ? 'Visible' : 'Masqué'}
                    </button>
                    {onDelete && (
                      <button
                        onClick={e => { e.stopPropagation(); onDelete(brand); }}
                        title="Supprimer la marque"
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          padding: '5px', fontSize: '10px', borderRadius: '8px',
                          border: isDark ? '1px solid rgba(244,63,94,0.3)' : '1px solid rgba(244,63,94,0.2)',
                          background: isDark ? 'rgba(244,63,94,0.1)' : 'rgba(244,63,94,0.05)',
                          color: '#f43f5e', cursor: 'pointer',
                        }}
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Name + domain – clickable to open editor */}
              <div onClick={() => onSelect(brand)} style={{ cursor: 'pointer' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: isDark ? '#e2e8f0' : '#0f172a', margin: 0 }}>{brand.name}</p>
                {brand.domain && <p style={{ fontSize: '10px', color: isDark ? '#334155' : '#94a3b8', margin: '2px 0 0', fontFamily: 'monospace' }}>{brand.domain}</p>}
              </div>

              {/* Tagline */}
              {brand.tagline_fr && (
                <p style={{ fontSize: '11px', color: isDark ? '#475569' : '#64748b', margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {brand.tagline_fr}
                </p>
              )}

              {/* Card link chip */}
              {brand.card_link && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: isDark ? '#64748b' : '#94a3b8' }}>
                  <Link2 size={11} />
                  <span style={{ fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{brand.card_link}</span>
                </div>
              )}

              {/* Footer */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                <StatusBadge status={brand.status} />
                <span style={{ fontSize: '10px', color: isDark ? '#334155' : '#94a3b8' }}>
                  {new Date(brand.updated_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Logo uploader sub-component
// ──────────────────────────────────────────────────────────────────────────────

function LogoUploader({ currentUrl, isDark, onUploaded }: { currentUrl: string | null; isDark: boolean; onUploaded: (url: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const [success, setSuccess] = useState(false);
  const [err, setErr] = useState('');

  const handleFile = async (file: File) => {
    setUploading(true);
    setErr('');
    setSuccess(false);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok || !data.url) { setErr(data.error || 'Échec de l\'upload.'); return; }
      setPreview(data.url);
      setSuccess(true);
      onUploaded(data.url);
      setTimeout(() => setSuccess(false), 2000);
    } catch {
      setErr('Erreur réseau.');
    } finally {
      setUploading(false);
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div
      onDrop={onDrop}
      onDragOver={e => e.preventDefault()}
      onClick={() => fileRef.current?.click()}
      style={{
        width: '100%', minHeight: '120px', borderRadius: '12px',
        border: isDark ? '2px dashed rgba(255,255,255,0.1)' : '2px dashed rgba(0,0,0,0.12)',
        background: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: '10px', cursor: 'pointer', transition: 'all 0.15s', position: 'relative',
      }}
    >
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onInputChange} />

      {preview ? (
        <img src={preview} alt="Logo" style={{ maxHeight: '72px', maxWidth: '160px', objectFit: 'contain' }} />
      ) : (
        <Upload size={22} style={{ color: isDark ? '#334155' : '#cbd5e1' }} />
      )}

      {uploading ? (
        <span style={{ fontSize: '11px', color: isDark ? '#64748b' : '#94a3b8' }}>Envoi en cours…</span>
      ) : success ? (
        <span style={{ fontSize: '11px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}><Check size={12} /> Logo mis à jour</span>
      ) : (
        <span style={{ fontSize: '11px', color: isDark ? '#475569' : '#94a3b8', textAlign: 'center' }}>
          {preview ? 'Cliquer ou glisser pour remplacer' : 'Cliquer ou glisser un logo ici'}
          <br />
          <span style={{ fontSize: '10px' }}>PNG, JPG, WebP — max 10 Mo</span>
        </span>
      )}
      {err && <span style={{ fontSize: '11px', color: '#ef4444' }}>{err}</span>}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Editor
// ──────────────────────────────────────────────────────────────────────────────

function BrandEditor({ brand, onBack, isDark, role, onUpdated }: {
  brand: CmsBrand;
  onBack: () => void;
  isDark: boolean;
  role: string;
  onUpdated: (b: CmsBrand) => void;
}) {
  const [name, setName] = useState(brand.name);
  const [domain, setDomain] = useState(brand.domain ?? '');
  const [logoUrl, setLogoUrl] = useState<string | null>(brand.logo_url);
  const [cardLink, setCardLink] = useState(brand.card_link ?? '');
  const [isVisible, setIsVisible] = useState(brand.is_visible);
  const [taglineFr, setTaglineFr] = useState(brand.tagline_fr ?? '');
  const [taglineAr, setTaglineAr] = useState(brand.tagline_ar ?? '');
  const [descFr, setDescFr] = useState(brand.description_fr ?? '');
  const [descAr, setDescAr] = useState(brand.description_ar ?? '');
  const [introFr, setIntroFr] = useState(brand.intro_fr ?? '');
  const [introAr, setIntroAr] = useState(brand.intro_ar ?? '');
  const [seoTitleFr, setSeoTitleFr] = useState(brand.seo_title_fr ?? '');
  const [seoTitleAr, setSeoTitleAr] = useState(brand.seo_title_ar ?? '');
  const [seoDescFr, setSeoDescFr] = useState(brand.seo_description_fr ?? '');
  const [seoDescAr, setSeoDescAr] = useState(brand.seo_description_ar ?? '');
  const [status, setStatus] = useState<CmsStatus>(brand.status);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<'card' | 'identity' | 'seo'>('card');

  const markDirty = useCallback(() => setIsDirty(true), []);

  const handleSave = useCallback(async (newStatus?: CmsStatus) => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/cms/brands', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: brand.id,
          name, domain,
          logo_url: logoUrl,
          card_link: cardLink.trim() || null,
          is_visible: isVisible,
          tagline_fr: taglineFr, tagline_ar: taglineAr,
          description_fr: descFr, description_ar: descAr,
          intro_fr: introFr, intro_ar: introAr,
          seo_title_fr: seoTitleFr, seo_title_ar: seoTitleAr,
          seo_description_fr: seoDescFr, seo_description_ar: seoDescAr,
          status: newStatus ?? status,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        if (newStatus) setStatus(newStatus);
        setIsDirty(false);
        setLastSavedAt(new Date());
        onUpdated(data.brand);
      }
    } finally {
      setIsSaving(false);
    }
  }, [brand.id, name, domain, logoUrl, cardLink, isVisible, taglineFr, taglineAr, descFr, descAr, introFr, introAr, seoTitleFr, seoTitleAr, seoDescFr, seoDescAr, status, onUpdated]);

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '6px 14px', fontSize: '11px', fontWeight: 600, borderRadius: '8px',
    border: 'none', cursor: 'pointer',
    background: active ? (isDark ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.08)') : 'transparent',
    color: active ? (isDark ? '#34d399' : '#047857') : (isDark ? '#64748b' : '#94a3b8'),
  });

  const inputStyle: React.CSSProperties = {
    width: '100%', fontSize: '13px', padding: '8px 12px',
    borderRadius: '10px',
    border: isDark ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(0,0,0,0.1)',
    background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
    color: isDark ? '#e2e8f0' : '#0f172a', outline: 'none', boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em',
    color: isDark ? '#475569' : '#94a3b8', display: 'block', marginBottom: '4px',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: isDark ? '#475569' : '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <ArrowLeft className="w-3.5 h-3.5" /> Marques
        </button>
        <ChevronRight className="w-3 h-3" style={{ color: isDark ? '#334155' : '#cbd5e1' }} />
        <span style={{ fontSize: '12px', fontWeight: 700, color: isDark ? '#e2e8f0' : '#0f172a' }}>{brand.name}</span>
        <StatusBadge status={status} />
      </div>

      <StickyPublishBar
        status={status}
        isDirty={isDirty}
        isSaving={isSaving}
        lastSavedAt={lastSavedAt}
        onSaveDraft={() => handleSave('draft')}
        onPreview={() => window.open(`/brand/${brand.slug}`, '_blank')}
        onPublish={() => handleSave(canPublishContent(role as any) ? 'published' : 'draft')}
        requiresApproval={!canPublishContent(role as any)}
      />

      {/* 2-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '16px' }}>

        {/* Form */}
        <div style={{ borderRadius: '14px', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.07)', background: isDark ? 'rgba(255,255,255,0.01)' : '#fafafa', overflow: 'hidden' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '4px', padding: '8px 12px', borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.06)' }}>
            <button style={tabStyle(activeTab === 'card')} onClick={() => setActiveTab('card')}><Image className="w-3 h-3 inline mr-1" />Carte bannière</button>
            <button style={tabStyle(activeTab === 'identity')} onClick={() => setActiveTab('identity')}><Tag className="w-3 h-3 inline mr-1" />Identité</button>
            <button style={tabStyle(activeTab === 'seo')} onClick={() => setActiveTab('seo')}><Globe className="w-3 h-3 inline mr-1" />SEO</button>
          </div>

          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {activeTab === 'card' ? (
              <>
                {/* Visibility toggle */}
                <div>
                  <label style={labelStyle}>Visibilité dans la section marques</label>
                  <button
                    onClick={() => { setIsVisible(v => !v); markDirty(); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '10px 14px', borderRadius: '10px', cursor: 'pointer',
                      border: isVisible
                        ? (isDark ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(16,185,129,0.35)')
                        : (isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.1)'),
                      background: isVisible
                        ? (isDark ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.04)')
                        : (isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc'),
                      width: '100%', textAlign: 'left',
                    }}
                  >
                    {isVisible
                      ? <Eye size={16} style={{ color: isDark ? '#34d399' : '#059669', flexShrink: 0 }} />
                      : <EyeOff size={16} style={{ color: isDark ? '#475569' : '#94a3b8', flexShrink: 0 }} />}
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: 700, color: isVisible ? (isDark ? '#34d399' : '#059669') : (isDark ? '#475569' : '#94a3b8'), margin: 0 }}>
                        {isVisible ? 'Carte visible sur le site' : 'Carte masquée'}
                      </p>
                      <p style={{ fontSize: '11px', color: isDark ? '#334155' : '#94a3b8', margin: '2px 0 0' }}>
                        {isVisible
                          ? 'Cette marque apparaît dans la section défilante de la page d\'accueil.'
                          : 'Cette marque est cachée de la section défilante mais reste accessible directement.'}
                      </p>
                    </div>
                  </button>
                </div>

                {/* Logo upload */}
                <div>
                  <label style={labelStyle}><Upload size={10} style={{ display: 'inline', marginRight: '4px' }} />Logo de la carte</label>
                  <LogoUploader
                    currentUrl={logoUrl}
                    isDark={isDark}
                    onUploaded={url => { setLogoUrl(url); markDirty(); }}
                  />
                  <p style={{ fontSize: '10px', color: isDark ? '#334155' : '#94a3b8', marginTop: '6px' }}>
                    Le logo s'affiche sur la carte défilante de la page d'accueil. Fond blanc recommandé.
                  </p>
                </div>

                {/* Card link */}
                <div>
                  <label style={labelStyle}><Link2 size={10} style={{ display: 'inline', marginRight: '4px' }} />Lien de la carte (optionnel)</label>
                  <input
                    type="text"
                    value={cardLink}
                    onChange={e => { setCardLink(e.target.value); markDirty(); }}
                    placeholder={`/brand/${brand.slug} (par défaut)`}
                    style={inputStyle}
                  />
                  <p style={{ fontSize: '10px', color: isDark ? '#334155' : '#94a3b8', marginTop: '6px' }}>
                    Si vide, le clic redirige vers <code>/brand/{brand.slug}</code>. Vous pouvez pointer vers une collection, un filtre ou une URL externe.
                  </p>
                </div>
              </>
            ) : activeTab === 'identity' ? (
              <>
                {/* Name + domain */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>Nom de la marque *</label>
                    <input type="text" value={name} onChange={e => { setName(e.target.value); markDirty(); }} style={inputStyle} />
                    <p style={{ fontSize: '10px', color: isDark ? '#334155' : '#94a3b8', marginTop: '4px' }}>Doit correspondre au champ <code>vendor</code> des produits.</p>
                  </div>
                  <div>
                    <label style={labelStyle}>Domaine</label>
                    <input type="text" value={domain} onChange={e => { setDomain(e.target.value); markDirty(); }} placeholder="example.com" style={inputStyle} />
                  </div>
                </div>

                <BilingualField
                  label="Accroche (tagline)"
                  valueFr={taglineFr} valueAr={taglineAr}
                  onChangeFr={v => { setTaglineFr(v); markDirty(); }}
                  onChangeAr={v => { setTaglineAr(v); markDirty(); }}
                  placeholder={{ fr: 'Slogan de la marque…', ar: 'شعار العلامة التجارية…' }}
                />

                <BilingualField
                  label="Description courte"
                  valueFr={descFr} valueAr={descAr}
                  onChangeFr={v => { setDescFr(v); markDirty(); }}
                  onChangeAr={v => { setDescAr(v); markDirty(); }}
                  multiline rows={4}
                  placeholder={{ fr: 'Description de la marque…', ar: 'وصف العلامة التجارية…' }}
                />

                <BilingualField
                  label="Introduction éditoriale"
                  valueFr={introFr} valueAr={introAr}
                  onChangeFr={v => { setIntroFr(v); markDirty(); }}
                  onChangeAr={v => { setIntroAr(v); markDirty(); }}
                  multiline rows={6}
                  placeholder={{ fr: 'Texte long pour la page marque…', ar: 'نص طويل لصفحة العلامة التجارية…' }}
                />
              </>
            ) : (
              <>
                <BilingualField
                  label="Titre SEO"
                  valueFr={seoTitleFr} valueAr={seoTitleAr}
                  onChangeFr={v => { setSeoTitleFr(v); markDirty(); }}
                  onChangeAr={v => { setSeoTitleAr(v); markDirty(); }}
                  placeholder={{ fr: 'Titre pour les moteurs de recherche…', ar: 'عنوان لمحركات البحث…' }}
                />
                <BilingualField
                  label="Méta-description"
                  valueFr={seoDescFr} valueAr={seoDescAr}
                  onChangeFr={v => { setSeoDescFr(v); markDirty(); }}
                  onChangeAr={v => { setSeoDescAr(v); markDirty(); }}
                  multiline rows={3}
                  placeholder={{ fr: 'Description SEO…', ar: 'وصف SEO…' }}
                />
              </>
            )}
          </div>
        </div>

        {/* Right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Live card preview */}
          <div style={{ padding: '16px', borderRadius: '14px', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.07)', background: isDark ? 'rgba(255,255,255,0.01)' : '#fafafa' }}>
            <p style={{ ...labelStyle, marginBottom: '10px' }}>Aperçu de la carte</p>
            <div style={{
              width: '100%', height: '72px',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              background: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', opacity: isVisible ? 1 : 0.4,
              position: 'relative',
            }}>
              {logoUrl ? (
                <img src={logoUrl} alt={name} style={{ maxHeight: '52px', maxWidth: '140px', objectFit: 'contain', padding: '8px', filter: 'grayscale(0.3)', opacity: 0.85 }} />
              ) : (
                <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.1em', color: '#94a3b8', textTransform: 'uppercase' }}>{name || 'Marque'}</span>
              )}
              {!isVisible && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.6)' }}>
                  <EyeOff size={16} style={{ color: '#94a3b8' }} />
                </div>
              )}
            </div>
            <p style={{ fontSize: '10px', color: isDark ? '#334155' : '#94a3b8', textAlign: 'center', marginTop: '8px' }}>
              {isVisible ? `Visible → ${cardLink || `/brand/${brand.slug}`}` : 'Masquée de la section défilante'}
            </p>
          </div>

          {/* Slug */}
          <div style={{ padding: '16px', borderRadius: '14px', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.07)', background: isDark ? 'rgba(255,255,255,0.01)' : '#fafafa' }}>
            <p style={{ ...labelStyle, marginBottom: '8px' }}>Page marque</p>
            <code style={{ fontSize: '11px', color: isDark ? '#34d399' : '#047857', wordBreak: 'break-all' }}>/brand/{brand.slug}</code>
          </div>

          {/* Products note */}
          <div style={{ padding: '14px', borderRadius: '14px', border: isDark ? '1px solid rgba(16,185,129,0.15)' : '1px solid rgba(16,185,129,0.2)', background: isDark ? 'rgba(16,185,129,0.04)' : 'rgba(16,185,129,0.03)' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <Package className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: isDark ? '#34d399' : '#059669' }} />
              <p style={{ fontSize: '11px', color: isDark ? '#475569' : '#64748b', margin: 0, lineHeight: 1.5 }}>
                Les produits liés sont associés automatiquement via le champ <strong>vendor</strong> du catalogue.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────────────────────────────────────

export default function ContentBrandsPage() {
  const { currentUser, adminTheme } = useAdmin();
  const isDark = adminTheme === 'dark';
  const role = currentUser?.role ?? 'viewer';
  const canManage = canManageBrands(role as any);

  const [brands, setBrands] = useState<CmsBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<CmsBrand | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ imported: number; total: number } | null>(null);

  useEffect(() => {
    fetch('/api/cms/brands')
      .then(r => r.json())
      .then(data => { setBrands(data.brands ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSync = useCallback(async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch('/api/cms/brands', { method: 'PUT' });
      const data = await res.json();
      if (res.ok) {
        setBrands(data.brands ?? []);
        setSyncResult({ imported: data.imported, total: data.total });
        setTimeout(() => setSyncResult(null), 5000);
      }
    } finally {
      setSyncing(false);
    }
  }, []);

  const handleToggleVisible = useCallback(async (id: string, visible: boolean) => {
    setBrands(prev => prev.map(b => b.id === id ? { ...b, is_visible: visible } : b));
    await fetch('/api/cms/brands', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_visible: visible }),
    });
  }, []);

  const handleCreated = useCallback((brand: CmsBrand) => {
    setBrands(prev => [...prev, brand]);
    setShowAddModal(false);
    setSelected(brand);
  }, []);

  const handleUpdated = useCallback((updated: CmsBrand) => {
    setBrands(prev => prev.map(b => b.id === updated.id ? updated : b));
    setSelected(updated);
  }, []);

  if (!canManage) {
    return <div style={{ padding: '40px', textAlign: 'center' }}><p style={{ fontSize: '14px', color: isDark ? '#475569' : '#94a3b8' }}>Accès refusé.</p></div>;
  }

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px' }}><div className="w-6 h-6 border-2 border-slate-700 border-t-emerald-500 rounded-full animate-spin" /></div>;
  }

  if (selected) {
    return <BrandEditor brand={selected} onBack={() => setSelected(null)} isDark={isDark} role={role} onUpdated={handleUpdated} />;
  }

  const handleDeleteBrand = useCallback(async (brand: CmsBrand) => {
    const confirm = window.confirm(`Voulez-vous vraiment supprimer la marque "${brand.name}" ? Cette action effacera la marque et détachera les produits associés.`);
    if (!confirm) return;

    try {
      const res = await fetch(`/api/cms/brands?id=${encodeURIComponent(brand.id)}&name=${encodeURIComponent(brand.name)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setBrands(prev => prev.filter(b => b.id !== brand.id));
        if (selected?.id === brand.id) setSelected(null);
      } else {
        alert('Erreur lors de la suppression de la marque.');
      }
    } catch {
      alert('Erreur réseau lors de la suppression.');
    }
  }, [selected]);

  return (
    <>
      {showAddModal && (
        <AddBrandModal isDark={isDark} onClose={() => setShowAddModal(false)} onCreated={handleCreated} />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: 'var(--admin-text-xl)', fontWeight: 900, color: isDark ? '#f1f5f9' : '#0f172a', margin: 0 }}>Marques</h1>
            <p style={{ fontSize: '13px', color: isDark ? '#475569' : '#94a3b8', margin: '4px 0 0' }}>
              {brands.length} marque{brands.length !== 1 ? 's' : ''} enregistrée{brands.length !== 1 ? 's' : ''} — <span style={{ color: isDark ? '#34d399' : '#059669', fontWeight: 600 }}>{visibleCount} visible{visibleCount !== 1 ? 's' : ''}</span> sur le site
            </p>
            {syncResult && (
              <p style={{ fontSize: '11px', color: isDark ? '#34d399' : '#059669', marginTop: '4px', fontWeight: 600 }}>
                {syncResult.imported === 0
                  ? '✓ Déjà synchronisé — aucune nouvelle marque'
                  : `✓ ${syncResult.imported} marque${syncResult.imported !== 1 ? 's' : ''} importée${syncResult.imported !== 1 ? 's' : ''} depuis le catalogue`}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            <button
              onClick={handleSync}
              disabled={syncing}
              title="Importer toutes les marques du catalogue produits"
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 14px', fontSize: '12px', fontWeight: 600,
                borderRadius: '10px', cursor: syncing ? 'not-allowed' : 'pointer',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                background: 'transparent',
                color: isDark ? '#94a3b8' : '#64748b',
                opacity: syncing ? 0.6 : 1,
              }}
            >
              <RefreshCw size={13} style={{ animation: syncing ? 'spin 1s linear infinite' : 'none' }} />
              {syncing ? 'Sync…' : 'Sync catalogue'}
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px', fontSize: '12px', fontWeight: 700,
                borderRadius: '10px', border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #10b981, #0d9488)',
                color: '#fff',
              }}
            >
              <Plus size={14} /> Nouvelle marque
            </button>
          </div>
        </div>

        <BrandsList
          brands={brands}
          onSelect={setSelected}
          onToggleVisible={handleToggleVisible}
          onDelete={handleDeleteBrand}
          isDark={isDark}
          canManage={canManage}
        />
      </div>
    </>
  );
}
