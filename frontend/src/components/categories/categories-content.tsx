'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Folder, FolderOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AddCategoryModal } from '@/components/categories/add-category-modal'
import { useCategoryStore } from '@/hooks/use-category-store'
import type { Category } from '@/lib/services'

export default function CategoriesContent() {
  const {
    categories,
    loading,
    error,
    fetchCategories,
    deleteCategory,
    toggleActive
  } = useCategoryStore()

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const handleToggleActive = async (categoryId: string) => {
    await toggleActive(categoryId)
  }

  const handleDeleteCategory = async (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    if (category && category.productCount && category.productCount > 0) {
      alert('نمی‌توان دسته‌بندی دارای محصول را حذف کرد!')
      return
    }

    if (confirm('آیا از حذف این دسته‌بندی اطمینان دارید؟')) {
      await deleteCategory(categoryId)
    }
  }

  const totalCategories = categories.length
  const activeCategories = categories.filter(c => c.isActive).length
  const totalProducts = categories.reduce((sum, c) => sum + (c.productCount || 0), 0)

  if (loading && categories.length === 0) {
    return (
      <div className="p-6 space-y-6 h-full overflow-y-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-500">در حال بارگذاری دسته‌بندی‌ها...</div>
        </div>
      </div>
    )
  }

  if (error && categories.length === 0) {
    return (
      <div className="p-6 space-y-6 h-full overflow-y-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-500">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">دسته‌بندی‌ها</h1>
          <p className="text-gray-500">مدیریت دسته‌بندی محصولات و سازماندهی</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center space-x-2">
                        <Plus className="h-4 w-4 ml-2" />
              افزودن دسته‌بندی
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">کل دسته‌بندی‌ها</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCategories}</div>
            <p className="text-xs text-muted-foreground">
              دسته‌بندی ایجاد شده
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">دسته‌بندی‌های فعال</CardTitle>
            <FolderOpen className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeCategories}</div>
            <p className="text-xs text-muted-foreground">
              در حال حاضر فعال
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">کل محصولات</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              در همه دسته‌بندی‌ها
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category: Category) => (
          <Card key={category.id} className={`${!category.isActive ? 'opacity-60' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: category.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{category.name}</CardTitle>
                    {category.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {category.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-1 ml-2">
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCategory(category.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">تعداد محصولات</span>
                <span className="font-medium">{category.productCount || 0} محصول</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">وضعیت</span>
                <div className="flex items-center space-x-2">
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
                    className="h-6 px-2 text-xs"
                  >
                    {category.isActive ? 'غیرفعال کردن' : 'فعال کردن'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {categories.length === 0 && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Folder className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">دسته‌بندی‌ای یافت نشد</h3>
            <p className="text-gray-500 text-center mb-6">
              با ایجاد اولین دسته‌بندی محصول برای سازماندهی موجودی خود شروع کنید.
            </p>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              افزودن اولین دسته‌بندی
            </Button>
          </CardContent>
        </Card>
      )}

      <AddCategoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  )
}
