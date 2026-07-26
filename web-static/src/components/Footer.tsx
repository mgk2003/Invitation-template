import React from 'react';
import './Footer.css';
import type { WeddingContent } from '../content';

interface FooterProps {
  footer: WeddingContent['footer'];
}

const Footer: React.FC<FooterProps> = ({ footer }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-divider-magical" />
        <p className="footer-copy">© {footer.credit} {currentYear}</p>
      </div>
    </footer>
  );
};

export default Footer;
