import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { ArrowRight, Play, AlertTriangle } from 'lucide-react';
import { lessons, categoryInfo } from './data/lessons';
import Header from './components/Header';
import Footer from './components/Footer';
import BrandIcon from './components/BrandIcon';
import CategorySelection from './components/CategorySelection';
import CategoryIntro from './components/CategoryIntro';
import LessonList from './components/LessonList';
import LessonDetail from './components/LessonDetail';
import BonusChallenge from './components/BonusChallenge';
import { runPythonCode } from './utils/pythonRunner';
import { runSqlCode } from './utils/sqlRunner';
import { runGoCode } from './utils/goRunner';
import {
  soundClick,
  soundSelect,
  soundBack,
  soundRun,
  soundHover,
  soundLaunch,
  soundTyping,
} from './utils/sounds';
import './styles/global.css';

const STORAGE_KEY = 'pixel-code-progress';
const THEME_KEY = 'pixel-code-theme';
const SOUND_KEY = 'pixel-code-sound';
const totalLessons = Object.values(lessons).reduce((s, arr) => s + arr.length, 0);

const IGNORED_KEYS = new Set([
  'Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Escape',
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
  'Home', 'End', 'PageUp', 'PageDown', 'Insert',
  'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
]);

/* ===================================================
   PIXEL LAUNCH SCREEN — Slide-Up Entrance Transition
=================================================== */
function LaunchScreen({ isExiting, onTriggerExit }) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('MEMUAT MODUL PIXEL...');
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    const steps = [
      { pct: 25, text: 'MEMUAT HTML, CSS & JAVASCRIPT...' },
      { pct: 55, text: 'MENYIAPKAN PYTHON, PHP & TYPESCRIPT...' },
      { pct: 85, text: 'MENYIAPKAN JAVA, C++, GO & SQL...' },
      { pct: 100, text: 'SEMUA MODUL SIAP!' },
    ];

    let i = 0;
    let timerId = null;

    const tick = () => {
      if (i >= steps.length) {
        timerId = setTimeout(() => {
          if (!hasTriggeredRef.current) {
            hasTriggeredRef.current = true;
            onTriggerExit();
          }
        }, 380);
        return;
      }
      setProgress(steps[i].pct);
      setStatusText(steps[i].text);
      i++;
      timerId = setTimeout(tick, i === steps.length ? 220 : 280);
    };

    timerId = setTimeout(tick, 180);
    return () => clearTimeout(timerId);
  }, [onTriggerExit]);

  const handleAction = () => {
    if (!hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      setProgress(100);
      setStatusText('MEMBUKA STUDIO...');
      onTriggerExit();
    }
  };

  return (
    <div
      className={`launch-screen ${isExiting ? 'is-exiting-up' : ''}`}
      onClick={handleAction}
      role="button"
      tabIndex={0}
      aria-label="Klik atau tekan Space untuk masuk ke Belajar Bahasa Pemrograman"
    >
      <div className="launch-topbar">
        <span>BELAJAR BAHASA PEMROGRAMAN</span>
        <span>[ KLIK / TEKAN SPACE UNTUK MASUK ]</span>
      </div>

      <div className="launch-center">
        <div className="launch-kicker">PIXEL INTERACTIVE STUDIO</div>
        <h1 className="launch-title">
          BELAJAR BAHASA<br />
          <span>PEMROGRAMAN</span>
        </h1>
        <p className="launch-subtitle">
          HTML &middot; CSS &middot; JS &middot; TS &middot; Python &middot; PHP &middot; Java &middot; C++ &middot; Go &middot; SQL
        </p>

        <div className="launch-progress-card">
          <div className="launch-progress-meta">
            <span>{statusText}</span>
            <span className="tabular-nums">{progress}%</span>
          </div>
          <div className="launch-bar-track">
            <div className="launch-bar-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="launch-bottombar">
        <span>10 BAHASA &middot; {totalLessons} MISI</span>
        <span>SIAP DIJALANKAN DI BROWSER</span>
      </div>
    </div>
  );
}

const HERO_DEMOS = [
  {
    id: 'python',
    label: 'Python',
    code: 'bahasa = ["Python", "Go", "SQL"]\nfor item in bahasa:\n    print("Belajar:", item)',
  },
  {
    id: 'sql',
    label: 'SQL',
    code: 'SELECT nama, nilai\nFROM siswa\nWHERE nilai >= 85\nORDER BY nilai DESC;',
  },
  {
    id: 'javascript',
    label: 'JavaScript',
    code: 'const angka = [2, 4, 6];\nconst total = angka.reduce((a, b) => a + b, 0);\nconsole.log("Total:", total);',
  },
  {
    id: 'go',
    label: 'Go',
    code: 'package main\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Halo dari Go!")\n}',
  },
];

