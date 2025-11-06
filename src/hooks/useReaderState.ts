import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLocalStorageResume } from '@/hooks/useLocalStorageResume';
import { useEpub } from '@/hooks/useEpub';
import type { LanguageCode } from '@/lib/languages';

interface Book {
  id: string;
  title: string;
  author: string;
  epub_path: string | null;
  language_code?: string | null;
}

interface UseReaderStateArgs {
  bookId?: string;
  userId?: string;
}

export const useReaderState = ({ bookId, userId }: UseReaderStateArgs) => {
  const [book, setBook] = useState<Book | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showConversation, setShowConversation] = useState(false);
  const [hasResumed, setHasResumed] = useState(false);
  const [isReturningFromConversation, setIsReturningFromConversation] = useState(false);
  const [, setReadingProgress] = useState<any>(null);

  const { resumeData, refreshResumeData } = useLocalStorageResume(bookId || '', userId || '');

  const {
    chapters,
    currentChapter,
    isLoading: epubLoading,
    error: epubError,
    loadChapter,
  } = useEpub(book?.epub_path);

  useEffect(() => {
    if (!bookId || !userId) {
      setIsLoading(false);
      return;
    }

    const loadBook = async () => {
      try {
        const { data: bookData, error: bookError } = await supabase
          .from('books')
          .select('*')
          .eq('id', bookId)
          .single();

        if (bookError) throw bookError;
        setBook(bookData);

        const { data: sessionData, error: sessionError } = await supabase
          .from('sessions')
          .insert({
            user_id: userId,
            book_id: bookId,
            started_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (!sessionError) {
          setSessionId(sessionData.id);
        }
      } catch (error) {
        console.error('Error loading book:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBook();
  }, [bookId, userId]);

  useEffect(() => {
    if (!userId || !bookId) return;

    const loadSavedProgress = async () => {
      try {
        const { data, error } = await supabase
          .from('reading_progress')
          .select('*')
          .eq('user_id', userId)
          .eq('book_id', bookId)
          .order('last_read_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data && !error) {
          const savedProgress = {
            id: data.id,
            progressPercentage: parseFloat(data.progress_percentage.toString()),
            currentPosition: data.current_position,
            totalLength: data.total_length,
            wordsRead: data.words_read || 0,
            readingSpeedWpm: data.reading_speed_wpm || 0,
            timeSpentSeconds: data.time_spent_seconds || 0,
            lastReadAt: data.last_read_at,
            chapterId: (data as any).chapter_id || null,
            lastSentenceIndex: (data as any).last_sentence_index || 0,
          };
          setReadingProgress(savedProgress);
        } else {
          const localStorageKey = `reading_progress_${userId}_${bookId}`;
          const localProgress = localStorage.getItem(localStorageKey);
          if (localProgress) {
            const parsed = JSON.parse(localProgress);
            setReadingProgress(parsed);
          }
        }
      } catch (error) {
        console.error('Error loading saved progress:', error);
        const localStorageKey = `reading_progress_${userId}_${bookId}`;
        const localProgress = localStorage.getItem(localStorageKey);
        if (localProgress) {
          const parsed = JSON.parse(localProgress);
          setReadingProgress(parsed);
        }
      }
    };

    loadSavedProgress();
  }, [userId, bookId]);

  useEffect(() => {
    if (hasResumed || !chapters.length || showConversation) return;

    if (!resumeData?.chapterId || !resumeData?.sentenceIndex || resumeData.sentenceIndex <= 0) {
      setHasResumed(true);
      return;
    }

    const { chapterId, sentenceIndex } = resumeData;
    const savedChapter = chapters.find((chapter) => chapter.id === chapterId);
    if (savedChapter && (!currentChapter || currentChapter.id !== chapterId)) {
      loadChapter(chapterId);
    }

    if (sentenceIndex > 0) {
      setHasResumed(true);
    }
  }, [chapters, currentChapter, resumeData, hasResumed, showConversation, loadChapter]);

  const handleSessionEnd = useCallback(async () => {
    try {
      if (sessionId && userId) {
        await supabase
          .from('sessions')
          .update({ ended_at: new Date().toISOString() })
          .eq('id', sessionId);
      }
    } catch (error) {
      console.error('Error updating session:', error);
    }

    setIsReturningFromConversation(true);
    setShowConversation(true);
  }, [sessionId, userId]);

  const handleConversationEnd = useCallback(() => {
    refreshResumeData();

    setTimeout(() => {
      setHasResumed(false);
      setShowConversation(false);

      setTimeout(() => {
        setIsReturningFromConversation(false);
      }, 100);
    }, 1000);
  }, [refreshResumeData]);

  const getBookContent = useCallback(() => {
    if (epubError) {
      return `Error loading EPUB: ${epubError}`;
    }

    if (book?.epub_path && chapters.length > 0 && currentChapter) {
      return currentChapter.content;
    }

    return `No EPUB content available for "${book?.title || 'Unknown Book'}". Please upload an EPUB file to enable reading functionality.`;
  }, [book?.epub_path, book?.title, chapters, currentChapter, epubError]);

  const handlePreviousChapter = useCallback(() => {
    if (chapters.length === 0 || !currentChapter) return;
    const currentIndex = chapters.findIndex((chapter) => chapter.id === currentChapter.id);
    if (currentIndex > 0) {
      loadChapter(chapters[currentIndex - 1].id);
    }
  }, [chapters, currentChapter, loadChapter]);

  const handleNextChapter = useCallback(() => {
    if (chapters.length === 0 || !currentChapter) return;
    const currentIndex = chapters.findIndex((chapter) => chapter.id === currentChapter.id);
    if (currentIndex < chapters.length - 1) {
      loadChapter(chapters[currentIndex + 1].id);
    }
  }, [chapters, currentChapter, loadChapter]);

  const getCurrentChapterIndex = useCallback(() => {
    if (!currentChapter) return 0;
    return chapters.findIndex((chapter) => chapter.id === currentChapter.id);
  }, [chapters, currentChapter]);

  const canGoPrevious = getCurrentChapterIndex() > 0;
  const canGoNext = getCurrentChapterIndex() < chapters.length - 1;

  const content = useMemo(() => getBookContent(), [getBookContent]);

  const bookLanguage = (book?.language_code as LanguageCode) || 'en';

  return {
    book,
    sessionId,
    isLoading: isLoading || epubLoading,
    showConversation,
    onSessionEnd: handleSessionEnd,
    onConversationEnd: handleConversationEnd,
    resumeData,
    isReturningFromConversation,
    currentChapter,
    totalChapters: chapters.length,
    onPreviousChapter: handlePreviousChapter,
    onNextChapter: handleNextChapter,
    canGoPrevious,
    canGoNext,
    content,
    setReadingProgress,
    bookLanguage,
  };
};
