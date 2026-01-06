'use client';

import { useState, useEffect, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';

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

interface GiftChainState {
  activeChains: GiftUnit[][];
  recentGifts: GiftUnit[];
}

interface GiftChainSyncResult {
  giftChainState: GiftChainState;
  connected: boolean;
  updateGiftChain: (state: GiftChainState) => void;
}

const BACKEND_PORT = process.env.NEXT_PUBLIC_BACKEND_PORT || '3001';
const SOCKET_URL = `http://localhost:${BACKEND_PORT}/gift-chain`;

export function useGiftChainSync(): GiftChainSyncResult {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [giftChainState, setGiftChainState] = useState<GiftChainState>({
    activeChains: [],
    recentGifts: [],
  });

  // Initialize socket connection
  useEffect(() => {
    const socketInstance = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      console.log('[Gift Chain] Connected to backend');
      setConnected(true);
      
      // Request initial state
      socketInstance.emit('request-gift-state');
    });

    socketInstance.on('disconnect', () => {
      console.log('[Gift Chain] Disconnected from backend');
      setConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('[Gift Chain] Connection error:', error);
      setConnected(false);
    });

    // Listen for gift chain events
    socketInstance.on('gift-chain-message', (data: any) => {
      console.log('[Gift Chain] Received message:', data);
      
      switch (data.type) {
        case 'GIFT_UNIT_CREATED':
          handleGiftCreated(data.payload);
          break;
        case 'GIFT_UNIT_CLAIMED':
          handleGiftClaimed(data.payload);
          break;
        case 'GIFT_CHAIN_CONTINUED':
          handleGiftChainContinued(data.payload);
          break;
        case 'GIFT_STATE_UPDATE':
          setGiftChainState(data.payload);
          break;
        default:
          console.warn('[Gift Chain] Unknown message type:', data.type);
      }
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Handle gift created event
  const handleGiftCreated = useCallback((payload: GiftUnit) => {
    setGiftChainState((prev) => {
      // Add to recent gifts
      const recentGifts = [payload, ...prev.recentGifts].slice(0, 10);
      
      // Update active chains
      const activeChains = [...prev.activeChains];
      
      // If this is a continuation (chainPosition > 1), update existing chain
      if (payload.chainPosition > 1) {
        // Find the chain this belongs to
        const chainIndex = activeChains.findIndex((chain) =>
          chain.some((unit) => unit.chainPosition === payload.chainPosition - 1)
        );
        
        if (chainIndex !== -1) {
          activeChains[chainIndex] = [...activeChains[chainIndex], payload];
        } else {
          // Start new chain if not found
          activeChains.push([payload]);
        }
      } else {
        // New chain
        activeChains.push([payload]);
      }

      return { recentGifts, activeChains };
    });
  }, []);

  // Handle gift claimed event
  const handleGiftClaimed = useCallback((payload: { giftUnitId: string; claimedAt: string }) => {
    setGiftChainState((prev) => {
      // Update the gift unit to mark as claimed
      const recentGifts = prev.recentGifts.map((gift) =>
        gift.id === payload.giftUnitId
          ? { ...gift, claimedAt: payload.claimedAt }
          : gift
      );

      const activeChains = prev.activeChains.map((chain) =>
        chain.map((gift) =>
          gift.id === payload.giftUnitId
            ? { ...gift, claimedAt: payload.claimedAt }
            : gift
        )
      );

      return { recentGifts, activeChains };
    });
  }, []);

  // Handle gift chain continued event
  const handleGiftChainContinued = useCallback((payload: { 
    giftUnitId: string; 
    continuedAt: string;
    newGiftUnit: GiftUnit;
  }) => {
    setGiftChainState((prev) => {
      // Mark the original gift as continued
      const recentGifts = prev.recentGifts.map((gift) =>
        gift.id === payload.giftUnitId
          ? { ...gift, continuedAt: payload.continuedAt }
          : gift
      );

      // Add the new gift to recent gifts
      const updatedRecentGifts = [payload.newGiftUnit, ...recentGifts].slice(0, 10);

      // Update active chains
      const activeChains = prev.activeChains.map((chain) => {
        const giftIndex = chain.findIndex((gift) => gift.id === payload.giftUnitId);
        if (giftIndex !== -1) {
          const updatedChain = chain.map((gift) =>
            gift.id === payload.giftUnitId
              ? { ...gift, continuedAt: payload.continuedAt }
              : gift
          );
          return [...updatedChain, payload.newGiftUnit];
        }
        return chain;
      });

      return { recentGifts: updatedRecentGifts, activeChains };
    });
  }, []);

  // Manual update function
  const updateGiftChain = useCallback((state: GiftChainState) => {
    setGiftChainState(state);
  }, []);

  return {
    giftChainState,
    connected,
    updateGiftChain,
  };
}
