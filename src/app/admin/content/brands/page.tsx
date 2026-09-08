'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAdmin } from '@/context/AdminContext';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { StickyPublishBar } from '@/components/admin/ui/StickyPublishBar';
import { BilingualField } from '@/components/admin/ui/BilingualField';
import { EmptyState } from '@/components/admin/ui/EmptyState';
import { canManageBrands, canPublishContent } from '@/lib/permissions';
import { AsyncState } from '@/components/admin/ui/AsyncState';
import { requestJson } from '@/lib/request-json';
import { BrandLogo } from '@/components/BrandLogo';
import { brandLogoSrc } from '@/lib/brand-logo';
import { useBrandImages } from '@/hooks/useBrandImages';
import {
  Tag, Search, ArrowLeft, ChevronRight, Globe, Image, Package, AlertCircle,
  Plus, Eye, EyeOff, Upload, Link2, Trash2, Check, RefreshCw, FileImage, X, FileSpreadsheet,
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
  product_count?: number | null;
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
  query, setQuery, statusFilter, setStatusFilter, imageFilter, setImageFilter,
}: {
  brands: CmsBrand[];
  onSelect: (b: CmsBrand) => void;
  onToggleVisible: (id: string, visible: boolean) => void;
  onDelete?: (b: CmsBrand) => void;
  isDark: boolean;
  canManage: boolean;
  query: string;
  setQuery: (value: string) => void;
  statusFilter: CmsStatus | 'all';
  setStatusFilter: (value: CmsStatus | 'all') => void;
  imageFilter: string;
  setImageFilter: (value: string) => void;
}) {
  const logoSource = (brand: CmsBrand) => brandLogoSrc(brand.name, brand.domain, brand.logo_url);
  const imageResults = useBrandImages(brands.map(logoSource), imageFilter !== 'all');
  const unchecked = brands.filter(brand => !imageResults[logoSource(brand)] || imageResults[logoSource(brand)] === 'unknown').length;

  const filtered = brands.filter(b => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (imageFilter !== 'all' && imageResults[logoSource(b)] !== imageFilter) return false;
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
        <select
          aria-label="Filtrer les marques par image"
          value={imageFilter}
          onChange={event => setImageFilter(event.target.value)}
          style={{ padding: '7px 12px', fontSize: '12px', borderRadius: '10px', border: '1px solid ' + (isDark ? '#334155' : '#cbd5e1'), background: isDark ? '#0f172a' : '#fff', color: isDark ? '#e2e8f0' : '#334155' }}
        >
          <option value="all">Toutes les images</option>
          <option value="loaded">Avec image</option>
          <option value="missing">Sans image</option>
        </select>
      </div>
      {imageFilter !== 'all' && (
        <p role="status" style={{ fontSize: '12px', color: isDark ? '#94a3b8' : '#64748b' }}>
          {filtered.length} marque(s) correspondante(s). {unchecked > 0 && `${unchecked} logo(s) en cours de vérification ou indisponibles — non classés.`}
        </p>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState title="Aucune marque" description={imageFilter !== 'all' && unchecked > 0 ? 'Certains logos sont en cours de vérification ou sans réponse. Revenez à Toutes les images pour les afficher.' : 'Aucune marque ne correspond aux filtres sélectionnés.'} icon={Tag} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
          {filtered.map(brand => (
            <div
              key={brand.id}
              style={cardStyle(brand)}
              onClick={() => onSelect(brand)}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = isDark ? 'rgba(16,185,129,0.25)' : 'rgba(16,185,129,0.3)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)'; }}
            >
              {/* Logo + Visibility toggle header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div
                  style={{ width: '48px', height: '48px', borderRadius: '10px', overflow: 'hidden', background: isDark ? 'rgba(255,255,255,0.04)' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}
                >
                  <BrandLogo name={brand.name} domain={brand.domain} logo={brand.logo_url} />
                </div>

                {/* Visibility & Delete pill */}
                {canManage && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
              <button type="button" aria-label={`Ouvrir ${brand.name}`} style={{ cursor: 'pointer', textAlign: 'left', background: 'transparent', border: 0, padding: 0 }}>
                <span style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: isDark ? '#e2e8f0' : '#0f172a', margin: 0 }}>{brand.name}</span>
                {brand.domain && <span style={{ display: 'block', fontSize: '10px', color: isDark ? '#334155' : '#94a3b8', margin: '2px 0 0', fontFamily: 'monospace' }}>{brand.domain}</span>}
              </button>

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
                  {brand.product_count == null ? 'Produits : indisponible' : `${brand.product_count} produit${brand.product_count === 1 ? '' : 's'}`}
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
  const preview = currentUrl;
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
    if (uploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div
      onDrop={onDrop}
      onDragOver={e => e.preventDefault()}
      onClick={() => { if (!uploading) fileRef.current?.click(); }}
      style={{
        width: '100%', minHeight: '120px', borderRadius: '12px',
        border: isDark ? '2px dashed rgba(255,255,255,0.1)' : '2px dashed rgba(0,0,0,0.12)',
        background: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: '10px', cursor: 'pointer', transition: 'all 0.15s', position: 'relative',
      }}
    >
      <input ref={fileRef} type="file" aria-label="Importer un logo" accept="image/*" disabled={uploading} style={{ display: 'none' }} onChange={onInputChange} />

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
      {preview && (
        <button
          type="button"
          disabled={uploading}
          onClick={e => {
            e.stopPropagation();
            onUploaded('');
            setSuccess(false);
            setErr('');
            if (fileRef.current) fileRef.current.value = '';
          }}
          style={{ color: '#e11d48', fontSize: '12px', padding: '6px 10px', cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.5 : 1 }}
        >
          Supprimer le logo
        </button>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Bulk Image Upload Modal
// ──────────────────────────────────────────────────────────────────────────────

type BulkResult = { updated: string[]; skipped: string[]; errors: { name: string; error: string }[] } | null;

function BulkImageUploadModal({ isDark, onClose, onDone }: { isDark: boolean; onClose: () => void; onDone: () => void }) {
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [files, setFiles] = React.useState<File[]>([]);
  const [uploading, setUploading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [result, setResult] = React.useState<BulkResult>(null);
  const [err, setErr] = React.useState('');
  const [dragging, setDragging] = React.useState(false);

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const images = Array.from(incoming).filter(f => f.type.startsWith('image/'));
    setFiles(prev => {
      const existing = new Set(prev.map(f => f.name));
      return [...prev, ...images.filter(f => !existing.has(f.name))];
    });
  };

  const removeFile = (name: string) => setFiles(prev => prev.filter(f => f.name !== name));

  const handleUpload = async () => {
    if (!files.length) return;
    setUploading(true);
    setErr('');
    setResult(null);
    setProgress(0);

    // Upload in batches of 10 to avoid request size limits
    const BATCH = 10;
    const allUpdated: string[] = [];
    const allSkipped: string[] = [];
    const allErrors: { name: string; error: string }[] = [];
    const batches = [];
    for (let i = 0; i < files.length; i += BATCH) batches.push(files.slice(i, i + BATCH));

    try {
      for (let b = 0; b < batches.length; b++) {
        const fd = new FormData();
        for (const f of batches[b]) fd.append('files', f);
        const res = await fetch('/api/admin/brand-bulk-images', { method: 'POST', body: fd });
        const data = await res.json();
        if (!res.ok) { setErr(data.error || 'Erreur serveur.'); setUploading(false); return; }
        allUpdated.push(...(data.updated ?? []));
        allSkipped.push(...(data.skipped ?? []));
        allErrors.push(...(data.errors ?? []));
        setProgress(Math.round(((b + 1) / batches.length) * 100));
      }
      setResult({ updated: allUpdated, skipped: allSkipped, errors: allErrors });
      if (allUpdated.length > 0) onDone();
    } catch {
      setErr('Erreur réseau.');
    } finally {
      setUploading(false);
    }
  };

  const overlay: React.CSSProperties = {
    position: 'fixed', inset: 0, zIndex: 100,
    background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  };
  const modal: React.CSSProperties = {
    width: '520px', maxWidth: '95vw', maxHeight: '85vh',
    borderRadius: '16px',
    background: isDark ? '#0f172a' : '#fff',
    border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.09)',
    padding: '28px',
    display: 'flex', flexDirection: 'column', gap: '20px',
    overflowY: 'auto',
  };

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: isDark ? '#f1f5f9' : '#0f172a', margin: 0 }}>Importer des logos en masse</h2>
            <p style={{ fontSize: '12px', color: isDark ? '#475569' : '#94a3b8', marginTop: '4px' }}>
              Nommez chaque fichier comme la marque — ex. <code>vichy.png</code>, <code>la-roche-posay.jpg</code>.<br />
              Seules les marques <strong>sans logo existant</strong> seront mises à jour.
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: isDark ? '#475569' : '#94a3b8', padding: '2px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Drop zone */}
        {!result && (
          <div
            onDragEnter={e => { e.preventDefault(); setDragging(true); }}
            onDragOver={e => e.preventDefault()}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
            onClick={() => fileRef.current?.click()}
            style={{
              minHeight: '120px', borderRadius: '12px', cursor: 'pointer',
              border: dragging
                ? '2px dashed #10b981'
                : (isDark ? '2px dashed rgba(255,255,255,0.1)' : '2px dashed rgba(0,0,0,0.12)'),
              background: dragging
                ? (isDark ? 'rgba(16,185,129,0.06)' : 'rgba(16,185,129,0.04)')
                : (isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc'),
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: '10px', transition: 'all 0.15s',
            }}
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={e => { addFiles(e.target.files); e.target.value = ''; }}
            />
            <FileImage size={24} style={{ color: isDark ? '#334155' : '#cbd5e1' }} />
            <span style={{ fontSize: '12px', color: isDark ? '#475569' : '#94a3b8', textAlign: 'center' }}>
              Glisser les images ici ou <span style={{ color: '#10b981', fontWeight: 600 }}>cliquer pour sélectionner</span><br />
              <span style={{ fontSize: '11px' }}>PNG, JPG, WebP — plusieurs fichiers à la fois</span>
            </span>
          </div>
        )}

        {/* File list */}
        {files.length > 0 && !result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '200px', overflowY: 'auto' }}>
            <p style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: isDark ? '#475569' : '#94a3b8', margin: 0 }}>
              {files.length} fichier{files.length !== 1 ? 's' : ''} sélectionné{files.length !== 1 ? 's' : ''}
            </p>
            {files.map(f => (
              <div key={f.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', borderRadius: '8px', background: isDark ? 'rgba(255,255,255,0.03)' : '#f1f5f9', fontSize: '12px', color: isDark ? '#94a3b8' : '#334155' }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                {!uploading && (
                  <button onClick={() => removeFile(f.name)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: isDark ? '#475569' : '#94a3b8', flexShrink: 0, padding: '0 0 0 8px' }}>
                    <X size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Progress */}
        {uploading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ height: '4px', borderRadius: '4px', background: isDark ? 'rgba(255,255,255,0.07)' : '#e2e8f0', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg,#10b981,#0d9488)', transition: 'width 0.3s' }} />
            </div>
            <p style={{ fontSize: '11px', color: isDark ? '#475569' : '#94a3b8', textAlign: 'center' }}>Envoi en cours… {progress}%</p>
          </div>
        )}

        {/* Error */}
        {err && (
          <p style={{ fontSize: '12px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertCircle size={14} /> {err}
          </p>
        )}

        {/* Result summary */}
        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {result.updated.length > 0 && (
              <div>
                <p style={{ fontSize: '11px', fontWeight: 700, color: '#10b981', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Check size={13} /> {result.updated.length} logo{result.updated.length !== 1 ? 's' : ''} mis à jour
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', maxHeight: '120px', overflowY: 'auto' }}>
                  {result.updated.map(name => (
                    <span key={name} style={{ fontSize: '12px', color: isDark ? '#34d399' : '#059669', padding: '3px 8px', borderRadius: '6px', background: isDark ? 'rgba(16,185,129,0.07)' : 'rgba(16,185,129,0.06)' }}>{name}</span>
                  ))}
                </div>
              </div>
            )}
            {result.skipped.length > 0 && (
              <div>
                <p style={{ fontSize: '11px', fontWeight: 700, color: isDark ? '#64748b' : '#94a3b8', marginBottom: '6px' }}>
                  {result.skipped.length} fichier{result.skipped.length !== 1 ? 's' : ''} ignoré{result.skipped.length !== 1 ? 's' : ''} (marque inconnue ou logo déjà présent)
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', maxHeight: '100px', overflowY: 'auto' }}>
                  {result.skipped.map(name => (
                    <span key={name} style={{ fontSize: '11px', color: isDark ? '#475569' : '#94a3b8', fontFamily: 'monospace' }}>{name}</span>
                  ))}
                </div>
              </div>
            )}
            {result.errors.length > 0 && (
              <div>
                <p style={{ fontSize: '11px', fontWeight: 700, color: '#ef4444', marginBottom: '6px' }}>
                  {result.errors.length} erreur{result.errors.length !== 1 ? 's' : ''}
                </p>
                {result.errors.map(e => (
                  <p key={e.name} style={{ fontSize: '11px', color: '#ef4444', margin: '2px 0', fontFamily: 'monospace' }}>{e.name}: {e.error}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{ padding: '8px 16px', fontSize: '12px', fontWeight: 600, borderRadius: '10px', border: isDark ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(0,0,0,0.1)', background: 'transparent', color: isDark ? '#64748b' : '#94a3b8', cursor: 'pointer' }}
          >
            {result ? 'Fermer' : 'Annuler'}
          </button>
          {!result && (
            <button
              onClick={handleUpload}
              disabled={uploading || files.length === 0}
              style={{ padding: '8px 18px', fontSize: '12px', fontWeight: 700, borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #10b981, #0d9488)', color: '#fff', cursor: uploading || files.length === 0 ? 'not-allowed' : 'pointer', opacity: uploading || files.length === 0 ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Upload size={13} /> {uploading ? `Envoi… ${progress}%` : `Importer ${files.length > 0 ? `${files.length} ` : ''}logo${files.length !== 1 ? 's' : ''}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// CSV Brand Import Modal
// ──────────────────────────────────────────────────────────────────────────────

type CsvAllowedField = 'name' | 'logo_url' | 'domain' | 'card_link' | 'tagline_fr' | 'tagline_ar' | 'description_fr' | 'description_ar';
const CSV_ALLOWED_FIELDS: CsvAllowedField[] = ['name', 'logo_url', 'domain', 'card_link', 'tagline_fr', 'tagline_ar', 'description_fr', 'description_ar'];
const CSV_FIELD_LABELS: Record<CsvAllowedField, string> = {
  name: 'Nom', logo_url: 'Logo URL', domain: 'Domaine', card_link: 'Lien carte',
  tagline_fr: 'Accroche FR', tagline_ar: 'Accroche AR',
  description_fr: 'Description FR', description_ar: 'Description AR',
};

const FIELD_ALIASES: Record<string, CsvAllowedField> = {
  // Name
  name: 'name', nom: 'name', marque: 'name', brand: 'name', brand_name: 'name', title: 'name', titre: 'name',
  // Logo / Image
  image: 'logo_url', image_url: 'logo_url', logo: 'logo_url', logo_url: 'logo_url', photo: 'logo_url',
  picture: 'logo_url', img: 'logo_url', url_logo: 'logo_url', url_image: 'logo_url', icon: 'logo_url',
  // Domain
  domain: 'domain', domaine: 'domain', slug: 'domain',
  // Link
  card_link: 'card_link', link: 'card_link', lien: 'card_link', url: 'card_link', site: 'card_link', website: 'card_link',
  // Tagline
  tagline: 'tagline_fr', tagline_fr: 'tagline_fr', tagline_ar: 'tagline_ar', slogan: 'tagline_fr', accroche: 'tagline_fr',
  // Description
  description: 'description_fr', description_fr: 'description_fr', description_ar: 'description_ar', desc: 'description_fr',
};

interface CsvMatchedEntry { brand: CmsBrand; changes: Partial<Record<CsvAllowedField, string>>; rawName: string; }
interface CsvUnmatchedEntry { rawName: string; changes: Partial<Record<CsvAllowedField, string>>; resolution: 'skip' | string; renameToCsv?: boolean; }
interface CsvApplyResult { updated: string[]; errors: { id: string; error: string }[]; skipped: number; }

function parseCsvText(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const cleaned = text.replace(/^\uFEFF/, '');
  const lines = cleaned.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 1) return { headers: [], rows: [] };

  const firstLine = lines[0];
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  const tabCount = (firstLine.match(/\t/g) || []).length;
  const delimiter = tabCount > commaCount && tabCount > semicolonCount ? '\t' : semicolonCount > commaCount ? ';' : ',';

  const splitLine = (line: string): string[] => {
    const result: string[] = []; let cur = '', inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
        else { inQ = !inQ; }
      } else if (ch === delimiter && !inQ) {
        result.push(cur.trim()); cur = '';
      } else {
        cur += ch;
      }
    }
    result.push(cur.trim()); return result;
  };

  const rawHeaders = splitLine(lines[0]);
  const headers = rawHeaders.map(h => h.trim().replace(/^["']|["']$/g, ''));
  const rows = lines.slice(1).map(line => {
    const vals = splitLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = vals[i] ?? ''; });
    return row;
  }).filter(row => headers.some(h => row[h]));
  return { headers, rows };
}

function BrandCsvImportModal({ isDark, onClose, onDone, brands }: {
  isDark: boolean; onClose: () => void; onDone: () => void; brands: CmsBrand[];
}) {
  const csvSlugify = (text: string) =>
    text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');

  const csvStrip = (text: string) =>
    text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');

  const fileRef = React.useRef<HTMLInputElement>(null);
  const [step, setStep] = React.useState<1 | 2 | 3>(1);
  const [parseErr, setParseErr] = React.useState('');
  const [detectedCols, setDetectedCols] = React.useState<string[]>([]);
  const [onlyEmptyLogos, setOnlyEmptyLogos] = React.useState(false);
  const [matched, setMatched] = React.useState<CsvMatchedEntry[]>([]);
  const [unmatched, setUnmatched] = React.useState<CsvUnmatchedEntry[]>([]);
  const [applying, setApplying] = React.useState(false);
  const [result, setResult] = React.useState<CsvApplyResult | null>(null);
  const [dragging, setDragging] = React.useState(false);
  const [brandSearch, setBrandSearch] = React.useState<Record<number, string>>({});

  const { brandSlugMap, brandStripMap } = React.useMemo(() => {
    const slugMap = new Map<string, CmsBrand>();
    const stripMap = new Map<string, CmsBrand>();
    for (const b of brands) {
      slugMap.set(csvSlugify(b.name), b);
      stripMap.set(csvStrip(b.name), b);
    }
    return { brandSlugMap: slugMap, brandStripMap: stripMap };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brands]);

  const handleFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) { setParseErr('Veuillez sélectionner un fichier .csv'); return; }
    setParseErr('');
    const text = await file.text();
    const { headers, rows } = parseCsvText(text);

    // Map each CSV header to a canonical target field
    const headerMapping: Record<string, CsvAllowedField> = {};
    for (const h of headers) {
      const normalized = h.toLowerCase().trim().replace(/[\s_-]+/g, '_');
      if (FIELD_ALIASES[normalized]) {
        headerMapping[h] = FIELD_ALIASES[normalized];
      }
    }

    const nameHeader = Object.keys(headerMapping).find(h => headerMapping[h] === 'name');
    if (!nameHeader) {
      setParseErr('Colonne marque manquante ("name", "nom", ou "marque" requise dans le fichier CSV).');
      return;
    }
    if (rows.length === 0) { setParseErr('Le fichier CSV ne contient aucune ligne de données.'); return; }

    const detectedInfo = Object.entries(headerMapping).map(([orig, target]) => `"${orig}" → ${CSV_FIELD_LABELS[target]}`);
    setDetectedCols(detectedInfo);

    const newMatched: CsvMatchedEntry[] = [];
    const newUnmatched: CsvUnmatchedEntry[] = [];

    for (const row of rows) {
      const rawName = (row[nameHeader] ?? '').trim();
      if (!rawName) continue;

      // Try exact slug match, then stripped fuzzy match (ignoring dashes/spaces/accents)
      const brand = brandSlugMap.get(csvSlugify(rawName)) || brandStripMap.get(csvStrip(rawName));

      const changes: Partial<Record<CsvAllowedField, string>> = {};
      for (const [origHeader, targetField] of Object.entries(headerMapping)) {
        if (targetField !== 'name' && (row[origHeader] ?? '').trim()) {
          changes[targetField] = row[origHeader].trim();
        }
      }

      if (brand) {
        newMatched.push({ brand, changes, rawName });
      } else {
        newUnmatched.push({ rawName, changes, resolution: 'skip', renameToCsv: false });
      }
    }

    setMatched(newMatched);
    setUnmatched(newUnmatched);
    setStep(2);
  };

  const setUnmatchedResolution = (index: number, resolution: 'skip' | string) =>
    setUnmatched(prev => prev.map((e, i) => i === index ? { ...e, resolution } : e));

  const setUnmatchedRename = (index: number, renameToCsv: boolean) =>
    setUnmatched(prev => prev.map((e, i) => i === index ? { ...e, renameToCsv } : e));

  const handleApply = async () => {
    setApplying(true);
    const updates: { id: string; fields: Record<string, unknown> }[] = [];

    for (const entry of matched) {
      if (onlyEmptyLogos && entry.brand.logo_url && entry.changes.logo_url) {
        continue;
      }
      if (Object.keys(entry.changes).length > 0) {
        updates.push({ id: entry.brand.id, fields: entry.changes });
      }
    }

    let skipped = 0;
    for (const entry of unmatched) {
      if (entry.resolution === 'skip' || !entry.resolution) {
        skipped++;
        continue;
      }
      const targetBrand = brands.find(b => b.id === entry.resolution);
      if (onlyEmptyLogos && targetBrand?.logo_url && entry.changes.logo_url) {
        skipped++;
        continue;
      }
      const fieldsToUpdate: Record<string, unknown> = { ...entry.changes };
      if (entry.renameToCsv) {
        fieldsToUpdate.name = entry.rawName;
      }
      if (Object.keys(fieldsToUpdate).length === 0) {
        skipped++;
        continue;
      }
      updates.push({ id: entry.resolution, fields: fieldsToUpdate });
    }

    if (updates.length === 0) {
      setResult({ updated: [], errors: [], skipped });
      setStep(3);
      setApplying(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/brand-csv-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      });
      const data = await res.json();
      if (!res.ok) {
        setParseErr(data.error || 'Erreur serveur.');
        setApplying(false);
        return;
      }
      setResult({ updated: data.updated ?? [], errors: data.errors ?? [], skipped });
      if ((data.updated ?? []).length > 0) onDone();
      setStep(3);
    } catch {
      setParseErr('Erreur réseau.');
    } finally {
      setApplying(false);
    }
  };

  const overlay: React.CSSProperties = { position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' };
  const modal: React.CSSProperties = { width: step === 2 ? '680px' : '520px', maxWidth: '95vw', maxHeight: '88vh', borderRadius: '16px', background: isDark ? '#0f172a' : '#fff', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.09)', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', transition: 'width 0.2s' };
  const sectionLabel: React.CSSProperties = { fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: isDark ? '#475569' : '#94a3b8', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '5px' };

  const eligibleMatched = matched.filter(e => {
    if (onlyEmptyLogos && e.brand.logo_url && e.changes.logo_url) return false;
    return Object.keys(e.changes).length > 0;
  });
  const eligibleRemapped = unmatched.filter(e => {
    if (e.resolution === 'skip' || !e.resolution) return false;
    const targetBrand = brands.find(b => b.id === e.resolution);
    if (onlyEmptyLogos && targetBrand?.logo_url && e.changes.logo_url) return false;
    return Object.keys(e.changes).length > 0 || e.renameToCsv;
  });
  const applyCount = eligibleMatched.length + eligibleRemapped.length;

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: isDark ? '#f1f5f9' : '#0f172a', margin: 0 }}>Importer via CSV</h2>
            <p style={{ fontSize: '12px', color: isDark ? '#475569' : '#94a3b8', marginTop: '4px' }}>
              {step === 1 && 'Colonnes supportées : name / marque, image / logo, domain, card_link, tagline, description'}
              {step === 2 && `${matched.length} correspondance${matched.length !== 1 ? 's' : ''} · ${unmatched.length} non trouvée${unmatched.length !== 1 ? 's' : ''}`}
              {step === 3 && 'Import terminé'}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: isDark ? '#475569' : '#94a3b8', padding: '2px' }}><X size={18} /></button>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {([1, 2, 3] as const).map((s, i) => (
            <React.Fragment key={s}>
              {i > 0 && <div style={{ flex: 1, height: '1px', background: step > i ? '#10b981' : (isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0') }} />}
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, background: step >= s ? 'linear-gradient(135deg,#10b981,#0d9488)' : (isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9'), color: step >= s ? '#fff' : (isDark ? '#475569' : '#94a3b8') }}>{s}</div>
            </React.Fragment>
          ))}
        </div>

        {/* ── Step 1: Upload ── */}
        {step === 1 && (
          <>
            <div
              onDragEnter={e => { e.preventDefault(); setDragging(true); }}
              onDragOver={e => e.preventDefault()}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files?.[0]; if (f) void handleFile(f); }}
              onClick={() => fileRef.current?.click()}
              style={{ minHeight: '140px', borderRadius: '12px', cursor: 'pointer', border: dragging ? '2px dashed #10b981' : (isDark ? '2px dashed rgba(255,255,255,0.1)' : '2px dashed rgba(0,0,0,0.12)'), background: dragging ? (isDark ? 'rgba(16,185,129,0.06)' : 'rgba(16,185,129,0.04)') : (isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc'), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'all 0.15s' }}
            >
              <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) void handleFile(f); e.target.value = ''; }} />
              <FileSpreadsheet size={28} style={{ color: isDark ? '#334155' : '#cbd5e1' }} />
              <span style={{ fontSize: '12px', color: isDark ? '#475569' : '#94a3b8', textAlign: 'center' }}>
                Glisser un fichier CSV ici ou <span style={{ color: '#10b981', fontWeight: 600 }}>cliquer pour sélectionner</span><br />
                <span style={{ fontSize: '11px' }}>Format .csv (virgule ou point-virgule) — ex: name,image</span>
              </span>
            </div>
            <div style={{ padding: '12px 14px', borderRadius: '10px', background: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.07)' }}>
              <p style={sectionLabel}>Exemple de format accepté</p>
              <code style={{ fontSize: '10px', color: isDark ? '#475569' : '#94a3b8', lineHeight: 1.8, display: 'block', whiteSpace: 'pre' }}>{`name,image
Vichy,https://kingphar.ma/img/m/1145-small_default.jpg
A-DERMA,https://kingphar.ma/img/m/1026-small_default.jpg`}</code>
            </div>
            {parseErr && <p style={{ fontSize: '12px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px' }}><AlertCircle size={14} />{parseErr}</p>}
          </>
        )}

        {/* ── Step 2: Review ── */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Detected columns banner & options */}
            <div style={{ padding: '10px 14px', borderRadius: '10px', background: isDark ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: isDark ? '#34d399' : '#059669', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Check size={13} /> Colonnes reconnues : {detectedCols.join(' · ')}
                </span>
              </div>
              <label style={{ fontSize: '11px', color: isDark ? '#cbd5e1' : '#475569', display: 'flex', alignItems: 'center', gap: '7px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={onlyEmptyLogos}
                  onChange={e => setOnlyEmptyLogos(e.target.checked)}
                  style={{ accentColor: '#10b981' }}
                />
                Ne mettre à jour que les cartes sans logo (conserver les logos existants)
              </label>
            </div>

            {/* Matched */}
            {matched.length > 0 && (
              <div>
                <p style={sectionLabel}><Check size={11} /> {matched.length} marque{matched.length !== 1 ? 's' : ''} correspondante{matched.length !== 1 ? 's' : ''} ({eligibleMatched.length} à mettre à jour)</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '220px', overflowY: 'auto' }}>
                  {matched.map((entry, i) => {
                    const hasChanges = Object.keys(entry.changes).length > 0;
                    const skippedByLogoOption = onlyEmptyLogos && entry.brand.logo_url && entry.changes.logo_url;
                    return (
                      <div key={i} style={{ padding: '8px 10px', borderRadius: '8px', background: isDark ? 'rgba(16,185,129,0.05)' : 'rgba(16,185,129,0.04)', border: isDark ? '1px solid rgba(16,185,129,0.12)' : '1px solid rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {entry.changes.logo_url && (
                          <img
                            src={entry.changes.logo_url}
                            alt=""
                            style={{ width: '28px', height: '28px', objectFit: 'contain', borderRadius: '6px', background: '#fff', border: '1px solid rgba(0,0,0,0.1)', flexShrink: 0 }}
                            onError={e => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                          />
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: isDark ? '#34d399' : '#059669' }}>{entry.brand.name}</span>
                            {entry.rawName.toLowerCase() !== entry.brand.name.toLowerCase() && (
                              <span style={{ fontSize: '10px', color: isDark ? '#475569' : '#94a3b8', fontFamily: 'monospace' }}>← CSV: {entry.rawName}</span>
                            )}
                          </div>
                          {skippedByLogoOption ? (
                            <span style={{ fontSize: '10px', color: isDark ? '#64748b' : '#94a3b8', fontStyle: 'italic' }}>Logo déjà présent — ignoré selon option</span>
                          ) : hasChanges ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                              {(Object.entries(entry.changes) as [CsvAllowedField, string][]).map(([field, val]) => (
                                <span key={field} title={val} style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '6px', background: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9', color: isDark ? '#94a3b8' : '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '320px', whiteSpace: 'nowrap', display: 'inline-block' }}>
                                  <strong>{CSV_FIELD_LABELS[field]}</strong>: {val}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span style={{ fontSize: '10px', color: isDark ? '#334155' : '#94a3b8' }}>Aucune colonne à mettre à jour</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Unmatched */}
            {unmatched.length > 0 && (
              <div>
                <p style={sectionLabel}><AlertCircle size={11} /> {unmatched.length} non trouvée{unmatched.length !== 1 ? 's' : ''} — associer ou ignorer</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                  {unmatched.map((entry, i) => (
                    <div key={i} style={{ padding: '10px 12px', borderRadius: '10px', background: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.08)' }}>
                      {/* Row header */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                          {entry.changes.logo_url && (
                            <img
                              src={entry.changes.logo_url}
                              alt=""
                              style={{ width: '24px', height: '24px', objectFit: 'contain', borderRadius: '4px', background: '#fff', border: '1px solid rgba(0,0,0,0.1)', flexShrink: 0 }}
                              onError={e => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                            />
                          )}
                          <span style={{ fontSize: '12px', fontWeight: 700, color: isDark ? '#e2e8f0' : '#0f172a', fontFamily: 'monospace' }}>{entry.rawName}</span>
                        </div>
                        <button
                          onClick={() => setUnmatchedResolution(i, entry.resolution === 'skip' ? '' : 'skip')}
                          style={{ padding: '3px 10px', fontSize: '10px', fontWeight: 600, borderRadius: '999px', flexShrink: 0, border: entry.resolution !== 'skip' ? '1px solid rgba(16,185,129,0.3)' : (isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)'), background: entry.resolution !== 'skip' ? (isDark ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.07)') : (isDark ? 'rgba(255,255,255,0.03)' : '#f1f5f9'), color: entry.resolution !== 'skip' ? (isDark ? '#34d399' : '#059669') : (isDark ? '#475569' : '#94a3b8'), cursor: 'pointer' }}
                        >
                          {entry.resolution === 'skip' ? 'Ignorer' : '✓ Associé'}
                        </button>
                      </div>
                      {/* Search input */}
                      <input
                        type="text"
                        placeholder="Rechercher une marque existante à associer…"
                        value={brandSearch[i] ?? ''}
                        onChange={e => setBrandSearch(prev => ({ ...prev, [i]: e.target.value }))}
                        style={{ width: '100%', fontSize: '11px', padding: '6px 10px', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(0,0,0,0.1)', background: isDark ? 'rgba(255,255,255,0.03)' : '#fff', color: isDark ? '#e2e8f0' : '#0f172a', outline: 'none', boxSizing: 'border-box' }}
                      />
                      {/* Filtered dropdown */}
                      {(brandSearch[i] ?? '').length > 0 && (
                        <div style={{ marginTop: '4px', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.08)', background: isDark ? '#0a1628' : '#fff', overflow: 'hidden' }}>
                          {brands
                            .filter(b => b.name.toLowerCase().includes((brandSearch[i] ?? '').toLowerCase()))
                            .slice(0, 7)
                            .map(b => (
                              <button
                                key={b.id}
                                onClick={() => { setUnmatchedResolution(i, b.id); setBrandSearch(prev => ({ ...prev, [i]: '' })); }}
                                style={{ width: '100%', padding: '7px 10px', fontSize: '12px', fontWeight: entry.resolution === b.id ? 700 : 400, textAlign: 'left', background: entry.resolution === b.id ? (isDark ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.07)') : 'transparent', color: entry.resolution === b.id ? (isDark ? '#34d399' : '#059669') : (isDark ? '#e2e8f0' : '#0f172a'), border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                              >
                                <span>{b.name}</span>
                                {b.domain && <span style={{ fontSize: '10px', color: isDark ? '#475569' : '#94a3b8', fontFamily: 'monospace' }}>{b.domain}</span>}
                              </button>
                            ))}
                          {brands.filter(b => b.name.toLowerCase().includes((brandSearch[i] ?? '').toLowerCase())).length === 0 && (
                            <p style={{ fontSize: '11px', color: isDark ? '#475569' : '#94a3b8', padding: '8px 10px', margin: 0 }}>Aucune marque trouvée</p>
                          )}
                        </div>
                      )}
                      {/* Selected brand label & Rename option */}
                      {entry.resolution !== 'skip' && entry.resolution && (
                        <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <p style={{ fontSize: '10px', color: isDark ? '#34d399' : '#059669', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Check size={10} /> Données appliquées à : <strong>{brands.find(b => b.id === entry.resolution)?.name}</strong>
                          </p>
                          <label style={{ fontSize: '11px', color: isDark ? '#94a3b8' : '#64748b', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={entry.renameToCsv ?? false}
                              onChange={e => setUnmatchedRename(i, e.target.checked)}
                              style={{ accentColor: '#10b981' }}
                            />
                            Renommer la marque en « <strong>{entry.rawName}</strong> »
                          </label>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {matched.length === 0 && unmatched.length === 0 && (
              <p style={{ fontSize: '12px', color: isDark ? '#475569' : '#94a3b8', textAlign: 'center' }}>Aucune ligne trouvée dans le fichier CSV.</p>
            )}

            {parseErr && <p style={{ fontSize: '12px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px' }}><AlertCircle size={14} />{parseErr}</p>}
          </div>
        )}

        {/* ── Step 3: Results ── */}
        {step === 3 && result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {result.updated.length > 0 && (
              <div>
                <p style={{ fontSize: '11px', fontWeight: 700, color: '#10b981', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Check size={13} /> {result.updated.length} marque{result.updated.length !== 1 ? 's' : ''} mise{result.updated.length !== 1 ? 's' : ''} à jour
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', maxHeight: '150px', overflowY: 'auto' }}>
                  {result.updated.map(name => (
                    <span key={name} style={{ fontSize: '12px', color: isDark ? '#34d399' : '#059669', padding: '3px 8px', borderRadius: '6px', background: isDark ? 'rgba(16,185,129,0.07)' : 'rgba(16,185,129,0.06)' }}>{name}</span>
                  ))}
                </div>
              </div>
            )}
            {result.skipped > 0 && (
              <p style={{ fontSize: '11px', color: isDark ? '#64748b' : '#94a3b8' }}>
                {result.skipped} ligne{result.skipped !== 1 ? 's' : ''} ignorée{result.skipped !== 1 ? 's' : ''}
              </p>
            )}
            {result.errors.length > 0 && (
              <div>
                <p style={{ fontSize: '11px', fontWeight: 700, color: '#ef4444', marginBottom: '6px' }}>{result.errors.length} erreur{result.errors.length !== 1 ? 's' : ''}</p>
                {result.errors.map(e => (
                  <p key={e.id} style={{ fontSize: '11px', color: '#ef4444', margin: '2px 0', fontFamily: 'monospace' }}>{e.id}: {e.error}</p>
                ))}
              </div>
            )}
            {result.updated.length === 0 && result.errors.length === 0 && (
              <p style={{ fontSize: '12px', color: isDark ? '#475569' : '#94a3b8' }}>Aucune modification appliquée.</p>
            )}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            {step === 2 && (
              <button onClick={() => setStep(1)} style={{ fontSize: '12px', fontWeight: 600, color: isDark ? '#475569' : '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ArrowLeft size={13} /> Retour
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={onClose} style={{ padding: '8px 16px', fontSize: '12px', fontWeight: 600, borderRadius: '10px', border: isDark ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(0,0,0,0.1)', background: 'transparent', color: isDark ? '#64748b' : '#94a3b8', cursor: 'pointer' }}>
              {step === 3 ? 'Fermer' : 'Annuler'}
            </button>
            {step === 2 && (
              <button
                onClick={() => void handleApply()}
                disabled={applying || applyCount === 0}
                style={{ padding: '8px 18px', fontSize: '12px', fontWeight: 700, borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#10b981,#0d9488)', color: '#fff', cursor: applying || applyCount === 0 ? 'not-allowed' : 'pointer', opacity: applying || applyCount === 0 ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Check size={13} /> {applying ? 'Application…' : `Appliquer${applyCount > 0 ? ` (${applyCount})` : ''}`}
              </button>
            )}
          </div>
        </div>

      </div>
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
                    currentUrl={brandLogoSrc(name, domain, logoUrl)}
                    isDark={isDark}
                    onUploaded={url => { setLogoUrl(url); markDirty(); }}
                  />
                  <p style={{ fontSize: '10px', color: isDark ? '#334155' : '#94a3b8', marginTop: '6px' }}>
                    {logoUrl === '' ? 'Logo supprimé : le nom sera affiché. Enregistrez pour appliquer ce changement.' : "Le logo s'affiche sur la carte défilante de la page d'accueil. Fond blanc recommandé."}
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
              <BrandLogo name={name || 'Marque'} domain={domain} logo={logoUrl} />
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
  return <React.Suspense fallback={<AsyncState kind="loading" />}><ContentBrands /></React.Suspense>;
}

function ContentBrands() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedSlug = searchParams.get('brand');
  const { currentUser, adminTheme } = useAdmin();
  const isDark = adminTheme === 'dark';
  const role = currentUser?.role ?? 'viewer';
  const canManage = canManageBrands(role as any);

  const [brands, setBrands] = useState<CmsBrand[]>([]);
  // Keep list filters alive while the editor or loading state replaces the list.
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CmsStatus | 'all'>('all');
  const [imageFilter, setImageFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const selected = brands.find(brand => brand.slug === selectedSlug) ?? null;
  const selectBrand = useCallback((brand: CmsBrand | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (brand) params.set('brand', brand.slug);
    else params.delete('brand');
    const query = params.toString();
    router.push(`/admin/content/brands${query ? `?${query}` : ''}`, { scroll: false });
  }, [router, searchParams]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ imported: number; total: number } | null>(null);

  const loadBrands = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const data = await requestJson<{ brands?: CmsBrand[] }>('/api/cms/brands');
      setBrands(data.brands ?? []);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Impossible de charger les marques.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadBrands(); }, [loadBrands]);

  const handleSync = useCallback(async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch('/api/cms/brands', { method: 'PUT' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Impossible de synchroniser les marques.');
      if (res.ok) {
        setBrands(data.brands ?? []);
        setSyncResult({ imported: data.imported, total: data.total });
        setTimeout(() => setSyncResult(null), 5000);
      }
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Impossible de synchroniser les marques.');
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
    selectBrand(brand);
    void loadBrands();
  }, [selectBrand, loadBrands]);

  const handleUpdated = useCallback((updated: CmsBrand) => {
    setBrands(prev => prev.map(b => b.id === updated.id ? updated : b));
    void loadBrands();
  }, [loadBrands]);

  const visibleCount = brands.filter(b => b.is_visible && b.status === 'published').length;

  const handleDeleteBrand = useCallback(async (brand: CmsBrand) => {
    const confirm = window.confirm(`Voulez-vous vraiment supprimer la marque "${brand.name}" ? Cette action effacera la marque et détachera les produits associés.`);
    if (!confirm) return;

    try {
      const res = await fetch(`/api/cms/brands?id=${encodeURIComponent(brand.id)}&name=${encodeURIComponent(brand.name)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setBrands(prev => prev.filter(b => b.id !== brand.id));
      } else {
        alert('Erreur lors de la suppression de la marque.');
      }
    } catch {
      alert('Erreur réseau lors de la suppression.');
    }
  }, []);

  if (!canManage) {
    return <AsyncState kind="forbidden" description="Votre rôle ne permet pas de gérer les pages de marque." />;
  }

  if (loading) {
    return <AsyncState kind="loading" />;
  }

  if (loadError) return <AsyncState kind="error" description={loadError} onRetry={loadBrands} />;

  if (selectedSlug && !selected) {
    return <AsyncState kind="error" description="Cette marque est introuvable." onRetry={() => selectBrand(null)} />;
  }

  if (selected) {
    return <BrandEditor key={selected.id} brand={selected} onBack={() => selectBrand(null)} isDark={isDark} role={role} onUpdated={handleUpdated} />;
  }

  return (
    <>
      {showAddModal && (
        <AddBrandModal isDark={isDark} onClose={() => setShowAddModal(false)} onCreated={handleCreated} />
      )}
      {showBulkModal && (
        <BulkImageUploadModal isDark={isDark} onClose={() => setShowBulkModal(false)} onDone={() => { void loadBrands(); }} />
      )}
      {showCsvModal && (
        <BrandCsvImportModal isDark={isDark} onClose={() => setShowCsvModal(false)} onDone={() => { void loadBrands(); }} brands={brands} />
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
              onClick={() => setShowCsvModal(true)}
              title="Importer des données marques via un fichier CSV"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontSize: '12px', fontWeight: 600, borderRadius: '10px', cursor: 'pointer', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', background: 'transparent', color: isDark ? '#94a3b8' : '#64748b' }}
            >
              <FileSpreadsheet size={13} />
              Importer CSV
            </button>
            <button
              onClick={() => setShowBulkModal(true)}
              title="Importer des logos pour plusieurs marques à la fois"
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 14px', fontSize: '12px', fontWeight: 600,
                borderRadius: '10px', cursor: 'pointer',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                background: 'transparent',
                color: isDark ? '#94a3b8' : '#64748b',
              }}
            >
              <FileImage size={13} />
              Importer logos
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
          onSelect={selectBrand}
          onToggleVisible={handleToggleVisible}
          onDelete={handleDeleteBrand}
          isDark={isDark}
          canManage={canManage}
          query={query}
          setQuery={setQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          imageFilter={imageFilter}
          setImageFilter={setImageFilter}
        />
      </div>
    </>
  );
}
