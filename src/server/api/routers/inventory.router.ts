import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../trpc'
import {
  registerMovementSchema,
  inventoryFiltersSchema,
} from '../../validators'

export const inventoryRouter = createTRPCRouter({
  /**
   * Obtener movimientos de inventario
   */
  getMovements: publicProcedure
    .input(inventoryFiltersSchema.optional())
    .query(async ({ ctx, input }) => {
      return ctx.services.inventory.getMovements(input)
    }),

  /**
   * Obtener movimientos de un producto
   */
  getProductMovements: publicProcedure
    .input(
      z.object({
        productId: z.string().uuid(),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.services.inventory.getProductMovements(
        input.productId,
        input.limit
      )
    }),

  /**
   * Registrar movimiento manual
   */
  registerMovement: publicProcedure
    .input(registerMovementSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.services.inventory.registerManualMovement(
        input.product_id,
        input.type,
        input.quantity,
        input.reason,
        input.notes
      )
    }),

  /**
   * Obtener alertas de inventario
   */
  getAlerts: publicProcedure.query(async ({ ctx }) => {
    return ctx.services.inventory.getAlerts()
  }),

  /**
   * Obtener reporte de inventario
   */
  getReport: publicProcedure.query(async ({ ctx }) => {
    return ctx.services.inventory.getInventoryReport()
  }),

  /**
   * Obtener valor total del stock
   */
  getStockValue: publicProcedure.query(async ({ ctx }) => {
    return ctx.services.inventory.getStockValue()
  }),

  /**
   * Obtener historial de stock de un producto
   */
  getStockHistory: publicProcedure
    .input(
      z.object({
        productId: z.string().uuid(),
        days: z.number().min(1).max(365).default(30),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.services.inventory.getStockHistory(
        input.productId,
        input.days
      )
    }),
})