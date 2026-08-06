'use client';

import React, { useCallback } from 'react';
import { Eye, EyeOff, GripVertical, Copy, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';

export interface SectionOutlineItem {
  id: string;
  type: string;
  nameFr: string;
  visible: boolean;
  status?: 'draft' | 'published';
}

interface SectionOutlineProps {
  sections: SectionOutlineItem[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onReorder: (sections: SectionOutlineItem[]) => void;
  onToggleVisible: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  readOnly?: boolean;
}

const SECTION_TYPE_LABELS: Record<string, string> = {
  hero: 'Héro Carrousel',
  categoryTrack: 'Catégories',
  productGrid: 'Grille Produits',
  brandPartners: 'Marques',
  diagnosticBanner: 'Diagnostic IA',
  summerSale: 'Vente Été',
  dermoCorner: 'Dermo Corner',
  skinConcerns: 'Préoccupations',
  customerReviews: 'Avis Clients',
  triplePromo: 'Triple Promo',
  topRated: 'Mieux Notés',
  bestSellers: 'Meilleures Ventes',
  routineVisualizer: 'Routine Visualiseur',
  skincareRoutineSteps: 'Étapes Routine',
  featuredIngredient: 'Ingrédients Vedettes',
  activeIngredients: 'Ingrédients Actifs',
  ingredientDictionary: 'Dictionnaire',
  faq: 'FAQ',
  officialDistributor: 'Distributeur Officiel',
  trustBar: 'Barre Confiance',
  horizontalPromo: 'Promo Horizontale',
  richText: 'Texte Enrichi',
  customHtml: 'HTML Personnalisé',
  imageText: 'Image + Texte',
  promotionBanner: 'Bannière Promo',
  giftCampaign: 'Campagne Cadeaux',
};

export function SectionOutline({
  sections,
  activeId,
  onSelect,
  onReorder,
  onToggleVisible,
  onDuplicate,
  onDelete,
  readOnly = false,
}: SectionOutlineProps) {
  const { adminTheme } = useAdmin();
  const isDark = adminTheme === 'dark';

  const moveSection = useCallback((idx: number, dir: -1 | 1) => {
    const next = [...sections];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    onReorder(next);
  }, [sections, onReorder]);

  const rowStyle = (isActive: boolean, visible: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 10px',
    borderRadius: 'var(--admin-radius)',
    cursor: 'pointer',
    transition: 'all 0.12s',
    border: isActive
      ? (isDark ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(16,185,129,0.35)')
      : '1px solid transparent',
    background: isActive
      ? (isDark ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.06)')
      : 'transparent',
    opacity: visible ? 1 : 0.45,
  });

  const iconBtn: React.CSSProperties = {
    padding: '3px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    borderRadius: '4px',
    color: isDark ? '#475569' : '#94a3b8',
    transition: 'color 0.12s, background 0.12s',
    flexShrink: 0,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      {sections.map((section, idx) => {
        const isActive = section.id === activeId;
        const typeLabel = SECTION_TYPE_LABELS[section.type] ?? section.type;

        return (
          <div
            key={section.id}
            style={rowStyle(isActive, section.visible)}
            onClick={() => onSelect(section.id)}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && onSelect(section.id)}
          >
            {/* Drag handle */}
            {!readOnly && (
              <GripVertical
                className="w-3.5 h-3.5 shrink-0"
                style={{ color: isDark ? '#2d3a4d' : '#cbd5e1', cursor: 'grab' }}
              />
            )}

            {/* Name & type */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '12px', fontWeight: isActive ? 700 : 500, color: isDark ? '#e2e8f0' : '#0f172a', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {section.nameFr || typeLabel}
              </p>
              <p style={{ fontSize: '10px', color: isDark ? '#334155' : '#94a3b8', margin: 0, marginTop: '1px' }}>
                {typeLabel}
              </p>
            </div>

            {/* Actions — visible on hover via group */}
            {!readOnly && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }} onClick={e => e.stopPropagation()}>
                {/* Move up/down */}
                <button
                  style={iconBtn}
                  title="Monter"
                  onClick={e => { e.stopPropagation(); moveSection(idx, -1); }}
                  disabled={idx === 0}
                >
                  <ChevronUp className="w-3 h-3" />
                </button>
                <button
                  style={iconBtn}
                  title="Descendre"
                  onClick={e => { e.stopPropagation(); moveSection(idx, 1); }}
                  disabled={idx === sections.length - 1}
                >
                  <ChevronDown className="w-3 h-3" />
                </button>

                {/* Toggle visibility */}
                <button
                  style={{ ...iconBtn, color: section.visible ? (isDark ? '#34d399' : '#059669') : (isDark ? '#475569' : '#94a3b8') }}
                  title={section.visible ? 'Masquer' : 'Afficher'}
                  onClick={e => { e.stopPropagation(); onToggleVisible(section.id); }}
                >
                  {section.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                </button>

                {/* Duplicate */}
                <button
                  style={iconBtn}
                  title="Dupliquer"
                  onClick={e => { e.stopPropagation(); onDuplicate(section.id); }}
                >
                  <Copy className="w-3 h-3" />
                </button>

                {/* Delete */}
                <button
                  style={{ ...iconBtn, color: isDark ? '#f43f5e' : '#e11d48' }}
                  title="Supprimer"
                  onClick={e => { e.stopPropagation(); onDelete(section.id); }}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        );
      })}

      {sections.length === 0 && (
        <p style={{ fontSize: '12px', color: isDark ? '#334155' : '#94a3b8', textAlign: 'center', padding: '20px 0' }}>
          Aucune section. Ajoutez-en une ci-dessous.
        </p>
      )}
    </div>
  );
}
