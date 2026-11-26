import React, { useState } from 'react';
import { lessons, categoryInfo } from '../data/lessons';
import ProgressBar from './ProgressBar';
import BrandIcon from './BrandIcon';
import { soundSelect, soundClick } from '../utils/sounds';

const FILTER_OPTIONS = [
  { id: 'all', label: 'Semua' },
  { id: 'web', label: 'Web Frontend' },
  { id: 'backend', label: 'Backend & Sistem' },
  { id: 'data', label: 'Data & Query' },
];

function CategorySelection({ onSelectCategory, completedLessons, soundEnabled, theme }) {
  const [filter, setFilter] = useState('all');
  const categories = Object.keys(categoryInfo);

  const visibleCategories = categories.filter((cat) =>
    filter === 'all' ? true : categoryInfo[cat].group === filter
  );

  function getCompletedCount(cat) {
    return lessons[cat].filter((l) =>
      completedLessons.includes(`${cat}-${l.id}`)
    ).length;
  }

  const totalAll = Object.values(lessons).reduce((s, arr) => s + arr.length, 0);
  const regularCompletedCount = completedLessons.filter(
    (key) => !key.endsWith('-bonus')
  ).length;

  return (
    <div className="category-screen">
      <div className="page-header-block">
        <div>
          <h1 className="page-title">Kurikulum Bahasa Pemrograman</h1>
          <p className="page-subtitle">
            Pilih salah satu dari 10 jalur bahasa interaktif untuk memulai panduan dan latihan bertahap.
          </p>
        </div>

        <div className="filter-segmented" role="tablist" aria-label="Filter kategori bahasa">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              role="tab"
              aria-selected={filter === opt.id}
              className={`filter-seg-btn ${filter === opt.id ? 'active' : ''}`}
              onClick={() => {
                if (soundEnabled) soundClick();
                setFilter(opt.id);
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <ProgressBar
        completed={regularCompletedCount}
        total={totalAll}
        color="var(--accent-primary)"
        label="Total Progres Kurikulum"
      />

      <div className="category-grid">
        {visibleCategories.map((cat) => {
          const info = categoryInfo[cat];
          const done = getCompletedCount(cat);
          const total = lessons[cat].length;
          const pct = total > 0 ? Math.round((done / total) * 100) : 0;
          const accentColor = theme === 'light' ? info.color : (info.colorDark || info.color);

          return (
            <button
              key={cat}
              type="button"
              className="category-card"
              style={{ '--cat-color': accentColor }}
              onClick={() => {
                if (soundEnabled) soundSelect();
                onSelectCategory(cat);
              }}
            >
              <div className="category-card-top">
                <div className="category-icon-wrap">
                  <BrandIcon name={cat} size={22} color={accentColor} />
                </div>
                <div>
                  <div className="category-card-title">{info.label}</div>
                  <div className="category-card-meta">
                    {info.subtitle} &middot; {info.fileName}
                  </div>
                </div>
              </div>

              <p className="category-card-desc">{info.description}</p>

              <div className="category-card-footer">
                <div className="mini-progress-track">
                  <div
                    className="mini-progress-fill"
                    style={{ width: `${pct}%`, backgroundColor: accentColor }}
                  />
                </div>
                <div className="category-progress-row">
                  <span>{done} / {total} misi selesai</span>
                  <span style={{ color: done === total ? 'var(--status-success)' : undefined }}>
                    {pct}%
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default CategorySelection;
