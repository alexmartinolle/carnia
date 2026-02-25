import { z } from 'zod'
import { uuidSchema, quantitySchema, priceSchema } from './common.validators'

export const saleItemSchema = z.object({
  product_id: uuidSchema,
  quantity: quantitySchema,
  unit_price: priceSchema,
})

export const createSaleSchema = z.object({
  payment_method: z.enum(['cash', 'card', 'transfer', 'bizum']),
  customer_id: uuidSchema.optional(),
  items: z
    .array(saleItemSchema)
    .min(1, 'Debe tener al menos 1 producto')
    .max(50, 'Máximo 50 productos'),
  notes: z.string().max(500).optional(),
})

export const saleFiltersSchema = z.object({
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  paymentMethod: z.enum(['cash', 'card', 'transfer', 'bizum']).optional(),
  customerId: uuidSchema.optional(),
  minAmount: priceSchema.optional(),
  maxAmount: priceSchema.optional(),
})

export const saleIdSchema = z.object({
  id: uuidSchema,
})

export type CreateSaleInput = z.infer<typeof createSaleSchema>
export type SaleFilters = z.infer<typeof saleFiltersSchema>
export type SaleItemInput = z.infer<typeof saleItemSchema>