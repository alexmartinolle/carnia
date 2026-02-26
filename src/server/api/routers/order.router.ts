import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../trpc'
import {
  createOrderSchema,
  updateOrderStatusSchema,
  cancelOrderSchema,
  orderFiltersSchema,
  orderIdSchema,
} from '../../validators'

export const orderRouter = createTRPCRouter({
  /**
   * Obtener todos los pedidos
   */
  getAll: publicProcedure
    .input(orderFiltersSchema.optional())
    .query(async ({ ctx, input }) => {
      return ctx.services.order.getAll(input)
    }),

  /**
   * Obtener pedido por ID
   */
  getById: publicProcedure
    .input(orderIdSchema)
    .query(async ({ ctx, input }) => {
      return ctx.services.order.getById(input.id)
    }),

  /**
   * Obtener pedidos pendientes
   */
  getPending: publicProcedure.query(async ({ ctx }) => {
    return ctx.services.order.getPending()
  }),

  /**
   * Obtener pedidos urgentes
   */
  getUrgent: publicProcedure.query(async ({ ctx }) => {
    return ctx.services.order.getUrgent()
  }),

  /**
   * Obtener pedidos del día
   */
  getTodayOrders: publicProcedure.query(async ({ ctx }) => {
    return ctx.services.order.getTodayOrders()
  }),

  /**
   * Obtener pedidos de un cliente
   */
  getCustomerOrders: publicProcedure
    .input(
      z.object({
        customerId: z.string().uuid(),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.services.order.getCustomerOrders(
        input.customerId,
        input.limit
      )
    }),

  /**
   * Crear pedido
   */
  create: publicProcedure
    .input(createOrderSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.services.order.createOrder({
        customer_id: input.customer_id,
        channel: input.channel,
        pickup_datetime: input.pickup_datetime,
        notes: input.notes,
        items: input.items,
      })
    }),

  /**
   * Actualizar estado del pedido
   */
  updateStatus: publicProcedure
    .input(updateOrderStatusSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.services.order.updateStatus(
        input.orderId,
        input.status,
        input.notes
      )
    }),

  /**
   * Cancelar pedido
   */
  cancel: publicProcedure
    .input(cancelOrderSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.services.order.cancelOrder(input.orderId, input.reason)
    }),
})