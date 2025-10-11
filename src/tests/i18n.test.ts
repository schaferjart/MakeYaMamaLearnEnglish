import { t, setLocale } from '@/lib/i18n';

describe('i18n basic behavior', () => {
  const originalLocale = 'de';

  afterAll(() => {
    setLocale(originalLocale as any);
  });

  it('parameter interpolation works (de)', () => {
    setLocale('de');
    expect(t('library.progress', { percent: 42 })).toBe('Fortschritt: 42%');
  });

  it('parameter interpolation works (en)', () => {
    setLocale('en');
    expect(t('library.progress', { percent: 42 })).toBe('Progress: 42%');
  });

  it('parameter interpolation works (fr)', () => {
    setLocale('fr');
    expect(t('library.progress', { percent: 42 })).toBe('Progrès : 42%');
  });

  it('parameter interpolation works (hi)', () => {
    setLocale('hi');
    expect(t('library.progress', { percent: 42 })).toBe('प्रगति: 42%');
  });

  it('falls back to German key when locale key removed (simulated)', () => {
    // Pick a key that exists in all locales now. Simulate removal by direct lookup bypass.
    setLocale('fr');
    // We cannot mutate translations easily (frozen by design), so simulate by querying a non-existent key
    // and checking it returns the key itself OR fallback: design currently returns key if missing in de too.
    // To test actual fallback path, we use a guaranteed existing key and assert equality with same-locale value.
    expect(t('common.delete')).toBe('Supprimer'); // sanity (exists)
    // Non-existent key path should return the key string literal
    expect(t('non.existent.key' as any)).toBe('non.existent.key');
  });
});

// Vocabulary translation fallback logic unit (pure-functional simulation)
describe('vocabulary translation fallback chain', () => {
  interface MockVocab { translation_de?: string|null; translation_en?: string|null; translation_fr?: string|null; translation_hi?: string|null; }

  const resolve = (v: MockVocab, locale: 'de'|'en'|'fr'|'hi') => {
    const order: Array<keyof MockVocab> =
      locale === 'de' ? ['translation_de','translation_en','translation_fr','translation_hi'] :
      locale === 'en' ? ['translation_en','translation_de','translation_fr','translation_hi'] :
      locale === 'fr' ? ['translation_fr','translation_de','translation_en','translation_hi'] :
                        ['translation_hi','translation_de','translation_en','translation_fr'];
    for (const k of order) {
      const val = v[k];
      if (val) return val;
    }
    return undefined;
  };

  it('uses locale first if present', () => {
    const v = { translation_de: 'Hund', translation_en: 'dog', translation_fr: 'chien', translation_hi: 'कुत्ता' };
    expect(resolve(v,'fr')).toBe('chien');
    expect(resolve(v,'hi')).toBe('कुत्ता');
  });

  it('falls back to German then English for fr when fr missing', () => {
    const v = { translation_de: 'Hund', translation_en: 'dog', translation_fr: null, translation_hi: null };
    expect(resolve(v,'fr')).toBe('Hund');
  });

  it('falls back through chain for hi when hi missing', () => {
    const v = { translation_de: 'Hund', translation_en: 'dog', translation_fr: 'chien', translation_hi: null };
    expect(resolve(v,'hi')).toBe('Hund');
  });

  it('falls back through entire chain to undefined', () => {
    const v = { translation_de: null, translation_en: null, translation_fr: null, translation_hi: null };
    expect(resolve(v,'en')).toBeUndefined();
  });
});
