import React from 'react';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import './MeetSection.css';
import coupleImg from '../../assets/couple.png';
import type { WeddingContent } from '../../content';

interface MeetSectionProps {
  couple: WeddingContent['couple'];
  meetSection: WeddingContent['meetSection'];
}

const MeetSection: React.FC<MeetSectionProps> = ({ couple, meetSection }) => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation(0.1);
  const { ref: coupleRef, isVisible: coupleVisible } = useScrollAnimation(0.1);

  const photoUrl = couple?.photoSrc
    ? couple.photoSrc.startsWith('http') || couple.photoSrc.startsWith('blob:')
      ? couple.photoSrc
      : `${couple.photoSrc.startsWith('/') ? '' : '/'}${couple.photoSrc}`
    : coupleImg;

  return (
    <section className="meet-section">
      <div className={`meet-header ${headerVisible ? 'animate-in' : ''}`} ref={headerRef}>
        <p className="meet-label-top">{meetSection.labelTop}</p>
        <h2 className="meet-title">{meetSection.title}</h2>
        <div className="meet-divider-gold" />
      </div>

      <div className={`couple-container ${coupleVisible ? 'animate-in' : ''}`} ref={coupleRef}>
        <div className="couple-portrait-wrapper">
          <div className="couple-frame-gold">
            <div className="couple-inner">
              <img src={photoUrl} alt={couple.photoAlt} className="couple-photo" />
            </div>
          </div>
          <div className="couple-sparkle tl">✦</div>
          <div className="couple-sparkle br">✦</div>
        </div>

        <div className="couple-info">
          <h3 className="couple-names-script">{meetSection.sectionHeading}</h3>
          <p className="couple-bio">{meetSection.bio}</p>
        </div>
      </div>
    </section>
  );
};

export default MeetSection;
