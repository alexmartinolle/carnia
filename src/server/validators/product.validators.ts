import { z } from 'zod'
import {
  uuidSchema,
  priceSchema,
  quantitySchema,
  nonNegativeNumberSchema,
} from './common.validators'

export const createProductSchema = z.object({
  name: z.string().min(2).max(200),
  category_id: uuidSchema,
  description: z.string().max(1000).optional(),
  price_per_unit: priceSchema,
  is_per_kg: z.boolean(),
  stock_quantity: quantitySchema,
  stock_minimum: nonNegativeNumberSchema.multipleOf(0.01),
  supplier: z.string().max(200).optional(),
  profit_margin: z.number().min(0).max(100).multipleOf(0.01).optional(),
  image_url: z.string().url().optional(),
})

export const updateProductSchema = createProductSchema
  .partial()
  .extend({
    is_active: z.boolean().optional(),
  })

export const productFiltersSchema = z.object({
  categoryId: uuidSchema.optional(),
  isActive: z.boolean().optional(),
  search: z.string().min(1).max(100).optional(),
  hasLowStock: z.boolean().optional(),
  priceMin: priceSchema.optional(),
  priceMax: priceSchema.optional(),
})

export const productIdSchema = z.object({
  id: uuidSchema,
})

export const adjustStockSchema = z.object({
  productId: uuidSchema,
  newStock: nonNegativeNumberSchema.multipleOf(0.01),
  reason: z.enum(['purchase', 'waste', 'correction', 'other']),
  notes: z.string().max(500).optional(),
})

export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
export type ProductFilters = z.infer<typeof productFiltersSchema>
export type AdjustStockInput = z.infer<typeof adjustStockSchema>