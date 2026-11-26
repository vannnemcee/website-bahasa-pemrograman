import React from 'react';
import { Check, X, ArrowRight, RotateCcw } from 'lucide-react';

function ResultModal({
  result,
  reason,
  onNext,
  onRetry,
  onClose,
  isLastLesson,
}) {
  if (!result) return null;

  const isCorrect = result === 'correct';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className={`modal-icon-circle ${isCorrect ? 'success' : 'error'}`}>
          {isCorrect ? <Check size={24} /> : <X size={24} />}
        </div>

        <h2 className="modal-title">
          {isCorrect ? 'Misi Berhasil' : 'Belum Tepat'}
        </h2>

        <p className="modal-subtitle">
          {isCorrect
            ? 'Kode kamu berjalan dengan benar dan memenuhi syarat misi ini.'
            : reason || 'Periksa kembali sintaks atau isi kodemu lalu jalankan ulang.'}
        </p>

        <div className="modal-actions">
          {isCorrect ? (
            <>
              {!isLastLesson && (
                <button type="button" className="btn btn-success" onClick={onNext}>
                  <span>Misi Berikutnya</span>
                  <ArrowRight size={15} />
                </button>
              )}
              <button type="button" className="btn btn-ghost" onClick={onClose}>
                {isLastLesson ? 'Selesai' : 'Tetap di Sini'}
              </button>
            </>
          ) : (
            <>
              <button type="button" className="btn btn-primary" onClick={onClose}>
                Perbaiki Kode
              </button>
              <button type="button" className="btn btn-ghost" onClick={onRetry}>
                <RotateCcw size={14} />
                <span>Reset Editor</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResultModal;
