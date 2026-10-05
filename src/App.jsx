import { useMemo, useState } from 'react';
import { useClock } from './hooks/useClock.js';
import { useAppData } from './hooks/useAppData.js';
import { getPhotoWindows, sunAltitude, sunAzimuth } from './lib/astro.js';
import { scoreWindow } from './lib/weather.js';

import SkyCanvas from './components/SkyCanvas.jsx';
import TopBar from './components/TopBar.jsx';
import DayStrip, { buildDays } from './components/DayStrip.jsx';
import HeroCard from './components/HeroCard.jsx';
import TrackCard from './components/TrackCard.jsx';
import MoonCard from './components/MoonCard.jsx';
import CompassCard from './components/CompassCard.jsx';
import ConditionsGrid from './components/ConditionsGrid.jsx';
import VisibilityChart from './components/VisibilityChart.jsx';
import ScoreCard from './components/ScoreCard.jsx';
import WeekStrip from './components/WeekStrip.jsx';
import LocationSheet from './components/LocationSheet.jsx';

export default function App() {
  const now = useClock();
  const { place, data, error, loading, locating, reload, changePlace, locate } = useAppData();
  const [dayIdx, setDayIdx] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);

  const today = useMemo(() => new Date(), []);

  const dayStart = useMemo(() => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    d.setDate(d.getDate() + dayIdx);
    return d;
  }, [now, dayIdx]);

  const selectedDate = useMemo(() => {
    const d = new Date(dayStart);
    d.setHours(12, 0, 0, 0);
    return d;
  }, [dayStart]);

  const windows = useMemo(
    () => (place ? getPhotoWindows(selectedDate, place.lat, place.lng) : null),
    [selectedDate, place],
  );

  const sunAlt = useMemo(() => sunAltitude(now, place.lat, place.lng), [now, place]);
  const sunAz = useMemo(() => sunAzimuth(now, place.lat, place.lng), [now, place]);

  const tzOffsetMin = data?.utc_offset_seconds != null ? data.utc_offset_seconds / 60 : null;

  const score = useMemo(() => {
    if (!data || !windows) return null;
    const best = [
      [windows.golden, '金调 · 日出后'],
      [windows.blue, '蓝调 · 日出前'],
      [windows.goldenEvening, '金调 · 日落前'],
      [windows.blueEvening, '蓝调 · 日落后'],
    ]
      .filter(([w]) => w)
      .map(([w, name]) => ({ name, s: scoreWindow(w, data) }))
      .filter((x) => x.s);
    if (!best.length) return null;
    best.sort((a, b) => b.s.score - a.s.score);
    return { ...best[0].s, windowName: best[0].name };
  }, [data, windows]);

  const days = useMemo(() => buildDays(data?.daily, today), [data, today]);

  const isToday = dayIdx === 0;
  const sunrise = data?.daily?.sunrise?.[dayIdx];
  const sunset = data?.daily?.sunset?.[dayIdx];

  const timeLabel = isToday
    ? `现在 ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    : null;

  return (
    <div className="app">
      <SkyCanvas altitude={sunAlt} sunAz={sunAz} />

      <div className="page">
        <TopBar
          place={place}
          locating={locating}
          onLocate={() => locate().catch(() => alert('定位失败，请检查浏览器权限，或搜索选择地点'))}
          onSearch={() => setSheetOpen(true)}
          timeLabel={timeLabel}
        />

        <DayStrip
          days={days}
          today={today}
          activeIdx={dayIdx}
          onSelect={setDayIdx}
          disabled={!data}
        />

        {error ? (
          <div className="card">
            <div className="state-msg">
              {error}
              <br />
              <button className="retry" onClick={reload}>重试</button>
            </div>
          </div>
        ) : (
          <div className="cols">
            <div className="col-a">
              <HeroCard
                idx={1}
                windows={windows}
                data={data}
                dayIdx={dayIdx}
                now={now}
                dayStart={dayStart}
                tzOffsetMin={tzOffsetMin}
                isToday={isToday}
                loading={loading}
              />
              <TrackCard
                idx={2}
                dayStart={dayStart}
                lat={place.lat}
                lng={place.lng}
                now={now}
                isToday={isToday}
                loading={loading}
              />
              <CompassCard
                idx={3}
                now={now}
                lat={place.lat}
                lng={place.lng}
                loading={loading}
              />
            </div>

            <div className="col-b">
              <ScoreCard idx={4} score={score} loading={loading} />
              <MoonCard
                idx={5}
                date={selectedDate}
                lat={place.lat}
                lng={place.lng}
                tzOffsetMin={tzOffsetMin}
                now={now}
                isToday={isToday}
                loading={loading}
              />
              <ConditionsGrid
                idx={6}
                data={data}
                dayIdx={dayIdx}
                now={now}
                dayStart={dayStart}
                isToday={isToday}
                loading={loading}
              />
              <section className="card" style={{ '--i': 7 }}>
                <h2 className="card-title">能见度 · 24 小时</h2>
                {loading ? (
                  <div className="sk" style={{ height: 120, borderRadius: 'var(--r-md)' }} />
                ) : data ? (
                  <VisibilityChart
                    data={data}
                    dayIdx={dayIdx}
                    now={now}
                    dayStart={dayStart}
                    isToday={isToday}
                    sunrise={sunrise}
                    sunset={sunset}
                  />
                ) : (
                  <div className="state-msg">暂无数据</div>
                )}
              </section>
            </div>
          </div>
        )}

        <WeekStrip
          idx={8}
          data={data}
          today={today}
          lat={place.lat}
          lng={place.lng}
          activeIdx={dayIdx}
          onSelectDay={setDayIdx}
        />
      </div>

      {sheetOpen && (
        <LocationSheet
          onClose={() => setSheetOpen(false)}
          onPick={(p) => { changePlace(p); setSheetOpen(false); setDayIdx(0); }}
        />
      )}
    </div>
  );
}
