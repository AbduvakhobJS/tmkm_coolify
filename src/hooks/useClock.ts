import { useState, useEffect } from 'react';
import { DAYS, MONTHS_SHORT } from '../data/constants';

interface ClockState {
  time: string;
  date: string;
}

export function useClock(): ClockState {
  const [clock, setClock] = useState<ClockState>({ time: '00:00:00', date: '-- -- ----' });

  useEffect(() => {
    function update() {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      setClock({
        time: `${h}:${m}:${s}`,
        date: `${DAYS[now.getDay()]}  ${now.getDate()} ${MONTHS_SHORT[now.getMonth()]} ${now.getFullYear()}`,
      });
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return clock;
}
