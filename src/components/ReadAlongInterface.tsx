// ReadAlongInterface.tsx (Use resumeData prop, optimize saving with lastSavedSentence ref, remove time throttle)
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
import { useLocalStorageResume } from '@/hooks/useLocalStorageResume';
import { useAuth } from '@/hooks/useAuth';
import { EpubChapter } from '@/hooks/useEpub';
import { VocabularyPanel } from '@/components/VocabularyPanel';

interface ResumeData {
  chapterId: string;
  sentenceIndex: number;
  timestamp: number;
}

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
  resumeData?: ResumeData | null; // New prop
  isReturningFromConversation?: boolean; // Flag to advance to next sentence
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
  onSessionEnd,
  resumeData,
  isReturningFromConversation
}: ReadAlongInterfaceProps) {
  const [selectedText, setSelectedText] = useState("");
  const [showVocabulary, setShowVocabulary] = useState(false);
  const [currentSentence, setCurrentSentence] = useState(0);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [volume, setVolume] = useState(0.8);
  const [sessionTime, setSessionTime] = useState(300); // 5 minutes default
  const [remainingTime, setRemainingTime] = useState(300);
  const [shouldEndSession, setShouldEndSession] = useState(false);
  const [isWaitingForTtsCompletion, setIsWaitingForTtsCompletion] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false); // Prevent TTS after session end
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isAutoAdvancing, setIsAutoAdvancing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Refs for stable access to current values
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isWaitingForTtsRef = useRef(false);
  const selectedVoiceRef = useRef<SpeechSynthesisVoice | null>(null); // Cache voice selection
  const hasResumedRef = useRef(false); // Track if we've already resumed
  const conversationReturnRef = useRef(false); // Store conversation return flag
  const lastResumedSentenceRef = useRef(-1); // Track the last sentence we resumed to
  
  // Track if TTS is currently active
  const isTtsActive = isPlaying && utteranceRef.current !== null;

  // Simple localStorage-based resume
  const { saveResumeData } = useLocalStorageResume(bookId, user?.id || '');
  
  // Ref for throttling saves to once per sentence change
  const lastSavedSentence = useRef<number>(-1);
  
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
      // Use setTimeout to avoid setState during render warning
      setTimeout(() => {
        const wordsRead = cumulativeWordCounts[currentSentence] || 0;
        const totalWords = cumulativeWordCounts[cumulativeWordCounts.length - 1] || 0;
        const percentage = totalWords > 0 ? (wordsRead / totalWords) * 100 : 0;
        
        // Update reading progress (without resume info - that's handled separately)
        updatePosition(wordsRead, percentage);
      }, 0);
    }
  }, [currentSentence, isTracking, updatePosition, cumulativeWordCounts]);

  // Save resume data separately to avoid setState during render warnings
  useEffect(() => {
    if (currentChapter?.id && currentSentence > 0 && isTracking && currentSentence !== lastSavedSentence.current) {
      // Use setTimeout to ensure this runs after render is complete
      const timeoutId = setTimeout(() => {
        saveResumeData(currentChapter.id, currentSentence);
        lastSavedSentence.current = currentSentence;
      }, 0);
      
      return () => clearTimeout(timeoutId);
    }
  }, [currentSentence, currentChapter?.id, isTracking, saveResumeData]);

  // Resume from saved sentence position
  useEffect(() => {
    console.log('ReadAlongInterface resume check:', {
      resumeData,
      'resumeData.sentenceIndex': resumeData?.sentenceIndex,
      'resumeData.chapterId': resumeData?.chapterId,
      'sentencesLength': sentences.length,
      'currentSentence': currentSentence,
      'currentChapter?.id': currentChapter?.id,
      'isReturningFromConversation': isReturningFromConversation
    });
    
    // Only resume if we have valid data and haven't set a sentence yet
    if (resumeData?.sentenceIndex >= 0 && sentences.length > 0 && currentSentence === 0) {
      let resumeSentence;
      
      if (isReturningFromConversation) {
        // When returning from conversation, advance to the next sentence
        const nextSentence = resumeData.sentenceIndex + 1;
        resumeSentence = Math.min(nextSentence, sentences.length - 1);
        
        console.log('Returning from conversation - Resume calculation:', {
          'resumeData.sentenceIndex': resumeData.sentenceIndex,
          'nextSentence': nextSentence,
          'sentences.length - 1': sentences.length - 1,
          'Math.min result': resumeSentence
        });
      } else {
        // On page reload or normal resume, stay at the same sentence
        resumeSentence = Math.min(resumeData.sentenceIndex, sentences.length - 1);
        
        console.log('Page reload - Resume calculation:', {
          'resumeData.sentenceIndex': resumeData.sentenceIndex,
          'sentences.length - 1': sentences.length - 1,
          'resumeSentence': resumeSentence
        });
      }
      
      console.log('Resuming reading at sentence:', resumeSentence, 'of', sentences.length);
      setCurrentSentence(resumeSentence);
    } else if (currentSentence !== 0) {
      console.log('Resume skipped - currentSentence already set to:', currentSentence);
    } else if (sentences.length === 0) {
      console.log('Resume skipped - sentences not loaded yet');
    } else {
      console.log('Resume skipped - no valid resume data');
    }
  }, [resumeData?.sentenceIndex, sentences.length, currentChapter?.id, isReturningFromConversation]);

  // Reset resume flags when component unmounts or chapter changes
  useEffect(() => {
    hasResumedRef.current = false;
    conversationReturnRef.current = false;
    lastResumedSentenceRef.current = -1;
  }, [currentChapter?.id]);

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

  // Handle timer expiration with graceful TTS completion
  useEffect(() => {
    if (remainingTime <= 0 && isTimerActive) {
      console.log('Timer reached zero, checking TTS state');
      stopTimer();
      
      // Immediately set session ended to prevent new TTS
      setSessionEnded(true);
      
      // If TTS is currently active, wait for it to complete
      if (isTtsActive) {
        console.log('TTS is active, waiting for completion before ending session');
        setIsWaitingForTtsCompletion(true);
        isWaitingForTtsRef.current = true;
        // The session will end in utterance.onend when TTS completes
      } else {
        console.log('No active TTS, ending session immediately');
        setShouldEndSession(true);
      }
    }
  }, [remainingTime, isTimerActive, isTtsActive, stopTimer]);

  // Handle session end notification asynchronously
  useEffect(() => {
    if (shouldEndSession) {
      console.log('Triggering session end');
      
      // Ensure session is marked as ended
      if (!sessionEnded) {
        setSessionEnded(true); // Prevent further TTS
      }
      
      // Show appropriate message based on transition type
      const message = isWaitingForTtsCompletion 
        ? "Session completed after current sentence finished"
        : "Session time expired";
      
      toast({
        title: "Reading session ended",
        description: message,
        duration: 3000,
      });
      
      // Add graceful pause before starting conversation
      setTimeout(() => {
        console.log('Starting conversation after graceful pause');
        onSessionEnd?.();
      }, 1500); // 1.5 second pause
      
      // Reset states
      setShouldEndSession(false);
      setIsWaitingForTtsCompletion(false);
      isWaitingForTtsRef.current = false;
    }
  }, [shouldEndSession, isWaitingForTtsCompletion, toast, onSessionEnd]);

  // Status logging for debugging graceful transitions
  useEffect(() => {
    if (isWaitingForTtsCompletion) {
      console.log('Status: Waiting for TTS completion before session end', {
        currentSentence,
        isPlaying,
        isTtsActive,
        isWaitingForTtsCompletion
      });
    }
  }, [isWaitingForTtsCompletion, currentSentence, isPlaying, isTtsActive]);

  const speak = useCallback((text: string, sentenceIndex: number) => {
    if (!text.trim()) return;

    console.log(`Speaking sentence ${sentenceIndex}: ${text.substring(0, 50)}...`);

    // Cancel any existing speech
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    // Create new utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speechRate;
    utterance.volume = volume;

    // Use cached voice or select best English voice (only once)
    if (!selectedVoiceRef.current) {
      const voices = window.speechSynthesis.getVoices();
      console.log('Selecting voice (first time only):', voices.length, 'voices available');

      // Select best English voice
      const preferredVoices = [
        'Samantha (en-US)',
        'Alex (en-US)', 
        'Victoria (en-US)',
        'Daniel (English (United Kingdom)) (en-GB)',
        'Karen (en-AU)'
      ];

      let selectedVoice = null;
      for (const preferred of preferredVoices) {
        selectedVoice = voices.find(voice => `${voice.name} (${voice.lang})` === preferred);
        if (selectedVoice) break;
      }

      // Fallback to any English voice
      if (!selectedVoice) {
        selectedVoice = voices.find(voice => 
          voice.lang.startsWith('en') && 
          !voice.name.toLowerCase().includes('german') &&
          !voice.name.toLowerCase().includes('deutsch')
        );
      }

      if (selectedVoice) {
        selectedVoiceRef.current = selectedVoice;
        console.log('Selected and cached voice:', `${selectedVoice.name} (${selectedVoice.lang})`);
      } else {
        console.warn('No suitable English voice found, using default');
      }
    }

    // Use cached voice
    if (selectedVoiceRef.current) {
      utterance.voice = selectedVoiceRef.current;
    }

    // Set up event handlers
    utterance.onstart = () => {
      console.log(`Started speaking sentence ${sentenceIndex}`);
      setIsPlaying(true);
      setIsLoading(false);
      startTimer();
    };

    utterance.onend = () => {
      console.log(`Finished speaking sentence ${sentenceIndex}`);
      setIsPlaying(false);
      setIsLoading(false);
      utteranceRef.current = null;
      
      // Check if we were waiting for TTS to complete before ending session
      if (isWaitingForTtsRef.current) {
        console.log('TTS completed, now ending session gracefully');
        setIsWaitingForTtsCompletion(false);
        isWaitingForTtsRef.current = false;
        setShouldEndSession(true);
        return;
      }
      
      // Don't auto-advance if session has ended
      if (sessionEnded) {
        console.log('Session ended, not auto-advancing');
        return;
      }
      
      // Normal auto-advance logic - only if still auto-advancing and not at end
      if (isAutoAdvancing && sentenceIndex < sentences.length - 1) {
        console.log(`Auto-advancing from sentence ${sentenceIndex} to ${sentenceIndex + 1}`);
        setCurrentSentence(sentenceIndex + 1);
      } else if (sentenceIndex >= sentences.length - 1) {
        console.log('Reached end of chapter, stopping auto-advance');
        setIsAutoAdvancing(false);
        stopTimer();
        toast({
          title: "Chapter complete!",
          description: "You've finished reading this chapter.",
        });
      }
    };

    utterance.onerror = (event) => {
      console.log('Speech synthesis error:', event);
      setIsPlaying(false);
      setIsLoading(false);
      utteranceRef.current = null;
      
      // If we were waiting for completion, proceed with session end
      if (isWaitingForTtsRef.current) {
        console.log('TTS error during graceful completion, proceeding with session end');
        setIsWaitingForTtsCompletion(false);
        isWaitingForTtsRef.current = false;
        setShouldEndSession(true);
      }
    };

    // Start speaking
    setIsLoading(true);
    window.speechSynthesis.speak(utterance);
    utteranceRef.current = utterance;
  }, [speechRate, volume, startTimer, stopTimer, toast, isAutoAdvancing, sentences.length, sessionEnded]);

  // Auto-advance effect - triggers when currentSentence changes during auto-advancing
  useEffect(() => {
    console.log(`useEffect triggered. isAutoAdvancing: ${isAutoAdvancing} isPlaying: ${isPlaying} isLoading: ${isLoading} currentSentence: ${currentSentence} sessionEnded: ${sessionEnded}`);
    
    // Don't start TTS if session has ended
    if (sessionEnded) {
      console.log('Session ended, not starting TTS');
      return;
    }
    
    // Only speak if we're auto-advancing, not already playing/loading, and have sentences
    if (isAutoAdvancing && !isPlaying && !isLoading && sentences.length > 0 && currentSentence < sentences.length) {
      const sentence = sentences[currentSentence];
      if (sentence) {
        console.log(`Will speak sentence: ${currentSentence} text: ${sentence.substring(0, 50)}...`);
        speak(sentence, currentSentence);
      }
    }
  }, [currentSentence, isAutoAdvancing, isPlaying, isLoading, sentences, speak, sessionEnded]);

  const handlePlay = () => {
    console.log('handlePlay called');
    
    // Don't start if session has ended
    if (sessionEnded) {
      console.log('Session ended, not starting play');
      return;
    }
    
    if (sentences.length > 0) {
      setIsAutoAdvancing(true);
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

  // Cleanup effect - only cancel TTS if not waiting for graceful completion
  useEffect(() => {
    return () => {
      console.log('ReadAlongInterface unmounting');
      
      // Only cancel TTS if we're not waiting for graceful completion
      if ('speechSynthesis' in window && !isWaitingForTtsRef.current) {
        console.log('Canceling TTS on unmount');
        window.speechSynthesis.cancel();
      }
      
      // Always stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []); // Empty dependency array - this only runs on unmount

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
                    setRemainingTime(10);
                    setSessionTime(10);
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