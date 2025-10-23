import React, { createContext, useContext, useState, useEffect } from 'react';
import { LanguagePair, LanguageCode } from '@/lib/languages';
import { getUserLanguagePairs } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

interface LanguageContextType {
  activePair: LanguagePair | null;
  availablePairs: LanguagePair[];
  setActivePair: (pair: LanguagePair) => void;
  refreshPairs: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [activePair, setActivePair] = useState<LanguagePair | null>(null);
  const [availablePairs, setAvailablePairs] = useState<LanguagePair[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshPairs = async () => {
    if (!user) {
      setAvailablePairs([]);
      setActivePair(null);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      const pairs = await getUserLanguagePairs();
      setAvailablePairs(pairs);
      
      // Set first pair as active if none selected and pairs exist
      if (!activePair && pairs.length > 0) {
        setActivePair(pairs[0]);
      }
      
      // If current active pair is no longer available, reset it
      if (activePair && !pairs.find(p => p.id === activePair.id)) {
        setActivePair(pairs.length > 0 ? pairs[0] : null);
      }
    } catch (err) {
      console.error('Failed to load language pairs:', err);
      setError(err instanceof Error ? err.message : 'Failed to load language pairs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshPairs();
  }, [user]);

  // Load active pair from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('activeLanguagePair');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // Verify the stored pair is still available
          if (availablePairs.find(p => p.id === parsed.id)) {
            setActivePair(parsed);
          }
        } catch (error) {
          console.error('Failed to parse stored language pair:', error);
        }
      }
    }
  }, [availablePairs]);

  // Save active pair to localStorage when it changes
  useEffect(() => {
    if (activePair && typeof window !== 'undefined') {
      localStorage.setItem('activeLanguagePair', JSON.stringify(activePair));
    }
  }, [activePair]);

  const handleSetActivePair = (pair: LanguagePair) => {
    setActivePair(pair);
  };

  return (
    <LanguageContext.Provider value={{
      activePair,
      availablePairs,
      setActivePair: handleSetActivePair,
      refreshPairs,
      isLoading,
      error
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Helper hook for getting current language pair info
export const useCurrentLanguagePair = () => {
  const { activePair, availablePairs, isLoading } = useLanguage();
  
  return {
    sourceLanguage: activePair?.source_language as LanguageCode | undefined,
    targetLanguage: activePair?.target_language as LanguageCode | undefined,
    activePair,
    availablePairs,
    isLoading,
    hasActivePair: !!activePair
  };
};

