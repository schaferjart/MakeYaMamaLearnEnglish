import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight, Volume2, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ReadAlongInterface } from "@/components/ReadAlongInterface";
import { VocabularyPanel } from "@/components/VocabularyPanel";
import { ConversationTutor } from "@/components/ConversationTutor";

// Real sample content from Crime and Punishment for demo
const sampleContent = `<p>"Good heavens!" exclaimed Raskolnikov, drawing the door towards him again. "If you have no room, what do you want me for? Are you making fun of me?"</p>
<p>The old woman looked at him suspiciously. "Come in," she said, "I won't keep you long. Take off your hat."</p>
<p>The room was very small, with a low ceiling, and crowded with furniture. There was a sofa, a round table, chairs, and a chest of drawers. Everything was old and worn, but clean and tidy.</p>`;

export default function Landing() {
  const navigate = useNavigate();
  const [demoMode, setDemoMode] = useState<'reading' | 'vocabulary' | 'conversation' | null>(null);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  const handleWordSelect = (word: string) => {
    setSelectedWord(word);
    setDemoMode('vocabulary');
  };

  const closeDemos = () => {
    setDemoMode(null);
    setSelectedWord(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[var(--gradient-primary)] opacity-5"></div>
        <div className="container mx-auto px-4 py-20 text-center relative z-10">
          <div className="flex items-center justify-center gap-2 mb-6">
            <BookOpen className="w-12 h-12 text-primary" />
            <h1 className="text-5xl font-bold text-primary">MamaLearnEnglish</h1>
          </div>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Master English through interactive reading, vocabulary building, and AI-powered conversations with real books.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="text-lg px-8 py-4" onClick={() => navigate('/auth')}>
              Start Learning
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

          {/* Demo Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => setDemoMode('reading')}
              className="flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Try Reading
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setDemoMode('vocabulary')}
              className="flex items-center gap-2"
            >
              <Volume2 className="w-4 h-4" />
              Try Vocabulary
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setDemoMode('conversation')}
              className="flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Try AI Tutor
            </Button>
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      {demoMode && (
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                {demoMode === 'reading' && 'Interactive Reading Experience'}
                {demoMode === 'vocabulary' && 'Smart Vocabulary Assistant'}
                {demoMode === 'conversation' && 'AI Conversation Tutor'}
              </h2>
              <p className="text-muted-foreground mb-4">
                {demoMode === 'reading' && 'Click on sentences to hear them read aloud and select words to save to your vocabulary.'}
                {demoMode === 'vocabulary' && 'Get instant definitions, translations, and examples for any word.'}
                {demoMode === 'conversation' && 'Practice speaking and ask questions about what you\'ve read.'}
              </p>
              <Button variant="outline" onClick={closeDemos}>
                Close Demo
              </Button>
            </div>

            {demoMode === 'reading' && (
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <ReadAlongInterface
                    content={sampleContent}
                    bookTitle="Crime and Punishment (Demo)"
                    bookId="demo-book"
                    sessionId="demo-session"
                    onProgressUpdate={() => {}}
                    onSessionEnd={closeDemos}
                  />
                </CardContent>
              </Card>
            )}

            {demoMode === 'vocabulary' && (
              <div className="flex justify-center">
                <VocabularyPanel
                  selectedText={selectedWord || "drawing"}
                  onClose={closeDemos}
                  bookId="demo-book"
                  onSave={() => {}}
                />
              </div>
            )}

            {demoMode === 'conversation' && (
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <ConversationTutor
                    sessionId="demo-session"
                    bookId="demo-book"
                    readContent={sampleContent.replace(/<[^>]*>/g, '')}
                    onEnd={closeDemos}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      )}

      {/* Features Overview */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground">
            Learn English naturally through interactive reading experiences
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-primary" />
                Read Real Books
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Experience classic literature with sentence-by-sentence audio playback and instant word lookup.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="w-6 h-6 text-accent" />
                Build Vocabulary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Save words as you read with definitions, translations, and examples automatically provided.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-success" />
                Practice Conversations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Discuss what you've read with an AI tutor that adapts to your English level.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 border-y">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join our interactive English learning platform and improve your skills with real books and AI assistance.
          </p>
          <Button size="lg" className="text-lg px-8 py-4" onClick={() => navigate('/auth')}>
            Get Started
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/30 border-t">
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="w-6 h-6 text-primary" />
            <span className="font-bold text-foreground">MamaLearnEnglish</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 MamaLearnEnglish. Interactive English learning through real books.
          </p>
        </div>
      </footer>
    </div>
  );
}