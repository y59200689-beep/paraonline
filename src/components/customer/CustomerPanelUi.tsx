'use client';

import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

type Tone = 'emerald' | 'blue' | 'amber' | 'violet' | 'slate';

const toneStyles: Record<Tone, { icon: string; value: string }> = {
  emerald: { icon: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-400', value: 'text-emerald-400' },
  blue: { icon: 'border-sky-400/20 bg-sky-400/10 text-sky-400', value: 'text-sky-400' },
  amber: { icon: 'border-amber-400/20 bg-amber-400/10 text-amber-400', value: 'text-amber-400' },
  violet: { icon: 'border-violet-400/20 bg-violet-400/10 text-violet-400', value: 'text-violet-400' },
  slate: { icon: 'border-slate-400/20 bg-slate-400/10 text-slate-300', value: 'text-slate-100' },
};

export function CustomerPanelCard({
  children,
  theme = 'dark',
  className = '',
  as: Tag = 'section',
}: {
  children: ReactNode;
  theme?: 'light' | 'dark';
  className?: string;
  as?: 'div' | 'section' | 'article';
}) {
  return (
    <Tag
      className={`rounded-2xl border ${
        theme === 'dark'
          ? 'border-slate-800 bg-slate-900/92 shadow-[0_18px_44px_-32px_rgba(0,0,0,0.9)]'
          : 'border-slate-200 bg-white shadow-[0_18px_44px_-34px_rgba(15,23,42,0.28)]'
      } ${className}`}
    >
      {children}
    </Tag>
  );
}

export function CustomerMetricCard({
  label,
  value,
  unit,
  description,
  icon: Icon,
  tone,
  theme,
  action,
}: {
  label: string;
  value: ReactNode;
  unit?: string;
  description: ReactNode;
  icon: LucideIcon;
  tone: Tone;
  theme: 'light' | 'dark';
  action: ReactNode;
}) {
  const styles = toneStyles[tone];

  return (
    <CustomerPanelCard theme={theme} className="flex min-h-[15.25rem] flex-col p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <p className={`pt-1 text-[0.68rem] font-bold uppercase tracking-[0.13em] ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
          {label}
        </p>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${styles.icon}`}>
          <Icon className="h-[1.15rem] w-[1.15rem]" aria-hidden="true" />
        </span>
      </div>

      <div className="mt-7 min-h-[4.75rem]">
        <p className={`text-[1.9rem] font-bold leading-none tracking-[-0.035em] ${theme === 'dark' ? 'text-white' : 'text-slate-950'}`}>
          {value}
          {unit ? <span className={`ms-1.5 text-[0.72rem] font-bold uppercase tracking-[0.08em] ${styles.value}`}>{unit}</span> : null}
        </p>
        <div className={`mt-2 text-xs leading-5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
          {description}
        </div>
      </div>

      <div className="mt-auto pt-5">{action}</div>
    </CustomerPanelCard>
  );
}

export function CustomerSectionHeader({
  eyebrow,
  title,
  description,
  action,
  theme,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  theme: 'light' | 'dark';
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-emerald-500">{eyebrow}</p> : null}
        <h2 className={`mt-1 text-xl font-bold tracking-[-0.025em] sm:text-2xl ${theme === 'dark' ? 'text-white' : 'text-slate-950'}`}>{title}</h2>
        {description ? <p className={`mt-1 max-w-2xl text-sm leading-6 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function CustomerStatusBadge({ label, status }: { label: string; status: string }) {
  const key = status.toLowerCase();
  const tone = /deliver|livr|confirm|success/.test(key)
    ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
    : /cancel|return|fail|annul|échec/.test(key)
      ? 'border-rose-400/20 bg-rose-400/10 text-rose-300'
      : /ship|transit|expédi/.test(key)
        ? 'border-sky-400/20 bg-sky-400/10 text-sky-300'
        : 'border-amber-400/20 bg-amber-400/10 text-amber-300';

  return (
    <span className={`inline-flex min-h-7 items-center rounded-full border px-2.5 text-[0.68rem] font-bold ${tone}`}>
      {label}
    </span>
  );
}
