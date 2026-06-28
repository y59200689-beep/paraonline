'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Check, Zap, Truck } from 'lucide-react';
import { MOROCCAN_CITIES } from '@/lib/data';
import { FaqTranslations } from './faqTranslations';
import { playChime } from './playChime';

interface DeliveryTabProps {
  text: FaqTranslations;
  language: string;
  isRTL: boolean;
}

export const DeliveryTab: React.FC<DeliveryTabProps> = ({ text, language, isRTL }) => {
  const [delCity, setDelCity] = useState<string>('casablanca');
  const [delSearch, setDelSearch] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const matchedCity = MOROCCAN_CITIES.find((c) => c.value.toLowerCase() === delCity);
  const displaySearch =
    delSearch !== null
      ? delSearch
      : matchedCity
      ? language === 'FR'
        ? matchedCity.labelFr
        : matchedCity.labelAr
      : '';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isSameDayCity = [
    'casablanca', 'rabat', 'tanger', 'fes', 'fès', 'meknes', 'meknès', 'tetouan', 'tétouan',
  ].includes(delCity.toLowerCase());
  const deliveryStatusText = isSameDayCity ? text.delSameDay : text.delStandard;

  const filteredCities = MOROCCAN_CITIES.filter((c) => {
    const query = displaySearch.toLowerCase();
    return (
      c.value.toLowerCase().includes(query) ||
      c.labelFr.toLowerCase().includes(query) ||
      c.labelAr.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex-1 flex flex-col justify-between gap-6 animate-[fadeIn_0.4s_ease-out]">
      {/* City autocomplete */}
      <div className="flex flex-col gap-2 relative" ref={dropdownRef}>
        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
          {text.delCityLabel}
        </label>
        <div className="relative">
          <input
            type="text"
            value={displaySearch}
            onChange={(e) => { setDelSearch(e.target.value); setIsDropdownOpen(true); }}
            onFocus={() => setIsDropdownOpen(true)}
            placeholder={text.delSearchPlaceholder}
            className="w-full px-4 py-3.5 pr-10 rtl:pr-4 rtl:pl-10 bg-slate-50 border border-slate-200 rounded-[14px] text-xs font-bold text-slate-700 focus:outline-none focus:border-teal-500 transition-colors shadow-inner"
          />
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 rtl:right-auto rtl:left-3.5 text-slate-400 pointer-events-none">
            <MapPin className="w-4 h-4 text-slate-400" />
          </div>
        </div>

        {isDropdownOpen && (
          <div
            className="absolute left-0 right-0 top-[calc(100%+6px)] bg-white border border-slate-200/80 shadow-[0_12px_36px_rgba(15,23,42,0.08)] rounded-[16px] max-h-[190px] overflow-y-auto z-[60] py-1.5 animate-[fadeIn_0.15s_ease-out] no-scrollbar"
            style={{ direction: isRTL ? 'rtl' : 'ltr' }}
          >
            {filteredCities.length > 0 ? (
              filteredCities.map((c) => {
                const isSelected = delCity === c.value.toLowerCase();
                return (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => {
                      playChime(750, 'sine', 0.05);
                      setDelCity(c.value.toLowerCase());
                      setDelSearch(null);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left rtl:text-right px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer flex items-center justify-between ${
                      isSelected ? 'bg-teal-500/10 text-teal-800' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{language === 'FR' ? c.labelFr : c.labelAr}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-teal-600" />}
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-3 text-xs font-bold text-slate-400 text-center">
                {text.delNoResults}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Home-delivery exclusivity banner */}
      <div className="bg-teal-500/[0.03] border border-teal-500/15 rounded-[20px] p-4 flex items-start gap-4 text-left rtl:text-right relative overflow-hidden group hover:border-teal-500/30 hover:bg-teal-500/[0.05] transition-all duration-300">
        <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/10 rounded-full blur-xl pointer-events-none" />
        <div className="w-9 h-9 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-600 shrink-0 group-hover:scale-105 transition-transform duration-300">
          <Truck className="w-4.5 h-4.5" />
        </div>
        <div className="flex-1">
          <h4 className="text-[11.5px] font-black text-teal-800 uppercase tracking-wider">
            {text.delNoticeTitle}
          </h4>
          <p className="text-[11px] font-medium text-slate-500 leading-relaxed mt-1">
            {text.delNoticeDesc}
          </p>
        </div>
      </div>

      {/* Timeline tracker */}
      <div className="border-t border-slate-100 pt-6">
        <span className="block text-[9px] font-black uppercase text-slate-400 tracking-wider mb-5 text-center">
          {text.delTimelineTitle}
        </span>

        <div className="relative w-full py-2">
          <div className="absolute left-[8%] right-[8%] top-[18px] h-[2px] bg-slate-100 z-0" />

          <div className="grid grid-cols-4 relative z-10 w-full text-center">
            {[
              { title: text.delStep1, sub: '0 min', isDone: true },
              { title: text.delStep2, sub: text.delLabLabel, isDone: true },
              { title: text.delStep3, sub: text.delTransitLabel, isDone: true },
              { title: text.delStep4, sub: deliveryStatusText, isHighlight: true, isDone: true },
            ].map((step, sIdx) => (
              <div key={sIdx} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-500 ${
                    step.isHighlight
                      ? 'bg-teal-500 border-teal-500 text-white scale-110 shadow-[0_0_12px_rgba(13,148,136,0.3)] animate-pulse'
                      : step.isDone
                      ? 'bg-teal-50 border-teal-200 text-teal-600 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-300'
                  }`}
                >
                  {step.isHighlight ? (
                    <Zap className="w-3.5 h-3.5 fill-white text-white" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                </div>
                <span
                  className={`text-[10px] font-black mt-2 tracking-tight ${
                    step.isHighlight ? 'text-teal-600' : 'text-slate-800'
                  }`}
                >
                  {step.title}
                </span>
                <span className="text-[8px] font-bold text-slate-400 mt-0.5 leading-snug">
                  {step.sub}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
