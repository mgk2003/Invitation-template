import React from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import './MessageSection.css';

const MessageSection: React.FC = () => {
  const { ref, isVisible } = useScrollAnimation(0.1);

  return (
    <section className="message-section" ref={ref}>
      <div className={`message-card ${isVisible ? 'animate-in' : ''}`}>
        <div className="message-sparkle-top">✧</div>

        <h3 className="message-title">A Message From Our Hearts</h3>

        <div className="message-divider-ornate">
          <svg width="100" height="20" viewBox="0 0 100 20" fill="none">
            <path d="M0 10 Q25 0 50 10 Q75 20 100 10" stroke="#e8d5a3" strokeWidth="1" fill="none" opacity="0.6" />
          </svg>
        </div>

        <div className="message-content">
          <p className="message-text">
            "We are both so delighted that you are able to join us in celebrating what we hope will be one of the happiest days of our lives. The affection shown to us by so many people since our roka has been incredibly moving, and has touched us both deeply."
          </p>

          <p className="message-text highlighted">
            "We would like to take this opportunity to thank everyone most sincerely for their kindness. We are looking forward to seeing you at the wedding!"
          </p>
        </div>

        <div className="message-signatures-container">
          <div className="signature-line"></div>
          <div className="message-signatures">
            <span className="signature-name">Naveen</span>
            <span className="signature-amp">&</span>
            <span className="signature-name">Nandhini</span>
          </div>
          <div className="signature-line"></div>
        </div>

        <div className="message-footer">
          <div className="looking-forward-badge">
            CAN'T WAIT TO SEE YOU
          </div>
        </div>

        <div className="message-sparkle-bottom">✧</div>
      </div>
    </section>
  );
};

export default MessageSection;
