import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import './BlessingReaction.css';

interface FloatingItem {
  id: number;
  emoji: string;
  x: number;
  y: number;
  driftX: number;
  driftY: number;
  delay: number;
  rot: number;
  rotEnd: number;
  scale: number;
}

interface BlessingReactionProps {
  slug?: string;
  initialCount?: number;
}

const BLESSING_EMOJIS = ['💖', '✨', '💐', '🤍', '🎉', '💍', '🌸', '🕊️', '❤️', '💫', '🌹'];

export const BlessingReaction: React.FC<BlessingReactionProps> = ({ slug, initialCount = 0 }) => {
  const [count, setCount] = useState<number>(() => {
    try {
      const localKey = slug ? `wedding_wishes_${slug}` : 'wedding_blessing_count';
      const stored = localStorage.getItem(localKey);
      if (stored) {
        return Math.max(parseInt(stored, 10), initialCount);
      }
      return initialCount;
    } catch {
      return initialCount;
    }
  });

  const [floatingItems, setFloatingItems] = useState<FloatingItem[]>([]);
  const [isBursting, setIsBursting] = useState(false);

  useEffect(() => {
    if (typeof initialCount === 'number' && initialCount > count) {
      setCount(initialCount);
    }
  }, [initialCount]);

  const handleSendBlessing = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top;

    const newCount = count + 1;
    setCount(newCount);
    setIsBursting(true);
    setTimeout(() => setIsBursting(false), 450);

    try {
      const localKey = slug ? `wedding_wishes_${slug}` : 'wedding_blessing_count';
      localStorage.setItem(localKey, String(newCount));
    } catch { }

    // Persist to database via Supabase RPC
    if (slug) {
      try {
        supabase
          .rpc('increment_invitation_wishes', { p_slug: slug.toLowerCase().trim() })
          .then(({ data, error }) => {
            if (!error && typeof data === 'number') {
              setCount(data);
              try {
                localStorage.setItem(`wedding_wishes_${slug}`, String(data));
              } catch { }
            }
          });
      } catch (err) {
        console.error('Failed to increment wishes in database:', err);
      }
    }

    // Spawn 7 romantic cascading bursting emojis fanning outwards
    const newItems: FloatingItem[] = [];
    const burstCount = 7;
    for (let i = 0; i < burstCount; i++) {
      const emoji = BLESSING_EMOJIS[Math.floor(Math.random() * BLESSING_EMOJIS.length)];
      const spread = i - (burstCount - 1) / 2;
      const driftX = spread * 24 + (Math.random() - 0.5) * 30;
      const driftY = -(260 + Math.random() * 120);
      const delay = i * 0.06;
      const rot = (Math.random() - 0.5) * 30;
      const rotEnd = (Math.random() - 0.5) * 60;
      const scale = 0.95 + Math.random() * 0.45;

      newItems.push({
        id: Date.now() + Math.random(),
        emoji,
        x: originX,
        y: originY,
        driftX,
        driftY,
        delay,
        rot,
        rotEnd,
        scale,
      });
    }

    setFloatingItems((prev) => [...prev, ...newItems]);

    // Clean up after animation
    setTimeout(() => {
      setFloatingItems((prev) => prev.filter((item) => !newItems.some((n) => n.id === item.id)));
    }, 2600);
  };

  return (
    <>
      <div className="blessing-reaction-container">
        <button
          type="button"
          onClick={handleSendBlessing}
          className={`blessing-trigger-btn ${isBursting ? 'is-bursting' : ''}`}
          title="Send warm wishes & du'a to the couple"
        >
          <span className="blessing-btn-icon">💖</span>
          <span className="blessing-btn-text">Send Wishes</span>
          <span className="blessing-counter-pill">{count}</span>
        </button>
      </div>

      {floatingItems.map((item) => (
        <span
          key={item.id}
          className="floating-blessing-item"
          style={
            {
              left: `${item.x}px`,
              top: `${item.y}px`,
              '--drift-x': `${item.driftX}px`,
              '--drift-y': `${item.driftY}px`,
              '--delay': `${item.delay}s`,
              '--rot': `${item.rot}deg`,
              '--rot-end': `${item.rotEnd}deg`,
              '--scale': item.scale,
            } as React.CSSProperties
          }
        >
          {item.emoji}
        </span>
      ))}
    </>
  );
};

export default BlessingReaction;
