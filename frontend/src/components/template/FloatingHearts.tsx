import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import './FloatingHearts.css';

interface Heart {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
}

const FloatingHearts: React.FC = () => {
  const [hearts, setHearts] = useState<Heart[]>([]);

  useEffect(() => {
    const colors = ['#d4af37', '#e8d5a3', '#f3e5ab', '#c0c0c0', '#e0e0e0', '#ffffff'];
    const newHearts = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage
      size: Math.random() * (25 - 12) + 12,
      duration: Math.random() * (8 - 4) + 4,
      delay: Math.random() * 5,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));
    setHearts(newHearts);
  }, []);

  return (
    <div className="floating-hearts-container">
      {hearts.map((heart) => (
        <motion.div
          key={heart.id}
          className="heart-balloon"
          initial={{ y: '110vh', opacity: 0 }}
          animate={{ 
            y: '-10vh', 
            opacity: [0, 0.8, 0.8, 0],
            translateX: [0, Math.sin(heart.id) * 30, 0] // Stable pixel-based drift
          }}
          transition={{
            duration: heart.duration,
            delay: heart.delay,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            left: `${heart.x}%`,
            width: heart.size,
            height: heart.size,
            backgroundColor: heart.color,
            boxShadow: `0 0 15px ${heart.color}80`
          }}
        >
          <div className="heart-shape" />
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingHearts;
