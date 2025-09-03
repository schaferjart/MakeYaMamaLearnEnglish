import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  Square, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  Settings,
  Clock,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Timer
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
  const [sessionTime, setSessionTime] = useState(300); // 5 minutes default
  const [remainingTime, setRemainingTime] = useState(300);
  const [shouldEndSession, setShouldEndSession] = useState(false);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isAutoAdvancing, setIsAutoAdvancing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Create refs for mutable state values used in speak function
  const sentencesRef = useRef<string[]>([]);
  const currentSentenceIndexRef = useRef(currentSentence);
  const isAutoAdvancingRef = useRef(isAutoAdvancing);
  const isTimerActiveRef = useRef(isTimerActive);
  const remainingTimeRef = useRef(remainingTime);
  
  // Split content into sentences
  const sentences = useMemo(() => 
    content.split(/[.!?]+/).filter(s => s.trim().length > 0),
    [content]
  );
  
  const currentText = sentences[currentSentence]?.trim() || '';
  
  // Update refs when props/state change
  useEffect(() => {
    sentencesRef.current = sentences;
  }, [sentences]);
  
  useEffect(() => {
    currentSentenceIndexRef.current = currentSentence;
  }, [currentSentence]);
  
  useEffect(() => {
    isAutoAdvancingRef.current = isAutoAdvancing;
  }, [isAutoAdvancing]);

  useEffect(() => {
    isTimerActiveRef.current = isTimerActive;
  }, [isTimerActive]);

  useEffect(() => {
    remainingTimeRef.current = remainingTime;
  }, [remainingTime]);

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

  // Reset state when chapter content changes
  useEffect(() => {
    setCurrentSentence(0);
    setIsAutoAdvancing(false);
    // Stop any speech from the previous chapter
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, [content]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = useCallback(() => {
    console.log('Starting timer...');
    if (timerRef.current) {
      console.log('Timer already running, clearing first');
      clearInterval(timerRef.current);
    }
    
    setIsTimerActive(true);
    timerRef.current = setInterval(() => {
      setRemainingTime(prev => {
        const newTime = prev - 1;
        console.log('Timer tick, remaining time:', newTime);
        if (newTime <= 0) {
          console.log('Timer reached zero, ending session');
          return 0;
        }
        return newTime;
      });
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    console.log('Stopping timer...');
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsTimerActive(false);
  }, []);

  // Handle session end when timer reaches zero
  useEffect(() => {
    if (remainingTime <= 0 && isTimerActive) {
      console.log('Session time expired');
      setShouldEndSession(true);
      stopTimer();
    }
  }, [remainingTime, isTimerActive, stopTimer]);

  // Handle session end notification asynchronously
  useEffect(() => {
    if (shouldEndSession) {
      console.log('Triggering session end');
      toast({
        title: "Session Complete",
        description: "Your reading session has ended.",
      });
      onSessionEnd?.();
      setShouldEndSession(false);
    }
  }, [shouldEndSession, toast, onSessionEnd]);

  const speak = useCallback((text: string, sentenceIndex: number) => {
    console.log(`Speaking sentence ${sentenceIndex}: ${text.substring(0, 50)}...`);
    
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      setIsLoading(true);
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = speechRate;
      utterance.volume = volume;
      utterance.lang = 'en-US';
      utteranceRef.current = utterance;
      
      // Try to get a good English voice
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(voice => 
        voice.lang.startsWith('en') && voice.name.includes('Female')
      ) || voices.find(voice => voice.lang.startsWith('en'));
      
      if (englishVoice) utterance.voice = englishVoice;
      
      utterance.onstart = () => {
        console.log(`Started speaking sentence ${sentenceIndex}`);
        setIsLoading(false);
        setIsPlaying(true);
        if (!isTimerActiveRef.current && remainingTimeRef.current > 0) {
          startTimer();
        }
      };
      
      utterance.onend = () => {
        console.log(`Finished speaking sentence ${sentenceIndex}`);
        setIsPlaying(false);
        
        // Use refs to access current values without causing dependency changes
        const currentSentences = sentencesRef.current;
        const currentIndex = currentSentenceIndexRef.current;
        const isStillAutoAdvancing = isAutoAdvancingRef.current;
        
        console.log(`onend: currentIndex=${currentIndex}, isAutoAdvancing=${isStillAutoAdvancing}, totalSentences=${currentSentences.length}`);
        
        if (isStillAutoAdvancing && currentIndex < currentSentences.length - 1) {
          console.log(`Moving from sentence ${currentIndex} to ${currentIndex + 1}`);
          setCurrentSentence(currentIndex + 1);
        } else if (currentIndex >= currentSentences.length - 1) {
          console.log('Reached end of sentences, stopping auto-advance');
          setIsAutoAdvancing(false);
          stopTimer();
          toast({
            title: "Reading complete!",
            description: "You've finished reading the entire content.",
          });
        }
      };
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsLoading(false);
        setIsPlaying(false);
        toast({
          title: "Speech Error",
          description: "There was an error with text-to-speech.",
          variant: "destructive",
        });
      };
      
      window.speechSynthesis.speak(utterance);
    } else {
      toast({
        title: "Not Supported",
        description: "Text-to-speech is not supported in this browser.",
        variant: "destructive",
      });
    }
  }, [speechRate, volume, startTimer, stopTimer, toast]);

  // Auto-advance effect - triggers when currentSentence changes during auto-advancing
  useEffect(() => {
    console.log(`useEffect triggered. isAutoAdvancing: ${isAutoAdvancing} isPlaying: ${isPlaying} isLoading: ${isLoading} currentSentence: ${currentSentence}`);
    
    if (isAutoAdvancing && !isPlaying && !isLoading && currentSentence < sentencesRef.current.length) {
      const sentenceText = sentencesRef.current[currentSentence]?.trim();
      if (sentenceText) {
        console.log(`Will speak sentence: ${currentSentence} text: ${sentenceText.substring(0, 50)}...`);
        speak(sentenceText, currentSentence);
      }
    }
  }, [currentSentence, isAutoAdvancing, isPlaying, isLoading, speak]);

  const handlePlay = () => {
    console.log('handlePlay called');
    if (currentText) {
      setIsAutoAdvancing(true);
      speak(currentText, currentSentence);
    }
  };

  const handlePause = () => {
    console.log('handlePause called');
    setIsAutoAdvancing(false);
    if ('speechSynthesis' in window && window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
    }
    setIsPlaying(false);
    stopTimer();
  };

  const handleResume = () => {
    console.log('handleResume called');
    if ('speechSynthesis' in window && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
      setIsAutoAdvancing(true);
      if (!isTimerActiveRef.current && remainingTimeRef.current > 0) {
        startTimer();
      }
    }
  };

  const handleStop = () => {
    console.log('handleStop called');
    setIsAutoAdvancing(false);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsLoading(false);
    setCurrentSentence(0);
    stopTimer();
  };

  const handlePrevious = () => {
    const newIndex = Math.max(0, currentSentence - 1);
    console.log(`handlePrevious: moving to sentence ${newIndex}`);
    setCurrentSentence(newIndex);
    if (isAutoAdvancing && sentences[newIndex]?.trim()) {
      speak(sentences[newIndex].trim(), newIndex);
    }
  };

  const handleNext = () => {
    const newIndex = Math.min(sentences.length - 1, currentSentence + 1);
    console.log(`handleNext: moving to sentence ${newIndex}`);
    setCurrentSentence(newIndex);
    if (isAutoAdvancing && sentences[newIndex]?.trim()) {
      speak(sentences[newIndex].trim(), newIndex);
    }
  };

  const handleSentenceClick = (index: number) => {
    console.log(`handleSentenceClick: clicked sentence ${index}`);
    setCurrentSentence(index);
    if (isAutoAdvancing && sentences[index]?.trim()) {
      speak(sentences[index].trim(), index);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      stopTimer();
    };
  }, [stopTimer]);

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
              
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setRemainingTime(60);
                    setSessionTime(60);
                  }}
                  disabled={isTimerActive}
                >
                  1m
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setRemainingTime(300);
                    setSessionTime(300);
                  }}
                  disabled={isTimerActive}
                >
                  5m
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setRemainingTime(600);
                    setSessionTime(600);
                  }}
                  disabled={isTimerActive}
                >
                  10m
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setRemainingTime(900);
                    setSessionTime(900);
                  }}
                  disabled={isTimerActive}
                >
                  15m
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setRemainingTime(1500);
                    setSessionTime(1500);
                  }}
                  disabled={isTimerActive}
                >
                  25m
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setRemainingTime(3600);
                    setSessionTime(3600);
                  }}
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
                ) : window.speechSynthesis?.paused ? (
                  <Button 
                    variant="default" 
                    size="icon" 
                    onClick={handleResume}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-5 h-5" />
                    )}
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