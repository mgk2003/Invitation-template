import React, { useState } from 'react';
import { motion } from 'framer-motion';
import FloatingHearts from './FloatingHearts';
import MagicalDateReveal from './MagicalDateReveal';
import './HeroSection.css';
import type { WeddingContent } from '../../content';

interface HeroSectionProps {
  couple: WeddingContent['couple'];
  hero: WeddingContent['hero'];
  dates: WeddingContent['dates'];
}

const HeroSection: React.FC<HeroSectionProps> = ({ couple, hero, dates }) => {
  const [isRevealVisible, setIsRevealVisible] = useState(false);

  const logoUrl = couple?.logoSrc
    ? couple.logoSrc.startsWith('http') || couple.logoSrc.startsWith('blob:')
      ? couple.logoSrc
      : `${couple.logoSrc.startsWith('/') ? '' : '/'}${couple.logoSrc}`
    : '/coupleLogo.png';

  return (
    <section className="hero-section">
      <FloatingHearts />

      <motion.div
        className="hero-content"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      >
        <motion.div
          className="hero-intro-wrapper"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <span className="hero-intro-text">{hero.introText}</span>
          <div className="hero-intro-divider" />
        </motion.div>

        {/* Magical Logo Section */}
        <motion.div
          className="hero-logo-container"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, delay: 0.5, ease: 'easeOut', type: 'spring', stiffness: 50 }}
        >
          <div className="logo-glow-effect" />
          <img src={logoUrl} alt={couple.logoAlt} className="hero-couple-logo-white" />
          <div className="logo-sparkles">
            <span className="logo-sparkle s1">✦</span>
            <span className="logo-sparkle s2">✦</span>
            <span className="logo-sparkle s3">✦</span>
          </div>
        </motion.div>

        <motion.div
          className="hero-save-date"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.8 }}
          onClick={() => setIsRevealVisible(true)}
        >
          <div className="save-date-btn-premium">
            <span className="btn-sparkle">✧</span>
            SAVE THE DATE
            <span className="btn-sparkle">✧</span>
          </div>
        </motion.div>
      </motion.div>

      <MagicalDateReveal
        isVisible={isRevealVisible}
        onClose={() => setIsRevealVisible(false)}
        date={dates.weddingDateDisplay}
        timeDisplay={dates.weddingTimeDisplay}
      />
    </section>
  );
};

export default HeroSection;
