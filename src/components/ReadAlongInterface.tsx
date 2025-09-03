import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  Square, 
  SkipBack, 
  SkipForward, 
  Volume2,
  Settings,
  Timer,
  BookOpen,
  VolumeX,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

import { useToast } from '@/hooks/use-toast';
import { useReadingProgress } from '@/hooks/useReadingProgress';
import { EpubChapter } from '@/hooks/useEpub';
import { VocabularyPanel } from '@/components/VocabularyPanel';

interface ReadAlongInterfaceProps {
  content: string;
  bookTitle: string;
  bookId: string;
  sessionId: string | null;

  currentChapter?: EpubChapter | null;
  totalChapters?: number;
  onPreviousChapter?: () => void;
  onNextChapter?: () => void;
  canGoPrevious?: boolean;
  canGoNext?: boolean;

  onProgressUpdate?: (progress: any) => void;
  onSessionEnd?: () => void;
}

export function ReadAlongInterface({
  content,
  bookTitle,
  bookId,
  sessionId,
  currentChapter,
  totalChapters,
  onPreviousChapter,
  onNextChapter,
  canGoPrevious,
  canGoNext,
  onProgressUpdate,
  onSessionEnd
}: ReadAlongInterfaceProps) {
  const [selectedText, setSelectedText] = useState("");
  const [showVocabulary, setShowVocabulary] = useState(false);
  const [currentSentence, setCurrentSentence] = useState(0);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [volume, setVolume] = useState(0.8);
  const [sessionTime, setSessionTime] = useState(1500); // 25 minutes default
  const [remainingTime, setRemainingTime] = useState(1500);
  const [isTimerActive, setIsTimerActive] = useState(false);

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const selectedString = selection?.toString().trim();

    if (selection && selectedString && selectedString.length > 0 && selectedString.length < 300) {
      const readingTextElement = document.querySelector('.reading-text');
      if (readingTextElement && selection.anchorNode && readingTextElement.contains(selection.anchorNode.parentElement)) {
          setSelectedText(selectedString);
          setShowVocabulary(true);
      }
    }
  };

  const handleCloseVocabulary = () => {
    setShowVocabulary(false);
    setSelectedText("");
  };
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Persistent progress tracking
  const { progress, isTracking, startTracking, stopTracking, updatePosition } = useReadingProgress({
    bookId,
    sessionId,
    content,
    onProgressUpdate
  });

  // Start/stop progress tracking
  useEffect(() => {
    startTracking();
    return () => {
      stopTracking();
    };
  }, [startTracking, stopTracking]);



  // Split content into sentences
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const currentText = sentences[currentSentence]?.trim() || '';

  // Calculate cumulative word counts for progress tracking
  const cumulativeWordCounts = useMemo(() => {
    let count = 0;
    return sentences.map(sentence => {
      count += sentence.split(/\s+/).filter(Boolean).length;
      return count;
    });
  }, [sentences]);

  // Update persistent progress when sentence changes
  useEffect(() => {
    if (isTracking && cumulativeWordCounts.length > 0) {
      const wordsRead = cumulativeWordCounts[currentSentence] || 0;
      const totalWords = cumulativeWordCounts[cumulativeWordCounts.length - 1] || 0;
      const percentage = totalWords > 0 ? (wordsRead / totalWords) * 100 : 0;
      updatePosition(wordsRead, percentage);
    }
  }, [currentSentence, isTracking, updatePosition, cumulativeWordCounts]);

  // Direct Web Speech API state
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Reset state when chapter content changes
  useEffect(() => {
    setCurrentSentence(0);
    // Stop any speech from the previous chapter
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
  }, [content]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = useCallback(() => {
    setIsTimerActive(true);
    timerRef.current = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          setIsTimerActive(false);
          // Stop any active speech
          if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
          }
          toast({
            title: "Reading session complete!",
            description: "Let's practice what you've learned.",
          });
          onSessionEnd?.(); // Trigger conversation mode
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [toast, onSessionEnd]);

  const stopTimer = useCallback(() => {
    setIsTimerActive(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Direct Web Speech API implementation (like conversation component)
  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      // Stop any current speech
      speechSynthesis.cancel();
      setIsLoading(true);

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = speechRate;
      utterance.pitch = 1.0;
      utterance.volume = volume;
      
      // Try to get a good English voice
      const voices = speechSynthesis.getVoices();
      const englishVoice = voices.find(voice => 
        voice.lang.startsWith('en') && voice.name.includes('Female')
      ) || voices.find(voice => voice.lang.startsWith('en'));
      
      if (englishVoice) utterance.voice = englishVoice;

      utterance.onstart = () => {
        setIsLoading(false);
        setIsPlaying(true);
        if (!isTimerActive && remainingTime > 0) {
          startTimer();
        }
      };

      utterance.onend = () => {
        setIsPlaying(false);
        currentUtteranceRef.current = null;
        
        // Auto-advance to next sentence
        if (currentSentence < sentences.length - 1) {
          setTimeout(() => {
            const nextSentence = currentSentence + 1;
            setCurrentSentence(nextSentence);
            if (sentences[nextSentence]?.trim()) {
              speak(sentences[nextSentence].trim());
            }
          }, 800);
        } else {
          // Finished reading all sentences
          stopTimer();
          toast({
            title: "Reading complete!",
            description: "You've finished reading the entire content.",
          });
        }
      };

      utterance.onerror = () => {
        setIsLoading(false);
        setIsPlaying(false);
        currentUtteranceRef.current = null;
        toast({
          title: "Speech error",
          description: "There was an issue with text-to-speech. Please try again.",
          variant: "destructive",
        });
      };

      currentUtteranceRef.current = utterance;
      speechSynthesis.speak(utterance);
    }
  }, [speechRate, volume, currentSentence, sentences, isTimerActive, remainingTime, startTimer, stopTimer, toast]);

  const stop = useCallback(() => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsPlaying(false);
      setIsLoading(false);
      currentUtteranceRef.current = null;
    }
  }, []);

  const pause = useCallback(() => {
    if ('speechSynthesis' in window && isPlaying) {
      speechSynthesis.pause();
    }
  }, [isPlaying]);

  const resume = useCallback(() => {
    if ('speechSynthesis' in window && speechSynthesis.paused) {
      speechSynthesis.resume();
    }
  }, []);

  const handleNextSentence = (sentenceIndex: number) => {
    if (sentenceIndex < sentences.length && sentences[sentenceIndex]?.trim()) {
      speak(sentences[sentenceIndex].trim());
    }
  };

  const handlePlay = () => {
    if (currentText) {
      speak(currentText);
    }
  };

  const handlePause = () => {
    pause();
    stopTimer();
  };

  const handleStop = () => {
    stop();
    setCurrentSentence(0);
    stopTimer();
  };

  const handlePrevious = () => {
    const newIndex = Math.max(0, currentSentence - 1);
    setCurrentSentence(newIndex);
    if (isPlaying && sentences[newIndex]?.trim()) {
      speak(sentences[newIndex].trim());
    }
  };

  const handleNext = () => {
    const newIndex = Math.min(sentences.length - 1, currentSentence + 1);
    setCurrentSentence(newIndex);
    if (isPlaying && sentences[newIndex]?.trim()) {
      speak(sentences[newIndex].trim());
    }
  };

  const handleSentenceClick = (index: number) => {
    setCurrentSentence(index);
    if (isPlaying && sentences[index]?.trim()) {
      speak(sentences[index].trim());
    }
  };

  useEffect(() => {
    return () => {
      stop();
      stopTimer();
    };
  }, [stop, stopTimer]);

  const progressPercentage = ((sessionTime - remainingTime) / sessionTime) * 100;
  const readingProgress = (currentSentence / Math.max(sentences.length - 1, 1)) * 100;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-6">
        {/* Reading Content */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="shadow-lg border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                {bookTitle}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Chapter Navigation */}
              <div className="flex items-center justify-between border-b border-border py-3 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onPreviousChapter}
                  disabled={!canGoPrevious}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                {currentChapter && (
                  <span className="text-sm text-muted-foreground text-center px-2 truncate">
                    {currentChapter.label}
                  </span>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={onNextChapter}
                  disabled={!canGoNext}
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div
                className="reading-text max-h-96 overflow-y-auto bg-reading-focus p-6 rounded-lg border border-border"
                onMouseUp={handleTextSelection}
              >
                {sentences.map((sentence, index) => (
                  <span
                    key={index}
                    onClick={() => handleSentenceClick(index)}
                    className={`cursor-pointer transition-all duration-300 ${
                      index === currentSentence
                        ? 'bg-audio-sync text-foreground font-semibold px-1 rounded'
                        : index < currentSentence
                        ? 'text-muted-foreground'
                        : 'hover:bg-muted/50 px-1 rounded'
                    }`}
                  >
                    {sentence.trim()}.{' '}
                  </span>
                ))}
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Reading Progress</span>
                  <span>{Math.round(readingProgress)}%</span>
                </div>
                <Progress value={readingProgress} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls Panel */}
        <div className="space-y-4">
          {/* Timer Card */}
          <Card className="shadow-md border-border">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Timer className="w-5 h-5 text-primary" />
                Session Timer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className={`text-3xl font-bold ${
                  remainingTime < 300 ? 'text-destructive animate-pulse' : 
                  remainingTime < 600 ? 'text-accent' : 
                  'text-primary'
                }`}>
                  {formatTime(remainingTime)}
                </div>
                <p className="text-sm text-muted-foreground">remaining</p>
              </div>
              
              <Progress 
                value={progressPercentage} 
                className="h-3"
              />
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setRemainingTime(900)}
                  disabled={isTimerActive}
                >
                  15m
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setRemainingTime(1500)}
                  disabled={isTimerActive}
                >
                  25m
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setRemainingTime(3600)}
                  disabled={isTimerActive}
                >
                  60m
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Playback Controls */}
          <Card className="shadow-md border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Playback Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center gap-2">
                <Button variant="outline" size="icon" onClick={handlePrevious}>
                  <SkipBack className="w-4 h-4" />
                </Button>
                
                {isPlaying ? (
                  <Button variant="default" size="icon" onClick={handlePause}>
                    <Pause className="w-5 h-5" />
                  </Button>
                ) : (
                  <Button 
                    variant="default" 
                    size="icon" 
                    onClick={handlePlay}
                    disabled={isLoading || !currentText}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-5 h-5" />
                    )}
                  </Button>
                )}
                
                <Button variant="outline" size="icon" onClick={handleStop}>
                  <Square className="w-4 h-4" />
                </Button>
                
                <Button variant="outline" size="icon" onClick={handleNext}>
                  <SkipForward className="w-4 h-4" />
                </Button>
              </div>

              {/* Current sentence indicator */}
              {isPlaying && (
                <div className="text-center p-3 bg-audio-sync/20 rounded-lg border border-audio-sync/30">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                    <span className="text-sm font-medium">Now Reading</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Sentence {currentSentence + 1} of {sentences.length}
                  </p>
                </div>
              )}

              {/* Speed Control */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Speed</label>
                  <span className="text-sm text-muted-foreground">{speechRate}x</span>
                </div>
                <Slider
                  value={[speechRate]}
                  onValueChange={(value) => setSpeechRate(value[0])}
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  className="w-full"
                />
              </div>

              {/* Volume Control */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <Volume2 className="w-4 h-4" />
                    <label className="text-sm font-medium">Volume</label>
                  </div>
                  <span className="text-sm text-muted-foreground">{Math.round(volume * 100)}%</span>
                </div>
                <Slider
                  value={[volume]}
                  onValueChange={(value) => setVolume(value[0])}
                  min={0}
                  max={1}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Back Button Placeholder - will be replaced by chapter navigation */}
        </div>
      </div>
      {/* Vocabulary Panel Overlay */}
      {showVocabulary && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <VocabularyPanel
            selectedText={selectedText}
            bookId={bookId}
            onClose={handleCloseVocabulary}
          />
        </div>
      )}
    </div>
  );
}