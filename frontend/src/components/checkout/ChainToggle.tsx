'use client';

import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

interface ChainToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  emphasized?: boolean;
}

export function ChainToggle({ enabled, onChange, emphasized = false }: ChainToggleProps) {
  return (
    <motion.button
      onClick={() => onChange(!enabled)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4
        ${
          enabled
            ? 'border-pink-500 bg-gradient-to-r from-pink-50 to-purple-50'
            : emphasized
            ? 'border-purple-300 bg-purple-50 hover:border-purple-400'
            : 'border-gray-200 bg-white hover:border-gray-300'
        }
      `}
    >
      <div
        className={`
        w-12 h-12 rounded-lg flex items-center justify-center transition-colors
        ${enabled ? 'bg-gradient-to-br from-pink-500 to-purple-600' : 'bg-gray-100'}
      `}
      >
        <Heart
          className={`w-6 h-6 ${enabled ? 'text-white fill-white' : 'text-gray-400'}`}
        />
      </div>
      <div className="flex-1 text-left">
        <p className={`font-semibold ${enabled ? 'text-pink-700' : 'text-gray-700'}`}>
          Buy for the next person
        </p>
      </div>
      <div
        className={`
        w-12 h-7 rounded-full relative transition-colors
        ${enabled ? 'bg-pink-500' : 'bg-gray-300'}
      `}
      >
        <motion.div
          animate={{ x: enabled ? 20 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md"
        />
      </div>
    </motion.button>
  );
}
