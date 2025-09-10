import { useState, useEffect } from 'react';
import { t, getLocale, setLocale, Locale } from '@/lib/i18n';

export const useTranslation = () => {
  const [locale, setCurrentLocale] = useState<Locale>(getLocale());

  useEffect(() => {
    const handleLocaleChange = () => {
      setCurrentLocale(getLocale());
    };

    window.addEventListener('localeChanged', handleLocaleChange);

    return () => {
      window.removeEventListener('localeChanged', handleLocaleChange);
    };
  }, []);

  return {
    t,
    locale,
    setLocale,
  };
};
