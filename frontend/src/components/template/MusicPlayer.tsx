import React, { useState, useRef, useEffect } from 'react';
import './MusicPlayer.css';
import type { WeddingContent } from '../../content';

interface MusicPlayerProps {
  music: WeddingContent['music'];
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ music }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const musicUrl = music?.src
    ? music.src.startsWith('http') || music.src.startsWith('blob:')
      ? music.src
      : `${music.src.startsWith('/') ? '' : '/'}${music.src}`
    : '';

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(err => {
        console.error('Manual playback failed:', err);
      });
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = music?.volume ?? 0.7;
    audio.load();
    setIsPlaying(false);

    const startOnInteraction = () => {
      if (audio && audio.paused) {
        audio.play().then(() => {
          setIsPlaying(true);
          removeListeners();
        }).catch(() => {});
      }
    };

    const removeListeners = () => {
      window.removeEventListener('scroll', startOnInteraction);
      window.removeEventListener('click', startOnInteraction);
      window.removeEventListener('touchstart', startOnInteraction);
    };

    window.addEventListener('scroll', startOnInteraction, { passive: true });
    window.addEventListener('click', startOnInteraction, { once: true });
    window.addEventListener('touchstart', startOnInteraction, { once: true });

    return () => removeListeners();
  }, [music?.src, music?.volume]);

  if (!music?.src) {
    return null;
  }

  return (
    <div className="music-player-fixed">
      <audio ref={audioRef} src={musicUrl} loop preload="auto" />
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
            <div className="bar b1" />
            <div className="bar b2" />
            <div className="bar b3" />
          </div>
        )}
      </button>
    </div>
  );
};

export default MusicPlayer;
