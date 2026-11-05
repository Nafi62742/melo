'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { EN, TranslationType } from './en';
import { BN } from './bn';

type SupportedLanguage = 'en' | 'bn';

interface I18nContextType {
  language: SupportedLanguage;
  t: TranslationType;
  setLanguage: (lang: SupportedLanguage) => void;
  toggleLanguage: () => void;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('melo_lang') as SupportedLanguage;
      if (saved === 'en' || saved === 'bn') {
        return saved;
      }
    }
    return 'en';
  });

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('melo_lang', lang);
    }
  };

  const toggleLanguage = () => {
    const next = language === 'en' ? 'bn' : 'en';
    setLanguage(next);
  };

  const translations = language === 'bn' ? BN : EN;

  return (
    <I18nContext.Provider
      value={{
        language,
        t: translations,
        setLanguage,
        toggleLanguage,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
