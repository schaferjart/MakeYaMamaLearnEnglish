import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Brain, BarChart3, Target, RefreshCw, Settings } from "lucide-react";

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
        <CardTitle>Quick Actions</CardTitle>
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
              Continue Reading
            </Button>
          )}

          {onViewLibrary && (
            <Button 
              onClick={onViewLibrary}
              variant="outline"
              className="justify-start gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Browse Library
            </Button>
          )}

          {onViewVocabulary && (
            <Button 
              onClick={onViewVocabulary}
              variant="outline"
              className="justify-start gap-2"
            >
              <Brain className="w-4 h-4" />
              Review Vocabulary
            </Button>
          )}

          {onViewStats && (
            <Button 
              onClick={onViewStats}
              variant="outline"
              className="justify-start gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              View Statistics
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
              {syncing ? 'Syncing...' : 'Sync Books'}
            </Button>
          )}

          {onSettings && (
            <Button 
              onClick={onSettings}
              variant="outline"
              className="justify-start gap-2"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};