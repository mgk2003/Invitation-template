import React from 'react';
import './LuxuryLoader.css';
import { brandName, instagramUrl } from '../../config';

interface LuxuryLoaderProps {
  tip?: string;
  fullScreen?: boolean;
  variant?: 'public' | 'brand';
}

export const LuxuryLoader: React.FC<LuxuryLoaderProps> = ({
  fullScreen = true,
}) => {
  const content = (
    <div className="luxury-loader-container">
      {/* Central Camera Brand Stage */}
      <div className="luxury-brand-stage">
        {/* Soft Ambient Lens Aura */}
        <div className="luxury-brand-halo" />

        {/* Razor-sharp White Camera & Brand Logo */}
        <div className="luxury-brand-logo-wrap">
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={`Follow ${brandName} on Instagram`}
            className="luxury-brand-logo-link"
          >
            <img
              src="/brand-logo.png"
              alt={brandName}
              className="luxury-brand-logo-img"
            />
          </a>
        </div>
      </div>

      {/* Modern Minimalist Hairline Progress Beam */}
      <div className="luxury-beam-track">
        <div className="luxury-beam-runner" />
      </div>

      {/* Modern Sleek Brand Tagline Only - Pure CSS animation to prevent flash/re-trigger */}
      <p className="luxury-loader-tagline">
        MEMORIES IN A SNAP
      </p>
    </div>
  );

  if (fullScreen) {
    return <div className="luxury-loader-fullscreen">{content}</div>;
  }

  return <div className="luxury-loader-inline">{content}</div>;
};

export default LuxuryLoader;
