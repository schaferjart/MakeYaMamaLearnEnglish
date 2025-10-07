import { useState, useCallback, useRef, useEffect } from 'react';

interface UseSessionTimerProps {
  initialTime: number; // in seconds
  onTimeExpired?: () => void;
}

interface UseSessionTimerReturn {
  remainingTime: number;
  isTimerActive: boolean;
  startTimer: () => void;
  stopTimer: () => void;
  formatTime: (seconds: number) => string;
}

/**
 * Custom hook for managing a countdown session timer
 * @param initialTime - Initial time in seconds
 * @param onTimeExpired - Optional callback when timer reaches 0
 */
export function useSessionTimer({ 
  initialTime, 
  onTimeExpired 
}: UseSessionTimerProps): UseSessionTimerReturn {
  const [remainingTime, setRemainingTime] = useState(initialTime);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsTimerActive(true);
    timerRef.current = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsTimerActive(false);
  }, []);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Call onTimeExpired when timer reaches 0
  useEffect(() => {
    if (remainingTime <= 0 && isTimerActive) {
      stopTimer();
      onTimeExpired?.();
    }
  }, [remainingTime, isTimerActive, stopTimer, onTimeExpired]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Update remaining time when initialTime changes
  useEffect(() => {
    setRemainingTime(initialTime);
  }, [initialTime]);

  return {
    remainingTime,
    isTimerActive,
    startTimer,
    stopTimer,
    formatTime,
  };
}
