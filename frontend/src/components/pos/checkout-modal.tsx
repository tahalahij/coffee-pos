'use client'

import { useState } from 'react'
import { X, CreditCard, Banknote, Smartphone, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, generateReceiptId } from '@/lib/utils'
import { CartItem } from '@/types'
import toast from 'react-hot-toast'

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
  total: number
  items: CartItem[]
}

export function CheckoutModal({ isOpen, onClose, onComplete, total, items }: CheckoutModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'digital'>('cash')
  const [cashReceived, setCashReceived] = useState<number>(0)
  const [isProcessing, setIsProcessing] = useState(false)

  if (!isOpen) return null

  const handlePayment = async () => {
    setIsProcessing(true)

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))

    const receiptId = generateReceiptId()

    // In a real app, this would save to database
    const saleData = {
      id: receiptId,
      items,
      total,
      payment_method: paymentMethod,
      created_at: new Date(),
    }

    toast.success(`Payment successful! Receipt: ${receiptId}`)

    setIsProcessing(false)
    onComplete()
  }

  const change = paymentMethod === 'cash' ? Math.max(0, cashReceived - total) : 0
  const canProcess = paymentMethod === 'cash' ? cashReceived >= total : true

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md m-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">Checkout</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Order Summary */}
          <div>
            <h3 className="font-medium mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.quantity}x {item.product.name}</span>
                  <span>{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="border-t pt-2 font-medium flex justify-between">
                <span>Total:</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <h3 className="font-medium mb-3">Payment Method</h3>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('cash')}
                className="flex flex-col items-center p-4 h-auto"
              >
                <Banknote className="h-6 w-6 mb-1" />
                <span className="text-xs">Cash</span>
              </Button>
              <Button
                variant={paymentMethod === 'card' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('card')}
                className="flex flex-col items-center p-4 h-auto"
              >
                <CreditCard className="h-6 w-6 mb-1" />
                <span className="text-xs">Card</span>
              </Button>
              <Button
                variant={paymentMethod === 'digital' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('digital')}
                className="flex flex-col items-center p-4 h-auto"
              >
                <Smartphone className="h-6 w-6 mb-1" />
                <span className="text-xs">Digital</span>
              </Button>
            </div>
          </div>

          {/* Cash Payment Details */}
          {paymentMethod === 'cash' && (
            <div>
              <label className="block text-sm font-medium mb-2">Cash Received</label>
              <input
                type="number"
                value={cashReceived || ''}
                onChange={(e) => setCashReceived(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                step="0.01"
              />
              {cashReceived > 0 && (
                <div className="mt-2 p-3 bg-gray-50 rounded-md">
                  <div className="flex justify-between text-sm">
                    <span>Total:</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Received:</span>
                    <span>{formatCurrency(cashReceived)}</span>
                  </div>
                  <div className="flex justify-between font-medium border-t pt-1 mt-1">
                    <span>Change:</span>
                    <span className={change >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatCurrency(change)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t space-y-3">
          <Button
            onClick={handlePayment}
            disabled={!canProcess || isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing ? 'Processing...' : `Process Payment (${formatCurrency(total)})`}
          </Button>

          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button variant="outline" className="flex-1">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
