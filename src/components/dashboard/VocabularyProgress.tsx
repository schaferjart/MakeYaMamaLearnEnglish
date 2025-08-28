import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, TrendingUp, BookOpen, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface VocabularyStats {
  totalWords: number;
  weeklyWords: number;
  byDifficulty: {
    easy: number;
    medium: number;
    hard: number;
  };
  byBook: Array<{
    bookTitle: string;
    count: number;
  }>;
  recentWords: Array<{
    word: string;
    translation: string;
    bookTitle: string;
    date: string;
  }>;
}

export const VocabularyProgress = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<VocabularyStats>({
    totalWords: 0,
    weeklyWords: 0,
    byDifficulty: { easy: 0, medium: 0, hard: 0 },
    byBook: [],
    recentWords: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchVocabularyStats();
    }
  }, [user]);

  const fetchVocabularyStats = async () => {
    try {
      setLoading(true);

      // Get all vocabulary for user
      const { data: vocabularyData } = await supabase
        .from('vocabulary')
        .select(`
          *,
          books(title)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (!vocabularyData) {
        setLoading(false);
        return;
      }

      // Calculate total words
      const totalWords = vocabularyData.length;

      // Calculate weekly words (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weeklyWords = vocabularyData.filter(word => 
        new Date(word.created_at) >= weekAgo
      ).length;

      // Group by difficulty
      const byDifficulty = {
        easy: vocabularyData.filter(w => (w.difficulty || 1) <= 2).length,
        medium: vocabularyData.filter(w => (w.difficulty || 1) === 3 || (w.difficulty || 1) === 4).length,
        hard: vocabularyData.filter(w => (w.difficulty || 1) >= 5).length
      };

      // Group by book
      const bookCounts = vocabularyData.reduce((acc, word) => {
        const bookTitle = word.books?.title || 'Unknown Book';
        acc[bookTitle] = (acc[bookTitle] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const byBook = Object.entries(bookCounts)
        .map(([title, count]) => ({ bookTitle: title, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // Top 5 books

      // Recent words (last 5)
      const recentWords = vocabularyData.slice(0, 5).map(word => ({
        word: word.headword,
        translation: word.translation_de || word.sense || 'No translation',
        bookTitle: word.books?.title || 'Unknown Book',
        date: word.created_at
      }));

      setStats({
        totalWords,
        weeklyWords,
        byDifficulty,
        byBook,
        recentWords
      });
    } catch (error) {
      console.error('Error fetching vocabulary stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (level: 'easy' | 'medium' | 'hard') => {
    switch (level) {
      case 'easy': return 'bg-success';
      case 'medium': return 'bg-primary';
      case 'hard': return 'bg-destructive';
    }
  };

  const getDifficultyLabel = (level: 'easy' | 'medium' | 'hard') => {
    switch (level) {
      case 'easy': return 'Easy (1-2)';
      case 'medium': return 'Medium (3-4)';
      case 'hard': return 'Hard (5+)';
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-5 w-32 bg-muted rounded"></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-4 w-full bg-muted rounded"></div>
              <div className="h-4 w-3/4 bg-muted rounded"></div>
              <div className="h-4 w-1/2 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalDifficultyWords = stats.byDifficulty.easy + stats.byDifficulty.medium + stats.byDifficulty.hard;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Vocabulary Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-accent" />
            Vocabulary Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">{stats.totalWords}</span>
            <Badge variant="secondary" className="gap-1">
              <TrendingUp className="w-3 h-3" />
              +{stats.weeklyWords} this week
            </Badge>
          </div>

          {totalDifficultyWords > 0 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Words by difficulty:</p>
              
              {(['easy', 'medium', 'hard'] as const).map((difficulty) => {
                const count = stats.byDifficulty[difficulty];
                const percentage = totalDifficultyWords > 0 ? (count / totalDifficultyWords) * 100 : 0;
                
                return (
                  <div key={difficulty} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{getDifficultyLabel(difficulty)}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                    <Progress 
                      value={percentage} 
                      className={`h-1 ${getDifficultyColor(difficulty)}`}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Book Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Words by Book
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.byBook.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              <p className="text-sm">No vocabulary saved yet</p>
              <p className="text-xs">Start reading and save words to see progress</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.byBook.map((book, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm truncate flex-1 mr-2">
                    {book.bookTitle}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {book.count}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Words */}
      {stats.recentWords.length > 0 && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              Recent Words
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {stats.recentWords.map((word, index) => (
                <div key={index} className="p-3 rounded-lg bg-vocabulary-highlight/10 border border-vocabulary-highlight/20">
                  <div className="font-medium text-sm">{word.word}</div>
                  <div className="text-xs text-muted-foreground mb-1">
                    {word.translation}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    from {word.bookTitle}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};