import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Zap, Target, TrendingUp } from "lucide-react";
import { t } from "@/lib/i18n";

interface ReadingProgress {
  progressPercentage: number;
  currentPosition: number;
  totalLength?: number;
  wordsRead: number;
  readingSpeedWpm: number;
  timeSpentSeconds: number;
  lastReadAt: string;
}

interface ReadingProgressBarProps {
  progress: ReadingProgress;
  bookTitle: string;
  isTracking?: boolean;
}

export const ReadingProgressBar = ({ 
  progress, 
  bookTitle, 
  isTracking = false 
}: ReadingProgressBarProps) => {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const estimatedTimeRemaining = () => {
  if (!progress.totalLength || progress.readingSpeedWpm === 0) return t('reading.progress.calculating');
    
    const wordsRemaining = progress.totalLength - progress.currentPosition;
    const minutesRemaining = wordsRemaining / progress.readingSpeedWpm;
    
  if (minutesRemaining < 1) return t('reading.progress.lessThanMinute');
  if (minutesRemaining < 60) return t('reading.progress.minutes', { count: Math.round(minutesRemaining) });
    
    const hoursRemaining = minutesRemaining / 60;
    if (hoursRemaining < 24) {
  return t('reading.progress.hours', { count: Math.round(hoursRemaining * 10) / 10 });
    }
    
    const daysRemaining = hoursRemaining / 24;
  return t('reading.progress.days', { count: Math.round(daysRemaining * 10) / 10 });
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            {t('reading.progress.title')}
          </div>
          {isTracking && (
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse mr-1"></div>
              {t('reading.progress.tracking')}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Main Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">
              {t('reading.progress.completePercent', { percent: Math.round(progress.progressPercentage) })}
            </span>
            <span className="text-xs text-muted-foreground">
              {t('reading.progress.words', { current: formatNumber(progress.currentPosition), total: formatNumber(progress.totalLength || 0) })}
            </span>
          </div>
          <Progress 
            value={progress.progressPercentage} 
            className="h-2"
          />
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          {/* Reading Time */}
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <Clock className="w-4 h-4 text-blue-500" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">{t('reading.progress.timeRead')}</p>
              <p className="text-sm font-medium truncate">
                {formatTime(progress.timeSpentSeconds)}
              </p>
            </div>
          </div>

          {/* Reading Speed */}
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <Zap className="w-4 h-4 text-yellow-500" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">{t('reading.progress.speed')}</p>
              <p className="text-sm font-medium truncate">
                {progress.readingSpeedWpm} WPM
              </p>
            </div>
          </div>

          {/* Words Read */}
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">{t('reading.progress.wordsRead')}</p>
              <p className="text-sm font-medium truncate">
                {formatNumber(progress.wordsRead)}
              </p>
            </div>
          </div>

          {/* Estimated Time Remaining */}
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <Target className="w-4 h-4 text-purple-500" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">{t('reading.progress.timeLeft')}</p>
              <p className="text-sm font-medium truncate">
                {estimatedTimeRemaining()}
              </p>
            </div>
          </div>
        </div>

        {/* Achievement Badges */}
        {progress.progressPercentage >= 25 && (
          <div className="flex flex-wrap gap-1 pt-2">
            {progress.progressPercentage >= 25 && (
              <Badge variant="outline" className="text-xs bg-green-50 border-green-200">
                {t('reading.progress.badge.quarter')}
              </Badge>
            )}
            {progress.progressPercentage >= 50 && (
              <Badge variant="outline" className="text-xs bg-blue-50 border-blue-200">
                {t('reading.progress.badge.half')}
              </Badge>
            )}
            {progress.progressPercentage >= 75 && (
              <Badge variant="outline" className="text-xs bg-purple-50 border-purple-200">
                {t('reading.progress.badge.almost')}
              </Badge>
            )}
            {progress.progressPercentage >= 100 && (
              <Badge variant="outline" className="text-xs bg-yellow-50 border-yellow-200">
                {t('reading.progress.badge.done')}
              </Badge>
            )}
          </div>
        )}

        {/* Last Read */}
        {progress.lastReadAt && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              {t('reading.progress.lastRead', { date: new Date(progress.lastReadAt).toLocaleDateString(), time: new Date(progress.lastReadAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};