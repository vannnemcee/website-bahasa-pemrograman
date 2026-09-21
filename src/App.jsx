import React, { useState, useEffect, useRef, useCallback } from 'react';
import { lessons } from './data/lessons';
import Header from './components/Header';
import Footer from './components/Footer';
import CategorySelection from './components/CategorySelection';
import CategoryIntro from './components/CategoryIntro';
import LessonList from './components/LessonList';
import LessonDetail from './components/LessonDetail';
import BonusChallenge from './components/BonusChallenge';
import { soundClick, soundSelect, soundBack, soundLaunch, soundHover } from './utils/sounds';
import './styles/global.css';

const STORAGE_KEY = 'pixel-code-progress';
const THEME_KEY = 'pixel-code-theme';
const SOUND_KEY = 'pixel-code-sound';
const totalLessons = Object.values(lessons).reduce((s, arr) => s + arr.length, 0);

/* ===================================================
   LOADING SCREEN — Retro Pixel Arcade Style
   Dengan animasi meluncur ke atas (slide-up) saat selesai
=================================================== */
function LoadingScreen({ isExiting, onTriggerExit }) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('INITIALIZING PIXEL SYSTEM...');
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    const steps = [
      { pct: 18, text: 'LOADING HTML CORE MODULE...' },
      { pct: 38, text: 'LOADING CSS STYLESHEET ENGINE...' },
      { pct: 60, text: 'INITIALIZING JAVASCRIPT RUNTIME...' },
      { pct: 80, text: 'RENDERING RETRO PIXEL CANVAS...' },
      { pct: 95, text: 'QUEST & CHALLENGE DATA LOADED...' },
      { pct: 100, text: 'SYSTEM READY // ALL MODULES OK ✓' },
    ];

    let i = 0;
    let timerId = null;

    const tick = () => {
      if (i >= steps.length) {
        // Otomatis luncurkan animasi ke atas setelah jeda singkat
        timerId = setTimeout(() => {
          if (!hasTriggeredRef.current) {
            hasTriggeredRef.current = true;
            onTriggerExit();
          }
        }, 450);
        return;
      }
      setProgress(steps[i].pct);
      setStatusText(steps[i].text);
      i++;
      timerId = setTimeout(tick, i === steps.length ? 250 : 320);
    };

    timerId = setTimeout(tick, 200);
    return () => clearTimeout(timerId);
  }, [onTriggerExit]);

  // Tombol skip atau klik langsung meluncurkan animasi ke atas
  const handleUserAction = () => {
    if (!hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      setProgress(100);
      setStatusText('LAUNCHING APPLICATION ↗');
      onTriggerExit();
    }
  };

  return (
    <div
      className={`loading-screen ${isExiting ? 'is-exiting-up' : ''}`}
      onClick={handleUserAction}
      role="button"
      tabIndex={0}
      aria-label="Klik untuk memulai aplikasi"
    >
      <div className="pixel-grid-bg" />

      {/* Top bar */}
      <div className="loading-topbar">
        <div className="loading-topbar-left">
          <span className="loading-pulse-dot" />
          <span className="loading-site-id">BELAJAR.KODE // RPL 2026</span>
        </div>
        <div className="loading-topbar-right">
          [ KLIK / TEKAN SPACE UNTUK MASUK ↗ ]
        </div>
      </div>

      {/* Center content */}
      <div className="loading-center">
        <div className="loading-eyebrow">◆ RPL INTERACTIVE EXHIBITION ◆</div>
        <div className="loading-pixel-badge">8-BIT VIRTUAL ACADEMY</div>

        <h1 className="loading-title">
          BELAJAR<br />
          <span className="loading-title-accent">BAHASA</span><br />
          PEMROGRAMAN
        </h1>

        <p className="loading-subtitle">
          HTML5 // CSS3 // MODERN JS // PYTHON
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
        <span>STATUS: READY // UTC+7</span>
        <span>PIXEL TO REALITY ENGINE v2.0</span>
      </div>
    </div>
  );
}

