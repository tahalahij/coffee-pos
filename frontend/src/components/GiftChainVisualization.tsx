'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, Cookie, Croissant, Cake, IceCream, Soup, Sandwich } from 'lucide-react';
import { useState, useEffect } from 'react';

// Product icon mapping
const PRODUCT_ICONS: Record<string, any> = {
  coffee: Coffee,
  latte: Coffee,
  espresso: Coffee,
  cappuccino: Coffee,
  cookie: Cookie,
  croissant: Croissant,
  cake: Cake,
  muffin: Cake,
  'ice cream': IceCream,
  soup: Soup,
  sandwich: Sandwich,
};

interface GiftUnit {
  id: string;
  giftedByName: string;
  productName: string;
  productType?: string;
  createdAt: string;
  claimedAt?: string;
  continuedAt?: string;
  chainPosition: number;
}

interface GiftChainVisualizationProps {
  giftUnits: GiftUnit[];
}

export function GiftChainVisualization({ giftUnits }: GiftChainVisualizationProps) {
  const [activeGiftId, setActiveGiftId] = useState<string | null>(null);

  // Find the most recent available gift
  useEffect(() => {
    const availableGift = giftUnits.find(unit => !unit.claimedAt);
    setActiveGiftId(availableGift?.id || null);
  }, [giftUnits]);

  // Get icon component for product
  const getProductIcon = (productName: string, productType?: string) => {
    const key = (productType || productName).toLowerCase();
    for (const [iconKey, IconComponent] of Object.entries(PRODUCT_ICONS)) {
      if (key.includes(iconKey)) {
        return IconComponent;
      }
    }
    return Coffee; // Default
  };

  // No gifts? Show nothing (let parent handle empty state)
  if (giftUnits.length === 0) {
    return null;
  }

  return (
    <div className="w-full h-full flex items-center justify-center p-12">
      <div className="w-full max-w-7xl">
        {/* Chain flow - horizontal */}
        <div className="relative">
          <AnimatePresence mode="sync">
            {giftUnits.map((unit, index) => {
              const isActive = unit.id === activeGiftId;
              const isClaimed = !!unit.claimedAt;
              const Icon = getProductIcon(unit.productName, unit.productType);
              const displayName = unit.giftedByName || 'Anonymous';

              return (
                <motion.div
                  key={unit.id}
                  initial={{ opacity: 0, x: -50, scale: 0.8 }}
                  animate={{ 
                    opacity: isClaimed ? 0.4 : 1, 
                    x: 0, 
                    scale: isActive ? 1.1 : 1 
                  }}
                  exit={{ opacity: 0, x: 50, scale: 0.8 }}
                  transition={{ 
                    duration: 0.6, 
                    delay: index * 0.15,
                    type: 'spring',
                    stiffness: 100
                  }}
                  className="mb-8 relative"
                  style={{
                    marginLeft: index > 0 ? '80px' : '0',
                  }}
                >
                  {/* Connection arrow */}
                  {index > 0 && (
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.15 }}
                      className="absolute -left-20 top-1/2 -translate-y-1/2 w-16 h-1 bg-gradient-to-r from-blue-400 to-purple-400"
                      style={{
                        transformOrigin: 'left',
                      }}
                    >
                      {/* Arrow head */}
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-l-8 border-l-purple-400 border-t-4 border-t-transparent border-b-4 border-b-transparent" />
                    </motion.div>
                  )}

                  {/* Gift unit card */}
                  <div
                    className={`
                      relative bg-white rounded-3xl shadow-lg p-8 transition-all duration-500
                      ${isActive ? 'ring-4 ring-yellow-400 shadow-2xl' : ''}
                      ${isClaimed ? 'opacity-60' : ''}
                    `}
                  >
                    {/* Active gift glow */}
                    {isActive && !isClaimed && (
                      <motion.div
                        animate={{
                          opacity: [0.3, 0.7, 0.3],
                          scale: [1, 1.05, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                        className="absolute inset-0 bg-gradient-to-br from-yellow-200 to-amber-200 rounded-3xl blur-xl -z-10"
                      />
                    )}

                    {/* Person name */}
                    <div className="text-center mb-4">
                      <motion.p 
                        className="text-3xl font-bold text-gray-800"
                        animate={isActive ? { scale: [1, 1.05, 1] } : {}}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        {displayName}
                      </motion.p>
                    </div>

                    {/* Arrow down */}
                    <div className="flex justify-center mb-4">
                      <motion.div
                        animate={isActive ? { y: [0, 8, 0] } : {}}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="text-purple-500"
                      >
                        <div className="w-1 h-12 bg-gradient-to-b from-purple-400 to-blue-400 mx-auto relative">
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-t-8 border-t-blue-400 border-l-4 border-l-transparent border-r-4 border-r-transparent" />
                        </div>
                      </motion.div>
                    </div>

                    {/* Product icon + name */}
                    <div className="flex flex-col items-center gap-4">
                      <motion.div
                        animate={isActive ? { rotate: [0, 5, -5, 0] } : {}}
                        transition={{ duration: 2, repeat: Infinity }}
                        className={`
                          w-20 h-20 rounded-2xl flex items-center justify-center
                          ${isActive ? 'bg-gradient-to-br from-yellow-400 to-amber-500' : 'bg-gradient-to-br from-blue-500 to-purple-600'}
                          shadow-lg
                        `}
                      >
                        <Icon className="w-10 h-10 text-white" />
                      </motion.div>
                      <p className="text-2xl font-semibold text-gray-700">
                        {unit.productName}
                      </p>
                    </div>

                    {/* Claimed indicator (visual only) */}
                    {isClaimed && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-4 right-4 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
                      >
                        <span className="text-white text-xl">✓</span>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
