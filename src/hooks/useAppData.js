import { useCallback, useEffect, useState } from 'react';
import { fetchForecast } from '../lib/weather.js';

const DEFAULT_PLACE = { name: '北京', lat: 39.9075, lng: 116.39723 };

export function useAppData() {
  const [place, setPlace] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('al:place'));
      if (saved && typeof saved.lat === 'number') return saved;
    } catch { /* ignore */ }
    return DEFAULT_PLACE;
  });
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);

  const load = useCallback(async (p) => {
    setLoading(true);
    setError(null);
    try {
      const d = await fetchForecast(p.lat, p.lng);
      setData(d);
    } catch (e) {
      setError(e.message || '网络错误');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(place); }, [place, load]);

  const changePlace = useCallback((p) => {
    setPlace(p);
    try { localStorage.setItem('al:place', JSON.stringify(p)); } catch { /* ignore */ }
  }, []);

  const locate = useCallback(async () => {
    setLocating(true);
    try {
      const { lat, lng } = await new Promise((resolve, reject) => {
        if (!navigator.geolocation) return reject(new Error('浏览器不支持定位'));
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          (err) => reject(new Error(err.message || '定位失败')),
          { timeout: 8000, maximumAge: 600000 },
        );
      });
      changePlace({ name: '当前位置', lat, lng });
    } catch (e) {
      throw e;
    } finally {
      setLocating(false);
    }
  }, [changePlace]);

  return { place, data, error, loading, locating, reload: () => load(place), changePlace, locate };
}
