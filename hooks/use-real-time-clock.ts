/**
 * @file Custom hook for providing a real-time updating clock.
 * @version 1.0.0
 * @since 2024-07-26
 */
import { useState, useEffect } from 'react';

/**
 * A custom hook that provides the current time, updated every second.
 * @param {string} timeZone - The IANA time zone string (e.g., 'America/New_York').
 * @returns {Date} The current time as a Date object.
 */
export const useRealTimeClock = (timeZone: string = Intl.DateTimeFormat().resolvedOptions().timeZone) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, []);

  return time;
};
