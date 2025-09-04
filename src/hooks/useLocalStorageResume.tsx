import { useState, useEffect, useCallback } from 'react';

interface ResumeData {
  chapterId: string;
  sentenceIndex: number;
  timestamp: number;
}

export const useLocalStorageResume = (bookId: string, userId: string) => {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  
  const storageKey = `resume_${userId}_${bookId}`;

  // Load resume data on mount
  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        console.log('Loaded resume data from localStorage:', parsed);
        setResumeData(parsed);
      } catch (error) {
        console.error('Error parsing resume data:', error);
      }
    }
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
  }, [storageKey]);

  return {
    resumeData,
    saveResumeData,
    clearResumeData
  };
}; 