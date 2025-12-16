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
  Archive,
  ChevronLeft,
  ChevronRight,
  Tag
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { TabType } from '@/app/page'

const navigation = [
  { name: 'صندوق فروش', key: 'pos' as TabType, icon: ShoppingCart, color: 'from-blue-500 to-indigo-500' },
  { name: 'داشبورد', key: 'dashboard' as TabType, icon: LayoutDashboard, color: 'from-emerald-500 to-teal-500' },
  { name: 'محصولات', key: 'products' as TabType, icon: Package, color: 'from-amber-500 to-orange-500' },
  { name: 'دسته‌بندی', key: 'categories' as TabType, icon: Archive, color: 'from-purple-500 to-pink-500' },
  { name: 'تخفیف‌ها', key: 'discounts' as TabType, icon: Tag, color: 'from-pink-500 to-rose-500' },
  { name: 'فروش', key: 'sales' as TabType, icon: Receipt, color: 'from-green-500 to-emerald-500' },
  { name: 'خرید', key: 'purchases' as TabType, icon: Users, color: 'from-cyan-500 to-blue-500' },
  { name: 'تحلیل', key: 'analytics' as TabType, icon: BarChart3, color: 'from-violet-500 to-purple-500' },
  { name: 'تنظیمات', key: 'settings' as TabType, icon: Settings, color: 'from-gray-500 to-slate-600' },
]

interface SidebarProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className={cn(
      "flex flex-col bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 transition-all duration-300 shadow-2xl",
      collapsed ? "w-20" : "w-72"
    )}>
      {/* Logo */}
      <div className="flex items-center h-20 px-6 border-b border-slate-700/50">
        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
          <Coffee className="h-6 w-6 text-white" />
        </div>
        {!collapsed && (
          <span className="mr-3 text-xl font-bold bg-gradient-to-r from-amber-200 to-orange-200 bg-clip-text text-transparent">کافه POS</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.key

          return (
            <Button
              key={item.key}
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 h-12 rounded-xl transition-all duration-200",
                collapsed ? "px-3 justify-center" : "px-4",
                isActive 
                  ? `bg-gradient-to-r ${item.color} text-white shadow-lg hover:opacity-90` 
                  : "text-slate-400 hover:text-white hover:bg-slate-700/50"
              )}
              onClick={() => onTabChange(item.key)}
            >
              <Icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-white")} />
              {!collapsed && <span className="font-medium">{item.name}</span>}
            </Button>
          )
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-4 border-t border-slate-700/50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl h-10"
        >
          {collapsed ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </Button>
      </div>
    </div>
  )
}
