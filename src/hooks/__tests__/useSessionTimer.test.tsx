import { renderHook, act } from '@testing-library/react';
import { useSessionTimer } from '../useSessionTimer';

describe('useSessionTimer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should initialize with the correct time', () => {
    const { result } = renderHook(() => useSessionTimer({ initialTime: 300 }));
    expect(result.current.remainingTime).toBe(300);
    expect(result.current.isTimerActive).toBe(false);
  });

  it('should format time correctly', () => {
    const { result } = renderHook(() => useSessionTimer({ initialTime: 300 }));
    expect(result.current.formatTime(300)).toBe('5:00');
    expect(result.current.formatTime(65)).toBe('1:05');
    expect(result.current.formatTime(5)).toBe('0:05');
  });

  it('should start and count down', () => {
    const { result } = renderHook(() => useSessionTimer({ initialTime: 10 }));
    
    act(() => {
      result.current.startTimer();
    });
    
    expect(result.current.isTimerActive).toBe(true);
    
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    
    expect(result.current.remainingTime).toBe(7);
  });

  it('should stop timer', () => {
    const { result } = renderHook(() => useSessionTimer({ initialTime: 10 }));
    
    act(() => {
      result.current.startTimer();
    });
    
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    
    expect(result.current.remainingTime).toBe(8);
    
    act(() => {
      result.current.stopTimer();
    });
    
    expect(result.current.isTimerActive).toBe(false);
    
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    
    // Should not continue counting after stop
    expect(result.current.remainingTime).toBe(8);
  });

  it('should call onTimeExpired when timer reaches 0', () => {
    const onTimeExpired = jest.fn();
    const { result } = renderHook(() => 
      useSessionTimer({ initialTime: 3, onTimeExpired })
    );
    
    act(() => {
      result.current.startTimer();
    });
    
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    
    expect(result.current.remainingTime).toBe(0);
    expect(result.current.isTimerActive).toBe(false);
    expect(onTimeExpired).toHaveBeenCalledTimes(1);
  });

  it('should update remaining time when initialTime prop changes', () => {
    const { result, rerender } = renderHook(
      ({ time }) => useSessionTimer({ initialTime: time }),
      { initialProps: { time: 300 } }
    );
    
    expect(result.current.remainingTime).toBe(300);
    
    rerender({ time: 600 });
    
    expect(result.current.remainingTime).toBe(600);
  });
});
