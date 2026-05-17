import React, { useState, useRef, useEffect } from 'react';
import './MusicPlayer.css';

const MusicPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.error("Manual playback failed:", err);
      });
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.7;

    const startOnInteraction = () => {
      if (audio && audio.paused) {
        audio.play().then(() => {
          setIsPlaying(true);
          removeListeners();
        }).catch(() => {
          // If it still fails (e.g. scroll didn't count as interaction in some browsers)
          // we keep the listeners active
        });
      }
    };

    const removeListeners = () => {
      window.removeEventListener('scroll', startOnInteraction);
      window.removeEventListener('click', startOnInteraction);
      window.removeEventListener('touchstart', startOnInteraction);
    };

    // Listen for the first interaction (especially scroll)
    window.addEventListener('scroll', startOnInteraction, { passive: true });
    window.addEventListener('click', startOnInteraction, { once: true });
    window.addEventListener('touchstart', startOnInteraction, { once: true });

    return () => removeListeners();
  }, []);

  return (
    <div className="music-player-fixed">
      <audio 
        ref={audioRef}
        src="/bg-music.mp3" 
        loop 
        preload="auto"
      />
      <button 
        className={`music-toggle-btn ${isPlaying ? 'is-playing' : 'is-paused'}`} 
        onClick={togglePlay}
        type="button"
      >
        <div className="music-icon-wrapper">
          {isPlaying ? (
            <svg viewBox="0 0 24 24" fill="currentColor" className="music-svg">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" className="music-svg">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </div>
        
        {isPlaying && (
          <div className="music-bars">
            <div className="bar b1"></div>
            <div className="bar b2"></div>
            <div className="bar b3"></div>
          </div>
        )}
      </button>
    </div>
  );
};

export default MusicPlayer;
