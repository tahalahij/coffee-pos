'use client'

import { useState } from 'react'
import { X, Plus, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

interface PurchaseItem {
  id: string
  productName: string
  quantity: number
  unitCost: number
}

interface AddPurchaseModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (purchase: {
    supplierName: string
    items: PurchaseItem[]
    totalAmount: number
  }) => void
}

export default function AddPurchaseModal({ isOpen, onClose, onSubmit }: AddPurchaseModalProps) {
  const [supplierName, setSupplierName] = useState('')
  const [items, setItems] = useState<PurchaseItem[]>([
    { id: '1', productName: '', quantity: 1, unitCost: 0 }
  ])

  if (!isOpen) return null

  const addItem = () => {
    const newItem: PurchaseItem = {
      id: Date.now().toString(),
      productName: '',
      quantity: 1,
      unitCost: 0
    }
    setItems([...items, newItem])
  }

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id))
    }
  }

  const updateItem = (id: string, field: keyof PurchaseItem, value: string | number) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ))
  }

  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!supplierName.trim()) {
      alert('Please enter supplier name')
      return
    }

    if (items.some(item => !item.productName.trim() || item.quantity <= 0 || item.unitCost <= 0)) {
      alert('Please fill all item details correctly')
      return
    }

    onSubmit({
      supplierName,
      items,
      totalAmount
    })

    // Reset form
    setSupplierName('')
    setItems([{ id: '1', productName: '', quantity: 1, unitCost: 0 }])
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">New Purchase Order</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Supplier Information */}
          <div>
            <label className="block text-sm font-medium mb-2">Supplier Name</label>
            <Input
              type="text"
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
              placeholder="Enter supplier name"
              required
            />
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Items</h3>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 ml-2" />
                Add Item
              </Button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">Product Name</label>
                        <Input
                          type="text"
                          value={item.productName}
                          onChange={(e) => updateItem(item.id, 'productName', e.target.value)}
                          placeholder="Enter product name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Quantity</label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                          required
                        />
                      </div>
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <label className="block text-sm font-medium mb-1">Unit Cost ($)</label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitCost}
                            onChange={(e) => updateItem(item.id, 'unitCost', parseFloat(e.target.value) || 0)}
                            required
                          />
                        </div>
                        {items.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="p-2"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 text-right text-sm text-gray-600">
                      Subtotal: ${(item.quantity * item.unitCost).toFixed(2)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total Amount:</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button type="submit" className="flex-1">
              Create Purchase Order
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
