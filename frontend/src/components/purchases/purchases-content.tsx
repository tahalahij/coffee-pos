'use client'

import { useState, useEffect } from 'react'
import { Plus, Truck, Package, TrendingUp, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'
import AddPurchaseModal from './add-purchase-modal'
import { purchasesService } from '@/lib/services'
import { useToast } from '@/hooks/use-toast'

interface Purchase {
  id: string
  supplierName: string
  totalAmount: number
  status: 'PENDING' | 'RECEIVED' | 'CANCELLED'
  createdAt: Date
}

export default function PurchasesContent() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchPurchases()
  }, [])

  const fetchPurchases = async () => {
    try {
      setIsLoading(true)
      const data = await purchasesService.getAll()
      setPurchases(data)
    } catch (error) {
      console.error('Error fetching purchases:', error)
      toast({
        title: 'خطا',
        description: 'بارگذاری خریدها با مشکل مواجه شد',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddPurchase = async (purchaseData: {
    supplierName: string
    items: any[]
    totalAmount: number
  }) => {
    try {
      await purchasesService.create(purchaseData)
      toast({
        title: 'موفقیت',
        description: 'خرید با موفقیت ثبت شد',
      })
      await fetchPurchases()
    } catch (error) {
      console.error('Error creating purchase:', error)
      toast({
        title: 'خطا',
        description: 'ثبت خرید با مشکل مواجه شد',
        variant: 'destructive',
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RECEIVED': return 'bg-gradient-to-r from-emerald-500 to-green-500 text-white'
      case 'PENDING': return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
      case 'CANCELLED': return 'bg-gradient-to-r from-red-500 to-rose-500 text-white'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'RECEIVED': return 'دریافت شده'
      case 'PENDING': return 'در انتظار'
      case 'CANCELLED': return 'لغو شده'
      default: return status
    }
  }

  const totalPurchases = purchases.reduce((sum, p) => sum + p.totalAmount, 0)
  const pendingPurchases = purchases.filter(p => p.status === 'PENDING')
  const receivedPurchases = purchases.filter(p => p.status === 'RECEIVED')

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 h-full overflow-y-auto bg-gradient-to-br from-slate-50 to-indigo-50">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">در حال بارگذاری...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">خریدها</h1>
          <p className="text-gray-500 mt-1">مدیریت تأمین موجودی و سفارشات</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-lg shadow-indigo-500/25">
          <Plus className="h-4 w-4" />
          <span>افزودن خرید</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-xl shadow-indigo-500/20 border-0">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm">کل خریدها</p>
                <p className="text-3xl font-bold mt-1">{purchases.length}</p>
              </div>
              <Package className="h-10 w-10 text-indigo-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-xl shadow-amber-500/20 border-0">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm">در انتظار تحویل</p>
                <p className="text-3xl font-bold mt-1">{pendingPurchases.length}</p>
              </div>
              <Clock className="h-10 w-10 text-amber-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-green-500 text-white shadow-xl shadow-emerald-500/20 border-0">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm">دریافت شده</p>
                <p className="text-3xl font-bold mt-1">{receivedPurchases.length}</p>
              </div>
              <Truck className="h-10 w-10 text-emerald-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-xl shadow-purple-500/20 border-0">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">مجموع هزینه</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(totalPurchases)}</p>
              </div>
              <TrendingUp className="h-10 w-10 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Purchases List */}
      <div className="grid gap-4">
        {purchases.length === 0 ? (
          <Card className="shadow-lg">
            <CardContent className="p-12 text-center">
              <Truck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">هیچ خریدی ثبت نشده است</p>
            </CardContent>
          </Card>
        ) : (
          purchases.map((purchase) => (
            <Card key={purchase.id} className="hover:shadow-xl transition-all duration-300 border-0 shadow-md bg-white/80 backdrop-blur">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
                      <Truck className="h-7 w-7 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">{purchase.supplierName}</h3>
                      <p className="text-sm text-gray-500">
                        {formatDate(purchase.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-left flex items-center gap-4">
                    <div>
                      <p className="text-2xl font-bold text-indigo-600">
                        {formatCurrency(purchase.totalAmount)}
                      </p>
                    </div>
                    <span className={`px-4 py-2 text-sm rounded-full font-medium ${getStatusColor(purchase.status)}`}>
                      {getStatusLabel(purchase.status)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <AddPurchaseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddPurchase}
      />
    </div>
  )
}
