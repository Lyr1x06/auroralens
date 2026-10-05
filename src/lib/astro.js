import * as SunCalc from 'suncalc';

const D = Math.PI / 180;
const R = 180 / Math.PI;

export function sunAltitude(date, lat, lng) {
  return SunCalc.getPosition(date, lat, lng).altitude * R;
}

export function sunAzimuth(date, lat, lng) {
  // 归一为「正北=0，顺时针」
  return (SunCalc.getPosition(date, lat, lng).azimuth * R + 180 + 360) % 360;
}

export function moonAltitude(date, lat, lng) {
  return SunCalc.getMoonPosition(date, lat, lng).altitude * R;
}

export function moonAzimuth(date, lat, lng) {
  return (SunCalc.getMoonPosition(date, lat, lng).azimuth * R + 180 + 360) % 360;
}

/**
 * 逐分钟采样太阳高度角，划分摄影意义的金调 / 蓝调区间（含早晚各一组）。
 * 金调：altitude ∈ (-4°, 6°)；蓝调：altitude ∈ (-6°, -4°)。
 * 返回 { golden, blue, goldenEvening, blueEvening }，各含 { start, end }，可能为 null。
 */
export function getPhotoWindows(date, lat, lng) {
  // 以当地正午为锚（±12h），保证极昼极夜及任意时区下都能覆盖全天
  const base = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
  const sample = (min) => sunAltitude(new Date(base.getTime() + min * 60000), lat, lng);
  const spans = { golden: [], blue: [] };
  let cur = null;
  for (let m = -720; m <= 720; m += 2) {
    const a = sample(m);
    const kind = a > -4 && a < 6 ? 'golden' : a >= -6 && a <= -4 ? 'blue' : null;
    if (kind !== (cur && cur.kind)) {
      if (cur && cur.kind && m > cur.from) {
        spans[cur.kind].push({
          start: new Date(base.getTime() + cur.from * 60000),
          end: new Date(base.getTime() + m * 60000),
        });
      }
      cur = kind ? { kind, from: m } : null;
    }
  }
  if (cur && cur.kind) {
    spans[cur.kind].push({
      start: new Date(base.getTime() + cur.from * 60000),
      end: new Date(base.getTime() + 720 * 60000),
    });
  }
  // 扫描自前一日正午起，跨零点的段拆回所属日
  const midnight = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const clip = (s) => {
    const start = s.start.getTime() < midnight ? new Date(midnight) : s.start;
    const end = s.end.getTime() > midnight + 86400000 ? new Date(midnight + 86400000) : s.end;
    return end - start > 0 ? { start, end } : null;
  };
  spans.golden = spans.golden.map(clip).filter(Boolean);
  spans.blue = spans.blue.map(clip).filter(Boolean);

  const pick = (arr, evening) => {
    if (!arr.length) return null;
    const sorted = arr.sort((a, b) => a.start - b.start);
    return evening ? sorted[sorted.length - 1] : sorted[0];
  };
  return {
    golden: pick(spans.golden, false),
    blue: pick(spans.blue, false),
    goldenEvening: pick(spans.golden, true),
    blueEvening: pick(spans.blue, true),
  };
}

const PHASES = [
  '新月', '娥眉月', '上弦月', '盈凸月',
  '满月', '亏凸月', '下弦月', '残月',
];

export function moonPhaseInfo(date) {
  const ill = SunCalc.getMoonIllumination(date);
  const idx = Math.round(ill.phase * 8) % 8;
  return {
    phase: ill.phase,
    fraction: ill.fraction,
    name: PHASES[idx],
    waxing: ill.phase < 0.5,
  };
}

export function moonTimes(date, lat, lng) {
  return SunCalc.getMoonTimes(date, lat, lng);
}

export function sunTimes(date, lat, lng) {
  return SunCalc.getTimes(date, lat, lng);
}

/** 太阳高度角 -> 天空主题插值权重（夜景 / 蓝调 / 日出日落 / 白昼） */
export function skyWeights(alt) {
  const clamp = (x) => Math.min(1, Math.max(0, x));
  const night = 1 - clamp((alt + 10) / 6);          // alt < -10 全夜
  const blue = clamp((alt + 10) / 6) * (1 - clamp((alt + 4) / 3));
  const horizon = clamp((alt + 6) / 3) * (1 - clamp((alt - 8) / 10));
  const day = clamp((alt - 6) / 10);
  const sum = night + blue + horizon + day || 1;
  return { night: night / sum, blue: blue / sum, horizon: horizon / sum, day: day / sum };
}
