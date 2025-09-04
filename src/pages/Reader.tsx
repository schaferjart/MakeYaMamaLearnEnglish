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
  const [initialSentenceIndex, setInitialSentenceIndex] = useState<number>(0);
  
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

  // Resume from saved reading position
  useEffect(() => {
    if (chapters.length > 0 && readingProgress && !showConversation) {
      const { chapterId, lastSentenceIndex } = readingProgress;
      
      if (chapterId && lastSentenceIndex > 0) {
        // Navigate to saved chapter if different from current
        const savedChapter = chapters.find(c => c.id === chapterId);
        if (savedChapter && (!currentChapter || currentChapter.id !== chapterId)) {
          loadChapter(chapterId);
        }
        // Set initial sentence for ReadAlongInterface
        setInitialSentenceIndex(lastSentenceIndex);
      }
    }
  }, [chapters, readingProgress, currentChapter, loadChapter, showConversation]);

  const handleSessionEnd = async () => {
    if (sessionId) {
      await supabase
        .from('sessions')
        .update({ 
          ended_at: new Date().toISOString(),
          read_ms: 900000 // 15 minutes default
        })
        .eq('id', sessionId);
    }
    setShowConversation(true);
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
          <h1 className="text-2xl font-bold mb-4">Book not found</h1>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Library
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
              Back
            </Button>
            <div className="text-sm text-muted-foreground">
              {book.title} by {book.author}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Session controls removed - handled internally by ReadAlongInterface */}
          </div>
        </div>
      </header>

      <div className="container mx-auto py-6">
        {showConversation ? (
          <div className="max-w-3xl mx-auto">
            <ConversationTutor 
              sessionId={sessionId}
              bookId={bookId!}
              readContent={content}
              onEnd={() => setShowConversation(false)}
            />
          </div>
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
            initialSentenceIndex={initialSentenceIndex}
          />
        )}
      </div>
    </div>
  );
};