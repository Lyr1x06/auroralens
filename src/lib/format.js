/**
 * suncalc 返回的是 UTC 时刻的 Date。展示时需要换算到「位置所在地」的时区：
 * 本机 Date.getHours() 已应用本地时区，因此只需再平移（目标时区 - 本机时区）的差值。
 */
export function fmtTime(d, tzOffsetMin) {
  if (!d || !Number.isFinite(d.getTime())) return '—';
  const localOffset = d.getTimezoneOffset();          // 东八区 = -480
  const shift = tzOffsetMin == null ? 0 : tzOffsetMin + localOffset;
  const date = new Date(d.getTime() + shift * 60000);
  const h = date.getHours(), m = date.getMinutes();
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function fmtKm(meters) {
  if (meters == null) return '—';
  if (meters >= 10000) return `${(meters / 1000).toFixed(0)} km`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export function fmtDeg(radOrDeg, isRad = false) {
  const deg = isRad ? radOrDeg * 180 / Math.PI : radOrDeg;
  const d = ((deg % 360) + 360) % 360;
  const dirs = ['北', '东北', '东', '东南', '南', '西南', '西', '西北'];
  return `${Math.round(d)}° ${dirs[Math.round(d / 45) % 8]}`;
}

const WEEK = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

export function dayLabel(date, today) {
  const same = date.toDateString() === today.toDateString();
  if (same) return '今天';
  return WEEK[date.getDay()];
}

export function shortDate(date) {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}
