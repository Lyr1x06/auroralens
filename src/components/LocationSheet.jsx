import { useEffect, useRef, useState } from 'react';
import { searchPlaces } from '../lib/location.js';
import { IconSearch, IconClose, IconChevronRight } from './icons.jsx';

const CLOSE_DRAG = 90;

export default function LocationSheet({ onClose, onPick }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);

  const inputRef = useRef(null);
  const sheetRef = useRef(null);
  const abortRef = useRef(null);
  const dragRef = useRef({ active: false, startY: 0 });

  // 聚焦 + 锁定背景滚动 + Esc 关闭 + 焦点陷阱
  useEffect(() => {
    inputRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab') return;
      const nodes = sheetRef.current?.querySelectorAll(
        'button, input, [href], [tabindex]:not([tabindex="-1"])',
      );
      if (!nodes?.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };

    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  useEffect(() => {
    if (!q.trim()) { setResults([]); setErr(null); return; }
    const id = setTimeout(async () => {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      setBusy(true);
      setErr(null);
      try {
        setResults(await searchPlaces(q, ac.signal));
      } catch (e) {
        if (e.name !== 'AbortError') setErr('搜索失败，请检查网络后重试');
      } finally {
        setBusy(false);
      }
    }, 350);
    return () => clearTimeout(id);
  }, [q]);

  // 拖拽关闭
  const onDragStart = (e) => {
    dragRef.current = { active: true, startY: e.clientY ?? e.touches?.[0]?.clientY ?? 0 };
    setDragging(true);
  };

  const onDragMove = (e) => {
    if (!dragRef.current.active) return;
    const y = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    setDrag(Math.max(0, y - dragRef.current.startY));
  };

  const onDragEnd = () => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    setDragging(false);
    if (drag > CLOSE_DRAG) onClose();
    else setDrag(0);
  };

  return (
    <>
      <div className="sheet-veil" onClick={onClose} />
      <div
        className={`sheet${dragging ? ' dragging' : ''}${!dragging && drag === 0 ? ' settling' : ''}`}
        style={{ transform: `translate(-50%, ${drag}px)` }}
        role="dialog"
        aria-modal="true"
        aria-label="选择地点"
        ref={sheetRef}
      >
        <div
          className="sheet-grab"
          onPointerDown={onDragStart}
          onPointerMove={onDragMove}
          onPointerUp={onDragEnd}
          onPointerCancel={onDragEnd}
          role="presentation"
        >
          <div className="grabber" />
        </div>

        <div className="sheet-head">
          <h2>选择地点</h2>
          <button className="sheet-close" onClick={onClose} aria-label="关闭">
            <IconClose size={17} />
          </button>
        </div>

        <div className="search-box">
          <IconSearch size={17} />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="输入城市名，如：北京、Tokyo…"
            aria-label="搜索城市"
            autoComplete="off"
          />
        </div>

        <ul className="results">
          {busy && <li className="empty">搜索中…</li>}
          {!busy && err && <li className="empty">{err}</li>}
          {!busy && !err && q.trim() && !results.length && (
            <li className="empty">没有找到匹配的地点</li>
          )}
          {!busy && !err && !q.trim() && (
            <li className="empty">输入城市名开始搜索</li>
          )}
          {results.map((r) => (
            <li
              key={r.id}
              tabIndex={0}
              role="button"
              onClick={() => onPick({ name: r.name, lat: r.lat, lng: r.lng })}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onPick({ name: r.name, lat: r.lat, lng: r.lng });
                }
              }}
            >
              <div>
                <div className="r-name">{r.name}</div>
                <div className="r-sub">{[r.admin, r.country].filter(Boolean).join(' · ')}</div>
              </div>
              <span className="r-go"><IconChevronRight size={16} /></span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
