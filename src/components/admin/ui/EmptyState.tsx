'use client';

import React from 'react';
import { useAdmin } from '@/context/AdminContext';
import { PoButton } from '@/components/ui/PoButton';

interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ComponentType<{ className?: string }>;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  theme?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  theme,
  size = 'md',
  className = '',
}: EmptyStateProps) {
  const { adminTheme } = useAdmin();
  const isLight = theme ? theme === 'light' : adminTheme === 'light';

  const sizeMap = {
    sm: { wrapper: 'py-8 px-4', iconBox: 'w-10 h-10', iconSize: 'w-4 h-4', gap: 'gap-2' },
    md: { wrapper: 'py-12 px-6', iconBox: 'w-12 h-12', iconSize: 'w-5 h-5', gap: 'gap-2.5' },
    lg: { wrapper: 'py-16 px-8', iconBox: 'w-14 h-14', iconSize: 'w-6 h-6', gap: 'gap-3' },
  };
  const s = sizeMap[size];
  const ActionIcon = action?.icon;

  return (
    <div
      className={`
        rich-empty-state
        ${isLight ? 'rich-empty-state-light' : 'rich-empty-state-dark'}
        ${s.wrapper}
        ${className}
      `}
      style={{
        background: isLight ? 'rgba(248,250,252,0.6)' : 'rgba(255,255,255,0.015)',
        borderColor: isLight ? 'rgba(226,232,240,0.8)' : 'rgba(255,255,255,0.08)',
        borderRadius: 'var(--admin-radius-lg)',
      }}
    >
      {/* Animated icon block */}
      <div
        className={`
          rich-empty-state-icon
          ${s.iconBox}
          ${isLight
            ? 'bg-slate-100 border border-slate-200 text-slate-500'
            : 'bg-slate-900/60 border border-slate-800/60 text-slate-400'}
        `}
      >
        <Icon
          className={`${s.iconSize}`}
          strokeWidth={1.5}
        />
      </div>

      {/* Text */}
      <div className={`flex flex-col items-center ${s.gap} mt-1`}>
        <h3
          className="font-semibold tracking-tight text-center"
          style={{
            fontSize: 'var(--admin-text-base)',
            color: isLight ? '#0f172a' : '#f1f5f9',
          }}
        >
          {title}
        </h3>
        {description && (
          <p
            className="text-center max-w-xs leading-relaxed"
            style={{
              fontSize: 'var(--admin-text-xs)',
              color: isLight ? '#64748b' : '#94a3b8',
            }}
          >
            {description}
          </p>
        )}
      </div>

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex items-center gap-2.5 mt-5 flex-wrap justify-center">
          {action && (
            <PoButton
              onClick={action.onClick}
              leftIcon={ActionIcon ? <ActionIcon /> : undefined}
            >
              {action.label}
            </PoButton>
          )}
          {secondaryAction && (
            <PoButton
              onClick={secondaryAction.onClick}
              variant="secondary"
            >
              {secondaryAction.label}
            </PoButton>
          )}
        </div>
      )}
    </div>
  );
}
