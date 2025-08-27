import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { VocabularyPanel } from "./VocabularyPanel";
import { useAuth } from "@/hooks/useAuth";
import { useReadingProgress } from "@/hooks/useReadingProgress";
import { supabase } from "@/integrations/supabase/client";
import { t } from "@/lib/i18n";

interface SimpleReaderProps {
  bookTitle: string;
  content: string;
  sessionId?: string | null;
  bookId: string;
  onProgressUpdate?: (progress: any) => void;
}

export const SimpleReader = ({ 
  bookTitle, 
  content, 
  sessionId, 
  bookId, 
  onProgressUpdate 
}: SimpleReaderProps) => {
  const { user } = useAuth();
  const [selectedText, setSelectedText] = useState("");
  const [showVocabulary, setShowVocabulary] = useState(false);
  const [selectionPosition, setSelectionPosition] = useState({ x: 0, y: 0 });
  const contentRef = useRef<HTMLDivElement>(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  
  // Reading progress tracking
  const { progress, isTracking, startTracking, stopTracking, updatePosition } = useReadingProgress({
    bookId,
    sessionId,
    content,
    onProgressUpdate
  });

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      const text = selection.toString().trim();
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      setSelectedText(text);
      setSelectionPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      });
      setShowVocabulary(true);
    }
  };

  // Start tracking when component mounts
  useEffect(() => {
    startTracking();
    return () => {
      stopTracking();
    };
  }, [startTracking, stopTracking]);

  // Track reading progress based on scroll position
  useEffect(() => {
    if (!contentRef.current || !isTracking) return;

    const handleScroll = () => {
      const element = contentRef.current;
      if (!element) return;

      setIsUserScrolling(true);
      
      // Calculate reading position based on scroll
      const scrollTop = element.scrollTop;
      const scrollHeight = element.scrollHeight;
      const clientHeight = element.clientHeight;
      
      if (scrollHeight > clientHeight) {
        const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;
        const words = content.split(/\s+/).filter(word => word.length > 0);
        const wordsRead = Math.floor((scrollPercentage / 100) * words.length);
        
        updatePosition(wordsRead, scrollPercentage);
      }

      // Clear scrolling indicator after a delay
      setTimeout(() => setIsUserScrolling(false), 1000);
    };

    const element = contentRef.current;
    element.addEventListener('scroll', handleScroll);
    return () => element?.removeEventListener('scroll', handleScroll);
  }, [content, isTracking, updatePosition]);

  // Restore scroll position from saved progress
  useEffect(() => {
    if (!contentRef.current || !progress.progressPercentage || isUserScrolling) return;

    const element = contentRef.current;
    const scrollHeight = element.scrollHeight;
    const clientHeight = element.clientHeight;
    
    if (scrollHeight > clientHeight) {
      const targetScrollTop = (progress.progressPercentage / 100) * (scrollHeight - clientHeight);
      element.scrollTop = targetScrollTop;
    }
  }, [progress.progressPercentage, isUserScrolling]);

  const handleVocabularySave = async (vocabularyData: any) => {
    if (!user || !sessionId) return;

    try {
      await supabase.from('vocabulary').insert({
        user_id: user.id,
        headword: vocabularyData.word,
        lemma: vocabularyData.word.toLowerCase(),
        pos: vocabularyData.pos,
        sense: vocabularyData.definition,
        example: vocabularyData.example,
        translation_de: vocabularyData.translation,
        difficulty: vocabularyData.difficulty
      });
      console.log('Vocabulary saved to database');
    } catch (error) {
      console.error('Error saving vocabulary:', error);
    }
  };

  return (
    <div className="relative">
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-primary mb-2">{bookTitle}</h1>
            <p className="text-sm text-muted-foreground">
              Wählen Sie ein Wort oder eine Phrase aus, um die Definition und Übersetzung zu sehen
            </p>
          </div>
          
          <div 
            ref={contentRef}
            className="prose prose-lg max-w-none leading-relaxed text-foreground font-serif select-text cursor-text h-[70vh] overflow-y-auto"
            onMouseUp={handleTextSelection}
            style={{ 
              fontFamily: 'var(--font-reading)',
              lineHeight: '1.7',
              fontSize: '18px'
            }}
          >
            <div className="space-y-4">
              {content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="mb-4 text-justify">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vocabulary Panel Overlay */}
      {showVocabulary && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <VocabularyPanel
            selectedText={selectedText}
            onClose={() => setShowVocabulary(false)}
            onSave={handleVocabularySave}
          />
        </div>
      )}
    </div>
  );
};