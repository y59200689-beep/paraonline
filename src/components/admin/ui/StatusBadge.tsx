'use client';

import React from 'react';

// Known status values auto-mapped to colors
const STATUS_MAP: Record<string, { light: string; dark: string; dot: string }> = {
  // Orders
  pending:     { light: 'bg-amber-50 text-amber-700 border-amber-200/60',    dark: 'bg-amber-950/30 text-amber-400 border-amber-800/30',   dot: '#f59e0b' },
  processing:  { light: 'bg-blue-50 text-blue-700 border-blue-200/60',       dark: 'bg-blue-950/30 text-blue-400 border-blue-800/30',      dot: '#3b82f6' },
  confirmed:   { light: 'bg-emerald-50 text-emerald-700 border-emerald-200/60', dark: 'bg-emerald-950/30 text-emerald-400 border-emerald-800/30', dot: '#10b981' },
  shipped:     { light: 'bg-teal-50 text-teal-700 border-teal-200/60',       dark: 'bg-teal-950/30 text-teal-400 border-teal-800/30',     dot: '#14b8a6' },
  delivered:   { light: 'bg-emerald-50 text-emerald-700 border-emerald-200/60', dark: 'bg-emerald-950/30 text-emerald-400 border-emerald-800/30', dot: '#10b981' },
  cancelled:   { light: 'bg-rose-50 text-rose-700 border-rose-200/60',       dark: 'bg-rose-950/30 text-rose-400 border-rose-800/30',     dot: '#f43f5e' },
  returned:    { light: 'bg-orange-50 text-orange-700 border-orange-200/60', dark: 'bg-orange-950/30 text-orange-400 border-orange-800/30', dot: '#f97316' },
  // Reviews
  approved:    { light: 'bg-emerald-50 text-emerald-700 border-emerald-200/60', dark: 'bg-emerald-950/30 text-emerald-400 border-emerald-800/30', dot: '#10b981' },
  hidden:      { light: 'bg-slate-100 text-slate-600 border-slate-200/60',   dark: 'bg-slate-800/40 text-slate-400 border-slate-700/30',   dot: '#64748b' },
  // Roles
  owner:       { light: 'bg-violet-50 text-violet-700 border-violet-200/60', dark: 'bg-violet-950/30 text-violet-400 border-violet-800/30', dot: '#8b5cf6' },
  admin:       { light: 'bg-indigo-50 text-indigo-700 border-indigo-200/60', dark: 'bg-indigo-950/30 text-indigo-400 border-indigo-800/30', dot: '#6366f1' },
  operator:    { light: 'bg-sky-50 text-sky-700 border-sky-200/60',          dark: 'bg-sky-950/30 text-sky-400 border-sky-800/30',         dot: '#0ea5e9' },
  // Generics
  active:      { light: 'bg-emerald-50 text-emerald-700 border-emerald-200/60', dark: 'bg-emerald-950/30 text-emerald-400 border-emerald-800/30', dot: '#10b981' },
  inactive:    { light: 'bg-slate-100 text-slate-500 border-slate-200/60',   dark: 'bg-slate-800/40 text-slate-500 border-slate-700/30',   dot: '#94a3b8' },
  error:       { light: 'bg-rose-50 text-rose-700 border-rose-200/60',       dark: 'bg-rose-950/30 text-rose-400 border-rose-800/30',     dot: '#f43f5e' },
  success:     { light: 'bg-emerald-50 text-emerald-700 border-emerald-200/60', dark: 'bg-emerald-950/30 text-emerald-400 border-emerald-800/30', dot: '#10b981' },
  warning:     { light: 'bg-amber-50 text-amber-700 border-amber-200/60',    dark: 'bg-amber-950/30 text-amber-400 border-amber-800/30',   dot: '#f59e0b' },
  info:        { light: 'bg-blue-50 text-blue-700 border-blue-200/60',       dark: 'bg-blue-950/30 text-blue-400 border-blue-800/30',     dot: '#3b82f6' },
};

const FALLBACK = { light: 'bg-slate-100 text-slate-600 border-slate-200/60', dark: 'bg-slate-800/40 text-slate-400 border-slate-700/30', dot: '#94a3b8' };

interface StatusBadgeProps {
  status: string;
  label?: string;          // Override display text (default: capitalize status)
  size?: 'xs' | 'sm';
  dot?: boolean;           // Show leading dot
  theme?: 'light' | 'dark';
  className?: string;
}

export function StatusBadge({
  status,
  label,
  size = 'sm',
  dot = true,
  theme = 'dark',
  className = '',
}: StatusBadgeProps) {
  const key = status.toLowerCase().trim();
  const colors = STATUS_MAP[key] ?? FALLBACK;
  const colorCls = theme === 'light' ? colors.light : colors.dark;

  const displayLabel = label ?? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

  const sizeStyles = {
    xs: { fontSize: 'var(--admin-text-2xs)', padding: '1px 6px', dotSize: '5px' },
    sm: { fontSize: 'var(--admin-text-2xs)', padding: '2px 8px', dotSize: '6px' },
  };

  const s = sizeStyles[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 border rounded-full font-bold tracking-wide whitespace-nowrap ${colorCls} ${className}`}
      style={{ fontSize: s.fontSize, padding: s.padding }}
    >
      {dot && (
        <span
          className="rounded-full shrink-0 inline-block"
          style={{ 
            width: s.dotSize, 
            height: s.dotSize, 
            background: colors.dot,
            boxShadow: theme === 'dark' ? `0 0 6px ${colors.dot}` : undefined
          }}
        />
      )}
      {displayLabel}
    </span>
  );
}
