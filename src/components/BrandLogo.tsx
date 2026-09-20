'use client';

import { useState } from 'react';
import { brandLogoSrc } from '@/lib/brand-logo';

/** Shared image resolution and failure state for storefront and brand management. */
export function BrandLogo({ name, domain, logo, className, fallbackSrc, artworkBounds }: {
  name: string;
  domain?: string | null;
  logo?: string | null;
  className?: string;
  fallbackSrc?: string;
  artworkBounds?: readonly number[];
}) {
  const src = brandLogoSrc(name, domain, logo);
  const [failedSources, setFailedSources] = useState<string[]>([]);
  const displaySrc = src && !failedSources.includes(src) ? src : fallbackSrc && !failedSources.includes(fallbackSrc) ? fallbackSrc : '';
  if (!displaySrc) return <span className="px-3 text-base font-bold text-slate-800 text-center leading-tight">{name}</span>;
  const onError = () => setFailedSources(previous => [...previous, displaySrc]);
  if (artworkBounds?.length === 6 && displaySrc === src) {
    const [width, height, left, top, artworkWidth, artworkHeight] = artworkBounds;
    const scale = Math.min(128 / artworkWidth, 44 / artworkHeight);
    // Frame the artwork, not the source canvas. Only empty outer margins are hidden.
    return <span style={{ position: 'relative', display: 'block', flexShrink: 0, overflow: 'hidden', width: artworkWidth * scale, height: artworkHeight * scale }}>
      <img src={displaySrc} alt={name} loading="lazy" onError={onError} style={{ position: 'absolute', width: width * scale, height: height * scale, maxWidth: 'none', left: -left * scale, top: -top * scale }} />
    </span>;
  }
  return <img src={displaySrc} alt={name} className={className || 'w-full h-full object-contain p-2'} loading="lazy" onError={onError} />;
}
