import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Square, Clock, BookOpen, MessageCircle, Volume2, VolumeX, Loader2 } from "lucide-react";
import { t } from "@/lib/i18n";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { ReadingProgressBar } from "./ReadingProgressBar";

interface ReadingSessionProps {
  bookTitle: string;
  onSessionEnd?: () => void;
  onStartConversation?: () => void;
  readingProgress?: any;
}

export const ReadingSession = ({ 
  bookTitle, 
  onSessionEnd, 
  onStartConversation,
  readingProgress
}: ReadingSessionProps) => {
  const [sessionDuration, setSessionDuration] = useState([15]); // minutes
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(1); // seconds (testing)
  
  // Sample reading text for TTS demo
  const [sampleText] = useState("Welcome to your reading session. This text-to-speech feature will help you listen to the content as you read along. You can pause, resume, or stop the audio at any time during your session.");

  // Text-to-speech integration
  const { 
    speak, 
    stop: stopTTS, 
    pause: pauseTTS, 
    resume: resumeTTS, 
    isLoading: ttsLoading, 
    isPlaying: ttsPlaying 
  } = useTextToSpeech({
    voice: 'Aria',
    onEnd: () => console.log('TTS reading completed'),
    fallbackToWebSpeech: false,
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsActive(false);
            stopTTS();
            try {
              const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
              const o = ctx.createOscillator();
              const g = ctx.createGain();
              o.type = 'sine';
              o.frequency.setValueAtTime(880, ctx.currentTime);
              g.gain.setValueAtTime(0.001, ctx.currentTime);
              o.connect(g);
              g.connect(ctx.destination);
              g.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.01);
              o.start();
              o.stop(ctx.currentTime + 0.15);
            } catch {}
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, timeRemaining, stopTTS]);

  // Handle timer completion separately to avoid setState during render
  useEffect(() => {
    if (!isActive && timeRemaining === 0) {
      onStartConversation?.();
    }
  }, [isActive, timeRemaining, onStartConversation]);

  const startSession = () => {
    setTimeRemaining(10);
    setIsActive(true);
  };

  const pauseSession = () => {
    setIsActive(false);
    if (ttsPlaying) {
      pauseTTS();
    }
  };

  const resumeSession = () => {
    setIsActive(true);
    if (ttsPlaying) {
      resumeTTS();
    }
  };

  const endSession = () => {
    setIsActive(false);
    if (ttsPlaying) {
      stopTTS();
    }
    setTimeRemaining(10);
    onSessionEnd?.();
  };

  const toggleTTS = () => {
    if (ttsPlaying) {
      stopTTS();
    } else {
      speak(sampleText);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = ((sessionDuration[0] * 60 - timeRemaining) / (sessionDuration[0] * 60)) * 100;
  const isWarning = timeRemaining <= 60 && timeRemaining > 0; // Last minute

  return (
    <div className="space-y-6">
      {/* Session Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            {bookTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isActive && timeRemaining === sessionDuration[0] * 60 ? (
            // Session Setup
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t('session.timer')}: {sessionDuration[0]} {t('session.minutes')}
                </label>
                <Slider
                  value={sessionDuration}
                  onValueChange={setSessionDuration}
                  max={60}
                  min={5}
                  step={5}
                  className="w-full"
                />
              </div>
              <Button onClick={startSession} className="w-full">
                <Clock className="w-4 h-4 mr-2" />
                {t('session.start')}
              </Button>
            </div>
          ) : (
            // Active Session
            <div className="space-y-4">
              <div className="text-center">
                <div className={`text-3xl font-bold mb-2 ${isWarning ? 'text-accent animate-pulse' : 'text-foreground'}`}>
                  {formatTime(timeRemaining)}
                </div>
                <Progress 
                  value={progressPercent} 
                  className={`h-2 ${isWarning ? 'bg-timer-warning' : ''}`}
                />
                <p className="text-sm text-muted-foreground mt-2">
                  {isActive ? t('session.timeRemaining', { time: formatTime(timeRemaining) }) : t('session.timeUp')}
                </p>
              </div>

              <div className="flex gap-2">
                {isActive ? (
                  <Button onClick={pauseSession} variant="secondary" className="flex-1">
                    <Pause className="w-4 h-4 mr-2" />
                    {t('session.pause')}
                  </Button>
                ) : timeRemaining > 0 ? (
                  <Button onClick={resumeSession} className="flex-1">
                    <Play className="w-4 h-4 mr-2" />
                    {t('session.resume')}
                  </Button>
                ) : (
                  <Button onClick={onStartConversation} className="flex-1">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {t('tutor.start')}
                  </Button>
                )}
                
                <Button onClick={endSession} variant="outline">
                  <Square className="w-4 h-4" />
                </Button>
              </div>

              {timeRemaining === 0 && (
                <div className="text-center p-4 bg-success/10 rounded-lg border border-success/20">
                  <Badge variant="secondary" className="bg-success text-success-foreground">
                    {t('session.timeUp')}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-2">
                    Zeit für ein kurzes Gespräch über das Gelesene!
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Text-to-Speech Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Text-to-Speech</span>
            <div className="flex gap-2">
              <Button 
                variant={ttsPlaying ? "default" : "secondary"} 
                size="sm"
                onClick={toggleTTS}
                disabled={ttsLoading}
              >
                {ttsLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : ttsPlaying ? (
                  <>
                    <VolumeX className="w-4 h-4 mr-2" />
                    Stop Reading
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 mr-2" />
                    Start Reading
                  </>
                )}
              </Button>
              {ttsPlaying && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={pauseTTS}
                >
                  <Pause className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
          
          {ttsPlaying && (
            <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
              Reading aloud with ElevenLabs AI voice
            </div>
          )}
          
          {ttsLoading && (
            <div className="mt-2 text-xs text-muted-foreground">
              Generating audio with ElevenLabs...
            </div>
          )}
          
          <div className="mt-3 p-2 bg-muted/50 rounded text-xs italic">
            "{sampleText.substring(0, 100)}..."
          </div>
        </CardContent>
      </Card>

      {/* Reading Progress */}
      {readingProgress && (
        <ReadingProgressBar
          progress={readingProgress}
          bookTitle={bookTitle}
          isTracking={true}
        />
      )}
    </div>
  );
};