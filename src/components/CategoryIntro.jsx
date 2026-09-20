import React, { useState } from 'react';
import { categoryIntro } from '../data/introData';
import { soundClick, soundSelect } from '../utils/sounds';

function CategoryIntro({ category, onStart, onBack, soundEnabled }) {
  const [step, setStep] = useState(0); // 0: overview, 1: kepanjangan, 2: fakta, 3: silabus
  const intro = categoryIntro[category];
  const totalSteps = 4;

  const stepLabels = ['APA ITU?', 'KEPANJANGAN', 'FAKTA MENARIK', 'YANG AKAN DIPELAJARI'];

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

  return (
    <div className="intro-screen">
      {/* Header */}
      <div className="intro-top-bar">
        <button className="btn btn-ghost" onClick={handlePrev}>
          ← {step === 0 ? 'BACK' : 'SEBELUMNYA'}
        </button>

        {/* Step indicator */}
        <div className="intro-steps">
          {stepLabels.map((label, i) => (
            <button
              key={i}
              className={`intro-step-dot ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}
              onClick={() => handleStepClick(i)}
              title={label}
            >
              {i < step ? '✓' : i + 1}
            </button>
          ))}
        </div>

        <div
          className="intro-category-badge"
          style={{ color: intro.color, borderColor: intro.color }}
        >
          {intro.icon} {category.toUpperCase()}
        </div>
      </div>

      {/* Step Label */}
      <div className="intro-step-label" style={{ color: intro.color }}>
        PANDUAN {String(step + 1).padStart(2, '0')} / {totalSteps} — {stepLabels[step]}
      </div>

      {/* === STEP 0: APA ITU? === */}
      {step === 0 && (
        <div className="intro-card">
          <div className="intro-icon-big" style={{ color: intro.color }}>
            {intro.icon}
          </div>
          <h1 className="intro-title" style={{ color: intro.color }}>
            {category === 'javascript' ? 'JAVASCRIPT' : category.toUpperCase()}
          </h1>
          <div className="intro-full-name" style={{ borderColor: intro.color }}>
            <span className="intro-full-name-label">Kepanjangan:</span>
            <span className="intro-full-name-text" style={{ color: intro.color }}>
              {intro.abbreviation}
            </span>
          </div>
          <div className="intro-tagline">
            {intro.tagline}
          </div>
          <p className="intro-description">
            {intro.description}
          </p>
          {intro.catatan && (
            <div className="intro-warning-box">
              {intro.catatan}
            </div>
          )}
          {/* Example code */}
          <div className="intro-example-block">
            <span className="pixel-label">◆ CONTOH KODE</span>
            <pre className="intro-code-preview">{intro.example}</pre>
          </div>
        </div>
      )}

      {/* === STEP 1: KEPANJANGAN === */}
      {step === 1 && (
        <div className="intro-card">
          <h2 className="intro-section-title" style={{ color: intro.color }}>
            APA SINGKATAN {category === 'javascript' ? 'JS' : category.toUpperCase()}?
          </h2>
          {intro.abbreviation && (
            <div className="intro-abbr-full" style={{ color: intro.color }}>
              {intro.abbreviation}
            </div>
          )}
          <div className="intro-kepanjangan-list">
            {intro.kepanjangan.map((item, i) => (
              <div
                key={i}
                className="intro-kepanjangan-item"
                style={{ animationDelay: `${i * 0.1}s`, borderColor: intro.color }}
              >
                <div className="kepanjangan-huruf" style={{ background: intro.color, color: '#080C16' }}>
                  {item.huruf}
                </div>
                <div className="kepanjangan-content">
                  <div className="kepanjangan-kata" style={{ color: intro.color }}>
                    {item.kata}
                  </div>
                  <div className="kepanjangan-arti">
                    {item.arti}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {intro.catatan && (
            <div className="intro-warning-box" style={{ marginTop: '20px' }}>
              {intro.catatan}
            </div>
          )}
        </div>
      )}

      {/* === STEP 2: FAKTA MENARIK === */}
      {step === 2 && (
        <div className="intro-card">
          <h2 className="intro-section-title" style={{ color: intro.color }}>
            FAKTA MENARIK ★
          </h2>
          <div className="intro-facts-list">
            {intro.facts.map((fact, i) => (
              <div
                key={i}
                className="intro-fact-item"
                style={{ animationDelay: `${i * 0.12}s` }}
              >
                <div
                  className="fact-number"
                  style={{ color: intro.color, borderColor: intro.color }}
                >
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div className="fact-text">{fact}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* === STEP 3: YANG AKAN DIPELAJARI === */}
      {step === 3 && (
        <div className="intro-card">
          <h2 className="intro-section-title" style={{ color: intro.color }}>
            YANG AKAN KAMU PELAJARI
          </h2>
          <p className="intro-description" style={{ marginBottom: '24px' }}>
            Dalam kategori ini kamu akan mempelajari {intro.whatYouLearn.length} materi dasar:
          </p>
          <div className="intro-syllabus-list">
            {intro.whatYouLearn.map((item, i) => (
              <div
                key={i}
                className="intro-syllabus-item"
                style={{ animationDelay: `${i * 0.1}s`, borderLeftColor: intro.color }}
              >
                <span className="syllabus-check" style={{ color: intro.color }}>◆</span>
                <span className="syllabus-text">{item}</span>
              </div>
            ))}
          </div>

          <div className="intro-ready-box" style={{ borderColor: intro.color, background: `${intro.color}11` }}>
            <span style={{ fontSize: '8px', color: intro.color, letterSpacing: '2px' }}>
              SIAP UNTUK MULAI QUEST?
            </span>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="intro-nav-buttons">
        {step < totalSteps - 1 ? (
          <button className="btn btn-primary" onClick={handleNext} style={{ flex: 1, maxWidth: 300 }}>
            SELANJUTNYA →
          </button>
        ) : (
          <button
            className="btn btn-success btn-lg"
            onClick={handleNext}
            style={{ flex: 1, maxWidth: 400 }}
          >
            ▶ MULAI BELAJAR {category === 'javascript' ? 'JS' : category.toUpperCase()}!
          </button>
        )}
      </div>
    </div>
  );
}

export default CategoryIntro;
