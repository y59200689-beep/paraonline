import React from 'react';
import Image from 'next/image';

export const HorizontalPromoBanner: React.FC = () => {
  return (
    <section className="bg-[#FAFAFA] border-b border-slate-200/40 relative overflow-hidden py-4 reveal-on-scroll">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 md:px-12 lg:px-16 xl:px-20 relative z-10">

        {/* Slim banner container — fixed 88px height, overflow visible for product image */}
        <div
          className="relative rounded-[16px] flex flex-row items-center justify-between border border-[#C5B4E3]/30 group overflow-hidden"
          style={{ height: '88px' }}
        >
          {/* Generated premium background */}
          <div className="absolute inset-0 rounded-[16px] overflow-hidden pointer-events-none">
            <img
              src="/images/promo/horizontal_promo.png"
              alt=""
              aria-hidden
              className="w-full h-full object-cover object-left group-hover:scale-[1.02] transition-transform duration-700 ease-out"
            />
            {/* Subtle overlay to keep text contrast */}
            <div className="absolute inset-0 bg-[#0f1825]/20" />
          </div>

          {/* LEFT: Text block */}
          <div className="relative z-10 flex flex-col justify-center pl-6 md:pl-8 pr-4 py-3 flex-1 min-w-0 text-left">
            <h3 className="text-[13px] md:text-[15px] font-black text-[#2D1B5E] leading-snug tracking-tight">
              <span className="hidden rtl:inline">في المتجر أو عبر الإنترنت، صحتك وسلامتك هي أولويتنا</span>
              <span className="inline rtl:hidden">En magasin ou en ligne, votre santé & sécurité est notre priorité</span>
            </h3>
            <p className="text-[10px] text-[#5B4690]/75 mt-0.5 font-semibold leading-snug">
              <span className="hidden rtl:inline">الصيدلية الوحيدة التي تجعل حياتك أسهل وأجمل في المغرب</span>
              <span className="inline rtl:hidden">La seule parapharmacie qui simplifie votre quotidien beauté au Maroc</span>
            </p>
          </div>

          {/* CENTER: Large ghost discount percentage */}
          <div className="relative z-10 flex items-center justify-center shrink-0 px-6 md:px-10 select-none">
            <span
              className="font-black leading-none tracking-tighter text-[#A085C8]/40"
              style={{ fontSize: 'clamp(56px, 8vw, 88px)' }}
            >
              %<span>50</span>
            </span>
          </div>

          {/* RIGHT: Product image — overflows upward above the banner */}
          <div
            className="relative z-10 shrink-0 flex items-end justify-end pr-4 md:pr-6"
            style={{ width: '100px', height: '120px', marginBottom: '-0px', alignSelf: 'flex-end' }}
          >
            <Image
              src="/images/categories/bebe.png"
              alt="Promotion produit"
              fill
              sizes="100px"
              className="group-hover:scale-105 transition-transform duration-500 ease-out filter drop-shadow-[0_8px_20px_rgba(91,70,144,0.18)]"
              style={{ objectPosition: 'bottom' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
