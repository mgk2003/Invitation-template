import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './RoyalEnvelope.css';
import type { Couple, Dates } from '../../types/wedding';

interface RoyalEnvelopeProps {
  couple: Couple;
  dates?: Dates;
  onOpen: () => void;
}

export const RoyalEnvelope: React.FC<RoyalEnvelopeProps> = ({ couple, dates, onOpen }) => {
  const [isOpening, setIsOpening] = useState(false);

  const groomName = couple?.groomName || 'Groom';
  const brideName = couple?.brideName || 'Bride';

  const handleOpen = () => {
    if (isOpening) return;
    setIsOpening(true);

    // Smooth transition directly into the romantic background audio
    setTimeout(() => {
      onOpen();
    }, 900);
  };

  return (
    <AnimatePresence>
      <motion.div
        className={`royal-envelope-overlay ${isOpening ? 'is-opening' : ''}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.8 } }}
        onClick={handleOpen}
      >
        {/* Ambient Floating Stardust */}
        <div className="royal-stardust-container">
          {[...Array(18)].map((_, i) => (
            <div
              key={i}
              className="royal-stardust-particle"
              style={{
                left: `${(i * 19) % 100}%`,
                animationDelay: `${(i * 0.45) % 6}s`,
                animationDuration: `${6 + (i % 4)}s`,
              }}
            />
          ))}
        </div>

        {/* 3D Envelope Stage */}
        <motion.div
          className="royal-envelope-stage"
          initial={{ scale: 0.88, opacity: 0, y: 25 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          <div className="royal-envelope-body">
            {/* Ornate Golden Filigree Corners */}
            <div className="royal-corner royal-corner-tl" />
            <div className="royal-corner royal-corner-tr" />
            <div className="royal-corner royal-corner-bl" />
            <div className="royal-corner royal-corner-br" />

            {/* Header Content */}
            <div className="royal-invitation-badge">
              ✦ Royal Wedding Invitation ✦
            </div>

            <div className="royal-envelope-subtitle">
              Together With Their Families
            </div>

            <div className="royal-envelope-couple-names">
              <span className="royal-groom-name">{groomName}</span>
              <span className="royal-amp">&amp;</span>
              <span className="royal-bride-name">{brideName}</span>
            </div>

            {/* Royal Intertwined Golden Wedding Rings Ornament */}
            <div className="royal-envelope-ornament">
              <span className="royal-ornament-line" />
              <span className="royal-ornament-icon">
                <svg width="32" height="24" viewBox="0 0 32 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="11" cy="14" r="7.5" stroke="#e8d5a3" strokeWidth="1.8" />
                  <circle cx="21" cy="14" r="7.5" stroke="#fef08a" strokeWidth="1.8" />
                  <path d="M11 3.5L13.5 6.5H8.5L11 3.5Z" fill="#fef08a" />
                  <circle cx="11" cy="3.5" r="1.5" fill="#ffffff" />
                </svg>
              </span>
              <span className="royal-ornament-line" />
            </div>

            {dates?.weddingDateDisplay && (
              <div className="royal-envelope-date-badge">
                {dates.weddingDateDisplay}
              </div>
            )}

            {/* Luxury Open Button */}
            <div className="royal-open-btn-container">
              <button
                type="button"
                onClick={handleOpen}
                className="royal-open-invitation-btn"
                title="Tap to open the invitation"
              >
                <span className="royal-btn-sparkle">✧</span>
                <span>OPEN INVITATION</span>
                <span className="royal-btn-sparkle">✧</span>
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RoyalEnvelope;
