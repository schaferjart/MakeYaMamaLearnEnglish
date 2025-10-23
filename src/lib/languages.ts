export const SUPPORTED_LANGUAGES = {
  en: { code: 'en', name: 'English', deeplCode: 'EN' },
  it: { code: 'it', name: 'Italiano', deeplCode: 'IT' },
  fr: { code: 'fr', name: 'Français', deeplCode: 'FR' },
  de: { code: 'de', name: 'Deutsch', deeplCode: 'DE' },
  es: { code: 'es', name: 'Español', deeplCode: 'ES' },
  hi: { code: 'hi', name: 'हिंदी', deeplCode: 'HI' },
  pt: { code: 'pt', name: 'Português', deeplCode: 'PT' },
  ru: { code: 'ru', name: 'Русский', deeplCode: 'RU' },
  ja: { code: 'ja', name: '日本語', deeplCode: 'JA' },
  ko: { code: 'ko', name: '한국어', deeplCode: 'KO' },
  zh: { code: 'zh', name: '中文', deeplCode: 'ZH' },
  ar: { code: 'ar', name: 'العربية', deeplCode: 'AR' },
} as const;

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES;

export interface LanguagePair {
  id: string;
  source_language: LanguageCode;
  target_language: LanguageCode;
  is_active: boolean;
  proficiency_level: string;
  created_at: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  language_code: LanguageCode;
  title_original?: string;
  author_original?: string;
  year?: number;
  epub_path?: string;
  cover_url?: string;
  progress?: number;
  wordsLearned?: number;
  content?: string;
}

export interface LanguageInfo {
  code: LanguageCode;
  name: string;
  flag?: string; // Make flag optional
  deeplCode: string;
}

// Helper functions
export const getLanguageInfo = (code: LanguageCode): LanguageInfo => {
  return SUPPORTED_LANGUAGES[code];
};

export const getLanguageName = (code: LanguageCode): string => {
  return SUPPORTED_LANGUAGES[code].name;
};

export const getDeeplCode = (code: LanguageCode): string => {
  return SUPPORTED_LANGUAGES[code].deeplCode;
};

export const isValidLanguageCode = (code: string): code is LanguageCode => {
  return code in SUPPORTED_LANGUAGES;
};

// Common language pairs for suggestions
export const COMMON_LANGUAGE_PAIRS = [
  { source: 'en', target: 'de', description: 'English → German' },
  { source: 'en', target: 'fr', description: 'English → French' },
  { source: 'en', target: 'es', description: 'English → Spanish' },
  { source: 'en', target: 'it', description: 'English → Italian' },
  { source: 'de', target: 'en', description: 'German → English' },
  { source: 'fr', target: 'en', description: 'French → English' },
  { source: 'es', target: 'en', description: 'Spanish → English' },
  { source: 'it', target: 'en', description: 'Italian → English' },
] as const;
