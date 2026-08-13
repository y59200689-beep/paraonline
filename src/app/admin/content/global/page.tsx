'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { canManageGlobalContent, canEditContent } from '@/lib/permissions';
import { Navigation, Save, Loader2, Plus, Trash2, Globe } from 'lucide-react';
import { BilingualField } from '@/components/admin/ui/BilingualField';
import { AsyncState } from '@/components/admin/ui/AsyncState';
import { requestJson } from '@/lib/request-json';

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
  const [loadError, setLoadError] = useState('');
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
  const [storePhone, setStorePhone] = useState('');
  const [storeWhatsapp, setStoreWhatsapp] = useState('');
  const [deliveryCopyFr, setDeliveryCopyFr] = useState('');
  const [deliveryCopyAr, setDeliveryCopyAr] = useState('');
  const [seoTitleFr, setSeoTitleFr] = useState('');
  const [seoTitleAr, setSeoTitleAr] = useState('');
  const [seoDescFr, setSeoDescFr] = useState('');
  const [seoDescAr, setSeoDescAr] = useState('');
  const [ogImage, setOgImage] = useState('');
  const [footerJson, setFooterJson] = useState('[]');
  const [socialJson, setSocialJson] = useState('[]');
  const [trustJson, setTrustJson] = useState('[]');
  const [ctaJson, setCtaJson] = useState('{}');

  const loadGlobalContent = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const data = await requestJson<{ global?: Record<string, any> }>('/api/cms/global');
        const g = data.global ?? {};
        setStoreName(g.store_name ?? 'Para Officinal S.A');
        setTaglineFr(g.store_tagline_fr ?? '');
        setTaglineAr(g.store_tagline_ar ?? '');
        setAnnouncementFr(g.announcement_fr ?? '');
        setAnnouncementAr(g.announcement_ar ?? '');
        setAnnouncementEnabled(g.announcement_enabled ?? false);
        setAnnouncementLink(g.announcement_link ?? '');
        setHeaderNav(g.header_nav ?? []);
        setStorePhone(g.store_phone ?? '');
        setStoreWhatsapp(g.store_whatsapp ?? '');
        setDeliveryCopyFr(g.delivery_copy_fr ?? '');
        setDeliveryCopyAr(g.delivery_copy_ar ?? '');
        setSeoTitleFr(g.seo_default_title_fr ?? '');
        setSeoTitleAr(g.seo_default_title_ar ?? '');
        setSeoDescFr(g.seo_default_desc_fr ?? '');
        setSeoDescAr(g.seo_default_desc_ar ?? '');
        setOgImage(g.og_default_image ?? '');
        setFooterJson(JSON.stringify(g.footer_columns ?? [], null, 2));
        setSocialJson(JSON.stringify(g.social_links ?? [], null, 2));
        setTrustJson(JSON.stringify(g.trust_badges ?? [], null, 2));
        setCtaJson(JSON.stringify(g.cta_labels ?? {}, null, 2));
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Impossible de charger le contenu global.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadGlobalContent(); }, [loadGlobalContent]);

  const markDirty = () => setDirty(true);

  const handleSave = async () => {
    setSaving(true);
    try {
      let footerColumns: unknown, socialLinks: unknown, trustBadges: unknown, ctaLabels: unknown;
      try {
        footerColumns = JSON.parse(footerJson);
        socialLinks = JSON.parse(socialJson);
        trustBadges = JSON.parse(trustJson);
        ctaLabels = JSON.parse(ctaJson);
      } catch {
        window.alert('Vérifiez le format JSON des blocs globaux avant d’enregistrer.');
        return;
      }
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
          store_phone: storePhone,
          store_whatsapp: storeWhatsapp,
          delivery_copy_fr: deliveryCopyFr,
          delivery_copy_ar: deliveryCopyAr,
          seo_default_title_fr: seoTitleFr,
          seo_default_title_ar: seoTitleAr,
          seo_default_desc_fr: seoDescFr,
          seo_default_desc_ar: seoDescAr,
          og_default_image: ogImage,
          footer_columns: footerColumns,
          social_links: socialLinks,
          trust_badges: trustBadges,
          cta_labels: ctaLabels,
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
    return <AsyncState kind="forbidden" description="Votre rôle ne permet pas de consulter les réglages globaux de la boutique." />;
  }

  if (loading) {
    return <AsyncState kind="loading" />;
  }

  if (loadError) return <AsyncState kind="error" description={loadError} onRetry={loadGlobalContent} />;

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

        {/* Contact, delivery and reusable global content */}
        <div style={{ padding: '16px', borderRadius: 'var(--admin-radius-lg)', border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.06)', background: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <p style={{ ...labelStyle, marginBottom: '2px' }}>Contenu global du storefront</p>
            <p style={{ fontSize: '11px', color: isDark ? '#64748b' : '#94a3b8', margin: 0 }}>Ces valeurs alimentent les composants publics après publication. Les tableaux utilisent le format JSON indiqué dans chaque aide.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div><label style={labelStyle}>Téléphone</label><input value={storePhone} onChange={e => { setStorePhone(e.target.value); markDirty(); }} style={inputStyle} /></div>
            <div><label style={labelStyle}>WhatsApp</label><input value={storeWhatsapp} onChange={e => { setStoreWhatsapp(e.target.value); markDirty(); }} style={inputStyle} placeholder="+212..." /></div>
          </div>
          <BilingualField label="Message livraison" valueFr={deliveryCopyFr} valueAr={deliveryCopyAr} onChangeFr={v => { setDeliveryCopyFr(v); markDirty(); }} onChangeAr={v => { setDeliveryCopyAr(v); markDirty(); }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div><label style={labelStyle}>SEO title (FR)</label><input value={seoTitleFr} onChange={e => { setSeoTitleFr(e.target.value); markDirty(); }} style={inputStyle} /></div>
            <div><label style={labelStyle}>SEO title (AR)</label><input value={seoTitleAr} onChange={e => { setSeoTitleAr(e.target.value); markDirty(); }} dir="rtl" style={{ ...inputStyle, direction: 'rtl' }} /></div>
            <div><label style={labelStyle}>SEO description (FR)</label><textarea value={seoDescFr} onChange={e => { setSeoDescFr(e.target.value); markDirty(); }} rows={2} style={{ ...inputStyle, resize: 'vertical' }} /></div>
            <div><label style={labelStyle}>SEO description (AR)</label><textarea value={seoDescAr} onChange={e => { setSeoDescAr(e.target.value); markDirty(); }} rows={2} dir="rtl" style={{ ...inputStyle, direction: 'rtl', resize: 'vertical' }} /></div>
          </div>
          <div><label style={labelStyle}>Image Open Graph (URL)</label><input value={ogImage} onChange={e => { setOgImage(e.target.value); markDirty(); }} style={inputStyle} placeholder="https://…/og-image.jpg" /></div>
          {[
            ['Footer columns', footerJson, setFooterJson, '[{"heading_fr":"Aide","heading_ar":"مساعدة","links":[{"label_fr":"Livraison","label_ar":"التوصيل","href":"/suivi-commande"}]}]'],
            ['Liens sociaux', socialJson, setSocialJson, '[{"platform":"instagram","url":"https://…"}]'],
            ['Badges de confiance', trustJson, setTrustJson, '[{"icon_key":"shield","label_fr":"Paiement sécurisé","label_ar":"دفع آمن"}]'],
            ['Libellés CTA', ctaJson, setCtaJson, '{"add_to_cart":{"label_fr":"Ajouter au panier","label_ar":"أضف إلى السلة"}}'],
          ].map(([label, value, setter, placeholder]) => (
            <div key={label as string}>
              <label style={labelStyle}>{label as string}</label>
              <textarea value={value as string} onChange={e => { (setter as React.Dispatch<React.SetStateAction<string>>)(e.target.value); markDirty(); }} rows={3} style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '11px', resize: 'vertical' }} placeholder={placeholder as string} spellCheck={false} />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
