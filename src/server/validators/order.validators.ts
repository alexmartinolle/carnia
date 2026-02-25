import { z } from 'zod'
import { uuidSchema, quantitySchema, priceSchema } from './common.validators'

export const orderItemSchema = z.object({
  product_id: uuidSchema,
  quantity: quantitySchema,
})

export const createOrderSchema = z.object({
  customer_id: uuidSchema,
  channel: z.enum(['whatsapp', 'web', 'store']),
  pickup_datetime: z.coerce.date().refine((date) => date > new Date(), {
    message: 'La fecha de recogida debe ser futura',
  }),
  notes: z.string().max(500).optional(),
  items: z
    .array(orderItemSchema)
    .min(1, 'Debe tener al menos 1 producto')
    .max(50, 'Máximo 50 productos'),
})

export const updateOrderStatusSchema = z.object({
  orderId: uuidSchema,
  status: z.enum(['new', 'confirmed', 'ready', 'completed', 'cancelled']),
  notes: z.string().max(500).optional(),
})

export const cancelOrderSchema = z.object({
  orderId: uuidSchema,
  reason: z.string().min(5, 'La razón debe tener al menos 5 caracteres').max(500),
})

export const orderFiltersSchema = z.object({
  status: z.enum(['new', 'confirmed', 'ready', 'completed', 'cancelled']).optional(),
  customerId: uuidSchema.optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  channel: z.enum(['whatsapp', 'web', 'store']).optional(),
  minAmount: priceSchema.optional(),
  maxAmount: priceSchema.optional(),
})

export const orderIdSchema = z.object({
  id: uuidSchema,
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>
export type OrderFilters = z.infer<typeof orderFiltersSchema>
export type OrderItemInput = z.infer<typeof orderItemSchema>