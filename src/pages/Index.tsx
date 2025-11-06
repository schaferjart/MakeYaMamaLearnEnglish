import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useConversations } from '@/hooks/useConversations';
import { useLibrary } from '@/hooks/useLibrary';
import { IndexPageHeader, type IndexView } from '@/components/index-page/IndexPageHeader';
import { DashboardView } from '@/components/index-page/DashboardView';
import { LibraryView } from '@/components/index-page/LibraryView';
import { ConversationsView } from '@/components/index-page/ConversationsView';
import type { LanguageCode } from '@/lib/languages';
import { t } from '@/lib/i18n';

const Index = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState<IndexView>('dashboard');
  const { conversations, isLoading: conversationsLoading, refreshConversations } = useConversations();

  const {
    books,
    loading,
    syncing,
    selectedLanguage,
    setSelectedLanguage,
    syncBooks,
    error: libraryError,
    clearError,
    languages,
  } = useLibrary({ userId: user?.id });

  useEffect(() => {
    if (!libraryError) return;

    const title = libraryError.type === 'load' ? 'Error loading books' : 'Error syncing books';
    toast({
      title,
      description: 'Please try again later.',
      variant: 'destructive',
    });
    clearError();
  }, [libraryError, toast, clearError]);

  const handleSyncBooks = async () => {
    try {
      const result = await syncBooks();
      const processed = (result as { results?: unknown[] })?.results?.length ?? 0;
      toast({
        title: 'Books synced successfully',
        description: `Processed ${processed} files`,
      });
    } catch (error) {
      toast({
        title: 'Error syncing books',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const handleLanguageChange = (value: LanguageCode | 'all') => {
    setSelectedLanguage(value);
  };

  const handleContinueReading = (bookId: string) => {
    navigate(`/reader/${bookId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <IndexPageHeader
        currentView={currentView}
        onViewChange={setCurrentView}
        onNavigate={(path) => navigate(path)}
        onSignOut={signOut}
        userEmail={user?.email}
        languageLabel={t('nav.language')}
      />

      <main className="container mx-auto px-4 py-8">
        {currentView === 'dashboard' && (
          <DashboardView
            onViewLibrary={() => setCurrentView('library')}
            onSyncBooks={handleSyncBooks}
            syncing={syncing}
            onContinueReading={handleContinueReading}
          />
        )}

        {currentView === 'library' && (
          <LibraryView
            books={books}
            loading={loading}
            syncing={syncing}
            selectedLanguage={selectedLanguage}
            onLanguageChange={handleLanguageChange}
            onSyncBooks={handleSyncBooks}
            languages={languages}
            onStartReading={handleContinueReading}
          />
        )}

        {currentView === 'conversations' && (
          <ConversationsView
            conversations={conversations}
            isLoading={conversationsLoading}
            onRefresh={refreshConversations}
            onOpenLibrary={() => setCurrentView('library')}
          />
        )}
      </main>
    </div>
  );
};

export default Index;
