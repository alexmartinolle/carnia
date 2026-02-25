import type { Database } from './database.types'

// ========================================
// TIPOS BASE DE TABLAS
// ========================================

export type Category = Database['public']['Tables']['categories']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type Customer = Database['public']['Tables']['customers']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type OrderItem = Database['public']['Tables']['order_items']['Row']
export type Sale = Database['public']['Tables']['sales']['Row']
export type SaleItem = Database['public']['Tables']['sales_items']['Row']
export type InventoryMovement = Database['public']['Tables']['inventory_movements']['Row']

// ========================================
// TIPOS PARA INSERTS
// ========================================

export type CategoryInsert = Database['public']['Tables']['categories']['Insert']
export type ProductInsert = Database['public']['Tables']['products']['Insert']
export type CustomerInsert = Database['public']['Tables']['customers']['Insert']
export type OrderInsert = Database['public']['Tables']['orders']['Insert']
export type OrderItemInsert = Database['public']['Tables']['order_items']['Insert']
export type SaleInsert = Database['public']['Tables']['sales']['Insert']
export type SaleItemInsert = Database['public']['Tables']['sales_items']['Insert']
export type InventoryMovementInsert = Database['public']['Tables']['inventory_movements']['Insert']

// ========================================
// TIPOS PARA UPDATES
// ========================================

export type CategoryUpdate = Database['public']['Tables']['categories']['Update']
export type ProductUpdate = Database['public']['Tables']['products']['Update']
export type CustomerUpdate = Database['public']['Tables']['customers']['Update']
export type OrderUpdate = Database['public']['Tables']['orders']['Update']

// ========================================
// TIPOS CON RELACIONES
// ========================================

export type ProductWithCategory = Product & {
  category: Category
}

export type OrderWithDetails = Order & {
  customer: Customer
  items: Array<OrderItem & { product: Product }>
}

export type SaleWithDetails = Sale & {
  customer: Customer | null
  items: Array<SaleItem & { product: Product }>
}

export type InventoryMovementWithProduct = InventoryMovement & {
  product: ProductWithCategory
}

// ========================================
// ENUMS
// ========================================

export type OrderStatus = 'new' | 'confirmed' | 'ready' | 'completed' | 'cancelled'
export type OrderChannel = 'whatsapp' | 'web' | 'store'
export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'bizum'
export type CustomerSegment = 'vip' | 'regular' | 'new' | 'inactive'
export type MovementType = 'in' | 'out' | 'adjustment'
export type MovementReason = 'purchase' | 'sale' | 'waste' | 'correction' | 'other'
export type StockStatus = 'ok' | 'low' | 'critical' | 'out'
export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical'

// ========================================
// TIPOS DE FILTROS
// ========================================

export interface ProductFilters {
  categoryId?: string
  isActive?: boolean
  search?: string
  hasLowStock?: boolean
  priceMin?: number
  priceMax?: number
}

export interface OrderFilters {
  status?: OrderStatus
  customerId?: string
  dateFrom?: Date
  dateTo?: Date
  channel?: OrderChannel
  minAmount?: number
  maxAmount?: number
}

export interface CustomerFilters {
  segment?: CustomerSegment
  search?: string
  hasOrders?: boolean
  inactiveSince?: Date
}

export interface SaleFilters {
  dateFrom?: Date
  dateTo?: Date
  paymentMethod?: PaymentMethod
  customerId?: string
  minAmount?: number
  maxAmount?: number
}

export interface InventoryFilters {
  productId?: string
  type?: MovementType
  reason?: MovementReason
  dateFrom?: Date
  dateTo?: Date
}

// ========================================
// TIPOS DE RESPUESTA
// ========================================

export interface ProductWithStock extends Product {
  stockStatus: StockStatus
  needsRestock: boolean
  daysOfStock: number | null
}

export interface LowStockProduct extends Product {
  urgencyLevel: UrgencyLevel
  suggestedOrderQty: number
  stockDeficit: number
}

export interface CustomerMetrics {
  customer: Customer
  avgOrderValue: number
  daysSinceLastOrder: number | null
  lifetimeValue: number
  frequency: number
}

export interface DashboardStats {
  today: {
    sales: number
    revenue: number
    orders: number
    averageTicket: number
  }
  comparison: {
    salesChange: number
    revenueChange: number
    ordersChange: number
  }
  alerts: {
    lowStockCount: number
    outOfStockCount: number
    pendingOrdersCount: number
    urgentOrdersCount: number
  }
}

export interface SalesMetrics {
  period: {
    from: Date
    to: Date
  }
  totals: {
    revenue: number
    transactions: number
    averageTicket: number
    itemsSold: number
  }
  breakdown: {
    byCategory: Array<{
      categoryId: string
      categoryName: string
      revenue: number
      quantity: number
      percentage: number
    }>
    byPaymentMethod: Array<{
      method: PaymentMethod
      count: number
      total: number
      percentage: number
    }>
    byDay: Array<{
      date: string
      revenue: number
      transactions: number
    }>
  }
}

export interface InventoryReport {
  summary: {
    totalValue: number
    totalProducts: number
    lowStockProducts: number
    outOfStockProducts: number
  }
  byCategory: Array<{
    categoryId: string
    categoryName: string
    productCount: number
    totalValue: number
  }>
  lowStock: LowStockProduct[]
  outOfStock: Product[]
}

// ========================================
// TIPOS DE PAGINACIÓN
// ========================================

export interface PaginationParams {
  page: number
  pageSize: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    pageSize: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}