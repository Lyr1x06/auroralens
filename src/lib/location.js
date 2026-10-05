const cache = new Map();

export async function searchPlaces(query, signal) {
  const q = query.trim();
  if (!q) return [];
  const key = 'geo:' + q;
  if (cache.has(key)) return cache.get(key);
  const url =
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}` +
    `&count=8&language=zh&format=json`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error('搜索失败');
  const data = await res.json();
  const list = (data.results || []).map((r) => ({
    id: r.id,
    name: r.name,
    country: r.country,
    admin: r.admin1,
    lat: r.latitude,
    lng: r.longitude,
  }));
  cache.set(key, list);
  return list;
}

export function locateMe() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('浏览器不支持定位'));
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(new Error(err.message || '定位失败')),
      { timeout: 8000, maximumAge: 600000 },
    );
  });
}

/** 反查地名（定位后展示用），失败则返回坐标文本 */
export async function reverseName(lat, lng) {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lng}`,
    );
    // Open-Meteo 没有免费逆地理编码，退化为坐标展示由调用方处理
  } catch { /* ignore */ }
  return null;
}
