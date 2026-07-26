import React from 'react';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import './MessageSection.css';
import type { WeddingContent } from '../../content';

interface MessageSectionProps {
  couple: WeddingContent['couple'];
  messageSection: WeddingContent['messageSection'];
}

const MessageSection: React.FC<MessageSectionProps> = ({ couple, messageSection }) => {
  const { ref, isVisible } = useScrollAnimation(0.1);

  return (
    <section className="message-section" ref={ref}>
      <div className={`message-card ${isVisible ? 'animate-in' : ''}`}>
        <div className="message-sparkle-top">✧</div>

        <h3 className="message-title">{messageSection.title}</h3>

        <div className="message-divider-ornate">
          <svg width="100" height="20" viewBox="0 0 100 20" fill="none">
            <path
              d="M0 10 Q25 0 50 10 Q75 20 100 10"
              stroke="#e8d5a3"
              strokeWidth="1"
              fill="none"
              opacity="0.6"
            />
          </svg>
        </div>

        <div className="message-content">
          <p className="message-text">{messageSection.paragraph1}</p>
          <p className="message-text highlighted">{messageSection.paragraph2}</p>
        </div>

        <div className="message-signatures-container">
          <div className="signature-line" />
          <div className="message-signatures">
            <span className="signature-name">{couple.groomName}</span>
            <span className="signature-amp">&</span>
            <span className="signature-name">{couple.brideName}</span>
          </div>
          <div className="signature-line" />
        </div>

        <div className="message-footer">
          <div className="looking-forward-badge">{messageSection.ctaBadge}</div>
        </div>

        <div className="message-sparkle-bottom">✧</div>
      </div>
    </section>
  );
};

export default MessageSection;
