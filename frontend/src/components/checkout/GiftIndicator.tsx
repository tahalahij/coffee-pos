'use client';

import { motion } from 'framer-motion';
import { Gift } from 'lucide-react';

interface GiftIndicatorProps {
  availableCount: number;
  onClick?: () => void;
}

export function GiftIndicator({ availableCount, onClick }: GiftIndicatorProps) {
  if (availableCount === 0) {
    return null;
  }

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200 }}
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
    >
      <Gift className="w-5 h-5" />
      <span className="font-semibold">{availableCount}</span>
    </motion.button>
  );
}
