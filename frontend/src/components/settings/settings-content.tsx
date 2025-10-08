'use client'

import { useState, useEffect } from 'react'
import { Save, Settings, Bell, Shield, Printer, Database } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import toast from 'react-hot-toast'

interface SettingsData {
  storeName: string
  storeAddress: string
  phone: string
  email: string
  taxRate: string
  currency: string
  notifications: boolean
  printReceipts: boolean
  lowStockAlerts: boolean
  autoBackup: boolean
}

export default function SettingsContent() {
  const [settings, setSettings] = useState<SettingsData>({
    storeName: 'My Cafe',
    storeAddress: '123 Main Street, City, State 12345',
    phone: '+1 (555) 123-4567',
    email: 'info@mycafe.com',
    taxRate: '8.25',
    currency: 'USD',
    notifications: true,
    printReceipts: true,
    lowStockAlerts: true,
    autoBackup: true,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Load settings from backend on component mount
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setIsLoading(true)
    try {
      // For now, we'll use localStorage as a mock backend
      // In production, this would call your actual API
      const savedSettings = localStorage.getItem('cafeSettings')
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings))
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Validate required fields
      if (!settings.storeName.trim()) {
        toast.error('Store name is required')
        return
      }
      if (!settings.email.trim() || !isValidEmail(settings.email)) {
        toast.error('Valid email address is required')
        return
      }
      if (!settings.taxRate || isNaN(parseFloat(settings.taxRate))) {
        toast.error('Valid tax rate is required')
        return
      }

      // Save to localStorage (in production, this would be an API call)
      localStorage.setItem('cafeSettings', JSON.stringify(settings))

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      toast.success('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleInputChange = (field: keyof SettingsData, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">تنظیمات</h1>
          <p className="text-gray-500">سیستم POS کافه خود را پیکربندی کنید</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="min-w-[140px]"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
              در حال ذخیره...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 ml-2" />
              ذخیره تغییرات
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Store Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 ml-2" />
              اطلاعات فروشگاه
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                نام فروشگاه *
              </label>
              <Input
                value={settings.storeName}
                onChange={(e) => handleInputChange('storeName', e.target.value)}
                placeholder="نام فروشگاه را وارد کنید"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                آدرس
              </label>
              <textarea
                value={settings.storeAddress}
                onChange={(e) => handleInputChange('storeAddress', e.target.value)}
                placeholder="آدرس فروشگاه را وارد کنید"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                شماره تلفن
              </label>
              <Input
                value={settings.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="09123456789"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                آدرس ایمیل *
              </label>
              <Input
                type="email"
                value={settings.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="آدرس ایمیل را وارد کنید"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Business Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 ml-2" />
              تنظیمات کسب‌وکار
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                نرخ مالیات (٪) *
              </label>
              <Input
                type="number"
                step="0.01"
                value={settings.taxRate}
                onChange={(e) => handleInputChange('taxRate', e.target.value)}
                placeholder="8.25"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                واحد پول
              </label>
              <select
                value={settings.currency}
                onChange={(e) => handleInputChange('currency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="USD">دلار آمریکا ($)</option>
                <option value="EUR">یورو (€)</option>
                <option value="GBP">پوند انگلیس (£)</option>
                <option value="PKR">روپیه پاکستان (Rs)</option>
                <option value="IRR">ریال ایران (ریال)</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 ml-2" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">General Notifications</p>
                <p className="text-sm text-gray-500">Receive system notifications</p>
              </div>
              <Switch
                checked={settings.notifications}
                onCheckedChange={(checked) => handleInputChange('notifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Low Stock Alerts</p>
                <p className="text-sm text-gray-500">Get notified when products are low in stock</p>
              </div>
              <Switch
                checked={settings.lowStockAlerts}
                onCheckedChange={(checked) => handleInputChange('lowStockAlerts', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Printer className="h-5 w-5 ml-2" />
              System Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Print Receipts</p>
                <p className="text-sm text-gray-500">Automatically print receipts after sales</p>
              </div>
              <Switch
                checked={settings.printReceipts}
                onCheckedChange={(checked) => handleInputChange('printReceipts', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Auto Backup</p>
                <p className="text-sm text-gray-500">Automatically backup data daily</p>
              </div>
              <Switch
                checked={settings.autoBackup}
                onCheckedChange={(checked) => handleInputChange('autoBackup', checked)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
