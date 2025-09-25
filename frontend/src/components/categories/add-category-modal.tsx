'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCategoryStore } from '@/hooks/use-category-store'

interface AddCategoryModalProps {
  isOpen: boolean
  onClose: () => void
}

const colorOptions = [
  '#8B4513', // Brown (Coffee)
  '#228B22', // Forest Green (Tea)
  '#DAA520', // Goldenrod (Pastries)
  '#CD853F', // Peru (Sandwiches)
  '#4682B4', // Steel Blue
  '#DC143C', // Crimson
  '#FF8C00', // Dark Orange
  '#9932CC', // Dark Orchid
  '#008B8B', // Dark Cyan
  '#556B2F', // Dark Olive Green
]

export function AddCategoryModal({ isOpen, onClose }: AddCategoryModalProps) {
  const { addCategory, loading } = useCategoryStore()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedColor, setSelectedColor] = useState(colorOptions[0])
  const [isActive, setIsActive] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})

  if (!isOpen) return null

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) newErrors.name = 'Category name is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      await addCategory({
        name: name.trim(),
        description: description.trim() || undefined,
        color: selectedColor,
        isActive
      })

      // Reset form
      setName('')
      setDescription('')
      setSelectedColor(colorOptions[0])
      setIsActive(true)
      setErrors({})
      onClose()
    } catch (error) {
      // Error is already handled in the store
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    if (field === 'name') setName(value as string)
    if (field === 'description') setDescription(value as string)
    if (field === 'isActive') setIsActive(value as boolean)

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md m-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">Add New Category</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Category Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Category Name *</label>
            <Input
              type="text"
              value={name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter category name"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <Input
              type="text"
              value={description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter category description (optional)"
            />
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Color</label>
            <div className="grid grid-cols-5 gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-10 h-10 rounded-full border-2 transition-all ${
                    selectedColor === color
                      ? 'border-gray-800 scale-110'
                      : 'border-gray-300 hover:border-gray-500'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                  title={color}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Selected color: <span style={{ color: selectedColor }}>{selectedColor}</span>
            </p>
          </div>

          {/* Active Status */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => handleInputChange('isActive', e.target.checked)}
              className="rounded"
            />
            <label htmlFor="isActive" className="text-sm font-medium">
              Active (available for products)
            </label>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Category'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
