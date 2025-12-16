'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Tag, 
  Calendar, 
  Percent, 
  DollarSign,
  Search,
  X,
  Check,
  Package,
  Users,
  Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { DiscountCode, Product } from '@/types'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import { format, parse } from 'date-fns-jalali'
import { faIR } from 'date-fns-jalali/locale'

// Helper functions for Jalali date conversion
const toJalaliString = (date: Date | string | null): string => {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return ''
  return format(d, 'yyyy/MM/dd', { locale: faIR })
}

const fromJalaliString = (jalaliDate: string): Date | null => {
  if (!jalaliDate) return null
  try {
    return parse(jalaliDate, 'yyyy/MM/dd', new Date(), { locale: faIR })
  } catch {
    return null
  }
}

interface DiscountFormData {
  code: string
  name: string
  description: string
  type: 'PERCENTAGE' | 'FIXED'
  value: number
  minPurchase: number | null
  maxDiscount: number | null
  usageLimit: number | null
  startsAt: string
  expiresAt: string
  productIds: string[]
}

const initialFormData: DiscountFormData = {
  code: '',
  name: '',
  description: '',
  type: 'PERCENTAGE',
  value: 0,
  minPurchase: null,
  maxDiscount: null,
  usageLimit: null,
  startsAt: '',
  expiresAt: '',
  productIds: []
}

