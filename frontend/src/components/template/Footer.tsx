import React from 'react';
import './Footer.css';
import type { WeddingContent } from '../../content';

interface FooterProps {
  footer: WeddingContent['footer'];
  couple?: WeddingContent['couple'];
}

const Footer: React.FC<FooterProps> = ({ footer, couple }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-inner">
        {couple && (
          <div className="footer-names-script">
            <span>{couple.groomName}</span>
            <span className="footer-amp">&amp;</span>
            <span>{couple.brideName}</span>
          </div>
        )}
        <div className="footer-divider-magical" />
        <p className="footer-copy">© {footer.credit} {currentYear}</p>
      </div>
    </footer>
  );
};

export default Footer;
