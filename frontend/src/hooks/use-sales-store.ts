import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { salesService, type Sale as ServiceSale } from '@/lib/services'
import toast from 'react-hot-toast'

// Export the Sale type with proper Date handling for components
export type Sale = Omit<ServiceSale, 'createdAt'> & {
  createdAt: Date
}

// Internal store type with Date objects for better date handling
export type StoreSale = Sale

interface SalesStore {
  sales: StoreSale[]
  loading: boolean
  error: string | null
  fetchSales: () => Promise<void>
  addSale: (sale: Omit<ServiceSale, 'id' | 'receiptNumber' | 'createdAt'>) => Promise<void>
  updateSaleStatus: (saleId: string, status: ServiceSale['status']) => Promise<void>
  getTodaysSales: () => StoreSale[]
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
          const sales = await salesService.getAll()
          set({
            sales: sales.map(sale => ({
              ...sale,
              createdAt: new Date(sale.createdAt)
            })) as StoreSale[],
            loading: false
          })
        } catch (error) {
          console.error('Error fetching sales:', error)
          set({
            error: 'Failed to fetch sales',
            loading: false
          })
          toast.error('Failed to fetch sales')
        }
      },

      addSale: async (saleData) => {
        try {
          set({ loading: true, error: null })
          const newSale = await salesService.create(saleData)
          set(state => ({
            sales: [{ ...newSale, createdAt: new Date(newSale.createdAt) }, ...state.sales],
            loading: false
          }))
          toast.success('Sale created successfully!')
        } catch (error) {
          console.error('Error creating sale:', error)
          set({ error: 'Failed to create sale', loading: false })
          toast.error('Failed to create sale')
          throw error
        }
      },

      updateSaleStatus: async (saleId, status) => {
        try {
          const updatedSale = await salesService.updateStatus(saleId, status)
          set(state => ({
            sales: state.sales.map(sale =>
              sale.id === saleId ? { ...updatedSale, createdAt: new Date(updatedSale.createdAt) } : sale
            )
          }))
          toast.success('Sale status updated!')
        } catch (error) {
          console.error('Error updating sale status:', error)
          toast.error('Failed to update sale status')
        }
      },

      getTodaysSales: () => {
        const today = new Date().toDateString()
        return get().sales.filter(sale =>
          new Date(sale.createdAt).toDateString() === today && sale.status === 'COMPLETED'
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
