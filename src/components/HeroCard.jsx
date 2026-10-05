import DayTimeline from './DayTimeline.jsx';
import { IconSunrise, IconSunset } from './icons.jsx';

export default function HeroCard({ idx, windows, data, dayIdx, now, dayStart, tzOffsetMin, isToday, loading }) {
  const sunrise = data?.daily?.sunrise?.[dayIdx];
  const sunset = data?.daily?.sunset?.[dayIdx];
  const t = (iso) => (iso ? iso.slice(11, 16) : null);

  if (loading) {
    return (
      <section className="card card-raised" style={{ '--i': idx }}>
        <h2 className="card-title">晨昏与光时刻</h2>
        <div className="hero-times">
          <div className="hero-item">
            <div className="sk sk-line" style={{ width: 52, marginBottom: 12 }} />
            <div className="sk" style={{ height: 44, width: 120 }} />
          </div>
          <div className="hero-divider" />
          <div className="hero-item">
            <div className="sk sk-line" style={{ width: 52, marginBottom: 12 }} />
            <div className="sk" style={{ height: 44, width: 120 }} />
          </div>
        </div>
        <div className="sk sk-block" style={{ height: 40, marginTop: 30 }} />
      </section>
    );
  }

  return (
    <section className="card card-raised" style={{ '--i': idx }}>
      <h2 className="card-title">晨昏与光时刻</h2>

      <div className="hero-times">
        <div className="hero-item">
          <div className="label"><IconSunrise size={13} />日出</div>
          <div className="stat hero-time sun">{t(sunrise) ?? '—'}</div>
        </div>
        <div className="hero-divider" />
        <div className="hero-item">
          <div className="label"><IconSunset size={13} />日落</div>
          <div className="stat hero-time moon">{t(sunset) ?? '—'}</div>
        </div>
      </div>

      <div className="hero-sub">
        <span>白昼 {sunrise && sunset ? dayLen(sunrise, sunset) : '—'}</span>
        <span className="dot" />
        <span>正午 {solarNoon(sunrise, sunset)}</span>
      </div>

      {windows && (
        <DayTimeline
          windows={windows}
          now={now}
          dayStart={dayStart}
          tzOffsetMin={tzOffsetMin}
          isToday={isToday}
          sunrise={sunrise}
          sunset={sunset}
        />
      )}
    </section>
  );
}

function dayLen(sr, ss) {
  const [h1, m1] = sr.slice(11, 16).split(':').map(Number);
  const [h2, m2] = ss.slice(11, 16).split(':').map(Number);
  let mins = h2 * 60 + m2 - (h1 * 60 + m1);
  if (mins < 0) mins += 1440;
  return `${Math.floor(mins / 60)} 小时 ${mins % 60} 分`;
}

function solarNoon(sr, ss) {
  if (!sr || !ss) return '—';
  const [h1, m1] = sr.slice(11, 16).split(':').map(Number);
  const [h2, m2] = ss.slice(11, 16).split(':').map(Number);
  const mid = Math.round((h1 * 60 + m1 + h2 * 60 + m2) / 2);
  return `${String(Math.floor(mid / 60) % 24).padStart(2, '0')}:${String(mid % 60).padStart(2, '0')}`;
}
