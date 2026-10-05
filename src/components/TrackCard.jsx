import { useMemo } from 'react';
import { sunAltitude, moonAltitude } from '../lib/astro.js';

const W = 420;
const PAD = { l: 12, r: 12, t: 16, b: 22 };

/**
 * 太阳 + 月亮合并轨迹卡。
 * 量程按当日两条曲线的实际极值自适应；地平线为固定基准线；
 * 金调/蓝调高度带以细色带标出。
 */
export default function TrackCard({ idx, dayStart, lat, lng, now, isToday, loading }) {
  const geo = useMemo(() => {
    const sun = [];
    const moon = [];
    for (let m = 0; m <= 1440; m += 6) {
      const t = new Date(dayStart.getTime() + m * 60000);
      sun.push({ m, alt: sunAltitude(t, lat, lng) });
      moon.push({ m, alt: moonAltitude(t, lat, lng) });
    }
    const all = [...sun, ...moon].map((p) => p.alt);
    const top = Math.max(24, Math.ceil(Math.max(...all) / 10) * 10 + 6);
    const bottom = Math.min(-20, Math.floor(Math.min(...all) / 10) * 10 - 4);
    return { sun, moon, top, bottom };
  }, [dayStart, lat, lng]);

  const { sun, moon, top, bottom } = geo;
  const H = 168;

  const x = (m) => PAD.l + (m / 1440) * (W - PAD.l - PAD.r);
  const y = (alt) => {
    const t = (alt - bottom) / (top - bottom);
    return H - PAD.b - t * (H - PAD.t - PAD.b);
  };

  const path = (pts) =>
    pts.map((p, i) => `${i ? 'L' : 'M'}${x(p.m).toFixed(1)},${y(p.alt).toFixed(1)}`).join(' ');

  const sunLine = path(sun);
  const moonLine = path(moon);
  const horizonY = y(0);

  const nowM = (now.getTime() - dayStart.getTime()) / 60000;
  const inDay = nowM >= 0 && nowM <= 1440;
  const showNow = isToday || inDay;
  const nowX = x(Math.max(0, Math.min(1440, nowM)));
  const sunNowAlt = sunAltitude(now, lat, lng);
  const moonNowAlt = moonAltitude(now, lat, lng);

  const band = (a1, a2) => {
    const y1 = y(Math.max(a1, a2));
    const y2 = y(Math.min(a1, a2));
    return { y: y1, h: Math.max(1, y2 - y1) };
  };
  const goldenBand = band(-4, 6);
  const blueBand = band(-6, -4);

  const aria = `太阳与月亮的高度角轨迹。当前太阳高度 ${Math.round(sunNowAlt)} 度，月亮高度 ${Math.round(moonNowAlt)} 度。`;

  if (loading) {
    return (
      <section className="card" style={{ '--i': idx }}>
        <h2 className="card-title">天体轨迹</h2>
        <div className="sk" style={{ height: 150, borderRadius: 'var(--r-md)' }} />
      </section>
    );
  }

  return (
    <section className="card" style={{ '--i': idx }}>
      <h2 className="card-title">天体轨迹 · 高度角</h2>

      <div className="track-legend">
        <span className="track-key">
          <span className="k-dot" style={{ background: 'var(--accent-gold)' }} />
          太阳 <span className="k-val">{Math.round(sunNowAlt)}°</span>
        </span>
        <span className="track-key">
          <span className="k-dot" style={{ background: 'var(--accent-moon)' }} />
          月亮 <span className="k-val">{Math.round(moonNowAlt)}°</span>
        </span>
      </div>

      <div className="pathwrap">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={aria}>
          <defs>
            <linearGradient id="trackSun" x1="0" x2="1">
              <stop offset="0" stopColor="var(--accent-gold-deep)" />
              <stop offset="0.45" stopColor="var(--accent-gold)" />
              <stop offset="1" stopColor="var(--accent-rose)" />
            </linearGradient>
            <linearGradient id="trackMoon" x1="0" x2="1">
              <stop offset="0" stopColor="rgba(223,230,255,0.35)" />
              <stop offset="0.5" stopColor="var(--accent-moon)" />
              <stop offset="1" stopColor="rgba(223,230,255,0.35)" />
            </linearGradient>
            <linearGradient id="trackFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="rgba(255,196,107,0.16)" />
              <stop offset="1" stopColor="rgba(255,196,107,0)" />
            </linearGradient>
          </defs>

          {/* 光窗高度带 */}
          <rect x={PAD.l} y={goldenBand.y} width={W - PAD.l - PAD.r} height={goldenBand.h}
            fill="rgba(255,196,107,0.07)" />
          <rect x={PAD.l} y={blueBand.y} width={W - PAD.l - PAD.r} height={blueBand.h}
            fill="rgba(130,184,255,0.11)" />

          {/* 高度参考线 */}
          {[0, 30, 60].filter((a) => a <= top).map((a) => (
            <g key={a}>
              <line x1={PAD.l} x2={W - PAD.r} y1={y(a)} y2={y(a)}
                stroke="var(--grid-line)" strokeWidth="0.75"
                strokeDasharray={a === 0 ? '1 5' : '2 6'} />
              <text x={PAD.l + 2} y={y(a) - 4} fontSize="9" fill="var(--axis-text)">{a}°</text>
            </g>
          ))}

          <path d={`${sunLine} L${x(1440)},${horizonY} L${x(0)},${horizonY} Z`}
            fill="url(#trackFill)" />

          <path d={moonLine} fill="none" stroke="url(#trackMoon)" strokeWidth="1.6"
            strokeLinecap="round" strokeDasharray="4 3" opacity="0.85" />
          <path d={sunLine} fill="none" stroke="url(#trackSun)" strokeWidth="2.4"
            strokeLinecap="round" className="draw-in" style={{ '--len': 1400 }} />

          {showNow && (
            <g className="path-now">
              <line x1={nowX} x2={nowX} y1={PAD.t} y2={H - PAD.b}
                stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
              {moonNowAlt > bottom && (
                <circle cx={nowX} cy={y(moonNowAlt)} r="4.5" fill="var(--accent-moon)"
                  stroke="rgba(255,255,255,0.75)" strokeWidth="1.1" />
              )}
              <circle cx={nowX} cy={y(sunNowAlt)} r="5.5" fill="var(--accent-gold)"
                stroke="rgba(255,255,255,0.85)" strokeWidth="1.3" />
            </g>
          )}

          {[0, 6, 12, 18, 24].map((h) => (
            <text key={h} x={x(h * 60)} y={H - 6} textAnchor="middle" fontSize="9.5"
              fill="var(--axis-text)">
              {String(h).padStart(2, '0')}
            </text>
          ))}
        </svg>
      </div>
    </section>
  );
}
