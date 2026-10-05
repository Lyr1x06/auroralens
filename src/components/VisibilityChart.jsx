import { useId } from 'react';
import { fmtKm } from '../lib/format.js';

const W = 420;
const H = 130;
const PAD = { l: 12, r: 12, t: 14, b: 22 };

/** 24h 能见度曲线：夜间时段底纹 + 10km 参考线 + 当前时刻定位 */
export default function VisibilityChart({ data, dayIdx, now, dayStart, isToday, sunrise, sunset }) {
  const uid = useId().replace(/:/g, '');
  const arr = data?.hourly?.visibility;
  if (!arr) return null;

  const slice = Array.from({ length: 24 }, (_, h) => arr[dayIdx * 24 + h]);
  const maxV = Math.max(20000, ...slice.filter((v) => v != null));

  const x = (h) => PAD.l + (h / 23) * (W - PAD.l - PAD.r);
  const y = (v) => H - PAD.b - Math.min(1, Math.max(0, (v ?? 0) / maxV)) * (H - PAD.t - PAD.b);

  const line = slice
    .map((v, h) => `${h ? 'L' : 'M'}${x(h).toFixed(1)},${y(v).toFixed(1)}`)
    .join(' ');

  const nowH = isToday
    ? Math.max(0, Math.min(23, Math.floor((now.getTime() - dayStart.getTime()) / 3600000)))
    : null;

  const hourOf = (iso) => {
    if (!iso) return null;
    const [h, m] = iso.slice(11, 16).split(':').map(Number);
    return h + m / 60;
  };
  const sr = hourOf(sunrise);
  const ss = hourOf(sunset);

  const vals = slice.filter((v) => v != null);
  const best = vals.length ? Math.max(...vals) : null;
  const worst = vals.length ? Math.min(...vals) : null;

  const aria = `24 小时能见度曲线。最好 ${fmtKm(best)}，最差 ${fmtKm(worst)}。`;

  return (
    <>
      <div className="pathwrap">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={aria}>
          <defs>
            <linearGradient id={`${uid}-line`} x1="0" x2="1">
              <stop offset="0" stopColor="var(--accent-azure)" stopOpacity="0.55" />
              <stop offset="1" stopColor="var(--accent-azure)" />
            </linearGradient>
            <linearGradient id={`${uid}-area`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="rgba(130,184,255,0.24)" />
              <stop offset="1" stopColor="rgba(130,184,255,0)" />
            </linearGradient>
          </defs>

          {/* 夜间底纹 */}
          {sr != null && ss != null && (
            <>
              <rect x={x(0)} y={PAD.t} width={Math.max(0, x(sr) - x(0))} height={H - PAD.t - PAD.b}
                fill="rgba(255,255,255,0.035)" />
              <rect x={x(ss)} y={PAD.t} width={Math.max(0, x(23) - x(ss))} height={H - PAD.t - PAD.b}
                fill="rgba(255,255,255,0.035)" />
            </>
          )}

          {/* 参考线 */}
          <line x1={PAD.l} x2={W - PAD.r} y1={y(10000)} y2={y(10000)}
            stroke="var(--grid-line)" strokeWidth="0.75" strokeDasharray="2 5" />
          <text x={W - PAD.r} y={y(10000) - 5} textAnchor="end" fontSize="9" fill="var(--axis-text)">
            10 km
          </text>
          <text x={PAD.l + 2} y={y(maxV) + 10} fontSize="9" fill="var(--axis-text)">
            {fmtKm(maxV)}
          </text>

          <path d={`${line} L${x(23)},${H - PAD.b} L${x(0)},${H - PAD.b} Z`}
            fill={`url(#${uid}-area)`} />
          <path d={line} fill="none" stroke={`url(#${uid}-line)`} strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
            className="draw-in" style={{ '--len': 900 }} />

          {nowH != null && slice[nowH] != null && (
            <g className="path-now">
              <circle cx={x(nowH)} cy={y(slice[nowH])} r="8" fill="rgba(130,184,255,0.22)" />
              <circle cx={x(nowH)} cy={y(slice[nowH])} r="4" fill="var(--accent-azure)"
                stroke="rgba(255,255,255,0.85)" strokeWidth="1.2" />
            </g>
          )}

          {[0, 6, 12, 18, 23].map((h) => (
            <text key={h} x={x(h)} y={H - 6} textAnchor="middle" fontSize="9.5" fill="var(--axis-text)">
              {String(h).padStart(2, '0')}
            </text>
          ))}
        </svg>
      </div>

      <div className="vis-note">
        <span>最佳 {fmtKm(best)}</span>
        {nowH != null && slice[nowH] != null && (
          <span className="vis-now">
            {String(nowH).padStart(2, '0')}:00 时 {fmtKm(slice[nowH])}
          </span>
        )}
        <span>最差 {fmtKm(worst)}</span>
      </div>
    </>
  );
}
