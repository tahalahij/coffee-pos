'use client'

import { useState } from 'react'
import { Plus, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'
import AddPurchaseModal from './add-purchase-modal'

interface Purchase {
  id: string
  supplierName: string
  totalAmount: number
  status: 'PENDING' | 'RECEIVED' | 'CANCELLED'
  createdAt: Date
}

const mockPurchases: Purchase[] = [
  {
    id: '1',
    supplierName: 'Coffee Beans Co.',
    totalAmount: 450.00,
    status: 'RECEIVED',
    createdAt: new Date('2025-09-15T09:00:00'),
  }
]

export default function PurchasesContent() {
  const [purchases, setPurchases] = useState<Purchase[]>(mockPurchases)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const handleAddPurchase = (purchaseData: {
    supplierName: string
    items: any[]
    totalAmount: number
  }) => {
    const newPurchase: Purchase = {
      id: Date.now().toString(),
      supplierName: purchaseData.supplierName,
      totalAmount: purchaseData.totalAmount,
      status: 'PENDING',
      createdAt: new Date()
    }

    setPurchases([newPurchase, ...purchases])
  }

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Purchases</h1>
          <p className="text-gray-500">Manage inventory procurement</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Purchase Order
        </Button>
      </div>

      <div className="grid gap-4">
        {purchases.map((purchase) => (
          <Card key={purchase.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Truck className="h-8 w-8 text-gray-400" />
                  <div>
                    <h3 className="font-semibold text-lg">{purchase.supplierName}</h3>
                    <p className="text-sm text-gray-500">
                      {formatDate(purchase.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(purchase.totalAmount)}
                  </p>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    purchase.status === 'RECEIVED' 
                      ? 'bg-green-100 text-green-800'
                      : purchase.status === 'PENDING'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {purchase.status}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AddPurchaseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddPurchase}
      />
    </div>
  )
}
