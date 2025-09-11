// Reader.tsx (Remove initialSentenceIndex state, pass initialResumeData as resumeData prop, adjust resume effect)
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings, Volume2, BookOpen } from 'lucide-react';
import { ReadAlongInterface } from '@/components/ReadAlongInterface';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { t } from '@/lib/i18n';
import { ConversationTutor } from '@/components/ConversationTutor';
import { useEpub } from '@/hooks/useEpub';
import { useLocalStorageResume } from '@/hooks/useLocalStorageResume';

interface Book {
  id: string;
  title: string;
  author: string;
  epub_path: string | null;
}

export const Reader = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [readingProgress, setReadingProgress] = useState<any>(null);
  const [showConversation, setShowConversation] = useState(false);
  const [hasResumed, setHasResumed] = useState(false);
  const [isReturningFromConversation, setIsReturningFromConversation] = useState(false);
  
  // Use localStorage for temporary resume functionality
  const { initialResumeData, resumeData, saveResumeData, refreshResumeData } = useLocalStorageResume(bookId || '', user?.id || '');
  
  // EPUB parsing
  const { 
    chapters, 
    currentChapter, 
    isLoading: epubLoading, 
    error: epubError,
    loadChapter,
    getFullText 
  } = useEpub(book?.epub_path);

  useEffect(() => {
    if (!bookId || !user) return;

    const loadBook = async () => {
      try {
        // Load book details
        const { data: bookData, error: bookError } = await supabase
          .from('books')
          .select('*')
          .eq('id', bookId)
          .single();

        if (bookError) throw bookError;
        setBook(bookData);

        // Create or get current reading session
        const { data: sessionData, error: sessionError } = await supabase
          .from('sessions')
          .insert({
            user_id: user.id,
            book_id: bookId,
            started_at: new Date().toISOString()
          })
          .select()
          .single();

        if (sessionError) {
          console.error('Session creation error:', sessionError);
        } else {
          setSessionId(sessionData.id);
        }
      } catch (error) {
        console.error('Error loading book:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBook();
  }, [bookId, user]);

  // Load saved reading progress from database
  useEffect(() => {
    if (!user || !bookId) return;

    const loadSavedProgress = async () => {
      try {
        const { data, error } = await supabase
          .from('reading_progress')
          .select('*')
          .eq('user_id', user.id)
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
            lastSentenceIndex: (data as any).last_sentence_index || 0
          };
          console.log('Loaded saved progress from DB:', savedProgress);
          setReadingProgress(savedProgress);
        } else {
          // Try localStorage as fallback
          const localStorageKey = `reading_progress_${user.id}_${bookId}`;
          const localProgress = localStorage.getItem(localStorageKey);
          if (localProgress) {
            const parsed = JSON.parse(localProgress);
            console.log('Loaded saved progress from localStorage:', parsed);
            setReadingProgress(parsed);
          }
        }
      } catch (error) {
        console.error('Error loading saved progress:', error);
        // Try localStorage as fallback
        const localStorageKey = `reading_progress_${user.id}_${bookId}`;
        const localProgress = localStorage.getItem(localStorageKey);
        if (localProgress) {
          const parsed = JSON.parse(localProgress);
          console.log('Loaded saved progress from localStorage (after error):', parsed);
          setReadingProgress(parsed);
        }
      }
    };

    loadSavedProgress();
  }, [user, bookId]);

  // Resume to saved position when component mounts
  useEffect(() => {
    if (hasResumed || !chapters.length || showConversation) return;
    
    // Only resume if we have valid resume data
    if (!resumeData?.chapterId || !resumeData?.sentenceIndex || resumeData.sentenceIndex <= 0) {
      setHasResumed(true);
      return;
    }
    
    const { chapterId, sentenceIndex } = resumeData;
    console.log('RESUMING: Navigating to chapter:', chapterId, 'sentence:', sentenceIndex);
    
    // Navigate to saved chapter if different from current
    const savedChapter = chapters.find(c => c.id === chapterId);
    if (savedChapter && (!currentChapter || currentChapter.id !== chapterId)) {
      loadChapter(chapterId);
    }
    
    // No need to set initialSentenceIndex - it will be handled by prop in ReadAlongInterface
    setHasResumed(true);
  }, [chapters.length, currentChapter?.id, loadChapter, showConversation, hasResumed, resumeData]);

  const handleSessionEnd = async () => {
    console.log('Session ending, updating database and transitioning to conversation');
    
    // Update session in database
    try {
      if (sessionId && user?.id) {
        await supabase
          .from('sessions')
          .update({ 
            ended_at: new Date().toISOString(),
          })
          .eq('id', sessionId)
        console.log('Session updated in database');
      }
    } catch (error) {
      console.error('Error updating session:', error);
    }
    
    // Mark that we're starting a conversation (so next resume will advance sentence)
    setIsReturningFromConversation(true);
    
    // Transition to conversation mode
    setShowConversation(true);
  };

  const handleConversationEnd = () => {
    console.log('Conversation ended, returning to reading mode');
    
    // Refresh resume data to get the latest saved position
    refreshResumeData();
    
    // Add graceful pause before returning to reading
    setTimeout(() => {
      console.log('Returning to reading after graceful pause');
      
      // Reset resume state to allow fresh resume
      setHasResumed(false);
      
      // Return to reading mode (this will remount ReadAlongInterface)
      setShowConversation(false);
      
      // Reset the flag after a short delay (after ReadAlongInterface mounts and uses it)
      setTimeout(() => {
        setIsReturningFromConversation(false);
      }, 100);
    }, 1000); // 1 second pause
  };

  const startConversation = () => {
    setShowConversation(true);
  };

  // Get content from EPUB or fallback to sample
  const getBookContent = () => {
    if (epubError) {
      return `Error loading EPUB: ${epubError}`;
    }
    
    if (book?.epub_path && chapters.length > 0 && currentChapter) {
      return currentChapter.content;
    }
    
    // Fallback content for books without EPUB
    return `No EPUB content available for "${book?.title || 'Unknown Book'}". Please upload an EPUB file to enable reading functionality.`;
    };

  const handlePreviousChapter = () => {
    if (chapters.length === 0 || !currentChapter) return;
    
    const currentIndex = chapters.findIndex(c => c.id === currentChapter.id);
    if (currentIndex > 0) {
      loadChapter(chapters[currentIndex - 1].id);
    }
  };

  const handleNextChapter = () => {
    if (chapters.length === 0 || !currentChapter) return;
    
    const currentIndex = chapters.findIndex(c => c.id === currentChapter.id);
    if (currentIndex < chapters.length - 1) {
      loadChapter(chapters[currentIndex + 1].id);
    }
  };

  const getCurrentChapterIndex = () => {
    if (!currentChapter) return 0;
    return chapters.findIndex(c => c.id === currentChapter.id);
  };

  const canGoPrevious = getCurrentChapterIndex() > 0;
  const canGoNext = getCurrentChapterIndex() < chapters.length - 1;

  const content = getBookContent();

  if (isLoading || epubLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('loading')}...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{t('reader.bookNotFound')}</h1>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('library.title')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('back')}
            </Button>
            <div className="text-sm text-muted-foreground">
              {t('vocab.book.titleAndAuthor', { title: book.title, author: book.author })}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Session controls removed - handled internally by ReadAlongInterface */}
          </div>
        </div>
      </header>

      <div className="container mx-auto py-6">
        {showConversation ? (
          <ConversationTutor 
            sessionId={sessionId}
            bookId={bookId!}
            readContent={content}
            onEnd={handleConversationEnd}
          />
        ) : (
          <ReadAlongInterface
            content={content}
            bookTitle={book.title}
            bookId={bookId!}
            sessionId={sessionId}
            currentChapter={currentChapter}
            totalChapters={chapters.length}
            onPreviousChapter={handlePreviousChapter}
            onNextChapter={handleNextChapter}
            canGoPrevious={canGoPrevious}
            canGoNext={canGoNext}
            onProgressUpdate={setReadingProgress}
            onSessionEnd={handleSessionEnd}
            resumeData={resumeData} // Direct passing
            isReturningFromConversation={isReturningFromConversation}
          />
        )}
      </div>
    </div>
  );
};