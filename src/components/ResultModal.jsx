import React from 'react';

function ResultModal({ result, onNext, onRetry, onClose, isLastLesson }) {
  if (!result) return null;

  const isCorrect = result === 'correct';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal-box ${isCorrect ? 'success' : 'error'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <span className="modal-icon">
          {isCorrect ? '✓' : '✕'}
        </span>

        <h2
          className="modal-title"
          style={{ color: isCorrect ? 'var(--color-green)' : 'var(--color-red)' }}
        >
          {isCorrect ? 'QUEST CLEARED!' : 'TRY AGAIN!'}
        </h2>

        <p className="modal-subtitle">
          {isCorrect
            ? 'Kamu berhasil memahami materi ini.'
            : 'Coba periksa kembali kode kamu.\nPastikan penulisan sudah benar.'}
        </p>

        {isCorrect && (
          <p
            className="modal-reality-text"
            style={{ color: 'var(--color-blue)' }}
          >
            ✦ Your code has become reality. ✦
          </p>
        )}

        <div className="modal-actions">
          {isCorrect ? (
            <>
              {!isLastLesson && (
                <button className="btn btn-success" onClick={onNext}>
                  NEXT QUEST →
                </button>
              )}
              <button className="btn btn-ghost" onClick={onClose}>
                {isLastLesson ? 'FINISH ✓' : 'STAY HERE'}
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-danger" onClick={onRetry}>
                TRY AGAIN
              </button>
              <button className="btn btn-ghost" onClick={onClose}>
                CLOSE
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResultModal;
