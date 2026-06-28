import React from 'react';
import { BrandLogoCard } from './BrandLogoCard';

export const BrandPartners: React.FC = () => {
  return (
    <section 
      className="aurora-bg border-b border-slate-200/40 relative overflow-hidden py-14 md:py-20 reveal-on-scroll"
    >
      {/* Ambient glow orbs */}
      <div className="glow-orb glow-orb-teal animate-float-slow -bottom-20 -left-20 w-[400px] h-[400px]" />
      <div className="glow-orb glow-orb-indigo top-0 -right-20 w-[300px] h-[300px]" />

      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 md:px-12 lg:px-16 xl:px-20 relative z-10">
        
        {/* Main White Parent Container */}
        <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-slate-100/80 p-6 sm:p-8 md:p-10 lg:p-12">
          
          {/* Header Section */}
          <div className="flex flex-col gap-2 items-start mb-8 border-b border-slate-100 pb-5 select-none font-sans">
            <span className="eyebrow-tag eyebrow-tag-light">
              <span className="hidden rtl:inline">ماركات رسمية</span>
              <span className="inline rtl:hidden">Marques Officielles</span>
            </span>
            <h2 className="text-lg sm:text-xl md:text-[22px] font-black text-slate-800 tracking-tight leading-none mt-2">
              <span className="hidden rtl:inline">تسوق ماركاتك المفضلة</span>
              <span className="inline rtl:hidden">Achetez vos marques préférées</span>
            </h2>
          </div>

          {/* Brands 2-Row Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 md:gap-5">
            {[
              { name: 'La Roche-Posay', domain: 'laroche-posay.com' },
              { name: 'Vichy', domain: 'vichyusa.com' },
              { name: 'CeraVe', domain: 'cerave.com' },
              { name: 'Eucerin', domain: 'eucerin.com' },
              { name: 'Bioderma', domain: 'bioderma.com' },
              { name: 'SVR', domain: 'labo-svr.com' },
              { name: 'Cetaphil', domain: 'cetaphil.com' },
              { name: 'Avène', domain: 'aveneusa.com' },
              { name: 'Mixa', domain: 'mixa.fr' },
              { name: "L'Oréal Paris", domain: 'loreal-paris.com' },
              { name: 'Garnier', domain: 'garnier.com' },
              { name: 'Erborian', domain: 'erborian.com' },
              { name: 'Kérastase', domain: 'kerastase.com' },
              { name: 'Dercos Technique', domain: 'dercos.com' }
            ].map((brand, i) => (
              <BrandLogoCard brand={brand} key={i} />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};
