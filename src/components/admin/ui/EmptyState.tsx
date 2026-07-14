'use client';

import React from 'react';

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
  theme = 'dark',
  size = 'md',
  className = '',
}: EmptyStateProps) {
  const isLight = theme === 'light';

  const sizeMap = {
    sm: { wrapper: 'py-10 px-6', iconBox: 'w-10 h-10', iconSize: 'w-4 h-4', gap: 'gap-2.5' },
    md: { wrapper: 'py-14 px-8', iconBox: 'w-14 h-14', iconSize: 'w-5 h-5', gap: 'gap-3' },
    lg: { wrapper: 'py-20 px-10', iconBox: 'w-16 h-16', iconSize: 'w-6 h-6', gap: 'gap-4' },
  };
  const s = sizeMap[size];

  return (
    <div
      className={`
        rich-empty-state
        ${isLight ? 'rich-empty-state-light' : 'rich-empty-state-dark'}
        ${s.wrapper}
        ${className}
      `}
    >
      {/* Animated icon block */}
      <div
        className={`
          rich-empty-state-icon
          ${s.iconBox}
          ${isLight
            ? 'bg-slate-50 border border-slate-200/80'
            : 'bg-slate-900/60 border border-slate-800/60'}
        `}
      >
        <Icon
          className={`${s.iconSize} ${isLight ? 'text-slate-400' : 'text-slate-500'}`}
          strokeWidth={1.5}
        />
      </div>

      {/* Text */}
      <div className={`flex flex-col items-center ${s.gap} mt-1`}>
        <h3
          className="font-semibold tracking-tight text-center"
          style={{
            fontSize: 'var(--admin-text-base)',
            color: 'var(--admin-text-primary)',
          }}
        >
          {title}
        </h3>
        {description && (
          <p
            className="text-center max-w-xs leading-relaxed"
            style={{
              fontSize: 'var(--admin-text-xs)',
              color: 'var(--admin-text-muted)',
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
            <button
              onClick={action.onClick}
              className="admin-btn admin-btn-primary"
            >
              {action.icon && <action.icon className="w-3.5 h-3.5" />}
              {action.label}
            </button>
          )}
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="admin-btn admin-btn-secondary"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
