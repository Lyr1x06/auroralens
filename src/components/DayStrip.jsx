import { useEffect, useMemo, useRef } from 'react';
import { weatherGlyph } from './icons.jsx';

const WEEK = ['日', '一', '二', '三', '四', '五', '六'];

export default function DayStrip({ days, today, activeIdx, onSelect, disabled }) {
  const listRef = useRef(null);

  useEffect(() => {
    const el = listRef.current?.querySelector('.day-chip.active');
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [activeIdx]);

  return (
    <div className="daystrip" ref={listRef} role="tablist" aria-label="选择日期">
      {days.map((d, i) => {
        const isToday = d.date.toDateString() === today.toDateString();
        const Glyph = weatherGlyph(d.code);
        return (
          <button
            key={i}
            role="tab"
            aria-selected={i === activeIdx}
            aria-label={`${isToday ? '今天' : `周${WEEK[d.date.getDay()]}`} ${d.date.getMonth() + 1}月${d.date.getDate()}日`}
            className={`day-chip${i === activeIdx ? ' active' : ''}`}
            onClick={() => onSelect(i)}
            disabled={disabled}
          >
            <span className="d-label">{isToday ? '今天' : `周${WEEK[d.date.getDay()]}`}</span>
            <span className="d-date">{d.date.getDate()}</span>
            <span className="d-glyph"><Glyph size={15} /></span>
            <span className="d-temp">{d.tmax != null ? `${Math.round(d.tmax)}°` : '—'}</span>
          </button>
        );
      })}
    </div>
  );
}

/** 由 App 的 daily 数据派生日条所需结构 */
export function buildDays(daily, fallbackToday) {
  if (!daily) {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(fallbackToday);
      d.setDate(d.getDate() + i);
      return { date: d, code: null, tmax: null };
    });
  }
  return daily.time.map((t, i) => ({
    date: new Date(t + 'T12:00:00'),
    code: daily.weather_code?.[i] ?? null,
    tmax: daily.temperature_2m_max?.[i] ?? null,
  }));
}
