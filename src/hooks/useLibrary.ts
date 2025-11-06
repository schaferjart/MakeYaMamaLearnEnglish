import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getBooksByLanguage, syncBooksFromStorage } from '@/lib/api';
import { SUPPORTED_LANGUAGES, type LanguageCode } from '@/lib/languages';
import type { LibraryBook } from '@/types/book';

interface LibraryError {
  type: 'load' | 'sync';
  error: unknown;
}

interface UseLibraryOptions {
  userId?: string;
}

interface UseLibraryResult {
  books: LibraryBook[];
  loading: boolean;
  syncing: boolean;
  selectedLanguage: LanguageCode | 'all';
  setSelectedLanguage: (language: LanguageCode | 'all') => void;
  refresh: () => Promise<void>;
  syncBooks: () => Promise<unknown>;
  error: LibraryError | null;
  clearError: () => void;
  languages: Array<{ code: LanguageCode; label: string }>;
}

export const useLibrary = ({ userId }: UseLibraryOptions = {}): UseLibraryResult => {
  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode | 'all'>('all');
  const [error, setError] = useState<LibraryError | null>(null);

  const languages = useMemo(
    () =>
      Object.entries(SUPPORTED_LANGUAGES).map(([code, value]) => ({
        code: code as LanguageCode,
        label: `${value.name} Books`,
      })),
    []
  );

  const loadBooks = useCallback(async () => {
    setLoading(true);

    try {
      const booksData =
        selectedLanguage === 'all'
          ? await getBooksByLanguage()
          : await getBooksByLanguage(selectedLanguage);

      const booksWithProgress = await Promise.all(
        (booksData || []).map(async (book): Promise<LibraryBook> => {
          if (!userId) {
            return {
              ...book,
              coverUrl: book.cover_url ?? null,
              progress: 0,
              wordsLearned: 0,
            };
          }

          const { data: progressData } = await supabase
            .from('book_progress')
            .select('percent')
            .eq('book_id', book.id)
            .eq('user_id', userId)
            .maybeSingle();

          const { count: wordsCount } = await supabase
            .from('vocabulary')
            .select('*', { count: 'exact', head: true })
            .eq('book_id', book.id)
            .eq('user_id', userId);

          return {
            ...book,
            coverUrl: book.cover_url ?? null,
            progress: progressData?.percent ? Math.round(progressData.percent) : 0,
            wordsLearned: wordsCount || 0,
          };
        })
      );

      setBooks(booksWithProgress);
      setError(null);
    } catch (err) {
      console.error('Error loading books:', err);
      setError({ type: 'load', error: err });
    } finally {
      setLoading(false);
    }
  }, [selectedLanguage, userId]);

  const refresh = useCallback(async () => {
    await loadBooks();
  }, [loadBooks]);

  const syncBooks = useCallback(async () => {
    setSyncing(true);

    try {
      const result = await syncBooksFromStorage();
      setError(null);
      await loadBooks();
      return result;
    } catch (err) {
      console.error('Error syncing books:', err);
      setError({ type: 'sync', error: err });
      throw err;
    } finally {
      setSyncing(false);
    }
  }, [loadBooks]);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  const clearError = useCallback(() => setError(null), []);

  return {
    books,
    loading,
    syncing,
    selectedLanguage,
    setSelectedLanguage,
    refresh,
    syncBooks,
    error,
    clearError,
    languages,
  };
};
