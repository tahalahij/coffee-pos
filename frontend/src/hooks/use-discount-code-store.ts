import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { discountCodeService, type DiscountCode } from '@/lib/services'
import toast from 'react-hot-toast'

interface DiscountCodeStore {
  discountCodes: DiscountCode[]
  discountStats: any
  loading: boolean
  error: string | null
  fetchDiscountCodes: (customerId?: string) => Promise<void>
  fetchDiscountStats: () => Promise<void>
  createDiscountCode: (discountCode: Omit<DiscountCode, 'id' | 'usageCount' | 'createdAt' | 'updatedAt'>) => Promise<void>
  validateDiscountCode: (code: string, customerId?: string, subtotal?: number) => Promise<DiscountCode>
  applyDiscountCode: (code: string, subtotal: number, customerId?: string) => Promise<any>
  generatePersonalizedCodes: (customerId: string, count?: number) => Promise<DiscountCode[]>
  createBulkCodes: (data: any) => Promise<DiscountCode[]>
  getCustomerHistory: (customerId: string) => Promise<any>
  cleanupExpiredCodes: () => Promise<any>
}

export const useDiscountCodeStore = create<DiscountCodeStore>()(
  persist(
    (set, get) => ({
      discountCodes: [],
      discountStats: null,
      loading: false,
      error: null,

      fetchDiscountCodes: async (customerId) => {
        try {
          set({ loading: true, error: null })
          const discountCodes = await discountCodeService.getAll(customerId)
          set({ discountCodes, loading: false })
        } catch (error) {
          console.error('Error fetching discount codes:', error)
          set({ error: 'Failed to fetch discount codes', loading: false })
          toast.error('Failed to fetch discount codes')
        }
      },

      fetchDiscountStats: async () => {
        try {
          const discountStats = await discountCodeService.getStats()
          set({ discountStats })
        } catch (error) {
          console.error('Error fetching discount stats:', error)
          toast.error('Failed to fetch discount statistics')
        }
      },

      createDiscountCode: async (discountCodeData) => {
        try {
          set({ loading: true, error: null })
          const newDiscountCode = await discountCodeService.create(discountCodeData)
          set(state => ({
            discountCodes: [newDiscountCode, ...state.discountCodes],
            loading: false
          }))
          toast.success('Discount code created successfully!')
        } catch (error) {
          console.error('Error creating discount code:', error)
          set({ error: 'Failed to create discount code', loading: false })
          toast.error('Failed to create discount code')
          throw error
        }
      },

      validateDiscountCode: async (code, customerId, subtotal) => {
        try {
          return await discountCodeService.validate(code, customerId, subtotal)
        } catch (error) {
          console.error('Error validating discount code:', error)
          toast.error('Invalid discount code')
          throw error
        }
      },

      applyDiscountCode: async (code, subtotal, customerId) => {
        try {
          return await discountCodeService.apply(code, subtotal, customerId)
        } catch (error) {
          console.error('Error applying discount code:', error)
          toast.error('Failed to apply discount code')
          throw error
        }
      },

      generatePersonalizedCodes: async (customerId, count = 1) => {
        try {
          const codes = await discountCodeService.generatePersonalized(customerId, count)
          toast.success(`Generated ${codes.length} personalized discount code${codes.length > 1 ? 's' : ''}!`)
          // Refresh discount codes
          get().fetchDiscountCodes()
          return codes
        } catch (error) {
          console.error('Error generating personalized codes:', error)
          toast.error('Failed to generate personalized codes')
          throw error
        }
      },

      createBulkCodes: async (data) => {
        try {
          const codes = await discountCodeService.createBulk(data)
          toast.success(`Created ${codes.length} discount codes successfully!`)
          // Refresh discount codes
          get().fetchDiscountCodes()
          return codes
        } catch (error) {
          console.error('Error creating bulk codes:', error)
          toast.error('Failed to create bulk codes')
          throw error
        }
      },

      getCustomerHistory: async (customerId) => {
        try {
          return await discountCodeService.getCustomerHistory(customerId)
        } catch (error) {
          console.error('Error fetching customer discount history:', error)
          toast.error('Failed to fetch discount history')
          throw error
        }
      },

      cleanupExpiredCodes: async () => {
        try {
          const result = await discountCodeService.cleanupExpired()
          toast.success(`Deactivated ${result.deactivatedCount} expired codes`)
          // Refresh discount codes
          get().fetchDiscountCodes()
          return result
        } catch (error) {
          console.error('Error cleaning up expired codes:', error)
          toast.error('Failed to cleanup expired codes')
          throw error
        }
      }
    }),
    {
      name: 'discount-code-storage',
    }
  )
)
