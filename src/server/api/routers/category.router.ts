import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../trpc'
import {
  createCategorySchema,
  updateCategorySchema,
  categoryIdSchema,
} from '../../validators'

export const categoryRouter = createTRPCRouter({
  /**
   * Obtener todas las categorías
   */
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.services.category.getAll()
  }),

  /**
   * Obtener todas con conteo de productos
   */
  getAllWithProductCount: publicProcedure.query(async ({ ctx }) => {
    return ctx.services.category.getAllWithProductCount()
  }),

  /**
   * Obtener categoría por ID
   */
  getById: publicProcedure
    .input(categoryIdSchema)
    .query(async ({ ctx, input }) => {
      return ctx.services.category.getById(input.id)
    }),

  /**
   * Obtener categoría por slug
   */
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.services.category.getBySlug(input.slug)
    }),

  /**
   * Crear categoría
   */
  create: publicProcedure
    .input(createCategorySchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.services.category.create(input)
    }),

  /**
   * Actualizar categoría
   */
  update: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: updateCategorySchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.services.category.update(input.id, input.data)
    }),

  /**
   * Eliminar categoría
   */
  delete: publicProcedure
    .input(categoryIdSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.services.category.delete(input.id)
    }),

  /**
   * Obtener conteo de productos
   */
  getProductCount: publicProcedure
    .input(categoryIdSchema)
    .query(async ({ ctx, input }) => {
      return ctx.services.category.getProductCount(input.id)
    }),
})