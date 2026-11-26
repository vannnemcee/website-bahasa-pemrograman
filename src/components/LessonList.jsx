import React from 'react';
import { ArrowLeft, CheckCircle2, Circle, Lock, Sparkles } from 'lucide-react';
import { lessons, categoryInfo } from '../data/lessons';
import ProgressBar from './ProgressBar';
import BrandIcon from './BrandIcon';
import { soundClick, soundBack } from '../utils/sounds';

function LessonList({
  category,
  onSelectLesson,
  onBack,
  onSelectBonus,
  completedLessons,
  soundEnabled,
  theme,
}) {
  const info = categoryInfo[category] || categoryInfo.html;
  const lessonList = lessons[category] || [];
  const done = lessonList.filter((l) =>
    completedLessons.includes(`${category}-${l.id}`)
  ).length;
  const allCleared = done === lessonList.length;
  const bonusKey = `${category}-bonus`;
  const bonusCleared = completedLessons.includes(bonusKey);
  const accentColor = theme === 'light' ? info.color : (info.colorDark || info.color);

  return (
    <div className="lesson-list-screen">
      <div className="lesson-list-topbar">
        <div className="lesson-list-title-group">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => {
              if (soundEnabled) soundBack();
              onBack();
            }}
          >
            <ArrowLeft size={15} />
            <span>Pengenalan</span>
          </button>
          <BrandIcon name={category} size={22} color={accentColor} />
          <h1 className="lesson-list-title">Daftar Misi {info.label}</h1>
        </div>

        <span style={{ fontSize: '13.5px', color: 'var(--text-muted)' }} className="tabular-nums">
          {done} / {lessonList.length} selesai
        </span>
      </div>

      <ProgressBar
        completed={done}
        total={lessonList.length}
        color={accentColor}
        label={`Progres Jalur ${info.label}`}
      />

      <div className="lesson-grid">
        {lessonList.map((lesson, index) => {
          const key = `${category}-${lesson.id}`;
          const isCleared = completedLessons.includes(key);

          return (
            <button
              key={lesson.id}
              type="button"
              className={`lesson-card ${isCleared ? 'cleared' : ''}`}
              onClick={() => {
                if (soundEnabled) soundClick();
                onSelectLesson(lesson);
              }}
            >
              <div className="lesson-number">
                {String(index + 1).padStart(2, '0')}
              </div>
              <div className="lesson-card-body">
                <div className="lesson-card-title">{lesson.title}</div>
                <div className="lesson-card-desc">{lesson.description}</div>
                <div className={`lesson-card-status ${isCleared ? 'is-done' : 'is-todo'}`}>
                  {isCleared ? (
                    <>
                      <CheckCircle2 size={14} />
                      <span>Selesai</span>
                    </>
                  ) : (
                    <>
                      <Circle size={13} />
                      <span>Belum dikerjakan</span>
                    </>
                  )}
                </div>
              </div>
            </button>
          );
        })}

        {allCleared ? (
          <div
            className={`bonus-card ${bonusCleared ? 'cleared' : 'unlocked'}`}
            role="button"
            tabIndex={0}
            onClick={() => {
              if (soundEnabled) soundClick();
              onSelectBonus();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectBonus();
              }
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div className="category-icon-wrap" style={{ color: bonusCleared ? 'var(--status-success)' : accentColor }}>
                <Sparkles size={20} />
              </div>
              <div>
                <div className="lesson-card-title">Tugas Bebas {info.label}</div>
                <div className="lesson-card-desc">
                  {bonusCleared
                    ? 'Tugas bebas sudah diselesaikan. Kamu tetap bisa membuka editor untuk berkreasi ulang.'
                    : `Semua misi ${info.label} selesai! Buka ruang kreasi bebas untuk menulis programmu sendiri.`}
                </div>
              </div>
            </div>
            <span className={`btn btn-sm ${bonusCleared ? 'btn-success' : 'btn-primary'}`}>
              {bonusCleared ? 'Buka Ulang' : 'Mulai Tugas Bebas'}
            </span>
          </div>
        ) : (
          <div className="bonus-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div className="category-icon-wrap" style={{ color: 'var(--text-muted)' }}>
                <Lock size={18} />
              </div>
              <div>
                <div className="lesson-card-title" style={{ color: 'var(--text-secondary)' }}>
                  Tugas Bebas {info.label} (Terkunci)
                </div>
                <div className="lesson-card-desc">
                  Selesaikan {lessonList.length - done} misi lagi untuk membuka tantangan proyek bebas.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LessonList;
