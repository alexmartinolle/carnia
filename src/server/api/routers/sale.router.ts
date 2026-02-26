import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../trpc'
import {
  createSaleSchema,
  saleFiltersSchema,
  saleIdSchema,
} from '../../validators'
import { dateRangeSchema } from '../../validators/common.validators'

export const saleRouter = createTRPCRouter({
  /**
   * Obtener todas las ventas
   */
  getAll: publicProcedure
    .input(saleFiltersSchema.optional())
    .query(async ({ ctx, input }) => {
      return ctx.services.sale.getAll(input)
    }),

  /**
   * Obtener venta por ID
   */
  getById: publicProcedure.input(saleIdSchema).query(async ({ ctx, input }) => {
    return ctx.services.sale.getById(input.id)
  }),

  /**
   * Obtener ventas del día
   */
  getTodaySales: publicProcedure.query(async ({ ctx }) => {
    return ctx.services.sale.getTodaySales()
  }),

  /**
   * Obtener resumen del día
   */
  getDailySummary: publicProcedure
    .input(z.object({ date: z.coerce.date().optional() }))
    .query(async ({ ctx, input }) => {
      return ctx.services.sale.getDailySummary(input.date)
    }),

  /**
   * Obtener ventas por rango de fechas
   */
  getByDateRange: publicProcedure
    .input(dateRangeSchema)
    .query(async ({ ctx, input }) => {
      return ctx.services.sale.getSalesByDateRange(input.from, input.to)
    }),

  /**
   * Obtener total de revenue
   */
  getTotalRevenue: publicProcedure
    .input(dateRangeSchema)
    .query(async ({ ctx, input }) => {
      return ctx.services.sale.getTotalRevenue(input.from, input.to)
    }),

  /**
   * Obtener ventas de un cliente
   */
  getCustomerSales: publicProcedure
    .input(z.object({ customerId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.services.sale.getCustomerSales(input.customerId)
    }),

  /**
   * Registrar venta
   */
  create: publicProcedure
    .input(createSaleSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.services.sale.recordSale({
        items: input.items,
        payment_method: input.payment_method,
        customer_id: input.customer_id,
        notes: input.notes,
      })
    }),
})