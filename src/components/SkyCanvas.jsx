import { useEffect, useMemo } from 'react';
import { skyWeights, sunAzimuth } from '../lib/astro.js';

/**
 * 四时天空主题。每个主题带一个 `lum`（0=深夜，1=正午），
 * 混合后写入 document 的 --sky-lum，驱动全部玻璃与文字令牌自适应。
 */
const STOPS = {
  night: {
    top: '#04060e', mid: '#080e22', low: '#0c1228',
    lum: 0.02,
  },
  blue: {
    top: '#080d1f', mid: '#111a3d', low: '#232850',
    lum: 0.07,
  },
  horizon: {
    top: '#141628', mid: '#2e2340', low: '#5e3524',
    lum: 0.17,
  },
  day: {
    top: '#12314f', mid: '#24536f', low: '#3f7288',
    lum: 0.42,
  },
};

const lerp = (a, b, t) => a + (b - a) * t;

function mixColor(c1, c2, t) {
  const p = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  const [r1, g1, b1] = p(c1), [r2, g2, b2] = p(c2);
  const q = (v) => Math.round(v).toString(16).padStart(2, '0');
  return `#${q(lerp(r1, r2, t))}${q(lerp(g1, g2, t))}${q(lerp(b1, b2, t))}`;
}

const STAR_COUNT = 72;

const STARS = Array.from({ length: STAR_COUNT }, (_, i) => {
  const seed = (i * 2654435761) % 100000;
  return {
    top: (seed % 100) * 0.68,
    left: ((seed * 7919) % 10000) / 100,
    size: ((seed >> 3) % 16) / 10 + 0.7,
    dur: 2.8 + ((seed >> 5) % 30) / 10,
    delay: -(seed % 50) / 10,
    bright: i % 5 === 0,
  };
});

export default function SkyCanvas({ altitude, sunAz }) {
  const sky = useMemo(() => {
    const w = skyWeights(altitude);
    const mix = (key) => {
      let c = STOPS.night[key];
      c = mixColor(c, STOPS.blue[key], w.blue);
      c = mixColor(c, STOPS.horizon[key], w.horizon);
      c = mixColor(c, STOPS.day[key], w.day);
      return c;
    };
    const lum = STOPS.night.lum * w.night + STOPS.blue.lum * w.blue
      + STOPS.horizon.lum * w.horizon + STOPS.day.lum * w.day;
    return {
      top: mix('top'),
      mid: mix('mid'),
      low: mix('low'),
      lum,
      starAlpha: Math.max(0, w.night * 1 + w.blue * 0.42 - w.horizon * 0.4),
      // 地平线暖光只在地平线主题附近出现
      glowStrength: Math.max(0, w.horizon * 1.1 + w.blue * 0.25 - w.day * 0.5),
    };
  }, [altitude]);

  // 背景亮度标量 + 状态栏配色，写入 document 供全局令牌派生
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--sky-lum', sky.lum.toFixed(3));
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', sky.mid);
  }, [sky.lum, sky.mid]);

  // 太阳方位角驱动地平线光晕的水平位置（北=50% 参考系）
  const glowX = useMemo(() => {
    if (sunAz == null) return 50;
    // 以正南为画面中心，方位角映射到 0–100%
    return Math.max(-10, Math.min(110, ((sunAz - 90 + 540) % 360 - 180) / 3.6 + 50));
  }, [sunAz]);

  return (
    <div className="sky" aria-hidden="true">
      <div
        className="sky-grad"
        style={{ background: `linear-gradient(180deg, ${sky.top} 0%, ${sky.mid} 48%, ${sky.low} 100%)` }}
      />
      <div
        className="sky-horizon"
        style={{
          opacity: sky.glowStrength,
          background:
            `radial-gradient(60% 100% at ${glowX}% 100%, rgba(255,176,92,0.55), rgba(255,132,96,0.22) 42%, rgba(255,120,80,0) 72%)`,
        }}
      />
      <div className="sky-vignette" />
      <div className="sky-stars" style={{ opacity: sky.starAlpha }}>
        {STARS.map((s, i) => (
          <i
            key={i}
            className={s.bright ? 'star star-bright' : 'star'}
            style={{
              top: `${s.top}%`,
              left: `${s.left}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              animationDuration: `${s.dur}s`,
              animationDelay: `${s.delay}s`,
            }}
          />
        ))}
      </div>
      <div className="sky-noise" />
    </div>
  );
}
