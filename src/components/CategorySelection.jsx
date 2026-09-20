import React from 'react';
import { lessons, categoryInfo } from '../data/lessons';
import ProgressBar from './ProgressBar';
import { soundSelect } from '../utils/sounds';

function CategorySelection({ onSelectCategory, completedLessons, soundEnabled }) {
  const categories = Object.keys(categoryInfo);

  function getCompletedCount(cat) {
    return lessons[cat].filter((l) =>
      completedLessons.includes(`${cat}-${l.id}`)
    ).length;
  }

  const totalAll = Object.values(lessons).reduce((s, arr) => s + arr.length, 0);
  const totalCompleted = completedLessons.length;

  return (
    <div className="category-screen">
      <div className="screen-title">
        <h1 className="glow-blue">CHOOSE YOUR PATH</h1>
        <p>Pilih kategori untuk memulai quest</p>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto 32px', padding: '0 8px' }}>
        <ProgressBar
          completed={totalCompleted}
          total={totalAll}
          color="#7B61FF"
          label="OVERALL PROGRESS"
        />
      </div>

      <div className="category-grid">
        {categories.map((cat) => {
          const info = categoryInfo[cat];
          const done = getCompletedCount(cat);
          const total = lessons[cat].length;
          const pct = total > 0 ? Math.round((done / total) * 100) : 0;

          return (
            <div
              key={cat}
              className={`category-card ${cat}-card`}
              onClick={() => { if(soundEnabled) soundSelect(); onSelectCategory(cat); }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onSelectCategory(cat)}
            >
              <span className="category-icon" style={{ color: info.color }}>
                {info.icon}
              </span>
              <span className="category-label" style={{ color: info.color }}>
                {info.label}
              </span>
              <span className="category-subtitle">{info.subtitle}</span>
              <p className="category-desc">{info.description}</p>

              <div className="category-progress-bar">
                <div
                  className="category-progress-fill"
                  style={{ width: `${pct}%`, background: info.color }}
                />
              </div>
              <p className="category-progress-text" style={{ color: info.color }}>
                {done}/{total} CLEARED
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CategorySelection;
