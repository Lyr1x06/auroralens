const cache = new Map();

const HOURLY = [
  'visibility', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high',
  'temperature_2m', 'dew_point_2m', 'relative_humidity_2m', 'wind_speed_10m',
  'precipitation_probability', 'uv_index', 'weather_code',
].join(',');

const DAILY = [
  'sunrise', 'sunset', 'weather_code', 'temperature_2m_max', 'temperature_2m_min', 'uv_index_max',
].join(',');

export async function fetchForecast(lat, lng) {
  const key = `${lat.toFixed(3)},${lng.toFixed(3)}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < 15 * 60000) return hit.data;
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
    `&hourly=${HOURLY}&daily=${DAILY}&timezone=auto&forecast_days=7`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('天气数据获取失败');
  const data = await res.json();
  cache.set(key, { at: Date.now(), data });
  return data;
}

/** 取某天某个小时字段的值（含跨日窗口内插值） */
function hourlyAt(data, dayIdx, hour, field) {
  const idx = dayIdx * 24 + hour;
  const arr = data.hourly?.[field];
  return arr && arr[idx] != null ? arr[idx] : null;
}

/**
 * 拍摄条件评分：针对某天的金调/蓝调时间窗，聚合该窗内的逐小时数据。
 * 返回 { score, verdict, factors: [{label, good}] }
 */
export function scoreWindow(window, dayIdx, data) {
  if (!data || !window) return null;
  const startH = Math.max(0, Math.floor((window.start.getTime() - window._dayStart) / 3600000));
  const endH = Math.min(23, Math.ceil((window.end.getTime() - window._dayStart) / 3600000));
  const cloud = [], cloudLow = [], cloudMid = [], cloudHigh = [], vis = [], rain = [];
  for (let h = startH; h <= endH; h++) {
    cloud.push(hourlyAt(data, dayIdx, h, 'cloud_cover'));
    cloudLow.push(hourlyAt(data, dayIdx, h, 'cloud_cover_low'));
    cloudMid.push(hourlyAt(data, dayIdx, h, 'cloud_cover_mid'));
    cloudHigh.push(hourlyAt(data, dayIdx, h, 'cloud_cover_high'));
    vis.push(hourlyAt(data, dayIdx, h, 'visibility'));
    rain.push(hourlyAt(data, dayIdx, h, 'precipitation_probability'));
  }
  const avg = (a) => {
    const v = a.filter((x) => x != null);
    return v.length ? v.reduce((s, x) => s + x, 0) / v.length : null;
  };
  const [c, cl, cm, ch, v, r] = [cloud, cloudLow, cloudMid, cloudHigh, vis, rain].map(avg);
  if (c == null) return null;

  const factors = [];
  let score = 62;

  if (r != null && r >= 45) { score -= 25; factors.push({ label: '降水概率高', good: false }); }
  else if (r != null && r >= 25) { score -= 10; factors.push({ label: '可能飘雨', good: false }); }

  if (cl != null && cl > 70) { score -= 20; factors.push({ label: '低云遮日', good: false }); }
  else if (c > 85) { score -= 14; factors.push({ label: '云层厚密', good: false }); }
  else if (c < 25) { score += 12; factors.push({ label: '晴空通透', good: true }); }
  else if (c < 55) { score += 6; factors.push({ label: '云量适中', good: true }); }
  else factors.push({ label: '云量偏多', good: false });

  if (ch != null && ch > 30 && ch < 75 && (cl == null || cl < 60)) {
    score += 10; factors.push({ label: '高云染霞', good: true });
  }

  if (v != null) {
    if (v >= 20000) { score += 8; factors.push({ label: '能见度极佳', good: true }); }
    else if (v >= 10000) { score += 3; }
    else if (v < 5000) { score -= 12; factors.push({ label: '能见度差', good: false }); }
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  const verdict =
    score >= 80 ? '绝佳出片窗口' :
    score >= 60 ? '值得守候' :
    score >= 40 ? '效果存疑' : '不建议外出';
  return { score, verdict, factors: factors.slice(0, 3) };
}
