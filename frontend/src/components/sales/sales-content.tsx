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
      case 'COMPLETED': return 'text-green-600 bg-green-50 border border-green-200'
      case 'REFUNDED': return 'text-red-600 bg-red-50 border border-red-200'
      case 'CANCELLED': return 'text-gray-600 bg-gray-50 border border-gray-200'
      default: return 'text-blue-600 bg-blue-50 border border-blue-200'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'تکمیل شده'
      case 'REFUNDED': return 'مرجوع شده'
      case 'CANCELLED': return 'لغو شده'
      default: return status
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

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'CASH': return 'نقدی'
      case 'CARD': return 'کارت'
      case 'DIGITAL': return 'دیجیتال'
      default: return method
    }
  }

  const handleRefund = (saleId: string) => {
    if (confirm('آیا مطمئن هستید که می‌خواهید این فروش را مرجوع کنید؟')) {
      updateSaleStatus(saleId, 'REFUNDED')
      toast.success('فروش با موفقیت مرجوع شد!')
    }
  }

  const handleRefresh = async () => {
    await fetchSales()
    toast.success('اطلاعات فروش بروزرسانی شد!')
  }

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">تاریخچه فروش</h1>
          <p className="text-gray-500 mt-1">مشاهده و مدیریت تمام تراکنش‌ها ({sales.length} مورد)</p>
        </div>
        <Button onClick={fetchSales} disabled={loading} className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-lg shadow-blue-500/25">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'در حال بارگذاری...' : 'بروزرسانی'}</span>
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 shadow-lg">
          <CardContent className="p-4">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl shadow-blue-500/20 border-0">
          <CardContent className="p-5">
            <div className="text-center">
              <p className="text-3xl font-bold">{filteredSales.length}</p>
              <p className="text-sm text-blue-100 mt-1">کل تراکنش‌ها</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-xl shadow-green-500/20 border-0">
          <CardContent className="p-5">
            <div className="text-center">
              <p className="text-3xl font-bold">{completedSales.length}</p>
              <p className="text-sm text-green-100 mt-1">فروش‌های موفق</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-xl shadow-purple-500/20 border-0">
          <CardContent className="p-5">
            <div className="text-center">
              <p className="text-3xl font-bold">{formatCurrency(totalSales)}</p>
              <p className="text-sm text-purple-100 mt-1">کل درآمد</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-xl shadow-orange-500/20 border-0">
          <CardContent className="p-5">
            <div className="text-center">
              <p className="text-3xl font-bold">
                {completedSales.length > 0 ? formatCurrency(totalSales / completedSales.length) : '۰ تومان'}
              </p>
              <p className="text-sm text-orange-100 mt-1">میانگین سفارش</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="جستجو بر اساس شماره رسید..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
        >
          <option value="ALL">همه وضعیت‌ها</option>
          <option value="COMPLETED">تکمیل شده</option>
          <option value="REFUNDED">مرجوع شده</option>
          <option value="CANCELLED">لغو شده</option>
        </select>
      </div>

      {/* Sales List */}
      <div className="grid gap-4">
        {filteredSales.length === 0 ? (
          <Card className="shadow-lg">
            <CardContent className="p-12 text-center">
              <Receipt className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">هیچ فروشی با این معیارها یافت نشد</p>
            </CardContent>
          </Card>
        ) : (
          filteredSales.map((sale) => (
            <Card key={sale.id} className="hover:shadow-xl transition-all duration-300 border-0 shadow-md bg-white/80 backdrop-blur">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 flex-wrap">
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">{sale.receiptNumber}</h3>
                        <p className="text-sm text-gray-500">
                          {formatDate(sale.createdAt)}
                        </p>
                        {sale.customer && (
                          <p className="text-sm text-blue-600 font-medium mt-1">
                            مشتری: {sale.customer.name} ({sale.customer.phone})
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                        <span className="text-2xl">{getPaymentMethodIcon(sale.paymentMethod)}</span>
                        <span className="text-sm font-medium text-gray-700">{getPaymentMethodLabel(sale.paymentMethod)}</span>
                      </div>

                      <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${getStatusColor(sale.status)}`}>
                        {getStatusLabel(sale.status)}
                      </span>
                    </div>

                    <div className="mt-3">
                      <p className="text-sm text-gray-600">
                        {sale.items.length} مورد: {sale.items.map(item =>
                          `${item.quantity}× ${item.product.name}`
                        ).join('، ')}
                      </p>
                    </div>
                  </div>

                  <div className="text-left">
                    <p className="text-2xl font-bold text-emerald-600">
                      {formatCurrency(sale.totalAmount)}
                    </p>
                    <div className="flex gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedSale(sale)}
                        className="hover:bg-blue-50"
                      >
                        <Eye className="h-4 w-4 ml-1" />
                        مشاهده
                      </Button>
                      <Button variant="outline" size="sm" className="hover:bg-gray-50">
                        <Receipt className="h-4 w-4 ml-1" />
                        چاپ
                      </Button>
                      {sale.status === 'COMPLETED' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleRefund(sale.id)}
                        >
                          مرجوع
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">جزئیات فروش</h2>
              <Button variant="ghost" onClick={() => setSelectedSale(null)} className="hover:bg-gray-100 rounded-full h-10 w-10 p-0">
                ✕
              </Button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">شماره رسید</p>
                  <p className="font-bold text-gray-800">{selectedSale.receiptNumber}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">تاریخ و ساعت</p>
                  <p className="font-bold text-gray-800">{formatDate(selectedSale.createdAt)}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">روش پرداخت</p>
                  <p className="font-bold text-gray-800">{getPaymentMethodLabel(selectedSale.paymentMethod)}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">وضعیت</p>
                  <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${getStatusColor(selectedSale.status)}`}>
                    {getStatusLabel(selectedSale.status)}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-800 mb-3">اقلام</h3>
                <div className="space-y-2 bg-gray-50 rounded-xl p-4">
                  {selectedSale.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0">
                      <div>
                        <p className="font-medium text-gray-800">{item.product.name}</p>
                        <p className="text-sm text-gray-500">
                          {item.quantity} × {formatCurrency(item.unitPrice)}
                        </p>
                      </div>
                      <p className="font-bold text-gray-800">
                        {formatCurrency(item.totalAmount)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t-2 border-dashed space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">جمع جزء:</span>
                    <span className="font-medium">{formatCurrency(selectedSale.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">مالیات:</span>
                    <span className="font-medium">{formatCurrency(selectedSale.taxAmount)}</span>
                  </div>
                  {selectedSale.discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-red-600">
                      <span>تخفیف:</span>
                      <span>-{formatCurrency(selectedSale.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-xl font-bold border-t-2 pt-3 mt-3">
                    <span className="text-gray-800">مجموع:</span>
                    <span className="text-emerald-600">{formatCurrency(selectedSale.totalAmount)}</span>
                  </div>
                  {selectedSale.cashReceived && (
                    <>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>وجه دریافتی:</span>
                        <span>{formatCurrency(selectedSale.cashReceived)}</span>
                      </div>
                      {selectedSale.changeGiven && selectedSale.changeGiven > 0 && (
                        <div className="flex justify-between text-sm text-emerald-600">
                          <span>باقی‌مانده:</span>
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
