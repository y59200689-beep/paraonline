'use client';

import React, { useState } from 'react';
import { Save, Eye, Globe, Clock, ChevronDown, Loader2 } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { canPublishContent, canScheduleContent } from '@/lib/permissions';

export type PublishAction = 'save_draft' | 'preview' | 'publish' | 'schedule' | 'submit_approval';

interface StickyPublishBarProps {
  status: 'draft' | 'scheduled' | 'published' | 'archived';
  isDirty: boolean;
  isSaving: boolean;
  onSaveDraft: () => void;
  onPreview: () => void;
  onPublish: () => void;
  onSchedule?: (datetime: string) => void;
  onArchive?: () => void;
  lastSavedAt?: Date | null;
  /** Label shown in the primary CTA when submitting for approval */
  requiresApproval?: boolean;
}

const CMS_STATUS_LABELS: Record<string, string> = {
  draft: 'Brouillon',
  scheduled: 'Planifié',
  published: 'Publié',
  archived: 'Archivé',
};

export function StickyPublishBar({
  status,
  isDirty,
  isSaving,
  onSaveDraft,
  onPreview,
  onPublish,
  onSchedule,
  onArchive,
  lastSavedAt,
  requiresApproval = false,
}: StickyPublishBarProps) {
  const { currentUser, adminTheme } = useAdmin();
  const isDark = adminTheme === 'dark';
  const role = currentUser?.role as any;
  const canPublish = canPublishContent(role);
  const canSchedule = canScheduleContent(role);

  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleValue, setScheduleValue] = useState('');

  const bar: React.CSSProperties = {
    position: 'sticky',
    top: 0,
    zIndex: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    padding: '10px 20px',
    borderRadius: 'var(--admin-radius-lg)',
    marginBottom: '20px',
    flexWrap: 'wrap',
    background: isDark
      ? 'linear-gradient(135deg,hsl(224,28%,9%) 0%,hsl(228,26%,7%) 100%)'
      : '#ffffff',
    border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.08)',
    boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.08)',
  };

  const btnBase: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 14px',
    borderRadius: 'var(--admin-radius)',
    fontSize: '12px',
    fontWeight: 700,
    cursor: isSaving ? 'default' : 'pointer',
    transition: 'all 0.15s',
    border: 'none',
    outline: 'none',
    whiteSpace: 'nowrap',
    opacity: isSaving ? 0.7 : 1,
  };

  const saveBtnStyle: React.CSSProperties = {
    ...btnBase,
    background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)',
    color: isDark ? '#94a3b8' : '#475569',
  };

  const previewBtnStyle: React.CSSProperties = {
    ...btnBase,
    background: isDark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.08)',
    color: isDark ? '#a5b4fc' : '#4338ca',
    border: isDark ? '1px solid rgba(99,102,241,0.2)' : '1px solid rgba(99,102,241,0.15)',
  };

  const publishBtnStyle: React.CSSProperties = {
    ...btnBase,
    background: 'linear-gradient(135deg,#10b981,#059669)',
    color: '#fff',
    boxShadow: '0 2px 8px rgba(16,185,129,0.3)',
  };

  const approvalBtnStyle: React.CSSProperties = {
    ...btnBase,
    background: 'linear-gradient(135deg,#f59e0b,#d97706)',
    color: '#fff',
    boxShadow: '0 2px 8px rgba(245,158,11,0.3)',
  };

  const formattedSave = lastSavedAt
    ? lastSavedAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div style={bar} role="toolbar" aria-label="Barre de publication">
      {/* Left: Status + last saved */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
        <span
          style={{
            fontSize: '10px',
            fontWeight: 800,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            padding: '3px 10px',
            borderRadius: '999px',
            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
            color: isDark ? '#475569' : '#94a3b8',
          }}
        >
          {CMS_STATUS_LABELS[status] ?? status}
        </span>
        {isDirty && (
          <span style={{ fontSize: '10px', fontWeight: 600, color: isDark ? '#f59e0b' : '#b45309' }}>
            · Modifications non enregistrées
          </span>
        )}
        {!isDirty && formattedSave && (
          <span style={{ fontSize: '10px', color: isDark ? '#334155' : '#94a3b8' }}>
            Enregistré à {formattedSave}
          </span>
        )}
      </div>

      {/* Right: Action buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {/* Save draft */}
        <button type="button" style={saveBtnStyle} onClick={onSaveDraft} disabled={isSaving}>
          {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Enregistrer le brouillon
        </button>

        {/* Preview */}
        <button type="button" style={previewBtnStyle} onClick={onPreview} disabled={isSaving}>
          <Eye className="w-3.5 h-3.5" />
          Prévisualiser
        </button>

        {/* Schedule — owners/managers only */}
        {canSchedule && onSchedule && (
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              style={{ ...btnBase, background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', color: isDark ? '#64748b' : '#94a3b8' }}
              onClick={() => setScheduleOpen(o => !o)}
            >
              <Clock className="w-3.5 h-3.5" />
              Planifier
              <ChevronDown className={`w-3 h-3 transition-transform ${scheduleOpen ? 'rotate-180' : ''}`} />
            </button>
            {scheduleOpen && (
              <>
                <div onClick={() => setScheduleOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 49 }} />
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '100%',
                    marginTop: '6px',
                    padding: '12px',
                    borderRadius: 'var(--admin-radius-lg)',
                    background: isDark ? 'hsl(224,28%,9%)' : '#fff',
                    border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.09)',
                    boxShadow: '0 16px 48px rgba(0,0,0,0.2)',
                    zIndex: 50,
                    minWidth: '220px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: isDark ? '#475569' : '#94a3b8' }}>
                    Date et heure de publication
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduleValue}
                    onChange={e => setScheduleValue(e.target.value)}
                    style={{
                      fontSize: '12px',
                      padding: '6px 10px',
                      borderRadius: 'var(--admin-radius)',
                      border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.12)',
                      background: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc',
                      color: isDark ? '#e2e8f0' : '#0f172a',
                      width: '100%',
                    }}
                  />
                  <button
                    type="button"
                    disabled={!scheduleValue}
                    onClick={() => { if (scheduleValue) { onSchedule(scheduleValue); setScheduleOpen(false); } }}
                    style={{
                      ...btnBase,
                      background: scheduleValue ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'rgba(0,0,0,0.05)',
                      color: scheduleValue ? '#fff' : '#94a3b8',
                      justifyContent: 'center',
                      width: '100%',
                    }}
                  >
                    <Globe className="w-3.5 h-3.5" /> Planifier la publication
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Publish / Submit for approval */}
        {canPublish ? (
          <button
            type="button"
            style={status === 'published' ? { ...publishBtnStyle, background: 'linear-gradient(135deg,#0891b2,#0e7490)', boxShadow: '0 2px 8px rgba(8,145,178,0.3)' } : publishBtnStyle}
            onClick={onPublish}
            disabled={isSaving}
          >
            <Globe className="w-3.5 h-3.5" />
            {status === 'published' ? 'Mettre à jour' : 'Publier'}
          </button>
        ) : !isViewerRole(role) && (
          <button type="button" style={approvalBtnStyle} onClick={onPublish} disabled={isSaving}>
            <Globe className="w-3.5 h-3.5" />
            Soumettre pour validation
          </button>
        )}
      </div>
    </div>
  );
}

function isViewerRole(role: string) {
  return role === 'viewer';
}
