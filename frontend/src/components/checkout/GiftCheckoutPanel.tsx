'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGiftCheckout } from '@/hooks/use-gift-checkout';
import { GiftIndicator } from '@/components/checkout/GiftIndicator';
import { GiftSelector } from '@/components/checkout/GiftSelector';
import { ChainToggle } from '@/components/checkout/ChainToggle';

interface GiftCheckoutPanelProps {
  onGiftMetadataChange?: (metadata: any) => void;
  customerName?: string;
}

/**
 * GiftCheckoutPanel
 * 
 * Non-blocking checkout extension for Pay It Forward gift chain.
 * 
 * Usage:
 * 1. Add to your existing checkout UI (does not modify checkout flow)
 * 2. Pass gift metadata to your order submission via onGiftMetadataChange
 * 3. Handle post-payment gift processing in your backend
 * 
 * This component is completely optional and can be hidden/removed without
 * affecting existing checkout functionality.
 */
export function GiftCheckoutPanel({ onGiftMetadataChange, customerName }: GiftCheckoutPanelProps) {
  const [showGiftSelector, setShowGiftSelector] = useState(false);
  
  const {
    availableCount,
    availableGifts,
    selectedGiftIds,
    buyForNext,
    toggleGiftSelection,
    setBuyForNext,
    setGifterName,
    getGiftMetadata,
    hasSelectedGifts,
    shouldEmphasizeChainToggle,
  } = useGiftCheckout();

  // Use customer name when available
  useEffect(() => {
    if (customerName && buyForNext) {
      setGifterName(customerName);
    }
  }, [customerName, buyForNext, setGifterName]);

  // Notify parent of metadata changes
  const handleMetadataChange = () => {
    if (onGiftMetadataChange) {
      onGiftMetadataChange(getGiftMetadata());
    }
  };

  const handleGiftToggle = (giftId: string) => {
    toggleGiftSelection(giftId);
    handleMetadataChange();
  };

  const handleBuyForNextToggle = (enabled: boolean) => {
    setBuyForNext(enabled);
    handleMetadataChange();
  };

  return (
    <div className="space-y-4">
      {/* Gift availability indicator - non-blocking, passive */}
      {availableCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <GiftIndicator
            availableCount={availableCount}
            onClick={() => setShowGiftSelector(true)}
          />
          {hasSelectedGifts && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-sm text-purple-600 font-medium"
            >
              {selectedGiftIds.length} gift{selectedGiftIds.length > 1 ? 's' : ''} applied
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Chain continuation toggle - always visible */}
      <ChainToggle
        enabled={buyForNext}
        onChange={handleBuyForNextToggle}
        emphasized={shouldEmphasizeChainToggle}
      />

      {/* Gift selector modal */}
      {showGiftSelector && (
        <GiftSelector
          availableGifts={availableGifts}
          selectedGiftIds={selectedGiftIds}
          onSelect={handleGiftToggle}
          onClose={() => setShowGiftSelector(false)}
        />
      )}
    </div>
  );
}
