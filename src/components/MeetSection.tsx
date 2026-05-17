import React from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import './MeetSection.css';

import coupleImg from '../assets/couple.png';

const MeetSection: React.FC = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation(0.1);
  const { ref: coupleRef, isVisible: coupleVisible } = useScrollAnimation(0.1);

  return (
    <section className="meet-section">
      <div className={`meet-header ${headerVisible ? 'animate-in' : ''}`} ref={headerRef}>
        <p className="meet-label-top">CELEBRATING OUR LOVE</p>
        <h2 className="meet-title">The Couple</h2>
        <div className="meet-divider-gold"></div>
      </div>

      <div className={`couple-container ${coupleVisible ? 'animate-in' : ''}`} ref={coupleRef}>
        <div className="couple-portrait-wrapper">
          <div className="couple-frame-gold">
            <div className="couple-inner">
              <img src={coupleImg} alt="Naveen and Nandhini" className="couple-photo" />
            </div>
          </div>
          <div className="couple-sparkle tl">✦</div>
          <div className="couple-sparkle br">✦</div>
        </div>

        <div className="couple-info">
          <h3 className="couple-names-script">The Happy Couple</h3>
          <p className="couple-bio">
            "A journey of love that began with a beautiful 'Yes'. Together, we are excited to start this new chapter of our lives, hand in hand, forever."
          </p>
        </div>
      </div>
    </section>
  );
};

export default MeetSection;
