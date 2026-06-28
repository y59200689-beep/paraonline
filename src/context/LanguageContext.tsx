/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import fr from '@/locales/fr.json';
import ar from '@/locales/ar.json';

type Language = 'FR' | 'AR';
type Direction = 'ltr' | 'rtl';

interface LanguageContextProps {
  language: Language;
  direction: Direction;
  t: (key: string) => string;
  toggleLanguage: () => void;
}

const TRANSLATIONS_DB: Record<Language, Record<string, string>> = {
  FR: fr,
  AR: ar
};

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('FR');
  const [direction, setDirection] = useState<Direction>('ltr');

  useEffect(() => {
    const savedLang = localStorage.getItem('selectedLanguageBM') as Language;
    if (savedLang === 'AR' || savedLang === 'FR') {
      setLanguage(savedLang);
      setDirection(savedLang === 'AR' ? 'rtl' : 'ltr');
      document.documentElement.dir = savedLang === 'AR' ? 'rtl' : 'ltr';
      document.documentElement.lang = savedLang === 'AR' ? 'ar' : 'fr';
    }
  }, []);

  const toggleLanguage = () => {
    const nextLang: Language = language === 'FR' ? 'AR' : 'FR';
    setLanguage(nextLang);
    setDirection(nextLang === 'AR' ? 'rtl' : 'ltr');
    localStorage.setItem('selectedLanguageBM', nextLang);
    document.documentElement.dir = nextLang === 'AR' ? 'rtl' : 'ltr';
    document.documentElement.lang = nextLang === 'AR' ? 'ar' : 'fr';
  };

  const t = (key: string): string => {
    return TRANSLATIONS_DB[language][key] || TRANSLATIONS_DB['FR'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, direction, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
