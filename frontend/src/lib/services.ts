import { api } from './api'

// Types
export interface Product {
  id: string
  name: string
  description: string
  price: number
  cost: number
  stock: number
  lowStockAlert: number
  categoryId: string
  category: { name: string; color: string }
  isAvailable: boolean
}

export interface Category {
  id: string
  name: string
  description?: string
  color: string
  isActive: boolean
  productCount?: number
}

export interface Customer {
  id: string
  name: string
  phone: string
  email?: string
  loyaltyPoints?: number
}

export interface Sale {
  id: string
  receiptNumber: string
  customer?: Customer
  totalAmount: number
  subtotal: number
  taxAmount: number
  discountAmount: number
  paymentMethod: 'CASH' | 'CARD' | 'DIGITAL'
  status: 'COMPLETED' | 'REFUNDED' | 'CANCELLED' | 'PENDING'
  cashReceived?: number
  changeGiven?: number
  items: Array<{
    id: string
    product: { name: string; price: number }
    quantity: number
    unitPrice: number
    totalAmount: number
  }>
  createdAt: string
}

export interface Campaign {
  id: string
  name: string
  description?: string
  type: 'PERCENTAGE_DISCOUNT' | 'FIXED_DISCOUNT' | 'BUY_ONE_GET_ONE' | 'LOYALTY_BONUS' | 'BIRTHDAY_SPECIAL' | 'SEASONAL' | 'NEW_CUSTOMER' | 'RETURN_CUSTOMER'
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED'
  startDate: string
  endDate: string
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT'
  discountValue: number
  minPurchase?: number
  maxDiscount?: number
  usageLimit?: number
  usageCount: number
  targetTier?: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM'
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface DiscountCode {
  id: string
  code: string
  name?: string
  description?: string
  type: 'PERCENTAGE' | 'FIXED_AMOUNT'
  value: number
  minPurchase?: number
  maxDiscount?: number
  usageLimit?: number
  usageCount: number
  customerId?: string
  expiresAt?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface LoyaltyTransaction {
  id: string
  customerId: string
  type: 'EARNED' | 'REDEEMED' | 'EXPIRED' | 'BONUS' | 'ADJUSTMENT'
  points: number
  description?: string
  saleId?: string
  createdAt: string
}

// Product Services
export const productService = {
  async getAll(): Promise<Product[]> {
    const response = await api.get('/products')
    return response.data
  },

  async getById(id: string): Promise<Product> {
    const response = await api.get(`/products/${id}`)
    return response.data
  },

  async create(product: Omit<Product, 'id' | 'category'>): Promise<Product> {
    const response = await api.post('/products', product)
    return response.data
  },

  async update(id: string, product: Partial<Product>): Promise<Product> {
    const response = await api.put(`/products/${id}`, product)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/products/${id}`)
  },

  async updateStock(id: string, stock: number): Promise<Product> {
    const response = await api.patch(`/products/${id}/stock`, { stock })
    return response.data
  }
}

// Category Services
export const categoryService = {
  async getAll(): Promise<Category[]> {
    const response = await api.get('/categories')
    return response.data
  },

  async getById(id: string): Promise<Category> {
    const response = await api.get(`/categories/${id}`)
    return response.data
  },

  async create(category: Omit<Category, 'id' | 'productCount'>): Promise<Category> {
    const response = await api.post('/categories', category)
    return response.data
  },

  async update(id: string, category: Partial<Category>): Promise<Category> {
    const response = await api.put(`/categories/${id}`, category)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/categories/${id}`)
  }
}

// Customer Services
export const customerService = {
  async getAll(): Promise<Customer[]> {
    const response = await api.get('/customers')
    return response.data
  },

  async getById(id: string): Promise<Customer> {
    const response = await api.get(`/customers/${id}`)
    return response.data
  },

  async create(customer: Omit<Customer, 'id'>): Promise<Customer> {
    const response = await api.post('/customers', customer)
    return response.data
  },

  async update(id: string, customer: Partial<Customer>): Promise<Customer> {
    const response = await api.put(`/customers/${id}`, customer)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/customers/${id}`)
  }
}

// Sales Services
export const salesService = {
  async getAll(): Promise<Sale[]> {
    const response = await api.get('/sales')
    return response.data
  },

  async getById(id: string): Promise<Sale> {
    const response = await api.get(`/sales/${id}`)
    return response.data
  },

  async create(sale: Omit<Sale, 'id' | 'receiptNumber' | 'createdAt'>): Promise<Sale> {
    const response = await api.post('/sales', sale)
    return response.data
  },

  async updateStatus(id: string, status: Sale['status']): Promise<Sale> {
    const response = await api.patch(`/sales/${id}/status`, { status })
    return response.data
  },

  async getTodaysStats(): Promise<{
    totalSales: number
    totalOrders: number
    averageOrderValue: number
  }> {
    const response = await api.get('/sales/stats/today')
    return response.data
  }
}

// Analytics Services
export const analyticsService = {
  async getDashboardStats(): Promise<{
    todaySales: number
    todayOrders: number
    monthSales: number
    monthOrders: number
    totalProducts: number
    lowStockProducts: number
    recentSales: Sale[]
  }> {
    const response = await api.get('/analytics/dashboard')
    return response.data
  },

  async getSalesAnalytics(period: 'today' | 'week' | 'month'): Promise<any> {
    const response = await api.get(`/analytics/sales/${period}`)
    return response.data
  }
}

// Campaign Services
export const campaignService = {
  async getAll(): Promise<Campaign[]> {
    const response = await api.get('/campaigns')
    return response.data
  },

  async getById(id: string): Promise<Campaign> {
    const response = await api.get(`/campaigns/${id}`)
    return response.data
  },

  async getActive(customerId?: string, productIds?: string[]): Promise<Campaign[]> {
    const params = new URLSearchParams()
    if (customerId) params.append('customerId', customerId)
    if (productIds?.length) params.append('productIds', productIds.join(','))

    const response = await api.get(`/campaigns/active?${params}`)
    return response.data
  },

  async getRecommended(customerId: string): Promise<Campaign[]> {
    const response = await api.get(`/campaigns/recommendations/${customerId}`)
    return response.data
  },

  async create(campaign: Omit<Campaign, 'id' | 'usageCount' | 'createdAt' | 'updatedAt'>): Promise<Campaign> {
    const response = await api.post('/campaigns', campaign)
    return response.data
  },

  async update(id: string, campaign: Partial<Campaign>): Promise<Campaign> {
    const response = await api.put(`/campaigns/${id}`, campaign)
    return response.data
  },

  async activate(id: string): Promise<Campaign> {
    const response = await api.patch(`/campaigns/${id}/activate`)
    return response.data
  },

  async pause(id: string): Promise<Campaign> {
    const response = await api.patch(`/campaigns/${id}/pause`)
    return response.data
  },

  async applyCampaign(campaignId: string, customerId: string, subtotal: number, productIds?: string[]): Promise<any> {
    const response = await api.post(`/campaigns/${campaignId}/apply`, {
      customerId,
      subtotal,
      productIds
    })
    return response.data
  },

  async getAnalytics(id: string): Promise<any> {
    const response = await api.get(`/campaigns/${id}/analytics`)
    return response.data
  },

  async createAutomatic(): Promise<any> {
    const response = await api.post('/campaigns/automatic')
    return response.data
  }
}

// Discount Code Services
export const discountCodeService = {
  async getAll(customerId?: string): Promise<DiscountCode[]> {
    const params = customerId ? `?customerId=${customerId}` : ''
    const response = await api.get(`/discounts/codes/all${params}`)
    return response.data
  },

  async create(discountCode: Omit<DiscountCode, 'id' | 'usageCount' | 'createdAt' | 'updatedAt'>): Promise<DiscountCode> {
    const response = await api.post('/discounts/codes', discountCode)
    return response.data
  },

  async validate(code: string, customerId?: string, subtotal?: number): Promise<DiscountCode> {
    const params = new URLSearchParams()
    if (customerId) params.append('customerId', customerId)
    if (subtotal) params.append('subtotal', subtotal.toString())

    const response = await api.get(`/discounts/codes/${code}/validate?${params}`)
    return response.data
  },

  async apply(code: string, subtotal: number, customerId?: string): Promise<any> {
    const response = await api.post(`/discounts/codes/${code}/apply`, {
      subtotal,
      customerId
    })
    return response.data
  },

  async use(code: string): Promise<void> {
    await api.post(`/discounts/codes/${code}/use`)
  },

  async generatePersonalized(customerId: string, count: number = 1): Promise<DiscountCode[]> {
    const response = await api.post(`/discounts/codes/personalized/${customerId}`, { count })
    return response.data
  },

  async createBulk(data: {
    prefix: string
    count: number
    type: 'PERCENTAGE' | 'FIXED_AMOUNT'
    value: number
    minPurchase?: number
    maxDiscount?: number
    usageLimit?: number
    expiresAt?: string
  }): Promise<DiscountCode[]> {
    const response = await api.post('/discounts/codes/bulk', data)
    return response.data
  },

  async getCustomerHistory(customerId: string): Promise<any> {
    const response = await api.get(`/discounts/codes/customer/${customerId}/history`)
    return response.data
  },

  async getStats(): Promise<any> {
    const response = await api.get('/discounts/stats')
    return response.data
  },

  async cleanupExpired(): Promise<any> {
    const response = await api.post('/discounts/codes/cleanup')
    return response.data
  }
}

// Purchases Services
export const purchasesService = {
  async getAll(): Promise<any[]> {
    const response = await api.get('/purchases')
    return response.data
  },

  async getById(id: string): Promise<any> {
    const response = await api.get(`/purchases/${id}`)
    return response.data
  },

  async create(purchase: any): Promise<any> {
    const response = await api.post('/purchases', purchase)
    return response.data
  },

  async update(id: string, purchase: any): Promise<any> {
    const response = await api.patch(`/purchases/${id}`, purchase)
    return response.data
  },

  async markAsReceived(id: string): Promise<any> {
    const response = await api.post(`/purchases/${id}/receive`)
    return response.data
  },

  async cancel(id: string, reason?: string): Promise<any> {
    const response = await api.post(`/purchases/${id}/cancel`, { reason })
    return response.data
  },

  async getStats(): Promise<any> {
    const response = await api.get('/purchases/stats')
    return response.data
  }
}

// Loyalty Services
export const loyaltyService = {
  async getCustomerLoyalty(customerId: string): Promise<any> {
    const response = await api.get(`/loyalty/customer/${customerId}`)
    return response.data
  },

  async getLoyaltyHistory(customerId: string): Promise<any> {
    const response = await api.get(`/loyalty/customer/${customerId}/history`)
    return response.data
  },

  async addPoints(customerId: string, data: {
    points: number
    type: 'EARNED' | 'REDEEMED' | 'EXPIRED' | 'BONUS' | 'ADJUSTMENT'
    description?: string
    saleId?: string
  }): Promise<any> {
    const response = await api.post(`/loyalty/customer/${customerId}/points`, data)
    return response.data
  },

  async redeemPoints(customerId: string, points: number): Promise<any> {
    const response = await api.post(`/loyalty/customer/${customerId}/redeem`, { points })
    return response.data
  },

  async awardBonus(customerId: string, points: number, reason: string): Promise<any> {
    const response = await api.post(`/loyalty/customer/${customerId}/bonus`, { points, reason })
    return response.data
  },

  async updateTier(customerId: string, totalSpent: number): Promise<any> {
    const response = await api.patch(`/loyalty/customer/${customerId}/tier`, { totalSpent })
    return response.data
  },

  async getStats(): Promise<any> {
    const response = await api.get('/loyalty/stats')
    return response.data
  },

  async calculatePoints(customerId: string, amount: number): Promise<number> {
    const response = await api.post('/loyalty/calculate-points', { customerId, amount })
    return response.data
  }
}
