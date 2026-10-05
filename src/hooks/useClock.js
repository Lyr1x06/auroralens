import { useEffect, useState } from 'react';

const match = typeof window !== 'undefined' && window.location.search.match(/[?&]t=(\d{1,2}):(\d{2})/);

export function useClock(intervalMs = 1000) {
  const [now, setNow] = useState(() => {
    if (match) {
      const d = new Date();
      d.setHours(+match[1], +match[2], 0, 0);
      return d;
    }
    return new Date();
  });
  useEffect(() => {
    if (match) return; // 冻结时间模式不跳动
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
