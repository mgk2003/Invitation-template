import React, { useState, useEffect } from 'react';
import './ScrollIndicator.css';

const ScrollIndicator: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const winScroll = window.scrollY || document.documentElement.scrollTop;
      
      // Hide when scrolled 200px down - more stable than using innerHeight
      if (winScroll > 200) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`scroll-final-guide ${isVisible ? 'visible' : 'hidden'}`}>
      <div className="scroll-final-chevron">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="scroll-final-svg"
        >
          <path
            d="M7 10L12 15L17 10"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <span className="scroll-final-text">SCROLL DOWN</span>
    </div>
  );
};

export default ScrollIndicator;
