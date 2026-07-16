import React from 'react';
import { BrandLogoCard } from './BrandLogoCard';
import { useSettings } from '@/context/SettingsContext';

interface BrandPartnersProps {
  brands?: { name: string; domain: string; logoUrl?: string }[];
}

export const BrandPartners: React.FC<BrandPartnersProps> = () => {
  const { settings } = useSettings();
  
  // Resolve brands from settings
  const activeSection = settings.homepageSections?.sectionOrder?.find(s => s.type === 'brandPartners');
  const customBrands = activeSection?.settings?.brands || [];
  
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

  const allBrands = Array.from(mergedBrandsMap.values());

  // Split into 3 rows for the marquee
  const len = allBrands.length;
  const size = Math.ceil(len / 3);
  const row1 = allBrands.slice(0, size);
  const row2 = allBrands.slice(size, size * 2);
  const row3 = allBrands.slice(size * 2);

  // Duplicate each row for seamless -50% translateX loop
  const row1Items = [...row1, ...row1];
  const row2Items = [...row2, ...row2];
  const row3Items = [...row3, ...row3];

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
          gap: 0.5rem;
          width: max-content;
          animation: marqueeL 120s linear infinite;
        }
        .brand-marquee-r {
          display: flex;
          gap: 0.5rem;
          width: max-content;
          animation: marqueeR 100s linear infinite;
        }
        .brand-marquee-l-2 {
          display: flex;
          gap: 0.5rem;
          width: max-content;
          animation: marqueeL 140s linear infinite;
        }
        @media (min-width: 640px) {
          .brand-marquee-l-1 {
            gap: 1rem;
            animation-duration: 380s;
          }
          .brand-marquee-r {
            gap: 1rem;
            animation-duration: 320s;
          }
          .brand-marquee-l-2 {
            gap: 1rem;
            animation-duration: 440s;
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
            <div className="brand-marquee-l-1">
              {row1Items.map((brand, i) => (
                <div key={brand.name + '-r1-' + i} className="w-[72px] sm:w-[150px] shrink-0">
                  <BrandLogoCard brand={brand} />
                </div>
              ))}
            </div>

            {/* Ticker Row 2 (Right) */}
            <div className="brand-marquee-r">
              {row2Items.map((brand, i) => (
                <div key={brand.name + '-r2-' + i} className="w-[72px] sm:w-[150px] shrink-0">
                  <BrandLogoCard brand={brand} />
                </div>
              ))}
            </div>

            {/* Ticker Row 3 (Left slower) */}
            <div className="brand-marquee-l-2">
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
