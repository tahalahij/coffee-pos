'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart3, TrendingUp, DollarSign, Users, Download } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

// Mock analytics data
const mockAnalytics = {
  revenue: {
    thisMonth: 28450.00,
    lastMonth: 25200.00,
    growth: 12.9
  },
  orders: {
    thisMonth: 1205,
    lastMonth: 1089,
    growth: 10.7
  },
  topProducts: [
    { name: 'Cappuccino', sales: 245, revenue: 918.75 },
    { name: 'Latte', sales: 198, revenue: 841.50 },
    { name: 'Americano', sales: 176, revenue: 528.00 },
    { name: 'Espresso', sales: 155, revenue: 387.50 },
    { name: 'Croissant', sales: 134, revenue: 469.00 }
  ],
  categories: [
    { name: 'Coffee', percentage: 65, revenue: 18492.50 },
    { name: 'Pastries', percentage: 20, revenue: 5690.00 },
    { name: 'Tea', percentage: 10, revenue: 2845.00 },
    { name: 'Sandwiches', percentage: 5, revenue: 1422.50 }
  ]
}

export default function AnalyticsContent() {
  const handleExportReport = () => {
    // Create CSV data
    const csvData = [
      ['Metric', 'This Month', 'Last Month', 'Growth'],
      ['Revenue', mockAnalytics.revenue.thisMonth.toString(), mockAnalytics.revenue.lastMonth.toString(), `${mockAnalytics.revenue.growth}%`],
      ['Orders', mockAnalytics.orders.thisMonth.toString(), mockAnalytics.orders.lastMonth.toString(), `${mockAnalytics.orders.growth}%`],
      ['', '', '', ''],
      ['Top Products', 'Sales', 'Revenue', ''],
      ...mockAnalytics.topProducts.map(product => [product.name, product.sales.toString(), product.revenue.toString(), '']),
      ['', '', '', ''],
      ['Categories', 'Percentage', 'Revenue', ''],
      ...mockAnalytics.categories.map(category => [category.name, `${category.percentage}%`, category.revenue.toString(), ''])
    ]

    // Convert to CSV string
    const csvContent = csvData.map(row => row.join(',')).join('\n')

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `analytics-report-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500">Business insights and performance metrics</p>
        </div>
        <Button variant="outline" onClick={handleExportReport}>
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(mockAnalytics.revenue.thisMonth)}</div>
            <p className="text-xs text-green-600">
              +{mockAnalytics.revenue.growth}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Orders</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAnalytics.orders.thisMonth}</div>
            <p className="text-xs text-green-600">
              +{mockAnalytics.orders.growth}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(mockAnalytics.revenue.thisMonth / mockAnalytics.orders.thisMonth)}
            </div>
            <p className="text-xs text-green-600">
              +2.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAnalytics.revenue.growth}%</div>
            <p className="text-xs text-muted-foreground">
              Month over month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle>Top Selling Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockAnalytics.topProducts.map((product, index) => (
              <div key={product.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.sales} units sold</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{formatCurrency(product.revenue)}</p>
                  <p className="text-xs text-gray-500">Revenue</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
