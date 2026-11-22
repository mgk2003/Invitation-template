import React from 'react';
import './Footer.css';
import type { WeddingContent } from '../../content';
import { brandName, instagramUrl } from '../../config';

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

        {/* Static Brand Logo with Instagram Navigation */}
        <div className="footer-brand-wrapper">
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="footer-brand-link"
            title={`Follow ${brandName} on Instagram`}
          >
            <img
              src="/brand-logo.png"
              alt={brandName}
              className="footer-brand-logo"
              loading="lazy"
            />
          </a>
        </div>

        <p className="footer-copy">© {footer?.credit || brandName} {currentYear}</p>
      </div>
    </footer>
  );
};

export default Footer;
