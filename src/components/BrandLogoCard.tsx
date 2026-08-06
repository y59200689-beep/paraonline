'use client';

import React, { useState } from 'react';
import Link from 'next/link';


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
  const [imgError, setImgError] = useState(false);
  const brandName = brand.name || 'Marque';

  const logo = brand.logo_url || brand.logoUrl;
  const domain = brand.domain || `${brandName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
  const href = brand.card_link || `/products?brand=${encodeURIComponent(brandName)}`;

  return (
    <Link
      href={href}
      aria-hidden={decorative || undefined}
      tabIndex={decorative ? -1 : undefined}
      className="w-full block"
    >
      <div
        style={{ backgroundColor: '#ffffff' }}
        className="relative flex items-center justify-center border border-slate-200 rounded-xl sm:rounded-2xl h-[46px] sm:h-[72px] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_12px_28px_-6px_rgba(13,148,136,0.15),_0_0_20px_rgba(13,148,136,0.05)] hover:border-accent/40 cursor-pointer group overflow-hidden w-full"
      >
        {imgError ? (
          <span className="text-[7.5px] sm:text-xs font-black tracking-widest text-slate-400 group-hover:text-primary uppercase transition-colors duration-300 px-1 text-center truncate w-full">
            {brandName}
          </span>
        ) : (
          <img
            src={logo || `https://logos.hunter.io/${domain}`}
            alt={brandName}
            className="w-full h-full object-contain filter grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300 p-1.5 sm:p-2"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        )}
      </div>
    </Link>
  );
};
