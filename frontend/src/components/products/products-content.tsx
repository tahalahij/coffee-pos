'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Package, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AddProductModal } from '@/components/products/add-product-modal'
import { formatCurrency } from '@/lib/utils'
import { useProductStore } from '@/hooks/use-product-store'
import { useCategoryStore } from '@/hooks/use-category-store'
import type { Product } from '@/lib/services'

export default function ProductsContent() {
  const {
    products,
    loading,
    error,
    fetchProducts,
    deleteProduct,
    toggleAvailability,
    getLowStockProducts
  } = useProductStore()

  const {
    categories,
    fetchCategories
  } = useCategoryStore()

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [fetchProducts, fetchCategories])

  const handleDeleteProduct = async (productId: string) => {
    if (confirm('آیا از حذف این محصول اطمینان دارید؟')) {
      await deleteProduct(productId)
    }
  }

  const handleToggleAvailability = async (productId: string) => {
    await toggleAvailability(productId)
  }

  const lowStockProducts = getLowStockProducts()
  const totalProducts = products.length
  const availableProducts = products.filter(p => p.isAvailable).length
  const totalValue = products.reduce((sum, p) => sum + (p.stock * p.cost), 0)

  if (loading && products.length === 0) {
    return (
      <div className="p-6 space-y-6 h-full overflow-y-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-500">در حال بارگذاری محصولات...</div>
        </div>
      </div>
    )
  }

  if (error && products.length === 0) {
    return (
      <div className="p-6 space-y-6 h-full overflow-y-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-500">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto bg-gradient-to-br from-slate-50 via-amber-50 to-orange-50">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">محصولات</h1>
          <p className="text-gray-500 mt-1">مدیریت موجودی و قیمت‌گذاری محصولات</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/25">
          <Plus className="h-4 w-4" />
          <span>افزودن محصول</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-100">کل محصولات</CardTitle>
            <Package className="h-5 w-5 text-amber-200" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl md:text-3xl font-bold">{totalProducts}</div>
            <p className="text-xs text-amber-200 mt-1">
              {availableProducts} موجود
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-red-500 to-rose-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-100">هشدار موجودی کم</CardTitle>
            <AlertTriangle className="h-5 w-5 text-red-200" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl md:text-3xl font-bold">{lowStockProducts.length}</div>
            <p className="text-xs text-red-200 mt-1">
              نیاز به تامین مجدد
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-100">کل ارزش موجودی</CardTitle>
            <Package className="h-5 w-5 text-emerald-200" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl md:text-2xl font-bold" title={formatCurrency(totalValue)}>
              {formatCurrency(totalValue)}
            </div>
            <p className="text-xs text-emerald-200 mt-1">
              به قیمت تمام‌شده
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">دسته‌بندی‌ها</CardTitle>
            <Package className="h-5 w-5 text-purple-200" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl md:text-3xl font-bold">{categories.filter(c => c.isActive).length}</div>
            <p className="text-xs text-purple-200 mt-1">
              دسته‌های فعال
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <Card className="border-0 shadow-xl bg-gradient-to-r from-red-500 to-rose-500 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              هشدار موجودی کم
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-100 text-sm mb-3">
              محصولات زیر موجودی کمی دارند:
            </p>
            <div className="flex flex-wrap gap-2">
              {lowStockProducts.map(product => (
                <span key={product.id} className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-sm">
                  {product.name} ({product.stock} عدد)
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
        {products.map((product: Product) => (
          <Card key={product.id} className={`${!product.isAvailable ? 'opacity-60' : ''} flex flex-col h-full border-0 shadow-xl bg-white/80 backdrop-blur hover:shadow-2xl hover:scale-[1.02] transition-all duration-300`}>
            <CardHeader className="pb-3 flex-shrink-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base md:text-lg truncate text-gray-800" title={product.name}>
                    {product.name}
                  </CardTitle>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2 break-words" title={product.description}>
                    {product.description}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleAvailability(product.id)}
                    className={`${product.isAvailable ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-50'} p-1 h-8 w-8 rounded-full`}
                    title={product.isAvailable ? 'موجود' : 'ناموجود'}
                  >
                    <Package className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-1 h-8 w-8 rounded-full hover:bg-blue-50 hover:text-blue-600" title="ویرایش محصول">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteProduct(product.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 h-8 w-8 rounded-full"
                    title="حذف محصول"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 flex-1 pt-0">
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-500">قیمت</span>
                <span className="font-bold text-amber-600">
                  {formatCurrency(product.price)}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-500">هزینه</span>
                <span className="text-sm font-medium text-gray-700">{formatCurrency(product.cost)}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-500">موجودی</span>
                <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${
                  product.stock <= product.lowStockAlert ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                }`}>
                  {product.stock} عدد
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-gray-500">دسته‌بندی</span>
                <span
                  className="px-3 py-1 rounded-full text-xs font-medium text-white shadow-sm"
                  style={{ backgroundColor: product.category.color }}
                  title={product.category.name}
                >
                  {product.category.name}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-gray-500">وضعیت</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  product.isAvailable 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {product.isAvailable ? 'موجود' : 'ناموجود'}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {products.length === 0 && !loading && (
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mb-6">
              <Package className="h-10 w-10 text-amber-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">محصولی یافت نشد</h3>
            <p className="text-gray-500 text-center mb-6">
              با افزودن اولین محصول خود به موجودی شروع کنید.
            </p>
            <Button onClick={() => setIsAddModalOpen(true)} className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg">
              <Plus className="h-4 w-4 ml-2" />
              افزودن اولین محصول
            </Button>
          </CardContent>
        </Card>
      )}

      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        categories={categories}
      />
    </div>
  )
}
