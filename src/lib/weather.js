const cache = new Map();

const HOURLY = [
  'visibility', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high',
  'temperature_2m', 'dew_point_2m', 'relative_humidity_2m', 'wind_speed_10m',
  'precipitation_probability', 'uv_index', 'weather_code',
].join(',');

const DAILY = [
  'sunrise', 'sunset', 'weather_code', 'temperature_2m_max', 'temperature_2m_min', 'uv_index_max',
].join(',');

/** 15 分钟粒度：金调/蓝调窗口常只有十几分钟，逐小时采样会把窗口外的时段算进来 */
const MINUTELY_15 = [
  'cloud_cover', 'cloud_cover_low', 'cloud_cover_high',
  'visibility', 'precipitation_probability',
].join(',');

export async function fetchForecast(lat, lng) {
  const key = `${lat.toFixed(3)},${lng.toFixed(3)}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < 15 * 60000) return hit.data;
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
    `&hourly=${HOURLY}&minutely_15=${MINUTELY_15}&daily=${DAILY}&timezone=auto&forecast_days=7`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('天气数据获取失败');
  const data = await res.json();
  cache.set(key, { at: Date.now(), data });
  return data;
}

const STEP_MS = { minutely_15: 900000, hourly: 3600000 };

/**
 * Open-Meteo 返回的时间戳是「地点本地时间」字符串（已按 timezone 参数对齐）。
 * 转成绝对毫秒，才能与 SunCalc 算出的窗口（绝对时刻）比较。
 */
function stampsUtc(kind, data) {
  const offset = (data.utc_offset_seconds ?? 0) * 1000;
  return (data[kind]?.time ?? []).map((t) => {
    const [day, hm] = t.split('T');
    const [y, m, d] = day.split('-').map(Number);
    const [h, mi] = hm.split(':').map(Number);
    return Date.UTC(y, m - 1, d, h, mi) - offset;
  });
}

/** 取某字段落在窗口内的采样值；缺失时退回逐小时数据 */
function series(window, field, data) {
  for (const kind of ['minutely_15', 'hourly']) {
    const arr = data[kind]?.[field];
    if (!arr) continue;
    const step = STEP_MS[kind];
    const start = window.start.getTime();
    const end = window.end.getTime();
    const out = [];
    const times = stampsUtc(kind, data);
    for (let i = 0; i < times.length; i++) {
      if (times[i] + step > start && times[i] < end) out.push(arr[i]);
    }
    if (out.some((x) => x != null)) return out;
  }
  return [];
}

/**
 * 评分项在段内线性过渡，避免整段同分。
 * 各拐点沿用原有阈值，只把段内的阶跃改成插值。
 */
const lerp = (x, x0, y0, x1, y1) =>
  y0 + (Math.max(x0, Math.min(x1, x)) - x0) / (x1 - x0) * (y1 - y0);

/** 总云量：0–25 晴空 +12，55 适中 +6，85 转折 0，100 厚密 −14 */
function cloudBonus(c) {
  if (c == null) return 0;
  if (c <= 25) return 12;
  if (c <= 55) return lerp(c, 25, 12, 55, 6);
  if (c <= 85) return lerp(c, 55, 6, 85, 0);
  return lerp(c, 85, 0, 100, -14);
}

/** 高云：30 起升，45–65 满 +10，75 消退 */
function highBonus(ch) {
  if (ch == null) return 0;
  if (ch <= 30 || ch >= 75) return 0;
  if (ch < 45) return lerp(ch, 30, 0, 45, 10);
  if (ch <= 65) return 10;
  return lerp(ch, 65, 10, 75, 0);
}

/** 能见度：5km −12，10km 0，20km +8 */
function visBonus(v) {
  if (v == null) return 0;
  if (v <= 5000) return -12;
  if (v <= 10000) return lerp(v, 5000, -12, 10000, 0);
  if (v <= 20000) return lerp(v, 10000, 0, 20000, 8);
  return 8;
}

/**
 * 拍摄条件评分：聚合窗口时段内的天气采样。
 * 金调/蓝调窗口常只有十几分钟，因此优先用 15 分钟粒度数据；
 * 按绝对时刻取样，地点时区与设备时区不一致时也不会错行。
 * 返回 { score, verdict, factors: [{label, good}] }
 */
export function scoreWindow(window, data) {
  if (!data || !window) return null;
  const cloud = series(window, 'cloud_cover', data);
  const cloudLow = series(window, 'cloud_cover_low', data);
  const cloudHigh = series(window, 'cloud_cover_high', data);
  const vis = series(window, 'visibility', data);
  const rain = series(window, 'precipitation_probability', data);
  const avg = (a) => {
    const v = a.filter((x) => x != null);
    return v.length ? v.reduce((s, x) => s + x, 0) / v.length : null;
  };
  const [c, cl, ch, v, r] = [cloud, cloudLow, cloudHigh, vis, rain].map(avg);
  if (c == null) return null;

  const factors = [];
  let score = 62;

  if (r != null && r >= 45) { score -= 25; factors.push({ label: '降水概率高', good: false }); }
  else if (r != null && r >= 25) { score -= 10; factors.push({ label: '可能飘雨', good: false }); }

  if (cl != null && cl > 70) { score -= 20; factors.push({ label: '低云遮日', good: false }); }
  else {
    score += cloudBonus(c);
    if (c > 85) factors.push({ label: '云层厚密', good: false });
    else if (c < 25) factors.push({ label: '晴空通透', good: true });
    else if (c < 55) factors.push({ label: '云量适中', good: true });
    else factors.push({ label: '云量偏多', good: false });
  }

  if (ch != null && ch > 30 && ch < 75 && (cl == null || cl < 60)) {
    score += highBonus(ch); factors.push({ label: '高云染霞', good: true });
  }

  score += visBonus(v);
  if (v != null && v >= 20000) factors.push({ label: '能见度极佳', good: true });
  else if (v != null && v < 5000) factors.push({ label: '能见度差', good: false });

  score = Math.max(0, Math.min(100, Math.round(score)));
  const verdict =
    score >= 80 ? '绝佳出片窗口' :
    score >= 60 ? '值得守候' :
    score >= 40 ? '效果存疑' : '不建议外出';
  return { score, verdict, factors: factors.slice(0, 3) };
}
