'use client';

import React from 'react';
import { AlertTriangle, LockKeyhole, RefreshCw, SearchX } from 'lucide-react';
import { EmptyState } from './EmptyState';

type AsyncStateKind = 'loading' | 'empty' | 'error' | 'forbidden';

interface AsyncStateProps {
  kind: AsyncStateKind;
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
  rows?: number;
}

const copy: Record<Exclude<AsyncStateKind, 'loading'>, { title: string; description: string }> = {
  empty: { title: 'Aucune donnée à afficher', description: 'Les nouveaux éléments apparaîtront ici dès qu’ils seront disponibles.' },
  error: { title: 'Impossible de charger les données', description: 'La dernière tentative a échoué. Vos données n’ont pas été modifiées.' },
  forbidden: { title: 'Accès limité', description: 'Votre rôle ne permet pas d’ouvrir cette section.' },
};

export function AsyncState({ kind, title, description, onRetry, className = '', rows = 4 }: AsyncStateProps) {
  if (kind === 'loading') {
    return (
      <div className={`admin-state-panel ${className}`} role="status" aria-live="polite" aria-label="Chargement en cours">
        <div className="admin-state-skeleton-header">
          <span className="admin-state-skeleton admin-state-skeleton-title" />
          <span className="admin-state-skeleton admin-state-skeleton-action" />
        </div>
        <div className="admin-state-skeleton-list">
          {Array.from({ length: rows }).map((_, index) => <span key={index} className="admin-state-skeleton admin-state-skeleton-row" />)}
        </div>
        <span className="sr-only">Chargement des données…</span>
      </div>
    );
  }

  const Icon = kind === 'error' ? AlertTriangle : kind === 'forbidden' ? LockKeyhole : SearchX;
  const defaults = copy[kind];
  return (
    <EmptyState
      icon={Icon}
      title={title || defaults.title}
      description={description || defaults.description}
      className={className}
      action={kind === 'error' && onRetry ? { label: 'Réessayer', onClick: onRetry, icon: RefreshCw } : undefined}
    />
  );
}
