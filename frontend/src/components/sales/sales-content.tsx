'use client'

import { useState, useEffect } from 'react'
import { Search, RefreshCw, Eye, Receipt } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useSalesStore, StoreSale } from '@/hooks/use-sales-store'
import toast from 'react-hot-toast'

export default function SalesContent() {
  const { sales, loading, error, fetchSales, updateSaleStatus } = useSalesStore()
  const [selectedSale, setSelectedSale] = useState<StoreSale | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  useEffect(() => {
    fetchSales()
  }, [fetchSales])

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

  const handleRefund = (saleId: string) => {
    if (confirm('Are you sure you want to refund this sale?')) {
      updateSaleStatus(saleId, 'REFUNDED')
      toast.success('Sale refunded successfully!')
    }
  }

  const handleRefresh = async () => {
    await fetchSales()
    toast.success('Sales data refreshed!')
  }

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales History</h1>
          <p className="text-gray-500">View and manage all transactions ({sales.length} total)</p>
        </div>
                <Button onClick={fetchSales} disabled={loading} className="flex items-center space-x-2">
          <RefreshCw className={`h-4 w-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Loading...' : 'Refresh Sales'}</span>
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

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
        {filteredSales.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Receipt className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No sales found matching your criteria</p>
            </CardContent>
          </Card>
        ) : (
          filteredSales.map((sale) => (
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
                        {sale.customer && (
                          <p className="text-sm text-blue-600 font-medium">
                            Customer: {sale.customer.name} ({sale.customer.phone})
                          </p>
                        )}
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
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleRefund(sale.id)}
                        >
                          Refund
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
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
                        {formatCurrency(item.totalAmount)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(selectedSale.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax:</span>
                    <span>{formatCurrency(selectedSale.taxAmount)}</span>
                  </div>
                  {selectedSale.discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-red-600">
                      <span>Discount:</span>
                      <span>-{formatCurrency(selectedSale.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>{formatCurrency(selectedSale.totalAmount)}</span>
                  </div>
                  {selectedSale.cashReceived && (
                    <>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Cash Received:</span>
                        <span>{formatCurrency(selectedSale.cashReceived)}</span>
                      </div>
                      {selectedSale.changeGiven && selectedSale.changeGiven > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Change Given:</span>
                          <span>{formatCurrency(selectedSale.changeGiven)}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
