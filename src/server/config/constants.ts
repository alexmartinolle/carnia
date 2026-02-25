/**
 * Constantes de negocio de la aplicación
 */

export const BUSINESS_RULES = {
  // Segmentación de clientes
  CUSTOMER: {
    VIP_THRESHOLD: 1000, // €1000 gastados
    REGULAR_MIN_ORDERS: 3,
    INACTIVE_DAYS: 90,
  },

  // Stock
  STOCK: {
    LOW_STOCK_MULTIPLIER: 0.5, // 50% del mínimo
    CRITICAL_STOCK_MULTIPLIER: 0.25, // 25% del mínimo
    SUGGESTED_REORDER_MULTIPLIER: 1.5,
  },

  // Pedidos
  ORDER: {
    MAX_ITEMS: 50,
    URGENT_HOURS_THRESHOLD: 2,
  },

  // Ventas
  SALE: {
    MAX_ITEMS: 50,
  },

  // Validaciones
  VALIDATION: {
    MIN_NAME_LENGTH: 2,
    MAX_NAME_LENGTH: 200,
    MAX_DESCRIPTION_LENGTH: 1000,
    MAX_NOTES_LENGTH: 500,
  },
} as const

export const ORDER_STATUS_TRANSITIONS: Record <
  string,
  readonly string[]
> = {
  new: ['confirmed', 'cancelled'],
  confirmed: ['ready', 'cancelled'],
  ready: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
} as const

export const VALID_ORDER_STATUSES = [
  'new',
  'confirmed',
  'ready',
  'completed',
  'cancelled',
] as const

export const VALID_ORDER_CHANNELS = ['whatsapp', 'web', 'store'] as const

export const VALID_PAYMENT_METHODS = [
  'cash',
  'card',
  'transfer',
  'bizum',
] as const

export const VALID_CUSTOMER_SEGMENTS = [
  'vip',
  'regular',
  'new',
  'inactive',
] as const

export const VALID_MOVEMENT_TYPES = ['in', 'out', 'adjustment'] as const

export const VALID_MOVEMENT_REASONS = [
  'purchase',
  'sale',
  'waste',
  'correction',
  'other',
] as const