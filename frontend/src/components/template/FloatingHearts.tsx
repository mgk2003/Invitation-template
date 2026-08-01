import React, { useEffect, useState } from 'react';
import './FloatingHearts.css';

interface Heart {
  id: number;
  left: string;
  size: string;
  duration: string;
  delay: string;
  color: string;
  drift: string;
}

const FloatingHearts: React.FC = () => {
  const [hearts, setHearts] = useState<Heart[]>([]);

  useEffect(() => {
    const colors = ['#d4af37', '#e8d5a3', '#f3e5ab', '#c0c0c0', '#e0e0e0', '#ffffff'];
    // Lightweight: 10 hearts are more than enough and perform excellent on mobile
    const newHearts = Array.from({ length: 10 }).map((_, i) => {
      const size = Math.random() * (22 - 10) + 10;
      return {
        id: i,
        left: `${Math.random() * 100}%`,
        size: `${size}px`,
        duration: `${Math.random() * (8 - 5) + 5}s`,
        delay: `${Math.random() * 6}s`,
        color: colors[Math.floor(Math.random() * colors.length)],
        drift: `${Math.sin(i) * 25}px`,
      };
    });
    setHearts(newHearts);
  }, []);

  return (
    <div className="floating-hearts-container">
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="heart-balloon-css"
          style={{
            '--left': heart.left,
            '--size': heart.size,
            '--duration': heart.duration,
            '--delay': heart.delay,
            '--color': heart.color,
            '--color-glow': `${heart.color}40`,
            '--drift': heart.drift,
          } as React.CSSProperties}
        >
          <div className="heart-shape" />
        </div>
      ))}
    </div>
  );
};

export default FloatingHearts;
