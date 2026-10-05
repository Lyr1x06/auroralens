import { useId, useMemo } from 'react';
import { moonAltitude, moonAzimuth, moonPhaseInfo, moonTimes } from '../lib/astro.js';
import { fmtTime, fmtDeg } from '../lib/format.js';

/** 月相圆盘：双弧裁剪法（相位 → 明暗分界椭圆半径） */
function MoonDisc({ phase, size = 86 }) {
  const clipId = useId().replace(/:/g, '');
  const r = 40;
  const waxing = phase < 0.5;
  const t = phase < 0.5 ? phase * 2 : (1 - phase) * 2;
  const rx = Math.abs(1 - 2 * t) * r;
  const sweepOuter = waxing ? 0 : 1;
  const innerSweep = (1 - 2 * t) > 0 ? (waxing ? 0 : 1) : (waxing ? 1 : 0);

  const cx = r;
  const d = [
    `M ${cx} 0`,
    `A ${r} ${r} 0 1 ${sweepOuter} ${cx} ${r * 2}`,
    `A ${rx} ${r} 0 0 ${innerSweep} ${cx} 0`,
    'Z',
  ].join(' ');

  return (
    <svg width={size} height={size} viewBox="0 0 84 84" aria-hidden="true">
      <defs>
        <clipPath id={clipId}><circle cx="42" cy="42" r={r} /></clipPath>
        <radialGradient id={`${clipId}-tex`} cx="0.36" cy="0.32" r="0.75">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.6" stopColor="#e8edff" />
          <stop offset="1" stopColor="#c3cbe8" />
        </radialGradient>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <circle cx="42" cy="42" r={r} fill="rgba(223,230,255,0.10)" />
        <g transform="translate(2,2)">
          <path d={d} fill={`url(#${clipId}-tex)`} />
        </g>
      </g>
      <circle cx="42" cy="42" r={r} fill="none" stroke="rgba(223,230,255,0.22)" strokeWidth="1" />
    </svg>
  );
}

export default function MoonCard({ idx, date, lat, lng, tzOffsetMin, now, isToday, loading }) {
  const { phase, fraction, name } = useMemo(() => moonPhaseInfo(date), [date]);
  const times = useMemo(() => moonTimes(date, lat, lng), [date, lat, lng]);

  const live = useMemo(() => (
    isToday
      ? { alt: moonAltitude(now, lat, lng), az: moonAzimuth(now, lat, lng) }
      : null
  ), [isToday, now, lat, lng]);

  if (loading) {
    return (
      <section className="card" style={{ '--i': idx }}>
        <h2 className="card-title">月相</h2>
        <div className="sk-row">
          <div className="sk" style={{ width: 86, height: 86, borderRadius: '50%' }} />
          <div style={{ flex: 1 }}>
            <div className="sk sk-line" style={{ width: 90 }} />
            <div className="sk sk-line" style={{ width: 130, marginTop: 10 }} />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="card" style={{ '--i': idx }}>
      <h2 className="card-title">月相</h2>
      <div className="moon-head">
        <div className="moon-disc-wrap">
          <span className="moon-glow" />
          <MoonDisc phase={phase} />
        </div>
        <div className="moon-meta">
          <div className="m-name">{name}</div>
          <div className="m-frac stat">
            {Math.round(fraction * 100)}<span className="unit">%</span>
            <span style={{ fontSize: 12, color: 'var(--ink-low)', marginLeft: 6, fontWeight: 400 }}>
              照亮
            </span>
          </div>
          <div className="moon-times">
            <span><span className="k">月升</span>{fmtTime(times.rise, tzOffsetMin)}</span>
            <span><span className="k">月落</span>{fmtTime(times.set, tzOffsetMin)}</span>
          </div>
          {live && (
            <div className="moon-times">
              <span><span className="k">当前位置</span>{fmtDeg(live.az)} · {Math.round(live.alt)}°</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
