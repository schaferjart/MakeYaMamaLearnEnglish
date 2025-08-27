import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface ReadingProgress {
  id?: string;
  progressPercentage: number;
  currentPosition: number;
  totalLength?: number;
  wordsRead: number;
  readingSpeedWpm: number;
  timeSpentSeconds: number;
  lastReadAt: string;
}

interface UseReadingProgressOptions {
  bookId: string;
  sessionId: string | null;
  content?: string;
  onProgressUpdate?: (progress: ReadingProgress) => void;
}

export const useReadingProgress = ({
  bookId,
  sessionId,
  content = '',
  onProgressUpdate
}: UseReadingProgressOptions) => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<ReadingProgress>({
    progressPercentage: 0,
    currentPosition: 0,
    wordsRead: 0,
    readingSpeedWpm: 0,
    timeSpentSeconds: 0,
    lastReadAt: new Date().toISOString()
  });

  const [isTracking, setIsTracking] = useState(false);
  const startTimeRef = useRef<number>(Date.now());
  const lastPositionRef = useRef<number>(0);
  const progressIdRef = useRef<string | null>(null);

  // Calculate total word count from content
  const totalWords = content ? content.split(/\s+/).filter(word => word.length > 0).length : 0;

  // Load existing progress
  useEffect(() => {
    if (!user || !bookId) return;

    const loadProgress = async () => {
      try {
        const { data, error } = await supabase
          .from('reading_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('book_id', bookId)
          .order('last_read_at', { ascending: false })
          .limit(1)
          .single();

        if (data && !error) {
          progressIdRef.current = data.id;
          const loadedProgress = {
            id: data.id,
            progressPercentage: parseFloat(data.progress_percentage.toString()),
            currentPosition: data.current_position,
            totalLength: data.total_length,
            wordsRead: data.words_read || 0,
            readingSpeedWpm: data.reading_speed_wpm || 0,
            timeSpentSeconds: data.time_spent_seconds || 0,
            lastReadAt: data.last_read_at
          };
          setProgress(loadedProgress);
          onProgressUpdate?.(loadedProgress);
        }
      } catch (error) {
        console.error('Error loading reading progress:', error);
      }
    };

    loadProgress();
  }, [user, bookId, onProgressUpdate]);

  // Start tracking reading session
  const startTracking = useCallback(() => {
    if (isTracking) return;
    setIsTracking(true);
    startTimeRef.current = Date.now();
    lastPositionRef.current = progress.currentPosition;
  }, [isTracking, progress.currentPosition]);

  // Stop tracking and save progress
  const stopTracking = useCallback(async () => {
    if (!isTracking || !user) return;
    
    setIsTracking(false);
    const sessionTime = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const newTimeSpent = progress.timeSpentSeconds + sessionTime;
    
    // Calculate reading speed (words per minute)
    const wordsReadThisSession = Math.max(0, progress.currentPosition - lastPositionRef.current);
    const sessionMinutes = sessionTime / 60;
    const sessionWpm = sessionMinutes > 0 ? Math.round(wordsReadThisSession / sessionMinutes) : 0;
    
    // Update overall reading speed (weighted average)
    const totalMinutes = newTimeSpent / 60;
    const newReadingSpeed = totalMinutes > 0 ? Math.round(progress.wordsRead / totalMinutes) : sessionWpm;

    const updatedProgress = {
      ...progress,
      timeSpentSeconds: newTimeSpent,
      readingSpeedWpm: newReadingSpeed,
      lastReadAt: new Date().toISOString()
    };

    await saveProgress(updatedProgress);
  }, [isTracking, user, progress]);

  // Update reading position
  const updatePosition = useCallback((position: number, percentage?: number) => {
    if (!isTracking) return;

    const calculatedPercentage = percentage ?? (totalWords > 0 ? (position / totalWords) * 100 : 0);
    const updatedProgress = {
      ...progress,
      currentPosition: position,
      progressPercentage: Math.min(100, Math.max(0, calculatedPercentage)),
      wordsRead: Math.max(progress.wordsRead, position),
      totalLength: totalWords,
      lastReadAt: new Date().toISOString()
    };

    setProgress(updatedProgress);
    onProgressUpdate?.(updatedProgress);
  }, [isTracking, progress, totalWords, onProgressUpdate]);

  // Save progress to database
  const saveProgress = useCallback(async (progressData: ReadingProgress) => {
    if (!user || !bookId) return;

    try {
      const dataToSave = {
        user_id: user.id,
        book_id: bookId,
        session_id: sessionId,
        progress_percentage: progressData.progressPercentage,
        current_position: progressData.currentPosition,
        total_length: progressData.totalLength || totalWords,
        words_read: progressData.wordsRead,
        reading_speed_wpm: progressData.readingSpeedWpm,
        time_spent_seconds: progressData.timeSpentSeconds,
        last_read_at: progressData.lastReadAt
      };

      if (progressIdRef.current) {
        // Update existing progress
        const { error } = await supabase
          .from('reading_progress')
          .update(dataToSave)
          .eq('id', progressIdRef.current);

        if (error) throw error;
      } else {
        // Create new progress entry
        const { data, error } = await supabase
          .from('reading_progress')
          .insert(dataToSave)
          .select('id')
          .single();

        if (error) throw error;
        progressIdRef.current = data.id;
      }

      // Update daily statistics
      await updateDailyStats(progressData);
      
      setProgress(progressData);
    } catch (error) {
      console.error('Error saving reading progress:', error);
    }
  }, [user, bookId, sessionId, totalWords]);

  // Update daily reading statistics
  const updateDailyStats = async (progressData: ReadingProgress) => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    
    try {
      const { data: existingStats } = await supabase
        .from('reading_statistics')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      const statsData = {
        user_id: user.id,
        date: today,
        total_time_seconds: progressData.timeSpentSeconds,
        words_read: progressData.wordsRead,
        pages_read: Math.ceil(progressData.progressPercentage / 10), // Rough estimate: 10% = 1 page
        sessions_count: existingStats ? existingStats.sessions_count + 1 : 1,
        average_speed_wpm: progressData.readingSpeedWpm
      };

      if (existingStats) {
        await supabase
          .from('reading_statistics')
          .update(statsData)
          .eq('user_id', user.id)
          .eq('date', today);
      } else {
        await supabase
          .from('reading_statistics')
          .insert(statsData);
      }
    } catch (error) {
      console.error('Error updating daily stats:', error);
    }
  };

  // Auto-save progress periodically
  useEffect(() => {
    if (!isTracking) return;

    const interval = setInterval(async () => {
      await saveProgress(progress);
    }, 30000); // Save every 30 seconds

    return () => clearInterval(interval);
  }, [isTracking, progress, saveProgress]);

  return {
    progress,
    isTracking,
    startTracking,
    stopTracking,
    updatePosition,
    saveProgress: () => saveProgress(progress)
  };
};