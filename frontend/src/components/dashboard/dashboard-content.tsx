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
          <div className="text-lg text-gray-500">Loading dashboard...</div>
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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>{new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.todaySales)}</div>
            <p className="text-xs text-muted-foreground">
              Revenue for today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayOrders}</div>
            <p className="text-xs text-muted-foreground">
              Orders completed today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(averageOrderValue)}</div>
            <p className="text-xs text-muted-foreground">
              Per order today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.lowStockProducts}</div>
            <p className="text-xs text-red-500">
              Items need restocking
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Monthly Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Total Sales</span>
              <span className="font-semibold">{formatCurrency(stats.monthSales)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Total Orders</span>
              <span className="font-semibold">{stats.monthOrders}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Average Order Value</span>
              <span className="font-semibold">
                {formatCurrency(stats.monthOrders > 0 ? stats.monthSales / stats.monthOrders : 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Total Products</span>
              <span className="font-semibold">{stats.totalProducts}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentSales.length > 0 ? (
              <div className="space-y-3">
                {stats.recentSales.slice(0, 5).map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div>
                      <p className="font-medium text-sm">{sale.receiptNumber}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(sale.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <span className="font-semibold">{formatCurrency(sale.totalAmount)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingBag className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No recent sales</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
              <ShoppingBag className="h-8 w-8 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-blue-900">New Sale</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors">
              <Package className="h-8 w-8 text-green-600 mb-2" />
              <span className="text-sm font-medium text-green-900">Add Product</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-purple-50 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors">
              <Users className="h-8 w-8 text-purple-600 mb-2" />
              <span className="text-sm font-medium text-purple-900">Add Customer</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-orange-50 rounded-lg cursor-pointer hover:bg-orange-100 transition-colors">
              <TrendingUp className="h-8 w-8 text-orange-600 mb-2" />
              <span className="text-sm font-medium text-orange-900">View Reports</span>
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
              <span>Stock Alert</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 text-sm">
              You have {stats.lowStockProducts} product{stats.lowStockProducts !== 1 ? 's' : ''} running low on stock.
              Consider restocking to avoid running out.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
