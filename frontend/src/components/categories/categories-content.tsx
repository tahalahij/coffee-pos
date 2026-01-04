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

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto bg-gradient-to-br from-slate-50 to-violet-50">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">دسته‌بندی‌ها</h1>
          <p className="text-gray-500">مدیریت دسته‌بندی محصولات و سازماندهی</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 shadow-lg">
                        <Plus className="h-4 w-4 ml-2" />
              افزودن دسته‌بندی
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-xl bg-gradient-to-br from-violet-500 to-purple-500 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-violet-100">کل دسته‌بندی‌ها</CardTitle>
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Folder className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalCategories}</div>
            <p className="text-xs text-violet-100">
              دسته‌بندی ایجاد شده
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-500 to-green-500 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-100">دسته‌بندی‌های فعال</CardTitle>
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <FolderOpen className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeCategories}</div>
            <p className="text-xs text-emerald-100">
              در حال حاضر فعال
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-100">کل محصولات</CardTitle>
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Folder className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalProducts}</div>
            <p className="text-xs text-amber-100">
              در همه دسته‌بندی‌ها
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category: Category) => (
          <Card key={category.id} className={`${!category.isActive ? 'opacity-60' : ''} border-0 shadow-xl bg-white/80 backdrop-blur hover:shadow-2xl hover:scale-[1.02] transition-all duration-300`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className="w-12 h-12 rounded-xl flex-shrink-0 shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${category.color}, ${category.color}dd)` }}
                  />
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate text-gray-800">{category.name}</CardTitle>
                    {category.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {category.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 mr-2">
                  <Button variant="ghost" size="sm" className="p-1 h-8 w-8 rounded-full hover:bg-blue-50 hover:text-blue-600">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCategory(category.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 h-8 w-8 rounded-full"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-500">تعداد محصولات</span>
                <span className="font-bold text-violet-600">{category.productCount || 0} محصول</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">وضعیت</span>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    category.isActive 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {category.isActive ? 'فعال' : 'غیرفعال'}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(category.id)}
                    className="h-7 px-3 text-xs rounded-full border-violet-200 hover:bg-violet-50 hover:text-violet-600"
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
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full flex items-center justify-center mb-6">
              <Folder className="h-10 w-10 text-violet-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">دسته‌بندی‌ای یافت نشد</h3>
            <p className="text-gray-500 text-center mb-6">
              با ایجاد اولین دسته‌بندی محصول برای سازماندهی موجودی خود شروع کنید.
            </p>
            <Button onClick={() => setIsAddModalOpen(true)} className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 shadow-lg">
              <Plus className="h-4 w-4 ml-2" />
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
