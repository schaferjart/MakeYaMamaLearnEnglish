import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Book, Clock, BookOpen } from "lucide-react";
import { t } from "@/lib/i18n";
import { DetailedProgress } from "@/lib/types";

interface BookCardProps {
  id: string;
  title: string;
  author: string;
  year?: number;
  coverUrl?: string;
  progress?: number;
  wordsLearned?: number;
  detailedProgress?: DetailedProgress;
  onStartReading: (id: string) => void;
}

const formatProgress = (progress: DetailedProgress) => {
  const parts = [`${progress.percentage}%`];
  if (progress.currentPart) {
    parts.push(progress.currentPart);
  }
  if (progress.currentChapter) {
    parts.push(progress.currentChapter);
  }
  parts.push(`Sentence ${progress.currentSentence}/${progress.totalSentences}`);
  return parts.join(', ');
};

export const BookCard = ({
  id,
  title,
  author,
  year,
  coverUrl,
  progress = 0,
  wordsLearned = 0,
  detailedProgress,
  onStartReading
}: BookCardProps) => {
  const isStarted = progress > 0;

  return (
    <Card className="group h-full transition-all duration-300 hover:shadow-[var(--shadow-reader)] hover:-translate-y-1">
      <CardContent className="p-4">
        <div className="aspect-[3/4] mb-4 relative overflow-hidden rounded-lg bg-muted flex items-center justify-center">
          {coverUrl ? (
            <img 
              src={coverUrl} 
              alt={`Cover of ${title}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                console.log(`Failed to load cover for "${title}": ${coverUrl}`);
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <Book className={`w-16 h-16 text-muted-foreground ${coverUrl ? 'hidden' : ''}`} />
          
          {isStarted && (
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="text-xs bg-success/90 text-success-foreground">
                {Math.round(progress)}%
              </Badge>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-xs text-muted-foreground">
            {author} {year && `(${year})`}
          </p>
          
          {isStarted && (
            <div className="space-y-2">
              <Progress value={progress} className="h-1.5" />
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  {detailedProgress ? (
                    <span title={formatProgress(detailedProgress)}>{formatProgress(detailedProgress)}</span>
                  ) : (
                    <span>{t('library.progress', { percent: Math.round(progress) })}</span>
                  )}
                </div>
                {wordsLearned > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-accent"></span>
                    <span>{t('library.wordsLearned', { count: wordsLearned })}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button 
          variant={isStarted ? "default" : "secondary"}
          size="sm" 
          className="w-full"
          onClick={() => onStartReading(id)}
        >
          {isStarted ? t('library.continue') : t('library.start')}
        </Button>
      </CardFooter>
    </Card>
  );
};