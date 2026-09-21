import React from 'react';

function Footer({
  completedLessons = [],
  totalLessons = 60,
}) {
  const totalCompleted = completedLessons.length;

  return (
    <footer className="site-footer" id="main-footer">
      <div className="footer-inner">
        <div className="footer-modul">
          <span className="footer-modul-icon">▶</span>
          <span className="footer-modul-label">MODUL:</span>
          <span className="footer-modul-stack">HTML • CSS • JavaScript • Python • PHP • TypeScript</span>
        </div>
        <div className="footer-quest">
          <span className="footer-quest-label">QUEST: </span>
          <span className="footer-quest-count">{totalCompleted}/{totalLessons} CLEARED</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
