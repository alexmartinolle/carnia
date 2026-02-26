import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../trpc'
import { dateRangeSchema } from '../../validators/common.validators'

export const analyticsRouter = createTRPCRouter({
  /**
   * Obtener estadísticas del dashboard
   */
  getDashboardStats: publicProcedure.query(async ({ ctx }) => {
    return ctx.services.analytics.getDashboardStats()
  }),

  /**
   * Obtener métricas de ventas
   */
  getSalesMetrics: publicProcedure
    .input(dateRangeSchema)
    .query(async ({ ctx, input }) => {
      return ctx.services.analytics.getSalesMetrics({
        from: input.from,
        to: input.to,
      })
    }),

  /**
   * Obtener comparativa de períodos
   */
  getComparison: publicProcedure
    .input(
      z.object({
        current: dateRangeSchema,
        previous: dateRangeSchema,
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.services.analytics.getComparison(
        input.current,
        input.previous
      )
    }),
})