'use client';

import { useState } from 'react';
import { brandLogoSrc } from '@/lib/brand-logo';

/** Shared image resolution and failure state for storefront and brand management. */
export function BrandLogo({ name, domain, logo, className }: {
  name: string;
  domain?: string | null;
  logo?: string | null;
  className?: string;
}) {
  const src = brandLogoSrc(name, domain, logo);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  return !src || failedSrc === src
    ? <span className="text-xs font-bold text-slate-400 uppercase text-center" title="Logo indisponible — ajoutez une image dans Carte bannière">{name}</span>
    : <img src={src} alt={name} className={className || 'w-full h-full object-contain p-2'} loading="lazy" onError={() => setFailedSrc(src)} />;
}
