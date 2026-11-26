import React from 'react';

function ProgressBar({ completed, total, color = 'var(--accent-primary)', label }) {
  const pct = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;

  return (
    <div className="progress-section">
      <div className="progress-header-row">
        <span>{label || 'Progres Belajar'}</span>
        <span className="tabular-nums" style={{ color }}>
          {pct}%
        </span>
      </div>
      <div className="progress-bar-track">
        <div
          className="progress-bar-fill"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <div className="progress-footer-row">
        <span>{completed} dari {total} misi selesai</span>
        <span>{total - completed} tersisa</span>
      </div>
    </div>
  );
}

export default ProgressBar;
