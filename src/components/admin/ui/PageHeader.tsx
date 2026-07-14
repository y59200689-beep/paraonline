'use client';

import React from 'react';

type BadgeColor = 'emerald' | 'rose' | 'amber' | 'blue' | 'violet' | 'slate';

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: { label: string; color?: BadgeColor };
  action?: React.ReactNode;   // primary CTA / button slot (right side)
  meta?: React.ReactNode;     // secondary info slot (right side, before action)
  theme?: 'light' | 'dark';
  className?: string;
}

const badgeClasses: Record<BadgeColor, { light: string; dark: string }> = {
  emerald: {
    light: 'bg-emerald-50 text-emerald-700 border-emerald-200/70',
    dark:  'bg-emerald-950/40 text-emerald-400 border-emerald-800/40',
  },
  rose: {
    light: 'bg-rose-50 text-rose-700 border-rose-200/70',
    dark:  'bg-rose-950/40 text-rose-400 border-rose-800/40',
  },
  amber: {
    light: 'bg-amber-50 text-amber-700 border-amber-200/70',
    dark:  'bg-amber-950/40 text-amber-400 border-amber-800/40',
  },
  blue: {
    light: 'bg-blue-50 text-blue-700 border-blue-200/70',
    dark:  'bg-blue-950/40 text-blue-400 border-blue-800/40',
  },
  violet: {
    light: 'bg-violet-50 text-violet-700 border-violet-200/70',
    dark:  'bg-violet-950/40 text-violet-400 border-violet-800/40',
  },
  slate: {
    light: 'bg-slate-100 text-slate-600 border-slate-200/70',
    dark:  'bg-slate-800/60 text-slate-400 border-slate-700/40',
  },
};

export function PageHeader({
  title,
  description,
  badge,
  action,
  meta,
  theme = 'dark',
  className = '',
}: PageHeaderProps) {
  const color = badge?.color ?? 'slate';
  const badgeCls = theme === 'light' ? badgeClasses[color].light : badgeClasses[color].dark;

  return (
    <div className={`flex items-start justify-between gap-4 flex-wrap ${className}`}>
      {/* ── Left: title + description ── */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h2
            className="leading-none font-bold tracking-tight"
            style={{
              fontSize: 'var(--admin-text-xl)',
              color: 'var(--admin-text-primary)',
            }}
          >
            {title}
          </h2>

          {badge && (
            <span
              className={`inline-flex items-center border px-2 py-0.5 rounded-full font-bold tracking-wide ${badgeCls}`}
              style={{ fontSize: 'var(--admin-text-2xs)' }}
            >
              {badge.label}
            </span>
          )}
        </div>

        {description && (
          <p
            className="mt-1 leading-snug"
            style={{
              fontSize: 'var(--admin-text-xs)',
              color: 'var(--admin-text-muted)',
            }}
          >
            {description}
          </p>
        )}
      </div>

      {/* ── Right: meta + action slots ── */}
      {(meta || action) && (
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {meta}
          {action}
        </div>
      )}
    </div>
  );
}
