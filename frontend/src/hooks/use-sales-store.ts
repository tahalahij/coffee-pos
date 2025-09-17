import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Sale {
  id: string
  receiptNumber: string
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
  addSale: (sale: Omit<Sale, 'id' | 'createdAt'>) => void
  updateSaleStatus: (saleId: string, status: Sale['status']) => void
  getTodaysSales: () => Sale[]
  getTotalRevenue: () => number
  getSalesCount: () => number
}

export const useSalesStore = create<SalesStore>()(
  persist(
    (set, get) => ({
      sales: [
        // Initial mock data
        {
          id: '1',
          receiptNumber: 'RCP-20250916-0001',
          totalAmount: 15.75,
          subtotal: 14.58,
          taxAmount: 1.17,
          discountAmount: 0,
          paymentMethod: 'CASH',
          status: 'COMPLETED',
          items: [
            {
              id: '1',
              product: { name: 'Cappuccino', price: 3.75 },
              quantity: 2,
              unitPrice: 3.75,
              totalAmount: 7.50
            },
            {
              id: '2',
              product: { name: 'Croissant', price: 3.50 },
              quantity: 2,
              unitPrice: 3.50,
              totalAmount: 7.00
            },
          ],
          createdAt: new Date('2025-09-16T10:30:00'),
        }
      ],

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
