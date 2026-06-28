'use client';

import React from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';
import type { CurrencyCode } from '@/context/CurrencyContext';
import { CURRENCIES } from '@/context/CurrencyContext';

interface Language {
  id: string;
  label: string;
  flag: string;
}

interface TopBarProps {
  language: string;
  currentLang: Language;
  languages: Language[];
  showLangDropdown: boolean;
  langClosing: boolean;
  onOpenLang: () => void;
  onCloseLang: () => void;
  onToggleLanguage: (langId: string) => void;
  langRef: React.RefObject<HTMLDivElement>;

  selectedCurrency: CurrencyCode;
  currentCurrency: { id: CurrencyCode; label: string; symbol: string; flag: string };
  showCurrencyDropdown: boolean;
  currencyClosing: boolean;
  onOpenCurrency: () => void;
  onCloseCurrency: () => void;
  onSetCurrency: (c: CurrencyCode) => void;
  currencyRef: React.RefObject<HTMLDivElement>;

  isRTL: boolean;
  onOpenRoutineBuilder: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  language,
  currentLang,
  languages,
  showLangDropdown,
  langClosing,
  onOpenLang,
  onCloseLang,
  onToggleLanguage,
  langRef,
  selectedCurrency,
  currentCurrency,
  showCurrencyDropdown,
  currencyClosing,
  onOpenCurrency,
  onCloseCurrency,
  onSetCurrency,
  currencyRef,
  isRTL,
  onOpenRoutineBuilder,
}) => (
  <div
    className="hidden md:block w-full bg-white border-y border-slate-100 shadow-sm"
    style={{ paddingTop: '10px', paddingBottom: '10px' }}
  >
    <div
      className="max-w-[1400px] mx-auto px-6 md:px-[30px] flex items-center justify-between"
    >
      {/* Left: Shop Links */}
      <div className="flex items-center gap-6 lg:gap-8 text-[11.5px] font-medium text-slate-500 tracking-wide">
        <a href="#about" className="hover:text-primary transition-colors duration-200 cursor-pointer">
          {language === 'FR' ? 'À propos de nous' : 'من نحن'}
        </a>
        <span className="text-slate-200">|</span>
        <button
          onClick={onOpenRoutineBuilder}
          className="hover:text-primary transition-colors duration-200 cursor-pointer font-medium bg-transparent border-0 p-0 text-slate-500 flex items-center gap-1"
        >
          <Sparkles className="w-3 h-3 text-emerald-500" />
          <span>{language === 'FR' ? 'Routine sur Mesure' : 'روتين مخصص'}</span>
        </button>
        <span className="text-slate-200">|</span>
        <a href="/customer" className="hover:text-primary transition-colors duration-200 cursor-pointer">
          {language === 'FR' ? 'Mon Compte' : 'حسابي'}
        </a>
        <span className="text-slate-200">|</span>
        <a href="/customer" className="hover:text-primary transition-colors duration-200 cursor-pointer">
          {language === 'FR' ? 'Suivi de commande' : 'تتبع الطلب'}
        </a>
        <span className="text-slate-200">|</span>
        <a href="#footer" className="hover:text-primary transition-colors duration-200 cursor-pointer">
          {language === 'FR' ? 'Contactez-nous' : 'اتصل بنا'}
        </a>
      </div>

      {/* Right: Language & Currency */}
      <div className="flex items-center gap-5 text-[11.5px] text-slate-500">
        {/* Language Selector */}
        <div ref={langRef} className="relative">
          <button
            onClick={() => showLangDropdown ? onCloseLang() : onOpenLang()}
            className="flex items-center gap-2 hover:text-slate-700 transition-colors duration-200 font-medium cursor-pointer text-slate-600"
          >
            <span className="text-[18px] leading-none">{currentLang.flag}</span>
            <span className="text-[12px] font-semibold">{currentLang.label}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${showLangDropdown ? 'rotate-180' : ''}`} />
          </button>

          <div
            className={`t-dropdown absolute ${isRTL ? 'left-0' : 'right-0'} top-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] py-2 z-50 w-40${
              showLangDropdown && !langClosing ? ' is-open' : langClosing ? ' is-closing' : ''
            }`}
            data-origin="top-right"
          >
            {languages.map(lang => (
              <button
                key={lang.id}
                onClick={() => {
                  if (lang.id !== language) onToggleLanguage(lang.id);
                  onCloseLang();
                }}
                className={`w-full px-4 py-3 flex items-center gap-3 transition-colors ${isRTL ? 'text-right flex-row-reverse' : 'text-left'} ${
                  language === lang.id
                    ? 'text-slate-800 font-bold'
                    : 'text-slate-600 font-medium hover:bg-slate-50'
                }`}
              >
                <span className="text-[22px] leading-none">{lang.flag}</span>
                <span className="text-[13px]">{lang.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="w-px h-4 bg-slate-200" />

        {/* Currency Dropdown */}
        <div ref={currencyRef} className="relative">
          <button
            onClick={() => showCurrencyDropdown ? onCloseCurrency() : onOpenCurrency()}
            className="flex items-center gap-1.5 hover:text-primary transition-colors duration-200 font-semibold cursor-pointer"
          >
            <span className="text-[13px]">{currentCurrency.flag}</span>
            <span>{currentCurrency.label}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-300 transition-transform duration-200 ${showCurrencyDropdown ? 'rotate-180' : ''}`} />
          </button>
          <div
            className={`t-dropdown absolute ${isRTL ? 'left-0' : 'right-0'} top-full mt-2 bg-white border border-slate-100 rounded-xl shadow-2xl py-1.5 z-50 w-36${
              showCurrencyDropdown && !currencyClosing ? ' is-open' : currencyClosing ? ' is-closing' : ''
            }`}
            data-origin="top-right"
          >
            {CURRENCIES.map(c => (
              <button
                key={c.id}
                onClick={() => { onSetCurrency(c.id); onCloseCurrency(); }}
                className={`w-full px-4 py-2.5 text-[11px] font-semibold flex items-center gap-2.5 transition-colors ${isRTL ? 'text-right flex-row-reverse' : 'text-left'} ${
                  selectedCurrency === c.id
                    ? 'bg-primary/5 text-primary font-bold'
                    : 'hover:bg-slate-50 text-slate-600'
                }`}
              >
                <span className="text-[14px]">{c.flag}</span>
                <span>{c.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);
