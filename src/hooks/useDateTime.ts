import { useState, useEffect } from 'react';

interface DateTimeState {
  time: string;
  date: string;
  fullDate: string;
}

export function useDateTime(): DateTimeState {
  const [dateTime, setDateTime] = useState<DateTimeState>({
    time: '',
    date: '',
    fullDate: '',
  });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      
      // Time format like: 4:53 PM
      const timeString = now.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

      // Date format like: 6/11/2026
      const dateString = now.toLocaleDateString([], {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
      });

      // Accessible full text
      const fullDateString = now.toLocaleDateString([], {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      setDateTime({
        time: timeString,
        date: dateString,
        fullDate: `${timeString}, ${fullDateString}`,
      });
    };

    updateTime();
    
    // Check every second to keep the minute transition fresh
    const timer = setInterval(updateTime, 1000);

    return () => clearInterval(timer);
  }, []);

  return dateTime;
}
