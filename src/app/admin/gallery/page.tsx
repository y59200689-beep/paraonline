'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAdmin } from '@/context/AdminContext';
import {
  Images,
  Upload,
  Camera,
  CheckCircle2,
  X,
  RefreshCw,
  AlertCircle,
  Filter,
  ChevronDown,
  Layers,
  Maximize2,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Group = 'all' | 'heroes' | 'concerns' | 'brands' | 'categories' | 'bundles' | 'promo' | 'logo' | 'users';

interface GalleryImage {
  key: string;
  label: string;
  group: Exclude<Group, 'all'>;
  filePath: string;
  url: string;
  sizeKb: number;
  width?: number;
  height?: number;
  dimensions?: string;
}

interface PendingUpload {
  key: string;
  file: File;
  previewUrl: string;
}

interface ToastState {
  type: 'success' | 'error';
  message: string;
}

// ─── Group config ─────────────────────────────────────────────────────────────

const GROUP_LABELS: Record<Group, string> = {
  all: 'Tout',
  heroes: 'Heroes',
  concerns: 'Problèmes',
  brands: 'Marques',
  categories: 'Catégories',
  bundles: 'Bundles',
  promo: 'Promotions',
  logo: 'Logo & OG',
  users: 'Avis Clients',
};

const GROUP_COLORS: Record<Exclude<Group, 'all'>, string> = {
  heroes: '#6366f1',
  concerns: '#f59e0b',
  brands: '#10b981',
  categories: '#3b82f6',
  bundles: '#ec4899',
  promo: '#f43f5e',
  logo: '#8b5cf6',
  users: '#06b6d4',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatKb(kb: number): string {
  if (kb >= 1000) return `${(kb / 1000).toFixed(1)} MB`;
  return `${kb} KB`;
}

function getExtension(filename: string): string {
  return filename.split('.').pop()?.toUpperCase() || '';
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function GroupBadge({ group }: { group: Exclude<Group, 'all'> }) {
  const color = GROUP_COLORS[group];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest"
      style={{
        background: `${color}18`,
        color,
        border: `1px solid ${color}30`,
      }}
    >
      {GROUP_LABELS[group]}
    </span>
  );
}

// ─── Image Card ───────────────────────────────────────────────────────────────

interface ImageCardProps {
  image: GalleryImage;
  isDark: boolean;
  pending: PendingUpload | null;
  uploading: boolean;
  onPick: (key: string, file: File, previewUrl: string) => void;
  onCancelPending: (key: string) => void;
}

function ImageCard({ image, isDark, pending, uploading, onPick, onCancelPending }: ImageCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  const displayUrl = pending ? pending.previewUrl : `${image.url}?t=${Date.now()}`;
  const hasPending = !!pending;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    onPick(image.key, file, previewUrl);
    e.target.value = '';
  };

  const cardBg = isDark ? 'hsl(224,25%,9%)' : '#ffffff';
  const borderColor = hasPending
    ? (isDark ? 'rgba(16,185,129,0.35)' : 'rgba(16,185,129,0.4)')
    : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)');
  const shadowColor = isDark
    ? 'rgba(0,0,0,0.45)'
    : 'rgba(15,30,54,0.08)';

  return (
    <div
      className="relative group flex flex-col overflow-hidden transition-all duration-300"
      style={{
        background: cardBg,
        border: `1px solid ${borderColor}`,
        borderRadius: '16px',
        boxShadow: isHovered
          ? `0 16px 48px ${shadowColor}, 0 4px 12px ${shadowColor}`
          : `0 2px 8px ${shadowColor}`,
        transform: isHovered && !hasPending ? 'translateY(-2px)' : 'none',
        transition: 'box-shadow 0.25s ease, transform 0.25s ease, border-color 0.25s ease',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image area */}
      <div
        className="relative overflow-hidden"
        style={{
          background: isDark ? 'hsl(224,22%,11%)' : 'hsl(220,20%,97%)',
          aspectRatio: '16/9',
        }}
      >
        {/* Actual image */}
        {!imgError ? (
          <img
            src={displayUrl}
            alt={image.label}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500"
            style={{ transform: isHovered ? 'scale(1.04)' : 'scale(1)' }}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <Images className="w-8 h-8" style={{ color: isDark ? '#334155' : '#cbd5e1' }} />
            <span className="text-[10px] font-medium" style={{ color: isDark ? '#334155' : '#94a3b8' }}>
              Image introuvable
            </span>
          </div>
        )}

        {/* Pending badge overlay */}
        {hasPending && (
          <div
            className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full"
            style={{ background: 'rgba(16,185,129,0.9)', backdropFilter: 'blur(8px)' }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-[9px] font-black text-white uppercase tracking-wider">En attente</span>
          </div>
        )}

        {/* Pixel Dimensions Badge */}
        {image.dimensions && !hasPending && (
          <div
            className="absolute bottom-2 left-2 px-2 py-0.5 rounded-lg font-mono text-[9.5px] font-bold flex items-center gap-1.5 shadow-sm"
            style={{
              background: isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(8px)',
              color: isDark ? '#38bdf8' : '#0284c7',
              border: isDark ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid rgba(2, 132, 199, 0.25)',
            }}
          >
            <Maximize2 className="w-2.5 h-2.5" />
            <span>{image.dimensions}</span>
          </div>
        )}

        {/* Format chip */}
        <div
          className="absolute top-2 right-2 px-2 py-0.5 rounded-full font-mono text-[9px] font-bold"
          style={{
            background: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(8px)',
            color: isDark ? '#94a3b8' : '#64748b',
            border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
          }}
        >
          {getExtension(image.filePath)}
        </div>

        {/* Hover overlay — Replace button */}
        {!hasPending && (
          <div
            className="absolute inset-0 flex items-center justify-center transition-all duration-250 z-10"
            style={{
              background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(4px)',
              opacity: isHovered ? 1 : 0,
              pointerEvents: isHovered ? 'auto' : 'none',
            }}
          >
            <button
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-[12px] text-white cursor-pointer transition-all duration-200 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                boxShadow: '0 8px 24px rgba(16,185,129,0.45)',
                border: '1px solid rgba(16,185,129,0.5)',
              }}
            >
              <Camera className="w-3.5 h-3.5" />
              Remplacer
            </button>
          </div>
        )}

        {/* Cancel pending overlay */}
        {hasPending && (
          <button
            onClick={() => onCancelPending(image.key)}
            className="absolute top-2 right-10 p-1 rounded-full cursor-pointer transition-all duration-200 hover:scale-110 z-20"
            style={{
              background: 'rgba(244,63,94,0.85)',
              backdropFilter: 'blur(8px)',
            }}
            title="Annuler"
          >
            <X className="w-3 h-3 text-white" />
          </button>
        )}
      </div>

      {/* Card footer */}
      <div className="flex flex-col gap-1.5 p-3">
        <div className="flex items-start justify-between gap-2">
          <p
            className="text-[11.5px] font-bold leading-snug line-clamp-2"
            style={{ color: isDark ? '#e2e8f0' : '#1e293b' }}
          >
            {image.label}
          </p>
          <GroupBadge group={image.group} />
        </div>

        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap text-[9.5px] font-mono">
          {/* Dimensions */}
          {image.dimensions && (
            <>
              <span
                className="font-bold flex items-center gap-1"
                style={{ color: isDark ? '#38bdf8' : '#0284c7' }}
              >
                <Maximize2 className="w-2.5 h-2.5 inline" />
                {image.dimensions}
              </span>
              <span
                className="w-0.5 h-0.5 rounded-full"
                style={{ background: isDark ? '#334155' : '#cbd5e1' }}
              />
            </>
          )}

          {/* File size */}
          <span
            className="font-semibold"
            style={{ color: isDark ? '#94a3b8' : '#64748b' }}
          >
            {hasPending
              ? formatKb(Math.round(pending!.file.size / 1024))
              : formatKb(image.sizeKb)}
          </span>
          <span
            className="w-0.5 h-0.5 rounded-full"
            style={{ background: isDark ? '#334155' : '#cbd5e1' }}
          />
          {/* File path */}
          <span
            className="truncate max-w-[110px]"
            style={{ color: isDark ? '#475569' : '#cbd5e1' }}
          >
            {image.filePath}
          </span>
        </div>

        {/* Replace file button (always visible at bottom) */}
        <button
          onClick={() => inputRef.current?.click()}
          className="mt-1 flex items-center justify-center gap-1.5 w-full px-3 py-1.5 rounded-lg text-[10.5px] font-semibold cursor-pointer transition-all duration-200"
          style={{
            background: hasPending
              ? (isDark ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.08)')
              : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'),
            border: hasPending
              ? (isDark ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(16,185,129,0.3)')
              : (isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)'),
            color: hasPending
              ? (isDark ? '#34d399' : '#059669')
              : (isDark ? '#64748b' : '#94a3b8'),
          }}
        >
          <Upload className="w-3 h-3" />
          {hasPending ? 'Changer la sélection' : 'Uploader un fichier'}
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ toast, onDismiss, isDark }: { toast: ToastState; onDismiss: () => void; isDark: boolean }) {
  const isSuccess = toast.type === 'success';
  return (
    <div
      className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl animate-slide-in"
      style={{
        background: isDark
          ? (isSuccess ? 'hsl(152,30%,10%)' : 'hsl(354,30%,10%)')
          : (isSuccess ? '#f0fdf4' : '#fff1f2'),
        border: isSuccess
          ? (isDark ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(16,185,129,0.35)')
          : (isDark ? '1px solid rgba(244,63,94,0.25)' : '1px solid rgba(244,63,94,0.35)'),
        boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.6)' : '0 12px 40px rgba(0,0,0,0.14)',
        maxWidth: '380px',
      }}
    >
      {isSuccess
        ? <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: '#10b981' }} />
        : <AlertCircle className="w-4 h-4 shrink-0" style={{ color: '#f43f5e' }} />}
      <p
        className="text-[12px] font-semibold flex-1"
        style={{ color: isDark ? (isSuccess ? '#6ee7b7' : '#fda4af') : (isSuccess ? '#065f46' : '#be123c') }}
      >
        {toast.message}
      </p>
      <button onClick={onDismiss} className="cursor-pointer transition-opacity hover:opacity-60">
        <X className="w-3.5 h-3.5" style={{ color: isDark ? '#475569' : '#94a3b8' }} />
      </button>
    </div>
  );
}

