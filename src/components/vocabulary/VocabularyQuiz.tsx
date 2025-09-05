import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { VocabularyEntry } from "@/lib/api";
import { TextToSpeechButton } from "@/components/TextToSpeechButton";
import { 
  CheckCircle, 
  XCircle, 
  Trophy,
  RotateCcw,
  GraduationCap
} from "lucide-react";

// Utility function to clean XML tags from text
const cleanXmlTags = (text: string): string => {
  if (!text) return text;
  return text.replace(/<xref[^>]*>([^<]*)<\/xref>/g, '$1');
};

interface VocabularyQuizProps {
  vocabulary: VocabularyEntry[];
  onComplete: () => void;
}

interface QuizQuestion {
  word: VocabularyEntry;
  correctAnswer: string;
  options: string[];
  type: 'translation' | 'definition';
}

export const VocabularyQuiz: React.FC<VocabularyQuizProps> = ({
  vocabulary,
  onComplete
}) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<boolean[]>([]);
  const [quizComplete, setQuizComplete] = useState(false);

  // Generate quiz questions
  useEffect(() => {
    if (vocabulary.length === 0) return;

    const generateQuestions = () => {
      const quizQuestions: QuizQuestion[] = [];
      
      // Take up to 10 random words for the quiz
      const shuffledVocab = [...vocabulary].sort(() => Math.random() - 0.5).slice(0, 10);
      
      shuffledVocab.forEach((word) => {
        // Translation question: English -> German
        if (word.translation_de) {
          const correctAnswer = word.translation_de;
          const wrongAnswers = vocabulary
            .filter(w => w.translation_de && w.translation_de !== correctAnswer)
            .map(w => w.translation_de!)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);
          
          if (wrongAnswers.length >= 3) {
            const options = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);
            
            quizQuestions.push({
              word,
              correctAnswer,
              options,
              type: 'translation'
            });
          }
        }

        // Definition question: Definition -> English word
        if (word.sense && quizQuestions.length < 10) {
          const correctAnswer = word.headword;
          const wrongAnswers = vocabulary
            .filter(w => w.headword !== correctAnswer)
            .map(w => w.headword)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);
          
          if (wrongAnswers.length >= 3) {
            const options = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);
            
            quizQuestions.push({
              word,
              correctAnswer,
              options,
              type: 'definition'
            });
          }
        }
      });

      return quizQuestions.slice(0, Math.min(10, quizQuestions.length));
    };

    const generatedQuestions = generateQuestions();
    setQuestions(generatedQuestions);
    setAnsweredQuestions(new Array(generatedQuestions.length).fill(false));
  }, [vocabulary]);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  const handleAnswerSelect = (answer: string) => {
    if (showResult) return;
    
    setSelectedAnswer(answer);
    setShowResult(true);
    
    const isCorrect = answer === currentQuestion.correctAnswer;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    // Mark question as answered
    setAnsweredQuestions(prev => {
      const updated = [...prev];
      updated[currentQuestionIndex] = true;
      return updated;
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setQuizComplete(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setAnsweredQuestions(new Array(questions.length).fill(false));
    setQuizComplete(false);
  };

  if (vocabulary.length < 4) {
    return (
      <Card className="p-12 text-center">
        <GraduationCap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Nicht genug Wörter für Quiz</h3>
        <p className="text-muted-foreground">
          Du benötigst mindestens 4 Wörter für ein Quiz. Lerne mehr Wörter und komm zurück!
        </p>
      </Card>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (quizComplete) {
    const percentage = Math.round((score / questions.length) * 100);
    const getScoreColor = () => {
      if (percentage >= 80) return "text-green-600";
      if (percentage >= 60) return "text-yellow-600";
      return "text-red-600";
    };

    const getScoreMessage = () => {
      if (percentage >= 90) return "Hervorragend! Du kennst deine Wörter sehr gut! 🎉";
      if (percentage >= 70) return "Gut gemacht! Weiter so! 👏";
      if (percentage >= 50) return "Nicht schlecht, aber es gibt Raum für Verbesserungen. 💪";
      return "Übe weiter! Die Wörter werden sich einprägen. 📚";
    };

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="text-center p-8">
          <CardHeader>
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <CardTitle className="text-2xl">Quiz abgeschlossen!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className={`text-6xl font-bold ${getScoreColor()}`}>
                {score}/{questions.length}
              </div>
              <div className={`text-2xl font-semibold ${getScoreColor()}`}>
                {percentage}%
              </div>
              <p className="text-lg text-muted-foreground">
                {getScoreMessage()}
              </p>
            </div>
            
            <div className="flex gap-3 justify-center">
              <Button onClick={resetQuiz} variant="outline">
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
          <span>{currentQuestionIndex + 1} von {questions.length} Fragen</span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="text-center text-sm text-muted-foreground">
          Punkte: {score}/{currentQuestionIndex + (showResult ? 1 : 0)}
        </div>
      </div>

      {/* Question Card */}
      <Card className="min-h-[400px]">
        <CardHeader className="text-center">
          <CardTitle className="text-lg">
            {currentQuestion.type === 'translation' 
              ? 'Was bedeutet dieses Wort auf Deutsch?' 
              : 'Welches Wort passt zu dieser Definition?'
            }
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Question */}
          <div className="text-center p-6 bg-muted/50 rounded-lg">
            {currentQuestion.type === 'translation' ? (
              <div className="flex items-center justify-center gap-3">
                <h2 className="text-3xl font-bold text-foreground">
                  {currentQuestion.word.headword}
                </h2>
                <TextToSpeechButton
                  text={currentQuestion.word.headword}
                  size="default"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-lg text-foreground italic">
                  "{cleanXmlTags(currentQuestion.word.sense)}"
                </p>
                {currentQuestion.word.pos && (
                  <Badge variant="outline" className="text-sm">
                    {currentQuestion.word.pos}
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Answer Options */}
          <div className="grid grid-cols-1 gap-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const isCorrect = option === currentQuestion.correctAnswer;
              const isWrong = showResult && isSelected && !isCorrect;
              const shouldHighlightCorrect = showResult && isCorrect;

              return (
                <Button
                  key={index}
                  variant="outline"
                  className={`p-4 h-auto text-left justify-start ${
                    shouldHighlightCorrect 
                      ? 'bg-green-100 border-green-500 text-green-800' 
                      : isWrong 
                      ? 'bg-red-100 border-red-500 text-red-800'
                      : isSelected
                      ? 'bg-primary/10 border-primary'
                      : ''
                  }`}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={showResult}
                >
                  <div className="flex items-center gap-3 w-full">
                    <span className="text-lg">{option}</span>
                    {showResult && isCorrect && (
                      <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />
                    )}
                    {isWrong && (
                      <XCircle className="w-5 h-5 text-red-600 ml-auto" />
                    )}
                  </div>
                </Button>
              );
            })}
          </div>

          {/* Next Button */}
          {showResult && (
            <div className="text-center pt-4">
              <Button onClick={handleNextQuestion}>
                {currentQuestionIndex < questions.length - 1 ? 'Nächste Frage' : 'Ergebnis anzeigen'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};