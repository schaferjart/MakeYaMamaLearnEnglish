import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Brain, BarChart3, Target, RefreshCw, Settings } from "lucide-react";
import { t } from "@/lib/i18n";

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
  return (
    <Card>
      <CardHeader>
  <CardTitle>{t('dashboard.quick.title')}</CardTitle>
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
              {t('dashboard.quick.continue')}
            </Button>
          )}

          {onViewLibrary && (
            <Button 
              onClick={onViewLibrary}
              variant="outline"
              className="justify-start gap-2"
            >
              <BookOpen className="w-4 h-4" />
              {t('dashboard.quick.browseLibrary')}
            </Button>
          )}

          {onViewVocabulary && (
            <Button 
              onClick={onViewVocabulary}
              variant="outline"
              className="justify-start gap-2"
            >
              <Brain className="w-4 h-4" />
              {t('dashboard.quick.reviewVocabulary')}
            </Button>
          )}

          {onViewStats && (
            <Button 
              onClick={onViewStats}
              variant="outline"
              className="justify-start gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              {t('dashboard.quick.viewStatistics')}
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
              {syncing ? t('dashboard.quick.syncing') : t('dashboard.quick.syncBooks')}
            </Button>
          )}

          {onSettings && (
            <Button 
              onClick={onSettings}
              variant="outline"
              className="justify-start gap-2"
            >
              <Settings className="w-4 h-4" />
              {t('dashboard.quick.settings')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};