/* ===================================================
   HOME SCREEN — Retro Pixel Hero
=================================================== */
function HomeScreen({ onStart, soundEnabled }) {
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
      <div className="home-decorations">
        {stars.map((s, i) => <span key={i} className="pixel-star" style={s}>★</span>)}
        {codeSymbols.map((c, i) => (
          <span key={`cs-${i}`} className="pixel-code-symbol" style={{ top: c.top, left: c.left, right: c.right }}>{c.text}</span>
        ))}
        <span className="pixel-cursor">█</span>
      </div>

      {/* ── HERO SECTION ── */}
      <div className="home-hero">
        {/* Status badge */}
        <div className="home-status-badge">
          <span className="home-status-pulse" />
          <span>SIAP UNTUK BELAJAR // PIXEL QUEST</span>
        </div>

        {/* Eyebrow */}
        <div className="home-eyebrow">
          ◆ RPL INTERACTIVE EXHIBITION ◆
        </div>

        {/* Judul besar */}
        <h1 className="home-title-main">BELAJAR BAHASA</h1>
        <div className="home-title-accent-wrap">
          <span className="home-title-sub">PEMROGRAMAN</span>
        </div>

        {/* Sub judul */}
        <p className="home-hero-tagline">
          {'<'} <span>Learn.</span> <span>Code.</span> <span>Create.</span> {' />'}
        </p>
        <p className="home-desc">
          Kuasai HTML, CSS, JavaScript &amp; Python melalui<br />
          <span style={{ color: 'var(--color-white)' }}>quest interaktif bergaya pixel game.</span><br />
          Jadikan kode kamu menjadi kenyataan!
        </p>

        {/* CTA Buttons */}
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
            PILIH MATERI ↘
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===================================================
   MAIN APP
=================================================== */
function App() {
  const [loadingState, setLoadingState] = useState('loading'); // 'loading' | 'exiting' | 'done'
  const [screen, setScreen] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const [completedLessons, setCompletedLessons] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completedLessons));
  }, [completedLessons]);

  // Transisi animasi meluncur ke atas
  const handleTriggerExit = useCallback(() => {
    if (loadingState !== 'loading') return;
    if (soundEnabled) soundLaunch();
    setLoadingState('exiting');
    setTimeout(() => {
      setLoadingState('done');
    }, 650);
  }, [loadingState, soundEnabled]);

  // Keyboard shortcut: Space untuk skip loading, Escape untuk kembali
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && loadingState === 'loading') {
        e.preventDefault();
        handleTriggerExit();
      } else if (e.code === 'Escape') {
        if (showResetConfirm) {
          setShowResetConfirm(false);
        } else if (screen === 'lesson-detail' || screen === 'bonus-challenge') {
          setScreen('lesson-list');
          setSelectedLesson(null);
        } else if (screen === 'lesson-list') {
          setScreen('category-intro');
        } else if (screen === 'category-intro') {
          setScreen('category');
          setSelectedCategory(null);
        } else if (screen === 'category') {
          setScreen('home');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [loadingState, showResetConfirm, screen, handleTriggerExit]);

  // Efek suara kursor hover (gaya micro-interaction Razzan Portfolio)
  useEffect(() => {
    if (!soundEnabled) return;

    let lastTarget = null;
    let lastSoundTime = 0;

    const handlePointerOver = (e) => {
      const target = e.target;
      if (!target) return;
      const interactiveEl = target.closest(
        'button, a, .category-card, .lesson-card, .btn, .symbol-btn, .nav-btn, [role="button"], input, select, textarea, .tab-btn, .mobile-tab-btn, .sound-toggle-btn, .theme-toggle-btn'
      );

      if (interactiveEl && interactiveEl !== lastTarget) {
        lastTarget = interactiveEl;
        const now = performance.now();
        // Throttle 45ms agar audio tetap jernih dan bebas distorsi
        if (now - lastSoundTime > 45) {
          lastSoundTime = now;
          soundHover();
        }
      }
    };

    window.addEventListener('pointerover', handlePointerOver, { passive: true });
    return () => {
      window.removeEventListener('pointerover', handlePointerOver);
    };
  }, [soundEnabled]);

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

  function handleGoHome() {
    if (soundEnabled) soundBack();
    setScreen('home');
    setSelectedCategory(null);
    setSelectedLesson(null);
  }

  return (
    <>
      {/* Loading overlay dengan animasi meluncur ke atas saat selesai */}
      {loadingState !== 'done' && (
        <LoadingScreen
          isExiting={loadingState === 'exiting'}
          onTriggerExit={handleTriggerExit}
        />
      )}

      {/* Main app wrapper with upward entrance animation */}
      <div
        className={`app-wrapper ${loadingState === 'exiting' ? 'app-entering-up' : ''}`}
        id="app-root"
      >
        <div className="pixel-grid-bg" />

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

        <main
          className="main-content"
          style={{
            paddingTop: screen === 'home' ? 0 : '24px',
            paddingLeft: screen === 'home' ? 0 : undefined,
            paddingRight: screen === 'home' ? 0 : undefined,
          }}
        >
          {screen === 'home' && (
            <HomeScreen
              onStart={() => setScreen('category')}
              soundEnabled={soundEnabled}
              completedLessons={completedLessons}
            />
          )}
          {screen === 'category' && (
            <CategorySelection
              onSelectCategory={handleSelectCategory}
              completedLessons={completedLessons}
              soundEnabled={soundEnabled}
            />
          )}
          {screen === 'category-intro' && selectedCategory && (
            <CategoryIntro
              category={selectedCategory}
              onStart={handleIntroStart}
              onBack={handleIntroBack}
              soundEnabled={soundEnabled}
            />
          )}
          {screen === 'lesson-list' && selectedCategory && (
            <LessonList
              category={selectedCategory}
              onSelectLesson={handleSelectLesson}
              onBack={handleBackToIntro}
              onSelectBonus={handleSelectBonus}
              completedLessons={completedLessons}
              soundEnabled={soundEnabled}
            />
          )}
          {screen === 'lesson-detail' && selectedCategory && selectedLesson && (
            <LessonDetail
              category={selectedCategory}
              lesson={selectedLesson}
              onBack={handleBackToList}
              onComplete={handleComplete}
              completedLessons={completedLessons}
              soundEnabled={soundEnabled}
            />
          )}
          {screen === 'bonus-challenge' && selectedCategory && (
            <BonusChallenge
              category={selectedCategory}
              onBack={handleBackToList}
              onComplete={handleComplete}
              completedLessons={completedLessons}
              soundEnabled={soundEnabled}
            />
          )}
        </main>

        {/* Global sticky footer — selalu rapi di bagian bawah */}
        <Footer
          screen={screen}
          selectedCategory={selectedCategory}
          onGoHome={handleGoHome}
          onSelectCategory={handleSelectCategory}
          completedLessons={completedLessons}
          totalLessons={totalLessons}
          onResetClick={() => setShowResetConfirm(true)}
          soundEnabled={soundEnabled}
        />

        {showResetConfirm && (
          <div className="modal-overlay" onClick={() => setShowResetConfirm(false)}>
            <div className="modal-box error" onClick={e => e.stopPropagation()}>
              <span className="modal-icon" style={{ color: 'var(--color-yellow)' }}>⚠</span>
              <h2 className="modal-title" style={{ color: 'var(--color-yellow)', fontSize: '11px' }}>RESET PROGRESS?</h2>
              <p className="modal-subtitle">Semua progress belajar quest akan dihapus.<br />Tindakan ini tidak dapat dibatalkan.</p>
              <div className="modal-actions">
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    localStorage.removeItem(STORAGE_KEY);
                    setCompletedLessons([]);
                    setShowResetConfirm(false);
                  }}
                >
                  YA, RESET
                </button>
                <button className="btn btn-ghost" onClick={() => setShowResetConfirm(false)}>BATAL</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
