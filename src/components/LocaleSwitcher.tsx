import React from 'react';
import { useLocale } from '@/lib/locale';
import { t } from '@/lib/i18n';

export const LocaleSwitcher: React.FC<{ className?: string }> = ({ className }) => {
  const { locale, setLocale } = useLocale();
  return (
    <select
      className={"border rounded-md px-2 py-1 text-sm bg-background " + (className || '')}
      value={locale}
      onChange={(e) => setLocale(e.target.value as any)}
      aria-label="Language selector"
    >
      <option value="de">{t('language.german')}</option>
      <option value="en">{t('language.english')}</option>
  <option value="fr">{t('language.french')}</option>
    </select>
  );
};

export default LocaleSwitcher;
