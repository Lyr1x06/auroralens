import { useMemo } from 'react';
import { weatherGlyph } from './icons.jsx';
import { getPhotoWindows } from '../lib/astro.js';
import { dayLabel, shortDate } from '../lib/format.js';

const WEEK = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

/**
 * 7 天概览。与顶部日期条的分工：
 * 日期条负责「选哪一天」，这里负责「哪一天值得去」——
 * 每列给出当日 24h 光窗迷你条 + 温区，供横向比较。
 */
export default function WeekStrip({ idx, data, today, lat, lng, onSelectDay, activeIdx }) {
  const days = useMemo(() => {
    const d = data?.daily;
    if (!d) return [];
    return d.time.map((t, i) => {
      const date = new Date(t + 'T12:00:00');
      const w = getPhotoWindows(date, lat, lng);
      const dur = (x) => (x ? (x.end - x.start) / 60000 : 0);
      const totalMin = dur(w.golden) + dur(w.blue) + dur(w.goldenEvening) + dur(w.blueEvening);
      return {
        date,
        dayStart: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        code: d.weather_code[i],
        tmax: d.temperature_2m_max[i],
        tmin: d.temperature_2m_min[i],
        sunrise: d.sunrise[i].slice(11, 16),
        sunset: d.sunset[i].slice(11, 16),
        windows: w,
        totalMin,
        best: Math.max(dur(w.golden), dur(w.goldenEvening), dur(w.blue), dur(w.blueEvening)),
      };
    });
  }, [data, lat, lng]);

  if (!days.length) return null;

  const maxBest = Math.max(...days.map((d) => d.best), 1);

  return (
    <section className="card" style={{ '--i': idx }}>
      <h2 className="card-title">7 天光窗概览</h2>
      <div className="week">
        {days.map((d, i) => {
          const Glyph = weatherGlyph(d.code);
          const isToday = d.date.toDateString() === today.toDateString();
          const pctOf = (x) => (x ? ((x.getTime() - d.dayStart.getTime()) / 86400000) * 100 : null);
          return (
            <button
              key={i}
              className={`week-col${i === activeIdx ? ' active' : ''}`}
              onClick={() => onSelectDay(i)}
              aria-label={`${dayLabel(d.date, today)} ${shortDate(d.date)}，日出 ${d.sunrise}，日落 ${d.sunset}`}
              aria-pressed={i === activeIdx}
            >
              <div className="week-top">
                <span className="w-day">{isToday ? '今天' : WEEK[d.date.getDay()]}</span>
                <span className="w-date">{shortDate(d.date)}</span>
              </div>

              <div className="week-mid">
                <span className="w-glyph"><Glyph size={19} /></span>
                <span className="w-temp">
                  {Math.round(d.tmax)}°<span className="lo">{Math.round(d.tmin)}°</span>
                </span>
              </div>

              <div className="mini-tl">
                {[
                  [d.windows.blue, 'blue'],
                  [d.windows.golden, 'gold'],
                  [d.windows.goldenEvening, 'gold'],
                  [d.windows.blueEvening, 'blue'],
                ].map(([w, kind], k) => {
                  if (!w) return null;
                  const l = pctOf(w.start);
                  const r = pctOf(w.end);
                  return (
                    <span key={k} className={`seg ${kind}`}
                      style={{ left: `${Math.max(0, Math.min(100, l))}%`, width: `${Math.max(0.8, r - l)}%` }} />
                  );
                })}
              </div>

              <div className="w-note">
                光窗 {Math.round(d.totalMin)} 分
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
