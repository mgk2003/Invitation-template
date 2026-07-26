import React from 'react';
import { motion } from 'framer-motion';

interface LuxuryLoaderProps {
  tip?: string;
  fullScreen?: boolean;
}

export const LuxuryLoader: React.FC<LuxuryLoaderProps> = ({
  tip = 'Loading Magical Wedding Data...',
  fullScreen = true,
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 text-center z-50">
      {/* Outer Rotating Glowing Ring */}
      <div className="relative flex items-center justify-center w-28 h-28 mb-6">
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-dashed border-[#d4af37]"
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute inset-2 rounded-full border-t-2 border-b-2 border-[#f3e5ab] shadow-[0_0_20px_rgba(212,175,55,0.6)]"
          animate={{ rotate: -360 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        />
        
        {/* Inner Heart / Sparkle Center */}
        <motion.div
          className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#8b6508] via-[#d4af37] to-[#f3e5ab] flex items-center justify-center text-dark-900 text-xl font-bold shadow-lg"
          animate={{ scale: [0.85, 1.15, 0.85] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          ✦
        </motion.div>

        {/* Orbiting Sparkles */}
        <motion.span
          className="absolute top-0 text-[#f3e5ab] text-xs"
          animate={{ y: [-4, 4, -4], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          ✧
        </motion.span>
        <motion.span
          className="absolute bottom-0 text-[#d4af37] text-xs"
          animate={{ y: [4, -4, 4], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
        >
          ✧
        </motion.span>
      </div>

      {/* Luxury Heading & Subtitle */}
      <motion.p
        className="font-serif text-[#f3e5ab] tracking-widest text-lg font-medium"
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {tip}
      </motion.p>
      <span className="text-xs text-amber-200/50 tracking-wider uppercase mt-2">
        Crafting Unforgettable Memories
      </span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-[#0a0a0c]/90 backdrop-blur-md flex items-center justify-center z-[9999]">
        {content}
      </div>
    );
  }

  return <div className="w-full py-16 flex justify-center items-center">{content}</div>;
};

export default LuxuryLoader;
