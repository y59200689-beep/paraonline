'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { canEditContent } from '@/lib/permissions';
import { SearchCode, Save, Loader2, Globe, Image, Check } from 'lucide-react';
import { BilingualField } from '@/components/admin/ui/BilingualField';

export default function ContentSeoPage() {
  const { currentUser, adminTheme } = useAdmin();
  const isDark = adminTheme === 'dark';
  const role = currentUser?.role ?? 'viewer';

  const canEdit = canEditContent(role as any);

  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const [defaultTitleFr, setDefaultTitleFr] = useState('Para Officinal S.A | Parapharmacie & K-Beauty Maroc');
  const [defaultTitleAr, setDefaultTitleAr] = useState('بارا أوفيسينال | صيدلية ومستحضرات تجميل كورية بالمغرب');
  const [defaultDescFr, setDefaultDescFr] = useState('Découvrez notre gamme complète de soins dermatologiques et K-Beauty avec livraison rapide partout au Maroc.');
  const [defaultDescAr, setDefaultDescAr] = useState('اكتشف مجموعتنا الكاملة من منتجات العناية بالبشرة والتجميل الكوري مع توصيل سريع في المغرب.');
  const [canonicalDomain, setCanonicalDomain] = useState('https://paraofficinal.ma');

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => { setSaving(false); setDirty(false); }, 600);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', fontSize: '13px', padding: '8px 12px',
    borderRadius: 'var(--admin-radius)',
    border: isDark ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(0,0,0,0.1)',
    background: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
    color: isDark ? '#e2e8f0' : '#0f172a', outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em',
    color: isDark ? '#475569' : '#64748b', display: 'block', marginBottom: '4px',
  };

  if (!canEdit) {
    return <div style={{ padding: '40px', textAlign: 'center' }}><p style={{ fontSize: '14px', color: isDark ? '#475569' : '#94a3b8' }}>Accès refusé.</p></div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '900px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 'var(--admin-text-xl)', fontWeight: 900, color: isDark ? '#f1f5f9' : '#0f172a', margin: 0 }}>Référencement & SEO Global</h1>
          <p style={{ fontSize: '13px', color: isDark ? '#475569' : '#94a3b8', margin: '4px 0 0' }}>
            Configuration globale des balises méta, OpenGraph, sitemap et canonical URLs.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-emerald-500/25 hover:shadow-lg hover:shadow-emerald-500/35 transition-all duration-200 cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>

      <div style={{ padding: '24px', borderRadius: 'var(--admin-radius-lg)', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.07)', background: isDark ? 'rgba(255,255,255,0.01)' : '#ffffff', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        <BilingualField
          label="Titre par défaut de la boutique"
          valueFr={defaultTitleFr} valueAr={defaultTitleAr}
          onChangeFr={v => { setDefaultTitleFr(v); setDirty(true); }}
          onChangeAr={v => { setDefaultTitleAr(v); setDirty(true); }}
        />

        <BilingualField
          label="Méta-description par défaut"
          valueFr={defaultDescFr} valueAr={defaultDescAr}
          onChangeFr={v => { setDefaultDescFr(v); setDirty(true); }}
          onChangeAr={v => { setDefaultDescAr(v); setDirty(true); }}
          multiline rows={3}
        />

        <div>
          <label style={labelStyle}>Domaine Canonique (Canonical URL)</label>
          <input
            type="text"
            value={canonicalDomain}
            onChange={e => { setCanonicalDomain(e.target.value); setDirty(true); }}
            style={inputStyle}
          />
        </div>

        {/* Indexing status */}
        <div style={{ padding: '16px', borderRadius: 'var(--admin-radius-lg)', border: isDark ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(16,185,129,0.25)', background: isDark ? 'rgba(16,185,129,0.04)' : 'rgba(16,185,129,0.03)' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 700, color: isDark ? '#34d399' : '#047857', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Check className="w-4 h-4" /> Indexation automatique activée
          </h3>
          <p style={{ fontSize: '11px', color: isDark ? '#64748b' : '#64748b', margin: '4px 0 0', lineHeight: 1.4 }}>
            <code>/sitemap.xml</code> et <code>/robots.txt</code> sont générés automatiquement et mis à jour à chaque publication de page ou produit.
          </p>
        </div>
      </div>
    </div>
  );
}
