import { z } from 'zod'

// ----- Constantes (AJUSTA si tus ENUMs en Postgres difieren) ---------
export const SALE_CHANNELS    = ['TIENDA', 'ONLINE']                                                as const
export const ORDER_STATUSES   = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'] as const
export const PAYMENT_STATUSES = ['PENDING', 'PAID', 'REFUNDED', 'FAILED']                            as const
export const PAYMENT_METHODS  = ['CASH', 'CARD', 'TRANSFER', 'REDSYS']                               as const
export const DELIVERY_TYPES   = ['PICKUP', 'SHIPPING']                                               as const

export const ORDER_STATUS_LABELS: Record<typeof ORDER_STATUSES[number], string> = {
  PENDING:    'Pendiente',
  CONFIRMED:  'Confirmada',
  PREPARING:  'En preparación',
  READY:      'Lista',
  DELIVERED:  'Entregada',
  CANCELLED:  'Cancelada',
}

export const PAYMENT_STATUS_LABELS: Record<typeof PAYMENT_STATUSES[number], string> = {
  PENDING:  'Pendiente',
  PAID:     'Pagado',
  REFUNDED: 'Reembolsado',
  FAILED:   'Fallido',
}

export const PAYMENT_METHOD_LABELS: Record<typeof PAYMENT_METHODS[number], string> = {
  CASH:     'Efectivo',
  CARD:     'Tarjeta',
  TRANSFER: 'Transferencia',
  REDSYS:   'Redsys (online)',
}

export const DELIVERY_TYPE_LABELS: Record<typeof DELIVERY_TYPES[number], string> = {
  PICKUP:   'Recogida',
  SHIPPING: 'Envío',
}

// ----- Schemas --------------------------------------------------------
export const SaleItemSchema = z.object({
  product_id:          z.string().uuid('Producto inválido'),
  product_name:        z.string().min(1, 'Falta el nombre del producto'),
  quantity:            z.number().positive('La cantidad debe ser mayor que 0').nullable(),
  estimated_quantity:  z.number().positive().nullable().optional(),
  unit_price:          z.number().min(0, 'Precio inválido'),
  total:               z.number().min(0),
  notes:               z.string().nullable().optional(),
})

export const SaleSchema = z.object({
  sale_channel:   z.enum(SALE_CHANNELS),
  delivery_type:  z.enum(DELIVERY_TYPES),
  payment_method: z.enum(PAYMENT_METHODS),
  payment_status: z.enum(PAYMENT_STATUSES),
  order_status:   z.enum(ORDER_STATUSES),
  guest_name:     z.string().nullable().optional(),
  guest_phone:    z.string().nullable().optional(),
  guest_email:    z.union([z.string().email('Email inválido'), z.literal(''), z.null()]).optional(),
  notes:          z.string().nullable().optional(),
  discount:       z.number().min(0),
  shipping_cost:  z.number().min(0),
  items:          z.array(SaleItemSchema).min(1, 'Añade al menos un producto'),
})

export type SaleInput     = z.infer<typeof SaleSchema>
export type SaleItemInput = z.infer<typeof SaleItemSchema>

// ----- Checkout online (cliente público) -----------------------------
export const OnlineOrderItemSchema = z.object({
  product_id: z.string().uuid('Producto inválido'),
  quantity:   z.number().positive('La cantidad debe ser mayor que 0'),
  notes:      z.string().max(300).optional().nullable(),
})

export const OnlineOrderSchema = z.object({
  guest_name:   z.string().min(2, 'Nombre obligatorio').max(120),
  guest_phone:  z.string().min(6, 'Teléfono obligatorio').max(30),
  guest_email:  z.string().email('Email inválido').min(1, 'Email obligatorio').max(120),
  notes:        z.string().max(500).optional().nullable(),
  items:        z.array(OnlineOrderItemSchema).min(1, 'El carrito está vacío'),
  is_delivery:  z.boolean().optional(),
  delivery_address: z.object({
    address: z.string().min(1, 'Dirección obligatoria'),
    city: z.string().min(1, 'Ciudad obligatoria'),
    postal_code: z.string().min(1, 'Código postal obligatorio'),
    province: z.string().min(1, 'Provincia obligatoria'),
  }).optional().nullable(),
})

export type OnlineOrderInput     = z.infer<typeof OnlineOrderSchema>
export type OnlineOrderItemInput = z.infer<typeof OnlineOrderItemSchema>
