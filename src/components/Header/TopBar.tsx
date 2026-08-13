'use client';

import React from 'react';
import Link from 'next/link';
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
}) => (
  <div
    className="hidden lg:block w-full bg-white border-y border-slate-100 shadow-sm"
    style={{ paddingTop: '10px', paddingBottom: '10px' }}
  >
    <div
      className="max-w-[1400px] mx-auto px-6 md:px-[30px] flex items-center justify-between"
    >
      {/* Left: Shop Links */}
      <div className="flex items-center gap-6 lg:gap-8 text-[11.5px] font-medium text-slate-500 tracking-wide">
        <Link href="/a-propos" className="hover:text-primary transition-colors duration-200 cursor-pointer">
          {language === 'FR' ? 'À propos de nous' : 'من نحن'}
        </Link>
        <span className="text-slate-200">|</span>
        <a href="/customer" className="hover:text-primary transition-colors duration-200 cursor-pointer">
          {language === 'FR' ? 'Mon Compte' : 'حسابي'}
        </a>
        <span className="text-slate-200">|</span>
        <Link href="/suivi-commande" className="hover:text-primary transition-colors duration-200 cursor-pointer">
          {language === 'FR' ? 'Suivi de commande' : 'تتبع الطلب'}
        </Link>
        <span className="text-slate-200">|</span>
        <a
          href="#footer"
          onClick={(e) => {
            e.preventDefault();
            const footerEl = document.getElementById('footer');
            if (footerEl) {
              footerEl.scrollIntoView({ behavior: 'smooth' });
            } else {
              window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            }
          }}
          className="hover:text-primary transition-colors duration-200 cursor-pointer"
        >
          {language === 'FR' ? 'Contactez-nous' : 'اتصل بنا'}
        </a>
      </div>

      {/* Right: Language & Currency */}
      <div className="flex items-center gap-5 text-[11.5px] text-slate-500">
        {/* Language Selector */}
        <div ref={langRef} className="relative">
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={showLangDropdown}
            aria-controls="public-language-menu"
            onClick={() => showLangDropdown ? onCloseLang() : onOpenLang()}
            className="flex items-center gap-2 hover:text-slate-700 transition-colors duration-200 font-medium cursor-pointer text-slate-600"
          >
            <span className="text-[18px] leading-none">{currentLang.flag}</span>
            <span className="text-[12px] font-semibold">{currentLang.label}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${showLangDropdown ? 'rotate-180' : ''}`} />
          </button>

          <div
            id="public-language-menu"
            role="menu"
            aria-hidden={!showLangDropdown}
            inert={!showLangDropdown ? true : undefined}
            className={`t-dropdown absolute ${isRTL ? 'left-0' : 'right-0'} top-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] py-2 z-50 w-40${
              showLangDropdown && !langClosing ? ' is-open' : langClosing ? ' is-closing' : ''
            }`}
            data-origin="top-right"
          >
            {languages.map(lang => (
              <button
                key={lang.id}
                type="button"
                role="menuitemradio"
                aria-checked={language === lang.id}
                tabIndex={showLangDropdown ? 0 : -1}
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
            type="button"
            aria-haspopup="menu"
            aria-expanded={showCurrencyDropdown}
            aria-controls="public-currency-menu"
            onClick={() => showCurrencyDropdown ? onCloseCurrency() : onOpenCurrency()}
            className="flex items-center gap-1.5 hover:text-primary transition-colors duration-200 font-semibold cursor-pointer"
          >
            <span className="text-[13px]">{currentCurrency.flag}</span>
            <span>{currentCurrency.label}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-300 transition-transform duration-200 ${showCurrencyDropdown ? 'rotate-180' : ''}`} />
          </button>
          <div
            id="public-currency-menu"
            role="menu"
            aria-hidden={!showCurrencyDropdown}
            inert={!showCurrencyDropdown ? true : undefined}
            className={`t-dropdown absolute ${isRTL ? 'left-0' : 'right-0'} top-full mt-2 bg-white border border-slate-100 rounded-xl shadow-2xl py-1.5 z-50 w-36${
              showCurrencyDropdown && !currencyClosing ? ' is-open' : currencyClosing ? ' is-closing' : ''
            }`}
            data-origin="top-right"
          >
            {CURRENCIES.map(c => (
              <button
                key={c.id}
                type="button"
                role="menuitemradio"
                aria-checked={selectedCurrency === c.id}
                tabIndex={showCurrencyDropdown ? 0 : -1}
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
