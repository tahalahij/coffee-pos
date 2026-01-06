'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { User } from 'lucide-react';

interface GifterNameInputProps {
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
}

export function GifterNameInput({ value, onChange, visible }: GifterNameInputProps) {
  if (!visible) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="pt-3">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Your name (optional)"
              maxLength={50}
              className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-400 focus:outline-none transition-colors"
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
