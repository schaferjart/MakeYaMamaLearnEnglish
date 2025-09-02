import { useState, useEffect, useRef, useCallback } from 'react';
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
  Loader2
} from 'lucide-react';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useToast } from '@/hooks/use-toast';

interface ReadAlongInterfaceProps {
  text: string;
  bookTitle: string;
  onClose?: () => void;
}

export function ReadAlongInterface({ text, bookTitle, onClose }: ReadAlongInterfaceProps) {
  const [currentSentence, setCurrentSentence] = useState(0);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [volume, setVolume] = useState(0.8);
  const [sessionTime, setSessionTime] = useState(1500); // 25 minutes default
  const [remainingTime, setRemainingTime] = useState(1500);
  const [isTimerActive, setIsTimerActive] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Split text into sentences
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const currentText = sentences[currentSentence]?.trim() || '';

  const { 
    speak, 
    stop, 
    pause, 
    resume, 
    isLoading, 
    isPlaying 
  } = useTextToSpeech({
    voice: 'Aria',
    onStart: () => {
      if (!isTimerActive && remainingTime > 0) {
        startTimer();
      }
    },
    onEnd: () => {
      // Auto-advance to next sentence
      if (currentSentence < sentences.length - 1) {
        setTimeout(() => {
          setCurrentSentence(prev => prev + 1);
          handleNextSentence(currentSentence + 1);
        }, 800);
      } else {
        // Finished reading all sentences
        stopTimer();
        toast({
          title: "Reading complete!",
          description: "You've finished reading the entire text.",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Speech error",
        description: "There was an issue with text-to-speech. Please try again.",
        variant: "destructive",
      });
    }
  });

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
          stop();
          toast({
            title: "Reading session complete!",
            description: "Great job on completing your reading session.",
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [stop, toast]);

  const stopTimer = useCallback(() => {
    setIsTimerActive(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
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
              {onClose && (
                <Button variant="ghost" onClick={onClose}>
                  <Settings className="w-4 h-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="reading-text max-h-96 overflow-y-auto bg-reading-focus p-6 rounded-lg border border-border">
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

          {/* Back Button */}
          {onClose && (
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={onClose}
              size="lg"
            >
              Back to Reader
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}