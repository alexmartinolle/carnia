import { z } from 'zod'
import { uuidSchema, phoneSchema, emailSchema } from './common.validators'

export const createCustomerSchema = z.object({
  name: z.string().min(2).max(200),
  phone: phoneSchema,
  email: emailSchema.optional(),
})

export const updateCustomerSchema = createCustomerSchema.partial()

export const customerFiltersSchema = z.object({
  segment: z.enum(['vip', 'regular', 'new', 'inactive']).optional(),
  search: z.string().min(1).max(100).optional(),
  hasOrders: z.boolean().optional(),
  inactiveSince: z.coerce.date().optional(),
})

export const customerIdSchema = z.object({
  id: uuidSchema,
})

export const customerByPhoneSchema = z.object({
  phone: phoneSchema,
})

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>
export type CustomerFilters = z.infer<typeof customerFiltersSchema>