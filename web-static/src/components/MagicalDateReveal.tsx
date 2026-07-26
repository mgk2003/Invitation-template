import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './MagicalDateReveal.css';

interface MagicalDateRevealProps {
  isVisible: boolean;
  onClose: () => void;
  date: string;
  timeDisplay: string;
}

const MagicalDateReveal: React.FC<MagicalDateRevealProps> = ({
  isVisible,
  onClose,
  date,
  timeDisplay,
}) => {
  useEffect(() => {
    const preventDefault = (e: Event) => e.preventDefault();

    if (isVisible) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.body.style.height = '100%';
      document.documentElement.style.height = '100%';
      window.addEventListener('touchmove', preventDefault, { passive: false });
    } else {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
      document.body.style.height = 'unset';
      document.documentElement.style.height = 'unset';
      window.removeEventListener('touchmove', preventDefault);
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
      document.body.style.height = 'unset';
      document.documentElement.style.height = 'unset';
      window.removeEventListener('touchmove', preventDefault);
    };
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="magical-reveal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="magical-particle"
              initial={{ scale: 0, x: 0, y: 0 }}
              animate={{
                scale: [0, 1, 0],
                x: (Math.random() - 0.5) * 400,
                y: (Math.random() - 0.5) * 400,
                rotate: Math.random() * 360,
              }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            />
          ))}

          <motion.div
            className="magical-date-content"
            initial={{ scale: 0.5, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', damping: 15 }}
          >
            <div className="magical-sparkle-icon">✦</div>
            <h2 className="magical-date-text">{date}</h2>
            <p className="magical-time-text">{timeDisplay}</p>
            <div className="magical-sparkle-icon">✦</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MagicalDateReveal;
