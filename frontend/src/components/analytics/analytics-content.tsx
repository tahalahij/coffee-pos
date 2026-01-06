'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart3, TrendingUp, DollarSign, Users, Download, ShoppingBag, Award, Sparkles, Package } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { analyticsService } from '@/lib/services'
import { useToast } from '@/hooks/use-toast'

export default function AnalyticsContent() {
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [salesData, setSalesData] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchAnalyticsData()
  }, [])

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true)
      const [dashboard, sales] = await Promise.all([
        analyticsService.getDashboardStats(),
        analyticsService.getSalesAnalytics('month')
      ])
      setDashboardData(dashboard)
      setSalesData(sales)
    } catch (error) {
      console.error('Error fetching analytics:', error)
      toast({
        title: 'خطا',
        description: 'بارگذاری تحلیل‌ها با مشکل مواجه شد',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }
  const handleExportReport = () => {
    if (!dashboardData || !salesData) return

    // Create CSV data
    const csvData = [
      ['متریک', 'مقدار'],
      ['فروش امروز', dashboardData.todaySales?.toString() || '0'],
      ['سفارشات امروز', dashboardData.todayOrders?.toString() || '0'],
      ['فروش ماهانه', dashboardData.monthSales?.toString() || '0'],
      ['سفارشات ماهانه', dashboardData.monthOrders?.toString() || '0'],
      ['تعداد محصولات', dashboardData.totalProducts?.toString() || '0'],
      ['محصولات کم موجودی', dashboardData.lowStockProducts?.toString() || '0'],
    ]

    // Convert to CSV string
    const csvContent = csvData.map(row => row.join(',')).join('\n')

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `گزارش-تحلیلی-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 h-full overflow-y-auto bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">در حال بارگذاری تحلیل‌ها...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="p-6 space-y-6 h-full overflow-y-auto bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-600">داده‌ای برای نمایش وجود ندارد</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-purple-500" />
            تحلیل و گزارشات
          </h1>
          <p className="text-gray-500 mt-1">بینش‌های کسب‌وکار و معیارهای عملکرد</p>
        </div>
        <Button variant="outline" onClick={handleExportReport} className="flex items-center gap-2 border-purple-200 hover:bg-purple-50 hover:border-purple-300">
          <Download className="h-4 w-4" />
          دانلود گزارش
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-xl shadow-purple-500/20 border-0 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-full bg-white/5 backdrop-blur-sm"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-purple-100">فروش امروز</CardTitle>
            <DollarSign className="h-5 w-5 text-purple-200" />
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold">{formatCurrency(dashboardData.todaySales || 0)}</div>
            <p className="text-xs text-purple-200 mt-1">
              {dashboardData.todayOrders || 0} سفارش
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-xl shadow-blue-500/20 border-0 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-full bg-white/5 backdrop-blur-sm"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-blue-100">فروش ماهانه</CardTitle>
            <ShoppingBag className="h-5 w-5 text-blue-200" />
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold">{formatCurrency(dashboardData.monthSales || 0)}</div>
            <p className="text-xs text-cyan-200 mt-1">
              {dashboardData.monthOrders || 0} سفارش
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-500/20 border-0 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-full bg-white/5 backdrop-blur-sm"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-emerald-100">محصولات</CardTitle>
            <Package className="h-5 w-5 text-emerald-200" />
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold">{dashboardData.totalProducts || 0}</div>
            <p className="text-xs text-emerald-200 mt-1">
              {dashboardData.lowStockProducts || 0} کم موجودی
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-xl shadow-rose-500/20 border-0 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-full bg-white/5 backdrop-blur-sm"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-rose-100">میانگین سفارش</CardTitle>
            <TrendingUp className="h-5 w-5 text-rose-200" />
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold">
              {dashboardData.monthSales && dashboardData.monthOrders && dashboardData.monthOrders > 0
                ? formatCurrency(dashboardData.monthSales / dashboardData.monthOrders)
                : formatCurrency(0)}
            </div>
            <p className="text-xs text-rose-200 mt-1">
              به ازای هر سفارش
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sales Section */}
      {dashboardData.recentSales && dashboardData.recentSales.length > 0 ? (
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <ShoppingBag className="h-5 w-5 text-blue-500" />
              آخرین فروش‌ها
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.recentSales.slice(0, 10).map((sale: any, index: number) => (
                <div key={sale._id || sale.id || index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-md transition-all">
                  <div>
                    <p className="font-bold text-gray-800">{sale.receiptNumber}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(sale.createdAt).toLocaleDateString('fa-IR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-emerald-600">{formatCurrency(sale.totalAmount)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur">
          <CardContent className="p-12">
            <div className="text-center text-gray-500">
              <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-semibold">هنوز فروشی ثبت نشده است</p>
              <p className="text-sm mt-2">پس از ثبت فروش‌ها، تحلیل‌های دقیق‌تری در اینجا نمایش داده می‌شود</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
