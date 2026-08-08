'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { canManageDiagnostic, canEditContent } from '@/lib/permissions';
import {
  Brain, Search, ChevronDown, ChevronUp, Plus, Trash2, Eye, EyeOff,
  GripVertical, Save, Loader2, AlertCircle, Check, X, Edit2,
} from 'lucide-react';
import { EmptyState } from '@/components/admin/ui/EmptyState';
import { BrandRestrictionSection } from '@/components/admin/BrandRestrictionSection';

interface DiagnosticAnswer {
  id: string;
  question_id: string;
  value_key: string;
  label_fr: string;
  label_ar: string;
  icon: string | null;
  display_order: number;
  enabled: boolean;
}

interface DiagnosticQuestion {
  id: string;
  question_key: string;
  text_fr: string;
  text_ar: string;
  subtitle_fr: string | null;
  subtitle_ar: string | null;
  question_type: 'single' | 'multi';
  required: boolean;
  enabled: boolean;
  display_order: number;
  answers?: DiagnosticAnswer[];
}

// ──────────────────────────────────────────────────────────────────────────────
// Add Question Modal
// ──────────────────────────────────────────────────────────────────────────────
function AddQuestionModal({
  isDark, onClose, onCreated, nextOrder,
}: {
  isDark: boolean;
  onClose: () => void;
  onCreated: (q: DiagnosticQuestion) => void;
  nextOrder: number;
}) {
  const [key, setKey] = useState('');
  const [textFr, setTextFr] = useState('');
  const [textAr, setTextAr] = useState('');
  const [subtitleFr, setSubtitleFr] = useState('');
  const [type, setType] = useState<'single' | 'multi'>('single');
  const [required, setRequired] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const overlay: React.CSSProperties = {
    position: 'fixed', inset: 0, zIndex: 100,
    background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  };
  const modal: React.CSSProperties = {
    width: '520px', maxWidth: '95vw', borderRadius: '16px',
    background: isDark ? '#0f172a' : '#fff',
    border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.09)',
    padding: '28px', display: 'flex', flexDirection: 'column', gap: '18px',
  };
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '10px',
    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.12)',
    background: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc',
    color: isDark ? '#e2e8f0' : '#0f172a', outline: 'none', boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = {
    fontSize: '10px', fontWeight: 800, textTransform: 'uppercase',
    letterSpacing: '0.1em', color: isDark ? '#475569' : '#94a3b8',
    display: 'block', marginBottom: '5px',
  };

  const handleCreate = async () => {
    if (!key.trim() || !textFr.trim()) { setError('La clé et la question FR sont requises.'); return; }
    setSaving(true); setError('');
    try {
      const res = await fetch('/api/cms/diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_key: key.trim(), text_fr: textFr.trim(), text_ar: textAr.trim(),
          subtitle_fr: subtitleFr.trim() || null, question_type: type,
          required, display_order: nextOrder,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Erreur.'); return; }
      onCreated(data.question);
    } catch { setError('Erreur réseau.'); }
    finally { setSaving(false); }
  };

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={e => e.stopPropagation()}>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 800, color: isDark ? '#f1f5f9' : '#0f172a', margin: 0 }}>Nouvelle question</h2>
          <p style={{ fontSize: '12px', color: isDark ? '#475569' : '#94a3b8', marginTop: '4px' }}>
            Vous pourrez ajouter les réponses après création.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={labelStyle}>Clé unique *</label>
              <input autoFocus type="text" value={key} onChange={e => setKey(e.target.value)} placeholder="ex: ageRange" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Type</label>
              <select value={type} onChange={e => setType(e.target.value as any)}
                style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="single">Choix unique</option>
                <option value="multi">Choix multiple</option>
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Question (Français) *</label>
            <input type="text" value={textFr} onChange={e => setTextFr(e.target.value)} placeholder="Comment votre peau…" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Question (العربية)</label>
            <input type="text" value={textAr} onChange={e => setTextAr(e.target.value)} dir="rtl" style={{ ...inputStyle, direction: 'rtl' }} />
          </div>
          <div>
            <label style={labelStyle}>Sous-titre / aide (FR)</label>
            <input type="text" value={subtitleFr} onChange={e => setSubtitleFr(e.target.value)} placeholder="Choisissez…" style={inputStyle} />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: isDark ? '#94a3b8' : '#475569' }}>
            <input type="checkbox" checked={required} onChange={e => setRequired(e.target.checked)} />
            Réponse obligatoire
          </label>
        </div>

        {error && <p style={{ fontSize: '12px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px' }}><AlertCircle size={14} />{error}</p>}

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '8px 16px', fontSize: '12px', fontWeight: 600, borderRadius: '10px', border: isDark ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(0,0,0,0.1)', background: 'transparent', color: isDark ? '#64748b' : '#94a3b8', cursor: 'pointer' }}>Annuler</button>
          <button onClick={handleCreate} disabled={saving} style={{ padding: '8px 18px', fontSize: '12px', fontWeight: 700, borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#10b981,#0d9488)', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Création…' : 'Créer la question'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Answer Row (inline editable)
// ──────────────────────────────────────────────────────────────────────────────
function AnswerRow({
  answer, isDark, canEdit, onUpdate, onDelete,
}: {
  answer: DiagnosticAnswer;
  isDark: boolean;
  canEdit: boolean;
  onUpdate: (a: DiagnosticAnswer) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [labelFr, setLabelFr] = useState(answer.label_fr);
  const [labelAr, setLabelAr] = useState(answer.label_ar);
  const [icon, setIcon] = useState(answer.icon ?? '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const res = await fetch('/api/cms/diagnostic', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'answer_update', answer_id: answer.id, label_fr: labelFr, label_ar: labelAr, icon: icon || null }),
    });
    if (res.ok) {
      onUpdate({ ...answer, label_fr: labelFr, label_ar: labelAr, icon: icon || null });
      setEditing(false);
    }
    setSaving(false);
  };

  const inputS: React.CSSProperties = {
    padding: '4px 8px', fontSize: '12px', borderRadius: '6px', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.12)',
    background: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc', color: isDark ? '#e2e8f0' : '#0f172a', outline: 'none',
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '10px',
      border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.07)',
      background: isDark ? 'rgba(255,255,255,0.02)' : '#fff',
    }}>
      {editing ? (
        <>
          <input value={icon} onChange={e => setIcon(e.target.value)} placeholder="icon" style={{ ...inputS, width: '72px' }} />
          <input value={labelFr} onChange={e => setLabelFr(e.target.value)} placeholder="Français" style={{ ...inputS, flex: 1 }} />
          <input value={labelAr} onChange={e => setLabelAr(e.target.value)} placeholder="العربية" dir="rtl" style={{ ...inputS, flex: 1, direction: 'rtl' }} />
          <button onClick={save} disabled={saving} style={{ padding: '4px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#10b981' }}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
          </button>
          <button onClick={() => setEditing(false)} style={{ padding: '4px', border: 'none', background: 'transparent', cursor: 'pointer', color: isDark ? '#475569' : '#94a3b8' }}>
            <X size={14} />
          </button>
        </>
      ) : (
        <>
          {answer.icon && <span style={{ fontSize: '14px', minWidth: '20px' }}>{answer.icon}</span>}
          <span style={{ fontSize: '12px', fontWeight: 600, color: isDark ? '#e2e8f0' : '#0f172a', flex: 1 }}>{answer.label_fr}</span>
          <span style={{ fontSize: '11px', color: isDark ? '#475569' : '#94a3b8', fontFamily: 'monospace' }}>{answer.value_key}</span>
          {canEdit && (
            <>
              <button onClick={() => setEditing(true)} style={{ padding: '3px', border: 'none', background: 'transparent', cursor: 'pointer', color: isDark ? '#475569' : '#94a3b8' }}>
                <Edit2 size={12} />
              </button>
              <button onClick={() => onDelete(answer.id)} style={{ padding: '3px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#ef4444' }}>
                <Trash2 size={12} />
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Add Answer Row (inline)
// ──────────────────────────────────────────────────────────────────────────────
function AddAnswerRow({ questionId, isDark, onAdded, nextOrder }: {
  questionId: string; isDark: boolean; onAdded: (a: DiagnosticAnswer) => void; nextOrder: number;
}) {
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState('');
  const [labelFr, setLabelFr] = useState('');
  const [labelAr, setLabelAr] = useState('');
  const [icon, setIcon] = useState('');
  const [saving, setSaving] = useState(false);

  const inputS: React.CSSProperties = {
    padding: '5px 8px', fontSize: '12px', borderRadius: '6px',
    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.12)',
    background: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc',
    color: isDark ? '#e2e8f0' : '#0f172a', outline: 'none',
  };

  const save = async () => {
    if (!key.trim() || !labelFr.trim()) return;
    setSaving(true);
    const res = await fetch('/api/cms/diagnostic', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'answer_add', question_id: questionId,
        value_key: key.trim(), label_fr: labelFr.trim(), label_ar: labelAr.trim(),
        icon: icon.trim() || null, display_order: nextOrder,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      onAdded(data.answer);
      setKey(''); setLabelFr(''); setLabelAr(''); setIcon(''); setOpen(false);
    }
    setSaving(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px', width: '100%',
          padding: '7px 10px', borderRadius: '10px', cursor: 'pointer', fontSize: '11px', fontWeight: 600,
          border: isDark ? '1px dashed rgba(255,255,255,0.1)' : '1px dashed rgba(0,0,0,0.12)',
          background: 'transparent', color: isDark ? '#475569' : '#94a3b8',
        }}
      >
        <Plus size={12} /> Ajouter une réponse
      </button>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '10px', border: isDark ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(16,185,129,0.25)', background: isDark ? 'rgba(16,185,129,0.05)' : 'rgba(16,185,129,0.03)' }}>
      <input value={icon} onChange={e => setIcon(e.target.value)} placeholder="icon" style={{ ...inputS, width: '72px' }} />
      <input autoFocus value={key} onChange={e => setKey(e.target.value)} placeholder="value_key *" style={{ ...inputS, width: '110px' }} />
      <input value={labelFr} onChange={e => setLabelFr(e.target.value)} placeholder="Français *" style={{ ...inputS, flex: 1 }} />
      <input value={labelAr} onChange={e => setLabelAr(e.target.value)} placeholder="العربية" dir="rtl" style={{ ...inputS, flex: 1, direction: 'rtl' }} />
      <button onClick={save} disabled={saving || !key || !labelFr} style={{ padding: '5px 12px', fontSize: '11px', fontWeight: 700, borderRadius: '8px', border: 'none', background: '#10b981', color: '#fff', cursor: 'pointer' }}>
        {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
      </button>
      <button onClick={() => setOpen(false)} style={{ padding: '4px', border: 'none', background: 'transparent', cursor: 'pointer', color: isDark ? '#475569' : '#94a3b8' }}>
        <X size={14} />
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Question Card
// ──────────────────────────────────────────────────────────────────────────────
function QuestionCard({
  question, idx, total, isDark, canEdit,
  onMove, onToggleEnabled, onSaveText, onDelete,
  onAnswerUpdate, onAnswerDelete, onAnswerAdded,
}: {
  question: DiagnosticQuestion;
  idx: number; total: number;
  isDark: boolean; canEdit: boolean;
  onMove: (idx: number, dir: -1 | 1) => void;
  onToggleEnabled: (q: DiagnosticQuestion) => void;
  onSaveText: (q: DiagnosticQuestion) => void;
  onDelete: (id: string) => void;
  onAnswerUpdate: (questionId: string, answer: DiagnosticAnswer) => void;
  onAnswerDelete: (questionId: string, answerId: string) => void;
  onAnswerAdded: (questionId: string, answer: DiagnosticAnswer) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [textFr, setTextFr] = useState(question.text_fr);
  const [textAr, setTextAr] = useState(question.text_ar);
  const [subtitleFr, setSubtitleFr] = useState(question.subtitle_fr ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const dirty = textFr !== question.text_fr || textAr !== question.text_ar || subtitleFr !== (question.subtitle_fr ?? '');

  const save = async () => {
    setSaving(true);
    await onSaveText({ ...question, text_fr: textFr, text_ar: textAr, subtitle_fr: subtitleFr || null });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const answers = question.answers ?? [];

  return (
    <div style={{
      borderRadius: '14px',
      border: expanded
        ? (isDark ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(16,185,129,0.3)')
        : (isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.07)'),
      background: isDark ? 'rgba(255,255,255,0.01)' : '#fafafa',
      opacity: question.enabled ? 1 : 0.55,
      transition: 'all 0.15s',
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', cursor: 'pointer' }} onClick={() => setExpanded(e => !e)}>
        <GripVertical size={16} style={{ color: isDark ? '#2d3a4d' : '#cbd5e1', flexShrink: 0 }} />

        <span style={{ fontSize: '11px', fontWeight: 800, color: isDark ? '#334155' : '#94a3b8', minWidth: '22px', textAlign: 'center' }}>
          {idx + 1}
        </span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '13px', fontWeight: 600, color: isDark ? '#e2e8f0' : '#0f172a', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {question.text_fr}
          </p>
          <p style={{ fontSize: '10px', color: isDark ? '#334155' : '#94a3b8', margin: '2px 0 0', fontFamily: 'monospace' }}>
            {question.question_key} — {answers.length} réponse{answers.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Type chip */}
        <span style={{ fontSize: '9px', fontWeight: 800, padding: '2px 8px', borderRadius: '999px', textTransform: 'uppercase', letterSpacing: '0.08em', background: isDark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.08)', color: isDark ? '#a5b4fc' : '#4338ca', flexShrink: 0 }}>
          {question.question_type === 'multi' ? 'Multiple' : 'Unique'}
        </span>
        {question.required && (
          <span style={{ fontSize: '9px', fontWeight: 800, padding: '2px 8px', borderRadius: '999px', background: isDark ? 'rgba(244,63,94,0.1)' : 'rgba(244,63,94,0.06)', color: isDark ? '#fb7185' : '#e11d48', flexShrink: 0 }}>Requis</span>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '2px', alignItems: 'center', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
          {canEdit && (
            <>
              <button onClick={() => onMove(idx, -1)} disabled={idx === 0} style={{ padding: '4px', border: 'none', background: 'transparent', cursor: idx === 0 ? 'default' : 'pointer', color: isDark ? '#475569' : '#94a3b8', opacity: idx === 0 ? 0.3 : 1 }}><ChevronUp size={14} /></button>
              <button onClick={() => onMove(idx, 1)} disabled={idx === total - 1} style={{ padding: '4px', border: 'none', background: 'transparent', cursor: idx === total - 1 ? 'default' : 'pointer', color: isDark ? '#475569' : '#94a3b8', opacity: idx === total - 1 ? 0.3 : 1 }}><ChevronDown size={14} /></button>
              <button onClick={() => onToggleEnabled(question)} style={{ padding: '4px', border: 'none', background: 'transparent', cursor: 'pointer', color: question.enabled ? (isDark ? '#34d399' : '#059669') : (isDark ? '#475569' : '#94a3b8') }}>
                {question.enabled ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
              <button onClick={() => onDelete(question.id)} style={{ padding: '4px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#ef4444' }}>
                <Trash2 size={14} />
              </button>
            </>
          )}
          <ChevronDown size={14} style={{ color: isDark ? '#475569' : '#94a3b8', transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </div>
      </div>

      {/* Expanded editor */}
      {expanded && (
        <div style={{ padding: '0 14px 16px', borderTop: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.06)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Text fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: isDark ? '#475569' : '#94a3b8', display: 'block', marginBottom: '4px' }}>Question (Français)</label>
              <input type="text" value={textFr} readOnly={!canEdit} onChange={e => setTextFr(e.target.value)}
                style={{ width: '100%', fontSize: '12px', padding: '7px 10px', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(0,0,0,0.1)', background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', color: isDark ? '#e2e8f0' : '#0f172a', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: isDark ? '#475569' : '#94a3b8', display: 'block', marginBottom: '4px' }}>Question (العربية)</label>
              <input type="text" value={textAr} readOnly={!canEdit} dir="rtl" onChange={e => setTextAr(e.target.value)}
                style={{ width: '100%', fontSize: '12px', padding: '7px 10px', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(0,0,0,0.1)', background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', color: isDark ? '#e2e8f0' : '#0f172a', outline: 'none', boxSizing: 'border-box', direction: 'rtl' }} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: isDark ? '#475569' : '#94a3b8', display: 'block', marginBottom: '4px' }}>Sous-titre / aide (FR)</label>
            <input type="text" value={subtitleFr} readOnly={!canEdit} onChange={e => setSubtitleFr(e.target.value)}
              placeholder="Texte d'aide affiché sous la question…"
              style={{ width: '100%', fontSize: '12px', padding: '7px 10px', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(0,0,0,0.1)', background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', color: isDark ? '#e2e8f0' : '#0f172a', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          {/* Save text */}
          {canEdit && dirty && (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={save} disabled={saving}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 16px', fontSize: '12px', fontWeight: 700, borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', opacity: saving ? 0.7 : 1 }}>
                {saving ? <Loader2 size={13} className="animate-spin" /> : saved ? <Check size={13} /> : <Save size={13} />}
                {saved ? 'Enregistré' : 'Enregistrer le texte'}
              </button>
            </div>
          )}

          {/* Answers section */}
          <div>
            <p style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: isDark ? '#475569' : '#94a3b8', marginBottom: '8px' }}>
              Réponses ({answers.length})
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {answers.map(a => (
                <AnswerRow
                  key={a.id} answer={a} isDark={isDark} canEdit={canEdit}
                  onUpdate={updated => onAnswerUpdate(question.id, updated)}
                  onDelete={id => onAnswerDelete(question.id, id)}
                />
              ))}
              {canEdit && (
                <AddAnswerRow
                  questionId={question.id} isDark={isDark}
                  nextOrder={answers.length + 1}
                  onAdded={a => onAnswerAdded(question.id, a)}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Main Page
// ──────────────────────────────────────────────────────────────────────────────
export default function DiagnosticPage() {
  const { currentUser, adminTheme } = useAdmin();
  const isDark = adminTheme === 'dark';
  const role = currentUser?.role ?? 'viewer';

  const [questions, setQuestions] = useState<DiagnosticQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [reordering, setReordering] = useState(false);
  const reorderTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const canEdit = canManageDiagnostic(role as any);
  const canView = canEditContent(role as any);

  useEffect(() => {
    fetch('/api/cms/diagnostic')
      .then(r => r.json())
      .then(data => { setQuestions(data.questions ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Debounced reorder persistence
  const persistOrder = useCallback((qs: DiagnosticQuestion[]) => {
    if (reorderTimerRef.current) clearTimeout(reorderTimerRef.current);
    reorderTimerRef.current = setTimeout(async () => {
      setReordering(true);
      await fetch('/api/cms/diagnostic', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'reorder', items: qs.map((q, i) => ({ id: q.id, display_order: i + 1 })) }),
      });
      setReordering(false);
    }, 800);
  }, []);

  const move = (idx: number, dir: -1 | 1) => {
    const next = [...questions];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    setQuestions(next);
    persistOrder(next);
  };

  const toggleEnabled = useCallback(async (q: DiagnosticQuestion) => {
    const updated = { ...q, enabled: !q.enabled };
    setQuestions(prev => prev.map(p => p.id === q.id ? updated : p));
    await fetch('/api/cms/diagnostic', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: q.id, enabled: updated.enabled }),
    });
  }, []);

  const saveText = useCallback(async (q: DiagnosticQuestion) => {
    setQuestions(prev => prev.map(p => p.id === q.id ? q : p));
    await fetch('/api/cms/diagnostic', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: q.id, text_fr: q.text_fr, text_ar: q.text_ar, subtitle_fr: q.subtitle_fr }),
    });
  }, []);

  const deleteQuestion = useCallback(async (id: string) => {
    if (!confirm('Supprimer cette question et toutes ses réponses ?')) return;
    setQuestions(prev => prev.filter(q => q.id !== id));
    await fetch(`/api/cms/diagnostic?id=${id}`, { method: 'DELETE' });
  }, []);

  const handleAnswerUpdate = useCallback((questionId: string, answer: DiagnosticAnswer) => {
    setQuestions(prev => prev.map(q =>
      q.id === questionId
        ? { ...q, answers: (q.answers ?? []).map(a => a.id === answer.id ? answer : a) }
        : q
    ));
  }, []);

  const handleAnswerDelete = useCallback(async (questionId: string, answerId: string) => {
    if (!confirm('Supprimer cette réponse ?')) return;
    setQuestions(prev => prev.map(q =>
      q.id === questionId
        ? { ...q, answers: (q.answers ?? []).filter(a => a.id !== answerId) }
        : q
    ));
    await fetch('/api/cms/diagnostic', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'answer_delete', answer_id: answerId }),
    });
  }, []);

  const handleAnswerAdded = useCallback((questionId: string, answer: DiagnosticAnswer) => {
    setQuestions(prev => prev.map(q =>
      q.id === questionId
        ? { ...q, answers: [...(q.answers ?? []), answer] }
        : q
    ));
  }, []);

  const filtered = questions.filter(q =>
    !query || q.text_fr.toLowerCase().includes(query.toLowerCase()) || q.question_key.includes(query.toLowerCase())
  );

  if (!canView && !canEdit) {
    return <div style={{ padding: '40px', textAlign: 'center' }}><p style={{ fontSize: '14px', color: isDark ? '#475569' : '#94a3b8' }}>Accès refusé.</p></div>;
  }

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px' }}><div className="w-6 h-6 border-2 border-slate-700 border-t-emerald-500 rounded-full animate-spin" /></div>;
  }

  return (
    <>
      {showAddModal && (
        <AddQuestionModal
          isDark={isDark}
          nextOrder={questions.length + 1}
          onClose={() => setShowAddModal(false)}
          onCreated={q => { setQuestions(prev => [...prev, q]); setShowAddModal(false); }}
        />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: 'var(--admin-text-xl)', fontWeight: 900, color: isDark ? '#f1f5f9' : '#0f172a', margin: 0 }}>Diagnostic IA</h1>
            <p style={{ fontSize: '13px', color: isDark ? '#475569' : '#94a3b8', margin: '4px 0 0' }}>
              {questions.length} question{questions.length !== 1 ? 's' : ''} — {questions.filter(q => q.enabled).length} actives
              {reordering && <span style={{ marginLeft: '10px', fontSize: '11px', color: '#f59e0b' }}>Sauvegarde de l'ordre…</span>}
            </p>
          </div>
          {canEdit && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-emerald-500/25 hover:shadow-lg hover:shadow-emerald-500/35 transition-all duration-200 cursor-pointer active:scale-95 shrink-0"
            >
              <Plus size={14} /> Nouvelle question
            </button>
          )}
        </div>

        {/* Brand Restriction Section */}
        <BrandRestrictionSection isDark={isDark} />

        {/* Read-only notice */}
        {!canEdit && (
          <div style={{ padding: '12px 16px', borderRadius: '12px', border: isDark ? '1px solid rgba(245,158,11,0.2)' : '1px solid rgba(245,158,11,0.25)', background: isDark ? 'rgba(245,158,11,0.06)' : 'rgba(245,158,11,0.04)' }}>
            <p style={{ fontSize: '12px', color: isDark ? '#fbbf24' : '#b45309', margin: 0 }}>Mode lecture seule — vous pouvez consulter mais pas modifier les questions.</p>
          </div>
        )}

        {/* Info box */}
        <div style={{ padding: '10px 14px', borderRadius: '10px', border: isDark ? '1px solid rgba(99,102,241,0.15)' : '1px solid rgba(99,102,241,0.15)', background: isDark ? 'rgba(99,102,241,0.04)' : 'rgba(99,102,241,0.03)', fontSize: '11px', color: isDark ? '#64748b' : '#64748b' }}>
          <strong>Réordonnancement :</strong> utilisez les flèches ▲▼ pour changer l'ordre. L'ordre est sauvegardé automatiquement. L'algorithme de recommandation lit toujours les questions dans cet ordre.
        </div>

        {/* Search */}
        <div style={{ position: 'relative', maxWidth: '320px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: isDark ? '#475569' : '#94a3b8' }} />
          <input
            type="text" placeholder="Rechercher une question…" value={query} onChange={e => setQuery(e.target.value)}
            style={{ width: '100%', padding: '7px 10px 7px 30px', fontSize: '12px', borderRadius: '10px', border: isDark ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(0,0,0,0.1)', background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', color: isDark ? '#e2e8f0' : '#0f172a', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        {/* Question list */}
        {filtered.length === 0 ? (
          <EmptyState title="Aucune question" description="Créez la première question du diagnostic." icon={Brain} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {filtered.map((q, idx) => (
              <QuestionCard
                key={q.id}
                question={q}
                idx={idx}
                total={filtered.length}
                isDark={isDark}
                canEdit={canEdit}
                onMove={move}
                onToggleEnabled={toggleEnabled}
                onSaveText={saveText}
                onDelete={deleteQuestion}
                onAnswerUpdate={handleAnswerUpdate}
                onAnswerDelete={handleAnswerDelete}
                onAnswerAdded={handleAnswerAdded}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
