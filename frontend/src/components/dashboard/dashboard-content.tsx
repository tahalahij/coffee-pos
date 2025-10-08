'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Package,
  AlertTriangle,
  Users,
  Calendar,
  Clock
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { useAnalyticsStore } from '@/hooks/use-analytics-store'
import { useSalesStore } from '@/hooks/use-sales-store'

export default function DashboardContent() {
  const {
    dashboardStats,
    loading,
    error,
    fetchDashboardStats
  } = useAnalyticsStore()

  const { fetchSales } = useSalesStore()

  useEffect(() => {
    fetchDashboardStats()
    fetchSales()
  }, [fetchDashboardStats, fetchSales])

  if (loading && !dashboardStats) {
    return (
      <div className="p-6 space-y-6 h-full overflow-y-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-500">در حال بارگذاری داشبورد...</div>
        </div>
      </div>
    )
  }

  if (error && !dashboardStats) {
    return (
      <div className="p-6 space-y-6 h-full overflow-y-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-500">{error}</div>
        </div>
      </div>
    )
  }

  const stats = dashboardStats || {
    todaySales: 0,
    todayOrders: 0,
    monthSales: 0,
    monthOrders: 0,
    totalProducts: 0,
    lowStockProducts: 0,
    recentSales: []
  }

  const averageOrderValue = stats.todayOrders > 0 ? stats.todaySales / stats.todayOrders : 0

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">داشبورد</h1>
          <p className="text-gray-500">خوش آمدید! در اینجا وضعیت امروز را مشاهده کنید.</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>{new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium truncate pr-2">فروش امروز</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl md:text-2xl font-bold truncate" title={formatCurrency(stats.todaySales)}>
              {formatCurrency(stats.todaySales)}
            </div>
                        <p className="text-xs text-muted-foreground truncate">
              درآمد امروز
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium truncate pr-2">سفارشات امروز</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl md:text-2xl font-bold">{stats.todayOrders}</div>
            <p className="text-xs text-muted-foreground truncate">
              سفارشات تکمیل شده امروز
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium truncate pr-2">میانگین سفارش</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl md:text-2xl font-bold truncate" title={formatCurrency(averageOrderValue)}>
              {formatCurrency(averageOrderValue)}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              به ازای هر سفارش امروز
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium truncate pr-2">کالاهای کمبود</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl md:text-2xl font-bold text-red-600">{stats.lowStockProducts}</div>
            <p className="text-xs text-red-500 truncate">
              نیاز به تامین مجدد
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base lg:text-lg">عملکرد ماهانه</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
                        <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-500 truncate">فروش ماهانه</span>
                                      <span className="font-semibold text-sm lg:text-base whitespace-nowrap numbers-ltr" title={formatCurrency(stats.todaySales)}>
                          {formatCurrency(stats.todaySales)}
                        </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-500 truncate">سفارشات ماه</span>
              <span className="font-semibold text-sm lg:text-base whitespace-nowrap">{stats.monthOrders}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-500 truncate">میانگین سفارش</span>
              <span className="font-semibold text-sm lg:text-base whitespace-nowrap" title={formatCurrency(stats.monthOrders > 0 ? stats.monthSales / stats.monthOrders : 0)}>
                {formatCurrency(stats.monthOrders > 0 ? stats.monthSales / stats.monthOrders : 0)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-500 truncate">کل محصولات</span>
              <span className="font-semibold text-sm lg:text-base whitespace-nowrap">{stats.totalProducts}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base lg:text-lg">فروش‌های اخیر</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {stats.recentSales.length > 0 ? (
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {stats.recentSales.slice(0, 5).map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between py-2 border-b last:border-b-0 gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate" title={sale.receiptNumber}>{sale.receiptNumber}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {new Date(sale.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <span className="font-semibold text-sm whitespace-nowrap" title={formatCurrency(sale.totalAmount)}>
                      {formatCurrency(sale.totalAmount)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingBag className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">فروش اخیری وجود ندارد</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="text-base lg:text-lg">دسترسی سریع</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            <div className="flex flex-col items-center p-3 lg:p-4 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors min-h-0">
              <ShoppingBag className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600 mb-2 flex-shrink-0" />
              <span className="text-xs lg:text-sm font-medium text-blue-900 text-center leading-tight">فروش جدید</span>
            </div>
            <div className="flex flex-col items-center p-3 lg:p-4 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors min-h-0">
              <Package className="h-6 w-6 lg:h-8 lg:w-8 text-green-600 mb-2 flex-shrink-0" />
              <span className="text-xs lg:text-sm font-medium text-green-900 text-center leading-tight">افزودن محصول</span>
            </div>
            <div className="flex flex-col items-center p-3 lg:p-4 bg-purple-50 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors min-h-0">
              <Users className="h-6 w-6 lg:h-8 lg:w-8 text-purple-600 mb-2 flex-shrink-0" />
              <span className="text-xs lg:text-sm font-medium text-purple-900 text-center leading-tight">افزودن مشتری</span>
            </div>
            <div className="flex flex-col items-center p-3 lg:p-4 bg-orange-50 rounded-lg cursor-pointer hover:bg-orange-100 transition-colors min-h-0">
              <TrendingUp className="h-6 w-6 lg:h-8 lg:w-8 text-orange-600 mb-2 flex-shrink-0" />
              <span className="text-xs lg:text-sm font-medium text-orange-900 text-center leading-tight">مشاهده گزارش</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Low Stock Alert */}
      {stats.lowStockProducts > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>هشدار موجودی</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
                        <p className="text-red-700 text-sm">
              شما {stats.lowStockProducts} محصول دارید که نیاز به تامین مجدد دارند. موجودی خود را بررسی کنید تا از اتمام کالاهای محبوب جلوگیری کنید.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
