import React from 'react';
import { lessons, categoryInfo } from '../data/lessons';
import ProgressBar from './ProgressBar';
import { soundClick, soundBack } from '../utils/sounds';

function LessonList({ category, onSelectLesson, onBack, onSelectBonus, completedLessons, soundEnabled }) {
  const info = categoryInfo[category];
  const lessonList = lessons[category];
  const done = lessonList.filter((l) =>
    completedLessons.includes(`${category}-${l.id}`)
  ).length;
  const allCleared = done === lessonList.length;
  const bonusKey = `${category}-bonus`;
  const bonusCleared = completedLessons.includes(bonusKey);

  const colorMap = {
    html: '#FF667D',
    css: '#4CC9F0',
    javascript: '#FFD166',
  };
  const catColor = colorMap[category] || '#4CC9F0';

  return (
    <div className="lesson-list-screen">
      <div className="lesson-list-header">
        <button
          className="btn btn-ghost"
          onClick={() => { if (soundEnabled) soundBack(); onBack(); }}
        >
          ← BACK
        </button>
        <h1 className="lesson-list-title" style={{ color: catColor, fontSize: '12px' }}>
          {info.label} QUESTS
        </h1>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <ProgressBar
          completed={done}
          total={lessonList.length}
          color={catColor}
          label={`${info.label} PROGRESS`}
        />
      </div>

      <div className="lesson-grid">
        {/* Regular lesson cards */}
        {lessonList.map((lesson, index) => {
          const key = `${category}-${lesson.id}`;
          const isCleared = completedLessons.includes(key);

          return (
            <div
              key={lesson.id}
              className={`lesson-card ${isCleared ? 'cleared' : ''}`}
              onClick={() => { if (soundEnabled) soundClick(); onSelectLesson(lesson); }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onSelectLesson(lesson)}
            >
              <div className="lesson-number">
                {String(index + 1).padStart(2, '0')}
              </div>
              <div className="lesson-info">
                <div className="lesson-title">{lesson.title.toUpperCase()}</div>
                <div className={`lesson-status ${isCleared ? 'status-cleared' : 'not-cleared'}`}>
                  {isCleared ? '✓ CLEARED' : '○ NOT CLEARED'}
                </div>
                <div style={{ fontSize: '7px', color: 'var(--color-gray)', marginTop: '6px', lineHeight: '1.8' }}>
                  {lesson.description}
                </div>
              </div>
            </div>
          );
        })}

        {/* ===== TUGAS TAMBAHAN CARD ===== */}
        {allCleared ? (
          /* Unlocked bonus */
          <div
            className={`lesson-card bonus-card ${bonusCleared ? 'cleared' : ''}`}
            onClick={() => { if (soundEnabled) soundClick(); onSelectBonus(); }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onSelectBonus()}
          >
            <div
              className="lesson-number"
              style={{
                color: bonusCleared ? 'var(--color-green)' : 'var(--color-purple)',
                borderColor: bonusCleared ? 'var(--color-green)' : 'var(--color-purple)',
                fontSize: '14px',
              }}
            >
              🏆
            </div>
            <div className="lesson-info">
              <div
                className="lesson-title"
                style={{ color: bonusCleared ? 'var(--color-green)' : 'var(--color-purple)' }}
              >
                TUGAS BEBAS {info.label.toUpperCase()}
              </div>
              <div
                className="lesson-status"
                style={{ color: bonusCleared ? 'var(--color-green)' : 'var(--color-purple)' }}
              >
                {bonusCleared ? '✓ SELESAI' : '★ BONUS UNLOCKED!'}
              </div>
              <div style={{ fontSize: '7px', color: 'var(--color-gray)', marginTop: '6px', lineHeight: '1.8' }}>
                {bonusCleared
                  ? 'Kamu sudah menyelesaikan tugas bebas ini!'
                  : `Selesaikan semua quest dan buat karya ${info.label} bebas!`}
              </div>
            </div>
          </div>
        ) : (
          /* Locked bonus */
          <div className="bonus-lock-overlay">
            <div
              className="lesson-number"
              style={{ color: 'var(--color-gray)', borderColor: 'var(--color-gray)', fontSize: '14px' }}
            >
              🔒
            </div>
            <div>
              <div className="lesson-title" style={{ color: 'var(--color-gray)', marginBottom: '6px' }}>
                TUGAS BEBAS {info.label.toUpperCase()}
              </div>
              <div className="bonus-lock-text">
                Selesaikan semua {lessonList.length} quest untuk membuka tugas ini.<br />
                Sisa: {lessonList.length - done} quest lagi.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LessonList;
