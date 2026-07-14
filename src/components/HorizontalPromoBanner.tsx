import React from 'react';
import Image from 'next/image';
import { getOptimizedImageUrl } from '@/lib/image-optimizer';

interface HorizontalPromoBannerProps {
  settings?: {
    titleFr?: string;
    titleAr?: string;
    descFr?: string;
    descAr?: string;
    discountPercent?: number;
    bgImage?: string;
    overlayImage?: string;
  };
}

export const HorizontalPromoBanner: React.FC<HorizontalPromoBannerProps> = ({ settings }) => {
  const titleFr = settings?.titleFr || "En magasin ou en ligne, votre santé & sécurité est notre priorité";
  const titleAr = settings?.titleAr || "في المتجر أو عبر الإنترنت، صحتك وسلامتك هي أولويتنا";
  const descFr = settings?.descFr || "La seule parapharmacie qui simplifie votre quotidien beauté au Maroc";
  const descAr = settings?.descAr || "الصيدلية الوحيدة التي تجعل حياتك أسهل وأجمل في المغرب";
  const discountPercent = settings?.discountPercent !== undefined ? settings.discountPercent : 50;
  const bgImage = settings?.bgImage || "/images/promo/horizontal_promo.png";
  const overlayImage = settings?.overlayImage || "/images/promo/horizontal_promo_product_transparent.png";

  const isDefaultBg = bgImage === "/images/promo/horizontal_promo.png";

  return (
    <section className="bg-[#FAFAFA] border-b border-slate-200/40 relative py-8 sm:py-10 md:py-12 overflow-visible reveal-on-scroll">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 relative overflow-visible">
        
        {/* Banner container with overflow-visible to let product float above the top boundary */}
        <div className="relative rounded-[20px] flex flex-row items-center justify-between border border-emerald-500/10 shadow-xl shadow-slate-900/5 overflow-visible h-28 sm:h-32 group bg-slate-950">
          
          {/* BACKGROUND LAYER */}
          <div className="absolute inset-0 rounded-[20px] overflow-hidden pointer-events-none z-0">
            {isDefaultBg ? (
              // Rich premium luxury dark indigo/emerald gradient
              <div className="w-full h-full bg-gradient-to-r from-slate-950 via-[#131b26] to-[#0e2c26] relative">
                {/* Glowing decorative lights */}
                <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-48 h-48 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />
              </div>
            ) : (
              // Custom background with left-to-right gradient overlay to ensure text contrast
              <div className="w-full h-full relative">
                <img
                  src={getOptimizedImageUrl(bgImage)}
                  alt=""
                  aria-hidden
                  loading="lazy"
                  className="w-full h-full object-cover object-left group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/85 to-transparent" />
              </div>
            )}
            
            {/* Fine geometric ambient mesh lines */}
            <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_24px]" />
          </div>

          {/* LEFT: Text Block (highly readable with contrast tags) */}
          <div className="relative z-10 flex flex-col justify-center pl-6 sm:pl-8 md:pl-10 pr-4 py-4 flex-1 min-w-0 text-left">
            <span className="inline-flex self-start px-2 py-0.5 bg-emerald-500/15 text-emerald-400 text-[8px] sm:text-[9px] font-black uppercase tracking-wider rounded-md mb-1.5 border border-emerald-500/20">
              Engagement Santé & Qualité
            </span>
            <h3 className="text-xs sm:text-sm md:text-[17px] font-black text-white leading-snug tracking-tight truncate-two-lines">
              <span className="hidden rtl:inline">{titleAr}</span>
              <span className="inline rtl:hidden">{titleFr}</span>
            </h3>
            <p className="text-[10px] sm:text-[11px] text-slate-300 mt-1 font-semibold leading-relaxed truncate">
              <span className="hidden rtl:inline">{descAr}</span>
              <span className="inline rtl:hidden">{descFr}</span>
            </p>
          </div>

          {/* CENTER/RIGHT: Glassmorphic Discount Badge */}
          <div className="relative z-10 flex items-center shrink-0 pl-2 pr-2 sm:pr-4 select-none">
            <div className="border border-amber-400/20 bg-slate-900/40 backdrop-blur-md shadow-lg shadow-amber-500/5 rounded-full flex flex-col items-center justify-center w-16 h-16 sm:w-20 sm:h-20">
              <span className="font-black leading-none tracking-tight text-amber-400 text-base sm:text-xl md:text-2xl">
                -{discountPercent}%
              </span>
              <span className="text-[6px] sm:text-[7px] tracking-widest font-black text-slate-300 uppercase mt-0.5">
                RÉDUCTION
              </span>
            </div>
          </div>

          {/* RIGHT: Floating Product Image (3D floating effect with overflow-visible) */}
          <div className="relative z-20 shrink-0 flex items-end justify-end mr-4 sm:mr-6 md:mr-8 w-[90px] sm:w-[110px] md:w-[130px] h-[130px] sm:h-[150px] -mb-2 select-none self-end">
            <div className="relative w-full h-full -top-6 sm:-top-8 drop-shadow-[0_12px_24px_rgba(16,185,129,0.3)] group-hover:-translate-y-1.5 transition-transform duration-500 ease-out">
              <Image
                src={getOptimizedImageUrl(overlayImage)}
                alt="Promotion produit"
                fill
                sizes="(max-width: 640px) 90px, (max-width: 768px) 110px, 130px"
                className="object-contain"
                style={{ objectPosition: 'bottom' }}
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
