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
    if (confirm('Are you sure you want to delete this product?')) {
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
          <div className="text-lg text-gray-500">Loading products...</div>
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
    <div className="p-6 space-y-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500">Manage your product inventory and pricing</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Product</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium truncate pr-2">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl md:text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground truncate">
              {availableProducts} available
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium truncate pr-2">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl md:text-2xl font-bold text-red-600">{lowStockProducts.length}</div>
            <p className="text-xs text-red-500 truncate">
              Items need restocking
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium truncate pr-2">Total Inventory Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl md:text-2xl font-bold truncate" title={formatCurrency(totalValue)}>
              {formatCurrency(totalValue)}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              At cost price
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium truncate pr-2">Categories</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl md:text-2xl font-bold">{categories.filter(c => c.isActive).length}</div>
            <p className="text-xs text-muted-foreground truncate">
              Active categories
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Low Stock Alert</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 text-sm mb-2">
              The following products are running low on stock:
            </p>
            <div className="space-y-1">
              {lowStockProducts.map(product => (
                <div key={product.id} className="text-sm text-red-600">
                  <span className="font-medium">{product.name}</span> -
                  <span className="ml-1">{product.stock} left (Alert at {product.lowStockAlert})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
        {products.map((product: Product) => (
          <Card key={product.id} className={`${!product.isAvailable ? 'opacity-60' : ''} flex flex-col h-full`}>
            <CardHeader className="pb-3 flex-shrink-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base md:text-lg truncate" title={product.name}>
                    {product.name}
                  </CardTitle>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2 break-words" title={product.description}>
                    {product.description}
                  </p>
                </div>
                <div className="flex items-center space-x-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleAvailability(product.id)}
                    className={`${product.isAvailable ? 'text-green-600' : 'text-gray-400'} p-1 h-8 w-8`}
                    title={product.isAvailable ? 'Available' : 'Unavailable'}
                  >
                    <Package className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-1 h-8 w-8" title="Edit Product">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteProduct(product.id)}
                    className="text-red-600 hover:text-red-700 p-1 h-8 w-8"
                    title="Delete Product"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 flex-1 pt-0">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 truncate">Price</span>
                <span className="font-semibold text-sm md:text-base whitespace-nowrap">
                  {formatCurrency(product.price)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 truncate">Cost</span>
                <span className="text-sm whitespace-nowrap">{formatCurrency(product.cost)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 truncate">Stock</span>
                <span className={`text-sm font-medium whitespace-nowrap ${
                  product.stock <= product.lowStockAlert ? 'text-red-600' : 'text-green-600'
                }`}>
                  {product.stock} units
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-gray-500 truncate">Category</span>
                <span
                  className="px-2 py-1 rounded-full text-xs font-medium text-white truncate max-w-20 md:max-w-none"
                  style={{ backgroundColor: product.category.color }}
                  title={product.category.name}
                >
                  {product.category.name}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-gray-500 truncate">Status</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                  product.isAvailable 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {product.isAvailable ? 'Available' : 'Unavailable'}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {products.length === 0 && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500 text-center mb-6">
              Get started by adding your first product to the inventory.
            </p>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Product
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
