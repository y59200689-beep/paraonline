'use client';

import React, { useState } from 'react';

interface BrandLogoCardProps {
  brand: {
    name: string;
    domain: string;
  };
}

export const BrandLogoCard: React.FC<BrandLogoCardProps> = ({ brand }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className="bezel-outer !p-1.5 bg-slate-50/80 border border-slate-100/80 rounded-2xl hover:scale-[1.03] hover:shadow-[0_12px_28px_-6px_rgba(13,148,136,0.15),_0_0_20px_rgba(13,148,136,0.05)] hover:border-accent/40 transition-all duration-300 cursor-pointer group"
    >
      <div className="bezel-inner flex items-center justify-center bg-white rounded-[12px] py-4 px-5 h-[64px] sm:h-[72px] transition-colors duration-300 w-full">
        {imgError ? (
          <span className="text-[10px] sm:text-xs font-black tracking-widest text-slate-400 group-hover:text-primary uppercase transition-colors duration-300">
            {brand.name}
          </span>
        ) : (
          <img
            src={`https://logos.hunter.io/${brand.domain}`}
            alt={brand.name}
            className="h-8 max-w-[120px] object-contain filter grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        )}
      </div>
    </div>
  );
};
