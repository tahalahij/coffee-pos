'use client'

import { useState } from 'react'
import { Plus, Edit, Trash2, Package, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

// Mock data - in real app this would come from API
const mockProducts = [
  {
    id: '1',
    name: 'Espresso',
    description: 'Rich and bold espresso shot',
    price: 2.50,
    cost: 0.75,
    stock: 100,
    lowStockAlert: 20,
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
    category: { name: 'Pastries', color: '#DAA520' },
    isAvailable: true,
  },
]

export default function ProductsPage() {
  const [products, setProducts] = useState(mockProducts)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const getStockStatus = (stock: number, lowStockAlert: number) => {
    if (stock === 0) return { status: 'out', color: 'text-red-600', bg: 'bg-red-50' }
    if (stock <= lowStockAlert) return { status: 'low', color: 'text-orange-600', bg: 'bg-orange-50' }
    return { status: 'good', color: 'text-green-600', bg: 'bg-green-50' }
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
                <p className="text-2xl font-bold text-gray-900">{products.length}</p>
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
                <p className="text-2xl font-bold text-orange-600">
                  {products.filter(p => p.stock <= p.lowStockAlert && p.stock > 0).length}
                </p>
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
                <p className="text-2xl font-bold text-red-600">
                  {products.filter(p => p.stock === 0).length}
                </p>
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
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(products.reduce((sum, p) => sum + (p.cost * p.stock), 0))}
                </p>
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
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
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
                  >
                    {product.isAvailable ? 'Disable' : 'Enable'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Add Product Modal would go here */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Product</h2>
            <p className="text-gray-500 mb-4">Product creation form would go here</p>
            <div className="flex space-x-3">
              <Button onClick={() => setIsAddModalOpen(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button className="flex-1">
                Add Product
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
