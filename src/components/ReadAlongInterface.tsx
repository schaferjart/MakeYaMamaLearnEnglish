// ReadAlongInterface.tsx (Refactored to handle HTML content)
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Play, Pause, Square, SkipBack, SkipForward, Volume2,
  ChevronLeft, ChevronRight, Loader2, Timer, BookOpen
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useReadingProgress } from '@/hooks/useReadingProgress';
import { useLocalStorageResume } from '@/hooks/useLocalStorageResume';
import { useAuth } from '@/hooks/useAuth';
import { EpubChapter } from '@/hooks/useEpub';
import { VocabularyPanel } from '@/components/VocabularyPanel';
import { useTranslation } from '@/hooks/useTranslation';

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
  resumeData?: ResumeData | null;
  isReturningFromConversation?: boolean;
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
  const { t } = useTranslation();
  const [selectedText, setSelectedText] = useState("");
  const [showVocabulary, setShowVocabulary] = useState(false);
  const [currentSentence, setCurrentSentence] = useState(0);
  const [sentences, setSentences] = useState<string[]>([]);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [volume, setVolume] = useState(0.8);
  const [sessionTime, setSessionTime] = useState(300);
  const [remainingTime, setRemainingTime] = useState(300);
  const [shouldEndSession, setShouldEndSession] = useState(false);
  const [isWaitingForTtsCompletion, setIsWaitingForTtsCompletion] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isAutoAdvancing, setIsAutoAdvancing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isWaitingForTtsRef = useRef(false);
  const selectedVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const readingContainerRef = useRef<HTMLDivElement>(null);

  const isTtsActive = isPlaying && utteranceRef.current !== null;

  const { saveResumeData } = useLocalStorageResume(bookId, user?.id || '');
  const lastSavedSentence = useRef<number>(-1);

  const currentText = sentences[currentSentence]?.trim() || '';

  // Effect to process HTML content and create sentence spans
  useEffect(() => {
    if (!content || !readingContainerRef.current) return;

    const container = readingContainerRef.current;
    // Sanitize content before setting it. A more robust solution would use a library like DOMPurify.
    container.innerHTML = content;

    const newSentences: string[] = [];
    let sentenceIndex = 0;

    const textNodes: Node[] = [];
    const walk = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);
    let node;
    while(node = walk.nextNode()) {
        textNodes.push(node);
    }

    textNodes.forEach(textNode => {
        if (!textNode.textContent?.trim()) return;

        const text = textNode.textContent;
        // Improved sentence splitting regex. It's not perfect but better.
        const sentenceEndRegex = /([.!?])\s+/g;
        const parts = text.split(sentenceEndRegex);
        const fragments: Node[] = [];

        for (let i = 0; i < parts.length; i += 2) {
            let sentence = parts[i];
            const terminator = parts[i + 1] || '';
            if (sentence.trim()) {
                const fullSentence = (sentence + terminator).trim();
                newSentences.push(fullSentence);

                const span = document.createElement('span');
                span.textContent = fullSentence + ' '; // Add space back
                span.className = 'cursor-pointer transition-all duration-300 hover:bg-muted/50 px-1 rounded';
                span.dataset.sentenceIndex = String(sentenceIndex);
                fragments.push(span);
                sentenceIndex++;
            }
        }

        if (fragments.length > 0 && textNode.parentNode) {
            // Replace the original text node with the new sentence spans
            fragments.forEach(fragment => {
              textNode.parentNode!.insertBefore(fragment, textNode);
            });
            textNode.parentNode.removeChild(textNode);
        }
    });

    setSentences(newSentences);
    setCurrentSentence(0); // Reset on new content

  }, [content]);

  // Effect to highlight the current sentence
  useEffect(() => {
    if (!readingContainerRef.current) return;

    const container = readingContainerRef.current;
    const spans = container.querySelectorAll<HTMLSpanElement>('[data-sentence-index]');

    spans.forEach(span => {
      const index = parseInt(span.dataset.sentenceIndex || '-1', 10);
      if (index === currentSentence) {
        span.classList.add('bg-audio-sync', 'text-foreground', 'font-semibold');
        span.classList.remove('text-muted-foreground', 'hover:bg-muted/50');
        span.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (index < currentSentence) {
        span.classList.add('text-muted-foreground');
        span.classList.remove('bg-audio-sync', 'text-foreground', 'font-semibold', 'hover:bg-muted/50');
      } else {
        span.classList.remove('bg-audio-sync', 'text-foreground', 'font-semibold', 'text-muted-foreground');
        span.classList.add('hover:bg-muted/50');
      }
    });
  }, [currentSentence, sentences]);


  const handleSentenceClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    const span = target.closest<HTMLSpanElement>('[data-sentence-index]');
    if (span) {
      const index = parseInt(span.dataset.sentenceIndex || '-1', 10);
      if (index >= 0) {
        setCurrentSentence(index);
        if (isAutoAdvancing && sentences[index]?.trim()) {
          speak(sentences[index].trim(), index);
        }
      }
    }
  };

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

  const { isTracking, startTracking, stopTracking, updatePosition } = useReadingProgress({
    bookId,
    sessionId,
    content,
    onProgressUpdate
  });

  useEffect(() => {
    startTracking();
    return () => {
      stopTracking();
    };
  }, [startTracking, stopTracking]);

  const cumulativeWordCounts = React.useMemo(() => {
    let count = 0;
    return sentences.map(sentence => {
      count += sentence.split(/\s+/).filter(Boolean).length;
      return count;
    });
  }, [sentences]);

  useEffect(() => {
    if (isTracking && cumulativeWordCounts.length > 0) {
      setTimeout(() => {
        const wordsRead = cumulativeWordCounts[currentSentence] || 0;
        const totalWords = cumulativeWordCounts[cumulativeWordCounts.length - 1] || 0;
        const percentage = totalWords > 0 ? (wordsRead / totalWords) * 100 : 0;
        updatePosition(wordsRead, percentage);
      }, 0);
    }
  }, [currentSentence, isTracking, updatePosition, cumulativeWordCounts]);

  useEffect(() => {
    if (currentChapter?.id && currentSentence > 0 && isTracking && currentSentence !== lastSavedSentence.current) {
      const timeoutId = setTimeout(() => {
        saveResumeData(currentChapter.id, currentSentence);
        lastSavedSentence.current = currentSentence;
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [currentSentence, currentChapter?.id, isTracking, saveResumeData]);

  useEffect(() => {
    if (resumeData?.sentenceIndex >= 0 && sentences.length > 0 && currentSentence === 0) {
      let resumeSentence = isReturningFromConversation
        ? Math.min(resumeData.sentenceIndex + 1, sentences.length - 1)
        : Math.min(resumeData.sentenceIndex, sentences.length - 1);
      
      setCurrentSentence(resumeSentence);
    }
  }, [resumeData?.sentenceIndex, sentences.length, currentChapter?.id, isReturningFromConversation]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsTimerActive(true);
    timerRef.current = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsTimerActive(false);
  }, []);

  useEffect(() => {
    if (remainingTime <= 0 && isTimerActive) {
      stopTimer();
      setSessionEnded(true);
      if (isTtsActive) {
        setIsWaitingForTtsCompletion(true);
        isWaitingForTtsRef.current = true;
      } else {
        setShouldEndSession(true);
      }
    }
  }, [remainingTime, isTimerActive, isTtsActive, stopTimer]);

  useEffect(() => {
    if (shouldEndSession) {
      toast({
        title: "Reading session ended",
        description: isWaitingForTtsCompletion ? "Session completed after current sentence finished" : "Session time expired",
        duration: 3000,
      });
      setTimeout(() => onSessionEnd?.(), 1500);
      setShouldEndSession(false);
      setIsWaitingForTtsCompletion(false);
      isWaitingForTtsRef.current = false;
    }
  }, [shouldEndSession, isWaitingForTtsCompletion, toast, onSessionEnd]);

  const speak = useCallback((text: string, sentenceIndex: number) => {
    if (!text.trim()) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speechRate;
    utterance.volume = volume;

    if (!selectedVoiceRef.current) {
        const voices = window.speechSynthesis.getVoices();
        const preferredVoices = ['Samantha (en-US)', 'Alex (en-US)', 'Victoria (en-US)', 'Daniel (en-GB)', 'Karen (en-AU)'];
        let selected = voices.find(v => preferredVoices.includes(`${v.name} (${v.lang})`));
        if (!selected) selected = voices.find(v => v.lang.startsWith('en'));
        selectedVoiceRef.current = selected;
    }
    if (selectedVoiceRef.current) utterance.voice = selectedVoiceRef.current;

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsLoading(false);
      startTimer();
    };

    utterance.onend = () => {
      setIsPlaying(false);
      utteranceRef.current = null;
      if (isWaitingForTtsRef.current) {
        setIsWaitingForTtsCompletion(false);
        isWaitingForTtsRef.current = false;
        setShouldEndSession(true);
        return;
      }
      if (sessionEnded) return;
      
      if (isAutoAdvancing && sentenceIndex < sentences.length - 1) {
        setCurrentSentence(sentenceIndex + 1);
      } else if (sentenceIndex >= sentences.length - 1) {
        setIsAutoAdvancing(false);
        stopTimer();
        toast({ title: "Chapter complete!" });
      }
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      utteranceRef.current = null;
      if (isWaitingForTtsRef.current) {
        setIsWaitingForTtsCompletion(false);
        isWaitingForTtsRef.current = false;
        setShouldEndSession(true);
      }
    };

    setIsLoading(true);
    window.speechSynthesis.speak(utterance);
    utteranceRef.current = utterance;
  }, [speechRate, volume, startTimer, stopTimer, toast, isAutoAdvancing, sentences.length, sessionEnded]);

  useEffect(() => {
    if (sessionEnded) return;
    if (isAutoAdvancing && !isPlaying && !isLoading && sentences.length > 0 && currentSentence < sentences.length) {
      speak(sentences[currentSentence], currentSentence);
    }
  }, [currentSentence, isAutoAdvancing, isPlaying, isLoading, sentences, speak, sessionEnded]);

  const handlePlay = () => {
    if (sessionEnded || sentences.length === 0) return;
    setIsAutoAdvancing(true);
  };

  const handlePause = () => {
    setIsAutoAdvancing(false);
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
    }
    setIsPlaying(false);
    stopTimer();
  };

  const handleResume = () => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
      setIsAutoAdvancing(true);
      if (!isTimerActive) startTimer();
    }
  };

  const handleStop = () => {
    setIsAutoAdvancing(false);
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsLoading(false);
    setCurrentSentence(0);
    stopTimer();
  };

  const handlePrevious = () => {
    const newIndex = Math.max(0, currentSentence - 1);
    setCurrentSentence(newIndex);
    if (isAutoAdvancing) speak(sentences[newIndex], newIndex);
  };

  const handleNext = () => {
    const newIndex = Math.min(sentences.length - 1, currentSentence + 1);
    setCurrentSentence(newIndex);
    if (isAutoAdvancing) speak(sentences[newIndex], newIndex);
  };

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window && !isWaitingForTtsRef.current) {
        window.speechSynthesis.cancel();
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

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
              <div className="flex items-center justify-between border-b border-border py-3 mb-4">
                <Button variant="outline" size="sm" onClick={onPreviousChapter} disabled={!canGoPrevious}>
                  <ChevronLeft className="h-4 w-4 mr-2" /> {t('previous')}
                </Button>
                {currentChapter && <span className="text-sm text-muted-foreground text-center px-2 truncate">{currentChapter.label}</span>}
                <Button variant="outline" size="sm" onClick={onNextChapter} disabled={!canGoNext}>
                  {t('next')} <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>

              <div
                ref={readingContainerRef}
                className="reading-text max-h-[60vh] overflow-y-auto bg-reading-focus p-6 rounded-lg border border-border prose dark:prose-invert"
                onMouseUp={handleTextSelection}
                onClick={handleSentenceClick}
                style={{ lineHeight: '1.8' }}
              />
              
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{t('reader.progress.title')}</span>
                  <span>{Math.round(readingProgress)}%</span>
                </div>
                <Progress value={readingProgress} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls Panel */}
        <div className="space-y-4">
          <Card className="shadow-md border-border">
            <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-lg"><Timer className="w-5 h-5 text-primary" />{t('reader.sessionTimer.title')}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className={`text-3xl font-bold ${remainingTime < 300 ? 'text-destructive' : 'text-primary'}`}>{formatTime(remainingTime)}</div>
                <p className="text-sm text-muted-foreground">{t('reader.sessionTimer.remaining')}</p>
              </div>
              <Progress value={progressPercentage} className="h-3" />
              <div className="grid grid-cols-3 gap-2">
                {[1, 5, 10, 15, 25, 60].map(m => (
                  <Button key={m} variant="outline" size="sm" onClick={() => { setRemainingTime(m * 60); setSessionTime(m * 60); }} disabled={isTimerActive}>
                    {m}m
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md border-border">
            <CardHeader className="pb-3"><CardTitle className="text-lg">{t('reader.playback.title')}</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center gap-2">
                <Button variant="outline" size="icon" onClick={handlePrevious}><SkipBack className="w-4 h-4" /></Button>
                {isPlaying ? (
                  <Button variant="default" size="icon" onClick={handlePause}><Pause className="w-5 h-5" /></Button>
                ) : window.speechSynthesis?.paused ? (
                  <Button variant="default" size="icon" onClick={handleResume} disabled={isLoading}>{isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-5 h-5" />}</Button>
                ) : (
                  <Button variant="default" size="icon" onClick={handlePlay} disabled={isLoading || !currentText}>{isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-5 h-5" />}</Button>
                )}
                <Button variant="outline" size="icon" onClick={handleStop}><Square className="w-4 h-4" /></Button>
                <Button variant="outline" size="icon" onClick={handleNext}><SkipForward className="w-4 h-4" /></Button>
              </div>
              {isPlaying && (
                <div className="text-center p-3 bg-audio-sync/20 rounded-lg border border-audio-sync/30">
                  <p className="text-xs text-muted-foreground">{t('reader.sentenceProgress', { current: currentSentence + 1, total: sentences.length })}</p>
                </div>
              )}
              <div className="space-y-2">
                <div className="flex justify-between items-center"><label className="text-sm font-medium">{t('reader.speed')}</label><span className="text-sm text-muted-foreground">{speechRate}x</span></div>
                <Slider value={[speechRate]} onValueChange={(v) => setSpeechRate(v[0])} min={0.5} max={2.0} step={0.1} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center"><div className="flex items-center gap-1"><Volume2 className="w-4 h-4" /><label className="text-sm font-medium">{t('reader.playback.volume')}</label></div><span className="text-sm text-muted-foreground">{Math.round(volume * 100)}%</span></div>
                <Slider value={[volume]} onValueChange={(v) => setVolume(v[0])} min={0} max={1} step={0.1} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {showVocabulary && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <VocabularyPanel selectedText={selectedText} bookId={bookId} onClose={handleCloseVocabulary} />
        </div>
      )}
    </div>
  );
}