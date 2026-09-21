import React, { useState } from 'react';
import { categoryIntro } from '../data/introData';
import { soundClick, soundSelect } from '../utils/sounds';
import BrandIcon from './BrandIcon';

function CategoryIntro({ category, onStart, onBack, soundEnabled }) {
  const [step, setStep] = useState(0); // 0: overview, 1: kepanjangan, 2: fakta, 3: silabus
  const intro = categoryIntro[category] || categoryIntro.html;
  const totalSteps = 4;

  const stepLabels = ['APA ITU?', 'KEPANJANGAN', 'FAKTA MENARIK', 'SILABUS QUEST'];

  function handleNext() {
    if (soundEnabled) soundClick();
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      if (soundEnabled) soundSelect();
      onStart();
    }
  }

  function handlePrev() {
    if (soundEnabled) soundClick();
    if (step > 0) setStep(step - 1);
    else onBack();
  }

  function handleStepClick(i) {
    if (soundEnabled) soundClick();
    setStep(i);
  }

  const fileNames = {
    html: 'index.html',
    css: 'style.css',
    javascript: 'main.js',
    python: 'main.py',
  };

  const currentFileName = fileNames[category] || 'code.txt';

  return (
    <div className="intro-screen" id="category-intro-screen">
      {/* Top Navigation Bar */}
      <div className="intro-top-bar">
        <button className="btn btn-ghost intro-back-btn" onClick={handlePrev}>
          ← {step === 0 ? 'MENU' : 'PREV'}
        </button>

        {/* Step Indicator Buttons */}
        <div className="intro-steps-container">
          {stepLabels.map((label, i) => (
            <button
              key={i}
              className={`intro-step-pill ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}
              onClick={() => handleStepClick(i)}
              title={label}
            >
              <span className="pill-num">{i < step ? '✓' : `0${i + 1}`}</span>
              <span className="pill-label">{label}</span>
            </button>
          ))}
        </div>

        <div
          className="intro-category-badge"
          style={{ color: intro.color, borderColor: intro.color }}
        >
          <span className="category-badge-icon">
            <BrandIcon name={category} size={14} color={intro.color} />
          </span>
          <span className="category-badge-name">{category.toUpperCase()}</span>
        </div>
      </div>

      {/* Retro Window Card */}
      <div className="intro-window-card">
        {/* Terminal Title Bar */}
        <div className="intro-window-header">
          <div className="window-dots">
            <span className="window-dot dot-close" />
            <span className="window-dot dot-min" />
            <span className="window-dot dot-max" />
          </div>
          <div className="window-title">
            DOCS://{category.toUpperCase()}/{stepLabels[step].replace(/\s+/g, '_')}
          </div>
          <div className="window-step-count">
            STEP {step + 1} / {totalSteps}
          </div>
        </div>

        {/* Card Body */}
        <div className="intro-card-body">
          {/* === STEP 0: APA ITU? === */}
          {step === 0 && (
            <div className="intro-step-content">
              {/* Hero Category Title Block */}
              <div className="intro-hero-block">
                <div
                  className="intro-hero-icon-box"
                  style={{ borderColor: intro.color, color: intro.color }}
                >
                  <BrandIcon name={category} size={28} color={intro.color} />
                </div>
                <div className="intro-hero-info">
                  <div className="intro-hero-type-tag" style={{ color: intro.color }}>
                    {category === 'python' ? 'MODUL PEMROGRAMAN PYTHON' : 'MODUL PEMROGRAMAN WEB'}
                  </div>
                  <h1 className="intro-hero-title" style={{ color: intro.color }}>
                    {category === 'javascript' ? 'JAVASCRIPT' : category.toUpperCase()}
                  </h1>
                  <div className="intro-hero-tagline">{intro.tagline}</div>
                </div>
              </div>

              {/* Structured Info Grid */}
              <div className="intro-specs-grid">
                <div className="intro-spec-item">
                  <span className="spec-label">KEPANJANGAN:</span>
                  <span className="spec-val highlight" style={{ color: intro.color }}>
                    {intro.abbreviation}
                  </span>
                </div>
                <div className="intro-spec-item">
                  <span className="spec-label">TIPE:</span>
                  <span className="spec-val">
                    {category === 'html'
                      ? 'Markup Language (Struktur)'
                      : category === 'css'
                      ? 'Style Sheet (Desain & Tampilan)'
                      : category === 'javascript'
                      ? 'Scripting Language (Interaktif & Logika)'
                      : 'General-Purpose Programming (AI & Data)'}
                  </span>
                </div>
                <div className="intro-spec-item">
                  <span className="spec-label">STATUS:</span>
                  <span className="spec-val">
                    {category === 'python' ? 'Open Source // Python Software Foundation' : 'Standard Web Technology // W3C'}
                  </span>
                </div>
              </div>

              {/* Description Box */}
              <div className="intro-section-block">
                <div className="intro-block-header">
                  <span className="block-header-bullet" style={{ color: intro.color }}>
                    ■
                  </span>
                  <span>PENGERTIAN &amp; PERAN</span>
                </div>
                <div className="intro-block-body">
                  <p className="intro-paragraph">{intro.description}</p>
                </div>
              </div>

              {/* Warning/Note if exists */}
              {intro.catatan && (
                <div className="intro-notice-box">
                  <span className="notice-icon">⚠</span>
                  <span className="notice-text">{intro.catatan}</span>
                </div>
              )}

              {/* Code Preview Terminal */}
              <div className="intro-section-block">
                <div className="intro-block-header">
                  <span className="block-header-bullet" style={{ color: intro.color }}>
                    ■
                  </span>
                  <span>CONTOH KODE DASAR</span>
                  <span className="block-header-file">{currentFileName}</span>
                </div>
                <div className="intro-code-terminal">
                  <div className="terminal-code-scroll">
                    <table className="code-table">
                      <tbody>
                        {intro.example.split('\n').map((line, idx) => (
                          <tr key={idx} className="code-row">
                            <td className="code-num">{idx + 1}</td>
                            <td className="code-content">
                              <code>{line || ' '}</code>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* === STEP 1: KEPANJANGAN === */}
          {step === 1 && (
            <div className="intro-step-content">
              <div className="intro-step-header">
                <h2 className="intro-step-title" style={{ color: intro.color }}>
                  SINGKATAN &amp; MAKNA KATA
                </h2>
                <div className="intro-step-subtitle">
                  Setiap huruf dalam kata <strong style={{ color: intro.color }}>{category.toUpperCase()}</strong> memiliki arti penting:
                </div>
              </div>

              <div className="intro-abbr-full-card" style={{ borderColor: intro.color }}>
                <span className="abbr-label">KEPANJANGAN LENGKAP:</span>
                <span className="abbr-text" style={{ color: intro.color }}>
                  {intro.abbreviation}
                </span>
              </div>

              <div className="intro-kepanjangan-grid">
                {intro.kepanjangan.map((item, i) => (
                  <div
                    key={i}
                    className="intro-kepanjangan-card"
                    style={{ borderLeftColor: intro.color }}
                  >
                    <div
                      className="kepanjangan-letter"
                      style={{
                        background: `${intro.color}15`,
                        borderColor: intro.color,
                        color: intro.color,
                      }}
                    >
                      {item.huruf}
                    </div>
                    <div className="kepanjangan-text-area">
                      <div className="kepanjangan-word" style={{ color: intro.color }}>
                        {item.kata}
                      </div>
                      <div className="kepanjangan-meaning">{item.arti}</div>
                    </div>
                  </div>
                ))}
              </div>

              {intro.catatan && (
                <div className="intro-notice-box" style={{ marginTop: '16px' }}>
                  <span className="notice-icon">⚠</span>
                  <span className="notice-text">{intro.catatan}</span>
                </div>
              )}
            </div>
          )}

          {/* === STEP 2: FAKTA MENARIK === */}
          {step === 2 && (
            <div className="intro-step-content">
              <div className="intro-step-header">
                <h2 className="intro-step-title" style={{ color: intro.color }}>
                  FAKTA MENARIK TENTANG {category.toUpperCase()} ★
                </h2>
                <div className="intro-step-subtitle">
                  Hal-hal unik yang perlu kamu ketahui sebelum mulai coding:
                </div>
              </div>

              <div className="intro-facts-grid">
                {intro.facts.map((fact, i) => (
                  <div key={i} className="intro-fact-card">
                    <div
                      className="fact-order-badge"
                      style={{ borderColor: intro.color, color: intro.color }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <div className="fact-text-content">{fact}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* === STEP 3: SILABUS QUEST === */}
          {step === 3 && (
            <div className="intro-step-content">
              <div className="intro-step-header">
                <h2 className="intro-step-title" style={{ color: intro.color }}>
                  YANG AKAN KAMU PELAJARI
                </h2>
                <div className="intro-step-subtitle">
                  Selesaikan {intro.whatYouLearn.length} quest praktikal untuk menguasai modul ini:
                </div>
              </div>

              <div className="intro-syllabus-grid">
                {intro.whatYouLearn.map((item, i) => (
                  <div key={i} className="intro-syllabus-card">
                    <div className="syllabus-badge" style={{ color: intro.color, borderColor: intro.color }}>
                      Q{i + 1}
                    </div>
                    <div className="syllabus-content">
                      <div className="syllabus-item-label">QUEST 0{i + 1}</div>
                      <div className="syllabus-item-text">{item}</div>
                    </div>
                    <span className="syllabus-check-icon" style={{ color: intro.color }}>
                      ▶
                    </span>
                  </div>
                ))}
              </div>

              <div
                className="intro-ready-banner"
                style={{ borderColor: intro.color, background: `${intro.color}10` }}
              >
                <div className="ready-banner-title" style={{ color: intro.color }}>
                  SIAP UNTUK MEMULAI QUEST?
                </div>
                <div className="ready-banner-desc">
                  Kamu akan menulis kode secara interaktif dan melihat hasilnya secara instan.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Card Footer Navigation */}
        <div className="intro-window-footer">
          <button className="btn btn-ghost intro-nav-prev" onClick={handlePrev}>
            ← {step === 0 ? 'PILIH KATEGORI' : 'SEBELUMNYA'}
          </button>
          <button
            className={`btn ${step === totalSteps - 1 ? 'btn-success' : 'btn-primary'} intro-nav-next`}
            onClick={handleNext}
          >
            {step < totalSteps - 1 ? (
              <>SELANJUTNYA →</>
            ) : (
              <>MULAI QUEST {category.toUpperCase()} ↘</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CategoryIntro;
