import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { customerService, type Customer } from '@/lib/services'
import toast from 'react-hot-toast'

interface CustomerStore {
  customers: Customer[]
  loading: boolean
  error: string | null
  fetchCustomers: () => Promise<void>
  addCustomer: (customer: Omit<Customer, 'id'>) => Promise<void>
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>
  deleteCustomer: (id: string) => Promise<void>
  getCustomerByPhone: (phone: string) => Customer | undefined
}

export const useCustomerStore = create<CustomerStore>()(
  persist(
    (set, get) => ({
      customers: [],
      loading: false,
      error: null,

      fetchCustomers: async () => {
        try {
          set({ loading: true, error: null })
          const customers = await customerService.getAll()
          set({ customers, loading: false })
        } catch (error) {
          console.error('Error fetching customers:', error)
          set({ error: 'Failed to fetch customers', loading: false })
          toast.error('Failed to fetch customers')
        }
      },

      addCustomer: async (customerData) => {
        try {
          set({ loading: true, error: null })
          const newCustomer = await customerService.create(customerData)
          set(state => ({
            customers: [...state.customers, newCustomer],
            loading: false
          }))
          toast.success('Customer created successfully!')
        } catch (error) {
          console.error('Error creating customer:', error)
          set({ error: 'Failed to create customer', loading: false })
          toast.error('Failed to create customer')
          throw error
        }
      },

      updateCustomer: async (id, customerData) => {
        try {
          const updatedCustomer = await customerService.update(id, customerData)
          set(state => ({
            customers: state.customers.map(customer =>
              customer.id === id ? updatedCustomer : customer
            )
          }))
          toast.success('Customer updated successfully!')
        } catch (error) {
          console.error('Error updating customer:', error)
          toast.error('Failed to update customer')
        }
      },

      deleteCustomer: async (id) => {
        try {
          await customerService.delete(id)
          set(state => ({
            customers: state.customers.filter(customer => customer.id !== id)
          }))
          toast.success('Customer deleted successfully!')
        } catch (error) {
          console.error('Error deleting customer:', error)
          toast.error('Failed to delete customer')
        }
      },

      getCustomerByPhone: (phone) => {
        return get().customers.find(customer => customer.phone === phone)
      }
    }),
    {
      name: 'customer-storage',
    }
  )
)
