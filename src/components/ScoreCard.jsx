export default function ScoreCard({ idx, score, loading }) {
  const R = 45, CX = 53, CY = 53, SW = 6;
  const C = 2 * Math.PI * R;
  const pct = score ? score.score / 100 : 0;
  const dash = C * pct;

  const gradId = score
    ? score.score >= 70 ? 'scoreGood' : score.score >= 45 ? 'scoreMid' : 'scoreBad'
    : null;

  const glow =
    !score ? 'none' :
    score.score >= 70 ? 'rgba(255,180,100,0.4)' :
    score.score >= 45 ? 'rgba(130,184,255,0.35)' : 'rgba(150,140,255,0.3)';

  if (loading) {
    return (
      <section className="card" style={{ '--i': idx }}>
        <h2 className="card-title">光线窗口评分</h2>
        <div className="sk-row">
          <div className="sk" style={{ width: 106, height: 106, borderRadius: '50%' }} />
          <div style={{ flex: 1 }}>
            <div className="sk sk-line" style={{ width: 120 }} />
            <div className="sk sk-line" style={{ width: 170, marginTop: 10 }} />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="card" style={{ '--i': idx }}>
      <h2 className="card-title">光线窗口评分</h2>

      {!score ? (
        <div className="state-msg">今天没有可用的金调或蓝调窗口</div>
      ) : (
        <>
          <div className="score-head">
            <div className="score-ring">
              <svg className="ring" viewBox="0 0 106 106" aria-hidden="true">
                <defs>
                  <linearGradient id="scoreGood" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#ffd98a" /><stop offset="1" stopColor="#ff9d4d" />
                  </linearGradient>
                  <linearGradient id="scoreMid" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#9ecbff" /><stop offset="1" stopColor="#7fb5ff" />
                  </linearGradient>
                  <linearGradient id="scoreBad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#b3a6ff" /><stop offset="1" stopColor="#8f8aff" />
                  </linearGradient>
                </defs>
                <g transform={`rotate(-90 ${CX} ${CY})`}>
                  <circle cx={CX} cy={CY} r={R} fill="none"
                    stroke="rgba(255,255,255,0.08)" strokeWidth={SW} />
                  <circle cx={CX} cy={CY} r={R} fill="none" stroke={`url(#${gradId})`}
                    strokeWidth={SW} strokeLinecap="round"
                    strokeDasharray={`${dash} ${C}`}
                    style={{
                      transition: 'stroke-dasharray 0.9s var(--ease-out)',
                      filter: `drop-shadow(0 0 5px ${glow})`,
                    }} />
                </g>
              </svg>
              <div className="num">
                {score.score}<span className="u">分</span>
              </div>
              <div className="cap">OUT OF 100</div>
            </div>

            <div style={{ minWidth: 0 }}>
              <div className="score-verdict">{score.verdict}</div>
              <div className="score-sub">
                最佳窗口 · {score.windowName}
                <br />
                综合云况、能见度与降水
              </div>
            </div>
          </div>

          <ul className="score-factors">
            {score.factors.map((f, i) => (
              <li key={f.label} className={f.good ? 'good' : 'bad'} style={{ '--fi': i }}>
                {f.label}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
