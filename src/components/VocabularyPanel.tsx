import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Volume2, Save, X } from "lucide-react";
import { t } from "@/lib/i18n";

interface VocabularyPanelProps {
  selectedText: string;
  onClose: () => void;
  onSave?: (vocabularyData: VocabularyData) => void;
}

interface VocabularyData {
  word: string;
  definition: string;
  synonyms: string[];
  translation: string;
  example: string;
  difficulty: number;
}

export const VocabularyPanel = ({ selectedText, onClose, onSave }: VocabularyPanelProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  // Mock data for demonstration - in real app this would come from API
  const vocabularyData: VocabularyData = {
    word: selectedText.toLowerCase(),
    definition: "A sample definition would appear here from the Wordnik API",
    synonyms: ["example", "sample", "instance"],
    translation: "Ein Beispiel (German translation from DeepL)",
    example: `"This is an example sentence using the word '${selectedText}'."`,
    difficulty: Math.floor(Math.random() * 5) + 1
  };

  const handleSave = () => {
    setIsSaved(true);
    onSave?.(vocabularyData);
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  const handlePronounce = () => {
    // In real app, this would use TTS API
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(selectedText);
      utterance.lang = 'en-GB';
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <Card className="w-96 max-w-[90vw] shadow-[var(--shadow-vocabulary)] border-vocabulary-highlight/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <span className="font-bold text-primary">{selectedText}</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handlePronounce}
            className="text-xs"
          >
            <Volume2 className="w-3 h-3 mr-1" />
            Aussprechen
          </Button>
          <Badge 
            variant="secondary" 
            className="text-xs"
          >
            {t('vocab.difficulty')}: {vocabularyData.difficulty}/5
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            {t('loading')}...
          </div>
        ) : (
          <>
            <div>
              <h4 className="font-medium text-sm text-primary mb-2">
                {t('vocab.definition')}
              </h4>
              <p className="text-sm text-foreground leading-relaxed">
                {vocabularyData.definition}
              </p>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium text-sm text-primary mb-2">
                {t('vocab.translation')} (Deutsch)
              </h4>
              <p className="text-sm text-foreground bg-secondary/50 p-2 rounded">
                {vocabularyData.translation}
              </p>
            </div>

            {vocabularyData.synonyms.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-medium text-sm text-primary mb-2">
                    {t('vocab.synonyms')}
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {vocabularyData.synonyms.map((synonym, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {synonym}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Separator />

            <div>
              <h4 className="font-medium text-sm text-primary mb-2">
                {t('vocab.example')}
              </h4>
              <p className="text-sm text-muted-foreground italic">
                {vocabularyData.example}
              </p>
            </div>

            <div className="pt-2">
              <Button 
                onClick={handleSave}
                disabled={isSaved}
                className="w-full"
                variant={isSaved ? "secondary" : "default"}
              >
                {isSaved ? (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {t('vocab.saved')}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {t('vocab.save')}
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};