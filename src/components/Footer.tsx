import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-divider-magical" />
        <p className="footer-copy">© CREW FOTOS {currentYear}</p>
      </div>
    </footer>
  );
};

export default Footer;
