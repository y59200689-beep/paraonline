'use client';

import React from 'react';

type CardVariant = 'default' | 'flat' | 'ghost' | 'inset';

interface AdminCardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  theme?: 'light' | 'dark';
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  bezel?: boolean;
  onClick?: () => void;
  as?: 'div' | 'section' | 'article';
}

const paddingMap = {
  none: 'p-0',
  sm:   'p-4',
  md:   'p-6',
  lg:   'p-8',
};

export function AdminCard({
  children,
  variant = 'default',
  theme = 'dark',
  className = '',
  padding = 'md',
  hoverable = false,
  bezel = true,
  onClick,
  as: Tag = 'div',
}: AdminCardProps) {
  const isLight = theme === 'light';

  const base = `rounded-[var(--admin-radius-lg)] transition-colors ${paddingMap[padding]}`;

  const variantStyles = {
    default: isLight
      ? 'bg-white border border-[hsl(220_13%_90%)] shadow-[0_1px_3px_rgba(15,30,54,0.05)]'
      : 'bg-[hsl(224_20%_9%)] border border-[hsl(224_15%_16%)] shadow-[0_1px_3px_rgba(0,0,0,0.30)]',

    flat: isLight
      ? 'bg-white border border-[hsl(220_13%_90%)]'
      : 'bg-[hsl(224_20%_9%)] border border-[hsl(224_15%_16%)]',

    ghost: isLight
      ? 'bg-[hsl(220_14%_98%)] border border-[hsl(220_13%_92%)]'
      : 'bg-[hsl(224_16%_13%)] border border-[hsl(224_14%_18%)]',

    inset: isLight
      ? 'bg-[hsl(220_14%_97%)] border border-[hsl(220_13%_91%)] shadow-[inset_0_1px_3px_rgba(15,30,54,0.04)]'
      : 'bg-[hsl(224_22%_7%)] border border-[hsl(224_14%_14%)] shadow-[inset_0_1px_4px_rgba(0,0,0,0.4)]',
  };

  const hoverStyles = hoverable
    ? isLight
      ? 'hover:border-[hsl(160_50%_74%)] hover:shadow-[0_3px_10px_rgba(15,30,54,0.07)] cursor-pointer active:scale-[0.99]'
      : 'hover:border-[hsl(160_30%_28%)] hover:shadow-[0_3px_10px_rgba(0,0,0,0.38)] cursor-pointer active:scale-[0.99]'
    : '';

  if (bezel && variant === 'default') {
    return (
      <div className={`rounded-[var(--admin-radius-lg)] ${
        isLight
          ? 'bg-transparent'
          : 'bg-transparent'
      }`}>
        <Tag
          className={`${base} ${variantStyles[variant]} ${hoverStyles} ${className}`}
          onClick={onClick}
          style={{ transitionDuration: 'var(--admin-transition-base)' }}
        >
          {children}
        </Tag>
      </div>
    );
  }

  return (
    <Tag
      className={`${base} ${variantStyles[variant]} ${hoverStyles} ${className}`}
      onClick={onClick}
      style={{ transitionDuration: 'var(--admin-transition-base)' }}
    >
      {children}
    </Tag>
  );
}

// ── AdminCard.Header ──────────────────────────────────────────────────────────
interface CardHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  theme?: 'light' | 'dark';
  className?: string;
}

export function AdminCardHeader({
  title,
  description,
  icon,
  action,
  theme = 'dark',
  className = '',
}: CardHeaderProps) {
  return (
    <div className={`flex items-start justify-between gap-3 mb-5 ${className}`}>
      <div className="flex items-start gap-3 min-w-0">
        {icon && (
          <div
            className={`shrink-0 w-8 h-8 rounded-[var(--admin-radius-sm)] flex items-center justify-center ${
              theme === 'light'
                ? 'bg-emerald-50 border border-emerald-100 text-emerald-600'
                : 'bg-emerald-950/40 border border-emerald-900/30 text-emerald-400'
            }`}
          >
            {icon}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3
            className="font-semibold leading-tight tracking-tight"
            style={{
              fontSize: 'var(--admin-text-base)',
              color: 'var(--admin-text-primary)',
            }}
          >
            {title}
          </h3>
          {description && (
            <p
              className="mt-0.5 leading-snug"
              style={{
                fontSize: 'var(--admin-text-xs)',
                color: 'var(--admin-text-muted)',
              }}
            >
              {description}
            </p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
