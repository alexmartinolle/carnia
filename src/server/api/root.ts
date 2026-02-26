import { createTRPCRouter } from './trpc'
import {
  categoryRouter,
  productRouter,
  customerRouter,
  orderRouter,
  saleRouter,
  inventoryRouter,
  analyticsRouter,
} from './routers'

/**
 * Root router - Combina todos los routers de la aplicación
 */
export const appRouter = createTRPCRouter({
  category: categoryRouter,
  product: productRouter,
  customer: customerRouter,
  order: orderRouter,
  sale: saleRouter,
  inventory: inventoryRouter,
  analytics: analyticsRouter,
})

/**
 * Exportar tipo del router para usar en el cliente
 */
export type AppRouter = typeof appRouter