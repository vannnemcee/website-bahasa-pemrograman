import React from 'react';
import { Sun, Moon, Volume2, VolumeX } from 'lucide-react';
import { soundTheme, soundClick, soundBack, soundSelect } from '../utils/sounds';

function Header({
  screen,
  onGoHome,
  onOpenCurriculum,
  onOpenPlayground,
  theme,
  onToggleTheme,
  soundEnabled,
  onToggleSound,
}) {
  function handleToggleTheme() {
    if (soundEnabled) soundTheme();
    onToggleTheme();
  }

  function handleToggleSound() {
    soundClick();
    onToggleSound();
  }

  function handleGoHome() {
    if (soundEnabled) soundBack();
    onGoHome();
  }

  function handleCurriculum() {
    if (soundEnabled) soundSelect();
    onOpenCurriculum();
  }

  function handlePlayground() {
    if (soundEnabled) soundClick();
    onOpenPlayground();
  }

  const isCurriculumActive =
    screen === 'category' ||
    screen === 'category-intro' ||
    screen === 'lesson-list' ||
    screen === 'lesson-detail' ||
    screen === 'bonus-challenge';

  return (
    <header className="site-header">
      <div className="header-inner">
        {/* Zone 1: Brand Title */}
        <button
          type="button"
          className="header-logo"
          onClick={handleGoHome}
          title="Belajar Bahasa Pemrograman"
        >
          <span className="header-logo-full">
            Belajar <span>Bahasa Pemrograman</span>
          </span>
          <span className="header-logo-short">
            Belajar <span>Kode</span>
          </span>
        </button>

        {/* Zone 2: Clean Nav Links */}
        <nav className="header-nav" aria-label="Navigasi utama">
          <button
            type="button"
            className={`nav-link ${screen === 'home' ? 'active' : ''}`}
            onClick={handleGoHome}
          >
            Beranda
          </button>
          <button
            type="button"
            className={`nav-link ${isCurriculumActive ? 'active' : ''}`}
            onClick={handleCurriculum}
          >
            Kurikulum
          </button>
          <button
            type="button"
            className={`nav-link ${screen === 'playground' ? 'active' : ''}`}
            onClick={handlePlayground}
          >
            Playground
          </button>
        </nav>

        {/* Zone 3: Theme/Sound Icon Toggles + 1 Primary CTA */}
        <div className="header-actions">
          <button
            type="button"
            className="icon-btn"
            onClick={handleToggleTheme}
            title={theme === 'light' ? 'Ganti ke mode gelap' : 'Ganti ke mode terang'}
            aria-label={theme === 'light' ? 'Ganti ke mode gelap' : 'Ganti ke mode terang'}
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          <button
            type="button"
            className={`icon-btn ${soundEnabled ? '' : 'is-muted'}`}
            onClick={handleToggleSound}
            title={soundEnabled ? 'Matikan efek suara' : 'Aktifkan efek suara'}
            aria-label={soundEnabled ? 'Matikan efek suara' : 'Aktifkan efek suara'}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          <button
            type="button"
            className="btn btn-primary btn-sm header-cta-desktop"
            onClick={handleCurriculum}
          >
            Mulai Belajar
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
