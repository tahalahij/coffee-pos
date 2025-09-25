'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Package, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AddProductModal } from '@/components/products/add-product-modal'
import { formatCurrency } from '@/lib/utils'
import { useProductStore } from '@/hooks/use-product-store'
import { useCategoryStore } from '@/hooks/use-category-store'
import toast from 'react-hot-toast'

export default function ProductsPage() {
  const {
    products,
    loading: productsLoading,
    fetchProducts,
    toggleAvailability,
    deleteProduct
  } = useProductStore()

  const {
    categories,
    loading: categoriesLoading,
    fetchCategories
  } = useCategoryStore()

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [fetchProducts, fetchCategories])

  const handleToggleAvailability = async (productId: string) => {
    try {
      await toggleAvailability(productId)
      toast.success('Product availability updated!')
    } catch (error) {
      toast.error('Failed to update product availability')
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(productId)
        toast.success('Product deleted successfully!')
      } catch (error) {
        toast.error('Failed to delete product')
      }
    }
  }

  const getStockStatus = (stock: number, lowStockAlert: number) => {
    if (stock === 0) return { status: 'out', color: 'text-red-600', bg: 'bg-red-50' }
    if (stock <= lowStockAlert) return { status: 'low', color: 'text-orange-600', bg: 'bg-orange-50' }
    return { status: 'good', color: 'text-green-600', bg: 'bg-green-50' }
  }

  const totalProducts = products.length
  const lowStockProducts = products.filter(p => p.stock <= p.lowStockAlert && p.stock > 0).length
  const outOfStockProducts = products.filter(p => p.stock === 0).length
  const inventoryValue = products.reduce((sum, p) => sum + (p.cost * p.stock), 0)

  if (productsLoading || categoriesLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading products and categories...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500">Manage your cafe's product inventory</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Low Stock</p>
                <p className="text-2xl font-bold text-orange-600">{lowStockProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 font-bold">0</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">{outOfStockProducts}</p>
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
                <p className="text-sm font-medium text-gray-500">Inventory Value</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(inventoryValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => {
          const stockStatus = getStockStatus(product.stock, product.lowStockAlert)

          return (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">{product.description}</p>
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Category Badge */}
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: product.category.color }}
                  />
                  <span className="text-sm text-gray-600">{product.category.name}</span>
                </div>

                {/* Price Information */}
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Selling Price</p>
                    <p className="text-xl font-bold text-green-600">
                      {formatCurrency(product.price)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Cost</p>
                    <p className="text-lg font-medium">
                      {formatCurrency(product.cost)}
                    </p>
                  </div>
                </div>

                {/* Stock Information */}
                <div className={`p-3 rounded-lg ${stockStatus.bg}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Stock Level</span>
                    <span className={`text-lg font-bold ${stockStatus.color}`}>
                      {product.stock}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500">Alert at: {product.lowStockAlert}</span>
                    {stockStatus.status === 'low' && (
                      <span className="text-xs text-orange-600 font-medium">LOW STOCK</span>
                    )}
                    {stockStatus.status === 'out' && (
                      <span className="text-xs text-red-600 font-medium">OUT OF STOCK</span>
                    )}
                  </div>
                </div>

                {/* Availability Status */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    product.isAvailable 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {product.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>

                {/* Profit Margin */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Profit Margin</span>
                  <span className="font-medium text-blue-600">
                    {(((product.price - product.cost) / product.price) * 100).toFixed(1)}%
                  </span>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Adjust Stock
                  </Button>
                  <Button
                    variant={product.isAvailable ? "outline" : "default"}
                    size="sm"
                    className="flex-1"
                    onClick={() => handleToggleAvailability(product.id)}
                  >
                    {product.isAvailable ? 'Disable' : 'Enable'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {/* Add Product Card */}
        <Card
          className="border-2 border-dashed border-gray-300 hover:border-gray-400 cursor-pointer transition-colors"
          onClick={() => setIsAddModalOpen(true)}
        >
          <CardContent className="flex flex-col items-center justify-center p-6 h-full min-h-[300px]">
            <Plus className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">Add New Product</h3>
            <p className="text-sm text-gray-500 text-center">
              Create a new product for your cafe
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={(newProductData) => {
          // Refresh products list after adding
          fetchProducts()
        }}
        categories={categories}
      />
    </div>
  )
}
