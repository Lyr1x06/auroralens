import { useMemo } from 'react';
import { sunAltitude, sunAzimuth, moonAltitude, moonAzimuth } from '../lib/astro.js';
import { fmtDeg } from '../lib/format.js';

/**
 * 天体方位罗盘。
 * 映射：方位角决定圆周角度（正北在上，顺时针），
 *      高度角决定由圆周向外的指针长度（0° = 贴圆，90° = 天顶满长）。
 * 这样方位角始终落在固定半径上，读数不会被高度角干扰。
 */
const CX = 100;
const CY = 100;
const R = 74;          // 方位环半径
const NEEDLE = 30;     // 高度角 90° 时的指针长度

const rad = (az) => ((az - 90) * Math.PI) / 180;

const pt = (az, r) => ({
  x: CX + r * Math.cos(rad(az)),
  y: CY + r * Math.sin(rad(az)),
});

function altHint(alt) {
  if (alt < -6) return '地平线下';
  if (alt < 0) return '地平线附近';
  if (alt < 15) return '贴近地平线';
  if (alt < 45) return '低空';
  if (alt < 70) return '中天';
  return '接近天顶';
}

function Body({ az, alt, color, glow, ringLabel }) {
  const above = alt >= 0;
  const len = (Math.min(90, Math.abs(alt)) / 90) * NEEDLE;
  const inner = pt(az, R);
  const tip = pt(az, above ? R + len : R - len);

  return (
    <g>
      <line
        x1={inner.x} y1={inner.y} x2={tip.x} y2={tip.y}
        stroke={color} strokeWidth="2.4" strokeLinecap="round"
        opacity={above ? 0.95 : 0.45}
        strokeDasharray={above ? undefined : '3 3'}
      />
      {above ? (
        <>
          <circle cx={tip.x} cy={tip.y} r="10" fill={glow} />
          <circle cx={tip.x} cy={tip.y} r="5" fill={color}
            stroke="rgba(255,255,255,0.85)" strokeWidth="1.2" />
        </>
      ) : (
        <circle cx={tip.x} cy={tip.y} r="4" fill="none" stroke={color}
          strokeWidth="1.4" strokeDasharray="2 2" opacity="0.7" />
      )}
      {/* 方位环上的锚点 */}
      <circle cx={inner.x} cy={inner.y} r="2.4" fill={color} opacity={above ? 0.9 : 0.45} />
      <title>{ringLabel}</title>
    </g>
  );
}

export default function CompassCard({ idx, now, lat, lng, loading }) {
  const b = useMemo(() => ({
    sun: { az: sunAzimuth(now, lat, lng), alt: sunAltitude(now, lat, lng) },
    moon: { az: moonAzimuth(now, lat, lng), alt: moonAltitude(now, lat, lng) },
  }), [now, lat, lng]);

  const dirs = [
    { label: '北', az: 0, major: true },
    { label: '东', az: 90 },
    { label: '南', az: 180 },
    { label: '西', az: 270 },
  ];

  if (loading) {
    return (
      <section className="card" style={{ '--i': idx }}>
        <h2 className="card-title">天体方位</h2>
        <div className="sk" style={{ height: 190, borderRadius: '50%', width: 190, margin: '0 auto' }} />
      </section>
    );
  }

  return (
    <section className="card" style={{ '--i': idx }}>
      <h2 className="card-title">天体方位 · 实时</h2>

      <div className="compass-dial">
        <svg viewBox="0 0 200 200" role="img"
          aria-label={`太阳位于${fmtDeg(b.sun.az)}，高度 ${Math.round(b.sun.alt)} 度；月亮位于${fmtDeg(b.moon.az)}，高度 ${Math.round(b.moon.alt)} 度`}>
          <defs>
            <radialGradient id="dialFill" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="rgba(255,255,255,0.02)" />
              <stop offset="0.82" stopColor="rgba(255,255,255,0.05)" />
              <stop offset="1" stopColor="rgba(255,255,255,0.10)" />
            </radialGradient>
          </defs>

          <circle cx={CX} cy={CY} r={R} fill="url(#dialFill)"
            stroke="var(--stroke)" strokeWidth="1" />

          {/* 高度刻度环：30 / 60 / 90 度对应的指针长度 */}
          {[30, 60, 90].map((a) => (
            <circle key={a} cx={CX} cy={CY} r={R + (a / 90) * NEEDLE} fill="none"
              stroke="var(--grid-line)" strokeWidth="0.75"
              strokeDasharray="2 5" opacity={0.8} />
          ))}
          <circle cx={CX} cy={CY} r={R + NEEDLE} fill="none"
            stroke="var(--grid-line)" strokeWidth="0.75" opacity={0.5} />

          {/* 方位刻度 */}
          {Array.from({ length: 24 }, (_, i) => i * 15).map((az) => {
            const major = az % 90 === 0;
            const a = pt(az, R);
            const c = pt(az, R - (major ? 8 : 4));
            return <line key={az} x1={a.x} y1={a.y} x2={c.x} y2={c.y}
              stroke="rgba(255,255,255,0.28)" strokeWidth={major ? 1.4 : 0.8} />;
          })}

          {dirs.map((d) => {
            const p = pt(d.az, R + 15);
            return (
              <text key={d.label} x={p.x} y={p.y + 4} textAnchor="middle"
                fontSize={d.major ? 12 : 10.5}
                fontWeight={d.major ? 650 : 400}
                fill={d.major ? 'var(--ink-hi)' : 'var(--ink-low)'}>
                {d.label}
              </text>
            );
          })}

          <text x={CX} y={CY - R - NEEDLE + 1} textAnchor="middle" fontSize="8"
            fill="var(--ink-faint)">90°</text>

          <Body az={b.sun.az} alt={b.sun.alt}
            color="var(--accent-gold)" glow="rgba(255,196,107,0.26)"
            ringLabel={`太阳 ${fmtDeg(b.sun.az)} ${Math.round(b.sun.alt)}°`} />
          <Body az={b.moon.az} alt={b.moon.alt}
            color="var(--accent-moon)" glow="rgba(223,230,255,0.22)"
            ringLabel={`月亮 ${fmtDeg(b.moon.az)} ${Math.round(b.moon.alt)}°`} />
        </svg>
      </div>

      <div className="readouts">
        <div className="readout">
          <span className="r-dot" style={{ background: 'var(--accent-gold)', boxShadow: '0 0 8px rgba(255,196,107,0.8)' }} />
          <div style={{ minWidth: 0 }}>
            <div className="r-name">太阳</div>
            <div className="r-val">{fmtDeg(b.sun.az)}</div>
            <div className="r-sub">{Math.round(b.sun.alt)}° · {altHint(b.sun.alt)}</div>
          </div>
        </div>
        <div className="readout">
          <span className="r-dot" style={{ background: 'var(--accent-moon)', boxShadow: '0 0 8px rgba(223,230,255,0.7)' }} />
          <div style={{ minWidth: 0 }}>
            <div className="r-name">月亮</div>
            <div className="r-val">{fmtDeg(b.moon.az)}</div>
            <div className="r-sub">{Math.round(b.moon.alt)}° · {altHint(b.moon.alt)}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
