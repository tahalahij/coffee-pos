'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useProductStore } from '@/hooks/use-product-store'
import type { Category, Product } from '@/lib/services'

interface AddProductModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd?: (newProductData: Omit<Product, "id" | "category">) => void
  categories: Category[]
}

export function AddProductModal({ isOpen, onClose, onAdd, categories }: AddProductModalProps) {
  const { addProduct, loading } = useProductStore()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    cost: '',
    stock: '',
    lowStockAlert: '',
    categoryId: '',
    isAvailable: true,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  if (!isOpen) return null

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = 'Product name is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Valid price is required'
    if (!formData.cost || parseFloat(formData.cost) < 0) newErrors.cost = 'Valid cost is required'
    if (!formData.stock || parseInt(formData.stock) < 0) newErrors.stock = 'Valid stock quantity is required'
    if (!formData.lowStockAlert || parseInt(formData.lowStockAlert) < 0) newErrors.lowStockAlert = 'Valid low stock alert is required'
    if (!formData.categoryId) newErrors.categoryId = 'Category is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    const newProduct = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: parseFloat(formData.price),
      cost: parseFloat(formData.cost),
      stock: parseInt(formData.stock),
      lowStockAlert: parseInt(formData.lowStockAlert),
      categoryId: formData.categoryId,
      isAvailable: formData.isAvailable,
    }

    try {
      await addProduct(newProduct)
      onAdd?.(newProduct) // Call onAdd prop if provided

      // Reset form
      setFormData({
        name: '',
        description: '',
        price: '',
        cost: '',
        stock: '',
        lowStockAlert: '',
        categoryId: '',
        isAvailable: true,
      })
      setErrors({})
      onClose()
    } catch (error) {
      // Error is already handled in the store
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Add New Product</h2>
          <Button variant="ghost" onClick={onClose} className="p-1">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Product Name</label>
            <Input
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter product name"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Input
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter product description"
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Price ($)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder="0.00"
                className={errors.price ? 'border-red-500' : ''}
              />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Cost ($)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) => handleInputChange('cost', e.target.value)}
                placeholder="0.00"
                className={errors.cost ? 'border-red-500' : ''}
              />
              {errors.cost && <p className="text-red-500 text-xs mt-1">{errors.cost}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Stock Quantity</label>
              <Input
                type="number"
                value={formData.stock}
                onChange={(e) => handleInputChange('stock', e.target.value)}
                placeholder="0"
                className={errors.stock ? 'border-red-500' : ''}
              />
              {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Low Stock Alert</label>
              <Input
                type="number"
                value={formData.lowStockAlert}
                onChange={(e) => handleInputChange('lowStockAlert', e.target.value)}
                placeholder="0"
                className={errors.lowStockAlert ? 'border-red-500' : ''}
              />
              {errors.lowStockAlert && <p className="text-red-500 text-xs mt-1">{errors.lowStockAlert}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={formData.categoryId}
              onChange={(e) => handleInputChange('categoryId', e.target.value)}
              className={`w-full p-2 border rounded-md ${errors.categoryId ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select a category</option>
              {categories.filter(c => c.isActive).map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId}</p>}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isAvailable"
              checked={formData.isAvailable}
              onChange={(e) => handleInputChange('isAvailable', e.target.checked)}
              className="rounded"
            />
            <label htmlFor="isAvailable" className="text-sm font-medium">
              Available for sale
            </label>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Adding...' : 'Add Product'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
