import React from 'react';

function ProgressBar({ completed, total, color = '#63F5A8', shadowColor = '#2aaa6a', label }) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const filledCount = Math.round(pct / 10);
  const emptyCount = 10 - filledCount;
  const blocks = '█'.repeat(filledCount) + '░'.repeat(emptyCount);

  return (
    <div className="progress-section">
      {label && (
        <div className="progress-label">
          <span>{label}</span>
          <span style={{ color }}>{pct}%</span>
        </div>
      )}
      <div className="progress-bar-track">
        <div
          className="progress-bar-fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <div className="progress-text-row">
        <span style={{ color, fontFamily: "'Press Start 2P', monospace", fontSize: '7px', letterSpacing: '1px' }}>
          {blocks}
        </span>
        <span>{completed} / {total} QUEST CLEARED</span>
      </div>
    </div>
  );
}

export default ProgressBar;
