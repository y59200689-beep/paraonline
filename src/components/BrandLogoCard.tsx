'use client';

import React from 'react';
import Link from 'next/link';
import { BrandLogo } from './BrandLogo';
import { storefrontBrandLogo } from '@/lib/storefront-brand-logos';
import styles from './BrandLogoCard.module.css';
import logoBounds from '@/lib/brand-logo-bounds.json';
import { brandLogoSrc } from '@/lib/brand-logo';


interface BrandLogoCardProps {
  brand: {
    name: string;
    domain: string;
    logoUrl?: string | null;
    logo_url?: string | null;
    card_link?: string | null;
  };
  decorative?: boolean;
}

export const BrandLogoCard: React.FC<BrandLogoCardProps> = ({ brand, decorative = false }) => {
  const brandName = brand.name || 'Marque';

  const logo = brand.logo_url ?? brand.logoUrl;
  const replacement = storefrontBrandLogo(brandName);
  const domain = brand.domain || `${brandName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
  const href = brand.card_link || `/products?brand=${encodeURIComponent(brandName)}`;
  const source = brandLogoSrc(brandName, domain, replacement || logo);
  const artworkBounds = (logoBounds as Record<string, number[]>)[source];

  return (
    <Link
      href={href}
      prefetch={false}
      aria-hidden={decorative || undefined}
      tabIndex={decorative ? -1 : undefined}
      className="w-full block"
    >
      <div
        style={{ backgroundColor: '#ffffff' }}
        className="relative flex items-center justify-center border border-slate-200 rounded-xl sm:rounded-2xl h-[64px] sm:h-[88px] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_12px_28px_-6px_rgba(13,148,136,0.15),_0_0_20px_rgba(13,148,136,0.05)] hover:border-accent/40 cursor-pointer group overflow-hidden w-full"
      >
          <BrandLogo
            logo={replacement || logo}
            fallbackSrc={replacement}
            domain={domain}
            name={brandName}
            className={styles.logo}
            artworkBounds={artworkBounds}
          />
      </div>
    </Link>
  );
};
