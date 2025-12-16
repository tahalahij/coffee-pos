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
  Clock,
  Sparkles
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
      <div className="p-6 space-y-6 h-full overflow-y-auto bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
              <Sparkles className="h-6 w-6 text-blue-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="mt-4 text-gray-500 font-medium">در حال بارگذاری داشبورد...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error && !dashboardStats) {
    return (
      <div className="p-6 space-y-6 h-full overflow-y-auto bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-500 bg-red-50 px-6 py-4 rounded-xl">{error}</div>
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
    <div className="p-6 space-y-6 h-full overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-blue-500" />
            داشبورد
          </h1>
          <p className="text-gray-500 mt-1">خوش آمدید! در اینجا وضعیت امروز را مشاهده کنید.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-white/80 backdrop-blur px-4 py-2 rounded-xl shadow-sm">
          <Calendar className="h-4 w-4" />
          <span>{new Date().toLocaleDateString('fa-IR')}</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">فروش امروز</CardTitle>
            <DollarSign className="h-5 w-5 text-blue-200" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl md:text-3xl font-bold" title={formatCurrency(stats.todaySales)}>
              {formatCurrency(stats.todaySales)}
            </div>
            <p className="text-xs text-blue-200 mt-1">
              درآمد امروز
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-100">سفارشات امروز</CardTitle>
            <ShoppingBag className="h-5 w-5 text-emerald-200" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl md:text-3xl font-bold">{stats.todayOrders}</div>
            <p className="text-xs text-emerald-200 mt-1">
              سفارشات تکمیل شده امروز
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-100">میانگین سفارش</CardTitle>
            <TrendingUp className="h-5 w-5 text-amber-200" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl md:text-3xl font-bold" title={formatCurrency(averageOrderValue)}>
              {formatCurrency(averageOrderValue)}
            </div>
            <p className="text-xs text-amber-200 mt-1">
              به ازای هر سفارش امروز
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-red-500 to-rose-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-100">کالاهای کمبود</CardTitle>
            <AlertTriangle className="h-5 w-5 text-red-200" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl md:text-3xl font-bold">{stats.lowStockProducts}</div>
            <p className="text-xs text-red-200 mt-1">
              نیاز به تامین مجدد
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <Card className="overflow-hidden border-0 shadow-xl bg-white/80 backdrop-blur">
          <CardHeader className="bg-gradient-to-r from-violet-500 to-purple-500 text-white">
            <CardTitle className="text-base lg:text-lg">عملکرد ماهانه</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-center justify-between gap-4 p-3 bg-gray-50 rounded-xl">
              <span className="text-sm text-gray-600">فروش ماهانه</span>
              <span className="font-bold text-lg bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">{formatCurrency(stats.monthSales)}</span>
            </div>
            <div className="flex items-center justify-between gap-4 p-3 bg-gray-50 rounded-xl">
              <span className="text-sm text-gray-600">سفارشات ماه</span>
              <span className="font-bold text-lg text-gray-800">{stats.monthOrders}</span>
            </div>
            <div className="flex items-center justify-between gap-4 p-3 bg-gray-50 rounded-xl">
              <span className="text-sm text-gray-600">میانگین سفارش</span>
              <span className="font-bold text-lg text-gray-800">{formatCurrency(stats.monthOrders > 0 ? stats.monthSales / stats.monthOrders : 0)}</span>
            </div>
            <div className="flex items-center justify-between gap-4 p-3 bg-gray-50 rounded-xl">
              <span className="text-sm text-gray-600">کل محصولات</span>
              <span className="font-bold text-lg text-gray-800">{stats.totalProducts}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-0 shadow-xl bg-white/80 backdrop-blur">
          <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
            <CardTitle className="text-base lg:text-lg">فروش‌های اخیر</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {stats.recentSales.length > 0 ? (
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {stats.recentSales.slice(0, 5).map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-gray-800 truncate" title={sale.receiptNumber}>{sale.receiptNumber}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {new Date(sale.createdAt).toLocaleTimeString('fa-IR')}
                      </p>
                    </div>
                    <span className="font-bold text-emerald-600 whitespace-nowrap" title={formatCurrency(sale.totalAmount)}>
                      {formatCurrency(sale.totalAmount)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingBag className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">فروش اخیری وجود ندارد</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="overflow-hidden border-0 shadow-xl bg-white/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-base lg:text-lg text-gray-800">دسترسی سریع</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            <div className="flex flex-col items-center p-4 lg:p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border border-blue-100">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-blue-500/25">
                <ShoppingBag className="h-6 w-6 text-white" />
              </div>
              <span className="text-sm font-bold text-gray-800 text-center">فروش جدید</span>
            </div>
            <div className="flex flex-col items-center p-4 lg:p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border border-emerald-100">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-emerald-500/25">
                <Package className="h-6 w-6 text-white" />
              </div>
              <span className="text-sm font-bold text-gray-800 text-center">افزودن محصول</span>
            </div>
            <div className="flex flex-col items-center p-4 lg:p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border border-purple-100">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-purple-500/25">
                <Users className="h-6 w-6 text-white" />
              </div>
              <span className="text-sm font-bold text-gray-800 text-center">افزودن مشتری</span>
            </div>
            <div className="flex flex-col items-center p-4 lg:p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border border-amber-100">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-amber-500/25">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <span className="text-sm font-bold text-gray-800 text-center">مشاهده گزارش</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Low Stock Alert */}
      {stats.lowStockProducts > 0 && (
        <Card className="border-0 shadow-xl bg-gradient-to-r from-red-500 to-rose-500 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              هشدار موجودی
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-100">
              شما {stats.lowStockProducts} محصول دارید که نیاز به تامین مجدد دارند. موجودی خود را بررسی کنید تا از اتمام کالاهای محبوب جلوگیری کنید.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
