import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import './BlessingReaction.css';

interface FloatingItem {
  id: number;
  emoji: string;
  x: number;
  y: number;
  rot: number;
  rotEnd: number;
}

interface BlessingReactionProps {
  slug?: string;
  initialCount?: number;
}

const BLESSING_EMOJIS = ['💖', '✨', '💐', '🤍', '🎉', '💍', '🌸'];

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

    // Spawn 4-6 bursting emojis
    const newItems: FloatingItem[] = [];
    const burstCount = 5;
    for (let i = 0; i < burstCount; i++) {
      const emoji = BLESSING_EMOJIS[Math.floor(Math.random() * BLESSING_EMOJIS.length)];
      const offsetX = (Math.random() - 0.5) * 80;
      const rot = (Math.random() - 0.5) * 40;
      const rotEnd = (Math.random() - 0.5) * 70;

      newItems.push({
        id: Date.now() + Math.random(),
        emoji,
        x: originX + offsetX,
        y: originY,
        rot,
        rotEnd,
      });
    }

    setFloatingItems((prev) => [...prev, ...newItems]);

    // Clean up after animation
    setTimeout(() => {
      setFloatingItems((prev) => prev.filter((item) => !newItems.some((n) => n.id === item.id)));
    }, 2500);
  };

  return (
    <>
      <div className="blessing-reaction-container">
        <button
          type="button"
          onClick={handleSendBlessing}
          className="blessing-trigger-btn"
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
              '--rot': `${item.rot}deg`,
              '--rot-end': `${item.rotEnd}deg`,
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
