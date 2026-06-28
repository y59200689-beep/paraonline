'use client';

import React, { useState } from 'react';
import { RotateCcw, ShieldCheck, ShieldAlert, Sparkles } from 'lucide-react';
import type { FaqText } from './translations';

const playChime = (freq = 600, type: OscillatorType = 'sine', duration = 0.08) => {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.02, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch { /* ignore audio block */ }
};

interface ReturnsTabProps {
  text: FaqText;
}

export const ReturnsTab: React.FC<ReturnsTabProps> = ({ text }) => {
  const [retSealed, setRetSealed] = useState<boolean | null>(null);
  const [retDays, setRetDays] = useState(3);

  const handleReset = () => {
    playChime(500, 'sawtooth', 0.1);
    setRetSealed(null);
    setRetDays(3);
  };

  const isEligible = retSealed === true && retDays <= 7;
  const isNotSealed = retSealed === false;
  const isDaysExceeded = retSealed === true && retDays > 7;

  return (
    <div className="flex-1 flex flex-col justify-between gap-6 animate-[fadeIn_0.4s_ease-out]">
      {/* Questionnaire */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Q1: Sealed? */}
        <div className="bg-slate-50 border border-slate-200/50 rounded-[20px] p-5 flex flex-col gap-3">
          <span className="block text-[9.5px] font-black text-slate-400 uppercase tracking-wider">{text.retQ1}</span>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: text.retYes, value: true },
              { label: text.retNo, value: false },
            ].map(({ label, value }) => (
              <button
                key={String(value)}
                onClick={() => { playChime(800, 'sine', 0.05); setRetSealed(value); }}
                className={`py-3 px-3 rounded-[12px] text-[10.5px] font-bold text-center border transition-all ${
                  retSealed === value
                    ? 'bg-sky-50/50 border-sky-200 text-sky-600 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Q2: Days elapsed */}
        <div className="bg-slate-50 border border-slate-200/50 rounded-[20px] p-5 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="block text-[9.5px] font-black text-slate-400 uppercase tracking-wider">{text.retQ2}</span>
            <span className="text-xs font-black text-sky-600 bg-sky-50 px-2 py-0.5 border border-sky-100 rounded-md">
              {retDays} {text.retQ2Label}
            </span>
          </div>
          <div className="py-2">
            <input
              type="range" min="1" max="15" value={retDays}
              onChange={e => {
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

      {/* Clinical Decision Matrix */}
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
            {isNotSealed && (
              <div className="bg-red-50/40 border border-red-200/50 rounded-[20px] p-5 flex items-start gap-4 text-left rtl:text-right">
                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500 shrink-0 border border-red-100">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <h4 className="text-[12px] font-black text-red-600 uppercase tracking-wider">{text.retNotSealed}</h4>
                  <p className="text-[11px] font-medium text-slate-600 leading-relaxed mt-1">{text.retNotSealedDesc}</p>
                </div>
              </div>
            )}
            {isDaysExceeded && (
              <div className="bg-red-50/40 border border-red-200/50 rounded-[20px] p-5 flex items-start gap-4 text-left rtl:text-right">
                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500 shrink-0 border border-red-100">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <h4 className="text-[12px] font-black text-red-600 uppercase tracking-wider">{text.retDaysExceeded}</h4>
                  <p className="text-[11px] font-medium text-slate-600 leading-relaxed mt-1">{text.retDaysExceededDesc}</p>
                </div>
              </div>
            )}
            {isEligible && (
              <div className="bg-emerald-50/40 border border-emerald-200/50 rounded-[20px] p-5 flex items-start gap-4 text-left rtl:text-right relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0 border border-emerald-100 shadow-sm">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <h4 className="text-[12px] font-black text-emerald-700 uppercase tracking-wider">{text.retEligible}</h4>
                  <p className="text-[11px] font-medium text-slate-600 leading-relaxed mt-1">{text.retEligibleDesc}</p>
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
