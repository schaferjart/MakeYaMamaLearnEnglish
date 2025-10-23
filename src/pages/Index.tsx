import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookCard } from "@/components/BookCard";
import { ReadingSession } from "@/components/ReadingSession";
import { ReadAlongInterface } from "@/components/ReadAlongInterface";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { VocabularyProgress } from "@/components/dashboard/VocabularyProgress";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { ConversationsList } from "@/components/conversations/ConversationsList";
import { useConversations } from "@/hooks/useConversations";
import { BookOpen, Globe, Settings, Library, User, LogOut, RefreshCw, BarChart3, GraduationCap, HelpCircle, MessageCircle, Filter } from "lucide-react";
import { t } from "@/lib/i18n";
import { useLocale } from "@/lib/locale";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { syncBooksFromStorage, getBooksByLanguage } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { SUPPORTED_LANGUAGES, type LanguageCode } from "@/lib/languages";

interface Book {
  id: string;
  title: string;
  author: string;
  year?: number;
  epub_path?: string;
  cover_url?: string;
  progress?: number;
  wordsLearned?: number;
  content?: string;
  language_code?: string;
  title_original?: string;
  author_original?: string;
}

const Index = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<'dashboard' | 'library' | 'vocabulary' | 'conversations' | 'reading' | 'session'>('dashboard');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const { locale } = useLocale();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode | 'all'>('all');
  const { conversations, isLoading: conversationsLoading, refreshConversations } = useConversations();

  useEffect(() => {
    loadBooks();
  }, [selectedLanguage]);

  const loadBooks = async () => {
    try {
      setLoading(true);
      
      // Use the new API function for language filtering
      const booksData = selectedLanguage === 'all' 
        ? await getBooksByLanguage()
        : await getBooksByLanguage(selectedLanguage);

      // Get progress for each book for current user
      const booksWithProgress = await Promise.all(
        (booksData || []).map(async (book) => {
          const { data: progressData } = await supabase
            .from('book_progress')
            .select('percent')
            .eq('book_id', book.id)
            .eq('user_id', user?.id)
            .maybeSingle();

          // Get vocabulary count for words learned
          const { count: wordsCount } = await supabase
            .from('vocabulary')
            .select('*', { count: 'exact', head: true })
            .eq('book_id', book.id)
            .eq('user_id', user?.id);

          return {
            ...book,
            coverUrl: book.cover_url, // Map cover_url to coverUrl for component compatibility
            progress: progressData?.percent ? Math.round(progressData.percent) : 0,
            wordsLearned: wordsCount || 0,
            content: ""
          };
        })
      );

      setBooks(booksWithProgress);
    } catch (error) {
      console.error('Error loading books:', error);
      toast({
        title: "Error loading books",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSyncBooks = async () => {
    try {
      console.log('Starting book sync...');
      setSyncing(true);
      const result = await syncBooksFromStorage();
      console.log('Sync result:', result);
      
      toast({
        title: "Books synced successfully",
        description: `Processed ${result.results?.length || 0} files`,
      });
      
      // Reload books after sync
      await loadBooks();
    } catch (error) {
      console.error('Error syncing books:', error);
      toast({
        title: "Error syncing books",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };


  const handleStartReading = (bookId: string) => {
    navigate(`/reader/${bookId}`);
  };


  const handleSessionEnd = () => {
    setCurrentView('library');
    setSelectedBook(null);
  };

  // Locale switching handled by LocaleSwitcher component

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary">{t('app.title')}</h1>
                <p className="text-sm text-muted-foreground">{t('app.subtitle')}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mr-4">
                <User className="w-4 h-4" />
                {user?.email}
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{t('nav.language')}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/settings')}>
                <Settings className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate('/help')}>
                <HelpCircle className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="w-4 h-4 mr-2" />
                {t('auth.signOut')}
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex gap-4 mt-4">
            <Button 
              variant={currentView === 'dashboard' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView('dashboard')}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              {t('nav.dashboard')}
            </Button>
            <Button 
              variant={currentView === 'library' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView('library')}
            >
              <Library className="w-4 h-4 mr-2" />
              {t('library')}
            </Button>
            <Button 
              variant="ghost"
              size="sm"
              onClick={() => navigate('/vocabulary')}
            >
              <GraduationCap className="w-4 h-4 mr-2" />
              {t('nav.vocabulary')}
            </Button>
            <Button 
              variant={currentView === 'conversations' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView('conversations')}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              {t('nav.conversations')}
            </Button>
            {selectedBook && (
              <>
                <Button 
                  variant={currentView === 'session' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentView('session')}
                >
                  {t('nav.session')}
                </Button>
                <Button 
                  variant={currentView === 'reading' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentView('reading')}
                >
                  {t('reading')}
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {currentView === 'dashboard' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">{t('nav.dashboard')}</h2>
              <p className="text-muted-foreground">
                {t('dashboard.description')}
              </p>
            </div>
            
        <DashboardStats />
        
        <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <VocabularyProgress />
              </div>
              <div className="space-y-6">
                <QuickActions
                  onViewLibrary={() => setCurrentView('library')}
                  onSyncBooks={handleSyncBooks}
                  syncing={syncing}
                />
                <RecentActivity onContinueReading={handleStartReading} />
              </div>
            </div>
          </div>
        )}

        {currentView === 'library' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">{t('library.title')}</h2>
                <p className="text-muted-foreground mt-1">
                  {books.length > 0 
                    ? t('library.availableCount', { count: books.length })
                    : t('library.empty.description')
                  }
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleSyncBooks} 
                  disabled={syncing}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                  {syncing ? t('library.syncing') : t('library.sync')}
                </Button>
              </div>
            </div>
            
            {/* Language Filter */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filter by language:</span>
              </div>
              <Select value={selectedLanguage} onValueChange={(value) => setSelectedLanguage(value as LanguageCode | 'all')}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Languages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
              {Object.entries(SUPPORTED_LANGUAGES).map(([code, lang]) => (
                <SelectItem key={code} value={code}>
                  {lang.name} Books
                </SelectItem>
              ))}
                </SelectContent>
              </Select>
              {selectedLanguage !== 'all' && (
                <Badge variant="secondary" className="ml-2">
                  {SUPPORTED_LANGUAGES[selectedLanguage as LanguageCode].name}
                </Badge>
              )}
            </div>
            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="aspect-[3/4] bg-muted rounded-md mb-4"></div>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : books.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {books.map((book) => (
                  <BookCard
                    key={book.id}
                    {...book}
                    onStartReading={handleStartReading}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t('library.empty.title')}</h3>
                <p className="text-muted-foreground mb-4">
                  {t('library.empty.ctaDescription')}
                </p>
                <Button onClick={handleSyncBooks} disabled={syncing}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                  {syncing ? t('library.syncing') : t('library.sync')}
                </Button>
              </Card>
            )}

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary mb-2">
                      {t('integrations.status.title')}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {t('integrations.status.description')}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">{t('integration.badge.wordnik')}</Badge>
                      <Badge variant="outline" className="text-xs">{t('integration.badge.deepl')}</Badge>
                      <Badge variant="outline" className="text-xs">{t('integration.badge.tts')}</Badge>
                      <Badge variant="outline" className="text-xs">{t('integration.badge.progress')}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentView === 'conversations' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">{t('conversations.title')}</h2>
              <p className="text-muted-foreground">
                {t('conversations.description')}
              </p>
            </div>
            
            {conversationsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : conversations.length === 0 ? (
              <Card className="p-12 text-center">
                <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t('conversations.empty.title')}</h3>
                <p className="text-muted-foreground mb-4">
                  {t('conversations.empty.description')}
                </p>
                <Button onClick={() => setCurrentView('library')}>
                  {t('common.toLibrary')}
                </Button>
              </Card>
            ) : (
              <ConversationsList 
                conversations={conversations}
                onRefresh={refreshConversations}
              />
            )}
          </div>
        )}

        {currentView === 'session' && selectedBook && (
          <div className="max-w-2xl mx-auto">
            <ReadingSession
              bookTitle={selectedBook.title}
              onSessionEnd={handleSessionEnd}
              onStartConversation={() => setCurrentView('reading')}
            />
          </div>
        )}

        {currentView === 'reading' && selectedBook && (
          <div className="space-y-6">
            <ReadAlongInterface
              content={selectedBook.content || ''}
              bookTitle={selectedBook.title}
              bookId={selectedBook.id}
              sessionId={null}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
