'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { canManageTranslations, canEditContent } from '@/lib/permissions';
import { Languages, Search, Save, Loader2, Plus, Globe } from 'lucide-react';
import { BilingualField } from '@/components/admin/ui/BilingualField';

interface DictionaryString {
  key: string;
  fr: string;
  ar: string;
  category: string;
}

const DEFAULT_DICTIONARY: DictionaryString[] = [
  { key: 'common.add_to_cart', fr: 'Ajouter au panier', ar: 'أضف إلى السلة', category: 'General' },
  { key: 'common.checkout', fr: 'Commander maintenant', ar: 'إتمام الطلب', category: 'General' },
  { key: 'common.free_shipping', fr: 'Livraison gratuite', ar: 'توصيل مجاني', category: 'Cart & Checkout' },
  { key: 'common.cash_on_delivery', fr: 'Paiement à la livraison', ar: 'الدفع عند الاستلام', category: 'Cart & Checkout' },
  { key: 'common.in_stock', fr: 'En stock', ar: 'متوفر في المخزون', category: 'Catalog' },
  { key: 'common.out_of_stock', fr: 'Rupture de stock', ar: 'نفد من المخزون', category: 'Catalog' },
  { key: 'diagnostic.title', fr: 'Diagnostic de Peau IA', ar: 'تشخيص البشرة بالذكاء الاصطناعي', category: 'Diagnostic' },
  { key: 'chat.welcome', fr: 'Comment puis-je vous aider ?', ar: 'كيف يمكنني مساعدتك؟', category: 'Chat' },
];

export default function ContentTranslationsPage() {
  const { currentUser, adminTheme } = useAdmin();
  const isDark = adminTheme === 'dark';
  const role = currentUser?.role ?? 'viewer';

  const canEdit = canManageTranslations(role as any) || canEditContent(role as any);

  const [items, setItems] = useState<DictionaryString[]>(DEFAULT_DICTIONARY);
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const filtered = items.filter(i =>
    !query ||
    i.key.toLowerCase().includes(query.toLowerCase()) ||
    i.fr.toLowerCase().includes(query.toLowerCase()) ||
    i.ar.includes(query)
  );

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => { setSaving(false); setDirty(false); }, 600);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', fontSize: '12px', padding: '7px 10px',
    borderRadius: 'var(--admin-radius)',
    border: isDark ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(0,0,0,0.1)',
    background: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
    color: isDark ? '#e2e8f0' : '#0f172a', outline: 'none',
  };

  if (!canEdit) {
    return <div style={{ padding: '40px', textAlign: 'center' }}><p style={{ fontSize: '14px', color: isDark ? '#475569' : '#94a3b8' }}>Accès refusé.</p></div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1000px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 'var(--admin-text-xl)', fontWeight: 900, color: isDark ? '#f1f5f9' : '#0f172a', margin: 0 }}>Traductions & Dictionnaire</h1>
          <p style={{ fontSize: '13px', color: isDark ? '#475569' : '#94a3b8', margin: '4px 0 0' }}>
            Gérez les chaînes de caractères bilingues Français / Arabe utilisées sur le site.
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

      <div style={{ position: 'relative', maxWidth: '320px' }}>
        <Search className="w-3.5 h-3.5" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: isDark ? '#475569' : '#94a3b8' }} />
        <input type="text" placeholder="Rechercher une clé ou un texte…" value={query} onChange={e => setQuery(e.target.value)} style={{ ...inputStyle, paddingLeft: '30px' }} />
      </div>

      <div style={{ borderRadius: 'var(--admin-radius-lg)', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.07)', background: isDark ? 'rgba(255,255,255,0.01)' : '#ffffff', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr 1fr', padding: '10px 14px', background: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc', borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.06)' }}>
          <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: isDark ? '#475569' : '#64748b' }}>Clé</span>
          <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: isDark ? '#475569' : '#64748b' }}>Français (FR)</span>
          <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: isDark ? '#475569' : '#64748b' }}>العربية (AR)</span>
        </div>

        {filtered.map((item, idx) => (
          <div key={item.key} style={{ display: 'grid', gridTemplateColumns: '180px 1fr 1fr', gap: '10px', alignItems: 'center', padding: '10px 14px', borderBottom: idx < filtered.length - 1 ? (isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(0,0,0,0.05)') : 'none' }}>
            <code style={{ fontSize: '11px', color: isDark ? '#a5b4fc' : '#4338ca', wordBreak: 'break-all' }}>{item.key}</code>
            <input type="text" value={item.fr} onChange={e => { const val = e.target.value; setItems(prev => prev.map(p => p.key === item.key ? { ...p, fr: val } : p)); setDirty(true); }} style={inputStyle} />
            <input type="text" value={item.ar} dir="rtl" onChange={e => { const val = e.target.value; setItems(prev => prev.map(p => p.key === item.key ? { ...p, ar: val } : p)); setDirty(true); }} style={{ ...inputStyle, direction: 'rtl' }} />
          </div>
        ))}
      </div>
    </div>
  );
}
