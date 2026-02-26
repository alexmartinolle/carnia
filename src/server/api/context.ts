import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'
import { getServerClient } from '../config/supabase'
import { CategoryRepository } from '../repositories/CategoryRepository'
import { ProductRepository } from '../repositories/ProductRepository'
import { CustomerRepository } from '../repositories/CustomerRepository'
import { OrderRepository } from '../repositories/OrderRepository'
import { SaleRepository } from '../repositories/SaleRepository'
import { InventoryRepository } from '../repositories/InventoryRepository'
import { CategoryService } from '../services/CategoryService'
import { ProductService } from '../services/ProductService'
import { CustomerService } from '../services/CustomerService'
import { OrderService } from '../services/OrderService'
import { SaleService } from '../services/SaleService'
import { InventoryService } from '../services/InventoryService'
import { AnalyticsService } from '../services/AnalyticsService'

/**
 * Crea el contexto para tRPC
 * Se ejecuta en cada request
 */
export async function createContext(opts: FetchCreateContextFnOptions) {
  // Obtener cliente de Supabase
  const db = getServerClient()

  // Inicializar repositories
  const categoryRepo = new CategoryRepository(db)
  const productRepo = new ProductRepository(db)
  const customerRepo = new CustomerRepository(db)
  const orderRepo = new OrderRepository(db)
  const saleRepo = new SaleRepository(db)
  const inventoryRepo = new InventoryRepository(db)

  // Inicializar services con sus dependencias
  const categoryService = new CategoryService(categoryRepo)
  const productService = new ProductService(productRepo, inventoryRepo)
  const customerService = new CustomerService(customerRepo, orderRepo)
  const orderService = new OrderService(orderRepo, customerRepo, productRepo)
  const saleService = new SaleService(saleRepo, productRepo, customerRepo)
  const inventoryService = new InventoryService(inventoryRepo, productRepo)
  const analyticsService = new AnalyticsService(
    saleRepo,
    orderRepo,
    productRepo,
    inventoryRepo
  )

  return {
    db,
    services: {
      category: categoryService,
      product: productService,
      customer: customerService,
      order: orderService,
      sale: saleService,
      inventory: inventoryService,
      analytics: analyticsService,
    },
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>