'use client';

import { useState, useEffect, useCallback } from 'react';

interface GiftUnit {
  _id: string;
  productId: string;
  productName: string;
  productType?: string;
  giftedByName?: string;
  createdAt: string;
  chainPosition: number;
}

interface GiftCheckoutState {
  availableGifts: GiftUnit[];
  availableCount: number;
  selectedGiftIds: string[];
  buyForNext: boolean;
  gifterName: string;
  loading: boolean;
  error: string | null;
}

const BACKEND_PORT = process.env.NEXT_PUBLIC_BACKEND_PORT || '3001';
const API_BASE = `http://localhost:${BACKEND_PORT}`;

export function useGiftCheckout() {
  const [state, setState] = useState<GiftCheckoutState>({
    availableGifts: [],
    availableCount: 0,
    selectedGiftIds: [],
    buyForNext: false,
    gifterName: '',
    loading: false,
    error: null,
  });

  // Fetch available gifts on mount
  useEffect(() => {
    fetchAvailableGifts();
  }, []);

  const fetchAvailableGifts = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const [giftsRes, countRes] = await Promise.all([
        fetch(`${API_BASE}/gifts/available`),
        fetch(`${API_BASE}/gifts/available/count`),
      ]);

      if (!giftsRes.ok || !countRes.ok) {
        throw new Error('Failed to fetch available gifts');
      }

      const gifts = await giftsRes.json();
      const { count } = await countRes.json();

      setState((prev) => ({
        ...prev,
        availableGifts: gifts,
        availableCount: count,
        loading: false,
      }));
    } catch (error) {
      console.error('Failed to fetch gifts:', error);
      setState((prev) => ({
        ...prev,
        error: 'Failed to load gifts',
        loading: false,
      }));
    }
  }, []);

  const toggleGiftSelection = useCallback((giftId: string) => {
    setState((prev) => {
      const isSelected = prev.selectedGiftIds.includes(giftId);
      const selectedGiftIds = isSelected
        ? prev.selectedGiftIds.filter((id) => id !== giftId)
        : [...prev.selectedGiftIds, giftId];

      return { ...prev, selectedGiftIds };
    });
  }, []);

  const setBuyForNext = useCallback((enabled: boolean) => {
    setState((prev) => ({ ...prev, buyForNext: enabled }));
  }, []);

  const setGifterName = useCallback((name: string) => {
    setState((prev) => ({ ...prev, gifterName: name }));
  }, []);

  const clearSelections = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedGiftIds: [],
      buyForNext: false,
      gifterName: '',
    }));
  }, []);

  // Get selected gift objects
  const getSelectedGifts = useCallback(() => {
    return state.availableGifts.filter((gift) =>
      state.selectedGiftIds.includes(gift._id)
    );
  }, [state.availableGifts, state.selectedGiftIds]);

  // Calculate discount amount for selected gifts
  const getGiftDiscountTotal = useCallback(() => {
    const selectedGifts = getSelectedGifts();
    // This assumes we need to look up product prices
    // In a real implementation, you'd fetch prices from your product service
    // For now, return 0 and let the checkout flow handle pricing
    return 0;
  }, [getSelectedGifts]);

  // Prepare gift metadata for order submission
  const getGiftMetadata = useCallback(() => {
    return {
      claimedGiftIds: state.selectedGiftIds,
      buyForNext: state.buyForNext,
      gifterName: state.gifterName || undefined,
    };
  }, [state.selectedGiftIds, state.buyForNext, state.gifterName]);

  return {
    // State
    availableGifts: state.availableGifts,
    availableCount: state.availableCount,
    selectedGiftIds: state.selectedGiftIds,
    buyForNext: state.buyForNext,
    gifterName: state.gifterName,
    loading: state.loading,
    error: state.error,

    // Actions
    fetchAvailableGifts,
    toggleGiftSelection,
    setBuyForNext,
    setGifterName,
    clearSelections,

    // Computed
    getSelectedGifts,
    getGiftDiscountTotal,
    getGiftMetadata,

    // Flags
    hasSelectedGifts: state.selectedGiftIds.length > 0,
    shouldEmphasizeChainToggle: state.selectedGiftIds.length > 0,
  };
}
