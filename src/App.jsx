import React, { useState, useEffect } from 'react';
import { lessons } from './data/lessons';
import Header from './components/Header';
import CategorySelection from './components/CategorySelection';
import CategoryIntro from './components/CategoryIntro';
import LessonList from './components/LessonList';
import LessonDetail from './components/LessonDetail';
import BonusChallenge from './components/BonusChallenge';
import { soundClick, soundSelect, soundBack } from './utils/sounds';
import './styles/global.css';

const STORAGE_KEY = 'pixel-code-progress';
const THEME_KEY = 'pixel-code-theme';
const SOUND_KEY = 'pixel-code-sound';
const totalLessons = Object.values(lessons).reduce((s, arr) => s + arr.length, 0);

/* ===================================================
   LOADING SCREEN — terinspirasi dari Razzan Portfolio
   Muncul 1x saat pertama buka web
=================================================== */
function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('INITIALIZING SYSTEM...');

  const steps = [
    { pct: 15, text: 'LOADING HTML MODULE...' },
    { pct: 35, text: 'LOADING CSS MODULE...' },
    { pct: 55, text: 'LOADING JAVASCRIPT MODULE...' },
    { pct: 75, text: 'RENDERING PIXEL ENGINE...' },
    { pct: 90, text: 'QUEST DATA LOADED...' },
    { pct: 100, text: 'SYSTEM READY ✓' },
  ];

  useEffect(() => {
    let i = 0;
    const tick = () => {
      if (i >= steps.length) {
        setTimeout(onComplete, 500);
        return;
      }
      setProgress(steps[i].pct);
      setStatusText(steps[i].text);
      i++;
      setTimeout(tick, i === steps.length ? 300 : 350);
    };
    const t = setTimeout(tick, 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="loading-screen" onClick={progress === 100 ? onComplete : undefined}>
      {/* Top bar */}
      <div className="loading-topbar">
        <div className="loading-topbar-left">
          <span className="loading-pulse-dot" />
          <span className="loading-site-id">BELAJAR.KODE // 2026</span>
        </div>
        <div className="loading-topbar-right">[CLICK / SPACE TO SKIP]</div>
      </div>

      {/* Center content */}
      <div className="loading-center">
        <div className="loading-eyebrow">◆ RPL INTERACTIVE EXHIBITION ◆</div>
        <h1 className="loading-title">
          BELAJAR<br />
          <span className="loading-title-accent">BAHASA</span><br />
          PEMROGRAMAN
        </h1>
        <p className="loading-subtitle">
          HTML // CSS // JAVASCRIPT
        </p>

        {/* Progress bar */}
        <div className="loading-progress-wrap">
          <div className="loading-progress-header">
            <span className="loading-status">{statusText}</span>
            <span className="loading-pct">{progress}%</span>
          </div>
          <div className="loading-bar-track">
            <div
              className="loading-bar-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="loading-bottombar">
        <span>JAKARTA (UTC+7)</span>
        <span>PIXEL TO REALITY ENGINE</span>
      </div>
    </div>
  );
}

/* ===================================================
   HOME SCREEN — layout ala Razzan dengan pixel twist
=================================================== */
function HomeScreen({ onStart, soundEnabled, completedLessons }) {
  const totalDone = completedLessons.length;
  const overallPct = totalLessons > 0 ? Math.round((totalDone / totalLessons) * 100) : 0;

  const stars = [
    { top: '12%', left: '4%' }, { top: '18%', right: '7%' },
    { top: '35%', left: '10%' }, { top: '62%', right: '4%' },
    { top: '78%', left: '6%' }, { top: '48%', right: '12%' },
    { top: '25%', left: '88%' }, { top: '70%', left: '92%' },
  ];
  const codeSymbols = [
    { top: '20%', left: '2%', text: '</>' }, { top: '68%', left: '5%', text: '{;}' },
    { top: '28%', right: '3%', text: '< >' }, { top: '72%', right: '5%', text: '{ }' },
    { top: '55%', left: '1%', text: '#' }, { top: '42%', right: '2%', text: '//' },
  ];

  return (
    <div className="home-screen">
      <div className="pixel-grid-bg" />
      <div className="home-decorations">
        {stars.map((s, i) => <span key={i} className="pixel-star" style={s}>★</span>)}
        {codeSymbols.map((c, i) => (
          <span key={`cs-${i}`} className="pixel-code-symbol" style={{ top: c.top, left: c.left, right: c.right }}>{c.text}</span>
        ))}
        <span className="pixel-cursor">█</span>
      </div>

      {/* ── HERO SECTION ── */}
      <div className="home-hero">
        {/* Status badge ala Razzan */}
        <div className="home-status-badge">
          <span className="home-status-pulse" />
          <span>SIAP UNTUK BELAJAR</span>
        </div>

        {/* Eyebrow */}
        <div className="home-eyebrow">
          ◆ RPL INTERACTIVE EXHIBITION ◆
        </div>

        {/* Judul besar — tipe Razzan */}
        <h1 className="home-title-main">BELAJAR BAHASA</h1>
        <div className="home-title-accent-wrap">
          <span className="home-title-sub">PEMROGRAMAN</span>
        </div>

        {/* Sub judul */}
        <p className="home-hero-tagline">
          {'<'} <span>Learn.</span> <span>Code.</span> <span>Create.</span> {' />'}
        </p>
        <p className="home-desc">
          Kuasai HTML, CSS &amp; JavaScript melalui<br />
          <span style={{ color: 'var(--color-white)' }}>quest interaktif bergaya pixel game.</span><br />
          Jadikan kode kamu menjadi kenyataan!
        </p>

        {/* CTA Buttons — layout ala Razzan */}
        <div className="home-cta-row">
          <button
            id="btn-start-learning"
            className="btn home-btn-primary"
            onClick={() => { if (soundEnabled) soundSelect(); onStart(); }}
          >
            MULAI BELAJAR ↘
          </button>
          <button
            className="btn home-btn-secondary"
            onClick={() => { if (soundEnabled) soundSelect(); onStart(); }}
          >
            LIHAT MATERI ↘
          </button>
        </div>
      </div>

      {/* ── BOTTOM INFO BAR ala Razzan ── */}
      <div className="home-bottom-bar">
        <div className="home-bottom-left">
          <span className="home-bottom-icon">▶</span>
          <span className="home-bottom-stack-label">MATERI:</span>
          <span className="home-bottom-stack">HTML • CSS • JavaScript</span>
        </div>
        <div className="home-bottom-right">
          {overallPct > 0 && <span>PROGRESS: {overallPct}%</span>}
          <span>QUEST: {totalDone}/{totalLessons} CLEARED</span>
        </div>
      </div>
    </div>
  );
}

/* ===================================================
   MAIN APP
=================================================== */
function App() {
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem(THEME_KEY) || 'dark'; } catch { return 'dark'; }
  });
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      const s = localStorage.getItem(SOUND_KEY);
      return s === null ? true : s === 'true';
    } catch { return true; }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(SOUND_KEY, String(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setCompletedLessons(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completedLessons));
  }, [completedLessons]);

  // Space key shortcut to skip loading
  useEffect(() => {
    if (!loading) return;
    const fn = (e) => { if (e.code === 'Space') setLoading(false); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [loading]);

  function handleComplete(lessonKey) {
    setCompletedLessons((prev) => prev.includes(lessonKey) ? prev : [...prev, lessonKey]);
  }

  function handleSelectCategory(cat) {
    if (soundEnabled) soundSelect();
    setSelectedCategory(cat);
    setSelectedLesson(null);
    setScreen('category-intro');
  }

  function handleIntroStart() { setScreen('lesson-list'); }
  function handleIntroBack() { setScreen('category'); setSelectedCategory(null); }

  function handleSelectLesson(lesson) {
    if (soundEnabled) soundClick();
    setSelectedLesson(lesson);
    setScreen('lesson-detail');
  }

  function handleSelectBonus() {
    if (soundEnabled) soundClick();
    setScreen('bonus-challenge');
  }

  function handleBackToList() {
    if (soundEnabled) soundBack();
    setSelectedLesson(null);
    setScreen('lesson-list');
  }

  function handleBackToIntro() {
    if (soundEnabled) soundBack();
    setScreen('category-intro');
  }

  function handleBackToCategory() {
    if (soundEnabled) soundBack();
    setSelectedLesson(null);
    setSelectedCategory(null);
    setScreen('category');
  }

  function handleGoHome() {
    if (soundEnabled) soundBack();
    setScreen('home');
    setSelectedCategory(null);
    setSelectedLesson(null);
  }

  if (loading) {
    return <LoadingScreen onComplete={() => setLoading(false)} />;
  }

  return (
    <div className="app-wrapper">
      <div className="pixel-grid-bg" style={{ display: screen === 'home' ? 'none' : 'block' }} />

      <Header
        screen={screen}
        selectedCategory={selectedCategory}
        onGoHome={handleGoHome}
        onSelectCategory={handleSelectCategory}
        completedLessons={completedLessons}
        totalLessons={totalLessons}
        theme={theme}
        onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(s => !s)}
      />

      <main className="main-content" style={{ paddingTop: screen === 'home' ? 0 : '24px', paddingLeft: screen === 'home' ? 0 : undefined, paddingRight: screen === 'home' ? 0 : undefined }}>
        {screen === 'home' && (
          <HomeScreen onStart={() => setScreen('category')} soundEnabled={soundEnabled} completedLessons={completedLessons} />
        )}
        {screen === 'category' && (
          <CategorySelection onSelectCategory={handleSelectCategory} completedLessons={completedLessons} soundEnabled={soundEnabled} />
        )}
        {screen === 'category-intro' && selectedCategory && (
          <CategoryIntro category={selectedCategory} onStart={handleIntroStart} onBack={handleIntroBack} soundEnabled={soundEnabled} />
        )}
        {screen === 'lesson-list' && selectedCategory && (
          <LessonList category={selectedCategory} onSelectLesson={handleSelectLesson} onBack={handleBackToIntro} onSelectBonus={handleSelectBonus} completedLessons={completedLessons} soundEnabled={soundEnabled} />
        )}
        {screen === 'lesson-detail' && selectedCategory && selectedLesson && (
          <LessonDetail category={selectedCategory} lesson={selectedLesson} onBack={handleBackToList} onComplete={handleComplete} completedLessons={completedLessons} soundEnabled={soundEnabled} />
        )}
        {screen === 'bonus-challenge' && selectedCategory && (
          <BonusChallenge category={selectedCategory} onBack={handleBackToList} onComplete={handleComplete} completedLessons={completedLessons} soundEnabled={soundEnabled} />
        )}
      </main>

      {screen !== 'home' && (
        <footer style={{ textAlign: 'center', padding: '16px', borderTop: '2px solid var(--bg-panel-light)', marginTop: '32px' }}>
          <button className="btn btn-ghost" style={{ fontSize: '7px' }} onClick={() => { if (soundEnabled) soundClick(); setShowResetConfirm(true); }}>
            ⚠ RESET PROGRESS
          </button>
        </footer>
      )}

      {showResetConfirm && (
        <div className="modal-overlay" onClick={() => setShowResetConfirm(false)}>
          <div className="modal-box error" onClick={e => e.stopPropagation()}>
            <span className="modal-icon" style={{ color: 'var(--color-yellow)' }}>⚠</span>
            <h2 className="modal-title" style={{ color: 'var(--color-yellow)', fontSize: '11px' }}>RESET PROGRESS?</h2>
            <p className="modal-subtitle">Semua progress akan dihapus.<br />Tindakan ini tidak dapat dibatalkan.</p>
            <div className="modal-actions">
              <button className="btn btn-danger" onClick={() => { localStorage.removeItem(STORAGE_KEY); setCompletedLessons([]); setShowResetConfirm(false); }}>YA, RESET</button>
              <button className="btn btn-ghost" onClick={() => setShowResetConfirm(false)}>BATAL</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