export default function DiscountsContent() {
  const [discounts, setDiscounts] = useState<DiscountCode[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingDiscount, setEditingDiscount] = useState<DiscountCode | null>(null)
  const [formData, setFormData] = useState<DiscountFormData>(initialFormData)
  const [searchTerm, setSearchTerm] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchDiscounts()
    fetchProducts()
  }, [])

  const fetchDiscounts = async () => {
    try {
      setLoading(true)
      const response = await api.get('/discounts')
      setDiscounts(response.data)
    } catch (error) {
      console.error('Error fetching discounts:', error)
      toast.error('خطا در بارگذاری تخفیف‌ها')
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products')
      setProducts(response.data)
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const handleOpenModal = (discount?: DiscountCode) => {
    if (discount) {
      setEditingDiscount(discount)
      setFormData({
        code: discount.code,
        name: discount.name || '',
        description: discount.description || '',
        type: discount.type,
        value: discount.value,
        minPurchase: discount.minPurchase || null,
        maxDiscount: discount.maxDiscount || null,
        usageLimit: discount.usageLimit || null,
        startsAt: toJalaliString(discount.startsAt || null),
        expiresAt: toJalaliString(discount.expiresAt || null),
        productIds: discount.products?.map(p => p.id) || []
      })
    } else {
      setEditingDiscount(null)
      setFormData(initialFormData)
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingDiscount(null)
    setFormData(initialFormData)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Convert Jalali dates to Gregorian
      const startsAtDate = fromJalaliString(formData.startsAt)
      const expiresAtDate = fromJalaliString(formData.expiresAt)

      const payload = {
        ...formData,
        code: formData.code || undefined,
        minPurchase: formData.minPurchase || undefined,
        maxDiscount: formData.maxDiscount || undefined,
        usageLimit: formData.usageLimit || undefined,
        startsAt: startsAtDate ? startsAtDate.toISOString() : undefined,
        expiresAt: expiresAtDate ? expiresAtDate.toISOString() : undefined,
        productIds: formData.productIds.length > 0 ? formData.productIds : undefined
      }

      if (editingDiscount) {
        await api.put(`/discounts/${editingDiscount.id}`, payload)
        toast.success('تخفیف با موفقیت ویرایش شد')
      } else {
        await api.post('/discounts', payload)
        toast.success('تخفیف با موفقیت ایجاد شد')
      }

      handleCloseModal()
      fetchDiscounts()
    } catch (error: any) {
      const message = error.response?.data?.message || 'خطا در ذخیره تخفیف'
      toast.error(Array.isArray(message) ? message.join(' | ') : message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('آیا از حذف این تخفیف اطمینان دارید؟')) return

    try {
      await api.delete(`/discounts/${id}`)
      toast.success('تخفیف با موفقیت حذف شد')
      fetchDiscounts()
    } catch (error) {
      toast.error('خطا در حذف تخفیف')
    }
  }

  const handleToggleActive = async (discount: DiscountCode) => {
    try {
      await api.post(`/discounts/${discount.id}/toggle`)
      toast.success(discount.isActive ? 'تخفیف غیرفعال شد' : 'تخفیف فعال شد')
      fetchDiscounts()
    } catch (error) {
      toast.error('خطا در تغییر وضعیت تخفیف')
    }
  }

  const toggleProductSelection = (productId: string) => {
    setFormData(prev => ({
      ...prev,
      productIds: prev.productIds.includes(productId)
        ? prev.productIds.filter(id => id !== productId)
        : [...prev.productIds, productId]
    }))
  }

  const filteredDiscounts = discounts.filter(discount =>
    discount.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    discount.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const isExpired = (discount: DiscountCode) => {
    if (!discount.expiresAt) return false
    return new Date(discount.expiresAt) < new Date()
  }

  const isNotStarted = (discount: DiscountCode) => {
    if (!discount.startsAt) return false
    return new Date(discount.startsAt) > new Date()
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-slate-50 to-purple-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">مدیریت تخفیف‌ها</h1>
          <p className="text-gray-500 mt-1">کدهای تخفیف را ایجاد و مدیریت کنید</p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl px-6"
        >
          <Plus className="h-4 w-4 ml-2" />
          تخفیف جدید
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="جستجوی کد تخفیف..."
            className="w-full pr-10 pl-4 py-3 border-0 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">کل تخفیف‌ها</p>
                <p className="text-2xl font-bold">{discounts.length}</p>
              </div>
              <Tag className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">فعال</p>
                <p className="text-2xl font-bold">{discounts.filter(d => d.isActive && !isExpired(d)).length}</p>
              </div>
              <Check className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm">منقضی شده</p>
                <p className="text-2xl font-bold">{discounts.filter(d => isExpired(d)).length}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-200" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">کل استفاده</p>
                <p className="text-2xl font-bold">{discounts.reduce((sum, d) => sum + d.usageCount, 0)}</p>
              </div>
              <Users className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Discounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDiscounts.map((discount) => (
          <Card 
            key={discount.id} 
            className={`overflow-hidden transition-all hover:shadow-lg ${
              !discount.isActive || isExpired(discount) ? 'opacity-60' : ''
            }`}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    discount.type === 'PERCENTAGE' 
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
                      : 'bg-gradient-to-br from-green-500 to-emerald-500'
                  }`}>
                    {discount.type === 'PERCENTAGE' 
                      ? <Percent className="h-5 w-5 text-white" />
                      : <DollarSign className="h-5 w-5 text-white" />
                    }
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold font-mono">{discount.code}</CardTitle>
                    {discount.name && <p className="text-sm text-gray-500">{discount.name}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {isExpired(discount) && (
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">منقضی</span>
                  )}
                  {isNotStarted(discount) && (
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">آینده</span>
                  )}
                  {discount.isActive && !isExpired(discount) && !isNotStarted(discount) && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">فعال</span>
                  )}
                  {!discount.isActive && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">غیرفعال</span>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Discount Value */}
                <div className="text-2xl font-bold text-gray-800">
                  {discount.type === 'PERCENTAGE' 
                    ? `${discount.value}٪ تخفیف`
                    : formatCurrency(discount.value)
                  }
                </div>

                {/* Details */}
                <div className="space-y-1 text-sm text-gray-500">
                  {discount.minPurchase && (
                    <p>حداقل خرید: {formatCurrency(discount.minPurchase)}</p>
                  )}
                  {discount.maxDiscount && (
                    <p>حداکثر تخفیف: {formatCurrency(discount.maxDiscount)}</p>
                  )}
                  {discount.usageLimit && (
                    <p>استفاده: {discount.usageCount} / {discount.usageLimit}</p>
                  )}
                  {discount.productRestricted && (
                    <p className="flex items-center gap-1">
                      <Package className="h-3 w-3" />
                      محدود به {discount.products?.length || 0} محصول
                    </p>
                  )}
                </div>

                {/* Date Range */}
                {(discount.startsAt || discount.expiresAt) && (
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Calendar className="h-3 w-3" />
                    {discount.startsAt && toJalaliString(discount.startsAt)}
                    {discount.startsAt && discount.expiresAt && ' - '}
                    {discount.expiresAt && toJalaliString(discount.expiresAt)}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleActive(discount)}
                    className={discount.isActive ? 'text-amber-600 hover:text-amber-700' : 'text-green-600 hover:text-green-700'}
                  >
                    {discount.isActive ? 'غیرفعال کردن' : 'فعال کردن'}
                  </Button>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenModal(discount)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(discount.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDiscounts.length === 0 && (
        <div className="text-center py-12">
          <Tag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">هیچ تخفیفی یافت نشد</p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <h2 className="text-xl font-bold">
                {editingDiscount ? 'ویرایش تخفیف' : 'تخفیف جدید'}
              </h2>
              <Button variant="ghost" size="sm" onClick={handleCloseModal} className="text-white hover:bg-white/20">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">کد تخفیف</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="خودکار تولید می‌شود"
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none font-mono"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">نام تخفیف</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="مثال: تخفیف تابستانی"
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">توضیحات</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="توضیحات اختیاری..."
                  rows={2}
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
                />
              </div>

              {/* Type and Value */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">نوع تخفیف</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: 'PERCENTAGE' })}
                      className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
                        formData.type === 'PERCENTAGE'
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Percent className="h-4 w-4" />
                      درصدی
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: 'FIXED' })}
                      className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
                        formData.type === 'FIXED'
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <DollarSign className="h-4 w-4" />
                      مبلغ ثابت
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    مقدار تخفیف {formData.type === 'PERCENTAGE' ? '(٪)' : '(تومان)'}
                  </label>
                  <input
                    type="number"
                    value={formData.value || ''}
                    onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                    min="0"
                    max={formData.type === 'PERCENTAGE' ? 100 : undefined}
                    required
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Limits */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">حداقل خرید (تومان)</label>
                  <input
                    type="number"
                    value={formData.minPurchase || ''}
                    onChange={(e) => setFormData({ ...formData, minPurchase: parseFloat(e.target.value) || null })}
                    min="0"
                    placeholder="اختیاری"
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">حداکثر تخفیف (تومان)</label>
                  <input
                    type="number"
                    value={formData.maxDiscount || ''}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: parseFloat(e.target.value) || null })}
                    min="0"
                    placeholder="اختیاری"
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">محدودیت استفاده</label>
                  <input
                    type="number"
                    value={formData.usageLimit || ''}
                    onChange={(e) => setFormData({ ...formData, usageLimit: parseInt(e.target.value) || null })}
                    min="1"
                    placeholder="نامحدود"
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">تاریخ شروع (شمسی)</label>
                  <input
                    type="text"
                    value={formData.startsAt}
                    onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
                    placeholder="مثال: 1404/01/15"
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">تاریخ انقضا (شمسی)</label>
                  <input
                    type="text"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                    placeholder="مثال: 1404/06/31"
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Product Restrictions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  محدودیت محصولات (اختیاری)
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  اگر محصولی انتخاب نکنید، تخفیف برای همه محصولات اعمال می‌شود
                </p>
                <div className="max-h-40 overflow-y-auto border rounded-xl p-3 space-y-2">
                  {products.map((product) => (
                    <label
                      key={product.id}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${
                        formData.productIds.includes(product.id)
                          ? 'bg-purple-50 border border-purple-200'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.productIds.includes(product.id)}
                        onChange={() => toggleProductSelection(product.id)}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <span className="flex-1 text-sm">{product.name}</span>
                      <span className="text-xs text-gray-500">{formatCurrency(product.price)}</span>
                    </label>
                  ))}
                </div>
                {formData.productIds.length > 0 && (
                  <p className="text-sm text-purple-600 mt-2">
                    {formData.productIds.length} محصول انتخاب شده
                  </p>
                )}
              </div>
            </form>

            <div className="p-6 bg-gray-50 flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseModal}
                className="flex-1 rounded-xl"
              >
                انصراف
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting || formData.value <= 0}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl"
              >
                {submitting ? 'در حال ذخیره...' : editingDiscount ? 'ویرایش' : 'ایجاد تخفیف'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
