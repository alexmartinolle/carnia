import { z } from 'zod'

/**
 * Validadores comunes reutilizables
 */

export const uuidSchema = z.string().uuid('ID inválido')

export const dateSchema = z.coerce.date()

export const positiveNumberSchema = z.number().positive('Debe ser mayor a 0')

export const nonNegativeNumberSchema = z.number().nonnegative('No puede ser negativo')

export const decimalSchema = z
  .number()
  .multipleOf(0.01, 'Máximo 2 decimales permitidos')

export const priceSchema = positiveNumberSchema
  .multipleOf(0.01)
  .max(999999.99, 'Precio demasiado alto')

export const quantitySchema = positiveNumberSchema
  .multipleOf(0.01)
  .max(999999.99, 'Cantidad demasiado alta')

export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Formato de teléfono inválido (+34...)')

export const emailSchema = z.string().email('Email inválido')

export const slugSchema = z
  .string()
  .min(2)
  .max(100)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug inválido (ej: carne-roja)')

export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(10).max(100).default(20),
})

export const dateRangeSchema = z.object({
  from: dateSchema,
  to: dateSchema,
})