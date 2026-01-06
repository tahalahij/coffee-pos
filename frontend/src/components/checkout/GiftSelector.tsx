'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Coffee, Cookie } from 'lucide-react';
import { useState } from 'react';

interface GiftUnit {
  _id: string;
  productId: string;
  productName: string;
  productType?: string;
  giftedByName?: string;
  createdAt: string;
  chainPosition: number;
}

interface GiftSelectorProps {
  availableGifts: GiftUnit[];
  selectedGiftIds: string[];
  onSelect: (giftId: string) => void;
  onClose: () => void;
}

export function GiftSelector({
  availableGifts,
  selectedGiftIds,
  onSelect,
  onClose,
}: GiftSelectorProps) {
  const getIcon = (productName: string) => {
    const name = productName.toLowerCase();
    if (name.includes('coffee') || name.includes('latte') || name.includes('espresso')) {
      return Coffee;
    }
    return Cookie; // Default
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold">Available Gifts</h2>
            <p className="text-purple-100 mt-1">
              {selectedGiftIds.length} selected
            </p>
          </div>

          {/* Gift list */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            <div className="space-y-3">
              {availableGifts.map((gift) => {
                const Icon = getIcon(gift.productName);
                const isSelected = selectedGiftIds.includes(gift._id);

                return (
                  <motion.button
                    key={gift._id}
                    onClick={() => onSelect(gift._id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      w-full p-4 rounded-xl border-2 transition-all text-left
                      ${
                        isSelected
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300 bg-white'
                      }
                    `}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`
                        w-12 h-12 rounded-lg flex items-center justify-center
                        ${isSelected ? 'bg-purple-500' : 'bg-gray-100'}
                      `}
                      >
                        <Icon
                          className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-gray-600'}`}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {gift.productName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {gift.giftedByName || 'Anonymous'}
                          {gift.chainPosition > 1 && (
                            <span className="ml-2 text-purple-600">
                              Chain {gift.chainPosition}
                            </span>
                          )}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">✓</span>
                        </div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t p-4 bg-gray-50 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
            >
              Done
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
