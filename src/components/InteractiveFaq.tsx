'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { useSettings } from '@/context/SettingsContext';
import { MapPin, RotateCcw, CreditCard, MessageSquare, ArrowRight } from 'lucide-react';

// Sub-components
import { translations } from './InteractiveFaq/translations';
import { DeliveryTab } from './InteractiveFaq/DeliveryTab';
import { ReturnsTab } from './InteractiveFaq/ReturnsTab';
import { PaymentsTab } from './InteractiveFaq/PaymentsTab';

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

const TAB_CONFIG = [
  { labelKey: 'tabDelivery' as const, icon: MapPin,     num: '01', activeColor: 'border-teal-500 text-teal-600 bg-teal-500/[0.02]' },
  { labelKey: 'tabReturns'  as const, icon: RotateCcw,  num: '02', activeColor: 'border-sky-500 text-sky-600 bg-sky-500/[0.02]' },
  { labelKey: 'tabPayments' as const, icon: CreditCard, num: '03', activeColor: 'border-indigo-500 text-indigo-600 bg-indigo-500/[0.02]' },
];

const GLOW_COLORS = ['bg-teal-500/10', 'bg-sky-500/10', 'bg-indigo-500/10'];

export const InteractiveFaq: React.FC = () => {
  const { language } = useTranslation();
  const { settings } = useSettings();
  const currentLang = (language === 'AR' ? 'AR' : 'FR') as 'AR' | 'FR';
  const text = translations[currentLang];
  const isRTL = language === 'AR';

  const [activeTab, setActiveTab] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Scroll-reveal
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.unobserve(el); } },
      { threshold: 0.08, rootMargin: '0px 0px -50px 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleTabChange = (idx: number) => {
    playChime(600 + idx * 80, 'sine', 0.06);
    setActiveTab(idx);
  };

  const activeTabIcons = [MapPin, RotateCcw, CreditCard];
  const ActiveIcon = activeTabIcons[activeTab];

  return (
    <section
      ref={sectionRef}
      className={`bg-[#FAFAFA] border-t border-slate-200/40 relative overflow-hidden reveal-on-scroll ${isVisible ? 'active' : ''}`}
      style={{ paddingTop: '96px', paddingBottom: '96px' }}
      id="interactive-faq-protocol"
    >
      {/* Grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4.5rem_4.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.25] pointer-events-none" />

      {/* Active tab radial glow */}
      <div className={`absolute top-[20%] right-[15%] w-[480px] h-[480px] rounded-full blur-3xl pointer-events-none transition-all duration-700 ${GLOW_COLORS[activeTab]}`} />

      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 md:px-12 lg:px-16 xl:px-20 relative z-10">

        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16 gap-4">
          <div className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] bg-teal-50 text-teal-800 border border-teal-200/50">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
            <span>{text.sectionBadge}</span>
          </div>
          <h2 className="font-black font-heading text-slate-800 tracking-tight leading-tight text-[clamp(28px,3.5vw,36px)]">
            {text.sectionTitle}
          </h2>
          <p className="text-slate-500 font-medium leading-relaxed max-w-2xl text-[13.5px]">
            {text.sectionDesc}
          </p>
        </div>

        {/* Console Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch w-full">

          {/* LEFT: Tab Navigation + WhatsApp Support */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              {TAB_CONFIG.map((tab, idx) => {
                const isActive = activeTab === idx;
                const Icon = tab.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleTabChange(idx)}
                    className={`w-full text-left rtl:text-right rounded-[20px] p-5 border flex items-center justify-between transition-all duration-300 cursor-pointer ${
                      isActive
                        ? `${tab.activeColor} border-opacity-40 shadow-[0_8px_25px_rgba(0,0,0,0.02)]`
                        : 'bg-white/80 border-slate-200/60 hover:bg-white hover:border-slate-300/80'
                    }`}
                  >
                    <div className={`flex items-center gap-4 w-full ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border transition-all duration-300 ${
                        isActive ? 'bg-white border-current/25 shadow-sm text-current' : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}>
                        <Icon className="w-4 h-4" strokeWidth={2} />
                      </div>
                      <span className={`text-[10px] font-black tracking-widest shrink-0 transition-colors ${isActive ? 'text-current' : 'text-slate-400'}`}>
                        {tab.num}
                      </span>
                      <span className={`font-black text-[13px] tracking-tight leading-snug truncate ${isActive ? 'text-slate-800' : 'text-slate-600'}`}>
                        {text[tab.labelKey]}
                      </span>
                    </div>
                    {isActive && (
                      <div className="shrink-0 w-4 h-4 rounded-full flex items-center justify-center bg-white border border-slate-200 shadow-sm">
                        <ArrowRight className={`w-2.5 h-2.5 text-slate-600 transition-transform ${isRTL ? 'rotate-180' : ''}`} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* WhatsApp Support Callout */}
            <div className="rounded-[24px] bg-slate-900 border border-slate-800 p-6 flex flex-col gap-4 text-left rtl:text-right text-white relative overflow-hidden group shadow-lg">
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className={`flex items-start justify-between gap-4 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className="flex flex-col gap-1.5">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/15 border border-emerald-500/30 rounded text-[8px] font-black text-emerald-400 uppercase tracking-widest">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>ONLINE</span>
                  </div>
                  <h3 className="font-black text-[14px] text-white tracking-tight mt-1">{text.supTitle}</h3>
                  <p className="text-[11.5px] font-medium text-slate-400 leading-relaxed max-w-[220px]">{text.supDesc}</p>
                </div>
                <a
                  href={`https://wa.me/${settings.storeWhatsApp || '212660808080'}`}
                  target="_blank" rel="noopener noreferrer"
                  onClick={() => playChime(900, 'sine', 0.12)}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#25D366] hover:scale-105 transition-all duration-300 shrink-0 text-white cursor-pointer shadow-sm"
                >
                  <MessageSquare className="w-4.5 h-4.5" />
                </a>
              </div>

              <a
                href={`https://wa.me/${settings.storeWhatsApp || '212660808080'}`}
                target="_blank" rel="noopener noreferrer"
                onClick={() => playChime(900, 'sine', 0.12)}
                className="w-full mt-2 py-2.5 rounded-[12px] text-[10px] font-black uppercase tracking-wider text-center block transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(160deg, #128C4A 0%, #25D366 55%, #1DA34A 100%)',
                  color: '#ffffff',
                  boxShadow: '0 2px 12px rgba(37,211,102,0.28), inset 0 1px 0 rgba(255,255,255,0.12)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.background = 'linear-gradient(160deg, #0d7a3e 0%, #1fb857 55%, #178f40 100%)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLAnchorElement).style.background = 'linear-gradient(160deg, #128C4A 0%, #25D366 55%, #1DA34A 100%)';
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#ffffff" style={{ flexShrink: 0 }}>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.557 4.123 1.528 5.855L.057 23.997l6.305-1.647A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.002-1.37l-.36-.213-3.733.976.998-3.638-.234-.374A9.789 9.789 0 012.182 12C2.182 6.578 6.578 2.182 12 2.182c5.423 0 9.818 4.396 9.818 9.818 0 5.423-4.395 9.818-9.818 9.818z"/>
                </svg>
                {text.supButton}
              </a>
            </div>
          </div>

          {/* RIGHT: Interactive Panel */}
          <div className="lg:col-span-8 flex">
            <div className="w-full bg-white border border-slate-200/50 rounded-[28px] shadow-[0_12px_40px_rgba(26,37,93,0.03)] p-6 md:p-8 flex flex-col justify-between relative overflow-hidden min-h-[500px]">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-slate-100/50 to-transparent pointer-events-none border-t border-r border-slate-200/10 rounded-tr-[28px]" />

              <div className="w-full h-full flex flex-col justify-between gap-6">
                {/* Panel Header */}
                <div className={`flex items-start gap-4 ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm shrink-0 border ${
                    activeTab === 0 ? 'bg-teal-50 border-teal-100 text-teal-600' :
                    activeTab === 1 ? 'bg-sky-50 border-sky-100 text-sky-600' :
                    'bg-indigo-50 border-indigo-100 text-indigo-600'
                  }`}>
                    <ActiveIcon className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-black text-[16px] text-slate-800 leading-snug tracking-tight">
                      {activeTab === 0 && text.delTitle}
                      {activeTab === 1 && text.retTitle}
                      {activeTab === 2 && text.payTitle}
                    </h3>
                    <p className="text-[12px] font-medium text-slate-400 leading-relaxed mt-1">
                      {activeTab === 0 && text.delDesc}
                      {activeTab === 1 && text.retDesc}
                      {activeTab === 2 && text.payDesc}
                    </p>
                  </div>
                </div>

                {/* Active Tab Content */}
                {activeTab === 0 && <DeliveryTab text={text} language={language} isRTL={isRTL} />}
                {activeTab === 1 && <ReturnsTab text={text} />}
                {activeTab === 2 && <PaymentsTab text={text} isRTL={isRTL} />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
