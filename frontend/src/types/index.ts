export interface Product {
  id: string
  name: string
  description?: string
  price: number
  category_id: string
  image_url?: string
  is_available: boolean
  created_at: Date
  updated_at: Date
}

export interface Category {
  id: string
  name: string
  description?: string
  color: string
  created_at: Date
  updated_at: Date
}

export interface CartItem {
  id: string
  product: Product
  quantity: number
  price: number
  discount?: number
  notes?: string
}

export interface Sale {
  id: string
  total_amount: number
  discount_amount: number
  tax_amount: number
  payment_method: 'cash' | 'card' | 'digital'
  status: 'completed' | 'cancelled' | 'pending'
  items: SaleItem[]
  created_at: Date
  updated_at: Date
}

export interface SaleItem {
  id: string
  sale_id: string
  product_id: string
  quantity: number
  unit_price: number
  discount_amount: number
  total_amount: number
}

export interface Purchase {
  id: string
  supplier_name: string
  total_amount: number
  status: 'pending' | 'received' | 'cancelled'
  items: PurchaseItem[]
  created_at: Date
  updated_at: Date
}

export interface PurchaseItem {
  id: string
  purchase_id: string
  product_name: string
  quantity: number
  unit_cost: number
  total_cost: number
}

export interface DashboardStats {
  todaySales: number
  todayOrders: number
  totalRevenue: number
  topProducts: Array<{
    product: Product
    quantity: number
    revenue: number
  }>
  salesByHour: Array<{
    hour: number
    sales: number
    orders: number
  }>
  recentSales: Sale[]
}

export interface Discount {
  id: string
  name: string
  type: 'percentage' | 'fixed'
  value: number
  min_amount?: number
  is_active: boolean
  start_date?: Date
  end_date?: Date
}
