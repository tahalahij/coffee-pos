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

// Mock data - in real app this would come from API
const mockDashboardData = {
  todaySales: 1247.50,
  todayOrders: 45,
  monthSales: 28450.00,
  monthOrders: 1205,
  totalProducts: 28,
  lowStockProducts: 3,
  recentSales: [
    { id: '1', receiptNumber: 'RCP-20250916-0001', totalAmount: 15.75, createdAt: new Date() },
    { id: '2', receiptNumber: 'RCP-20250916-0002', totalAmount: 8.50, createdAt: new Date() },
    { id: '3', receiptNumber: 'RCP-20250916-0003', totalAmount: 22.25, createdAt: new Date() },
  ]
}

const mockSalesData = [
  { hour: 8, sales: 125.50, orders: 8 },
  { hour: 9, sales: 245.75, orders: 15 },
  { hour: 10, sales: 189.25, orders: 12 },
  { hour: 11, sales: 298.50, orders: 18 },
  { hour: 12, sales: 445.75, orders: 25 },
  { hour: 13, sales: 367.25, orders: 22 },
  { hour: 14, sales: 198.50, orders: 14 },
  { hour: 15, sales: 156.75, orders: 11 },
  { hour: 16, sales: 189.25, orders: 13 },
  { hour: 17, sales: 234.50, orders: 16 },
]

export default function DashboardPage() {
  const [data, setData] = useState(mockDashboardData)

  const averageOrderValue = data.todayOrders > 0 ? data.todaySales / data.todayOrders : 0

  return (
    <div className="p-6 space-y-6">
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
            <div className="text-2xl font-bold">{formatCurrency(data.todaySales)}</div>
            <p className="text-xs text-muted-foreground">
              +12.5% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.todayOrders}</div>
            <p className="text-xs text-muted-foreground">
              +8.2% from yesterday
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
              +3.1% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{data.lowStockProducts}</div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hourly Sales Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Today's Hourly Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockSalesData.map((item) => (
                <div key={item.hour} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium w-12">
                      {item.hour}:00
                    </span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(item.sales / 500) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{formatCurrency(item.sales)}</div>
                    <div className="text-xs text-gray-500">{item.orders} orders</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Sales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Recent Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{sale.receiptNumber}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(sale.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="text-sm font-bold">
                    {formatCurrency(sale.totalAmount)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Sales:</span>
                <span className="font-bold">{formatCurrency(data.monthSales)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Orders:</span>
                <span className="font-bold">{data.monthOrders}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Average Order Value:</span>
                <span className="font-bold">
                  {formatCurrency(data.monthSales / data.monthOrders)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Products:</span>
                <span className="font-bold">{data.totalProducts}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">In Stock:</span>
                <span className="font-bold text-green-600">{data.totalProducts - data.lowStockProducts}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Low Stock:</span>
                <span className="font-bold text-orange-600">{data.lowStockProducts}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
