import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../trpc'
import {
  createCustomerSchema,
  updateCustomerSchema,
  customerFiltersSchema,
  customerIdSchema,
  customerByPhoneSchema,
} from '../../validators'

export const customerRouter = createTRPCRouter({
  /**
   * Obtener todos los clientes
   */
  getAll: publicProcedure
    .input(customerFiltersSchema.optional())
    .query(async ({ ctx, input }) => {
      return ctx.services.customer.getAll(input)
    }),

  /**
   * Obtener cliente por ID
   */
  getById: publicProcedure
    .input(customerIdSchema)
    .query(async ({ ctx, input }) => {
      return ctx.services.customer.getById(input.id)
    }),

  /**
   * Obtener cliente por teléfono
   */
  getByPhone: publicProcedure
    .input(customerByPhoneSchema)
    .query(async ({ ctx, input }) => {
      return ctx.services.customer.getByPhone(input.phone)
    }),

  /**
   * Crear o obtener cliente por teléfono
   */
  createOrGetByPhone: publicProcedure
    .input(
      z.object({
        phone: z.string(),
        name: z.string().optional(),
        email: z.string().email().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.services.customer.createOrGetByPhone(
        input.phone,
        input.name,
        input.email
      )
    }),

  /**
   * Crear cliente
   */
  create: publicProcedure
    .input(createCustomerSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.services.customer.create(input)
    }),

  /**
   * Actualizar cliente
   */
  update: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: updateCustomerSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.services.customer.update(input.id, input.data)
    }),

  /**
   * Obtener mejores clientes
   */
  getTopCustomers: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(10) }))
    .query(async ({ ctx, input }) => {
      return ctx.services.customer.getTopCustomers(input.limit)
    }),

  /**
   * Obtener clientes inactivos
   */
  getInactive: publicProcedure
    .input(z.object({ daysSince: z.number().min(1).default(90) }))
    .query(async ({ ctx, input }) => {
      return ctx.services.customer.getInactiveCustomers(input.daysSince)
    }),

  /**
   * Obtener métricas de cliente
   */
  getMetrics: publicProcedure
    .input(customerIdSchema)
    .query(async ({ ctx, input }) => {
      return ctx.services.customer.getCustomerMetrics(input.id)
    }),

  /**
   * Buscar clientes
   */
  search: publicProcedure
    .input(
      z.object({
        query: z.string().min(1),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.services.customer.search(input.query, input.limit)
    }),
})