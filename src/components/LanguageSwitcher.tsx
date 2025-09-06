import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { setLocale, getLocale, getAvailableLocales, type Locale } from "@/lib/i18n";

interface LanguageSwitcherProps {
  onLanguageChange?: (locale: Locale) => void;
}

export const LanguageSwitcher = ({ onLanguageChange }: LanguageSwitcherProps) => {
  const [currentLocale, setCurrentLocale] = useState<Locale>(getLocale());
  const availableLocales = getAvailableLocales();

  const handleLanguageChange = () => {
    const currentIndex = availableLocales.findIndex(lang => lang.code === currentLocale);
    const nextIndex = (currentIndex + 1) % availableLocales.length;
    const nextLocale = availableLocales[nextIndex].code;
    
    setLocale(nextLocale);
    setCurrentLocale(nextLocale);
    onLanguageChange?.(nextLocale);
  };

  const currentLanguage = availableLocales.find(lang => lang.code === currentLocale);

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleLanguageChange}
      className="gap-2"
      title={`Current: ${currentLanguage?.name}. Click to switch language.`}
    >
      <Globe className="w-4 h-4" />
      <span className="hidden sm:inline">
        {currentLanguage?.flag} {currentLanguage?.name}
      </span>
      <span className="sm:hidden">
        {currentLanguage?.flag}
      </span>
    </Button>
  );
};