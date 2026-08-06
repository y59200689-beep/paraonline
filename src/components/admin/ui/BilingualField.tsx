'use client';

import React from 'react';
import { Globe, Languages } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';

type Lang = 'fr' | 'ar';

interface BilingualFieldProps {
  label: string;
  valueFr: string;
  valueAr: string;
  onChangeFr: (v: string) => void;
  onChangeAr: (v: string) => void;
  multiline?: boolean;
  rows?: number;
  placeholder?: { fr?: string; ar?: string };
  required?: boolean;
  hint?: string;
}

export function BilingualField({
  label,
  valueFr,
  valueAr,
  onChangeFr,
  onChangeAr,
  multiline = false,
  rows = 3,
  placeholder,
  required = false,
  hint,
}: BilingualFieldProps) {
  const { adminTheme } = useAdmin();
  const isDark = adminTheme === 'dark';

  const inputStyle = (lang: Lang): React.CSSProperties => ({
    width: '100%',
    fontSize: '13px',
    padding: '8px 12px',
    borderRadius: 'var(--admin-radius)',
    border: isDark ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(0,0,0,0.1)',
    background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
    color: isDark ? '#e2e8f0' : '#0f172a',
    direction: lang === 'ar' ? 'rtl' : 'ltr',
    resize: multiline ? 'vertical' : undefined,
    fontFamily: lang === 'ar' ? 'var(--font-arabic, system-ui)' : 'inherit',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    outline: 'none',
  });

  const labelStyle: React.CSSProperties = {
    fontSize: '10px',
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    color: isDark ? '#475569' : '#94a3b8',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginBottom: '4px',
  };

  const wrapperStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  };

  const TAG_STYLES: Record<Lang, React.CSSProperties> = {
    fr: { fontSize: '9px', fontWeight: 800, padding: '1px 6px', borderRadius: '4px', background: isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.08)', color: isDark ? '#a5b4fc' : '#4338ca', letterSpacing: '0.1em', textTransform: 'uppercase' },
    ar: { fontSize: '9px', fontWeight: 800, padding: '1px 6px', borderRadius: '4px', background: isDark ? 'rgba(245,158,11,0.12)' : 'rgba(245,158,11,0.08)', color: isDark ? '#fbbf24' : '#b45309', letterSpacing: '0.1em', textTransform: 'uppercase' },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {/* Field label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Languages className="w-3.5 h-3.5" style={{ color: isDark ? '#475569' : '#94a3b8' }} />
        <span style={{ ...labelStyle, marginBottom: 0 }}>
          {label}
          {required && <span style={{ color: '#f43f5e' }}>*</span>}
        </span>
        {hint && <span style={{ fontSize: '10px', color: isDark ? '#334155' : '#94a3b8', marginLeft: 'auto' }}>{hint}</span>}
      </div>

      {/* Side-by-side columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {/* French */}
        <div style={wrapperStyle}>
          <label style={labelStyle}>
            <Globe className="w-3 h-3" />
            <span>Français</span>
            <span style={TAG_STYLES.fr}>FR</span>
          </label>
          {multiline ? (
            <textarea
              value={valueFr}
              onChange={e => onChangeFr(e.target.value)}
              placeholder={placeholder?.fr ?? 'Texte en français…'}
              rows={rows}
              style={inputStyle('fr')}
              onFocus={e => { (e.target as HTMLElement).style.borderColor = isDark ? 'rgba(99,102,241,0.4)' : 'rgba(99,102,241,0.4)'; }}
              onBlur={e => { (e.target as HTMLElement).style.borderColor = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.1)'; }}
            />
          ) : (
            <input
              type="text"
              value={valueFr}
              onChange={e => onChangeFr(e.target.value)}
              placeholder={placeholder?.fr ?? 'Texte en français…'}
              style={inputStyle('fr')}
              onFocus={e => { (e.target as HTMLElement).style.borderColor = isDark ? 'rgba(99,102,241,0.4)' : 'rgba(99,102,241,0.4)'; }}
              onBlur={e => { (e.target as HTMLElement).style.borderColor = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.1)'; }}
            />
          )}
        </div>

        {/* Arabic */}
        <div style={wrapperStyle}>
          <label style={labelStyle}>
            <Globe className="w-3 h-3" />
            <span>العربية</span>
            <span style={TAG_STYLES.ar}>AR</span>
          </label>
          {multiline ? (
            <textarea
              value={valueAr}
              onChange={e => onChangeAr(e.target.value)}
              placeholder={placeholder?.ar ?? 'النص بالعربية…'}
              rows={rows}
              style={inputStyle('ar')}
              dir="rtl"
              onFocus={e => { (e.target as HTMLElement).style.borderColor = isDark ? 'rgba(245,158,11,0.4)' : 'rgba(245,158,11,0.4)'; }}
              onBlur={e => { (e.target as HTMLElement).style.borderColor = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.1)'; }}
            />
          ) : (
            <input
              type="text"
              value={valueAr}
              onChange={e => onChangeAr(e.target.value)}
              placeholder={placeholder?.ar ?? 'النص بالعربية…'}
              style={inputStyle('ar')}
              dir="rtl"
              onFocus={e => { (e.target as HTMLElement).style.borderColor = isDark ? 'rgba(245,158,11,0.4)' : 'rgba(245,158,11,0.4)'; }}
              onBlur={e => { (e.target as HTMLElement).style.borderColor = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.1)'; }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
