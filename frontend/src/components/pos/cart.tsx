'use client'

import { CartItem } from '@/types'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { Plus, Minus, Trash2, ShoppingCart } from 'lucide-react'

interface CartProps {
  items: CartItem[]
  onUpdateQuantity: (itemId: string, quantity: number) => void
  onRemoveItem: (itemId: string) => void
}

export function Cart({ items, onUpdateQuantity, onRemoveItem }: CartProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No items in cart</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">{item.product.name}</h4>
            <p className="text-sm text-gray-500">
              {formatCurrency(item.price)} each
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center font-medium">{item.quantity}</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <div className="ml-4 flex items-center space-x-3">
            <p className="font-medium text-gray-900">
              {formatCurrency(item.price * item.quantity)}
            </p>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onRemoveItem(item.id)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
