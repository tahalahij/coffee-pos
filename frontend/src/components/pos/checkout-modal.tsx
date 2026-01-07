'use client'

import { useState } from 'react'
import { X, CreditCard, Banknote, Smartphone, Printer, Edit2, Check, Tag, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency, toEnglishDigits } from '@/lib/utils'
import { CartItem, AppliedDiscount } from '@/types'
import { useSalesStore } from '@/hooks/use-sales-store'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import { GiftCheckoutPanel } from '@/components/checkout/GiftCheckoutPanel'

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
  const [customerSex, setCustomerSex] = useState<'MALE' | 'FEMALE' | 'OTHER' | ''>('')
  const [customer, setCustomer] = useState<any>(null)
  const [customerSearchLoading, setCustomerSearchLoading] = useState(false)
  const [customerError, setCustomerError] = useState('')
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState('')
  
  // Discount code state
  const [discountCode, setDiscountCode] = useState('')
  const [appliedDiscount, setAppliedDiscount] = useState<AppliedDiscount | null>(null)
  const [discountLoading, setDiscountLoading] = useState(false)
  const [discountError, setDiscountError] = useState('')

  // Gift metadata state
  const [giftMetadata, setGiftMetadata] = useState<any>(null)

  if (!isOpen) return null

  // Calculate gift discount from selected gifts
  const calculateGiftDiscount = () => {
    if (!giftMetadata?.selectedGiftIds || giftMetadata.selectedGiftIds.length === 0) {
      return 0;
    }
    // Each selected gift covers one item's price
    // Match gifts to cart items by going through items in order
    let remainingGifts = [...giftMetadata.selectedGiftIds];
    let giftDiscount = 0;
    
    for (const item of items) {
      const itemPrice = item.price * item.quantity;
      if (remainingGifts.length > 0) {
        // Apply gift to this item
        giftDiscount += Math.min(itemPrice, item.price);
        remainingGifts.shift();
      }
    }
    
    return giftDiscount;
  };

  // Calculate totals with discount and gifts
  const subtotal = total
  const discountAmount = appliedDiscount?.discountAmount || 0
  const giftDiscount = calculateGiftDiscount()
  const finalTotal = Math.max(0, subtotal - discountAmount - giftDiscount)

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return
    
    setDiscountLoading(true)
    setDiscountError('')
    setAppliedDiscount(null)
    
    try {
      // Get product IDs from cart items - use product.id directly (string MongoDB ObjectId)
      const productIds = items.map(item => item.product.id)
      
      const response = await api.post(`/discounts/codes/${discountCode}/apply`, {
        subtotal: total,
        customerId: customer?.id,
        productIds
      })
      
      setAppliedDiscount(response.data)
      toast.success('کد تخفیف اعمال شد')
    } catch (error: any) {
      const message = error.response?.data?.message || 'کد تخفیف نامعتبر است'
      setDiscountError(Array.isArray(message) ? message.join(' | ') : message)
    } finally {
      setDiscountLoading(false)
    }
  }

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null)
    setDiscountCode('')
    setDiscountError('')
  }

  const handlePayment = async () => {
    setIsProcessing(true)

    try {
      // Create clean sale data structure that matches the DTO
      const saleData = {
        paymentMethod,
        customerId: customer?.id,
        discountCodeId: appliedDiscount?.discountCodeId,
        items: items.map(item => ({
          // Use product.id directly - it's already a string MongoDB ObjectId
          productId: item.product.id,
          quantity: item.quantity,
          unitPrice: item.price
        })),
        // Include gift metadata if available
        ...(giftMetadata && (giftMetadata.selectedGiftIds?.length > 0 || giftMetadata.buyForNext) && {
          giftMetadata: {
            claimedGiftIds: giftMetadata.selectedGiftIds || [],
            buyForNext: giftMetadata.buyForNext || false,
            gifterName: giftMetadata.gifterName || customer?.name,
          }
        })
      }

      console.log('Sending sale data:', JSON.stringify(saleData, null, 2))

      // Send to backend API - let it calculate totals, generate receipt, etc.
      const response = await api.post('/sales', saleData)
      const createdSale = response.data

      // If discount was applied, mark it as used
      if (appliedDiscount?.discountCodeId) {
        try {
          await api.post(`/discounts/codes/${appliedDiscount.code}/use`)
        } catch (e) {
          console.error('Error marking discount as used:', e)
        }
      }

      // Update the sales store by fetching the latest sales (which includes our new sale)
      // Don't call addSale() with the response data since it would try to create another sale
      const { fetchSales } = useSalesStore.getState()
      fetchSales()

      toast.success(`پرداخت موفق! شماره رسید: ${createdSale.receiptNumber}`)
      onComplete()
    } catch (error: any) {
      console.error('Payment processing error:', error)
      const errorMessage = error.response?.data?.message || 'پرداخت ناموفق. لطفا دوباره تلاش کنید.'
      toast.error(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const canProcess = true

  const handleCustomerSearch = async () => {
    setCustomerSearchLoading(true)
    setCustomerError('')
    setCustomer(null)
    try {
      const res = await api.get(`/customers/search?q=${encodeURIComponent(toEnglishDigits(customerPhone))}`)
      if (res.data.length > 0) {
        setCustomer(res.data[0])
        setCustomerName(res.data[0].name)
      } else {
        setCustomer(null)
        setCustomerError('مشتری یافت نشد. لطفا نام را برای افزودن وارد کنید.')
      }
    } catch (e) {
      console.log("Error searching customer", e)
      setCustomerError('خطا در جستجوی مشتری')
    }
    setCustomerSearchLoading(false)
  }

  const handleAddCustomer = async () => {
    setCustomerError('')
    try {
      const res = await api.post('/customers', { 
        name: customerName, 
        phone: toEnglishDigits(customerPhone),
        ...(customerSex && { sex: customerSex })
      })
      setCustomer(res.data)
    } catch (e: any) {
      const errorMessage = e.response?.data?.message
      if (Array.isArray(errorMessage)) {
        setCustomerError(errorMessage.join(' | '))
      } else if (errorMessage) {
        setCustomerError(errorMessage)
      } else {
        setCustomerError('خطا در افزودن مشتری')
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl m-4 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
          <h2 className="text-xl font-bold">صورتحساب</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Customer Search/Add */}
            <div className="bg-gray-50 rounded-xl p-4">
            <label className="block text-sm font-bold text-gray-700 mb-3">شماره تلفن مشتری</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                className="flex-1 border-0 px-4 py-3 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                placeholder="09123456789"
                dir="ltr"
              />
              <Button 
                type="button" 
                onClick={handleCustomerSearch} 
                disabled={customerSearchLoading}
                className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white rounded-xl px-4"
              >
                {customerSearchLoading ? 'جستجو...' : 'جستجو'}
              </Button>
            </div>
            {customer ? (
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl text-green-700">
                <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {customer.name.charAt(0)}
                </div>
                {isEditingName ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={editedName}
                      onChange={e => setEditedName(e.target.value)}
                      className="flex-1 border-0 px-3 py-2 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none text-gray-800"
                      placeholder="نام جدید"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={async () => {
                        try {
                          await api.patch(`/customers/${customer.id}`, { name: editedName })
                          setCustomer({ ...customer, name: editedName })
                          setIsEditingName(false)
                          toast.success('نام مشتری بروزرسانی شد')
                        } catch (e: any) {
                          const msg = e.response?.data?.message
                          toast.error(Array.isArray(msg) ? msg.join(' | ') : msg || 'خطا در بروزرسانی')
                        }
                      }}
                      disabled={!editedName.trim()}
                      className="bg-green-500 hover:bg-green-600 text-white rounded-lg p-2 h-8 w-8"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 flex-1">
                    <span className="font-medium">مشتری: {customer.name}</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditedName(customer.name)
                        setIsEditingName(true)
                      }}
                      className="p-1 h-7 w-7 rounded-full hover:bg-green-100"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            ) : customerError ? (
              <div className="p-3 bg-amber-50 rounded-xl text-amber-700 text-sm">{customerError}</div>
            ) : null}
            {!customer && customerError && (
              <div className="flex gap-2 mt-3 flex-wrap">
                <input
                  type="text"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="flex-1 min-w-[120px] border-0 px-4 py-3 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                  placeholder="نام مشتری را وارد کنید"
                />
                <select
                  value={customerSex}
                  onChange={e => setCustomerSex(e.target.value as 'MALE' | 'FEMALE' | 'OTHER' | '')}
                  className="border-0 px-4 py-3 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none text-gray-700"
                >
                  <option value="">جنسیت</option>
                  <option value="MALE">مرد</option>
                  <option value="FEMALE">زن</option>
                  <option value="OTHER">دیگر</option>
                </select>
                <Button 
                  type="button" 
                  onClick={handleAddCustomer} 
                  disabled={!customerName}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl px-4"
                >
                  افزودن
                </Button>
              </div>
            )}
          </div>

          {/* Gift Section - Pay It Forward - Only show when customer is selected */}
          {customer && (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span>🎁</span>
                <span>هدیه</span>
              </h3>
              <GiftCheckoutPanel 
                onGiftMetadataChange={setGiftMetadata}
                customerName={customer?.name}
              />
            </div>
          )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-4">
            <h3 className="font-bold text-gray-800 mb-4">خلاصه سفارش</h3>
            <div className="space-y-3 text-sm max-h-40 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <span className="text-gray-600">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full text-xs font-bold ml-2">
                      {item.quantity}
                    </span>
                    {item.product.name}
                  </span>
                  <span className="font-medium text-gray-800">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">جمع کل:</span>
                <span className="font-medium text-gray-800">{formatCurrency(subtotal)}</span>
              </div>
              {appliedDiscount && (
                <div className="flex justify-between items-center text-sm text-green-600">
                  <span className="flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    تخفیف ({appliedDiscount.code}):
                  </span>
                  <span className="font-medium">-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              {giftDiscount > 0 && (
                <div className="flex justify-between items-center text-sm text-purple-600">
                  <span className="flex items-center gap-1">
                    🎁 هدایا ({giftMetadata?.selectedGiftIds?.length}):
                  </span>
                  <span className="font-medium">-{formatCurrency(giftDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-lg font-bold text-gray-800">مبلغ نهایی:</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{formatCurrency(finalTotal)}</span>
              </div>
            </div>
          </div>

          {/* Discount Code */}
          <div className="bg-purple-50 rounded-xl p-4">
            <label className="block text-sm font-bold text-gray-700 mb-3">کد تخفیف</label>
            {appliedDiscount ? (
              <div className="flex items-center justify-between p-3 bg-green-100 rounded-xl">
                <div className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-green-600" />
                  <div>
                    <span className="font-bold text-green-700">{appliedDiscount.code}</span>
                    <span className="text-green-600 text-sm mr-2">
                      ({appliedDiscount.type === 'PERCENTAGE' ? `${appliedDiscount.value}٪` : formatCurrency(appliedDiscount.value)} تخفیف)
                    </span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveDiscount}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                    placeholder="کد تخفیف را وارد کنید"
                    className="flex-1 border-0 px-4 py-3 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-purple-500 focus:outline-none font-mono"
                    dir="ltr"
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyDiscount()}
                  />
                  <Button
                    type="button"
                    onClick={handleApplyDiscount}
                    disabled={discountLoading || !discountCode.trim()}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl px-4"
                  >
                    {discountLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'اعمال'}
                  </Button>
                </div>
                {discountError && (
                  <p className="mt-2 text-sm text-red-600">{discountError}</p>
                )}
              </>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <h3 className="font-bold text-gray-800 mb-3">روش پرداخت</h3>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setPaymentMethod('CASH')}
                className={`flex flex-col items-center p-4 rounded-xl transition-all ${
                  paymentMethod === 'CASH' 
                    ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg scale-105' 
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Banknote className="h-6 w-6 mb-2" />
                <span className="text-xs font-medium">نقدی</span>
              </button>
              <button
                onClick={() => setPaymentMethod('CARD')}
                className={`flex flex-col items-center p-4 rounded-xl transition-all ${
                  paymentMethod === 'CARD' 
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-lg scale-105' 
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <CreditCard className="h-6 w-6 mb-2" />
                <span className="text-xs font-medium">کارت به کارت</span>
              </button>
              <button
                onClick={() => setPaymentMethod('DIGITAL')}
                className={`flex flex-col items-center p-4 rounded-xl transition-all ${
                  paymentMethod === 'DIGITAL' 
                    ? 'bg-gradient-to-br from-violet-500 to-purple-500 text-white shadow-lg scale-105' 
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Smartphone className="h-6 w-6 mb-2" />
                <span className="text-xs font-medium">دستگاه پوز</span>
              </button>
            </div>
          </div>
          </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 space-y-3">
          <Button
            onClick={handlePayment}
            disabled={!canProcess || isProcessing}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl py-6 text-lg font-bold shadow-lg disabled:opacity-50"
            size="lg"
          >
            {isProcessing ? 'در حال پردازش...' : `انجام پرداخت (${formatCurrency(finalTotal)})`}
          </Button>

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="flex-1 rounded-xl border-gray-200 hover:bg-gray-100"
            >
              لغو
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 rounded-xl border-gray-200 hover:bg-gray-100"
            >
              <Printer className="h-4 w-4 ml-2" />
              چاپ رسید
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
