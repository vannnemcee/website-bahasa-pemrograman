import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';
import { categoryIntro } from '../data/introData';
import { categoryInfo } from '../data/lessons';
import { soundClick, soundSelect } from '../utils/sounds';
import BrandIcon from './BrandIcon';

const TAB_LABELS = ['Ringkasan', 'Konsep', 'Fakta', 'Daftar Materi'];

function CategoryIntro({ category, onStart, onBack, soundEnabled, theme }) {
  const [step, setStep] = useState(0);
  const intro = categoryIntro[category] || categoryIntro.html;
  const info = categoryInfo[category] || categoryInfo.html;
  const accentColor = theme === 'light' ? info.color : (info.colorDark || info.color);
  const totalSteps = TAB_LABELS.length;

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

  return (
    <div className="intro-screen" id="category-intro-screen">
      <div className="intro-nav-row">
        <button type="button" className="btn btn-ghost btn-sm" onClick={handlePrev}>
          <ArrowLeft size={15} />
          <span>{step === 0 ? 'Daftar Bahasa' : 'Sebelumnya'}</span>
        </button>

        <div className="intro-breadcrumb">
          <BrandIcon name={category} size={16} color={accentColor} />
          <span>{info.label}</span>
          <span>/</span>
          <span>Pengenalan</span>
        </div>
      </div>

      <div className="intro-card">
        <div className="intro-tabs-header">
          <div className="intro-tabs-group" role="tablist" aria-label="Bagian pengenalan materi">
            {TAB_LABELS.map((label, idx) => (
              <button
                key={label}
                type="button"
                role="tab"
                aria-selected={step === idx}
                className={`intro-tab-btn ${step === idx ? 'active' : ''}`}
                onClick={() => {
                  if (soundEnabled) soundClick();
                  setStep(idx);
                }}
              >
                {idx + 1}. {label}
              </button>
            ))}
          </div>
          <div className="intro-step-indicator">
            Langkah {step + 1} dari {totalSteps}
          </div>
        </div>

        <div className="intro-card-body">
          {step === 0 && (
            <>
              <div className="intro-hero-head">
                <div className="category-icon-wrap" style={{ width: 52, height: 52 }}>
                  <BrandIcon name={category} size={28} color={accentColor} />
                </div>
                <div>
                  <h1 className="intro-hero-title">{info.label}</h1>
                  <p className="intro-hero-tagline">{intro.tagline}</p>
                </div>
              </div>

              <div className="intro-specs-row">
                <div className="intro-spec-cell">
                  <span className="intro-spec-label">Nama Lengkap</span>
                  <span className="intro-spec-val">{intro.abbreviation}</span>
                </div>
                <div className="intro-spec-cell">
                  <span className="intro-spec-label">Kategori</span>
                  <span className="intro-spec-val">{intro.typeLabel}</span>
                </div>
                <div className="intro-spec-cell">
                  <span className="intro-spec-label">Ekosistem</span>
                  <span className="intro-spec-val">{intro.ecosystemLabel}</span>
                </div>
              </div>

              <p className="intro-prose">{intro.description}</p>

              {intro.catatan && (
                <div className="intro-notice">
                  <AlertCircle size={18} style={{ flexShrink: 0, color: 'var(--status-warn)' }} />
                  <span>{intro.catatan}</span>
                </div>
              )}

              <div className="code-block-box">
                <div className="code-block-header">
                  <span>Contoh Sintaks Dasar</span>
                  <span>{intro.fileName || info.fileName}</span>
                </div>
                <div style={{ overflowX: 'auto', padding: '10px 0' }}>
                  <table className="code-table">
                    <tbody>
                      {intro.example.split('\n').map((line, idx) => (
                        <tr key={idx}>
                          <td className="code-num">{idx + 1}</td>
                          <td className="code-content">{line || ' '}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div>
                <h2 className="page-title" style={{ fontSize: '13px' }}>
                  Arti dan Fondasi {info.label}
                </h2>
                <p className="intro-prose">
                  Memahami istilah utama di balik {intro.abbreviation} membantu kamu mengenali cara kerja bahasanya.
                </p>
              </div>

              <div className="intro-list-stack">
                {intro.kepanjangan.map((item, idx) => (
                  <div key={idx} className="intro-list-row">
                    <div className="intro-letter-box" style={{ color: accentColor }}>
                      {item.huruf}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                        {item.kata}
                      </div>
                      <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                        {item.arti}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <h2 className="page-title" style={{ fontSize: '13px' }}>
                  Fakta Penting Tentang {info.label}
                </h2>
                <p className="intro-prose">
                  Ringkasan sejarah singkat dan peran {info.label} di dunia pengembangan perangkat lunak.
                </p>
              </div>

              <div className="intro-list-stack">
                {intro.facts.map((fact, idx) => (
                  <div key={idx} className="intro-list-row">
                    <div
                      className="intro-letter-box tabular-nums"
                      style={{ fontSize: '13px', color: accentColor }}
                    >
                      {String(idx + 1).padStart(2, '0')}
                    </div>
                    <div style={{ fontSize: '14.5px', color: 'var(--text-secondary)' }}>
                      {fact}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div>
                <h2 className="page-title" style={{ fontSize: '13px' }}>
                  Daftar Materi Latihan ({intro.whatYouLearn.length} Topik)
                </h2>
                <p className="intro-prose">
                  Kamu akan menyelesaikan latihan kode bertahap dan langsung melihat hasilnya di panel pratinjau.
                </p>
              </div>

              <div className="intro-syllabus-grid">
                {intro.whatYouLearn.map((item, idx) => (
                  <div key={idx} className="intro-syllabus-item">
                    <span className="syllabus-idx" style={{ color: accentColor }}>
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="intro-card-footer">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              if (soundEnabled) soundSelect();
              onStart();
            }}
          >
            <span>Langsung ke Misi {info.label}</span>
            <ArrowRight size={15} />
          </button>

          {step < totalSteps - 1 && (
            <button type="button" className="btn btn-ghost" onClick={handleNext}>
              <span>Tab Berikutnya</span>
              <ArrowRight size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CategoryIntro;
