'use client';

import React, { useState } from 'react';
import { Save, Eye, Globe, Clock, ChevronDown, Check, CircleAlert } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { canPublishContent, canScheduleContent } from '@/lib/permissions';
import { PoButton } from '@/components/ui/PoButton';
import styles from './StickyPublishBar.module.css';

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
  requiresApproval?: boolean;
}

const CMS_STATUS_LABELS = {
  draft: 'Brouillon', scheduled: 'Planifié', published: 'Publié', archived: 'Archivé',
};

export function StickyPublishBar({
  status, isDirty, isSaving, onSaveDraft, onPreview, onPublish, onSchedule, lastSavedAt,
}: StickyPublishBarProps) {
  const { currentUser, adminTheme } = useAdmin();
  const role = currentUser?.role;
  const canPublish = role !== undefined && canPublishContent(role);
  const canSchedule = role !== undefined && canScheduleContent(role);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleValue, setScheduleValue] = useState('');
  const formattedSave = lastSavedAt
    ? lastSavedAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div className={styles.bar} data-theme={adminTheme} role="group" aria-label="Barre de publication">
      <div className={styles.summary}>
        <span className={styles.badge} data-status={status}>
          <span className={styles.dot} aria-hidden="true" />
          {CMS_STATUS_LABELS[status]}
        </span>
        <span className={styles.feedback} data-dirty={isDirty} role="status">
          {isDirty ? <><CircleAlert size={14} aria-hidden="true" /> Modifications non enregistrées</>
            : formattedSave ? <><Check size={14} aria-hidden="true" /> Enregistré à {formattedSave}</> : null}
        </span>
      </div>
      <div className={styles.actions}>
        <PoButton className={styles.action} variant="secondary" leftIcon={<Save />} loading={isSaving} onClick={onSaveDraft} disabled={isSaving}>
          Enregistrer le brouillon
        </PoButton>
        <PoButton className={styles.action} variant="text" leftIcon={<Eye />} onClick={onPreview} disabled={isSaving}>
          Prévisualiser
        </PoButton>
        {canSchedule && onSchedule && (
          <div className={styles.schedule}>
            <PoButton className={styles.action} variant="secondary" leftIcon={<Clock />}
              rightIcon={<ChevronDown className={scheduleOpen ? styles.rotated : undefined} />}
              aria-expanded={scheduleOpen} onClick={() => setScheduleOpen(o => !o)}>
              Planifier
            </PoButton>
            {scheduleOpen && (
              <>
                <div onClick={() => setScheduleOpen(false)} className={styles.backdrop} />
                <div className={styles.popover}>
                  <label className={styles.dateLabel}>
                    Date et heure de publication
                    <input type="datetime-local" value={scheduleValue}
                      onChange={e => setScheduleValue(e.target.value)} className={styles.dateInput} />
                  </label>
                  <PoButton className={styles.action} variant="primary" fullWidth disabled={!scheduleValue}
                    onClick={() => { if (scheduleValue) { onSchedule(scheduleValue); setScheduleOpen(false); } }}
                    leftIcon={<Globe />}>
                    Planifier la publication
                  </PoButton>
                </div>
              </>
            )}
          </div>
        )}
        {canPublish ? (
          <PoButton className={`${styles.action} ${styles.primary}`} variant="primary" leftIcon={<Globe />}
            onClick={onPublish} disabled={isSaving}>
            {status === 'published' ? 'Mettre à jour' : 'Publier'}
          </PoButton>
        ) : role !== 'viewer' && (
          <PoButton className={`${styles.action} ${styles.primary}`} variant="primary" leftIcon={<Globe />}
            onClick={onPublish} disabled={isSaving}>
            Soumettre pour validation
          </PoButton>
        )}
      </div>
    </div>
  );
}
