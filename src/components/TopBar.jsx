import { IconLocation, IconSearch, IconChevronRight } from './icons.jsx';

export default function TopBar({ place, locating, onLocate, onSearch, timeLabel }) {
  const coord = `${place.lat.toFixed(2)}° · ${place.lng.toFixed(2)}°`;
  return (
    <header className="topbar">
      <button className="place-btn" onClick={onSearch} aria-label={`当前地点 ${place.name}，点击更换`}>
        <span className="place-name">
          {place.name}
          <IconChevronRight size={16} className="chev" />
        </span>
        <span className="place-coords">
          {coord}{timeLabel ? ` · ${timeLabel}` : ''}
        </span>
      </button>
      <div className="topbar-actions">
        <button
          className="icon-btn"
          onClick={onLocate}
          disabled={locating}
          aria-label="定位到当前位置"
        >
          <span className={locating ? 'spin' : undefined} style={{ display: 'flex' }}>
            <IconLocation size={19} />
          </span>
        </button>
        <button className="icon-btn" onClick={onSearch} aria-label="搜索城市">
          <IconSearch size={19} />
        </button>
      </div>
    </header>
  );
}
