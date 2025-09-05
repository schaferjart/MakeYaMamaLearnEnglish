// useLocalStorageResume.tsx (No major changes needed, but added better logging and ensured initialResumeData is set correctly)
import { useState, useEffect, useCallback } from 'react';

interface ResumeData {
  chapterId: string;
  sentenceIndex: number;
  timestamp: number;
}

export const useLocalStorageResume = (bookId: string, userId: string) => {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [initialResumeData, setInitialResumeData] = useState<ResumeData | null>(null);
  
  const storageKey = `resume_${userId}_${bookId}`;

  // Load resume data on mount and whenever storage key changes
  useEffect(() => {
    const loadLatestData = () => {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          console.log('Loaded resume data from localStorage:', parsed);
          setResumeData(parsed);
          setInitialResumeData(parsed);
        } catch (error) {
          console.error('Error parsing resume data:', error);
        }
      }
    };
    
    loadLatestData();
  }, [storageKey]);

  // Save resume data
  const saveResumeData = useCallback((chapterId: string, sentenceIndex: number) => {
    const data: ResumeData = {
      chapterId,
      sentenceIndex,
      timestamp: Date.now()
    };
    
    localStorage.setItem(storageKey, JSON.stringify(data));
    setResumeData(data);
    console.log('Saved resume data:', data);
  }, [storageKey]);

  // Clear resume data
  const clearResumeData = useCallback(() => {
    localStorage.removeItem(storageKey);
    setResumeData(null);
    setInitialResumeData(null);
  }, [storageKey]);

  // Method to refresh data from localStorage (useful when returning from conversations)
  const refreshResumeData = useCallback(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        console.log('Refreshed resume data from localStorage:', parsed);
        setResumeData(parsed);
        setInitialResumeData(parsed);
      } catch (error) {
        console.error('Error parsing resume data on refresh:', error);
      }
    }
  }, [storageKey]);

  return {
    resumeData,
    initialResumeData,
    saveResumeData,
    clearResumeData,
    refreshResumeData
  };
};