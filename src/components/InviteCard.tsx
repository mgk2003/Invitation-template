import React from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import './InviteCard.css';
import type { WeddingContent } from '../content';

interface InviteCardProps {
  couple: WeddingContent['couple'];
  inviteCard: WeddingContent['inviteCard'];
  dates: WeddingContent['dates'];
}

const InviteCard: React.FC<InviteCardProps> = ({ couple, inviteCard, dates }) => {
  const { ref, isVisible } = useScrollAnimation(0.1);

  return (
    <section className="invite-section" ref={ref}>
      <div className={`invite-card ${isVisible ? 'animate-in' : ''}`}>
        <div className="invite-content-inner">
          <div className="invite-sparkle-top">✦</div>

          <p className="invite-love-message">{inviteCard.loveMessage}</p>

          <div className="invite-divider-gold" />

          <p className="invite-subtitle">{inviteCard.subtitle}</p>

          <h1 className="invite-names">
            <span className="invite-name-script">{couple.groomName}</span>
            <span className="invite-ampersand-stylish">&</span>
            <span className="invite-name-script">{couple.brideName}</span>
          </h1>

          <div className="invite-details-box">
            <p className="invite-save-label">SAVE THE DATE</p>
            <p className="invite-date-main">{dates.saveTheDateDisplay}</p>
          </div>

          <div className="invite-sparkle-bottom">✦</div>
        </div>
      </div>
    </section>
  );
};

export default InviteCard;
