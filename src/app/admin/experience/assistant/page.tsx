'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { canManageChat, canEditContent } from '@/lib/permissions';
import { MessageSquare, Save, Loader2, Sparkles, Plus, Trash2, HelpCircle } from 'lucide-react';
import { BilingualField } from '@/components/admin/ui/BilingualField';
import { BrandRestrictionSection } from '@/components/admin/BrandRestrictionSection';
import { AsyncState } from '@/components/admin/ui/AsyncState';
import { requestJson } from '@/lib/request-json';

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
  policies_link?: string;
  delivery_tracking_link?: string;
  faq_link?: string;
  fallback_replies?: unknown[];
  business_facts?: unknown[];
  order_labels?: Record<string, unknown>;
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
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const [welcomeFr, setWelcomeFr] = useState('');
  const [welcomeAr, setWelcomeAr] = useState('');
  const [prompts, setPrompts] = useState<SuggestedPrompt[]>([]);
  const [tone, setTone] = useState('clinical, warm, concise');
  const [escalationFr, setEscalationFr] = useState('');
  const [escalationAr, setEscalationAr] = useState('');
  const [whatsappLink, setWhatsappLink] = useState('');
  const [policiesLink, setPoliciesLink] = useState('');
  const [trackingLink, setTrackingLink] = useState('');
  const [faqLink, setFaqLink] = useState('');
  const [trackingIntroFr, setTrackingIntroFr] = useState('');
  const [trackingIntroAr, setTrackingIntroAr] = useState('');
  const [fallbackJson, setFallbackJson] = useState('[]');
  const [factsJson, setFactsJson] = useState('[]');
  const [orderLabelsJson, setOrderLabelsJson] = useState('{}');

  const loadChatConfig = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const data = await requestJson<{ config?: ChatConfig }>('/api/cms/chat');
        const cfg = data.config ?? {} as Partial<ChatConfig>;
        setWelcomeFr(cfg.welcome_fr ?? 'Bonjour ! Comment puis-je vous aider aujourd\'hui ?');
        setWelcomeAr(cfg.welcome_ar ?? 'مرحباً! كيف يمكنني مساعدتك اليوم؟');
        setPrompts(cfg.suggested_prompts ?? []);
        setTone(cfg.tone ?? 'clinical, warm, concise');
        setEscalationFr(cfg.escalation_fr ?? '');
        setEscalationAr(cfg.escalation_ar ?? '');
        setWhatsappLink(cfg.whatsapp_link ?? '');
        setPoliciesLink(cfg.policies_link ?? '');
        setTrackingLink(cfg.delivery_tracking_link ?? '');
        setFaqLink(cfg.faq_link ?? '');
        setTrackingIntroFr(cfg.tracking_intro_fr ?? '');
        setTrackingIntroAr(cfg.tracking_intro_ar ?? '');
        setFallbackJson(JSON.stringify(cfg.fallback_replies ?? [], null, 2));
        setFactsJson(JSON.stringify(cfg.business_facts ?? [], null, 2));
        setOrderLabelsJson(JSON.stringify(cfg.order_labels ?? {}, null, 2));
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Impossible de charger la configuration du chat.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadChatConfig(); }, [loadChatConfig]);

  const markDirty = () => setDirty(true);

  const handleSave = async () => {
    setSaving(true);
    try {
      let fallbackReplies: unknown, businessFacts: unknown, orderLabels: unknown;
      try {
        fallbackReplies = JSON.parse(fallbackJson);
        businessFacts = JSON.parse(factsJson);
        orderLabels = JSON.parse(orderLabelsJson);
      } catch {
        window.alert('Vérifiez le JSON des réponses de secours, faits métier et libellés de commande.');
        return;
      }
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
          policies_link: policiesLink,
          delivery_tracking_link: trackingLink,
          faq_link: faqLink,
          tracking_intro_fr: trackingIntroFr,
          tracking_intro_ar: trackingIntroAr,
          fallback_replies: fallbackReplies,
          business_facts: businessFacts,
          order_labels: orderLabels,
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
    return <AsyncState kind="forbidden" description="Votre rôle ne permet pas de gérer les réponses et les règles du chat." />;
  }

  if (loading) {
    return <AsyncState kind="loading" />;
  }

  if (loadError) return <AsyncState kind="error" description={loadError} onRetry={loadChatConfig} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '900px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 'var(--admin-text-xl)', fontWeight: 900, color: isDark ? '#f1f5f9' : '#0f172a', margin: 0 }}>Assistant Chat IA</h1>
          <p style={{ fontSize: '13px', color: isDark ? '#475569' : '#94a3b8', margin: '4px 0 0' }}>
            Personnalisez le comportement commercial, la restriction des marques et les messages d&apos;accueil de l&apos;assistant.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              height: '36px', padding: '0 16px', borderRadius: 'var(--admin-radius)',
              background: dirty ? '#10b981' : isDark ? '#1e293b' : '#f1f5f9',
              color: dirty ? '#fff' : isDark ? '#e2e8f0' : '#0f172a',
              fontSize: '13px', fontWeight: 800, border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px', opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? <Loader2 style={{ width: '14px', height: '14px' }} className="animate-spin" /> : <Save style={{ width: '14px', height: '14px' }} />}
            Enregistrer
          </button>
        )}
      </div>

      {/* Brand Restriction Section */}
      <BrandRestrictionSection isDark={isDark} />

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
                  <input type="text" value={p.prompt_fr} onChange={e => updatePrompt(p.id, 'prompt_fr', e.target.value)} placeholder="Question envoyée (FR)" style={inputStyle} />
                  <input type="text" value={p.prompt_ar} onChange={e => updatePrompt(p.id, 'prompt_ar', e.target.value)} placeholder="السؤال المرسل (AR)" dir="rtl" style={{ ...inputStyle, direction: 'rtl' }} />
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

        <BilingualField label="Introduction suivi de commande" valueFr={trackingIntroFr} valueAr={trackingIntroAr} onChangeFr={v => { setTrackingIntroFr(v); markDirty(); }} onChangeAr={v => { setTrackingIntroAr(v); markDirty(); }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div><label style={labelStyle}>Lien politiques</label><input value={policiesLink} onChange={e => { setPoliciesLink(e.target.value); markDirty(); }} style={inputStyle} /></div>
          <div><label style={labelStyle}>Lien suivi</label><input value={trackingLink} onChange={e => { setTrackingLink(e.target.value); markDirty(); }} style={inputStyle} /></div>
          <div><label style={labelStyle}>Lien FAQ</label><input value={faqLink} onChange={e => { setFaqLink(e.target.value); markDirty(); }} style={inputStyle} /></div>
        </div>
        {[
          ['Réponses de secours', fallbackJson, setFallbackJson, '[{"text_fr":"Je peux vous aider sur nos produits, la livraison et les commandes.","text_ar":"يمكنني مساعدتك في المنتجات والتوصيل والطلبات."}]'],
          ['Faits métier livraison / paiement / retours', factsJson, setFactsJson, '[{"key":"delivery","value_fr":"Livraison 24–72h","value_ar":"التوصيل خلال 24–72 ساعة"}]'],
          ['Libellés du parcours commande', orderLabelsJson, setOrderLabelsJson, '{"pending":{"fr":"En attente","ar":"قيد الانتظار"}}'],
        ].map(([label, value, setter, placeholder]) => (
          <div key={label as string}><label style={labelStyle}>{label as string}</label><textarea value={value as string} onChange={e => { (setter as React.Dispatch<React.SetStateAction<string>>)(e.target.value); markDirty(); }} rows={3} style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '11px', resize: 'vertical' }} placeholder={placeholder as string} spellCheck={false} /></div>
        ))}
      </div>
  );
}
