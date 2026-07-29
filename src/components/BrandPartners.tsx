import React, { type CSSProperties } from 'react';
import { BrandLogoCard } from './BrandLogoCard';
import { useSettings } from '@/context/SettingsContext';

interface BrandPartnersProps {
  brands?: { name: string; domain: string; logoUrl?: string }[];
}

type Brand = { name: string; domain: string; logoUrl?: string };

const MINIMUM_ROW_CARDS = 18;

function buildSeamlessTrack(row: Brand[]): Brand[] {
  if (row.length === 0) return [];

  // Make one segment longer than any viewport before duplicating it. This
  // prevents a visible empty edge when a merchant only has a few brands.
  const repeats = Math.ceil(MINIMUM_ROW_CARDS / row.length);
  const segment = Array.from({ length: repeats }, () => row).flat();
  return [...segment, ...segment];
}

function marqueeDuration(row: Brand[], speedFactor = 1): string {
  const segmentLength = Math.max(MINIMUM_ROW_CARDS, row.length);
  return `${Math.max(34, Math.round(segmentLength * 2.25 * speedFactor))}s`;
}

export const BrandPartners: React.FC<BrandPartnersProps> = ({ brands }) => {
  const { settings } = useSettings();
  
  // Resolve brands from settings
  const activeSection = settings.homepageSections?.sectionOrder?.find(s => s.type === 'brandPartners');
  const customBrands = brands?.length ? brands : activeSection?.settings?.brands || [];
  
  // High quality default brands with pre-uploaded logos in database
  const defaultBrands = [
    { name: 'La Roche-Posay', domain: 'laroche-posay.com', logoUrl: '/uploads/1783623589633_jkjd_png.png' },
    { name: 'Vichy', domain: 'vichyusa.com', logoUrl: '/uploads/1783623593877_uh_png.png' },
    { name: 'CeraVe', domain: 'cerave.com', logoUrl: '/uploads/1783623598712_dfq_png.png' },
    { name: 'Eucerin', domain: 'eucerin.com', logoUrl: '/uploads/1783623605965_Eucerin_logo_logotype_png.png' },
    { name: 'Bioderma', domain: 'bioderma.com', logoUrl: '/uploads/1783623610675_thf_png.png' },
    { name: 'SVR', domain: 'labo-svr.com', logoUrl: '/uploads/1783623616070_svr_png.png' },
    { name: 'Cetaphil', domain: 'cetaphil.com', logoUrl: '/uploads/1783623621993_op_png.png' },
    { name: 'Avène', domain: 'aveneusa.com', logoUrl: '/uploads/1783623626820_Avene_Logo_jpg.jpg' },
    { name: 'Mixa', domain: 'mixa.fr', logoUrl: '/uploads/1783623633547_logo_mixa_jpg.jpg' },
    { name: "L'Oréal Paris", domain: 'loreal-paris.com', logoUrl: '/uploads/1783623638829_ikl_png.png' },
    { name: 'Garnier', domain: 'garnier.com', logoUrl: '/uploads/1783623642984_kl_l_png.png' }
  ];

  // Merge custom brands and default brands, avoiding duplicates by name (case-insensitive)
  const mergedBrandsMap = new Map();
  defaultBrands.forEach(b => mergedBrandsMap.set(b.name.toLowerCase(), b));
  customBrands.forEach((b: any) => {
    mergedBrandsMap.set(b.name.toLowerCase(), b);
  });

  const allBrands = Array.from(mergedBrandsMap.values()) as Brand[];

  // Deal brands into rows rather than slicing groups. Each row therefore has
  // a varied sequence and no row gets stranded with a short tail of cards.
  const rows: Brand[][] = [[], [], []];
  allBrands.forEach((brand, index) => rows[index % rows.length].push(brand));
  const [row1, row2, row3] = rows;

  const row1Items = buildSeamlessTrack(row1);
  const row2Items = buildSeamlessTrack(row2);
  const row3Items = buildSeamlessTrack(row3);

  return (
    <section 
      className="aurora-bg border-b border-slate-200/40 relative overflow-hidden py-8 md:py-12 reveal-on-scroll"
    >
      <style>{`
        @keyframes marqueeL {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marqueeR {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .brand-marquee-l-1 {
          display: flex;
          gap: 0.75rem;
          width: max-content;
          animation: marqueeL var(--marquee-duration) linear infinite;
          will-change: transform;
          transform: translate3d(0, 0, 0);
        }
        .brand-marquee-r {
          display: flex;
          gap: 0.75rem;
          width: max-content;
          animation: marqueeR var(--marquee-duration) linear infinite;
          will-change: transform;
          transform: translate3d(0, 0, 0);
        }
        .brand-marquee-l-2 {
          display: flex;
          gap: 0.75rem;
          width: max-content;
          animation: marqueeL var(--marquee-duration) linear infinite;
          will-change: transform;
          transform: translate3d(0, 0, 0);
        }
        @media (min-width: 640px) {
          .brand-marquee-l-1 {
            gap: 1rem;
          }
        }
        /* Pause animation on hover so users can click reliably */
        .brand-marquee-l-1:hover,
        .brand-marquee-r:hover,
        .brand-marquee-l-2:hover {
          animation-play-state: paused;
        }
        /* Ensure card links inside marquee are fully interactive */
        .brand-marquee-l-1 a,
        .brand-marquee-r a,
        .brand-marquee-l-2 a {
          pointer-events: auto;
          cursor: pointer;
        }
        @media (prefers-reduced-motion: reduce) {
          .brand-marquee-l-1,
          .brand-marquee-r,
          .brand-marquee-l-2 {
            animation: none;
          }
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

          {/* Infinite Scrolling Marquee — pointer-events enabled on cards */}
          <div className="relative overflow-hidden w-full py-2 flex flex-col gap-4">
            
            {/* Fade Overlays — pointer-events-none so they don't block clicks */}
            <div className="absolute top-0 bottom-0 left-0 w-12 sm:w-20 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
            <div className="absolute top-0 bottom-0 right-0 w-12 sm:w-20 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />
            
            {/* Ticker Row 1 (Left) */}
            <div
              className="brand-marquee-l-1"
              style={{ '--marquee-duration': marqueeDuration(row1, 1) } as CSSProperties}
            >
              {row1Items.map((brand, i) => (
                <div key={brand.name + '-r1-' + i} className="w-[72px] sm:w-[150px] shrink-0">
                  <BrandLogoCard brand={brand} />
                </div>
              ))}
            </div>

            {/* Ticker Row 2 (Right) */}
            <div
              className="brand-marquee-r"
              style={{ '--marquee-duration': marqueeDuration(row2, 0.88), animationDelay: '-11s' } as CSSProperties}
            >
              {row2Items.map((brand, i) => (
                <div key={brand.name + '-r2-' + i} className="w-[72px] sm:w-[150px] shrink-0">
                  <BrandLogoCard brand={brand} />
                </div>
              ))}
            </div>

            {/* Ticker Row 3 (Left slower) */}
            <div
              className="brand-marquee-l-2"
              style={{ '--marquee-duration': marqueeDuration(row3, 1.12), animationDelay: '-19s' } as CSSProperties}
            >
              {row3Items.map((brand, i) => (
                <div key={brand.name + '-r3-' + i} className="w-[72px] sm:w-[150px] shrink-0">
                  <BrandLogoCard brand={brand} />
                </div>
              ))}
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
