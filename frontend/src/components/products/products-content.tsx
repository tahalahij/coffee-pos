'use client'

import { useState } from 'react'
import { Plus, Edit, Trash2, Package, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AddProductModal } from '@/components/products/add-product-modal'
import { formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Product {
  id: string
  name: string
  description: string
  price: number
  cost: number
  stock: number
  lowStockAlert: number
  categoryId: string
  category: { name: string; color: string }
  isAvailable: boolean
}

interface Category {
  id: string
  name: string
  color: string
}

// Mock categories data
const mockCategories: Category[] = [
  { id: '1', name: 'Coffee', color: '#8B4513' },
  { id: '2', name: 'Tea', color: '#228B22' },
  { id: '3', name: 'Pastries', color: '#DAA520' },
  { id: '4', name: 'Sandwiches', color: '#CD853F' },
]

// Mock products data
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Espresso',
    description: 'Rich and bold espresso shot',
    price: 2.50,
    cost: 0.75,
    stock: 100,
    lowStockAlert: 20,
    categoryId: '1',
    category: { name: 'Coffee', color: '#8B4513' },
    isAvailable: true,
  },
  {
    id: '2',
    name: 'Cappuccino',
    description: 'Espresso with steamed milk and foam',
    price: 3.75,
    cost: 1.25,
    stock: 15,
    lowStockAlert: 20,
    categoryId: '1',
    category: { name: 'Coffee', color: '#8B4513' },
    isAvailable: true,
  },
  {
    id: '3',
    name: 'Croissant',
    description: 'Buttery and flaky croissant',
    price: 3.50,
    cost: 1.20,
    stock: 25,
    lowStockAlert: 5,
    categoryId: '3',
    category: { name: 'Pastries', color: '#DAA520' },
    isAvailable: true,
  },
]

export default function ProductsContent() {
  const [products, setProducts] = useState<Product[]>(mockProducts)
  const [categories] = useState<Category[]>(mockCategories)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const handleAddProduct = (newProductData: Omit<Product, 'id' | 'category'>) => {
    const category = categories.find(c => c.id === newProductData.categoryId)
    if (!category) {
      toast.error('Invalid category selected!')
      return
    }

    const newProduct: Product = {
      ...newProductData,
      id: Date.now().toString(),
      category: { name: category.name, color: category.color },
    }

    setProducts(prev => [...prev, newProduct])
  }

  const handleToggleAvailability = (productId: string) => {
    setProducts(prev =>
      prev.map(product =>
        product.id === productId
          ? { ...product, isAvailable: !product.isAvailable }
          : product
      )
    )
    toast.success('Product availability updated!')
  }

  const handleDeleteProduct = (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setProducts(prev => prev.filter(product => product.id !== productId))
      toast.success('Product deleted successfully!')
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

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto">
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
      </div>

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddProduct}
        categories={categories}
      />
    </div>
  )
}
