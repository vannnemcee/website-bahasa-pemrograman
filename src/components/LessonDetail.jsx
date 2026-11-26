import React, { useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Code2,
  Play,
  HelpCircle,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Circle,
} from 'lucide-react';
import { lessons, categoryInfo } from '../data/lessons';
import { checkAnswer } from '../utils/validators';
import CodeEditor from './CodeEditor';
import CodePreview from './CodePreview';
import ResultModal from './ResultModal';
import BrandIcon from './BrandIcon';
import {
  soundRun,
  soundSuccess,
  soundError,
  soundHint,
  soundBack,
  soundClick,
} from '../utils/sounds';

function LessonDetail({
  category,
  lesson,
  onBack,
  onSelectLesson,
  onComplete,
  completedLessons,
  soundEnabled,
  theme,
}) {
  const [code, setCode] = useState(lesson.starterCode || '');
  const [result, setResult] = useState(null); // 'correct' | 'wrong' | null
  const [modalOpen, setModalOpen] = useState(false);
  const [feedbackReason, setFeedbackReason] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [runKey, setRunKey] = useState(0);
  const [hasRun, setHasRun] = useState(false);
  const [mobileTab, setMobileTab] = useState('quest');
  const [prevKey, setPrevKey] = useState(`${category}-${lesson.id}`);

  const currentKey = `${category}-${lesson.id}`;
  if (currentKey !== prevKey) {
    setPrevKey(currentKey);
    setCode(lesson.starterCode || '');
    setResult(null);
    setModalOpen(false);
    setFeedbackReason('');
    setShowHint(false);
    setMobileTab('quest');
    setHasRun(false);
  }

  const lessonList = lessons[category] || [];
  const currentIndex = lessonList.findIndex((l) => l.id === lesson.id);
  const nextLesson = lessonList[currentIndex + 1] || null;
  const isLastLesson = !nextLesson;
  const isCleared = completedLessons.includes(currentKey);
  const info = categoryInfo[category] || categoryInfo.html;
  const accentColor = theme === 'light' ? info.color : (info.colorDark || info.color);

  function handleRun() {
    if (soundEnabled) soundRun();
    setRunKey((k) => k + 1);
    setHasRun(true);

    const evaluation = checkAnswer(code, lesson);
    if (evaluation.valid) {
      setResult('correct');
      setFeedbackReason('');
      setModalOpen(true);
      onComplete(currentKey);
      if (soundEnabled) setTimeout(() => soundSuccess(), 180);
    } else {
      setResult('wrong');
      setFeedbackReason(evaluation.reason || 'Kode belum sesuai dengan instruksi misi.');
      setModalOpen(true);
      if (soundEnabled) setTimeout(() => soundError(), 180);
    }
  }

  function handleNext() {
    if (soundEnabled) soundClick();
    setModalOpen(false);
    if (nextLesson && onSelectLesson) {
      onSelectLesson(nextLesson);
    } else {
      onBack();
    }
  }

  function handleResetEditor() {
    if (soundEnabled) soundClick();
    setModalOpen(false);
    setResult(null);
    setFeedbackReason('');
    setHasRun(false);
    setCode(lesson.starterCode || '');
  }

  return (
    <div className="lesson-detail-screen">
      <div className="lesson-detail-topbar">
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

        <div className="lesson-meta-inline">
          <BrandIcon name={category} size={16} color={accentColor} />
          <strong style={{ color: 'var(--text-primary)' }}>{info.label}</strong>
          <span>&middot;</span>
          <span>
            Misi {String(currentIndex + 1).padStart(2, '0')} / {lessonList.length}
          </span>
          <span>&middot;</span>
          <span className={`lesson-status-text ${isCleared ? 'cleared' : 'learning'}`}>
            {isCleared ? (
              <>
                <CheckCircle2 size={14} />
                <span>Selesai</span>
              </>
            ) : (
              <>
                <Circle size={13} />
                <span>Aktif</span>
              </>
            )}
          </span>
        </div>
      </div>

      <div className="mobile-lesson-tabs">
        <button
          type="button"
          className={`mobile-tab-btn ${mobileTab === 'quest' ? 'active' : ''}`}
          onClick={() => {
            if (soundEnabled) soundClick();
            setMobileTab('quest');
          }}
        >
          <BookOpen size={15} />
          <span>Materi &amp; Tugas</span>
        </button>
        <button
          type="button"
          className={`mobile-tab-btn ${mobileTab === 'editor' ? 'active' : ''}`}
          onClick={() => {
            if (soundEnabled) soundClick();
            setMobileTab('editor');
          }}
        >
          <Code2 size={15} />
          <span>Editor &amp; Output</span>
        </button>
      </div>

      <div className={`lesson-layout mobile-tab-${mobileTab}`}>
        {/* Left: Instructional Guide */}
        <div className="lesson-col-quest">
          <div className="quest-panel">
            <div className="quest-panel-header">
              <div className="quest-panel-title">
                <BrandIcon name={category} size={16} color={accentColor} />
                <span>Misi {String(currentIndex + 1).padStart(2, '0')}</span>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {info.fileName}
              </span>
            </div>

            <div className="quest-panel-body">
              <div className="quest-section">
                <h1 className="quest-lesson-title">{lesson.title}</h1>
                <p className="quest-explanation">{lesson.explanation}</p>
              </div>

              <div className="quest-section">
                <span className="quest-section-heading">Contoh Kode</span>
                <pre className="quest-example">{lesson.example}</pre>
              </div>

              <div className="quest-section">
                <span className="quest-section-heading">Tugas Kamu</span>
                <div className="quest-task-box">{lesson.instruction}</div>
              </div>

              {result && (
                <div className={`inline-feedback ${result === 'correct' ? 'success' : 'error'}`}>
                  {result === 'correct' ? (
                    <CheckCircle2 size={18} style={{ color: 'var(--status-success)', flexShrink: 0, marginTop: 1 }} />
                  ) : (
                    <AlertCircle size={18} style={{ color: 'var(--status-error)', flexShrink: 0, marginTop: 1 }} />
                  )}
                  <div>
                    <strong>{result === 'correct' ? 'Jawaban benar.' : 'Belum tepat.'}</strong>{' '}
                    {result === 'correct'
                      ? 'Misi ini sudah ditandai selesai.'
                      : feedbackReason}
                  </div>
                </div>
              )}

              <button
                type="button"
                className="btn btn-primary mobile-tab-btn"
                style={{ display: undefined }}
                onClick={() => {
                  if (soundEnabled) soundClick();
                  setMobileTab('editor');
                }}
                hidden
              >
                Buka Editor
              </button>
            </div>
          </div>
        </div>

        {/* Right: Code Editor + Output */}
        <div className="lesson-col-editor">
          <div className="editor-panel">
            <div className="editor-header">
              <span className="editor-filename">
                <BrandIcon name={category} size={14} color={accentColor} />
                <span>{info.fileName}</span>
              </span>
              <span className="editor-header-meta">Tab = indentasi</span>
            </div>

            <CodeEditor
              value={code}
              onChange={(next) => {
                setCode(next);
                if (result) setResult(null);
              }}
              category={category}
              soundEnabled={soundEnabled}
            />

            <div className="editor-footer">
              <div className="editor-footer-actions">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    if (soundEnabled) soundHint();
                    setShowHint((prev) => !prev);
                  }}
                >
                  <HelpCircle size={14} />
                  <span>{showHint ? 'Tutup Petunjuk' : 'Petunjuk'}</span>
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={handleResetEditor}
                >
                  <RotateCcw size={14} />
                  <span>Reset</span>
                </button>
              </div>

              <button
                type="button"
                className="btn btn-success btn-sm"
                onClick={handleRun}
              >
                <Play size={14} />
                <span>Jalankan &amp; Periksa</span>
              </button>
            </div>
          </div>

          {showHint && (
            <div className="hint-box">
              <strong>Petunjuk:</strong> {lesson.hint}
            </div>
          )}

          <CodePreview
            category={category}
            code={code}
            runKey={runKey}
            hasRun={category === 'html' || category === 'css' ? true : hasRun}
            previewLabel={lesson.previewLabel}
          />
        </div>
      </div>

      <ResultModal
        result={modalOpen ? result : null}
        reason={feedbackReason}
        onNext={handleNext}
        onRetry={handleResetEditor}
        onClose={() => setModalOpen(false)}
        isLastLesson={isLastLesson}
      />
    </div>
  );
}

export default LessonDetail;
