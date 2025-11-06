import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ReadAlongInterface } from '@/components/ReadAlongInterface';
import { ConversationTutor } from '@/components/ConversationTutor';
import { useAuth } from '@/hooks/useAuth';
import { t } from '@/lib/i18n';
import { ReaderHeader } from '@/components/reader/ReaderHeader';
import { useReaderState } from '@/hooks/useReaderState';

export const Reader = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    book,
    sessionId,
    isLoading,
    showConversation,
    onSessionEnd,
    onConversationEnd,
    resumeData,
    isReturningFromConversation,
    currentChapter,
    totalChapters,
    onPreviousChapter,
    onNextChapter,
    canGoPrevious,
    canGoNext,
    content,
    setReadingProgress,
    bookLanguage,
  } = useReaderState({ bookId, userId: user?.id });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
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
          <Button onClick={() => navigate('/')}>{t('common.toLibrary')}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ReaderHeader title={book.title} author={book.author} onBack={() => navigate('/')} />

      <div className="container mx-auto py-6">
        {showConversation ? (
          <ConversationTutor
            sessionId={sessionId}
            bookId={bookId!}
            readContent={content}
            bookLanguage={bookLanguage}
            onEnd={onConversationEnd}
          />
        ) : (
          <ReadAlongInterface
            content={content}
            bookTitle={book.title}
            bookId={bookId!}
            sessionId={sessionId}
            currentChapter={currentChapter}
            totalChapters={totalChapters}
            onPreviousChapter={onPreviousChapter}
            onNextChapter={onNextChapter}
            canGoPrevious={canGoPrevious}
            canGoNext={canGoNext}
            onProgressUpdate={setReadingProgress}
            onSessionEnd={onSessionEnd}
            resumeData={resumeData}
            isReturningFromConversation={isReturningFromConversation}
            bookLanguage={bookLanguage}
          />
        )}
      </div>
    </div>
  );
};
