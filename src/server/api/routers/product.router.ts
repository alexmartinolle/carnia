import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../trpc'
import {
  createProductSchema,
  updateProductSchema,
  productFiltersSchema,
  productIdSchema,
  adjustStockSchema,
} from '../../validators'

export const productRouter = createTRPCRouter({
  /**
   * Obtener todos los productos
   */
  getAll: publicProcedure
    .input(productFiltersSchema.optional())
    .query(async ({ ctx, input }) => {
      return ctx.services.product.getAll(input)
    }),

  /**
   * Obtener producto por ID
   */
  getById: publicProcedure
    .input(productIdSchema)
    .query(async ({ ctx, input }) => {
      return ctx.services.product.getById(input.id)
    }),

  /**
   * Obtener productos con stock bajo
   */
  getLowStock: publicProcedure.query(async ({ ctx }) => {
    return ctx.services.product.getLowStock()
  }),

  /**
   * Buscar productos
   */
  search: publicProcedure
    .input(
      z.object({
        query: z.string().min(1),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.services.product.search(input.query, input.limit)
    }),

  /**
   * Crear producto
   */
  create: publicProcedure
    .input(createProductSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.services.product.create(input)
    }),

  /**
   * Actualizar producto
   */
  update: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: updateProductSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.services.product.update(input.id, input.data)
    }),

  /**
   * Eliminar producto
   */
  delete: publicProcedure
    .input(productIdSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.services.product.delete(input.id)
    }),

  /**
   * Ajustar stock manualmente
   */
  adjustStock: publicProcedure
    .input(adjustStockSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.services.product.adjustStock(
        input.productId,
        input.newStock,
        input.reason,
        input.notes
      )
    }),

  /**
   * Obtener estadísticas de producto
   */
  getStats: publicProcedure
    .input(productIdSchema)
    .query(async ({ ctx, input }) => {
      return ctx.services.product.getProductStats(input.id)
    }),
})