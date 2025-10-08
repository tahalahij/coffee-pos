'use client'

import { useState } from 'react'
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  Settings,
  Coffee,
  Receipt,
  Archive
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { TabType } from '@/app/page'

const navigation = [
  { name: 'صندوق فروش', key: 'pos' as TabType, icon: ShoppingCart },
  { name: 'داشبورد', key: 'dashboard' as TabType, icon: LayoutDashboard },
  { name: 'محصولات', key: 'products' as TabType, icon: Package },
  { name: 'دسته‌بندی', key: 'categories' as TabType, icon: Archive },
  { name: 'فروش', key: 'sales' as TabType, icon: Receipt },
  { name: 'خرید', key: 'purchases' as TabType, icon: Users },
  { name: 'تحلیل', key: 'analytics' as TabType, icon: BarChart3 },
  { name: 'تنظیمات', key: 'settings' as TabType, icon: Settings },
]

interface SidebarProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className={cn(
      "flex flex-col bg-white border-r border-gray-200 transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Logo */}
      <div className="flex items-center h-16 px-6 border-b border-gray-200">
        <Coffee className="h-8 w-8 text-blue-600" />
        {!collapsed && (
          <span className="mr-3 text-xl font-bold text-gray-900">کافه POS</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.key

          return (
            <Button
              key={item.key}
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start gap-3",
                collapsed ? "px-2" : "px-4"
              )}
              onClick={() => onTabChange(item.key)}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Button>
          )
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full"
        >
          {collapsed ? '→' : '←'}
        </Button>
      </div>
    </div>
  )
}
