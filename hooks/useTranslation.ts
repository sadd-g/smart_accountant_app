import { useState, useEffect } from 'react';
import { getLanguage, setLanguage, onLanguageChange } from './useLocalStore';
import { translations } from '../constants/i18n';

export function useTranslation() {
  const [lang, setLang] = useState(getLanguage());

  useEffect(() => {
    const unsubscribe = onLanguageChange((newLang: 'ar' | 'en') => {
      setLang(newLang);
    });
    return unsubscribe;
  }, []);

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[lang];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  const changeLanguage = (newLang: 'ar' | 'en') => {
    setLanguage(newLang);
  };

  return { t, lang, changeLanguage, isRTL: lang === 'ar' };
}
