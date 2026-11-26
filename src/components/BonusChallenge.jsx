import React, { useState } from 'react';
import { ArrowLeft, Play, RotateCcw, CheckCircle2, FileCode2 } from 'lucide-react';
import { categoryIntro } from '../data/introData';
import { categoryInfo } from '../data/lessons';
import CodeEditor from './CodeEditor';
import CodePreview from './CodePreview';
import BrandIcon from './BrandIcon';
import { soundRun, soundSuccess, soundClick, soundBack } from '../utils/sounds';

const PLAYGROUND_SAMPLES = {
  html: `<h1>Halo Dunia</h1>\n<p>Ini adalah halaman web pertamaku.</p>\n<button>Klik Saya</button>`,
  css: `color: #f8fafc;\nbackground-color: #0284c7;\nborder: 2px solid #38bdf8;\nborder-radius: 10px;\npadding: 18px 28px;`,
  javascript: `const nama = "Budi";\nfor (let i = 1; i <= 3; i++) {\n  console.log("Langkah " + i + ": Halo " + nama);\n}`,
  typescript: `interface Siswa {\n  nama: string;\n  nilai: number;\n}\n\nconst murid: Siswa = { nama: "Siti", nilai: 94 };\nconsole.log(\`\${murid.nama}: \${murid.nilai}\`);`,
  python: `buah = ["Apel", "Jeruk", "Mangga"]\nfor item in buah:\n    print("Buah:", item)`,
  php: `<?php\n$nama = "Budi";\nfor ($i = 1; $i <= 3; $i++) {\n  echo "Baris $i - Halo " . $nama;\n}\n?>`,
  java: `public class Main {\n  public static void main(String[] args) {\n    String bahasa = "Java";\n    for (int i = 1; i <= 3; i++) {\n      System.out.println(i + ". Belajar " + bahasa);\n    }\n  }\n}`,
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n  for (int i = 1; i <= 3; i++) {\n    cout << "Iterasi " << i << endl;\n  }\n  return 0;\n}`,
  go: `package main\nimport "fmt"\n\nfunc main() {\n  bahasa := []string{"Go", "Cepat", "Ringkas"}\n  for i, kata := range bahasa {\n    fmt.Println(i, kata)\n  }\n}`,
  sql: `SELECT nama, kelas, nilai\nFROM siswa\nWHERE nilai >= 80\nORDER BY nilai DESC;`,
};

const BONUS_TIPS = {
  html: [
    '<h1> sampai <h6> untuk judul dokumen',
    '<p>, <ul>/<li>, dan <a href="#"> untuk konten dan tautan',
    '<button> dan <input placeholder="..."> untuk elemen interaktif',
  ],
  css: [
    'color dan background-color untuk warna teks dan latar',
    'padding, margin, dan border untuk jarak serta bingkai',
    'border-radius dan box-shadow untuk bentuk dan kedalaman elemen',
  ],
  javascript: [
    'let / const untuk mendeklarasikan variabel',
    'console.log(...) untuk menampilkan output ke konsol',
    'if, for, dan function untuk mengatur alur logika',
  ],
  typescript: [
    'Tentukan tipe variabel: let nama: string = "Budi"',
    'Gunakan interface untuk mendefinisikan struktur objek',
    'Tambahkan tipe parameter dan kembalian pada function',
  ],
  python: [
    'print(...) untuk menampilkan teks atau hasil hitungan',
    'Gunakan indentasi 4 spasi di dalam if, for, dan def',
    'Gunakan f-string: f"Halo {nama}" untuk menyisipkan variabel',
  ],
  php: [
    'Awali blok skrip dengan <?php dan akhiri dengan ?>',
    'Gunakan $ di depan setiap nama variabel, misalnya $nama',
    'Gunakan echo dan operator titik (.) untuk menggabung teks',
  ],
  java: [
    'System.out.println(...) untuk mencetak baris output',
    'Tulis kode utama di dalam public static void main(String[] args)',
    'Deklarasikan tipe variabel secara eksplisit seperti int atau String',
  ],
  cpp: [
    'Sertakan #include <iostream> dan using namespace std;',
    'Gunakan cout << nilai << endl; untuk mencetak ke terminal',
    'Tulis program utama di dalam fungsi int main()',
  ],
  go: [
    'Gunakan fmt.Println(...) untuk mencetak hasil ke terminal',
    'Gunakan := untuk mendeklarasikan variabel secara ringkas',
    'Gunakan for atau for ... range untuk perulangan',
  ],
  sql: [
    'Tabel tersedia di sandbox: siswa dan produk',
    'Gunakan SELECT kolom FROM siswa WHERE nilai >= 80;',
    'Gunakan ORDER BY, LIMIT, INSERT, UPDATE, atau DELETE',
  ],
};

function BonusChallenge({
  mode = 'bonus',
  category: initialCategory = 'javascript',
  onBack,
  onComplete,
  completedLessons = [],
  soundEnabled = true,
  theme = 'dark',
}) {
  const isPlayground = mode === 'playground';
  const [activeCategory, setActiveCategory] = useState(initialCategory);

  const activeKey = isPlayground ? `playground-${activeCategory}` : `${activeCategory}-bonus`;
  const isAlreadyCompleted = !isPlayground && completedLessons.includes(activeKey);

  const [code, setCode] = useState(() =>
    isPlayground ? PLAYGROUND_SAMPLES[initialCategory] || '' : ''
  );
  const [submitted, setSubmitted] = useState(isAlreadyCompleted);
  const [error, setError] = useState('');
  const [runKey, setRunKey] = useState(0);
  const [hasRun, setHasRun] = useState(isPlayground);

  const info = categoryInfo[activeCategory] || categoryInfo.html;
  const intro = categoryIntro[activeCategory] || categoryIntro.html;
  const accentColor = theme === 'light' ? info.color : (info.colorDark || info.color);

  function handleSwitchLanguage(cat) {
    if (soundEnabled) soundClick();
    setActiveCategory(cat);
    setCode(PLAYGROUND_SAMPLES[cat] || '');
    setError('');
    setRunKey((k) => k + 1);
    setHasRun(true);
  }

  function handleRun() {
    if (soundEnabled) soundRun();
    setRunKey((k) => k + 1);
    setHasRun(true);
    setError('');
  }

  function handleLoadSample() {
    if (soundEnabled) soundClick();
    setCode(PLAYGROUND_SAMPLES[activeCategory] || intro.bonusPlaceholder || '');
    setError('');
    setRunKey((k) => k + 1);
    setHasRun(true);
  }

  function handleSubmit() {
    if (soundEnabled) soundRun();
    const trimmed = code
      .replace(/\s+/g, '')
      .replace(/<!--.*?-->/g, '')
      .replace(/\/\*.*?\*\//g, '');

    if (trimmed.length < 5) {
      setError('Tulis minimal beberapa baris kode sebelum mengumpulkan tugas bebas.');
      return;
    }

    setError('');
    setRunKey((k) => k + 1);
    setHasRun(true);
    setSubmitted(true);
    if (onComplete) onComplete(activeKey);
    if (soundEnabled) setTimeout(() => soundSuccess(), 180);
  }

  function handleReset() {
    if (soundEnabled) soundClick();
    setSubmitted(false);
    setCode('');
    setError('');
    setHasRun(false);
  }

  const tips = BONUS_TIPS[activeCategory] || [];

  return (
    <div className="lesson-detail-screen">
      <div className="lesson-detail-topbar">
        {!isPlayground ? (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => {
              if (soundEnabled) soundBack();
              onBack();
            }}
          >
            <ArrowLeft size={15} />
            <span>Daftar Misi</span>
          </button>
        ) : (
          <div>
            <h1 className="page-title" style={{ fontSize: '18px', marginBottom: 6 }}>
              Playground Kode
            </h1>
            <p className="page-subtitle">
              Uji dan jalankan kode dari 10 bahasa pemrograman langsung di browser tanpa perlu setup.
            </p>
          </div>
        )}

        {!isPlayground && (
          <div className="lesson-meta-inline">
            <BrandIcon name={activeCategory} size={16} color={accentColor} />
            <strong style={{ color: 'var(--text-primary)' }}>{intro.bonusTitle}</strong>
            <span>&middot;</span>
            <span className={`lesson-status-text ${submitted ? 'cleared' : 'learning'}`}>
              {submitted ? 'Selesai' : 'Ruang Kreasi'}
            </span>
          </div>
        )}
      </div>

      {isPlayground && (
        <div className="playground-lang-bar" role="tablist" aria-label="Pilih bahasa playground">
          {Object.keys(categoryInfo).map((cat) => {
            const catInfo = categoryInfo[cat];
            const catAccent = theme === 'light' ? catInfo.color : (catInfo.colorDark || catInfo.color);
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={activeCategory === cat}
                className={`playground-lang-btn ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => handleSwitchLanguage(cat)}
              >
                <BrandIcon name={cat} size={14} color={catAccent} />
                <span>{catInfo.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {!isPlayground && (
        <div className="progress-section">
          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
            {intro.bonusTitle}
          </div>
          <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)' }}>
            {intro.bonusInstruction}
          </p>
          {submitted && (
            <div className="inline-feedback success" style={{ marginTop: 6 }}>
              <CheckCircle2 size={18} style={{ color: 'var(--status-success)', flexShrink: 0 }} />
              <span>
                Karya bebas {info.label} berhasil dikumpulkan. Tekan Reset jika ingin membuat eksperimen baru.
              </span>
            </div>
          )}
        </div>
      )}

      <div className="lesson-layout">
        {/* Left column: Editor */}
        <div className="lesson-col-editor" style={{ gridColumn: 'span 1' }}>
          <div className="editor-panel">
            <div className="editor-header">
              <span className="editor-filename">
                <BrandIcon name={activeCategory} size={14} color={accentColor} />
                <span>{info.fileName}</span>
              </span>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ minHeight: 30, padding: '4px 10px', fontSize: '12px' }}
                onClick={handleLoadSample}
              >
                <FileCode2 size={13} />
                <span>Muat Contoh</span>
              </button>
            </div>

            <CodeEditor
              value={code}
              onChange={(next) => {
                setCode(next);
                setError('');
              }}
              category={activeCategory}
              soundEnabled={soundEnabled}
              placeholder={intro.bonusPlaceholder}
              disabled={!isPlayground && submitted}
              minRows={10}
            />

            <div className="editor-footer">
              <div className="editor-footer-actions">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={handleReset}
                >
                  <RotateCcw size={14} />
                  <span>Reset</span>
                </button>
              </div>

              <div className="editor-footer-actions">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleRun}
                >
                  <Play size={14} />
                  <span>Jalankan</span>
                </button>

                {!isPlayground && !submitted && (
                  <button
                    type="button"
                    className="btn btn-success btn-sm"
                    onClick={handleSubmit}
                  >
                    <CheckCircle2 size={14} />
                    <span>Kumpulkan Karya</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="inline-feedback error">{error}</div>
          )}
        </div>

        {/* Right column: Preview + Quick Reference */}
        <div className="lesson-col-quest">
          <CodePreview
            category={activeCategory}
            code={code}
            runKey={runKey}
            hasRun={activeCategory === 'html' || activeCategory === 'css' ? true : hasRun}
            alwaysShowHtml
          />

          <div className="quest-panel">
            <div className="quest-panel-header">
              <div className="quest-panel-title">
                <span>Referensi Cepat {info.label}</span>
              </div>
            </div>
            <div className="quest-panel-body" style={{ gap: 10 }}>
              {tips.map((tip, idx) => (
                <div
                  key={idx}
                  style={{
                    fontSize: '13.5px',
                    color: 'var(--text-secondary)',
                    padding: '8px 12px',
                    background: 'var(--bg-elevated)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  {tip}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BonusChallenge;
