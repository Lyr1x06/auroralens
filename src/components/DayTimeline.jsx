import { useMemo } from 'react';
import { fmtTime } from '../lib/format.js';

/**
 * 24h 光窗时间轴。
 * 色段 = 金调 / 蓝调窗口；竖线标记 = 日出 / 日落 / 正午；
 * 极短窗口（蓝调常仅数分钟）给最小可见宽度，由下方图例给出精确时刻。
 */
export default function DayTimeline({ windows, now, dayStart, tzOffsetMin, isToday = true, sunrise, sunset }) {
  const total = 24 * 3600000;
  const pct = (d) => ((d.getTime() - dayStart.getTime()) / total) * 100;
  const clamp = (v) => Math.max(0, Math.min(100, v));

  const segs = useMemo(() => {
    const out = [];
    const push = (w, kind) => {
      if (!w) return;
      const left = clamp(pct(w.start));
      const right = clamp(pct(w.end));
      out.push({ kind, left, width: Math.max(0, right - left) });
    };
    push(windows.blue, 'blue');
    push(windows.golden, 'gold');
    push(windows.goldenEvening, 'gold');
    push(windows.blueEvening, 'blue');
    return out;
  }, [windows, dayStart]);

  const marks = useMemo(() => {
    const m = [];
    const parse = (iso) => {
      if (!iso) return null;
      const [h, mm] = iso.slice(11, 16).split(':').map(Number);
      return (h * 60 + mm) / 1440 * 100;
    };
    const r = parse(sunrise);
    const s = parse(sunset);
    if (r != null) m.push({ pct: r, label: `日出 ${sunrise.slice(11, 16)}` });
    if (s != null) m.push({ pct: s, label: `日落 ${sunset.slice(11, 16)}` });
    return m;
  }, [sunrise, sunset]);

  const legend = [
    windows.blue && { kind: 'blue', name: '蓝调 · 日出前', w: windows.blue },
    windows.golden && { kind: 'gold', name: '金调 · 日出后', w: windows.golden },
    windows.goldenEvening && { kind: 'gold', name: '金调 · 日落前', w: windows.goldenEvening },
    windows.blueEvening && { kind: 'blue', name: '蓝调 · 日落后', w: windows.blueEvening },
  ].filter(Boolean);

  const nowPct = clamp(pct(now));
  const showNow = isToday;

  const aria = [
    sunrise && `日出 ${sunrise.slice(11, 16)}`,
    sunset && `日落 ${sunset.slice(11, 16)}`,
    ...legend.map((l) => `${l.name} ${fmtTime(l.w.start, tzOffsetMin)} 至 ${fmtTime(l.w.end, tzOffsetMin)}`),
  ].filter(Boolean).join('，');

  return (
    <div className="timeline-block">
      <div className="timeline-pins">
        {marks.map((m) => (
          <span key={m.label} className="tl-pin" style={{ left: `${m.pct}%` }}>
            {m.label}
          </span>
        ))}
      </div>

      <div className="timeline" role="img" aria-label={`一天的光线窗口：${aria}`}>
        {segs.map((s, i) => (
          <div
            key={i}
            className={`seg ${s.kind}`}
            style={{ left: `${s.left}%`, width: `${s.width}%`, animationDelay: `${0.28 + i * 0.06}s` }}
          />
        ))}
        {marks.map((m) => (
          <div key={m.label} className="sun-mark" style={{ left: `${m.pct}%` }} />
        ))}
        {showNow && <div className="now" style={{ left: `${nowPct}%` }} />}
      </div>

      <div className="ticks">
        <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span>
      </div>

      {legend.length > 0 && (
        <div className="tl-legend">
          {legend.map((l) => (
            <div className="tl-item" key={l.name}>
              <span className={`tl-swatch ${l.kind}`} />
              <span className="tl-kind">{l.name}</span>
              <span className="tl-time">
                {fmtTime(l.w.start, tzOffsetMin)}–{fmtTime(l.w.end, tzOffsetMin)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
