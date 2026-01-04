'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { POSInterface } from '@/components/pos/pos-interface'
import DashboardContent from '@/components/dashboard/dashboard-content'
import ProductsContent from '@/components/products/products-content'
import CategoriesContent from '@/components/categories/categories-content'
import DiscountsContent from '@/components/discounts/discounts-content'
import SalesContent from '@/components/sales/sales-content'
import PurchasesContent from '@/components/purchases/purchases-content'
import AnalyticsContent from '@/components/analytics/analytics-content'
import SettingsContent from '@/components/settings/settings-content'
import { DebugConsole } from '@/components/debug/debug-console'

export type TabType = 'pos' | 'dashboard' | 'products' | 'categories' | 'discounts' | 'sales' | 'purchases' | 'analytics' | 'settings'

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabType>('pos')

  const renderContent = () => {
    switch (activeTab) {
      case 'pos':
        return <POSInterface />
      case 'dashboard':
        return <DashboardContent />
      case 'products':
        return <ProductsContent />
      case 'categories':
        return <CategoriesContent />
      case 'discounts':
        return <DiscountsContent />
      case 'sales':
        return <SalesContent />
      case 'purchases':
        return <PurchasesContent />
      case 'analytics':
        return <AnalyticsContent />
      case 'settings':
        return <SettingsContent />
      default:
        return <POSInterface />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-hidden">
        {renderContent()}
      </main>
      <DebugConsole />
    </div>
  )
}
