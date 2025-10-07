'use client'

import { useState } from 'react'
import { X, CreditCard, Banknote, Smartphone, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { CartItem } from '@/types'
import { useSalesStore } from '@/hooks/use-sales-store'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
  total: number
  items: CartItem[]
}

export function CheckoutModal({ isOpen, onClose, onComplete, total, items }: CheckoutModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'DIGITAL'>('CASH')
  const [cashReceived, setCashReceived] = useState<number>(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customer, setCustomer] = useState<any>(null)
  const [customerSearchLoading, setCustomerSearchLoading] = useState(false)
  const [customerError, setCustomerError] = useState('')
  const { addSale } = useSalesStore()

  if (!isOpen) return null

  const handlePayment = async () => {
    setIsProcessing(true)

    try {
      // Create simplified sale data - let backend handle the logic
      const saleData = {
        paymentMethod,
        customerId: customer ? customer.id : undefined,
        cashReceived: paymentMethod === 'CASH' ? cashReceived : undefined,
        items: items.map(item => ({
          productId: item.id.split('-')[0], // Extract product ID from cart item ID
          quantity: item.quantity,
          unitPrice: item.price,
          product: {
            name: item.product.name,
            price: item.product.price
          }
        }))
      }

      // Send to backend API - let it calculate totals, generate receipt, etc.
      const response = await api.post('/sales', saleData)
      const createdSale = response.data

      // Add to local sales store for immediate UI update
      addSale(createdSale)

      toast.success(`Payment successful! Receipt: ${createdSale.receiptNumber}`)
      onComplete()
    } catch (error: any) {
      console.error('Payment processing error:', error)
      const errorMessage = error.response?.data?.message || 'Payment failed. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const change = paymentMethod === 'CASH' ? Math.max(0, cashReceived - total) : 0
  const canProcess = paymentMethod === 'CASH' ? cashReceived >= total : true

  const handleCustomerSearch = async () => {
    setCustomerSearchLoading(true)
    setCustomerError('')
    setCustomer(null)
    try {
      const res = await api.get(`/customers/search?q=${encodeURIComponent(customerPhone)}`)
      if (res.data.length > 0) {
        setCustomer(res.data[0])
        setCustomerName(res.data[0].name)
      } else {
        setCustomer(null)
        setCustomerError('No customer found. Please enter name to add.')
      }
    } catch (e) {
      console.log("Error searching customer", e)
      setCustomerError('Error searching customer')
    }
    setCustomerSearchLoading(false)
  }

  const handleAddCustomer = async () => {
    setCustomerError('')
    try {
      const res = await api.post('/customers', { name: customerName, phone: customerPhone })
      setCustomer(res.data)
    } catch (e) {
      setCustomerError('Error adding customer')
    }
  }

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
          {/* Customer Search/Add */}
          <div>
            <label className="block text-sm font-medium mb-2">Customer Phone</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                className="border px-2 py-1 rounded w-full"
                placeholder="09123456789"
              />
              <Button type="button" onClick={handleCustomerSearch} disabled={customerSearchLoading}>
                {customerSearchLoading ? 'Searching...' : 'Search'}
              </Button>
            </div>
            {customer ? (
              <div className="mb-2 text-green-700">Customer: {customer.name}</div>
            ) : customerError ? (
              <div className="mb-2 text-red-600">{customerError}</div>
            ) : null}
            {!customer && customerError && (
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="border px-2 py-1 rounded w-full"
                  placeholder="Enter customer name"
                />
                <Button type="button" onClick={handleAddCustomer} disabled={!customerName}>
                  Add
                </Button>
              </div>
            )}
          </div>

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
                variant={paymentMethod === 'CASH' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('CASH')}
                className="flex flex-col items-center p-4 h-auto"
              >
                <Banknote className="h-6 w-6 mb-1" />
                <span className="text-xs">Cash</span>
              </Button>
              <Button
                variant={paymentMethod === 'CARD' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('CARD')}
                className="flex flex-col items-center p-4 h-auto"
              >
                <CreditCard className="h-6 w-6 mb-1" />
                <span className="text-xs">Card</span>
              </Button>
              <Button
                variant={paymentMethod === 'DIGITAL' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('DIGITAL')}
                className="flex flex-col items-center p-4 h-auto"
              >
                <Smartphone className="h-6 w-6 mb-1" />
                <span className="text-xs">Digital</span>
              </Button>
            </div>
          </div>

          {/* Cash Payment Details */}
          {paymentMethod === 'CASH' && (
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
