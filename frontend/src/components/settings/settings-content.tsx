'use client'

import { useState } from 'react'
import { Save, Settings, Bell, Shield, Printer, Database } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import toast from 'react-hot-toast'

export default function SettingsContent() {
  const [settings, setSettings] = useState({
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

  const handleSave = () => {
    // In a real app, this would save to backend
    toast.success('Settings saved successfully!')
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500">Configure your cafe POS system</p>
        </div>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Store Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Store Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Store Name
              </label>
              <Input
                value={settings.storeName}
                onChange={(e) => handleInputChange('storeName', e.target.value)}
                placeholder="Enter store name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                value={settings.storeAddress}
                onChange={(e) => handleInputChange('storeAddress', e.target.value)}
                placeholder="Enter store address"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <Input
                value={settings.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="09123456789"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <Input
                type="email"
                value={settings.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter email address"
              />
            </div>
          </CardContent>
        </Card>

        {/* Business Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Business Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tax Rate (%)
              </label>
              <Input
                type="number"
                step="0.01"
                value={settings.taxRate}
                onChange={(e) => handleInputChange('taxRate', e.target.value)}
                placeholder="Enter tax rate"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <select
                value={settings.currency}
                onChange={(e) => handleInputChange('currency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="CAD">CAD - Canadian Dollar</option>
              </select>
            </div>

            <div className="pt-4 border-t">
              <h3 className="text-lg font-medium text-gray-900 mb-3">System Settings</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto Print Receipts</p>
                    <p className="text-sm text-gray-500">Automatically print receipts after each sale</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.printReceipts}
                    onChange={(e) => handleInputChange('printReceipts', e.target.checked)}
                    className="rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Low Stock Alerts</p>
                    <p className="text-sm text-gray-500">Get notified when products are running low</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.lowStockAlerts}
                    onChange={(e) => handleInputChange('lowStockAlerts', e.target.checked)}
                    className="rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Notifications</p>
                    <p className="text-sm text-gray-500">System alerts and updates</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifications}
                    onChange={(e) => handleInputChange('notifications', e.target.checked)}
                    className="rounded"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
