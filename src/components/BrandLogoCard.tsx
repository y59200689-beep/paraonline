'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { slugify } from '@/lib/brands';

interface BrandLogoCardProps {
  brand: {
    name: string;
    domain: string;
    logoUrl?: string;
  };
}

export const BrandLogoCard: React.FC<BrandLogoCardProps> = ({ brand }) => {
  const [imgError, setImgError] = useState(false);
  const brandSlug = slugify(brand.name);

  return (
    <Link
      href={`/brand/${brandSlug}`}
      className="w-full block"
    >
      <div
        style={{ backgroundColor: '#ffffff' }}
        className="relative flex items-center justify-center border border-slate-205 rounded-2xl h-[64px] sm:h-[72px] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_12px_28px_-6px_rgba(13,148,136,0.15),_0_0_20px_rgba(13,148,136,0.05)] hover:border-accent/40 cursor-pointer group overflow-hidden w-full"
      >
        {imgError ? (
          <span className="text-[10px] sm:text-xs font-black tracking-widest text-slate-400 group-hover:text-primary uppercase transition-colors duration-300 px-4 text-center">
            {brand.name}
          </span>
        ) : (
          <img
            src={brand.logoUrl || `https://logos.hunter.io/${brand.domain}`}
            alt={brand.name}
            className="w-full h-full object-contain filter grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300 p-2"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        )}
      </div>
    </Link>
  );
};

