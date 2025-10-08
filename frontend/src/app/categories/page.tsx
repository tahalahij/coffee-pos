'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Folder, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { useCategoryStore } from '@/hooks/use-category-store'
import { useProductStore } from '@/hooks/use-product-store'
import toast from 'react-hot-toast'

export default function CategoriesPage() {
  const {
    categories,
    loading: categoriesLoading,
    fetchCategories,
    toggleActive,
    deleteCategory
  } = useCategoryStore()

  const {
    products,
    loading: productsLoading,
    fetchProducts
  } = useProductStore()

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  useEffect(() => {
    fetchCategories()
    fetchProducts()
  }, [fetchCategories, fetchProducts])

  const handleToggleActive = async (categoryId: string) => {
    try {
      await toggleActive(categoryId)
      toast.success('وضعیت دسته‌بندی به‌روزرسانی شد!')
    } catch (error) {
      toast.error('به‌روزرسانی وضعیت دسته‌بندی با خطا مواجه شد')
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    const categoryProducts = products.filter(p => p.categoryId === categoryId)

    if (categoryProducts.length > 0) {
      toast.error(`امکان حذف دسته‌بندی وجود ندارد. این دسته‌بندی ${categoryProducts.length} محصول دارد.`)
      return
    }

    if (confirm('آیا از حذف این دسته‌بندی اطمینان دارید؟')) {
      try {
        await deleteCategory(categoryId)
        toast.success('دسته‌بندی با موفقیت حذف شد!')
      } catch (error) {
        toast.error('حذف دسته‌بندی با خطا مواجه شد')
      }
    }
  }

  const getCategoryStats = (categoryId: string) => {
    const categoryProducts = products.filter(p => p.categoryId === categoryId)
    const activeProducts = categoryProducts.filter(p => p.isAvailable)
    const totalValue = categoryProducts.reduce((sum, p) => sum + (p.cost * p.stock), 0)

    return {
      totalProducts: categoryProducts.length,
      activeProducts: activeProducts.length,
      totalValue
    }
  }

  const totalCategories = categories.length
  const activeCategories = categories.filter(c => c.isActive).length
  const totalProducts = products.length
  const totalInventoryValue = products.reduce((sum, p) => sum + (p.cost * p.stock), 0)

  if (categoriesLoading || productsLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">در حال بارگذاری دسته‌بندی‌ها...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">دسته‌بندی‌ها</h1>
          <p className="text-gray-500">محصولات خود را در دسته‌بندی‌ها سازماندهی کنید</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          افزودن دسته‌بندی
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Folder className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">کل دسته‌بندی‌ها</p>
                <p className="text-2xl font-bold text-gray-900">{totalCategories}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">دسته‌بندی‌های فعال</p>
                <p className="text-2xl font-bold text-green-600">{activeCategories}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-bold">#</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">کل محصولات</p>
                <p className="text-2xl font-bold text-purple-600">{totalProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold">$</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">ارزش موجودی</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalInventoryValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => {
          const stats = getCategoryStats(category.id)

          return (
            <Card key={category.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                    </div>
                    <p className="text-sm text-gray-500">{category.description}</p>
                  </div>
                  <div className="flex space-x-1">
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
                {/* Category Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{stats.totalProducts}</p>
                    <p className="text-xs text-gray-500">کل محصولات</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{stats.activeProducts}</p>
                    <p className="text-xs text-gray-500">محصولات فعال</p>
                  </div>
                </div>

                {/* Inventory Value */}
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(stats.totalValue)}
                  </p>
                  <p className="text-xs text-gray-500">ارزش موجودی</p>
                </div>

                {/* Status and Actions */}
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    category.isActive 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {category.isActive ? 'فعال' : 'غیرفعال'}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(category.id)}
                  >
                    {category.isActive ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-1" />
                        غیرفعال کردن
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-1" />
                        فعال کردن
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {/* Add Category Card */}
        <Card
          className="border-2 border-dashed border-gray-300 hover:border-gray-400 cursor-pointer transition-colors"
          onClick={() => setIsAddModalOpen(true)}
        >
          <CardContent className="flex flex-col items-center justify-center p-6 h-full min-h-[300px]">
            <Plus className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">افزودن دسته‌بندی جدید</h3>
            <p className="text-sm text-gray-500 text-center">
              دسته‌بندی جدیدی برای سازماندهی محصولاتتان ایجاد کنید
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Add Category Modal - TODO: Create this component */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">افزودن دسته‌بندی جدید</h2>
              <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>
                ✕
              </Button>
            </div>
            <p className="text-gray-500 text-center py-8">
              مودال ایجاد دسته‌بندی به زودی...
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
