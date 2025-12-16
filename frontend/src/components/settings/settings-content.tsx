'use client'

import { useState, useEffect } from 'react'
import { Save, Settings, Bell, Shield, Printer, Database, Store, Palette } from 'lucide-react'
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
    storeName: 'کافه من',
    storeAddress: 'تهران، خیابان ولیعصر، پلاک ۱۲۳',
    phone: '۰۲۱-۱۲۳۴۵۶۷۸',
    email: 'info@mycafe.ir',
    taxRate: '9',
    currency: 'IRR',
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
      const savedSettings = localStorage.getItem('cafeSettings')
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings))
      }
    } catch (error) {
      console.error('خطا در بارگذاری تنظیمات:', error)
      toast.error('خطا در بارگذاری تنظیمات')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      if (!settings.storeName.trim()) {
        toast.error('نام فروشگاه الزامی است')
        return
      }
      if (!settings.email.trim() || !isValidEmail(settings.email)) {
        toast.error('آدرس ایمیل معتبر الزامی است')
        return
      }
      if (!settings.taxRate || isNaN(parseFloat(settings.taxRate))) {
        toast.error('نرخ مالیات معتبر الزامی است')
        return
      }

      localStorage.setItem('cafeSettings', JSON.stringify(settings))
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('تنظیمات با موفقیت ذخیره شد!')
    } catch (error) {
      console.error('خطا در ذخیره تنظیمات:', error)
      toast.error('خطا در ذخیره تنظیمات. لطفا دوباره تلاش کنید.')
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
      <div className="p-6 flex items-center justify-center h-full bg-gradient-to-br from-slate-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">در حال بارگذاری تنظیمات...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent flex items-center gap-2">
            <Settings className="h-8 w-8 text-gray-600" />
            تنظیمات
          </h1>
          <p className="text-gray-500 mt-1">سیستم POS کافه خود را پیکربندی کنید</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="min-w-[140px] bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-lg shadow-blue-500/25"
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
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
            <CardTitle className="flex items-center text-lg">
              <Store className="h-5 w-5 ml-2" />
              اطلاعات فروشگاه
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نام فروشگاه *
              </label>
              <Input
                value={settings.storeName}
                onChange={(e) => handleInputChange('storeName', e.target.value)}
                placeholder="نام فروشگاه را وارد کنید"
                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                آدرس
              </label>
              <textarea
                value={settings.storeAddress}
                onChange={(e) => handleInputChange('storeAddress', e.target.value)}
                placeholder="آدرس فروشگاه را وارد کنید"
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                شماره تلفن
              </label>
              <Input
                value={settings.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="۰۲۱-۱۲۳۴۵۶۷۸"
                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                آدرس ایمیل *
              </label>
              <Input
                type="email"
                value={settings.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="آدرس ایمیل را وارد کنید"
                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Business Settings */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
            <CardTitle className="flex items-center text-lg">
              <Database className="h-5 w-5 ml-2" />
              تنظیمات کسب‌وکار
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نرخ مالیات (٪) *
              </label>
              <Input
                type="number"
                step="0.01"
                value={settings.taxRate}
                onChange={(e) => handleInputChange('taxRate', e.target.value)}
                placeholder="۹"
                className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                واحد پول
              </label>
              <select
                value={settings.currency}
                onChange={(e) => handleInputChange('currency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
              >
                <option value="IRR">تومان ایران (تومان)</option>
                <option value="USD">دلار آمریکا ($)</option>
                <option value="EUR">یورو (€)</option>
                <option value="AED">درهم امارات (د.إ)</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
            <CardTitle className="flex items-center text-lg">
              <Bell className="h-5 w-5 ml-2" />
              اعلان‌ها
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="font-medium text-gray-900">اعلان‌های عمومی</p>
                <p className="text-sm text-gray-500">دریافت اعلان‌های سیستم</p>
              </div>
              <Switch
                checked={settings.notifications}
                onCheckedChange={(checked) => handleInputChange('notifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="font-medium text-gray-900">هشدار موجودی کم</p>
                <p className="text-sm text-gray-500">دریافت اعلان وقتی موجودی محصولات کم است</p>
              </div>
              <Switch
                checked={settings.lowStockAlerts}
                onCheckedChange={(checked) => handleInputChange('lowStockAlerts', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <CardTitle className="flex items-center text-lg">
              <Printer className="h-5 w-5 ml-2" />
              تنظیمات سیستم
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="font-medium text-gray-900">چاپ رسید</p>
                <p className="text-sm text-gray-500">چاپ خودکار رسید پس از فروش</p>
              </div>
              <Switch
                checked={settings.printReceipts}
                onCheckedChange={(checked) => handleInputChange('printReceipts', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="font-medium text-gray-900">پشتیبان‌گیری خودکار</p>
                <p className="text-sm text-gray-500">پشتیبان‌گیری روزانه خودکار اطلاعات</p>
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
