import React from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import './InviteCard.css';

const InviteCard: React.FC = () => {
  const { ref, isVisible } = useScrollAnimation(0.1);

  return (
    <section className="invite-section" ref={ref}>
      <div className={`invite-card ${isVisible ? 'animate-in' : ''}`}>


        <div className="invite-content-inner">
          <div className="invite-sparkle-top">✦</div>

          <p className="invite-love-message">
            "Two souls, one heart, a journey forever started. Join us as we celebrate the beginning of our forever."
          </p>

          <div className="invite-divider-gold"></div>

          <p className="invite-subtitle">We joyfully invite you to the wedding of</p>

          <h1 className="invite-names">
            <span className="invite-name-script">Naveen</span>
            <span className="invite-ampersand-stylish">&</span>
            <span className="invite-name-script">Nandhini</span>
          </h1>

          <div className="invite-details-box">
            <p className="invite-save-label">SAVE THE DATE</p>
            <p className="invite-date-main">JULY 06 - 2026</p>
          </div>
          <div className="invite-sparkle-bottom">✦</div>
        </div>
      </div>
    </section>
  );
};

export default InviteCard;
