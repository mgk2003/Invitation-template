import React from 'react';
import { motion } from 'framer-motion';
import './DesktopBackground.css';

const DesktopBackground: React.FC = () => {
  return (
    <div className="desktop-bg-container" aria-hidden="true">
      {/* Blurred mobile background overlay */}
      <div className="desktop-bg-blur" />

      {/* Animated glowing ambient orbs */}
      <motion.div
        className="desktop-orb orb-1"
        animate={{
          scale: [1, 1.25, 1],
          opacity: [0.3, 0.55, 0.3],
          x: [0, 50, 0],
          y: [0, -40, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="desktop-orb orb-2"
        animate={{
          scale: [1.15, 0.9, 1.15],
          opacity: [0.25, 0.5, 0.25],
          x: [0, -50, 0],
          y: [0, 40, 0],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="desktop-orb orb-3"
        animate={{
          scale: [1, 1.35, 1],
          opacity: [0.2, 0.45, 0.2],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Ornate Corner Mandalas */}
      <div className="desktop-corner corner-tl">
        <svg viewBox="0 0 100 100" className="mandala-svg">
          <circle cx="0" cy="0" r="85" fill="none" stroke="url(#goldGradient)" strokeWidth="1" opacity="0.4" />
          <circle cx="0" cy="0" r="65" fill="none" stroke="url(#goldGradient)" strokeWidth="0.8" strokeDasharray="4 4" opacity="0.5" />
          <circle cx="0" cy="0" r="45" fill="none" stroke="url(#goldGradient)" strokeWidth="0.6" opacity="0.4" />
          <path d="M0,0 L75,75 M0,35 L55,90 M35,0 L90,55" stroke="url(#goldGradient)" strokeWidth="0.5" opacity="0.35" />
        </svg>
      </div>

      <div className="desktop-corner corner-tr">
        <svg viewBox="0 0 100 100" className="mandala-svg">
          <circle cx="100" cy="0" r="85" fill="none" stroke="url(#goldGradient)" strokeWidth="1" opacity="0.4" />
          <circle cx="100" cy="0" r="65" fill="none" stroke="url(#goldGradient)" strokeWidth="0.8" strokeDasharray="4 4" opacity="0.5" />
          <circle cx="100" cy="0" r="45" fill="none" stroke="url(#goldGradient)" strokeWidth="0.6" opacity="0.4" />
          <path d="M100,0 L25,75 M100,35 L45,90 M65,0 L10,55" stroke="url(#goldGradient)" strokeWidth="0.5" opacity="0.35" />
        </svg>
      </div>

      <div className="desktop-corner corner-bl">
        <svg viewBox="0 0 100 100" className="mandala-svg">
          <circle cx="0" cy="100" r="85" fill="none" stroke="url(#goldGradient)" strokeWidth="1" opacity="0.4" />
          <circle cx="0" cy="100" r="65" fill="none" stroke="url(#goldGradient)" strokeWidth="0.8" strokeDasharray="4 4" opacity="0.5" />
          <circle cx="0" cy="100" r="45" fill="none" stroke="url(#goldGradient)" strokeWidth="0.6" opacity="0.4" />
        </svg>
      </div>

      <div className="desktop-corner corner-br">
        <svg viewBox="0 0 100 100" className="mandala-svg">
          <circle cx="100" cy="100" r="85" fill="none" stroke="url(#goldGradient)" strokeWidth="1" opacity="0.4" />
          <circle cx="100" cy="100" r="65" fill="none" stroke="url(#goldGradient)" strokeWidth="0.8" strokeDasharray="4 4" opacity="0.5" />
          <circle cx="100" cy="100" r="45" fill="none" stroke="url(#goldGradient)" strokeWidth="0.6" opacity="0.4" />
        </svg>
      </div>

      {/* SVG Gradient Definition */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f3e5ab" />
            <stop offset="50%" stopColor="#d4af37" />
            <stop offset="100%" stopColor="#aa7c11" />
          </linearGradient>
        </defs>
      </svg>

      {/* Aesthetic Side Flourish Patterns (Pure Design Element, No Text Cards) */}
      <div className="side-flourish left-flourish">
        <svg viewBox="0 0 120 400" className="flourish-svg">
          <path
            d="M 60,0 Q 110,100 60,200 Q 10,300 60,400"
            fill="none"
            stroke="url(#goldGradient)"
            strokeWidth="1"
            opacity="0.25"
          />
          <circle cx="60" cy="100" r="15" fill="none" stroke="url(#goldGradient)" strokeWidth="0.8" opacity="0.3" />
          <circle cx="60" cy="200" r="25" fill="none" stroke="url(#goldGradient)" strokeWidth="1" opacity="0.35" />
          <circle cx="60" cy="300" r="15" fill="none" stroke="url(#goldGradient)" strokeWidth="0.8" opacity="0.3" />
        </svg>
      </div>

      <div className="side-flourish right-flourish">
        <svg viewBox="0 0 120 400" className="flourish-svg">
          <path
            d="M 60,0 Q 10,100 60,200 Q 110,300 60,400"
            fill="none"
            stroke="url(#goldGradient)"
            strokeWidth="1"
            opacity="0.25"
          />
          <circle cx="60" cy="100" r="15" fill="none" stroke="url(#goldGradient)" strokeWidth="0.8" opacity="0.3" />
          <circle cx="60" cy="200" r="25" fill="none" stroke="url(#goldGradient)" strokeWidth="1" opacity="0.35" />
          <circle cx="60" cy="300" r="15" fill="none" stroke="url(#goldGradient)" strokeWidth="0.8" opacity="0.3" />
        </svg>
      </div>

      {/* Floating Sparkle Elements across Desktop Background */}
      <div className="desktop-sparkles">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="desktop-sparkle-dot"
            style={{
              left: `${(i * 9.5) % 96 + 2}%`,
              top: `${(i * 13.7) % 90 + 5}%`,
              width: `${(i % 3) * 2 + 3}px`,
              height: `${(i % 3) * 2 + 3}px`,
            }}
            animate={{
              y: [-20, 20, -20],
              opacity: [0.15, 0.75, 0.15],
              scale: [0.8, 1.4, 0.8],
            }}
            transition={{
              duration: 3.5 + (i % 5),
              repeat: Infinity,
              delay: (i * 0.25) % 4,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default DesktopBackground;
