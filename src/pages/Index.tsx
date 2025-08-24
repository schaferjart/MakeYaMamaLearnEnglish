import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookCard } from "@/components/BookCard";
import { ReadingSession } from "@/components/ReadingSession";
import { SimpleReader } from "@/components/SimpleReader";
import { BookOpen, Globe, Settings, Library, User, LogOut } from "lucide-react";
import { t, setLocale, getLocale } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<'library' | 'reading' | 'session'>('library');
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [locale, setCurrentLocale] = useState(getLocale());

  // Sample books data - in real app this would come from Supabase
  const sampleBooks = [
    {
      id: "1",
      title: "Pride and Prejudice",
      author: "Jane Austen",
      year: 1813,
      progress: 23,
      wordsLearned: 45,
      content: `It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.

However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered the rightful property of some one or other of their daughters.

"My dear Mr. Bennet," said his lady to him one day, "have you heard that Netherfield Park is let at last?"

Mr. Bennet replied that he had not.

"But it is," returned she; "for Mrs. Long has just been here, and she told me all about it."

Mr. Bennet made no answer.

"Do you not want to know who has taken it?" cried his wife impatiently.

"You want to tell me, and I have no objection to hearing it."

This was invitation enough.`
    },
    {
      id: "2", 
      title: "The Adventures of Sherlock Holmes",
      author: "Arthur Conan Doyle",
      year: 1892,
      progress: 67,
      wordsLearned: 123,
      content: `To Sherlock Holmes she is always the woman. I have seldom heard him mention her under any other name. In his eyes she eclipses and predominates the whole of her sex.

It was not that he felt any emotion akin to love for Irene Adler. All emotions, and that one particularly, were abhorrent to his cold, precise but admirably balanced mind.

He was, I take it, the most perfect reasoning and observing machine that the world has seen, but as a lover he would have placed himself in a false position.

He never spoke of the softer passions, save with a gibe and a sneer. They were admirable things for the observer—excellent for drawing the veil from men's motives and actions.

But for the trained reasoner to admit such intrusions into his own delicate and finely adjusted temperament was to introduce a distracting factor which might throw a doubt upon all his mental results.`
    },
    {
      id: "3",
      title: "Alice's Adventures in Wonderland", 
      author: "Lewis Carroll",
      year: 1865,
      progress: 0,
      wordsLearned: 0,
      content: `Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it.

"And what is the use of a book," thought Alice "without pictures or conversation?"

So she was considering in her own mind (as well as she could, for the hot day made her feel very sleepy and stupid), whether the pleasure of making a daisy-chain would be worth the trouble of getting up and picking the daisies, when suddenly a White Rabbit with pink eyes ran close by her.

There was nothing so very remarkable in that; nor did Alice think it so very much out of the way to hear the Rabbit say to itself, "Oh dear! Oh dear! I shall be late!"

But when the Rabbit actually took a watch out of its waistcoat-pocket, and looked at it, and then hurried on, Alice started to her feet, for it flashed across her mind that she had never before seen a rabbit with either a waistcoat-pocket, or a watch to take out of it.`
    }
  ];

  const handleStartReading = (bookId: string) => {
    const book = sampleBooks.find(b => b.id === bookId);
    if (book) {
      setSelectedBook(book);
      setCurrentView('session');
    }
  };

  const handleStartReading2 = () => {
    setCurrentView('reading');
  };

  const handleSessionEnd = () => {
    setCurrentView('library');
    setSelectedBook(null);
  };

  const toggleLocale = () => {
    const newLocale = locale === 'de' ? 'en' : 'de';
    setLocale(newLocale);
    setCurrentLocale(newLocale);
  };

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
              <Button variant="ghost" size="sm" onClick={toggleLocale}>
                <Globe className="w-4 h-4 mr-2" />
                {locale.toUpperCase()}
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
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
              variant={currentView === 'library' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView('library')}
            >
              <Library className="w-4 h-4 mr-2" />
              {t('library')}
            </Button>
            {selectedBook && (
              <>
                <Button 
                  variant={currentView === 'session' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentView('session')}
                >
                  Session
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
        {currentView === 'library' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">{t('library.title')}</h2>
                <p className="text-muted-foreground mt-1">
                  Wählen Sie ein Buch zum Lesen mit KI-Unterstützung
                </p>
              </div>
              <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                DEMO - Supabase Integration erforderlich für vollständige Funktionalität
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sampleBooks.map((book) => (
                <BookCard
                  key={book.id}
                  {...book}
                  onStartReading={handleStartReading}
                />
              ))}
            </div>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary mb-2">
                      Vollständige App-Funktionen freischalten
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Um alle Features zu nutzen (KI-Tutor, Vokabel-API, TTS, Fortschritt speichern), 
                      verbinden Sie Ihr Lovable-Projekt mit Supabase über die grüne Schaltfläche oben rechts.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">KI-gestütztes Gespräch</Badge>
                      <Badge variant="outline" className="text-xs">Vokabel-API</Badge>
                      <Badge variant="outline" className="text-xs">Text-zu-Sprache</Badge>
                      <Badge variant="outline" className="text-xs">Fortschritt speichern</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentView === 'session' && selectedBook && (
          <div className="max-w-2xl mx-auto">
            <ReadingSession
              bookTitle={selectedBook.title}
              onSessionEnd={handleSessionEnd}
              onStartConversation={handleStartReading2}
            />
          </div>
        )}

        {currentView === 'reading' && selectedBook && (
          <div className="space-y-6">
            <SimpleReader
              bookTitle={selectedBook.title}
              content={selectedBook.content}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
