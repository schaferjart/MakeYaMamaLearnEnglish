import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Volume2, Save, X, Loader2 } from "lucide-react";
import { lookupWord, translateText, saveVocabulary } from "@/lib/api";
import { t } from "@/lib/i18n";
import { useLocale } from "@/lib/locale";
import { TextToSpeechButton } from "@/components/TextToSpeechButton";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { type LanguageCode } from "@/lib/languages";

interface VocabularyPanelProps {
  selectedText: string;
  onClose: () => void;
  bookId?: string;
  bookLanguage?: LanguageCode; // NEW: Book's language
  userTargetLanguage?: LanguageCode; // NEW: User's native language
  cfi?: string;
  onSave?: (vocabularyData: VocabularyData) => void;
}

interface VocabularyData {
  word: string;
  definition: string;
  synonyms: string[];
  translation: string;
  example: string;
  pos?: string;
  sourceLanguage?: LanguageCode;
  targetLanguage?: LanguageCode;
}

export const VocabularyPanel = ({ 
  selectedText, 
  onClose, 
  bookId, 
  bookLanguage, 
  userTargetLanguage, 
  cfi, 
  onSave 
}: VocabularyPanelProps) => {
  const { user } = useAuth();
  const { locale } = useLocale();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [vocabularyData, setVocabularyData] = useState<VocabularyData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWordData = async () => {
      if (!selectedText.trim() || !bookLanguage || !userTargetLanguage) return;

      setIsLoading(true);
      setError(null);

      try {
        const [wordData, translationData] = await Promise.all([
          lookupWord(selectedText.toLowerCase()),
          translateText(selectedText, bookLanguage, userTargetLanguage)
        ]);

        const data: VocabularyData = {
          word: wordData.word,
          definition: wordData.sense || wordData.definitions[0]?.text || t('vocab.fallback.noDefinition'),
          synonyms: [], // Could be extracted from definitions
          translation: translationData.translation,
          example: wordData.example || wordData.examples[0] || t('vocab.fallback.noExample', { word: selectedText }),
          pos: wordData.pos,
          sourceLanguage: bookLanguage,
          targetLanguage: userTargetLanguage
        };

        setVocabularyData(data);
      } catch (err) {
        console.error('Error fetching word data:', err);
        setError(t('vocab.error.fetchFailed'));
        
        // Fallback data
        setVocabularyData({
          word: selectedText.toLowerCase(),
          definition: t('vocab.fallback.definitionTempUnavailable'),
          synonyms: [],
          translation: t('vocab.fallback.translationTempUnavailable'),
          example: t('vocab.fallback.noExample', { word: selectedText }),
          sourceLanguage: bookLanguage,
          targetLanguage: userTargetLanguage
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchWordData();
  }, [selectedText, bookLanguage, userTargetLanguage]);

  const handleSave = async () => {
    if (!vocabularyData || !user) return;
    
    try {
      setIsLoading(true);
      
      await saveVocabulary({
        headword: vocabularyData.word,
        lemma: vocabularyData.word,
        pos: vocabularyData.pos,
        sense: vocabularyData.definition,
        example: vocabularyData.example,
        source_language: bookLanguage,
        target_language: userTargetLanguage,
        // Set the appropriate translation column based on target language
        ...(userTargetLanguage === 'de' && { translation_de: vocabularyData.translation }),
        ...(userTargetLanguage === 'en' && { translation_en: vocabularyData.translation }),
        ...(userTargetLanguage === 'fr' && { translation_fr: vocabularyData.translation }),
        ...(userTargetLanguage === 'hi' && { translation_hi: vocabularyData.translation }),
        book_id: bookId,
        cfi: cfi,
        user_id: user.id
      });
      
      setIsSaved(true);
      onSave?.(vocabularyData);
      
      toast({
        title: t('vocab.toast.savedTitle'),
        description: t('vocab.toast.savedDescription', { word: vocabularyData.word }),
      });
      
      setTimeout(() => {
        onClose();
      }, 1000);
      
    } catch (error) {
      console.error('Error saving vocabulary:', error);
      toast({
        title: t('vocab.toast.saveFailedTitle'),
        description: t('vocab.toast.saveFailedDescription'),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
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
          <TextToSpeechButton 
            text={selectedText} 
            size="sm" 
            variant="outline"
            voice="Sarah"
            language={bookLanguage} // Use book's language for TTS
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            <p>{t('loading')}...</p>
          </div>
        ) : error ? (
          <div className="text-center py-4 text-destructive">
            <p className="text-sm">{error}</p>
            <Button variant="outline" size="sm" onClick={onClose} className="mt-2">
              {t('close')}
            </Button>
          </div>
        ) : vocabularyData ? (
          <>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-medium text-sm text-primary">
                  {t('vocab.definition')}
                </h4>
                {vocabularyData.pos && (
                  <Badge variant="outline" className="text-xs">
                    {vocabularyData.pos}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-foreground leading-relaxed">
                {vocabularyData.definition}
              </p>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium text-sm text-primary mb-2">
                {t('vocab.translation')} ({
                  userTargetLanguage === 'de' ? t('language.german') :
                  userTargetLanguage === 'fr' ? t('language.french') :
                  userTargetLanguage === 'hi' ? t('language.hindi') :
                  userTargetLanguage === 'en' ? t('language.english') :
                  userTargetLanguage === 'it' ? 'Italiano' :
                  userTargetLanguage === 'es' ? 'Español' :
                  'Translation'
                })
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
                {vocabularyData.example.replace(/_/g, '').replace(/\.\.\./g, '…')}
              </p>
            </div>

            <div className="pt-2">
              <Button 
                onClick={handleSave}
                disabled={isSaved || isLoading || !user}
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
        ) : null}
      </CardContent>
    </Card>
  );
};