function evaluateHeroDemo(lang, code) {
  if (!code.trim()) return 'Ketik kode untuk melihat hasil eksekusi.';
  if (lang === 'python') {
    const res = runPythonCode(code);
    if (res.error) return `Error: ${res.error}`;
    return res.output.length ? res.output.join('\n') : '(Selesai tanpa output)';
  }
  if (lang === 'sql') {
    const res = runSqlCode(code);
    if (res.error) return `SQL Error: ${res.error}`;
    if (res.rows && res.rows.length > 0) {
      const header = res.columns.join(' | ');
      const body = res.rows.map((r) => res.columns.map((c) => r[c]).join(' | ')).join('\n');
      return `${header}\n${body}`;
    }
    return res.message || '(0 baris)';
  }
  if (lang === 'go') {
    const res = runGoCode(code);
    if (res.error) return `Error: ${res.error}`;
    return res.output.length ? res.output.join('\n') : '(Selesai tanpa output)';
  }
  if (lang === 'javascript') {
    try {
      const logs = [];
      const customConsole = {
        log: (...args) =>
          logs.push(
            args
              .map((a) => (typeof a === 'object' && a !== null ? JSON.stringify(a) : String(a)))
              .join(' ')
          ),
      };
      const fn = new Function('console', code);
      fn(customConsole);
      return logs.length ? logs.join('\n') : '(Selesai tanpa console.log)';
    } catch (err) {
      return `Error: ${err.message}`;
    }
  }
  return '';
}

