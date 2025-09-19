import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'

export interface Sale {
  id: string
  receiptNumber: string
  customer?: {
    id: string
    name: string
    phone: string
  }
  totalAmount: number
  subtotal: number
  taxAmount: number
  discountAmount: number
  paymentMethod: 'CASH' | 'CARD' | 'DIGITAL'
  status: 'COMPLETED' | 'REFUNDED' | 'CANCELLED' | 'PENDING'
  cashReceived?: number
  changeGiven?: number
  items: Array<{
    id: string
    product: { name: string; price: number }
    quantity: number
    unitPrice: number
    totalAmount: number
  }>
  createdAt: Date
}

interface SalesStore {
  sales: Sale[]
  loading: boolean
  error: string | null
  fetchSales: () => Promise<void>
  addSale: (sale: Omit<Sale, 'id' | 'createdAt'>) => void
  updateSaleStatus: (saleId: string, status: Sale['status']) => void
  getTodaysSales: () => Sale[]
  getTotalRevenue: () => number
  getSalesCount: () => number
}

export const useSalesStore = create<SalesStore>()(
  persist(
    (set, get) => ({
      sales: [],
      loading: false,
      error: null,

      fetchSales: async () => {
        try {
          set({ loading: true, error: null })
          const response = await axios.get('/api/sales')
          set({
            sales: response.data.map((sale: any) => ({
              ...sale,
              createdAt: new Date(sale.createdAt)
            })),
            loading: false
          })
        } catch (error) {
          console.error('Error fetching sales:', error)
          set({
            error: 'Failed to fetch sales',
            loading: false
          })
        }
      },

      addSale: (saleData) => {
        const newSale: Sale = {
          ...saleData,
          id: `sale-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          createdAt: new Date(),
        }

        set(state => ({
          sales: [newSale, ...state.sales]
        }))
      },

      updateSaleStatus: (saleId, status) => {
        set(state => ({
          sales: state.sales.map(sale =>
            sale.id === saleId ? { ...sale, status } : sale
          )
        }))
      },

      getTodaysSales: () => {
        const today = new Date().toDateString()
        return get().sales.filter(sale =>
          sale.createdAt.toDateString() === today && sale.status === 'COMPLETED'
        )
      },

      getTotalRevenue: () => {
        return get().sales
          .filter(sale => sale.status === 'COMPLETED')
          .reduce((total, sale) => total + sale.totalAmount, 0)
      },

      getSalesCount: () => {
        return get().sales.filter(sale => sale.status === 'COMPLETED').length
      },
    }),
    {
      name: 'sales-storage',
    }
  )
)
