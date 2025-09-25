import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { productService, type Product } from '@/lib/services'
import toast from 'react-hot-toast'

interface ProductStore {
  products: Product[]
  loading: boolean
  error: string | null
  fetchProducts: () => Promise<void>
  addProduct: (product: Omit<Product, 'id' | 'category'>) => Promise<void>
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>
  deleteProduct: (id: string) => Promise<void>
  updateStock: (id: string, stock: number) => Promise<void>
  toggleAvailability: (id: string) => Promise<void>
  getLowStockProducts: () => Product[]
}

export const useProductStore = create<ProductStore>()(
  persist(
    (set, get) => ({
      products: [],
      loading: false,
      error: null,

      fetchProducts: async () => {
        try {
          set({ loading: true, error: null })
          const products = await productService.getAll()
          set({ products, loading: false })
        } catch (error) {
          console.error('Error fetching products:', error)
          set({ error: 'Failed to fetch products', loading: false })
          toast.error('Failed to fetch products')
        }
      },

      addProduct: async (productData) => {
        try {
          set({ loading: true, error: null })
          const newProduct = await productService.create(productData)
          set(state => ({
            products: [...state.products, newProduct],
            loading: false
          }))
          toast.success('Product created successfully!')
        } catch (error) {
          console.error('Error creating product:', error)
          set({ error: 'Failed to create product', loading: false })
          toast.error('Failed to create product')
          throw error
        }
      },

      updateProduct: async (id, productData) => {
        try {
          const updatedProduct = await productService.update(id, productData)
          set(state => ({
            products: state.products.map(product =>
              product.id === id ? updatedProduct : product
            )
          }))
          toast.success('Product updated successfully!')
        } catch (error) {
          console.error('Error updating product:', error)
          toast.error('Failed to update product')
        }
      },

      deleteProduct: async (id) => {
        try {
          await productService.delete(id)
          set(state => ({
            products: state.products.filter(product => product.id !== id)
          }))
          toast.success('Product deleted successfully!')
        } catch (error) {
          console.error('Error deleting product:', error)
          toast.error('Failed to delete product')
        }
      },

      updateStock: async (id, stock) => {
        try {
          const updatedProduct = await productService.updateStock(id, stock)
          set(state => ({
            products: state.products.map(product =>
              product.id === id ? updatedProduct : product
            )
          }))
          toast.success('Stock updated successfully!')
        } catch (error) {
          console.error('Error updating stock:', error)
          toast.error('Failed to update stock')
        }
      },

      toggleAvailability: async (id) => {
        const product = get().products.find(p => p.id === id)
        if (!product) return

        try {
          const updatedProduct = await productService.update(id, {
            isAvailable: !product.isAvailable
          })
          set(state => ({
            products: state.products.map(p =>
              p.id === id ? updatedProduct : p
            )
          }))
          toast.success(`Product ${updatedProduct.isAvailable ? 'enabled' : 'disabled'}!`)
        } catch (error) {
          console.error('Error toggling availability:', error)
          toast.error('Failed to update product availability')
        }
      },

      getLowStockProducts: () => {
        return get().products.filter(product =>
          product.stock <= product.lowStockAlert
        )
      }
    }),
    {
      name: 'product-storage',
    }
  )
)
