import React from 'react';
import { categoryInfo } from '../data/lessons';
import { soundTheme, soundClick, soundHover, soundBack, soundSelect } from '../utils/sounds';
import { Sun, Moon, Volume2, VolumeX } from 'lucide-react';
import BrandIcon from './BrandIcon';

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
    // Memberikan feedback audio klik baik saat mengaktifkan maupun mematikan suara
    soundClick();
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

          {/* Kanan: toggle theme & sound (gaya Razzan Portfolio) */}
          <div className="header-controls">
            {/* Theme Toggle (Light / Dark) */}
            <button
              className="icon-btn"
              style={{ borderRadius: '0px' }}
              onClick={handleToggleTheme}
              onMouseEnter={() => { if (soundEnabled) soundHover(); }}
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              aria-label="Toggle Dark/Light Mode"
            >
              {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
            </button>

            {/* Audio Toggle */}
            <button
              className={`icon-btn ${soundEnabled ? '' : 'sound-off'}`}
              style={{ borderRadius: '0px' }}
              onClick={handleToggleSound}
              onMouseEnter={() => { if (soundEnabled) soundHover(); }}
              title={soundEnabled ? 'Sound enabled' : 'Sound muted'}
              aria-label="Toggle Sound Effects"
            >
              {!soundEnabled ? <VolumeX size={14} /> : <Volume2 size={14} />}
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
              <BrandIcon name={cat} size={11} style={{ marginRight: '5px' }} />
              {categoryInfo[cat].label}
            </button>
          ))}
        </nav>

        {/* Controls: progress + theme + sound (gaya Razzan Portfolio) */}
        <div className="header-controls">
          <div className="header-progress">
            <span className="progress-label-full">PROGRESS </span>
            <span className="progress-label-short">LVL </span>
            <span className="progress-num">{overallPercent}%</span>
          </div>

          {/* Theme Toggle (Light / Dark) */}
          <button
            className="icon-btn"
            style={{ borderRadius: '0px' }}
            onClick={handleToggleTheme}
            onMouseEnter={() => { if (soundEnabled) soundHover(); }}
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            aria-label="Toggle Dark/Light Mode"
          >
            {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
          </button>

          {/* Audio Toggle */}
          <button
            className={`icon-btn ${soundEnabled ? '' : 'sound-off'}`}
            style={{ borderRadius: '0px' }}
            onClick={handleToggleSound}
            onMouseEnter={() => { if (soundEnabled) soundHover(); }}
            title={soundEnabled ? 'Sound enabled' : 'Sound muted'}
            aria-label="Toggle Sound Effects"
          >
            {!soundEnabled ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
