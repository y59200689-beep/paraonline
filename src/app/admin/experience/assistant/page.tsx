'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { canManageChat, canEditContent } from '@/lib/permissions';
import { MessageSquare, Save, Loader2, Sparkles, Plus, Trash2, HelpCircle } from 'lucide-react';
import { BilingualField } from '@/components/admin/ui/BilingualField';

interface SuggestedPrompt {
  id: string;
  label_fr: string;
  label_ar: string;
  prompt_fr: string;
  prompt_ar: string;
}

interface ChatConfig {
  welcome_fr: string;
  welcome_ar: string;
  suggested_prompts: SuggestedPrompt[];
  tone: string;
  escalation_fr: string;
  escalation_ar: string;
  whatsapp_link: string;
  tracking_intro_fr: string;
  tracking_intro_ar: string;
}

export default function ExperienceAssistantPage() {
  const { currentUser, adminTheme } = useAdmin();
  const isDark = adminTheme === 'dark';
  const role = currentUser?.role ?? 'viewer';

  const canEdit = canManageChat(role as any);
  const canView = canEditContent(role as any);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const [welcomeFr, setWelcomeFr] = useState('');
  const [welcomeAr, setWelcomeAr] = useState('');
  const [prompts, setPrompts] = useState<SuggestedPrompt[]>([]);
  const [tone, setTone] = useState('clinical, warm, concise');
  const [escalationFr, setEscalationFr] = useState('');
  const [escalationAr, setEscalationAr] = useState('');
  const [whatsappLink, setWhatsappLink] = useState('');

  useEffect(() => {
    fetch('/api/cms/chat')
      .then(r => r.json())
      .then(data => {
        const cfg: ChatConfig = data.config ?? {};
        setWelcomeFr(cfg.welcome_fr ?? 'Bonjour ! Comment puis-je vous aider aujourd\'hui ?');
        setWelcomeAr(cfg.welcome_ar ?? 'مرحباً! كيف يمكنني مساعدتك اليوم؟');
        setPrompts(cfg.suggested_prompts ?? []);
        setTone(cfg.tone ?? 'clinical, warm, concise');
        setEscalationFr(cfg.escalation_fr ?? '');
        setEscalationAr(cfg.escalation_ar ?? '');
        setWhatsappLink(cfg.whatsapp_link ?? '');
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const markDirty = () => setDirty(true);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/cms/chat', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          welcome_fr: welcomeFr,
          welcome_ar: welcomeAr,
          suggested_prompts: prompts,
          tone,
          escalation_fr: escalationFr,
          escalation_ar: escalationAr,
          whatsapp_link: whatsappLink,
        }),
      });
      if (res.ok) {
        setDirty(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const addPrompt = () => {
    setPrompts(prev => [
      ...prev,
      {
        id: `prompt-${Date.now()}`,
        label_fr: 'Nouvelle question',
        label_ar: 'سؤال جديد',
        prompt_fr: 'Pouvez-vous me conseiller un soin ?',
        prompt_ar: 'هل يمكنك نصحي بمنتج عناية؟',
      },
    ]);
    markDirty();
  };

  const removePrompt = (id: string) => {
    setPrompts(prev => prev.filter(p => p.id !== id));
    markDirty();
  };

  const updatePrompt = (id: string, field: keyof SuggestedPrompt, val: string) => {
    setPrompts(prev => prev.map(p => p.id === id ? { ...p, [field]: val } : p));
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
          <h1 style={{ fontSize: 'var(--admin-text-xl)', fontWeight: 900, color: isDark ? '#f1f5f9' : '#0f172a', margin: 0 }}>Assistant Chat IA</h1>
          <p style={{ fontSize: '13px', color: isDark ? '#475569' : '#94a3b8', margin: '4px 0 0' }}>
            Personnalisez le comportement commercial et les messages d&apos;accueil de l&apos;assistant. Les clés d&apos;API et le prompt système ne sont pas exposés.
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

      {/* Main card */}
      <div style={{ padding: '24px', borderRadius: 'var(--admin-radius-lg)', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.07)', background: isDark ? 'rgba(255,255,255,0.01)' : '#fff', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Welcome message */}
        <BilingualField
          label="Message d'accueil"
          valueFr={welcomeFr} valueAr={welcomeAr}
          onChangeFr={v => { setWelcomeFr(v); markDirty(); }}
          onChangeAr={v => { setWelcomeAr(v); markDirty(); }}
          multiline rows={2}
        />

        {/* Tone */}
        <div>
          <label style={labelStyle}>Tonalité des réponses</label>
          <input
            type="text"
            value={tone}
            onChange={e => { setTone(e.target.value); markDirty(); }}
            placeholder="ex: cliniquement précis, chaleureux, concis"
            style={inputStyle}
          />
          <p style={{ fontSize: '10px', color: isDark ? '#334155' : '#94a3b8', marginTop: '4px' }}>Infecté dans le contexte du modèle pour guider son style d&apos;élocution.</p>
        </div>

        {/* Suggested prompt chips */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>Suggestions rapides ({prompts.length})</label>
            {canEdit && (
              <button
                type="button"
                onClick={addPrompt}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, color: isDark ? '#34d399' : '#059669', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <Plus className="w-3.5 h-3.5" /> Ajouter
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {prompts.map((p, idx) => (
              <div key={p.id || idx} style={{ padding: '12px', borderRadius: 'var(--admin-radius)', border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.06)', background: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: isDark ? '#475569' : '#94a3b8' }}>Puce #{idx + 1}</span>
                  {canEdit && (
                    <button onClick={() => removePrompt(p.id)} style={{ border: 'none', background: 'none', color: isDark ? '#f43f5e' : '#e11d48', cursor: 'pointer' }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <input type="text" value={p.label_fr} onChange={e => updatePrompt(p.id, 'label_fr', e.target.value)} placeholder="Bouton (FR)" style={inputStyle} />
                  <input type="text" value={p.label_ar} onChange={e => updatePrompt(p.id, 'label_ar', e.target.value)} placeholder="Bouton (AR)" dir="rtl" style={{ ...inputStyle, direction: 'rtl' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Escalation & Support link */}
        <BilingualField
          label="Message d'escalade vers support humain"
          valueFr={escalationFr} valueAr={escalationAr}
          onChangeFr={v => { setEscalationFr(v); markDirty(); }}
          onChangeAr={v => { setEscalationAr(v); markDirty(); }}
          placeholder={{ fr: 'Nos conseillers sont disponibles sur WhatsApp…', ar: 'مستشارونا متاحون على واتساب…' }}
        />

        <div>
          <label style={labelStyle}>Lien WhatsApp de support</label>
          <input
            type="text"
            value={whatsappLink}
            onChange={e => { setWhatsappLink(e.target.value); markDirty(); }}
            placeholder="https://wa.me/212600000000"
            style={inputStyle}
          />
        </div>
      </div>
    </div>
  );
}
