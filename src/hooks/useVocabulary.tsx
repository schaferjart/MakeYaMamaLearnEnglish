import { useState, useEffect } from 'react';
import { getUserVocabulary, VocabularyEntry } from '@/lib/api';
import { useAuth } from './useAuth';
import { toast } from './use-toast';

export const useVocabulary = (bookId?: string) => {
  const { user } = useAuth();
  const [vocabulary, setVocabulary] = useState<VocabularyEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadVocabulary = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await getUserVocabulary(bookId);
      setVocabulary(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load vocabulary';
      setError(errorMessage);
      toast({
        title: "Failed to load vocabulary",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVocabulary();
  }, [user, bookId]);

  const refreshVocabulary = () => {
    loadVocabulary();
  };

  return {
    vocabulary,
    isLoading,
    error,
    refreshVocabulary
  };
};