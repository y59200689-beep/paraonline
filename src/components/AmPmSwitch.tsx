'use client';

import React from 'react';
import { useAmPm } from '../context/AmPmContext';
import { useTranslation } from '../context/LanguageContext';
import { Sun, Moon } from 'lucide-react';

export const AmPmSwitch: React.FC = () => {
  const { amPmState, toggleAmPmState } = useAmPm();
  const { language } = useTranslation();

  const isAM = amPmState === 'am';

  return (
    <button
      onClick={toggleAmPmState}
      className={`relative inline-flex items-center h-8 w-24 rounded-full p-1 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-inner cursor-pointer border ${
        isAM
          ? 'bg-gradient-to-r from-amber-100 to-orange-100 border-amber-200/50'
          : 'bg-gradient-to-r from-slate-900 to-indigo-950 border-indigo-900/60'
      }`}
      title={language === 'FR' ? 'Changer de routine (Jour/Nuit)' : 'تغيير الروتين (نهار/ليلة)'}
    >
      {/* Sliding Pill Indicator */}
      <span
        className={`absolute top-0.5 bottom-0.5 w-[30px] rounded-full transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] flex items-center justify-center shadow-md border ${
          isAM
            ? 'left-0.5 bg-white text-amber-500 border-amber-100'
            : 'left-[calc(100%-32px)] bg-slate-800 text-indigo-300 border-slate-700'
        }`}
      >
        {isAM ? (
          <Sun className="w-4 h-4 fill-amber-400 stroke-amber-500 animate-spin-slow" />
        ) : (
          <Moon className="w-3.5 h-3.5 fill-indigo-300 stroke-indigo-400 animate-pulse" />
        )}
      </span>

      {/* Embedded Text Labels */}
      <span
        className={`absolute text-[8px] font-black uppercase tracking-wider w-full text-center flex items-center justify-center transition-all duration-500 pointer-events-none select-none ${
          isAM
            ? 'pl-6 text-amber-800'
            : 'pr-6 text-indigo-200'
        }`}
      >
        {isAM 
          ? (language === 'FR' ? 'Jour' : 'نهار') 
          : (language === 'FR' ? 'Nuit' : 'ليلة')
        }
      </span>
    </button>
  );
};
