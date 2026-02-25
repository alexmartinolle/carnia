import { z } from 'zod'
import { slugSchema } from './common.validators'

export const createCategorySchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  slug: slugSchema,
})

export const updateCategorySchema = createCategorySchema.partial()

export const categoryIdSchema = z.object({
  id: z.string().uuid(),
})

export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>