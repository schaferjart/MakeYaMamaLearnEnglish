import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Square, Clock, BookOpen, MessageCircle } from "lucide-react";
import { t } from "@/lib/i18n";

interface ReadingSessionProps {
  bookTitle: string;
  onSessionEnd?: () => void;
  onStartConversation?: () => void;
}

export const ReadingSession = ({ 
  bookTitle, 
  onSessionEnd, 
  onStartConversation 
}: ReadingSessionProps) => {
  const [sessionDuration, setSessionDuration] = useState([15]); // minutes
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(15 * 60); // seconds
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsActive(false);
            setIsPlaying(false);
            onStartConversation?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, timeRemaining, onStartConversation]);

  const startSession = () => {
    setTimeRemaining(sessionDuration[0] * 60);
    setIsActive(true);
  };

  const pauseSession = () => {
    setIsActive(false);
    setIsPlaying(false);
  };

  const resumeSession = () => {
    setIsActive(true);
  };

  const endSession = () => {
    setIsActive(false);
    setIsPlaying(false);
    setTimeRemaining(sessionDuration[0] * 60);
    onSessionEnd?.();
  };

  const toggleAudio = () => {
    setIsPlaying(!isPlaying);
    // In real app, this would control TTS
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

      {/* Audio Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Audio Wiedergabe</span>
            <div className="flex gap-2">
              <Button 
                variant={isPlaying ? "default" : "secondary"} 
                size="sm"
                onClick={toggleAudio}
                disabled={!isActive}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    {t('reader.pause')}
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    {t('reader.play')}
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {isPlaying && (
            <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
              Liest vor mit Hervorhebung der aktuellen Wörter
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};