'use client';

import React from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { ShieldCheck, Award, Heart, CheckCircle2 } from 'lucide-react';

export const OfficialDistributorBadge: React.FC = () => {
  const { language } = useTranslation();
  const isAR = language === 'AR';

  return (
    <section className="relative py-12 md:py-16 overflow-hidden bg-slate-900 text-white dark:bg-slate-950 border-t border-b border-slate-800 dark:border-white/5">
      {/* Background radial effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-indigo-500/5 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Block: Trust Shield */}
          <div className="col-span-12 lg:col-span-4 flex items-center gap-4 text-center lg:text-left justify-center lg:justify-start">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shadow-[0_8px_30px_rgb(16,185,129,0.1)] shrink-0">
              <ShieldCheck className="w-9 h-9 md:w-11 md:h-11" strokeWidth={1.5} />
            </div>
            <div className="text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-1.5">
                <Award className="w-3 h-3" />
                {isAR ? 'منتجات مختارة بعناية' : 'SÉLECTION SOIGNÉE'}
              </div>
              <h3 className="text-xl md:text-2xl font-black tracking-tight leading-none text-white">
                {isAR ? 'Des marques reconnues, choisies avec soin' : 'Des marques reconnues, choisies avec soin'}
              </h3>
            </div>
          </div>

          {/* Middle Block: Descriptive statement */}
          <div className="col-span-12 lg:col-span-4 text-center lg:text-left space-y-2 lg:border-l lg:border-slate-800 lg:pl-10">
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-medium">
              {isAR
                ? 'نختار منتجات العناية بالبشرة والـ K-Beauty من موردين وعلامات تجارية معروفة.'
                : 'Nous sélectionnons des soins et produits K-Beauty auprès de fournisseurs et de marques reconnus.'}
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-[10px] md:text-[11px] font-bold text-slate-400">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                {isAR ? 'علامات معروفة' : 'Marques reconnues'}
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                {isAR ? 'تغليف آمن' : 'Emballage soigné'}
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                {isAR ? 'متابعة الطلب' : 'Suivi de commande'}
              </span>
            </div>
          </div>

          {/* Right Block: Brand logos trust stack */}
          <div className="col-span-12 lg:col-span-4 bg-slate-800/40 border border-slate-700/30 rounded-2xl p-5 md:p-6 flex flex-col justify-center items-center lg:items-start gap-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block w-full text-center lg:text-left mb-1">
              {isAR ? 'علامات مختارة' : 'Marques sélectionnées'}
            </span>
            <div className="flex flex-wrap justify-center lg:justify-start items-center gap-4 text-xs font-black tracking-widest text-slate-400">
              <span className="opacity-80 hover:opacity-100 hover:text-white transition-opacity select-none">CERAVE</span>
              <span className="opacity-80 hover:opacity-100 hover:text-white transition-opacity select-none">BIODERMA</span>
              <span className="opacity-80 hover:opacity-100 hover:text-white transition-opacity select-none">VICHY</span>
              <span className="opacity-80 hover:opacity-100 hover:text-white transition-opacity select-none">EUCERIN</span>
              <span className="opacity-80 hover:opacity-100 hover:text-white transition-opacity select-none">LA ROCHE-POSAY</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
