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
  chapterId?: string;
  lastSentenceIndex?: number;
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
  const lastSaveRef = useRef<number>(0);
  const progressRef = useRef<ReadingProgress>(progress);

  // Calculate total word count from content
  const totalWords = content ? content.split(/\s+/).filter(word => word.length > 0).length : 0;

  // Load existing progress
  useEffect(() => {
    if (!user || !bookId) return;

    const loadProgress = async () => {
      try {
        // First try to load from localStorage (fallback for testing)
        const localStorageKey = `reading_progress_${user.id}_${bookId}`;
        const localProgress = localStorage.getItem(localStorageKey);
        
        const { data, error } = await supabase
          .from('reading_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('book_id', bookId)
          .order('last_read_at', { ascending: false })
          .limit(1)
          .maybeSingle();

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
            lastReadAt: data.last_read_at,
            chapterId: (data as any).chapter_id || (localProgress ? JSON.parse(localProgress).chapterId : null),
            lastSentenceIndex: (data as any).last_sentence_index || (localProgress ? JSON.parse(localProgress).lastSentenceIndex : 0)
          };
          setProgress(loadedProgress);
          progressRef.current = loadedProgress;
          onProgressUpdate?.(loadedProgress);
        } else if (localProgress) {
          // Fallback to localStorage if DB doesn't have the new fields yet
          const parsed = JSON.parse(localProgress);
          setProgress(parsed);
          progressRef.current = parsed;
          onProgressUpdate?.(parsed);
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
  const updatePosition = useCallback((position: number, percentage?: number, resumeInfo?: {chapterId: string, sentenceIndex: number}) => {
    if (!isTracking) return;

    const calculatedPercentage = percentage ?? (totalWords > 0 ? (position / totalWords) * 100 : 0);
    const updatedProgress = {
      ...progress,
      currentPosition: position,
      progressPercentage: Math.min(100, Math.max(0, calculatedPercentage)),
      wordsRead: Math.max(progress.wordsRead, position),
      totalLength: totalWords,
      lastReadAt: new Date().toISOString(),
      chapterId: resumeInfo?.chapterId,
      lastSentenceIndex: resumeInfo?.sentenceIndex
    };

    setProgress(updatedProgress);
    progressRef.current = updatedProgress;
    onProgressUpdate?.(updatedProgress);
  }, [isTracking, progress, totalWords, onProgressUpdate]);

  // Save progress to database (throttled)
  const saveProgress = useCallback(async (progressData: ReadingProgress) => {
    if (!user || !bookId) return;
    const now = Date.now();
    if (now - lastSaveRef.current < 15000) return; // throttle to 15s
    lastSaveRef.current = now;

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
        last_read_at: progressData.lastReadAt,
        chapter_id: progressData.chapterId,
        last_sentence_index: progressData.lastSentenceIndex || 0
      };

      // Save to localStorage as backup (especially for resume data)
      const localStorageKey = `reading_progress_${user.id}_${bookId}`;
      localStorage.setItem(localStorageKey, JSON.stringify(progressData));

      if (progressIdRef.current) {
        // Update existing progress
        const { error } = await supabase
          .from('reading_progress')
          .update(dataToSave)
          .eq('id', progressIdRef.current);

        if (error) {
          console.warn('Error updating progress in DB, using localStorage:', error);
        }
      } else {
        // Create new progress entry
        const { data, error } = await supabase
          .from('reading_progress')
          .insert(dataToSave)
          .select('id')
          .single();

        if (error) {
          console.warn('Error creating progress in DB, using localStorage:', error);
        } else {
          progressIdRef.current = data.id;
        }
      }

      // Save to localStorage as backup for resume functionality
      const localKey = `reading_progress_${user.id}_${bookId}`;
      localStorage.setItem(localKey, JSON.stringify(progressData));
      console.log('Saved progress with resume data:', progressData);

      // Update daily statistics
      await updateDailyStats(progressData);
      
      setProgress(progressData);
      progressRef.current = progressData;
    } catch (error) {
      console.error('Error saving reading progress:', error);
    }
  }, [user, bookId, sessionId, totalWords]);

  // Update daily reading statistics (no per-save session increments)
  const updateDailyStats = async (progressData: ReadingProgress) => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    
    try {
      // Upsert without inflating sessions_count on every save
      const { data: existingStats } = await supabase
        .from('reading_statistics')
        .select('sessions_count')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      const sessions_count = existingStats ? existingStats.sessions_count : 1;

      await supabase
        .from('reading_statistics')
        .upsert({
          user_id: user.id,
          date: today,
          total_time_seconds: progressData.timeSpentSeconds,
          words_read: progressData.wordsRead,
          pages_read: Math.ceil(progressData.progressPercentage / 10),
          sessions_count,
          average_speed_wpm: progressData.readingSpeedWpm
        }, { onConflict: 'user_id,date' });
    } catch (error) {
      console.error('Error updating daily stats:', error);
    }
  };

  // Auto-save progress periodically (fixed interval)
  useEffect(() => {
    if (!isTracking) return;

    const interval = setInterval(async () => {
      await saveProgress(progressRef.current);
    }, 30000); // Save every 30 seconds

    return () => clearInterval(interval);
  }, [isTracking, saveProgress]);

  return {
    progress,
    isTracking,
    startTracking,
    stopTracking,
    updatePosition,
    saveProgress: () => saveProgress(progress)
  };
};