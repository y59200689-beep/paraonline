'use client';

import React, { useState } from 'react';
import { CreditCard, MapPin, Lock } from 'lucide-react';
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

interface PaymentsTabProps {
  text: FaqText;
  isRTL: boolean;
}

export const PaymentsTab: React.FC<PaymentsTabProps> = ({ text, isRTL }) => {
  const [payMethod, setPayMethod] = useState<'card' | 'cod'>('card');
  const [cardHover, setCardHover] = useState(false);

  const methods = [
    { id: 'card' as const, name: text.payCard, icon: CreditCard },
    { id: 'cod' as const, name: text.payCod, icon: MapPin },
  ];

  return (
    <div className="flex-1 flex flex-col justify-between gap-6 animate-[fadeIn_0.4s_ease-out]">
      {/* Method selector + card graphic */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Method options */}
        <div className="flex flex-col gap-3">
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">{text.payMethodLabel}</label>
          {methods.map(m => {
            const isActive = payMethod === m.id;
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                onClick={() => { playChime(720, 'sine', 0.05); setPayMethod(m.id); }}
                className={`w-full text-left rtl:text-right p-4 rounded-[16px] border flex items-center justify-between transition-all ${
                  isActive
                    ? 'bg-indigo-500/[0.02] border-indigo-500/40 shadow-sm'
                    : 'bg-slate-50/50 border-slate-200/50 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${
                    isActive ? 'bg-white text-indigo-600 border-indigo-100' : 'bg-white text-slate-400 border-slate-200'
                  }`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className={`text-xs font-black tracking-tight ${isActive ? 'text-indigo-700' : 'text-slate-700'}`}>
                    {m.name}
                  </span>
                </div>
                {isActive && (
                  <div className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Card / COD graphic */}
        <div className="flex justify-center">
          {payMethod === 'card' ? (
            <div
              onMouseEnter={() => setCardHover(true)}
              onMouseLeave={() => setCardHover(false)}
              className="w-72 h-44 rounded-2xl p-5 text-white flex flex-col justify-between relative overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-[0_15px_35px_rgba(8,13,25,0.2)] border border-slate-800"
              style={{
                background: 'linear-gradient(135deg, #090e18 0%, #111a2e 50%, #0d121c 100%)',
                transform: cardHover
                  ? 'perspective(1000px) rotateY(12deg) rotateX(4deg) scale(1.03)'
                  : 'perspective(1000px) rotateY(0deg) rotateX(0deg) scale(1)',
              }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-start justify-between w-full">
                <div className="w-9 h-7 rounded-md bg-gradient-to-br from-amber-200 to-amber-400 opacity-80 border border-amber-300/30" />
                <Lock className="w-4 h-4 text-slate-400" />
              </div>

              <div className="flex flex-col gap-1 mt-4">
                <span className="text-[12px] font-mono tracking-[0.25em] text-slate-300">**** **** **** 8820</span>
                <div className="flex justify-between text-[7px] font-mono uppercase text-slate-500 tracking-widest mt-1">
                  <span>CARDHOLDER NAME</span>
                  <span>VALID THRU</span>
                </div>
                <div className="flex justify-between text-[9px] font-mono text-slate-300">
                  <span>SECURE CLIENT</span>
                  <span>12 / 29</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-800/80 pt-2.5 mt-2">
                <span className="text-[7.5px] font-black uppercase text-indigo-400 tracking-wider">{text.paySecureBadge}</span>
                <div className="flex gap-2">
                  <span className="px-1.5 py-0.5 bg-white/10 rounded border border-white/5 font-sans text-[7px] font-bold text-slate-300">CMI</span>
                  <span className="px-1.5 py-0.5 bg-white/10 rounded border border-white/5 font-sans text-[7px] font-bold text-slate-300">VISA</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-72 h-44 bg-slate-50 border border-slate-200/50 rounded-2xl p-5 flex flex-col justify-between items-center text-center shadow-inner">
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 shadow-sm mt-2">
                <MapPin className="w-5 h-5" />
              </div>
              <h4 className="text-[11px] font-black text-slate-700 uppercase tracking-widest">CASH ON DELIVERY (COD)</h4>
              <p className="text-[9.5px] font-semibold text-slate-400 leading-normal max-w-[180px] mb-2">{text.payCodDesc}</p>
            </div>
          )}
        </div>
      </div>

      {/* SSL console */}
      <div className="border-t border-slate-100 pt-6">
        <div className="bg-slate-900 border border-slate-800 text-slate-300 rounded-[20px] p-4 flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-[9px]">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span className="text-emerald-400 font-extrabold">{text.paySslStatus}</span>
            </div>
            <span className="text-slate-600">|</span>
            <span>COMPLIANCE: VERIFIED</span>
            <span className="text-slate-600">|</span>
            <span>TLS 1.3</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400 uppercase tracking-wider font-sans font-black text-[8px] bg-white/5 border border-white/10 rounded px-2.5 py-1">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>{text.paySecureLock}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
