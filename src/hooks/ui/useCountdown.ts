import { useState, useEffect, useCallback } from 'react';

interface UseCountdownProps {
  initialSeconds: number;
  onComplete: () => void | Promise<void>;
}

export function useCountdown({ initialSeconds, onComplete }: UseCountdownProps) {
  const [seconds, setSeconds] = useState(initialSeconds);

  const reset = useCallback(() => {
    setSeconds(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          onComplete();
          return initialSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [initialSeconds, onComplete]);

  return {
    seconds,
    reset
  };
}
