import React from 'react';

function Footer({
  completedCount = 0,
  totalLessons = 100,
  onResetClick,
}) {
  return (
    <footer className="site-footer" id="main-footer">
      <div className="footer-inner">
        <div>
          Belajar Bahasa Pemrograman — HTML, CSS, JS, TS, Python, PHP, Java, C++, Go, SQL
        </div>
        <div className="footer-actions">
          <span className="tabular-nums">
            {completedCount} / {totalLessons} misi selesai
          </span>
          {onResetClick && (
            <button
              type="button"
              className="footer-reset-btn"
              onClick={onResetClick}
            >
              Reset progres
            </button>
          )}
        </div>
      </div>
    </footer>
  );
}

export default Footer;
