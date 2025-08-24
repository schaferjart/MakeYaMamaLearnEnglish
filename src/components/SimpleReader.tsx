import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { VocabularyPanel } from "./VocabularyPanel";
import { t } from "@/lib/i18n";

interface SimpleReaderProps {
  bookTitle: string;
  content: string;
}

export const SimpleReader = ({ bookTitle, content }: SimpleReaderProps) => {
  const [selectedText, setSelectedText] = useState("");
  const [showVocabulary, setShowVocabulary] = useState(false);
  const [selectionPosition, setSelectionPosition] = useState({ x: 0, y: 0 });

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

  const handleVocabularySave = (vocabularyData: any) => {
    console.log('Vocabulary saved:', vocabularyData);
    // In real app, this would save to Supabase
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
            className="prose prose-lg max-w-none leading-relaxed text-foreground font-serif select-text cursor-text"
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