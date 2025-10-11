import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { setLocale as setLocaleInternal, getLocale, Locale } from './i18n';

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: 'de',
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setLocale: () => {}
});

const STORAGE_KEY = 'locale';
const SUPPORTED: Locale[] = ['de', 'en', 'fr', 'hi'];

function detectInitial(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED.includes(stored as Locale)) return stored as Locale;
    const nav = navigator.language || (navigator as any).userLanguage || 'de';
  if (nav.startsWith('fr')) return 'fr';
  if (nav.startsWith('en')) return 'en';
  if (nav.startsWith('hi')) return 'hi';
    return 'de';
  } catch {
    return 'de';
  }
}

export const LocaleProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const current = getLocale();
    if (current) return current;
    return detectInitial();
  });
  const apply = useCallback((l: Locale) => {
    setLocaleInternal(l);
    document.documentElement.lang = l;
    try { localStorage.setItem(STORAGE_KEY, l); } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    apply(locale);
  }, [apply, locale]);

  const setLocale = (l: Locale) => {
    if (!SUPPORTED.includes(l)) return;
    apply(l);
    setLocaleState(l);
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = () => useContext(LocaleContext);
