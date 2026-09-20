import React from 'react';
import { categoryInfo } from '../data/lessons';
import { soundTheme, soundClick, soundBack, soundSelect } from '../utils/sounds';

function Header({
  screen,
  selectedCategory,
  onGoHome,
  onSelectCategory,
  completedLessons,
  totalLessons,
  theme,
  onToggleTheme,
  soundEnabled,
  onToggleSound,
}) {
  const totalCompleted = completedLessons.length;
  const overallPercent = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;

  function handleToggleTheme() {
    if (soundEnabled) soundTheme();
    onToggleTheme();
  }

  function handleToggleSound() {
    if (soundEnabled) soundClick();
    onToggleSound();
  }

  function handleGoHome() {
    if (soundEnabled) soundBack();
    onGoHome();
  }

  function handleSelectCat(cat) {
    if (soundEnabled) soundSelect();
    onSelectCategory(cat);
  }

  /* ── HOME HEADER — versi minimal ── */
  if (screen === 'home') {
    return (
      <header className="site-header home-header">
        <div className="header-inner">
          {/* Logo kiri */}
          <div className="header-logo" style={{ cursor: 'default' }}>
            BELAJAR <span>KODE</span>
          </div>

          {/* Tengah: tagline kecil */}
          <div style={{
            fontSize: '7px',
            color: 'var(--color-gray)',
            letterSpacing: '2px',
            display: 'none',
          }} className="home-header-tagline">
            RPL INTERACTIVE EXHIBITION
          </div>

          {/* Kanan: toggle sound & theme saja */}
          <div className="header-controls">
            <button
              className={`icon-btn ${soundEnabled ? '' : 'sound-off'}`}
              onClick={handleToggleSound}
              title={soundEnabled ? 'Matikan Suara' : 'Aktifkan Suara'}
              aria-label={soundEnabled ? 'Matikan Suara' : 'Aktifkan Suara'}
            >
              {soundEnabled ? '🔊' : '🔇'}
            </button>
            <button
              className={`icon-btn ${theme === 'light' ? 'theme-light' : 'theme-dark'}`}
              onClick={handleToggleTheme}
              title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
              aria-label={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
            >
              {theme === 'dark' ? '🌙' : '☀️'}
            </button>
          </div>
        </div>
      </header>
    );
  }

  /* ── HEADER BIASA (semua screen lain) ── */
  return (
    <header className="site-header">
      <div className="header-inner">
        {/* Logo */}
        <div
          className="header-logo"
          onClick={handleGoHome}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleGoHome()}
        >
          BELAJAR <span>KODE</span>
        </div>

        {/* Nav Bar */}
        <nav className="header-nav" aria-label="Navigasi Kategori">
          <button
            className={`nav-btn ${screen === 'home' || (screen === 'category' && !selectedCategory) ? 'active' : ''}`}
            onClick={handleGoHome}
          >
            HOME
          </button>
          {Object.keys(categoryInfo).map((cat) => (
            <button
              key={cat}
              className={`nav-btn ${selectedCategory === cat && screen !== 'home' ? `active active-${cat === 'javascript' ? 'js' : cat}` : ''}`}
              onClick={() => handleSelectCat(cat)}
            >
              {categoryInfo[cat].label}
            </button>
          ))}
        </nav>

        {/* Controls: progress + sound + theme */}
        <div className="header-controls">
          <div className="header-progress">
            <span className="progress-label-full">PROGRESS </span>
            <span className="progress-label-short">LVL </span>
            <span className="progress-num">{overallPercent}%</span>
          </div>
          <button
            className={`icon-btn ${soundEnabled ? '' : 'sound-off'}`}
            onClick={handleToggleSound}
            title={soundEnabled ? 'Matikan Suara' : 'Aktifkan Suara'}
            aria-label={soundEnabled ? 'Matikan Suara' : 'Aktifkan Suara'}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
          <button
            className={`icon-btn ${theme === 'light' ? 'theme-light' : 'theme-dark'}`}
            onClick={handleToggleTheme}
            title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
            aria-label={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
          >
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