// ─── Confirm bar ──────────────────────────────────────────────────────────────

interface ConfirmBarProps {
  pendingCount: number;
  uploading: boolean;
  isDark: boolean;
  onConfirm: () => void;
  onCancelAll: () => void;
}

function ConfirmBar({ pendingCount, uploading, isDark, onConfirm, onCancelAll }: ConfirmBarProps) {
  if (pendingCount === 0) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between gap-4 px-6 py-4"
      style={{
        background: isDark
          ? 'linear-gradient(180deg, transparent 0%, hsl(224,28%,7%) 40%)'
          : 'linear-gradient(180deg, transparent 0%, rgba(240,245,250,0.97) 40%)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.06)',
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center w-8 h-8 rounded-xl font-black text-white text-[12px]"
          style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 4px 12px rgba(16,185,129,0.4)' }}
        >
          {pendingCount}
        </div>
        <div>
          <p className="text-[12px] font-bold" style={{ color: isDark ? '#e2e8f0' : '#1e293b' }}>
            {pendingCount === 1 ? '1 image à remplacer' : `${pendingCount} images à remplacer`}
          </p>
          <p className="text-[10px] font-medium" style={{ color: isDark ? '#475569' : '#94a3b8' }}>
            Les fichiers seront écrasés de façon permanente
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onCancelAll}
          disabled={uploading}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-semibold cursor-pointer transition-all duration-200 hover:opacity-80 disabled:opacity-40"
          style={{
            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
            border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
            color: isDark ? '#94a3b8' : '#64748b',
          }}
        >
          <X className="w-3 h-3" />
          Annuler tout
        </button>

        <button
          onClick={onConfirm}
          disabled={uploading}
          className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-[11px] font-bold text-white cursor-pointer transition-all duration-200 active:scale-95 disabled:opacity-60"
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            boxShadow: '0 6px 20px rgba(16,185,129,0.4)',
          }}
        >
          {uploading ? (
            <>
              <RefreshCw className="w-3 h-3 animate-spin" />
              Envoi en cours...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3 h-3" />
              Confirmer le remplacement
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Main Gallery page ────────────────────────────────────────────────────────

export default function GalleryPage() {
  const { adminTheme } = useAdmin();
  const isDark = adminTheme === 'dark';

  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGroup, setActiveGroup] = useState<Group>('all');
  const [pendingMap, setPendingMap] = useState<Map<string, PendingUpload>>(new Map());
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [search, setSearch] = useState('');

  // Sync active group from URL query or localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const groupParam = params.get('group') as Group | null;
    const storedGroup = localStorage.getItem('admin_gallery_group') as Group | null;
    
    const validGroups: Group[] = ['all', 'heroes', 'concerns', 'brands', 'categories', 'bundles', 'promo', 'logo', 'users'];
    
    if (groupParam && validGroups.includes(groupParam)) {
      setActiveGroup(groupParam);
    } else if (storedGroup && validGroups.includes(storedGroup)) {
      setActiveGroup(storedGroup);
    }
  }, []);

  const handleGroupSelect = useCallback((group: Group) => {
    setActiveGroup(group);
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_gallery_group', group);
      const url = new URL(window.location.href);
      if (group === 'all') {
        url.searchParams.delete('group');
      } else {
        url.searchParams.set('group', group);
      }
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  // Fetch manifest
  useEffect(() => {
    setLoading(true);
    fetch('/api/admin/gallery')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          let list: GalleryImage[] = data.images;
          if (typeof window !== 'undefined') {
            try {
              const overrides = JSON.parse(localStorage.getItem('custom_gallery_overrides') || '{}');
              list = list.map(img => overrides[img.key] ? { ...img, url: overrides[img.key] } : img);
            } catch {}
          }
          setImages(list);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
  };

  // Pick handler
  const handlePick = useCallback((key: string, file: File, previewUrl: string) => {
    setPendingMap(prev => {
      const next = new Map(prev);
      // Revoke old preview URL if exists
      const old = next.get(key);
      if (old) URL.revokeObjectURL(old.previewUrl);
      next.set(key, { key, file, previewUrl });
      return next;
    });
  }, []);

  const handleCancelPending = useCallback((key: string) => {
    setPendingMap(prev => {
      const next = new Map(prev);
      const entry = next.get(key);
      if (entry) URL.revokeObjectURL(entry.previewUrl);
      next.delete(key);
      return next;
    });
  }, []);

  const handleCancelAll = useCallback(() => {
    pendingMap.forEach(entry => URL.revokeObjectURL(entry.previewUrl));
    setPendingMap(new Map());
  }, [pendingMap]);

  // Confirm all uploads
  const handleConfirm = useCallback(async () => {
    if (uploading || pendingMap.size === 0) return;
    setUploading(true);

    const entries = Array.from(pendingMap.values());
    let successCount = 0;
    let failCount = 0;

    for (const entry of entries) {
      try {
        const fd = new FormData();
        fd.append('key', entry.key);
        fd.append('file', entry.file);

        const res = await fetch('/api/admin/gallery', { method: 'POST', body: fd });
        const data = await res.json();

        if (data.success) {
          successCount++;
          const newUrl = data.url ? (data.url.startsWith('data:') ? data.url : `${data.url.split('?')[0]}?v=${Date.now()}`) : entry.previewUrl;

          // Save override to localStorage for real-time site sync
          if (typeof window !== 'undefined') {
            try {
              const existing = JSON.parse(localStorage.getItem('custom_gallery_overrides') || '{}');
              existing[entry.key] = newUrl;
              localStorage.setItem('custom_gallery_overrides', JSON.stringify(existing));
              window.dispatchEvent(new Event('gallery_overrides_updated'));
            } catch {}
          }

          // Update url, size, and dimensions in local state
          setImages(prev => prev.map(img =>
            img.key === entry.key ? {
              ...img,
              url: newUrl,
              sizeKb: data.sizeKb || img.sizeKb,
              width: data.width || img.width,
              height: data.height || img.height,
              dimensions: data.dimensions || img.dimensions,
            } : img
          ));
        } else {
          failCount++;
          console.error(`[gallery] Failed to replace ${entry.key}:`, data.error);
        }
      } catch (err) {
        failCount++;
        console.error(`[gallery] Error replacing ${entry.key}:`, err);
      } finally {
        URL.revokeObjectURL(entry.previewUrl);
      }
    }

    setPendingMap(new Map());
    setUploading(false);

    if (failCount === 0) {
      showToast('success', successCount === 1
        ? 'Image remplacée avec succès.'
        : `${successCount} images remplacées avec succès.`);
    } else if (successCount === 0) {
      showToast('error', `Échec du remplacement de ${failCount} image${failCount > 1 ? 's' : ''}.`);
    } else {
      showToast('success', `${successCount} image${successCount > 1 ? 's' : ''} remplacée${successCount > 1 ? 's' : ''}. ${failCount} en échec.`);
    }
  }, [uploading, pendingMap]);

  // Filter + search
  const filtered = images.filter(img => {
    const matchGroup = activeGroup === 'all' || img.group === activeGroup;
    const matchSearch = !search || img.label.toLowerCase().includes(search.toLowerCase()) || img.key.toLowerCase().includes(search.toLowerCase());
    return matchGroup && matchSearch;
  });

  // Group counts
  const groupCounts = images.reduce<Record<string, number>>((acc, img) => {
    acc[img.group] = (acc[img.group] || 0) + 1;
    return acc;
  }, {});

  // ── styles ──────────────────────────────────────────────────────────────────
  const surfaceBg = isDark ? 'hsl(224,25%,9%)' : '#ffffff';
  const border = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)';
  const textPrimary = isDark ? 'hsl(214,35%,95%)' : 'hsl(222,47%,10%)';
  const textMuted = isDark ? 'hsl(215,22%,46%)' : 'hsl(215,18%,46%)';

  const groups: Group[] = ['all', 'heroes', 'concerns', 'brands', 'categories', 'bundles', 'promo', 'logo', 'users'];

  return (
    <>
      {/* ── Page header section ─────────────────────────────────────────────── */}
      <div className="space-y-6" style={{ paddingBottom: pendingMap.size > 0 ? '96px' : 0 }}>

        {/* Summary bar */}
        <div
          className="flex items-center justify-between gap-4 flex-wrap p-4 rounded-2xl"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(16,185,129,0.07) 0%, rgba(99,102,241,0.05) 100%)'
              : 'linear-gradient(135deg, rgba(16,185,129,0.06) 0%, rgba(99,102,241,0.04) 100%)',
            border: `1px solid ${isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.2)'}`,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #10b981 0%, #6366f1 100%)', boxShadow: '0 4px 14px rgba(16,185,129,0.35)' }}
            >
              <Images className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[13px] font-black" style={{ color: textPrimary }}>
                {images.length} images référencées
              </p>
              <p className="text-[10.5px] font-medium" style={{ color: textMuted }}>
                Cliquez sur une image pour la remplacer · Confirmez avant d'envoyer
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Search input */}
            <div
              className="relative flex items-center"
            >
              <Filter
                className="absolute left-2.5 w-3 h-3 pointer-events-none"
                style={{ color: isDark ? '#475569' : '#94a3b8' }}
              />
              <input
                type="text"
                placeholder="Filtrer par nom..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-7 pr-3 py-1.5 rounded-xl text-[11px] font-medium outline-none transition-all duration-200"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                  border: `1px solid ${border}`,
                  color: textPrimary,
                  width: '180px',
                }}
              />
            </div>

            {/* Total size chip */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
              style={{
                background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                border: `1px solid ${border}`,
              }}
            >
              <Layers className="w-3 h-3" style={{ color: isDark ? '#475569' : '#94a3b8' }} />
              <span className="text-[10.5px] font-mono font-semibold" style={{ color: textMuted }}>
                {formatKb(images.reduce((a, i) => a + i.sizeKb, 0))} total
              </span>
            </div>
          </div>
        </div>

        {/* ── Group filter pills ───────────────────────────────────────────── */}
        <div className="flex items-center gap-2 flex-wrap">
          {groups.map(group => {
            const isActive = activeGroup === group;
            const count = group === 'all' ? images.length : (groupCounts[group] || 0);
            const color = group === 'all' ? '#10b981' : GROUP_COLORS[group as Exclude<Group, 'all'>];

            return (
              <button
                key={group}
                onClick={() => handleGroupSelect(group)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold cursor-pointer transition-all duration-200 select-none"
                style={{
                  background: isActive
                    ? `${color}18`
                    : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'),
                  border: isActive
                    ? `1px solid ${color}40`
                    : `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
                  color: isActive ? color : (isDark ? '#64748b' : '#94a3b8'),
                  transform: isActive ? 'none' : undefined,
                }}
              >
                {GROUP_LABELS[group]}
                <span
                  className="px-1.5 py-0.5 rounded-full text-[9px] font-black"
                  style={{
                    background: isActive ? `${color}25` : (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'),
                    color: isActive ? color : (isDark ? '#475569' : '#94a3b8'),
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Loading skeleton ─────────────────────────────────────────────── */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl overflow-hidden"
                style={{ border: `1px solid ${border}`, background: surfaceBg }}
              >
                <div
                  className={`${isDark ? 'admin-skeleton-dark' : 'admin-skeleton'}`}
                  style={{ aspectRatio: '16/9' }}
                />
                <div className="p-3 space-y-2">
                  <div className={`h-3 w-3/4 rounded-full ${isDark ? 'admin-skeleton-dark' : 'admin-skeleton'}`} />
                  <div className={`h-2.5 w-1/2 rounded-full ${isDark ? 'admin-skeleton-dark' : 'admin-skeleton'}`} />
                  <div className={`h-7 w-full rounded-lg ${isDark ? 'admin-skeleton-dark' : 'admin-skeleton'}`} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Empty state ──────────────────────────────────────────────────── */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', border: `1px solid ${border}` }}
            >
              <Images className="w-7 h-7" style={{ color: isDark ? '#334155' : '#cbd5e1' }} />
            </div>
            <p className="text-[13px] font-bold" style={{ color: textMuted }}>
              Aucune image trouvée
            </p>
            <p className="text-[11px]" style={{ color: isDark ? '#334155' : '#cbd5e1' }}>
              Essayez un autre filtre ou terme de recherche.
            </p>
          </div>
        )}

        {/* ── Image grid ──────────────────────────────────────────────────── */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(image => (
              <ImageCard
                key={image.key}
                image={image}
                isDark={isDark}
                pending={pendingMap.get(image.key) || null}
                uploading={uploading}
                onPick={handlePick}
                onCancelPending={handleCancelPending}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Confirm bar (sticky bottom) ──────────────────────────────────────── */}
      <ConfirmBar
        pendingCount={pendingMap.size}
        uploading={uploading}
        isDark={isDark}
        onConfirm={handleConfirm}
        onCancelAll={handleCancelAll}
      />

      {/* ── Toast ─────────────────────────────────────────────────────────────── */}
      {toast && (
        <Toast toast={toast} onDismiss={() => setToast(null)} isDark={isDark} />
      )}
    </>
  );
}
