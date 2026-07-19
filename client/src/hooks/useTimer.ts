import { useCallback, useRef, useState } from "react";

export const useTimer = () => {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<any>(null);

  const start = useCallback(() => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
  }, []);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    stop();
    setSeconds(0);
  }, [stop]);

  return { seconds, start, stop, reset };
};
