import { useState, useEffect } from 'react';

export function useAnimatedCounter(target: number, decimals = 0, duration = 2400): string {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const start = performance.now();
    function step(now: number) {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 4);
      const val = target * ease;
      setValue(val);
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }, [target, duration]);

  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
