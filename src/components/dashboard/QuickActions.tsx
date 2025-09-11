import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Brain, BarChart3, Target, RefreshCw, Settings } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface QuickActionsProps {
  onContinueReading?: () => void;
  onViewLibrary?: () => void;
  onViewVocabulary?: () => void;
  onSyncBooks?: () => void;
  onViewStats?: () => void;
  onSettings?: () => void;
  syncing?: boolean;
}

export const QuickActions = ({
  onContinueReading,
  onViewLibrary,
  onViewVocabulary,
  onSyncBooks,
  onViewStats,
  onSettings,
  syncing = false
}: QuickActionsProps) => {
  const { t } = useTranslation();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('dashboard.quickActions.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2">
          {onContinueReading && (
            <Button 
              onClick={onContinueReading}
              className="justify-start gap-2"
              variant="default"
            >
              <BookOpen className="w-4 h-4" />
              {t('library.continue')}
            </Button>
          )}

          {onViewLibrary && (
            <Button 
              onClick={onViewLibrary}
              variant="outline"
              className="justify-start gap-2"
            >
              <BookOpen className="w-4 h-4" />
              {t('dashboard.quickActions.browseLibrary')}
            </Button>
          )}

          {onViewVocabulary && (
            <Button 
              onClick={onViewVocabulary}
              variant="outline"
              className="justify-start gap-2"
            >
              <Brain className="w-4 h-4" />
              {t('dashboard.quickActions.reviewVocabulary')}
            </Button>
          )}

          {onViewStats && (
            <Button 
              onClick={onViewStats}
              variant="outline"
              className="justify-start gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              {t('dashboard.quickActions.viewStatistics')}
            </Button>
          )}

          {onSyncBooks && (
            <Button 
              onClick={onSyncBooks}
              variant="outline"
              className="justify-start gap-2"
              disabled={syncing}
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? t('library.syncing') : t('library.syncBooks')}
            </Button>
          )}

          {onSettings && (
            <Button 
              onClick={onSettings}
              variant="outline"
              className="justify-start gap-2"
            >
              <Settings className="w-4 h-4" />
              {t('settings')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};