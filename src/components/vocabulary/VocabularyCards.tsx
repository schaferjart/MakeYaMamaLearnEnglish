import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { VocabularyEntry } from "@/lib/api";
import { TextToSpeechButton } from "@/components/TextToSpeechButton";
import { 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  SkipForward,
  Brain,
  Trophy
} from "lucide-react";

interface VocabularyCardsProps {
  vocabulary: VocabularyEntry[];
  onComplete: () => void;
}

export const VocabularyCards: React.FC<VocabularyCardsProps> = ({
  vocabulary,
  onComplete
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState<Set<number>>(new Set());
  const [unknownCards, setUnknownCards] = useState<Set<number>>(new Set());
  const [sessionComplete, setSessionComplete] = useState(false);

  const currentCard = vocabulary[currentIndex];
  const progress = ((currentIndex + 1) / vocabulary.length) * 100;

  const handleCardFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleKnown = () => {
    setKnownCards(prev => new Set([...prev, currentIndex]));
    nextCard();
  };

  const handleUnknown = () => {
    setUnknownCards(prev => new Set([...prev, currentIndex]));
    nextCard();
  };

  const nextCard = () => {
    if (currentIndex < vocabulary.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      setSessionComplete(true);
    }
  };

  const skipCard = () => {
    nextCard();
  };

  const resetSession = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setKnownCards(new Set());
    setUnknownCards(new Set());
    setSessionComplete(false);
  };

  if (vocabulary.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Brain className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Keine Wörter zum Lernen</h3>
        <p className="text-muted-foreground">
          Füge erst Wörter zu deinem Vokabular hinzu!
        </p>
      </Card>
    );
  }

  if (sessionComplete) {
    const knownCount = knownCards.size;
    const unknownCount = unknownCards.size;
    const skippedCount = vocabulary.length - knownCount - unknownCount;

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="text-center p-8">
          <CardHeader>
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <CardTitle className="text-2xl">Lernkarten abgeschlossen!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{knownCount}</div>
                <div className="text-sm text-muted-foreground">Bekannt</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{unknownCount}</div>
                <div className="text-sm text-muted-foreground">Unbekannt</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-600">{skippedCount}</div>
                <div className="text-sm text-muted-foreground">Übersprungen</div>
              </div>
            </div>
            
            <div className="flex gap-3 justify-center">
              <Button onClick={resetSession} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Wiederholen
              </Button>
              <Button onClick={onComplete}>
                Zur Bibliothek
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Fortschritt</span>
          <span>{currentIndex + 1} von {vocabulary.length}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Card */}
      <Card 
        className={`min-h-[400px] cursor-pointer transition-all duration-300 ${
          isFlipped ? 'bg-primary/5 border-primary/20' : ''
        }`}
        onClick={handleCardFlip}
      >
        <CardContent className="p-8 flex flex-col justify-center items-center text-center min-h-[400px]">
          {!isFlipped ? (
            /* Front of card - English word */
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3">
                <h2 className="text-4xl font-bold text-foreground">
                  {currentCard.headword}
                </h2>
                <TextToSpeechButton
                  text={currentCard.headword}
                  size="default"
                />
              </div>
              
              {currentCard.pos && (
                <Badge variant="outline" className="text-sm">
                  {currentCard.pos}
                </Badge>
              )}
              
              <p className="text-muted-foreground mt-8">
                Klicken zum Umdrehen
              </p>
            </div>
          ) : (
            /* Back of card - German translation and details */
            <div className="space-y-4 w-full">
              <h2 className="text-3xl font-bold text-primary mb-6">
                {currentCard.translation_de || 'Keine Übersetzung'}
              </h2>
              
              {currentCard.sense && (
                <div className="bg-muted/50 rounded-lg p-4 text-left">
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                    Definition:
                  </h4>
                  <p className="text-foreground">{currentCard.sense}</p>
                </div>
              )}
              
              {currentCard.example && (
                <div className="bg-muted/50 rounded-lg p-4 text-left">
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                    Beispiel:
                  </h4>
                  <p className="text-foreground italic">
                    "{currentCard.example}"
                  </p>
                </div>
              )}
              
              {currentCard.synonym && (
                <div className="bg-muted/50 rounded-lg p-4 text-left">
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                    Synonym:
                  </h4>
                  <p className="text-foreground">{currentCard.synonym}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-center gap-3">
        <Button
          variant="outline"
          onClick={skipCard}
          disabled={!isFlipped}
        >
          <SkipForward className="w-4 h-4 mr-2" />
          Überspringen
        </Button>
        <Button
          variant="destructive"
          onClick={handleUnknown}
          disabled={!isFlipped}
        >
          <XCircle className="w-4 h-4 mr-2" />
          Nicht gewusst
        </Button>
        <Button
          variant="default"
          onClick={handleKnown}
          disabled={!isFlipped}
          className="bg-green-600 hover:bg-green-700"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Gewusst
        </Button>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        {!isFlipped 
          ? "Klicke auf die Karte, um die Übersetzung zu sehen" 
          : "Bewerte dein Wissen über dieses Wort"
        }
      </p>
    </div>
  );
};