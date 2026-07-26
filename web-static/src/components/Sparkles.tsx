import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import './Sparkles.css';

interface Sparkle {
  id: string;
  size: number;
  style: React.CSSProperties;
}

const generateSparkle = (): Sparkle => ({
  id: String(Math.random()),
  size: Math.random() * 10 + 5,
  style: {
    top: Math.random() * 100 + '%',
    left: Math.random() * 100 + '%',
    zIndex: 2,
  },
});

const Sparkles: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const sparkle = generateSparkle();
      setSparkles((prev) => [...prev.slice(-10), sparkle]);
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="sparkles-wrapper">
      {sparkles.map((sparkle) => (
        <motion.span
          key={sparkle.id}
          className="sparkle-svg"
          initial={{ scale: 0, rotate: 0, opacity: 0 }}
          animate={{ scale: [0, 1, 0], rotate: [0, 90, 180], opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          style={sparkle.style}
        >
          <svg width={sparkle.size} height={sparkle.size} viewBox="0 0 160 160" fill="none">
            <path d="M80 0L88 72L160 80L88 88L80 160L72 88L0 80L72 72L80 0Z" fill="#e8d5a3" />
          </svg>
        </motion.span>
      ))}
      <span className="sparkles-content">{children}</span>
    </span>
  );
};

export default Sparkles;
