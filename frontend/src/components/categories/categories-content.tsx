'use client'

import { useState } from 'react'
import { Plus, Edit, Trash2, Folder, FolderOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AddCategoryModal } from '@/components/categories/add-category-modal'
import toast from 'react-hot-toast'

interface Category {
  id: string
  name: string
  description?: string
  color: string
  isActive: boolean
  productCount: number
}

// Mock data - in real app this would come from API
const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Coffee',
    description: 'Hot and cold coffee drinks',
    color: '#8B4513',
    isActive: true,
    productCount: 8,
  },
  {
    id: '2',
    name: 'Tea',
    description: 'Various tea selections',
    color: '#228B22',
    isActive: true,
    productCount: 5,
  },
  {
    id: '3',
    name: 'Pastries',
    description: 'Fresh baked goods',
    color: '#DAA520',
    isActive: true,
    productCount: 6,
  },
  {
    id: '4',
    name: 'Sandwiches',
    description: 'Fresh sandwiches and wraps',
    color: '#CD853F',
    isActive: true,
    productCount: 4,
  },
]

export default function CategoriesContent() {
  const [categories, setCategories] = useState<Category[]>(mockCategories)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const handleAddCategory = (newCategoryData: Omit<Category, 'id' | 'productCount'>) => {
    const newCategory: Category = {
      ...newCategoryData,
      id: Date.now().toString(),
      productCount: 0,
    }
    setCategories(prev => [...prev, newCategory])
  }

  const handleToggleActive = (categoryId: string) => {
    setCategories(prev =>
      prev.map(category =>
        category.id === categoryId
          ? { ...category, isActive: !category.isActive }
          : category
      )
    )
    toast.success('Category status updated!')
  }

  const handleDeleteCategory = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    if (category && category.productCount > 0) {
      toast.error('Cannot delete category with existing products!')
      return
    }

    if (confirm('Are you sure you want to delete this category?')) {
      setCategories(prev => prev.filter(category => category.id !== categoryId))
      toast.success('Category deleted successfully!')
    }
  }

  const totalCategories = categories.length
  const activeCategories = categories.filter(c => c.isActive).length
  const totalProducts = categories.reduce((sum, c) => sum + c.productCount, 0)

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-500">Manage your product categories</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Folder className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Categories</p>
                <p className="text-2xl font-bold text-gray-900">{totalCategories}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <FolderOpen className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Active Categories</p>
                <p className="text-2xl font-bold text-green-600">{activeCategories}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-bold text-sm">P</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Products</p>
                <p className="text-2xl font-bold text-purple-600">{totalProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Card key={category.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-6 h-6 rounded-full flex-shrink-0"
                    style={{ backgroundColor: category.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{category.name}</CardTitle>
                    {category.description && (
                      <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex space-x-1 ml-2">
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteCategory(category.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  category.isActive 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {category.isActive ? 'Active' : 'Inactive'}
                </span>
                <span className="text-sm text-gray-500">
                  {category.productCount} products
                </span>
              </div>

              {/* Actions */}
              <div className="flex space-x-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleToggleActive(category.id)}
                >
                  {category.isActive ? 'Deactivate' : 'Activate'}
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  View Products
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Category Modal */}
      <AddCategoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddCategory}
      />
    </div>
  )
}
