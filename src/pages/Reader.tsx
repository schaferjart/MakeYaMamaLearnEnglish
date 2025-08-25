import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings } from 'lucide-react';
import { SimpleReader } from '@/components/SimpleReader';
import { ReadingSession } from '@/components/ReadingSession';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { t } from '@/lib/i18n';

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
  const [showSession, setShowSession] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

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
    setShowSession(false);
  };

  const startConversation = () => {
    console.log('Starting conversation about the book');
    // This would navigate to a conversation interface
  };

  // Mock content for now - in real app this would load from EPUB
  const sampleContent = `Chapter 1: The Beginning

  In the heart of a bustling city, where the sounds of traffic and the chatter of pedestrians created a symphony of urban life, there lived a young woman named Emma. She had always been fascinated by languages, spending countless hours in libraries and bookshops, surrounded by words from different cultures and times.

  Emma worked as a translator for a small publishing house, where she discovered her true passion: helping others understand the beauty of literature across language barriers. Every morning, she would walk to work through the old quarter of the city, passing by ancient buildings that told stories of their own.

  The cobblestone streets echoed with the footsteps of commuters, but Emma always took her time, observing the small details that others might miss. A flower blooming in a window box, the way sunlight filtered through the narrow alleyways, or the sound of church bells marking the passage of time.

  On this particular morning, as autumn leaves danced in the crisp air, Emma received an assignment that would change her life forever. It was a manuscript written in an old dialect, filled with mysterious references and beautiful prose that seemed to jump off the page.

  As she began to read, Emma realized that this was not just any ordinary text. The words seemed to possess a magical quality, as if they were speaking directly to her soul. Each sentence revealed new layers of meaning, and she found herself completely absorbed in the story.

  The manuscript told the tale of a scholar who had dedicated his life to preserving ancient knowledge, traveling from library to library, collecting rare books and documenting forgotten languages. Emma felt a deep connection to this character, recognizing her own passion reflected in his journey.

  Hours passed without Emma realizing it. The office around her had grown quiet as her colleagues went about their daily tasks, but she remained focused on the text before her. Every word was carefully chosen, every phrase constructed with precision and beauty.

  As the day drew to a close, Emma knew that this project would be different from anything she had worked on before. It would challenge her skills as a translator and open her mind to new possibilities. She carefully placed the manuscript in her bag, eager to continue her work at home where she could give it her full attention.

  Walking home through the same cobblestone streets, Emma saw the city with new eyes. The ancient buildings seemed to whisper stories of the past, and she wondered how many other treasures were hidden in the world, waiting to be discovered by someone with the patience and passion to seek them out.`;

  if (isLoading) {
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSession(!showSession)}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Reading Content */}
          <div className="lg:col-span-3">
            <SimpleReader 
              bookTitle={book.title}
              content={sampleContent}
              sessionId={sessionId}
            />
          </div>

          {/* Session Panel */}
          {showSession && (
            <div className="lg:col-span-1">
              <div className="sticky top-20">
                <ReadingSession
                  bookTitle={book.title}
                  onSessionEnd={handleSessionEnd}
                  onStartConversation={startConversation}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};