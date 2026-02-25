import { z } from 'zod'
import { uuidSchema, quantitySchema } from './common.validators'

export const registerMovementSchema = z.object({
  product_id: uuidSchema,
  type: z.enum(['in', 'out', 'adjustment']),
  quantity: quantitySchema,
  reason: z.enum(['purchase', 'sale', 'waste', 'correction', 'other']),
  notes: z.string().max(500).optional(),
})

export const inventoryFiltersSchema = z.object({
  productId: uuidSchema.optional(),
  type: z.enum(['in', 'out', 'adjustment']).optional(),
  reason: z.enum(['purchase', 'sale', 'waste', 'correction', 'other']).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
})

export type RegisterMovementInput = z.infer<typeof registerMovementSchema>
export type InventoryFilters = z.infer<typeof inventoryFiltersSchema>