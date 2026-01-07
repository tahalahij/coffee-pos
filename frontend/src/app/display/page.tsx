'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Coffee, Sparkles, Heart } from 'lucide-react';
import { useDisplaySync } from '@/hooks/use-display-sync';
import { useGiftChainSync } from '@/hooks/use-gift-chain-sync';
import { GiftChainVisualization } from '@/components/GiftChainVisualization';

export default function DisplayPage() {
  const { displayState, connected } = useDisplaySync();
  const { giftChainState, connected: giftChainConnected } = useGiftChainSync();
  const [showWelcome, setShowWelcome] = useState(true);
  const [currentPromo, setCurrentPromo] = useState(0);
  const [showGiftChain, setShowGiftChain] = useState(false);

  // Sample promotional content
  const promos = [
    {
      title: 'Welcome to Our Café',
      subtitle: 'Fresh Coffee & Delicious Treats',
      icon: Coffee,
    },
    {
      title: 'Happy Hour Special',
      subtitle: 'Buy 2 Get 1 Free on Selected Items',
      icon: Sparkles,
    },
    {
      title: 'Loyalty Program',
      subtitle: 'Earn Points with Every Purchase',
      icon: ShoppingBag,
    },
  ];

  // Show welcome screen when cart is empty
  useEffect(() => {
    setShowWelcome(displayState.itemCount === 0);
  }, [displayState.itemCount]);

  // Show gift chain when there are active gifts and cart is empty
  useEffect(() => {
    const hasActiveGifts = giftChainState.recentGifts.length > 0;
    setShowGiftChain(hasActiveGifts && displayState.itemCount === 0);
  }, [giftChainState.recentGifts, displayState.itemCount]);

  // Rotate promotional content when in welcome mode
  useEffect(() => {
    if (showWelcome) {
      const interval = setInterval(() => {
        setCurrentPromo((prev) => (prev + 1) % promos.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [showWelcome, promos.length]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait">
        {showGiftChain && displayState.itemCount === 0 ? (
          <motion.div
            key="gift-chain"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full"
          >
            <GiftChainVisualization giftUnits={giftChainState.recentGifts} />
          </motion.div>
        ) : showWelcome ? (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-8 px-8"
          >
            {/* Logo or Brand */}
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
            >
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
                {React.createElement(promos[currentPromo].icon, {
                  className: 'w-16 h-16 text-white',
                })}
              </div>
            </motion.div>

            {/* Promotional Message */}
            <motion.div
              key={currentPromo}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <h1 className="text-6xl font-bold text-gray-900">
                {promos[currentPromo].title}
              </h1>
              <p className="text-3xl text-gray-600">
                {promos[currentPromo].subtitle}
              </p>
            </motion.div>

            {/* Decorative Elements */}
            <div className="flex justify-center gap-2 pt-8">
              {promos.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentPromo
                      ? 'bg-blue-600 w-8'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="cart"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-6xl px-12 py-8"
          >
            {/* Header */}
            <div className="text-center mb-12">
              <h2 className="text-5xl font-bold text-gray-900 mb-2">
                Your Order
              </h2>
              <p className="text-2xl text-gray-600">
                {displayState.itemCount} {displayState.itemCount === 1 ? 'item' : 'items'}
              </p>
            </div>

            {/* Cart Items */}
            <div className="space-y-6 mb-12">
              <AnimatePresence>
                {displayState.items.map((item, index) => (
                  <motion.div
                    key={`${item.id}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-3xl shadow-lg p-8 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                        {item.quantity}
                      </div>
                      <div>
                        <h3 className="text-3xl font-semibold text-gray-900">
                          {item.name}
                        </h3>
                        <p className="text-xl text-gray-500">
                          ${item.price.toFixed(2)} each
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-4xl font-bold text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Total */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-2xl p-10 text-white"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-4xl font-bold">Total</h3>
                <p className="text-6xl font-bold">
                  ${displayState.total.toFixed(2)}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
