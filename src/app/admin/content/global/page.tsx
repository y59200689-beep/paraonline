'use client';

import React, { useState, useEffect } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { canManageGlobalContent, canEditContent } from '@/lib/permissions';
import { Navigation, Save, Loader2, Plus, Trash2, Globe } from 'lucide-react';
import { BilingualField } from '@/components/admin/ui/BilingualField';

interface HeaderNavItem {
  id: string;
  label_fr: string;
  label_ar: string;
  href: string;
}

interface FooterColumn {
  id: string;
  heading_fr: string;
  heading_ar: string;
  links: { label_fr: string; label_ar: string; href: string }[];
}

export default function ContentGlobalPage() {
  const { currentUser, adminTheme } = useAdmin();
  const isDark = adminTheme === 'dark';
  const role = currentUser?.role ?? 'viewer';

  const canEdit = canManageGlobalContent(role as any);
  const canView = canEditContent(role as any);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Form states
  const [storeName, setStoreName] = useState('');
  const [taglineFr, setTaglineFr] = useState('');
  const [taglineAr, setTaglineAr] = useState('');
  const [announcementFr, setAnnouncementFr] = useState('');
  const [announcementAr, setAnnouncementAr] = useState('');
  const [announcementEnabled, setAnnouncementEnabled] = useState(false);
  const [announcementLink, setAnnouncementLink] = useState('');
  const [headerNav, setHeaderNav] = useState<HeaderNavItem[]>([]);

  useEffect(() => {
    fetch('/api/cms/global')
      .then(r => r.json())
      .then(data => {
        const g = data.global ?? {};
        setStoreName(g.store_name ?? 'Para Officinal S.A');
        setTaglineFr(g.store_tagline_fr ?? '');
        setTaglineAr(g.store_tagline_ar ?? '');
        setAnnouncementFr(g.announcement_fr ?? '');
        setAnnouncementAr(g.announcement_ar ?? '');
        setAnnouncementEnabled(g.announcement_enabled ?? false);
        setAnnouncementLink(g.announcement_link ?? '');
        setHeaderNav(g.header_nav ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const markDirty = () => setDirty(true);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/cms/global', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_name: storeName,
          store_tagline_fr: taglineFr,
          store_tagline_ar: taglineAr,
          announcement_fr: announcementFr,
          announcement_ar: announcementAr,
          announcement_enabled: announcementEnabled,
          announcement_link: announcementLink,
          header_nav: headerNav,
        }),
      });
      if (res.ok) setDirty(false);
    } finally {
      setSaving(false);
    }
  };

  const addNavItem = () => {
    setHeaderNav(prev => [
      ...prev,
      { id: `nav-${Date.now()}`, label_fr: 'Nouveau lien', label_ar: 'رابط جديد', href: '/' },
    ]);
    markDirty();
  };

  const removeNavItem = (id: string) => {
    setHeaderNav(prev => prev.filter(n => n.id !== id));
    markDirty();
  };

  const updateNavItem = (id: string, field: keyof HeaderNavItem, val: string) => {
    setHeaderNav(prev => prev.map(n => n.id === id ? { ...n, [field]: val } : n));
    markDirty();
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', fontSize: '13px', padding: '8px 12px',
    borderRadius: 'var(--admin-radius)',
    border: isDark ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(0,0,0,0.1)',
    background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
    color: isDark ? '#e2e8f0' : '#0f172a', outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em',
    color: isDark ? '#475569' : '#94a3b8', display: 'block', marginBottom: '4px',
  };

  if (!canView && !canEdit) {
    return <div style={{ padding: '40px', textAlign: 'center' }}><p style={{ fontSize: '14px', color: isDark ? '#475569' : '#94a3b8' }}>Accès refusé.</p></div>;
  }

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px' }}><div className="w-6 h-6 border-2 border-slate-700 border-t-emerald-500 rounded-full animate-spin" /></div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '900px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 'var(--admin-text-xl)', fontWeight: 900, color: isDark ? '#f1f5f9' : '#0f172a', margin: 0 }}>Navigation & Footer</h1>
          <p style={{ fontSize: '13px', color: isDark ? '#475569' : '#94a3b8', margin: '4px 0 0' }}>
            Gérez les menus globaux de l&apos;entête, du pied de page et de la barre d&apos;annonce.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-emerald-500/25 hover:shadow-lg hover:shadow-emerald-500/35 transition-all duration-200 cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        )}
      </div>

      <div style={{ padding: '24px', borderRadius: 'var(--admin-radius-lg)', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.07)', background: isDark ? 'rgba(255,255,255,0.01)' : '#fff', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Store identity */}
        <div>
          <label style={labelStyle}>Nom officiel de la boutique</label>
          <input
            type="text"
            value={storeName}
            onChange={e => { setStoreName(e.target.value); markDirty(); }}
            style={inputStyle}
          />
        </div>

        <BilingualField
          label="Slogan global"
          valueFr={taglineFr} valueAr={taglineAr}
          onChangeFr={v => { setTaglineFr(v); markDirty(); }}
          onChangeAr={v => { setTaglineAr(v); markDirty(); }}
        />

        {/* Announcement Bar */}
        <div style={{ padding: '16px', borderRadius: 'var(--admin-radius-lg)', border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.06)', background: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>Barre de notification (Header Notice)</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: isDark ? '#e2e8f0' : '#0f172a' }}>
              <input
                type="checkbox"
                checked={announcementEnabled}
                onChange={e => { setAnnouncementEnabled(e.target.checked); markDirty(); }}
              />
              Activer la barre
            </label>
          </div>

          <BilingualField
            label="Texte de l'annonce"
            valueFr={announcementFr} valueAr={announcementAr}
            onChangeFr={v => { setAnnouncementFr(v); markDirty(); }}
            onChangeAr={v => { setAnnouncementAr(v); markDirty(); }}
            placeholder={{ fr: 'Livraison gratuite à partir de 300 DH !', ar: 'توصيل مجاني للطلبات فوق 300 درهم!' }}
          />

          <div>
            <label style={labelStyle}>Lien du clic (optionnel)</label>
            <input type="text" value={announcementLink} onChange={e => { setAnnouncementLink(e.target.value); markDirty(); }} placeholder="/promotions" style={inputStyle} />
          </div>
        </div>

        {/* Header Nav Menu */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>Menu principal de l&apos;entête ({headerNav.length})</label>
            {canEdit && (
              <button
                type="button"
                onClick={addNavItem}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, color: isDark ? '#34d399' : '#059669', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <Plus className="w-3.5 h-3.5" /> Ajouter un élément
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {headerNav.map((n, idx) => (
              <div key={n.id || idx} style={{ padding: '10px 14px', borderRadius: 'var(--admin-radius)', border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.06)', background: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: isDark ? '#334155' : '#94a3b8' }}>#{idx + 1}</span>
                <input type="text" value={n.label_fr} onChange={e => updateNavItem(n.id, 'label_fr', e.target.value)} placeholder="Titre (FR)" style={{ ...inputStyle, flex: 1 }} />
                <input type="text" value={n.label_ar} onChange={e => updateNavItem(n.id, 'label_ar', e.target.value)} placeholder="Titre (AR)" dir="rtl" style={{ ...inputStyle, flex: 1, direction: 'rtl' }} />
                <input type="text" value={n.href} onChange={e => updateNavItem(n.id, 'href', e.target.value)} placeholder="/lien" style={{ ...inputStyle, width: '140px' }} />
                {canEdit && (
                  <button onClick={() => removeNavItem(n.id)} style={{ border: 'none', background: 'none', color: isDark ? '#f43f5e' : '#e11d48', cursor: 'pointer' }}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
