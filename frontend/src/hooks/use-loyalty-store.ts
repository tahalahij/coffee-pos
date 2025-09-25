import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { loyaltyService, discountCodeService } from '@/lib/services'
import toast from 'react-hot-toast'

interface LoyaltyStore {
  customerLoyalty: any
  loyaltyHistory: any
  loyaltyStats: any
  loading: boolean
  error: string | null
  fetchCustomerLoyalty: (customerId: string) => Promise<void>
  fetchLoyaltyHistory: (customerId: string) => Promise<void>
  fetchLoyaltyStats: () => Promise<void>
  addPoints: (customerId: string, data: any) => Promise<void>
  redeemPoints: (customerId: string, points: number) => Promise<void>
  awardBonusPoints: (customerId: string, points: number, reason: string) => Promise<void>
  calculatePoints: (customerId: string, amount: number) => Promise<number>
}

export const useLoyaltyStore = create<LoyaltyStore>()(
  persist(
    (set, get) => ({
      customerLoyalty: null,
      loyaltyHistory: null,
      loyaltyStats: null,
      loading: false,
      error: null,

      fetchCustomerLoyalty: async (customerId) => {
        try {
          set({ loading: true, error: null })
          const customerLoyalty = await loyaltyService.getCustomerLoyalty(customerId)
          set({ customerLoyalty, loading: false })
        } catch (error) {
          console.error('Error fetching customer loyalty:', error)
          set({ error: 'Failed to fetch customer loyalty', loading: false })
          toast.error('Failed to fetch customer loyalty')
        }
      },

      fetchLoyaltyHistory: async (customerId) => {
        try {
          const loyaltyHistory = await loyaltyService.getLoyaltyHistory(customerId)
          set({ loyaltyHistory })
        } catch (error) {
          console.error('Error fetching loyalty history:', error)
          toast.error('Failed to fetch loyalty history')
        }
      },

      fetchLoyaltyStats: async () => {
        try {
          const loyaltyStats = await loyaltyService.getStats()
          set({ loyaltyStats })
        } catch (error) {
          console.error('Error fetching loyalty stats:', error)
          toast.error('Failed to fetch loyalty statistics')
        }
      },

      addPoints: async (customerId, data) => {
        try {
          await loyaltyService.addPoints(customerId, data)
          toast.success('Points added successfully!')
          // Refresh customer loyalty data
          get().fetchCustomerLoyalty(customerId)
        } catch (error) {
          console.error('Error adding points:', error)
          toast.error('Failed to add points')
        }
      },

      redeemPoints: async (customerId, points) => {
        try {
          await loyaltyService.redeemPoints(customerId, points)
          toast.success('Points redeemed successfully!')
          // Refresh customer loyalty data
          get().fetchCustomerLoyalty(customerId)
        } catch (error) {
          console.error('Error redeeming points:', error)
          toast.error('Failed to redeem points')
        }
      },

      awardBonusPoints: async (customerId, points, reason) => {
        try {
          await loyaltyService.awardBonus(customerId, points, reason)
          toast.success('Bonus points awarded successfully!')
          // Refresh customer loyalty data
          get().fetchCustomerLoyalty(customerId)
        } catch (error) {
          console.error('Error awarding bonus points:', error)
          toast.error('Failed to award bonus points')
        }
      },

      calculatePoints: async (customerId, amount) => {
        try {
          return await loyaltyService.calculatePoints(customerId, amount)
        } catch (error) {
          console.error('Error calculating points:', error)
          toast.error('Failed to calculate points')
          return 0
        }
      }
    }),
    {
      name: 'loyalty-storage',
    }
  )
)
