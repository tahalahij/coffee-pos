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
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error)
      // Check if it's a connection error (backend not ready) - don't show toast
      const isConnectionError = error?.code === 'ERR_NETWORK' || 
        error?.message?.includes('fetch') || 
        error?.message?.includes('Network') ||
        error?.message?.includes('ECONNREFUSED')
      
      // Set default empty stats instead of error state
      const defaultStats = {
        todaySales: 0,
        todayOrders: 0,
        monthSales: 0,
        monthOrders: 0,
        totalProducts: 0,
        lowStockProducts: 0,
        recentSales: []
      }
      
      set(state => ({ 
        dashboardStats: state.dashboardStats || defaultStats,
        error: isConnectionError ? null : 'Failed to fetch dashboard statistics', 
        loading: false 
      }))
      
      // Only show toast for non-connection errors
      if (!isConnectionError) {
        toast.error('Failed to fetch dashboard statistics')
      }
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
