import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { categoryService, type Category } from '@/lib/services'
import toast from 'react-hot-toast'

interface CategoryStore {
  categories: Category[]
  loading: boolean
  error: string | null
  fetchCategories: () => Promise<void>
  addCategory: (category: Omit<Category, 'id' | 'productCount'>) => Promise<void>
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  toggleActive: (id: string) => Promise<void>
}

export const useCategoryStore = create<CategoryStore>()(
  persist(
    (set, get) => ({
      categories: [],
      loading: false,
      error: null,

      fetchCategories: async () => {
        try {
          set({ loading: true, error: null })
          const categories = await categoryService.getAll()
          set({ categories, loading: false })
        } catch (error: any) {
          console.error('Error fetching categories:', error)
          // Check if it's a connection error (backend not ready) - don't show toast
          const isConnectionError = error?.code === 'ERR_NETWORK' || 
            error?.message?.includes('fetch') || 
            error?.message?.includes('Network') ||
            error?.message?.includes('ECONNREFUSED')
          
          // Keep existing categories if we have them, otherwise set empty array
          set(state => ({ 
            categories: state.categories.length > 0 ? state.categories : [],
            error: isConnectionError ? null : 'Failed to fetch categories', 
            loading: false 
          }))
          
          // Only show toast for non-connection errors
          if (!isConnectionError) {
            toast.error('Failed to fetch categories')
          }
        }
      },

      addCategory: async (categoryData) => {
        try {
          set({ loading: true, error: null })
          const newCategory = await categoryService.create(categoryData)
          set(state => ({
            categories: [...state.categories, { ...newCategory, productCount: 0 }],
            loading: false
          }))
          toast.success('Category created successfully!')
        } catch (error) {
          console.error('Error creating category:', error)
          set({ error: 'Failed to create category', loading: false })
          toast.error('Failed to create category')
          throw error
        }
      },

      updateCategory: async (id, categoryData) => {
        try {
          const updatedCategory = await categoryService.update(id, categoryData)
          set(state => ({
            categories: state.categories.map(category =>
              category.id === id ? updatedCategory : category
            )
          }))
          toast.success('Category updated successfully!')
        } catch (error) {
          console.error('Error updating category:', error)
          toast.error('Failed to update category')
        }
      },

      deleteCategory: async (id) => {
        try {
          await categoryService.delete(id)
          set(state => ({
            categories: state.categories.filter(category => category.id !== id)
          }))
          toast.success('Category deleted successfully!')
        } catch (error) {
          console.error('Error deleting category:', error)
          toast.error('Failed to delete category')
        }
      },

      toggleActive: async (id) => {
        const category = get().categories.find(c => c.id === id)
        if (!category) return

        try {
          const updatedCategory = await categoryService.update(id, {
            isActive: !category.isActive
          })
          set(state => ({
            categories: state.categories.map(c =>
              c.id === id ? updatedCategory : c
            )
          }))
          toast.success('Category status updated!')
        } catch (error) {
          console.error('Error toggling category status:', error)
          toast.error('Failed to update category status')
        }
      }
    }),
    {
      name: 'category-storage',
    }
  )
)
