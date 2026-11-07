'use client';

import React, { createContext, useContext, useState, useSyncExternalStore, ReactNode } from 'react';
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

let storedLang: SupportedLanguage = 'en';
const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  const handleStorage = (e: StorageEvent) => {
    if (e.key === 'melo_lang') {
      storedLang = (e.newValue as SupportedLanguage) || 'en';
      callback();
    }
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorage);
  }
  return () => {
    listeners.delete(callback);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorage);
    }
  };
}

function getSnapshot(): SupportedLanguage {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('melo_lang') as SupportedLanguage;
    if (saved === 'en' || saved === 'bn') {
      storedLang = saved;
    }
  }
  return storedLang;
}

function getServerSnapshot(): SupportedLanguage {
  return 'en';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const syncedLang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [overrideLang, setOverrideLang] = useState<SupportedLanguage | null>(null);

  const language = overrideLang ?? syncedLang;

  const setLanguage = (lang: SupportedLanguage) => {
    setOverrideLang(lang);
    storedLang = lang;
    if (typeof window !== 'undefined') {
      localStorage.setItem('melo_lang', lang);
    }
    listeners.forEach((l) => l());
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
