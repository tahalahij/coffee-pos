import { create } from 'zustand'
import { analyticsService, salesService } from '@/lib/services'
import toast from 'react-hot-toast'

interface DashboardStats {
  todaySales: number
  todayOrders: number
  monthSales: number
  monthOrders: number
  totalProducts: number
  lowStockProducts: number
  recentSales: Array<{
    id: string
    receiptNumber: string
    totalAmount: number
    createdAt: string
  }>
}

interface AnalyticsStore {
  dashboardStats: DashboardStats | null
  loading: boolean
  error: string | null
  fetchDashboardStats: () => Promise<void>
  getSalesAnalytics: (period: 'today' | 'week' | 'month') => Promise<any>
}

export const useAnalyticsStore = create<AnalyticsStore>((set, get) => ({
  dashboardStats: null,
  loading: false,
  error: null,

  fetchDashboardStats: async () => {
    try {
      set({ loading: true, error: null })
      const stats = await analyticsService.getDashboardStats()
      set({ dashboardStats: stats, loading: false })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      set({ error: 'Failed to fetch dashboard statistics', loading: false })
      toast.error('Failed to fetch dashboard statistics')
    }
  },

  getSalesAnalytics: async (period) => {
    try {
      return await analyticsService.getSalesAnalytics(period)
    } catch (error) {
      console.error('Error fetching sales analytics:', error)
      toast.error('Failed to fetch sales analytics')
      throw error
    }
  }
}))
