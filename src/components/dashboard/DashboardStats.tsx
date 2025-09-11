import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Clock, Target, Brain, TrendingUp, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/hooks/useTranslation";

interface DashboardStatsData {
  totalBooksStarted: number;
  totalWordsRead: number;
  totalTimeMinutes: number;
  vocabularyCount: number;
  averageSpeedWpm: number;
  todayProgress: {
    wordsRead: number;
    timeMinutes: number;
    goal: number;
  };
  streakDays: number;
}

export const DashboardStats = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStatsData>({
    totalBooksStarted: 0,
    totalWordsRead: 0,
    totalTimeMinutes: 0,
    vocabularyCount: 0,
    averageSpeedWpm: 0,
    todayProgress: { wordsRead: 0, timeMinutes: 0, goal: 1000 },
    streakDays: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardStats();
    }
  }, [user]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      // Get total books started (books with progress > 0)
      const { count: booksStarted } = await supabase
        .from('reading_progress')
        .select('book_id', { count: 'exact', head: true })
        .eq('user_id', user?.id)
        .gt('progress_percentage', 0);

      // Get vocabulary count
      const { count: vocabCount } = await supabase
        .from('vocabulary')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id);

      // Get reading statistics (aggregate data)
      const { data: readingStats } = await supabase
        .from('reading_statistics')
        .select('*')
        .eq('user_id', user?.id)
        .order('date', { ascending: false });

      // Calculate totals and today's progress
      let totalWordsRead = 0;
      let totalTimeSeconds = 0;
      let totalSessions = 0;
      let averageSpeed = 0;
      let todayWordsRead = 0;
      let todayTimeMinutes = 0;

      const today = new Date().toISOString().split('T')[0];
      
      readingStats?.forEach(stat => {
        totalWordsRead += stat.words_read || 0;
        totalTimeSeconds += stat.total_time_seconds || 0;
        totalSessions += stat.sessions_count || 0;
        
        if (stat.date === today) {
          todayWordsRead = stat.words_read || 0;
          todayTimeMinutes = Math.round((stat.total_time_seconds || 0) / 60);
        }
      });

      // Calculate streak (consecutive days with reading activity)
      let streakDays = 0;
      if (readingStats && readingStats.length > 0) {
        const sortedStats = readingStats.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        
        for (const stat of sortedStats) {
          const statDate = new Date(stat.date);
          statDate.setHours(0, 0, 0, 0);
          
          const dayDiff = Math.floor((currentDate.getTime() - statDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (dayDiff === streakDays && stat.words_read > 0) {
            streakDays++;
            currentDate.setDate(currentDate.getDate() - 1);
          } else {
            break;
          }
        }
      }

      if (totalSessions > 0) {
        averageSpeed = Math.round(totalWordsRead / (totalTimeSeconds / 60)); // WPM
      }

      setStats({
        totalBooksStarted: booksStarted || 0,
        totalWordsRead,
        totalTimeMinutes: Math.round(totalTimeSeconds / 60),
        vocabularyCount: vocabCount || 0,
        averageSpeedWpm: averageSpeed,
        todayProgress: {
          wordsRead: todayWordsRead,
          timeMinutes: todayTimeMinutes,
          goal: 1000 // Daily word goal
        },
        streakDays
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const progressPercentage = Math.min((stats.todayProgress.wordsRead / stats.todayProgress.goal) * 100, 100);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-muted rounded"></div>
              <div className="h-4 w-4 bg-muted rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted rounded mb-2"></div>
              <div className="h-3 w-24 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Today's Progress */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Target className="w-5 h-5" />
            {t('dashboard.stats.todaysProgress')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {t('dashboard.stats.wordsReadGoal', { count: stats.todayProgress.wordsRead, goal: stats.todayProgress.goal })}
            </span>
            <span className="text-sm font-medium">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{t('dashboard.stats.minutesReading', { count: stats.todayProgress.timeMinutes })}</span>
            <span>{t('dashboard.stats.dayStreak', { count: stats.streakDays })} 🔥</span>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.stats.booksStarted')}</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBooksStarted}</div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.stats.readingJourney')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.stats.wordsRead')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalWordsRead.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.stats.totalProgress')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.stats.readingTime')}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor(stats.totalTimeMinutes / 60)}h {stats.totalTimeMinutes % 60}m
            </div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.stats.wpmAvg', { count: stats.averageSpeedWpm })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.stats.vocabulary')}</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.vocabularyCount}</div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.stats.wordsLearned')}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};