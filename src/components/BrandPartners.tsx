import React, { useState, useEffect } from 'react';
import { BrandLogoCard } from './BrandLogoCard';

interface BrandData {
  name: string;
  domain: string;
  logo_url?: string | null;
  card_link?: string | null;
}

interface BrandPartnersProps {
  // Optional override list (e.g. from SSR props) – if omitted, fetched from /api/brands
  brands?: BrandData[];
}

const FALLBACK_BRANDS: BrandData[] = [
  { name: 'La Roche-Posay', domain: 'laroche-posay.com', logo_url: '/uploads/1783623589633_jkjd_png.png' },
  { name: 'Vichy', domain: 'vichyusa.com', logo_url: '/uploads/1783623593877_uh_png.png' },
  { name: 'CeraVe', domain: 'cerave.com', logo_url: '/uploads/1783623598712_dfq_png.png' },
  { name: 'Eucerin', domain: 'eucerin.com', logo_url: '/uploads/1783623605965_Eucerin_logo_logotype_png.png' },
  { name: 'Bioderma', domain: 'bioderma.com', logo_url: '/uploads/1783623610675_thf_png.png' },
  { name: 'SVR', domain: 'labo-svr.com', logo_url: '/uploads/1783623616070_svr_png.png' },
  { name: 'Cetaphil', domain: 'cetaphil.com', logo_url: '/uploads/1783623621993_op_png.png' },
  { name: 'Avène', domain: 'aveneusa.com', logo_url: '/uploads/1783623626820_Avene_Logo_jpg.jpg' },
  { name: 'Mixa', domain: 'mixa.fr', logo_url: '/uploads/1783623633547_logo_mixa_jpg.jpg' },
  { name: "L'Oréal Paris", domain: 'loreal-paris.com', logo_url: '/uploads/1783623638829_ikl_png.png' },
  { name: 'Garnier', domain: 'garnier.com', logo_url: '/uploads/1783623642984_kl_l_png.png' },
];

export const BrandPartners: React.FC<BrandPartnersProps> = ({ brands: propBrands }) => {
  const [dbBrands, setDbBrands] = useState<BrandData[]>([]);

  useEffect(() => {
    fetch('/api/brands')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.brands?.length) setDbBrands(data.brands);
      })
      .catch(() => {}); // keep fallback on error
  }, []);

  const brands = React.useMemo(() => {
    let list: BrandData[] = [];

    if (propBrands && Array.isArray(propBrands) && propBrands.length > 0) {
      list = propBrands.map((b: any) => {
        if (typeof b === 'string') {
          const match = FALLBACK_BRANDS.find(f => f.name.toLowerCase() === b.toLowerCase());
          return match || { name: b, domain: `${b.toLowerCase().replace(/[^a-z0-9]/g, '')}.com` };
        }
        return b;
      });
    } else if (dbBrands.length > 0) {
      list = dbBrands;
    }

    // Ensure at least 9 brand cards so the 3 marquee rows are rich and full
    if (list.length < 9) {
      const existingNames = new Set(list.map(b => b.name?.toLowerCase()));
      for (const fb of FALLBACK_BRANDS) {
        if (!existingNames.has(fb.name.toLowerCase())) {
          list.push(fb);
        }
      }
    }

    return list;
  }, [propBrands, dbBrands]);

  // Split into 3 marquee rows
  const brandsPerRow = Math.ceil(brands.length / 3);
  const brandRows = Array.from({ length: 3 }, (_, rowIndex) =>
    brands.slice(rowIndex * brandsPerRow, (rowIndex + 1) * brandsPerRow)
  ).filter((row) => row.length > 0);


  return (
    <section 
      className="aurora-bg border-b border-slate-200/40 relative overflow-hidden py-8 md:py-12 reveal-on-scroll"
    >
      <style>{`
        .brand-partner-viewport {
          overflow: hidden;
          width: 100%;
          mask-image: linear-gradient(to right, transparent, black 4%, black 96%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 4%, black 96%, transparent);
        }
        .brand-partner-track {
          display: flex;
          width: max-content;
          gap: 0.75rem;
          will-change: transform;
          animation: brand-partner-marquee 220s linear infinite;
        }
        .brand-partner-track--reverse {
          animation-direction: reverse;
          animation-duration: 260s;
        }
        .brand-partner-track--slow {
          animation-duration: 300s;
        }
        @media (min-width: 640px) {
          .brand-partner-track {
            gap: 1rem;
          }
        }
        .brand-partner-viewport:hover .brand-partner-track {
          animation-play-state: paused;
        }
        .brand-partner-track a {
          pointer-events: auto;
          cursor: pointer;
        }
        @keyframes brand-partner-marquee {
          to { transform: translate3d(-50%, 0, 0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .brand-partner-viewport {
            overflow-x: auto;
            mask-image: none;
            -webkit-mask-image: none;
            scrollbar-width: none;
          }
          .brand-partner-track { animation: none; }
          .brand-partner-viewport::-webkit-scrollbar { display: none; }
        }
      `}</style>

      {/* Ambient glow orbs */}
      <div className="glow-orb glow-orb-teal animate-float-slow -bottom-20 -left-20 w-[300px] h-[300px]" />
      <div className="glow-orb glow-orb-indigo top-0 -right-20 w-[200px] h-[200px]" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        
        {/* Main White Parent Container */}
        <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-slate-100/80 p-6 md:p-8">
          
          {/* Header Section */}
          <div className="flex flex-col gap-1 items-start mb-6 font-sans">
            <span className="eyebrow-tag eyebrow-tag-light">
              <span className="hidden rtl:inline">ماركات رسمية</span>
              <span className="inline rtl:hidden">Marques Officielles</span>
            </span>
            <h2 className="text-base sm:text-lg font-black text-slate-800 tracking-tight leading-none mt-1">
              <span className="hidden rtl:inline">تسوق ماركاتك المفضلة</span>
              <span className="inline rtl:hidden">Achetez vos marques préférées</span>
            </h2>
          </div>

          <div className="space-y-2.5 sm:space-y-3" aria-label="Marques partenaires">
            {brandRows.map((row, rowIndex) => {
              const rowBrands = [...row, ...row, ...row];
              const motionClass = rowIndex === 1
                ? 'brand-partner-track--reverse'
                : rowIndex === 2
                  ? 'brand-partner-track--slow'
                  : '';
              const baseMultiplier = rowIndex === 1 ? 16 : rowIndex === 2 ? 18 : 14;
              const dynamicDuration = Math.max(120, row.length * baseMultiplier);

              return (
                <div className="brand-partner-viewport py-0.5" key={`brand-row-${rowIndex}`}>
                  <div
                    className={`brand-partner-track ${motionClass}`}
                    style={{ animationDuration: `${dynamicDuration}s` }}
                  >
                    {rowBrands.map((brand, index) => (
                      <div
                        key={`${brand.name}-${rowIndex}-${index}`}
                        className="w-32 sm:w-44 shrink-0"
                      >
                        <BrandLogoCard brand={brand} decorative={index >= row.length} />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
};
