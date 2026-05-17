import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import './ThingsToKnow.css';

const tips = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 9h16" />
        <path d="M4 15h16" />
        <path d="M10 3L8 21" />
        <path d="M16 3l-2 18" />
      </svg>
    ),
    title: 'Wedding Hashtag',
    text: 'Capture and share the magic with us! Please use #NwedsN when posting your beautiful moments.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    title: 'Digital Map',
    text: 'Easily find your way to our celebrations. Click the location link in the events section for direct navigation.',
  },
];

const instagramLink = "https://www.instagram.com/_crewfotos_?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="

const ThingsToKnow: React.FC = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation(0.1);
  const [showSecret, setShowSecret] = useState(false);

  return (
    <section className="things-section">
      <div className={`things-header ${headerVisible ? 'animate-in' : ''}`} ref={headerRef}>
        <p className="things-top-label">Little Details</p>
        <h2 className="things-main-title">Things to Know</h2>
        <div className="things-header-line" />
        <p className="things-description">
          A few thoughtful details to help you enjoy every magical moment of our celebration.
        </p>
      </div>

      <div className="tips-list">
        {tips.map((tip, i) => (
          <TipCard key={tip.title} tip={tip} delay={i * 200} />
        ))}
      </div>

      <div className="magical-surprise" onClick={() => setShowSecret(!showSecret)}>
        <motion.div 
          className="surprise-sparkle"
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          ✦
        </motion.div>
        <span className="surprise-text">Tap for a surprise!</span>
        
        <AnimatePresence>
          {showSecret && (
            <motion.div 
              className="secret-message"
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.8 }}
            >
              "Your presence is the greatest gift of all. We can't wait to see you!"
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <InstagramBlock />
    </section>
  );
};

const TipCard: React.FC<{ tip: (typeof tips)[0]; delay: number }> = ({ tip, delay }) => {
  const { ref, isVisible } = useScrollAnimation(0.1);
  return (
    <div
      className={`tip-card ${isVisible ? 'animate-in' : ''}`}
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="tip-icon-glow">
        <div className="tip-icon">{tip.icon}</div>
      </div>
      <div className="tip-content">
        <h4 className="tip-title">{tip.title}</h4>
        <p className="tip-text">{tip.text}</p>
      </div>
    </div>
  );
};

const InstagramBlock: React.FC = () => {
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
          <p className="insta-sub">Live updates & photos</p>
        </div>
      </div>
      <a href={instagramLink} target="_blank" rel="noopener noreferrer" className="insta-premium-btn">
        @_crewfotos_
      </a>
    </div>
  );
};

export default ThingsToKnow;