function HomeScreen({
  onStartCurriculum,
  onOpenPlayground,
  onSelectCategory,
  completedLessons,
  soundEnabled,
  theme,
}) {
  const [activeTab, setActiveTab] = useState('python');
  const [demoCode, setDemoCode] = useState(HERO_DEMOS[0].code);
  const [demoOutput, setDemoOutput] = useState(() =>
    evaluateHeroDemo(HERO_DEMOS[0].id, HERO_DEMOS[0].code)
  );
  const lastKeyDownRef = useRef(0);

  function handleSelectDemoTab(tab) {
    if (soundEnabled) soundClick();
    setActiveTab(tab.id);
    setDemoCode(tab.code);
    setDemoOutput(evaluateHeroDemo(tab.id, tab.code));
  }

  function handleRunDemo() {
    if (soundEnabled) soundRun();
    setDemoOutput(evaluateHeroDemo(activeTab, demoCode));
  }

  const categories = Object.keys(categoryInfo);

  return (
    <div className="home-screen">
      {/* Two-Column Pixel Hero + Live Interactive Sandbox */}
      <section className="home-hero-grid">
        <div className="home-hero-copy">
          <div className="home-kicker">10 BAHASA &middot; 100 MISI INTERAKTIF</div>
          <h1 className="home-title">
            BELAJAR BAHASA <span>PEMROGRAMAN</span>
          </h1>
          <p className="home-desc">
            Kuasai HTML, CSS, JavaScript, TypeScript, Python, PHP, Java, C++, Go, dan SQL
            secara bertahap langsung di browser dengan pratinjau instan dan pengecekan otomatis.
          </p>
          <div className="home-cta-row">
            <button
              type="button"
              id="btn-start-learning"
              className="btn btn-primary"
              onClick={() => {
                if (soundEnabled) soundSelect();
                onStartCurriculum();
              }}
            >
              <span>Mulai Belajar</span>
              <ArrowRight size={16} />
            </button>
            <button
              type="button"
              className="home-text-link"
              onClick={() => {
                if (soundEnabled) soundClick();
                onOpenPlayground();
              }}
            >
              <span>Buka Playground Bebas</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>

        {/* Live Editable Mini Sandbox */}
        <div className="home-demo-card">
          <div className="demo-tabs-bar">
            <div className="demo-tabs-list" role="tablist" aria-label="Contoh bahasa">
              {HERO_DEMOS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  className={`demo-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => handleSelectDemoTab(tab)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              style={{ minHeight: 30, padding: '5px 12px', fontSize: '12px' }}
              onClick={handleRunDemo}
            >
              <Play size={12} />
              <span>Jalankan</span>
            </button>
          </div>

          <textarea
            className="demo-code-area"
            value={demoCode}
            onKeyDown={(e) => {
              if (!IGNORED_KEYS.has(e.key) && e.key !== 'Unidentified' && soundEnabled) {
                lastKeyDownRef.current = performance.now();
                soundTyping(e.key);
              }
            }}
            onChange={(e) => {
              const next = e.target.value;
              if (soundEnabled && next !== demoCode && performance.now() - lastKeyDownRef.current > 40) {
                soundTyping();
              }
              setDemoCode(next);
            }}
            spellCheck={false}
            aria-label="Editor contoh interaktif"
          />

          <div className="demo-output-bar">
            <div className="demo-output-label">
              <span>Output Eksekusi</span>
              <span>Edit kode lalu tekan Jalankan</span>
            </div>
            <pre className="demo-output-box">{demoOutput}</pre>
          </div>
        </div>
      </section>

      {/* Metrics Strip */}
      <section className="metrics-strip" aria-label="Ringkasan platform">
        <div className="metric-cell">
          <span className="metric-value">10</span>
          <span className="metric-label">Jalur bahasa pemrograman</span>
        </div>
        <div className="metric-cell">
          <span className="metric-value">{totalLessons}</span>
          <span className="metric-label">Misi latihan interaktif</span>
        </div>
        <div className="metric-cell">
          <span className="metric-value">10</span>
          <span className="metric-label">Tantangan proyek bebas</span>
        </div>
        <div className="metric-cell">
          <span className="metric-value">0 setup</span>
          <span className="metric-label">Berjalan langsung di browser</span>
        </div>
      </section>

      {/* All 10 Language Tracks */}
      <section className="home-tracks-section">
        <div className="section-heading-row">
          <div>
            <h2 className="section-heading">Pilih Jalur Bahasa</h2>
            <p className="section-subheading">
              Setiap jalur berisi pengenalan konsep, 10 misi praktik, dan ruang tugas bebas.
            </p>
          </div>
          <button
            type="button"
            className="home-text-link"
            onClick={() => {
              if (soundEnabled) soundSelect();
              onStartCurriculum();
            }}
          >
            <span>Lihat semua kurikulum</span>
            <ArrowRight size={15} />
          </button>
        </div>

        <div className="home-tracks-grid">
          {categories.map((cat) => {
            const info = categoryInfo[cat];
            const accentColor = theme === 'light' ? info.color : (info.colorDark || info.color);
            const total = lessons[cat].length;
            const done = lessons[cat].filter((l) =>
              completedLessons.includes(`${cat}-${l.id}`)
            ).length;

            return (
              <button
                key={cat}
                type="button"
                className="home-track-tile"
                onClick={() => {
                  if (soundEnabled) soundSelect();
                  onSelectCategory(cat);
                }}
              >
                <div className="home-track-head">
                  <BrandIcon name={cat} size={20} color={accentColor} />
                  <span className="home-track-meta">
                    {done}/{total}
                  </span>
                </div>
                <div>
                  <div className="home-track-name">{info.label}</div>
                  <div className="home-track-meta">{info.subtitle}</div>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

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
    try {
      return localStorage.getItem(THEME_KEY) || 'dark';
    } catch {
      return 'dark';
    }
  });

  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      const s = localStorage.getItem(SOUND_KEY);
      return s === null ? true : s === 'true';
    } catch {
      return true;
    }
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

  const regularCompletedCount = useMemo(
    () => completedLessons.filter((key) => !key.endsWith('-bonus')).length,
    [completedLessons]
  );

  const handleTriggerExit = useCallback(() => {
    if (loadingState !== 'loading') return;
    if (soundEnabled) soundLaunch();
    setLoadingState('exiting');
    setTimeout(() => {
      setLoadingState('done');
    }, 620);
  }, [loadingState, soundEnabled]);

  // Keyboard shortcuts: Space to skip launch splash, Escape to navigate back
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && loadingState === 'loading') {
        e.preventDefault();
        handleTriggerExit();
        return;
      }
      if (e.code !== 'Escape') return;
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
      } else if (screen === 'category' || screen === 'playground') {
        setScreen('home');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [loadingState, showResetConfirm, screen, handleTriggerExit]);

  // Subtle hover feedback audio when enabled
  useEffect(() => {
    if (!soundEnabled) return;
    let lastTarget = null;
    let lastSoundTime = 0;

    const handlePointerOver = (e) => {
      const target = e.target;
      if (!target) return;
      const interactiveEl = target.closest(
        'button, a, [role="button"], .category-card, .lesson-card, .home-track-tile'
      );
      if (interactiveEl && interactiveEl !== lastTarget) {
        lastTarget = interactiveEl;
        const now = performance.now();
        if (now - lastSoundTime > 65) {
          lastSoundTime = now;
          soundHover();
        }
      }
    };

    window.addEventListener('pointerover', handlePointerOver, { passive: true });
    return () => window.removeEventListener('pointerover', handlePointerOver);
  }, [soundEnabled]);

  function handleComplete(lessonKey) {
    setCompletedLessons((prev) => (prev.includes(lessonKey) ? prev : [...prev, lessonKey]));
  }

  function handleSelectCategory(cat) {
    setSelectedCategory(cat);
    setSelectedLesson(null);
    setScreen('category-intro');
  }

  function handleSelectLesson(lesson) {
    setSelectedLesson(lesson);
    setScreen('lesson-detail');
  }

  function handleGoHome() {
    setScreen('home');
    setSelectedCategory(null);
    setSelectedLesson(null);
  }

  function handleOpenCurriculum() {
    setSelectedLesson(null);
    setScreen('category');
  }

  function handleOpenPlayground() {
    setSelectedLesson(null);
    setScreen('playground');
  }

  const transitionKey = `${screen}-${selectedCategory || ''}-${selectedLesson?.id || ''}`;

  return (
    <>
      {loadingState !== 'done' && (
        <LaunchScreen
          isExiting={loadingState === 'exiting'}
          onTriggerExit={handleTriggerExit}
        />
      )}

      <div
        className={`app-wrapper ${loadingState === 'exiting' ? 'app-entering-up' : ''}`}
        id="app-root"
      >
        <Header
          screen={screen}
          onGoHome={handleGoHome}
          onOpenCurriculum={handleOpenCurriculum}
          onOpenPlayground={handleOpenPlayground}
          theme={theme}
          onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled((s) => !s)}
        />

        <main className="main-content">
          <div key={transitionKey} className="screen-enter-up">
            {screen === 'home' && (
              <HomeScreen
                onStartCurriculum={handleOpenCurriculum}
                onOpenPlayground={handleOpenPlayground}
                onSelectCategory={handleSelectCategory}
                completedLessons={completedLessons}
                soundEnabled={soundEnabled}
                theme={theme}
              />
            )}

            {screen === 'category' && (
              <CategorySelection
                onSelectCategory={handleSelectCategory}
                completedLessons={completedLessons}
                soundEnabled={soundEnabled}
                theme={theme}
              />
            )}

            {screen === 'category-intro' && selectedCategory && (
              <CategoryIntro
                category={selectedCategory}
                onStart={() => setScreen('lesson-list')}
                onBack={() => {
                  setScreen('category');
                  setSelectedCategory(null);
                }}
                soundEnabled={soundEnabled}
                theme={theme}
              />
            )}

            {screen === 'lesson-list' && selectedCategory && (
              <LessonList
                category={selectedCategory}
                onSelectLesson={handleSelectLesson}
                onBack={() => {
                  if (soundEnabled) soundBack();
                  setScreen('category-intro');
                }}
                onSelectBonus={() => {
                  if (soundEnabled) soundClick();
                  setScreen('bonus-challenge');
                }}
                completedLessons={completedLessons}
                soundEnabled={soundEnabled}
                theme={theme}
              />
            )}

            {screen === 'lesson-detail' && selectedCategory && selectedLesson && (
              <LessonDetail
                category={selectedCategory}
                lesson={selectedLesson}
                onBack={() => {
                  setSelectedLesson(null);
                  setScreen('lesson-list');
                }}
                onSelectLesson={handleSelectLesson}
                onComplete={handleComplete}
                completedLessons={completedLessons}
                soundEnabled={soundEnabled}
                theme={theme}
              />
            )}

            {screen === 'bonus-challenge' && selectedCategory && (
              <BonusChallenge
                mode="bonus"
                category={selectedCategory}
                onBack={() => setScreen('lesson-list')}
                onComplete={handleComplete}
                completedLessons={completedLessons}
                soundEnabled={soundEnabled}
                theme={theme}
              />
            )}

            {screen === 'playground' && (
              <BonusChallenge
                mode="playground"
                category={selectedCategory || 'javascript'}
                soundEnabled={soundEnabled}
                theme={theme}
              />
            )}
          </div>
        </main>

        <Footer
          completedCount={regularCompletedCount}
          totalLessons={totalLessons}
          onResetClick={() => setShowResetConfirm(true)}
        />

        {showResetConfirm && (
          <div className="modal-overlay" onClick={() => setShowResetConfirm(false)}>
            <div
              className="modal-box"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              <div className="modal-icon-circle warn">
                <AlertTriangle size={22} />
              </div>
              <h2 className="modal-title">Reset Progres Belajar?</h2>
              <p className="modal-subtitle">
                Semua catatan misi yang telah diselesaikan akan dihapus dari browser ini dan tidak dapat dikembalikan.
              </p>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => {
                    localStorage.removeItem(STORAGE_KEY);
                    setCompletedLessons([]);
                    setShowResetConfirm(false);
                  }}
                >
                  Ya, Reset Progres
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowResetConfirm(false)}
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
