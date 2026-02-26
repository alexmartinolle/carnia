import { initTRPC, TRPCError } from '@trpc/server'
import superjson from 'superjson'
import { ZodError } from 'zod'
import type { Context } from './context'

/**
 * Inicialización de tRPC con el contexto
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

/**
 * Exportar utilidades de tRPC
 */
export const createTRPCRouter = t.router
export const publicProcedure = t.procedure

/**
 * Middleware para verificar autenticación (opcional por ahora)
 */
const isAuthenticated = t.middleware(({ ctx, next }) => {
  // Por ahora permitimos todo
  // Aquí se puede añadir lógica de autenticación cuando se implemente
  return next({
    ctx: {
      ...ctx,
    },
  })
})

/**
 * Procedimiento protegido (para futuras implementaciones con auth)
 */
export const protectedProcedure = t.procedure.use(isAuthenticated)