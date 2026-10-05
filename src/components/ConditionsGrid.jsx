import {
  IconEye, IconCloud, IconCloudLow, IconCloudMid, IconCloudHigh,
  IconTemperature, IconHumidity, IconWind, IconUv,
} from './icons.jsx';
import { weatherText } from './weather-text.js';

/**
 * 拍摄环境。信息分层：
 * 关键指标（能见度、总云量、云层结构）占大格，背景信息（温湿风 UV）占小格。
 */
export default function ConditionsGrid({ idx, data, dayIdx, now, dayStart, isToday, loading }) {
  if (loading) {
    return (
      <section className="card" style={{ '--i': idx }}>
        <h2 className="card-title">拍摄环境</h2>
        <div className="conds">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="sk" style={{ height: 74, borderRadius: 'var(--r-md)' }} />
          ))}
        </div>
      </section>
    );
  }

  const H = data?.hourly;
  if (!H) return null;

  const h = isToday
    ? Math.max(0, Math.min(23, Math.floor((now.getTime() - dayStart.getTime()) / 3600000)))
    : 12;
  const at = (f) => H[f]?.[dayIdx * 24 + h];

  const vis = at('visibility');
  const cloud = at('cloud_cover');
  const low = at('cloud_cover_low');
  const mid = at('cloud_cover_mid');
  const high = at('cloud_cover_high');
  const temp = at('temperature_2m');
  const hum = at('relative_humidity_2m');
  const wind = at('wind_speed_10m');
  const uv = at('uv_index');
  const code = at('weather_code');

  const visQuality =
    vis == null ? '' :
    vis >= 20000 ? '通透' :
    vis >= 10000 ? '良好' :
    vis >= 5000 ? '一般' : '偏浊';

  const cloudNote =
    low == null ? '' :
    low > 70 ? '低云遮挡' :
    high != null && high > 30 ? '高云利于染霞' :
    cloud < 25 ? '少云' : '云层适中';

  const small = [
    { Icon: IconTemperature, v: temp != null ? Math.round(temp) : '—', u: '°C', label: '气温' },
    { Icon: IconHumidity, v: hum != null ? Math.round(hum) : '—', u: '%', label: '湿度' },
    { Icon: IconWind, v: wind != null ? Math.round(wind) : '—', u: 'km/h', label: '风速' },
    { Icon: IconUv, v: uv != null ? uv.toFixed(1) : '—', u: '', label: 'UV 指数' },
  ];

  return (
    <section className="card" style={{ '--i': idx }}>
      <h2 className="card-title">
        拍摄环境{isToday ? ' · 当前' : ' · 参考'} {code != null && `· ${weatherText(code)}`}
      </h2>

      <div className="conds">
        <div className="cond cond-hero">
          <span className="c-icon"><IconEye size={22} /></span>
          <div className="c-body">
            <div className="c-value">
              {vis != null ? (vis / 1000).toFixed(vis >= 10000 ? 0 : 1) : '—'}
              <span className="unit">km</span>
            </div>
            <div className="c-label">能见度{visQuality && ` · ${visQuality}`}</div>
          </div>
        </div>

        <div className="cond cond-hero">
          <span className="c-icon"><IconCloud size={22} /></span>
          <div className="c-body">
            <div className="c-value">
              {cloud != null ? Math.round(cloud) : '—'}<span className="unit">%</span>
            </div>
            <div className="c-label">总云量{cloudNote && ` · ${cloudNote}`}</div>
          </div>
        </div>

        <div className="cond">
          <span className="c-icon"><IconCloudLow size={18} /></span>
          <div className="c-value">{low != null ? Math.round(low) : '—'}<span className="unit">%</span></div>
          <div className="c-label">低云</div>
        </div>

        <div className="cond">
          <span className="c-icon"><IconCloudMid size={18} /></span>
          <div className="c-value">{mid != null ? Math.round(mid) : '—'}<span className="unit">%</span></div>
          <div className="c-label">中云</div>
        </div>

        <div className="cond">
          <span className="c-icon"><IconCloudHigh size={18} /></span>
          <div className="c-value">{high != null ? Math.round(high) : '—'}<span className="unit">%</span></div>
          <div className="c-label">高云</div>
        </div>

        {small.map(({ Icon, v, u, label }) => (
          <div className="cond" key={label}>
            <span className="c-icon"><Icon size={18} /></span>
            <div className="c-value">{v}<span className="unit">{u}</span></div>
            <div className="c-label">{label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
