'use client';

import React, { useState } from 'react';
import { RotateCcw, Sparkles, ShieldCheck, ShieldAlert } from 'lucide-react';
import { FaqTranslations } from './faqTranslations';
import { playChime } from './playChime';

interface ReturnsTabProps {
  text: FaqTranslations;
}

export const ReturnsTab: React.FC<ReturnsTabProps> = ({ text }) => {
  const [retSealed, setRetSealed] = useState<boolean | null>(null);
  const [retDays, setRetDays] = useState<number>(3);

  const handleReset = () => {
    playChime(500, 'sawtooth', 0.1);
    setRetSealed(null);
    setRetDays(3);
  };

  return (
    <div className="flex-1 flex flex-col justify-between gap-6 animate-[fadeIn_0.4s_ease-out]">
      {/* Questionnaire */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Q1: Sealed */}
        <div className="bg-slate-50 border border-slate-200/50 rounded-[20px] p-5 flex flex-col gap-3">
          <span className="block text-[9.5px] font-black text-slate-400 uppercase tracking-wider">
            {text.retQ1}
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => { playChime(800, 'sine', 0.05); setRetSealed(true); }}
              className={`py-3 px-3 rounded-[12px] text-[10.5px] font-bold text-center border transition-all ${
                retSealed === true
                  ? 'bg-sky-50/50 border-sky-200 text-sky-600 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              {text.retYes}
            </button>
            <button
              onClick={() => { playChime(800, 'sine', 0.05); setRetSealed(false); }}
              className={`py-3 px-3 rounded-[12px] text-[10.5px] font-bold text-center border transition-all ${
                retSealed === false
                  ? 'bg-sky-50/50 border-sky-200 text-sky-600 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              {text.retNo}
            </button>
          </div>
        </div>

        {/* Q2: Days elapsed */}
        <div className="bg-slate-50 border border-slate-200/50 rounded-[20px] p-5 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="block text-[9.5px] font-black text-slate-400 uppercase tracking-wider">
              {text.retQ2}
            </span>
            <span className="text-xs font-black text-sky-600 bg-sky-50 px-2 py-0.5 border border-sky-100 rounded-md">
              {retDays} {text.retQ2Label}
            </span>
          </div>
          <div className="py-2">
            <input
              type="range"
              min="1"
              max="15"
              value={retDays}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (val % 3 === 0) playChime(650 + val * 10, 'sine', 0.03);
                setRetDays(val);
              }}
              className="w-full accent-sky-500 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[8px] font-bold text-slate-400 mt-2">
              <span>1 j</span>
              <span>7 j (Limite)</span>
              <span>15 j</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decision matrix */}
      <div className="border-t border-slate-100 pt-6">
        {retSealed === null ? (
          <div className="flex flex-col items-center justify-center p-8 bg-slate-50/30 border border-dashed border-slate-200 rounded-[20px] text-slate-400 text-center gap-2">
            <Sparkles className="w-5 h-5 text-slate-300" />
            <span className="text-[11px] font-bold">
              Veuillez renseigner le formulaire ci-dessus pour lancer le diagnostic.
            </span>
          </div>
        ) : (
          <div className="animate-[fadeIn_0.5s_ease-out]">
            {retSealed === false ? (
              <div className="bg-red-50/40 border border-red-200/50 rounded-[20px] p-5 flex items-start gap-4 text-left rtl:text-right">
                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500 shrink-0 border border-red-100">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <h4 className="text-[12px] font-black text-red-600 uppercase tracking-wider">
                    {text.retNotSealed}
                  </h4>
                  <p className="text-[11px] font-medium text-slate-600 leading-relaxed mt-1">
                    {text.retNotSealedDesc}
                  </p>
                </div>
              </div>
            ) : retDays > 7 ? (
              <div className="bg-red-50/40 border border-red-200/50 rounded-[20px] p-5 flex items-start gap-4 text-left rtl:text-right">
                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500 shrink-0 border border-red-100">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <h4 className="text-[12px] font-black text-red-600 uppercase tracking-wider">
                    {text.retDaysExceeded}
                  </h4>
                  <p className="text-[11px] font-medium text-slate-600 leading-relaxed mt-1">
                    {text.retDaysExceededDesc}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50/40 border border-emerald-200/50 rounded-[20px] p-5 flex items-start gap-4 text-left rtl:text-right relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0 border border-emerald-100 shadow-sm">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <h4 className="text-[12px] font-black text-emerald-700 uppercase tracking-wider">
                    {text.retEligible}
                  </h4>
                  <p className="text-[11px] font-medium text-slate-600 leading-relaxed mt-1">
                    {text.retEligibleDesc}
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={handleReset}
              className="mt-4 text-[11px] font-black uppercase tracking-wider text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1.5 mx-auto py-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{text.retReset}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
