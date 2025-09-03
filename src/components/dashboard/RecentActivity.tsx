import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Brain, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface ActivityItem {
  type: 'reading' | 'vocabulary' | 'session';
  bookTitle?: string;
  bookId?: string;
  wordsRead?: number;
  timeSpent?: number;
  vocabularyWord?: string;
  timestamp: string;
  progress?: number;
}

interface RecentActivityProps {
  onContinueReading?: (bookId: string) => void;
}

export const RecentActivity = ({ onContinueReading }: RecentActivityProps) => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRecentActivity();
    }
  }, [user]);

  const fetchRecentActivity = async () => {
    try {
      setLoading(true);
      const activities: ActivityItem[] = [];

      // Get recent reading progress
      const { data: progressData } = await supabase
        .from('reading_progress')
        .select('*')
        .eq('user_id', user?.id)
        .order('last_read_at', { ascending: false })
        .limit(5);

      // Get book titles for progress data
      if (progressData && progressData.length > 0) {
        const bookIds = progressData.map(p => p.book_id);
        const { data: booksData } = await supabase
          .from('books')
          .select('id, title')
          .in('id', bookIds);

        const bookMap = new Map(booksData?.map(book => [book.id, book.title]) || []);

        progressData.forEach(progress => {
          const bookTitle = bookMap.get(progress.book_id);
          if (bookTitle) {
            activities.push({
              type: 'reading',
              bookTitle,
              bookId: progress.book_id,
              wordsRead: progress.words_read,
              timeSpent: progress.time_spent_seconds,
              timestamp: progress.last_read_at,
              progress: progress.progress_percentage
            });
          }
        });
      }

      // Get recent vocabulary additions
      const { data: vocabData } = await supabase
        .from('vocabulary')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      // Get book titles for vocabulary data
      if (vocabData && vocabData.length > 0) {
        const vocabBookIds = vocabData.map(v => v.book_id).filter(Boolean);
        if (vocabBookIds.length > 0) {
          const { data: vocabBooksData } = await supabase
            .from('books')
            .select('id, title')
            .in('id', vocabBookIds);

          const vocabBookMap = new Map(vocabBooksData?.map(book => [book.id, book.title]) || []);

          vocabData.forEach(vocab => {
            const bookTitle = vocab.book_id ? vocabBookMap.get(vocab.book_id) : 'Unknown Book';
            activities.push({
              type: 'vocabulary',
              bookTitle: bookTitle || 'Unknown Book',
              bookId: vocab.book_id,
              vocabularyWord: vocab.headword,
              timestamp: vocab.created_at
            });
          });
        }
      }

      // Sort all activities by timestamp
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setActivities(activities.slice(0, 10)); // Show last 10 activities
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'reading':
        return <BookOpen className="w-4 h-4 text-primary" />;
      case 'vocabulary':
        return <Brain className="w-4 h-4 text-accent" />;
      case 'session':
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getActivityDescription = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'reading':
        const minutes = Math.round((activity.timeSpent || 0) / 60);
        return `Read ${activity.wordsRead || 0} words in ${minutes} min`;
      case 'vocabulary':
        return `Learned "${activity.vocabularyWord}"`;
      case 'session':
        return 'Completed reading session';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-8 h-8 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 bg-muted rounded"></div>
                  <div className="h-3 w-32 bg-muted rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Recent Activity
          <Badge variant="secondary" className="text-xs">
            {activities.length} items
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No recent activity</p>
            <p className="text-sm">Start reading to see your progress here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div key={index} className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center flex-shrink-0">
                  {getActivityIcon(activity.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">
                      {activity.bookTitle}
                    </span>
                    {activity.progress && (
                      <Badge variant="outline" className="text-xs">
                        {Math.round(activity.progress)}%
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {getActivityDescription(activity)} • {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </p>
                </div>

                {activity.type === 'reading' && activity.bookId && onContinueReading && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onContinueReading(activity.bookId!)}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};