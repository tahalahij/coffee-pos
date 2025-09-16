'use client'

import { useState } from 'react'
import { Search, Filter, Receipt, RefreshCw, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'

// Mock data - in real app this would come from API
const mockSales = [
  {
    id: '1',
    receiptNumber: 'RCP-20250916-0001',
    totalAmount: 15.75,
    paymentMethod: 'CASH',
    status: 'COMPLETED',
    items: [
      { product: { name: 'Cappuccino' }, quantity: 2, unitPrice: 3.75 },
      { product: { name: 'Croissant' }, quantity: 2, unitPrice: 3.50 },
      { product: { name: 'Green Tea' }, quantity: 1, unitPrice: 2.25 },
    ],
    createdAt: new Date('2025-09-16T10:30:00'),
  },
  {
    id: '2',
    receiptNumber: 'RCP-20250916-0002',
    totalAmount: 8.50,
    paymentMethod: 'CARD',
    status: 'COMPLETED',
    items: [
      { product: { name: 'Latte' }, quantity: 1, unitPrice: 4.25 },
      { product: { name: 'Blueberry Muffin' }, quantity: 1, unitPrice: 2.75 },
    ],
    createdAt: new Date('2025-09-16T11:15:00'),
  },
  {
    id: '3',
    receiptNumber: 'RCP-20250916-0003',
    totalAmount: 22.25,
    paymentMethod: 'DIGITAL',
    status: 'COMPLETED',
    items: [
      { product: { name: 'Turkey Club' }, quantity: 1, unitPrice: 8.50 },
      { product: { name: 'Americano' }, quantity: 2, unitPrice: 3.00 },
      { product: { name: 'Espresso' }, quantity: 3, unitPrice: 2.50 },
    ],
    createdAt: new Date('2025-09-16T12:45:00'),
  },
  {
    id: '4',
    receiptNumber: 'RCP-20250916-0004',
    totalAmount: 12.50,
    paymentMethod: 'CASH',
    status: 'REFUNDED',
    items: [
      { product: { name: 'Veggie Wrap' }, quantity: 1, unitPrice: 7.25 },
      { product: { name: 'Earl Grey' }, quantity: 2, unitPrice: 2.50 },
    ],
    createdAt: new Date('2025-09-16T14:20:00'),
  },
]

export default function SalesPage() {
  const [sales, setSales] = useState(mockSales)
  const [selectedSale, setSelectedSale] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const filteredSales = sales.filter(sale => {
    const matchesSearch = sale.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || sale.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0)
  const completedSales = filteredSales.filter(s => s.status === 'COMPLETED')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'text-green-600 bg-green-50'
      case 'REFUNDED': return 'text-red-600 bg-red-50'
      case 'CANCELLED': return 'text-gray-600 bg-gray-50'
      default: return 'text-blue-600 bg-blue-50'
    }
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'CASH': return '💵'
      case 'CARD': return '💳'
      case 'DIGITAL': return '📱'
      default: return '💰'
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales History</h1>
          <p className="text-gray-500">View and manage all transactions</p>
        </div>
        <Button variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{filteredSales.length}</p>
              <p className="text-sm text-gray-500">Total Transactions</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{completedSales.length}</p>
              <p className="text-sm text-gray-500">Completed Sales</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(totalSales)}</p>
              <p className="text-sm text-gray-500">Total Revenue</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {completedSales.length > 0 ? formatCurrency(totalSales / completedSales.length) : '$0.00'}
              </p>
              <p className="text-sm text-gray-500">Average Order</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search by receipt number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All Status</option>
          <option value="COMPLETED">Completed</option>
          <option value="REFUNDED">Refunded</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Sales List */}
      <div className="grid gap-4">
        {filteredSales.map((sale) => (
          <Card key={sale.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="font-semibold text-lg">{sale.receiptNumber}</h3>
                      <p className="text-sm text-gray-500">
                        {formatDate(sale.createdAt)}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{getPaymentMethodIcon(sale.paymentMethod)}</span>
                      <span className="text-sm font-medium">{sale.paymentMethod}</span>
                    </div>

                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(sale.status)}`}>
                      {sale.status}
                    </span>
                  </div>

                  <div className="mt-3">
                    <p className="text-sm text-gray-600">
                      {sale.items.length} items: {sale.items.map(item =>
                        `${item.quantity}x ${item.product.name}`
                      ).join(', ')}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(sale.totalAmount)}
                  </p>
                  <div className="flex space-x-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedSale(sale)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <Receipt className="h-4 w-4 mr-1" />
                      Print
                    </Button>
                    {sale.status === 'COMPLETED' && (
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        Refund
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sale Detail Modal */}
      {selectedSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Sale Details</h2>
              <Button variant="ghost" onClick={() => setSelectedSale(null)}>
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Receipt Number</p>
                  <p className="font-medium">{selectedSale.receiptNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date & Time</p>
                  <p className="font-medium">{formatDate(selectedSale.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="font-medium">{selectedSale.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedSale.status)}`}>
                    {selectedSale.status}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Items</h3>
                <div className="space-y-2">
                  {selectedSale.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b">
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-gray-500">
                          {item.quantity} × {formatCurrency(item.unitPrice)}
                        </p>
                      </div>
                      <p className="font-medium">
                        {formatCurrency(item.quantity * item.unitPrice)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total:</span>
                    <span>{formatCurrency(selectedSale.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
