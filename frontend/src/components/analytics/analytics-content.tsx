'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart3, TrendingUp, DollarSign, Users, Download, ShoppingBag, Award, Sparkles } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

// Mock analytics data with Persian product names
const mockAnalytics = {
  revenue: {
    thisMonth: 28450000,
    lastMonth: 25200000,
    growth: 12.9
  },
  orders: {
    thisMonth: 1205,
    lastMonth: 1089,
    growth: 10.7
  },
  topProducts: [
    { name: 'کاپوچینو', sales: 245, revenue: 9187500 },
    { name: 'لاته', sales: 198, revenue: 8415000 },
    { name: 'آمریکانو', sales: 176, revenue: 5280000 },
    { name: 'اسپرسو', sales: 155, revenue: 3875000 },
    { name: 'کروسان', sales: 134, revenue: 4690000 }
  ],
  categories: [
    { name: 'قهوه', percentage: 65, revenue: 18492500 },
    { name: 'شیرینی', percentage: 20, revenue: 5690000 },
    { name: 'چای', percentage: 10, revenue: 2845000 },
    { name: 'ساندویچ', percentage: 5, revenue: 1422500 }
  ]
}

export default function AnalyticsContent() {
  const handleExportReport = () => {
    // Create CSV data
    const csvData = [
      ['متریک', 'این ماه', 'ماه قبل', 'رشد'],
      ['درآمد', mockAnalytics.revenue.thisMonth.toString(), mockAnalytics.revenue.lastMonth.toString(), `${mockAnalytics.revenue.growth}%`],
      ['سفارشات', mockAnalytics.orders.thisMonth.toString(), mockAnalytics.orders.lastMonth.toString(), `${mockAnalytics.orders.growth}%`],
      ['', '', '', ''],
      ['محصولات برتر', 'فروش', 'درآمد', ''],
      ...mockAnalytics.topProducts.map(product => [product.name, product.sales.toString(), product.revenue.toString(), '']),
      ['', '', '', ''],
      ['دسته‌بندی‌ها', 'درصد', 'درآمد', ''],
      ...mockAnalytics.categories.map(category => [category.name, `${category.percentage}%`, category.revenue.toString(), ''])
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
            <CardTitle className="text-sm font-medium text-purple-100">درآمد ماهانه</CardTitle>
            <DollarSign className="h-5 w-5 text-purple-200" />
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold">{formatCurrency(mockAnalytics.revenue.thisMonth)}</div>
            <p className="text-xs text-emerald-300 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              +{mockAnalytics.revenue.growth}٪ نسبت به ماه قبل
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-xl shadow-blue-500/20 border-0 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-full bg-white/5 backdrop-blur-sm"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-blue-100">سفارشات ماهانه</CardTitle>
            <ShoppingBag className="h-5 w-5 text-blue-200" />
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold">{mockAnalytics.orders.thisMonth.toLocaleString('fa-IR')}</div>
            <p className="text-xs text-emerald-300 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              +{mockAnalytics.orders.growth}٪ نسبت به ماه قبل
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-500/20 border-0 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-full bg-white/5 backdrop-blur-sm"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-emerald-100">میانگین سفارش</CardTitle>
            <TrendingUp className="h-5 w-5 text-emerald-200" />
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold">
              {formatCurrency(mockAnalytics.revenue.thisMonth / mockAnalytics.orders.thisMonth)}
            </div>
            <p className="text-xs text-emerald-200 mt-1">
              به ازای هر سفارش
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-xl shadow-rose-500/20 border-0 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-full bg-white/5 backdrop-blur-sm"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-rose-100">نرخ رشد</CardTitle>
            <BarChart3 className="h-5 w-5 text-rose-200" />
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold">{mockAnalytics.revenue.growth}٪</div>
            <p className="text-xs text-rose-200 mt-1">
              ماه به ماه
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <Award className="h-5 w-5 text-amber-500" />
              محصولات پرفروش
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockAnalytics.topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white ${
                      index === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-600' :
                      index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-500' :
                      index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                      'bg-gradient-to-br from-blue-400 to-blue-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.sales.toLocaleString('fa-IR')} عدد فروخته شده</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-emerald-600">{formatCurrency(product.revenue)}</p>
                    <p className="text-xs text-gray-500">درآمد</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <BarChart3 className="h-5 w-5 text-purple-500" />
              سهم دسته‌بندی‌ها
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockAnalytics.categories.map((category, index) => {
                const colors = [
                  'from-purple-500 to-indigo-500',
                  'from-pink-500 to-rose-500',
                  'from-emerald-500 to-teal-500',
                  'from-amber-500 to-orange-500'
                ]
                return (
                  <div key={category.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">{category.name}</span>
                      <span className="text-sm text-gray-500">{category.percentage}٪</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${colors[index]} rounded-full transition-all duration-1000`}
                        style={{ width: `${category.percentage}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-500 text-left">{formatCurrency(category.revenue)}</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
