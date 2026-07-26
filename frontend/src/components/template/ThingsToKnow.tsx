import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import './ThingsToKnow.css';
import type { WeddingContent, TipItem } from '../../content';

interface ThingsToKnowProps {
  thingsToKnow: WeddingContent['thingsToKnow'];
  social: WeddingContent['social'];
}

const TIP_ICONS: Record<TipItem['iconType'], React.ReactNode> = {
  hashtag: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 9h16" /><path d="M4 15h16" /><path d="M10 3L8 21" /><path d="M16 3l-2 18" />
    </svg>
  ),
  map: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  ),
};

const ThingsToKnow: React.FC<ThingsToKnowProps> = ({ thingsToKnow, social }) => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation(0.1);
  const [showSecret, setShowSecret] = useState(false);

  return (
    <section className="things-section">
      <div className={`things-header ${headerVisible ? 'animate-in' : ''}`} ref={headerRef}>
        <p className="things-top-label">{thingsToKnow.labelTop}</p>
        <h2 className="things-main-title">{thingsToKnow.title}</h2>
        <div className="things-header-line" />
        <p className="things-description">{thingsToKnow.description}</p>
      </div>

      <div className="tips-list">
        {thingsToKnow.tips.map((tip, i) => (
          <TipCard key={tip.title} tip={tip} delay={i * 200} />
        ))}
      </div>

      <div className="magical-surprise" onClick={() => setShowSecret(!showSecret)}>
        <motion.div className="surprise-sparkle" animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }} transition={{ duration: 3, repeat: Infinity }}>
          ✦
        </motion.div>
        <span className="surprise-text">Tap for a surprise!</span>
        <AnimatePresence>
          {showSecret && (
            <motion.div className="secret-message" initial={{ opacity: 0, y: 10, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.8 }}>
              {thingsToKnow.surpriseMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="social-instagram-wrapper">
        <InstagramBlock handle={social.instagramHandle} link={social.instagramLink} />
        {social.instagramHandle2 && social.instagramLink2 && (
          <InstagramBlock handle={social.instagramHandle2} link={social.instagramLink2} />
        )}
      </div>
    </section>
  );
};

const TipCard: React.FC<{ tip: TipItem; delay: number }> = ({ tip, delay }) => {
  const { ref, isVisible } = useScrollAnimation(0.1);
  return (
    <div className={`tip-card ${isVisible ? 'animate-in' : ''}`} ref={ref} style={{ transitionDelay: `${delay}ms` }}>
      <div className="tip-icon-glow">
        <div className="tip-icon">{TIP_ICONS[tip.iconType]}</div>
      </div>
      <div className="tip-content">
        <h4 className="tip-title">{tip.title}</h4>
        <p className="tip-text">{tip.text}</p>
      </div>
    </div>
  );
};

const InstagramBlock: React.FC<{ handle: string; link: string }> = ({ handle, link }) => {
  const { ref, isVisible } = useScrollAnimation(0.1);
  return (
    <div className={`instagram-premium-card ${isVisible ? 'animate-in' : ''}`} ref={ref}>
      <div className="insta-header">
        <div className="insta-icon-wrapper">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
          </svg>
        </div>
        <div className="insta-text">
          <p className="insta-label">FOLLOW THE JOURNEY</p>
          <p className="insta-sub">Live updates &amp; photos</p>
        </div>
      </div>
      <a href={link} target="_blank" rel="noopener noreferrer" className="insta-premium-btn">{handle}</a>
    </div>
  );
};

export default ThingsToKnow;
